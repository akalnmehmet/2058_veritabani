from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from app.db.database import get_db
from app.models.order import SalesOrder, OrderItem
from app.models.user import AppUser
from app.core.deps import get_current_user
import uuid

router = APIRouter(prefix="/orders", tags=["orders"])


class OrderCreate(BaseModel):
    order_name: Optional[str] = None
    order_date: Optional[str] = None
    customer_id: Optional[str] = None
    project_id: Optional[str] = None


class OrderUpdate(BaseModel):
    order_name: Optional[str] = None
    order_date: Optional[str] = None
    status: Optional[str] = None
    customer_id: Optional[str] = None


class OrderOut(BaseModel):
    id: str
    order_no: Optional[str] = None
    order_name: Optional[str] = None
    order_date: Optional[str] = None
    status: str
    created_by: Optional[str] = None
    customer_id: Optional[str] = None
    project_id: Optional[str] = None

    model_config = {"from_attributes": True}


@router.get("/")
def list_orders(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user: AppUser = Depends(get_current_user),
):
    query = db.query(SalesOrder)
    if current_user.role != "admin":
        query = query.filter(SalesOrder.created_by == current_user.id)
    total = query.count()
    items = query.offset((page - 1) * limit).limit(limit).all()
    return {"items": [OrderOut.model_validate(o) for o in items], "total": total, "page": page, "limit": limit}


@router.post("/", response_model=OrderOut, status_code=201)
def create_order(body: OrderCreate, db: Session = Depends(get_db), current_user: AppUser = Depends(get_current_user)):
    # Auto-generate order number
    order_no = f"SIP-{str(uuid.uuid4())[:8].upper()}"
    order = SalesOrder(
        id=str(uuid.uuid4()),
        order_no=order_no,
        created_by=current_user.id,
        **body.model_dump(),
    )
    db.add(order)
    db.commit()
    db.refresh(order)
    return order


@router.get("/{order_id}", response_model=OrderOut)
def get_order(order_id: str, db: Session = Depends(get_db), current_user: AppUser = Depends(get_current_user)):
    o = db.query(SalesOrder).filter(SalesOrder.id == order_id).first()
    if not o:
        raise HTTPException(404, "Sipariş bulunamadı")
    return o


@router.put("/{order_id}", response_model=OrderOut)
def update_order(order_id: str, body: OrderUpdate, db: Session = Depends(get_db), current_user: AppUser = Depends(get_current_user)):
    o = db.query(SalesOrder).filter(SalesOrder.id == order_id).first()
    if not o:
        raise HTTPException(404, "Sipariş bulunamadı")
    for k, v in body.model_dump(exclude_unset=True).items():
        setattr(o, k, v)
    db.commit()
    db.refresh(o)
    return o


@router.delete("/{order_id}", status_code=204)
def delete_order(order_id: str, db: Session = Depends(get_db), current_user: AppUser = Depends(get_current_user)):
    o = db.query(SalesOrder).filter(SalesOrder.id == order_id).first()
    if not o:
        raise HTTPException(404, "Sipariş bulunamadı")
    db.delete(o)
    db.commit()
