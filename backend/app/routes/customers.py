from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from app.db.database import get_db
from app.models.customer import Customer
from app.core.deps import get_current_user
from app.models.user import AppUser
import uuid

router = APIRouter(prefix="/customers", tags=["customers"])


class CustomerCreate(BaseModel):
    company_name: Optional[str] = None
    name: str
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None


class CustomerUpdate(BaseModel):
    company_name: Optional[str] = None
    name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None


class CustomerOut(BaseModel):
    id: str
    user_id: str
    company_name: Optional[str] = None
    name: str
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None

    model_config = {"from_attributes": True}


@router.get("/")
def list_customers(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=200),
    q: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: AppUser = Depends(get_current_user),
):
    query = db.query(Customer)
    # admin tümünü görebilir, dealer sadece kendi müşterilerini
    if current_user.role != "admin":
        query = query.filter(Customer.user_id == current_user.id)
    if q:
        query = query.filter(
            Customer.name.ilike(f"%{q}%") | Customer.company_name.ilike(f"%{q}%")
        )
    total = query.count()
    items = query.offset((page - 1) * limit).limit(limit).all()
    return {"items": [CustomerOut.model_validate(c) for c in items], "total": total, "page": page, "limit": limit}


@router.post("/", response_model=CustomerOut, status_code=201)
def create_customer(body: CustomerCreate, db: Session = Depends(get_db), current_user: AppUser = Depends(get_current_user)):
    customer = Customer(id=str(uuid.uuid4()), user_id=current_user.id, **body.model_dump())
    db.add(customer)
    db.commit()
    db.refresh(customer)
    return customer


@router.get("/{customer_id}", response_model=CustomerOut)
def get_customer(customer_id: str, db: Session = Depends(get_db), current_user: AppUser = Depends(get_current_user)):
    c = db.query(Customer).filter(Customer.id == customer_id).first()
    if not c:
        raise HTTPException(404, "Müşteri bulunamadı")
    if current_user.role != "admin" and c.user_id != current_user.id:
        raise HTTPException(403, "Erişim izniniz yok")
    return c


@router.put("/{customer_id}", response_model=CustomerOut)
def update_customer(customer_id: str, body: CustomerUpdate, db: Session = Depends(get_db), current_user: AppUser = Depends(get_current_user)):
    c = db.query(Customer).filter(Customer.id == customer_id).first()
    if not c:
        raise HTTPException(404, "Müşteri bulunamadı")
    if current_user.role != "admin" and c.user_id != current_user.id:
        raise HTTPException(403, "Erişim izniniz yok")
    for k, v in body.model_dump(exclude_unset=True).items():
        setattr(c, k, v)
    db.commit()
    db.refresh(c)
    return c


@router.delete("/{customer_id}", status_code=204)
def delete_customer(customer_id: str, db: Session = Depends(get_db), current_user: AppUser = Depends(get_current_user)):
    c = db.query(Customer).filter(Customer.id == customer_id).first()
    if not c:
        raise HTTPException(404, "Müşteri bulunamadı")
    if current_user.role != "admin" and c.user_id != current_user.id:
        raise HTTPException(403, "Erişim izniniz yok")
    db.delete(c)
    db.commit()
