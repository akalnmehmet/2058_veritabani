from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from app.db.database import get_db
from app.models.catalog import GlassType
from app.core.deps import get_current_user
import uuid

router = APIRouter(prefix="/glasses", tags=["glasses"])


class GlassCreate(BaseModel):
    cam_isim: str
    thickness_mm: Optional[float] = None
    belirtec_1: Optional[str] = None
    belirtec_2: Optional[str] = None


class GlassUpdate(BaseModel):
    cam_isim: Optional[str] = None
    thickness_mm: Optional[float] = None
    belirtec_1: Optional[str] = None
    belirtec_2: Optional[str] = None


class GlassOut(BaseModel):
    id: str
    cam_isim: str
    thickness_mm: Optional[float] = None
    belirtec_1: Optional[str] = None
    belirtec_2: Optional[str] = None

    model_config = {"from_attributes": True}


@router.get("/")
def list_glasses(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=200),
    q: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    query = db.query(GlassType)
    if q:
        query = query.filter(GlassType.cam_isim.ilike(f"%{q}%"))
    total = query.count()
    items = query.offset((page - 1) * limit).limit(limit).all()
    return {"items": [GlassOut.model_validate(g) for g in items], "total": total, "page": page, "limit": limit}


@router.post("/", response_model=GlassOut, status_code=201)
def create_glass(body: GlassCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    glass = GlassType(id=str(uuid.uuid4()), **body.model_dump())
    db.add(glass)
    db.commit()
    db.refresh(glass)
    return glass


@router.get("/{glass_id}", response_model=GlassOut)
def get_glass(glass_id: str, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    g = db.query(GlassType).filter(GlassType.id == glass_id).first()
    if not g:
        raise HTTPException(404, "Cam bulunamadı")
    return g


@router.put("/{glass_id}", response_model=GlassOut)
def update_glass(glass_id: str, body: GlassUpdate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    g = db.query(GlassType).filter(GlassType.id == glass_id).first()
    if not g:
        raise HTTPException(404, "Cam bulunamadı")
    for k, v in body.model_dump(exclude_unset=True).items():
        setattr(g, k, v)
    db.commit()
    db.refresh(g)
    return g


@router.delete("/{glass_id}", status_code=204)
def delete_glass(glass_id: str, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    g = db.query(GlassType).filter(GlassType.id == glass_id).first()
    if not g:
        raise HTTPException(404, "Cam bulunamadı")
    db.delete(g)
    db.commit()
