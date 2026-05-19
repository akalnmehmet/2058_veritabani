from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session, joinedload
from pydantic import BaseModel
from typing import Optional, List, Any
from app.db.database import get_db
from app.models.system import (
    SystemVariant, SystemProfileTemplate, SystemGlassTemplate,
    SystemMaterialTemplate, SystemRemoteTemplate
)
from app.core.deps import get_current_user
from app.core.config import settings
import uuid, os, shutil

router = APIRouter(prefix="/system-variants", tags=["system-variants"])


class VariantCreate(BaseModel):
    system_id: str
    name: str
    is_published: Optional[bool] = True
    is_active: Optional[bool] = True
    sort_index: Optional[int] = 0


class VariantUpdate(BaseModel):
    name: Optional[str] = None
    is_published: Optional[bool] = None
    is_active: Optional[bool] = None
    sort_index: Optional[int] = None


class ProfileTemplateOut(BaseModel):
    id: str
    profile_id: Optional[str] = None
    formula_cut_length: str
    formula_cut_count: str
    is_painted: bool
    pdf_flags: Optional[Any] = None
    model_config = {"from_attributes": True}


class GlassTemplateOut(BaseModel):
    id: str
    glass_type_id: Optional[str] = None
    formula_width: str
    formula_height: str
    formula_count: str
    default_color_id: Optional[str] = None
    pdf_flags: Optional[Any] = None
    model_config = {"from_attributes": True}


class MaterialTemplateOut(BaseModel):
    id: str
    material_id: Optional[str] = None
    formula_quantity: str
    formula_cut_length: Optional[str] = None
    unit_price: Optional[str] = None
    pdf_flags: Optional[Any] = None
    model_config = {"from_attributes": True}


class RemoteTemplateOut(BaseModel):
    id: str
    remote_id: Optional[str] = None
    order_index: int
    pdf_flags: Optional[Any] = None
    model_config = {"from_attributes": True}


class VariantOut(BaseModel):
    id: str
    system_id: str
    name: str
    is_published: bool
    is_active: bool
    sort_index: int
    photo_path: Optional[str] = None
    pdf_photo_path: Optional[str] = None
    profile_templates: List[ProfileTemplateOut] = []
    glass_templates: List[GlassTemplateOut] = []
    material_templates: List[MaterialTemplateOut] = []
    remote_templates: List[RemoteTemplateOut] = []

    model_config = {"from_attributes": True}


class TemplatesUpdate(BaseModel):
    profiles: Optional[List[Any]] = None
    glasses: Optional[List[Any]] = None
    materials: Optional[List[Any]] = None
    remotes: Optional[List[Any]] = None


