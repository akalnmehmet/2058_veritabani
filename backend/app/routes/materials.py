from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from app.db.database import get_db
from app.models.catalog import OtherMaterial
from app.core.deps import get_current_user
import uuid

router = APIRouter(prefix="/materials", tags=["materials"])


class MaterialCreate(BaseModel):
    diger_malzeme_isim: str
    birim: Optional[str] = None
    unit_price: Optional[float] = 0


class MaterialUpdate(BaseModel):
    diger_malzeme_isim: Optional[str] = None
    birim: Optional[str] = None
    unit_price: Optional[float] = None


class MaterialOut(BaseModel):
    id: str
    diger_malzeme_isim: str
    birim: Optional[str] = None
    unit_price: Optional[float] = None

    model_config = {"from_attributes": True}


@router.get("/")
def list_materials(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=200),
    q: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    query = db.query(OtherMaterial)
    if q:
        query = query.filter(OtherMaterial.diger_malzeme_isim.ilike(f"%{q}%"))
    total = query.count()
    items = query.offset((page - 1) * limit).limit(limit).all()
    return {"items": [MaterialOut.model_validate(m) for m in items], "total": total, "page": page, "limit": limit}


@router.post("/", response_model=MaterialOut, status_code=201)
def create_material(body: MaterialCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    mat = OtherMaterial(id=str(uuid.uuid4()), **body.model_dump())
    db.add(mat)
    db.commit()
    db.refresh(mat)
    return mat


@router.get("/{material_id}", response_model=MaterialOut)
def get_material(material_id: str, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    m = db.query(OtherMaterial).filter(OtherMaterial.id == material_id).first()
    if not m:
        raise HTTPException(404, "Malzeme bulunamadı")
    return m


@router.put("/{material_id}", response_model=MaterialOut)
def update_material(material_id: str, body: MaterialUpdate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    m = db.query(OtherMaterial).filter(OtherMaterial.id == material_id).first()
    if not m:
        raise HTTPException(404, "Malzeme bulunamadı")
    for k, v in body.model_dump(exclude_unset=True).items():
        setattr(m, k, v)
    db.commit()
    db.refresh(m)
    return m


@router.delete("/{material_id}", status_code=204)
def delete_material(material_id: str, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    m = db.query(OtherMaterial).filter(OtherMaterial.id == material_id).first()
    if not m:
        raise HTTPException(404, "Malzeme bulunamadı")
    db.delete(m)
    db.commit()
