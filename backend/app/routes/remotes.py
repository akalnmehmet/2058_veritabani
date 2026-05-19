from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from app.db.database import get_db
from app.models.catalog import Remote
from app.core.deps import get_current_user
import uuid

router = APIRouter(prefix="/remotes", tags=["remotes"])


class RemoteCreate(BaseModel):
    kumanda_isim: str
    price: Optional[float] = 0
    kapasite: Optional[str] = None


class RemoteUpdate(BaseModel):
    kumanda_isim: Optional[str] = None
    price: Optional[float] = None
    kapasite: Optional[str] = None


class RemoteOut(BaseModel):
    id: str
    kumanda_isim: str
    price: Optional[float] = None
    kapasite: Optional[str] = None

    model_config = {"from_attributes": True}


@router.get("/")
def list_remotes(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=200),
    q: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    query = db.query(Remote)
    if q:
        query = query.filter(Remote.kumanda_isim.ilike(f"%{q}%"))
    total = query.count()
    items = query.offset((page - 1) * limit).limit(limit).all()
    return {"items": [RemoteOut.model_validate(r) for r in items], "total": total, "page": page, "limit": limit}


@router.post("/", response_model=RemoteOut, status_code=201)
def create_remote(body: RemoteCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    remote = Remote(id=str(uuid.uuid4()), **body.model_dump())
    db.add(remote)
    db.commit()
    db.refresh(remote)
    return remote


@router.get("/{remote_id}", response_model=RemoteOut)
def get_remote(remote_id: str, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    r = db.query(Remote).filter(Remote.id == remote_id).first()
    if not r:
        raise HTTPException(404, "Kumanda bulunamadı")
    return r


@router.put("/{remote_id}", response_model=RemoteOut)
def update_remote(remote_id: str, body: RemoteUpdate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    r = db.query(Remote).filter(Remote.id == remote_id).first()
    if not r:
        raise HTTPException(404, "Kumanda bulunamadı")
    for k, v in body.model_dump(exclude_unset=True).items():
        setattr(r, k, v)
    db.commit()
    db.refresh(r)
    return r


@router.delete("/{remote_id}", status_code=204)
def delete_remote(remote_id: str, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    r = db.query(Remote).filter(Remote.id == remote_id).first()
    if not r:
        raise HTTPException(404, "Kumanda bulunamadı")
    db.delete(r)
    db.commit()