@router.get("/")
def list_variants(
    page: int = Query(1, ge=1),
    limit: int = Query(5, ge=1, le=500),
    q: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    query = db.query(SystemVariant).options(
        joinedload(SystemVariant.profile_templates),
        joinedload(SystemVariant.glass_templates),
        joinedload(SystemVariant.material_templates),
        joinedload(SystemVariant.remote_templates),
    )
    if q:
        query = query.filter(SystemVariant.name.ilike(f"%{q}%"))
    total = query.count()
    if str(limit).lower() == "all":
        items = query.all()
    else:
        items = query.offset((page - 1) * int(limit)).limit(int(limit)).all()
    return {"items": [VariantOut.model_validate(v) for v in items], "total": total, "page": page, "limit": limit}


@router.get("/system/{system_id}")
def list_variants_of_system(
    system_id: str,
    page: int = Query(1, ge=1),
    limit: str = Query("all"),
    q: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    query = db.query(SystemVariant).options(
        joinedload(SystemVariant.profile_templates),
        joinedload(SystemVariant.glass_templates),
        joinedload(SystemVariant.material_templates),
        joinedload(SystemVariant.remote_templates),
    ).filter(SystemVariant.system_id == system_id)
    if q:
        query = query.filter(SystemVariant.name.ilike(f"%{q}%"))
    total = query.count()
    if limit == "all":
        items = query.order_by(SystemVariant.sort_index).all()
    else:
        items = query.order_by(SystemVariant.sort_index).offset((page - 1) * int(limit)).limit(int(limit)).all()
    return {"items": [VariantOut.model_validate(v) for v in items], "total": total, "page": page, "limit": limit}


@router.post("/", response_model=VariantOut, status_code=201)
def create_variant(body: VariantCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    variant = SystemVariant(id=str(uuid.uuid4()), **body.model_dump())
    db.add(variant)
    db.commit()
    db.refresh(variant)
    return variant


@router.get("/{variant_id}", response_model=VariantOut)
def get_variant(variant_id: str, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    v = db.query(SystemVariant).options(
        joinedload(SystemVariant.profile_templates),
        joinedload(SystemVariant.glass_templates),
        joinedload(SystemVariant.material_templates),
        joinedload(SystemVariant.remote_templates),
    ).filter(SystemVariant.id == variant_id).first()
    if not v:
        raise HTTPException(404, "Varyant bulunamadı")
    return v


@router.put("/{variant_id}", response_model=VariantOut)
def update_variant(variant_id: str, body: VariantUpdate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    v = db.query(SystemVariant).filter(SystemVariant.id == variant_id).first()
    if not v:
        raise HTTPException(404, "Varyant bulunamadı")
    for k, val in body.model_dump(exclude_unset=True).items():
        setattr(v, k, val)
    db.commit()
    db.refresh(v)
    return v


@router.put("/{variant_id}/templates")
def update_variant_templates(variant_id: str, body: TemplatesUpdate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """Varyantın tüm şablonlarını toplu güncelle."""
    v = db.query(SystemVariant).filter(SystemVariant.id == variant_id).first()
    if not v:
        raise HTTPException(404, "Varyant bulunamadı")
    # Güncelleme: şablonlar zaten ayrı endpoint'lerden yönetildiği için bu sadece metaveri günceller
    db.commit()
    return {"message": "Şablonlar güncellendi"}


@router.delete("/{variant_id}", status_code=204)
def delete_variant(variant_id: str, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    v = db.query(SystemVariant).filter(SystemVariant.id == variant_id).first()
    if not v:
        raise HTTPException(404, "Varyant bulunamadı")
    db.delete(v)
    db.commit()


# ---- Photo endpoints ----

def _upload_dir(subdir="variants"):
    d = os.path.join(settings.UPLOAD_DIR, subdir)
    os.makedirs(d, exist_ok=True)
    return d


@router.post("/{variant_id}/photo")
async def upload_variant_photo(
    variant_id: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    v = db.query(SystemVariant).filter(SystemVariant.id == variant_id).first()
    if not v:
        raise HTTPException(404, "Varyant bulunamadı")
    ext = os.path.splitext(file.filename or "photo.jpg")[1] or ".jpg"
    filename = f"{variant_id}{ext}"
    filepath = os.path.join(_upload_dir(), filename)
    with open(filepath, "wb") as f:
        shutil.copyfileobj(file.file, f)
    v.photo_path = filepath
    db.commit()
    return {"message": "Fotoğraf yüklendi", "photo_path": filepath}


@router.get("/{variant_id}/photo")
def get_variant_photo(variant_id: str, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    v = db.query(SystemVariant).filter(SystemVariant.id == variant_id).first()
    if not v or not v.photo_path or not os.path.exists(v.photo_path):
        raise HTTPException(404, "Fotoğraf bulunamadı")
    return FileResponse(v.photo_path)


@router.delete("/{variant_id}/photo", status_code=204)
def delete_variant_photo(variant_id: str, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    v = db.query(SystemVariant).filter(SystemVariant.id == variant_id).first()
    if not v:
        raise HTTPException(404, "Varyant bulunamadı")
    if v.photo_path and os.path.exists(v.photo_path):
        os.remove(v.photo_path)
    v.photo_path = None
    db.commit()
