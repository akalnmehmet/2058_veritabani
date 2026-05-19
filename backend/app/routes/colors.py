from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from app.db.database import get_db
from app.models.catalog import Color
from app.core.deps import get_current_user, require_admin
import uuid

router = APIRouter(prefix="/colors", tags=["colors"])


class ColorCreate(BaseModel):
    name: str
    type: Optional[str] = None
    unit_cost: Optional[float] = 0
    is_default: Optional[bool] = False


class ColorUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    unit_cost: Optional[float] = None
    is_default: Optional[bool] = None


class ColorOut(BaseModel):
    id: str
    name: str
    type: Optional[str] = None
    unit_cost: Optional[float] = None
    is_default: Optional[bool] = None

    model_config = {"from_attributes": True}


@router.get("/")
def list_colors(
    page: int = Query(1, ge=1),
    limit: int = Query(100, ge=1, le=500),
    q: Optional[str] = None,
    type: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    query = db.query(Color)
    if q:
        query = query.filter(Color.name.ilike(f"%{q}%"))
    if type:
        query = query.filter(Color.type == type)
    total = query.count()
    items = query.offset((page - 1) * limit).limit(limit).all()
    return {"items": [ColorOut.model_validate(c) for c in items], "total": total, "page": page, "limit": limit}


@router.post("/", response_model=ColorOut, status_code=201)
def create_color(body: ColorCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    color = Color(id=str(uuid.uuid4()), **body.model_dump())
    db.add(color)
    db.commit()
    db.refresh(color)
    return color


@router.get("/{color_id}", response_model=ColorOut)
def get_color(color_id: str, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    color = db.query(Color).filter(Color.id == color_id).first()
    if not color:
        raise HTTPException(404, "Renk bulunamadı")
    return color


@router.put("/{color_id}", response_model=ColorOut)
def update_color(color_id: str, body: ColorUpdate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    color = db.query(Color).filter(Color.id == color_id).first()
    if not color:
        raise HTTPException(404, "Renk bulunamadı")
    for k, v in body.model_dump(exclude_unset=True).items():
        setattr(color, k, v)
    db.commit()
    db.refresh(color)
    return color


@router.delete("/{color_id}", status_code=204)
def delete_color(color_id: str, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    color = db.query(Color).filter(Color.id == color_id).first()
    if not color:
        raise HTTPException(404, "Renk bulunamadı")
    db.delete(color)
    db.commit()
