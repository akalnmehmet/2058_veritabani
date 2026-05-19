from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from app.db.database import get_db
from app.models.catalog import Profile
from app.core.deps import get_current_user
import uuid

router = APIRouter(prefix="/profiles", tags=["profiles"])


class ProfileCreate(BaseModel):
    profil_kodu: Optional[str] = None
    profil_isim: str
    unit_price: Optional[float] = 0
    color_id: Optional[str] = None


class ProfileUpdate(BaseModel):
    profil_kodu: Optional[str] = None
    profil_isim: Optional[str] = None
    unit_price: Optional[float] = None
    color_id: Optional[str] = None


class ProfileOut(BaseModel):
    id: str
    profil_kodu: Optional[str] = None
    profil_isim: str
    unit_price: Optional[float] = None
    color_id: Optional[str] = None

    model_config = {"from_attributes": True}


@router.get("/")
def list_profiles(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=200),
    q: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    query = db.query(Profile)
    if q:
        query = query.filter(
            Profile.profil_isim.ilike(f"%{q}%") | Profile.profil_kodu.ilike(f"%{q}%")
        )
    total = query.count()
    items = query.offset((page - 1) * limit).limit(limit).all()
    return {"items": [ProfileOut.model_validate(p) for p in items], "total": total, "page": page, "limit": limit}


@router.post("/", response_model=ProfileOut, status_code=201)
def create_profile(body: ProfileCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    profile = Profile(id=str(uuid.uuid4()), **body.model_dump())
    db.add(profile)
    db.commit()
    db.refresh(profile)
    return profile


@router.get("/{profile_id}", response_model=ProfileOut)
def get_profile(profile_id: str, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    p = db.query(Profile).filter(Profile.id == profile_id).first()
    if not p:
        raise HTTPException(404, "Profil bulunamadı")
    return p


@router.put("/{profile_id}", response_model=ProfileOut)
def update_profile(profile_id: str, body: ProfileUpdate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    p = db.query(Profile).filter(Profile.id == profile_id).first()
    if not p:
        raise HTTPException(404, "Profil bulunamadı")
    for k, v in body.model_dump(exclude_unset=True).items():
        setattr(p, k, v)
    db.commit()
    db.refresh(p)
    return p


@router.delete("/{profile_id}", status_code=204)
def delete_profile(profile_id: str, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    p = db.query(Profile).filter(Profile.id == profile_id).first()
    if not p:
        raise HTTPException(404, "Profil bulunamadı")
    db.delete(p)
    db.commit()
