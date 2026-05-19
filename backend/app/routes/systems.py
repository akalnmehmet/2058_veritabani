from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session, joinedload
from pydantic import BaseModel
from typing import Optional, List
from app.db.database import get_db
from app.models.system import System, SystemVariant
from app.core.deps import get_current_user
from app.core.config import settings
import uuid, os, shutil

router = APIRouter(prefix="/systems", tags=["systems"])


class SystemCreate(BaseModel):
    name: str
    is_published: Optional[bool] = True
    is_active: Optional[bool] = True
    sort_index: Optional[int] = 0


class SystemUpdate(BaseModel):
    name: Optional[str] = None
    is_published: Optional[bool] = None
    is_active: Optional[bool] = None
    sort_index: Optional[int] = None


class SystemOut(BaseModel):
    id: str
    name: str
    is_published: bool
    is_active: bool
    sort_index: int
    photo_path: Optional[str] = None

    model_config = {"from_attributes": True}


@router.get("/")
def list_systems(
    page: int = Query(1, ge=1),
    limit: int = Query(5, ge=1, le=200),
    q: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    query = db.query(System)
    if q:
        query = query.filter(System.name.ilike(f"%{q}%"))
    total = query.count()
    items = query.order_by(System.sort_index).offset((page - 1) * limit).limit(limit).all()
    return {"items": [SystemOut.model_validate(s) for s in items], "total": total, "page": page, "limit": limit}


@router.post("/", response_model=SystemOut, status_code=201)
def create_system(body: SystemCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    system = System(id=str(uuid.uuid4()), **body.model_dump())
    db.add(system)
    db.commit()
    db.refresh(system)
    return system


@router.get("/{system_id}", response_model=SystemOut)
def get_system(system_id: str, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    s = db.query(System).filter(System.id == system_id).first()
    if not s:
        raise HTTPException(404, "Sistem bulunamadı")
    return s


@router.put("/{system_id}", response_model=SystemOut)
def update_system(system_id: str, body: SystemUpdate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    s = db.query(System).filter(System.id == system_id).first()
    if not s:
        raise HTTPException(404, "Sistem bulunamadı")
    for k, v in body.model_dump(exclude_unset=True).items():
        setattr(s, k, v)
    db.commit()
    db.refresh(s)
    return s


@router.delete("/{system_id}", status_code=204)
def delete_system(system_id: str, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    s = db.query(System).filter(System.id == system_id).first()
    if not s:
        raise HTTPException(404, "Sistem bulunamadı")
    db.delete(s)
    db.commit()


# ---- Photo endpoints ----

def _upload_dir():
    d = os.path.join(settings.UPLOAD_DIR, "systems")
    os.makedirs(d, exist_ok=True)
    return d


@router.post("/{system_id}/photo")
async def upload_system_photo(
    system_id: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    s = db.query(System).filter(System.id == system_id).first()
    if not s:
        raise HTTPException(404, "Sistem bulunamadı")

    ext = os.path.splitext(file.filename or "photo.jpg")[1] or ".jpg"
    filename = f"{system_id}{ext}"
    filepath = os.path.join(_upload_dir(), filename)

    with open(filepath, "wb") as f:
        shutil.copyfileobj(file.file, f)

    s.photo_path = filepath
    db.commit()
    return {"message": "Fotoğraf yüklendi", "photo_path": filepath}


@router.get("/{system_id}/photo")
def get_system_photo(system_id: str, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    s = db.query(System).filter(System.id == system_id).first()
    if not s or not s.photo_path or not os.path.exists(s.photo_path):
        raise HTTPException(404, "Fotoğraf bulunamadı")
    return FileResponse(s.photo_path)


@router.delete("/{system_id}/photo", status_code=204)
def delete_system_photo(system_id: str, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    s = db.query(System).filter(System.id == system_id).first()
    if not s:
        raise HTTPException(404, "Sistem bulunamadı")
    if s.photo_path and os.path.exists(s.photo_path):
        os.remove(s.photo_path)
    s.photo_path = None
    db.commit()
