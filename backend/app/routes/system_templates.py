from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, Any
from app.db.database import get_db
from app.models.system import (
    SystemProfileTemplate, SystemGlassTemplate,
    SystemMaterialTemplate, SystemRemoteTemplate
)
from app.core.deps import get_current_user
import uuid

router = APIRouter(prefix="/system-templates", tags=["system-templates"])


# ---- PROFILE TEMPLATES ----
class ProfileTemplateCreate(BaseModel):
    variant_id: str
    profile_id: str
    formula_cut_length: str
    formula_cut_count: str
    is_painted: Optional[bool] = False
    pdf_flags: Optional[Any] = None


class ProfileTemplateUpdate(BaseModel):
    profile_id: Optional[str] = None
    formula_cut_length: Optional[str] = None
    formula_cut_count: Optional[str] = None
    is_painted: Optional[bool] = None
    pdf_flags: Optional[Any] = None


class ProfileTemplateOut(BaseModel):
    id: str
    variant_id: str
    profile_id: Optional[str] = None
    formula_cut_length: str
    formula_cut_count: str
    is_painted: bool
    pdf_flags: Optional[Any] = None
    model_config = {"from_attributes": True}


@router.post("/profiles", response_model=ProfileTemplateOut, status_code=201)
def create_profile_template(body: ProfileTemplateCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    t = SystemProfileTemplate(id=str(uuid.uuid4()), **body.model_dump())
    db.add(t)
    db.commit()
    db.refresh(t)
    return t


@router.put("/profiles/{template_id}", response_model=ProfileTemplateOut)
def update_profile_template(template_id: str, body: ProfileTemplateUpdate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    t = db.query(SystemProfileTemplate).filter(SystemProfileTemplate.id == template_id).first()
    if not t:
        raise HTTPException(404, "Şablon bulunamadı")
    for k, v in body.model_dump(exclude_unset=True).items():
        setattr(t, k, v)
    db.commit()
    db.refresh(t)
    return t


@router.delete("/profiles/{template_id}", status_code=204)
def delete_profile_template(template_id: str, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    t = db.query(SystemProfileTemplate).filter(SystemProfileTemplate.id == template_id).first()
    if not t:
        raise HTTPException(404, "Şablon bulunamadı")
    db.delete(t)
    db.commit()


# ---- GLASS TEMPLATES ----
class GlassTemplateCreate(BaseModel):
    variant_id: str
    glass_type_id: str
    formula_width: str
    formula_height: str
    formula_count: str
    default_color_id: Optional[str] = None
    pdf_flags: Optional[Any] = None


class GlassTemplateUpdate(BaseModel):
    glass_type_id: Optional[str] = None
    formula_width: Optional[str] = None
    formula_height: Optional[str] = None
    formula_count: Optional[str] = None
    default_color_id: Optional[str] = None
    pdf_flags: Optional[Any] = None


class GlassTemplateOut(BaseModel):
    id: str
    variant_id: str
    glass_type_id: Optional[str] = None
    formula_width: str
    formula_height: str
    formula_count: str
    default_color_id: Optional[str] = None
    pdf_flags: Optional[Any] = None
    model_config = {"from_attributes": True}


@router.post("/glasses", response_model=GlassTemplateOut, status_code=201)
def create_glass_template(body: GlassTemplateCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    t = SystemGlassTemplate(id=str(uuid.uuid4()), **body.model_dump())
    db.add(t)
    db.commit()
    db.refresh(t)
    return t


@router.put("/glasses/{template_id}", response_model=GlassTemplateOut)
def update_glass_template(template_id: str, body: GlassTemplateUpdate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    t = db.query(SystemGlassTemplate).filter(SystemGlassTemplate.id == template_id).first()
    if not t:
        raise HTTPException(404, "Şablon bulunamadı")
    for k, v in body.model_dump(exclude_unset=True).items():
        setattr(t, k, v)
    db.commit()
    db.refresh(t)
    return t


@router.delete("/glasses/{template_id}", status_code=204)
def delete_glass_template(template_id: str, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    t = db.query(SystemGlassTemplate).filter(SystemGlassTemplate.id == template_id).first()
    if not t:
        raise HTTPException(404, "Şablon bulunamadı")
    db.delete(t)
    db.commit()


# ---- MATERIAL TEMPLATES ----
class MaterialTemplateCreate(BaseModel):
    variant_id: str
    material_id: str
    formula_quantity: str
    formula_cut_length: Optional[str] = None
    unit_price: Optional[str] = None
    pdf_flags: Optional[Any] = None


class MaterialTemplateUpdate(BaseModel):
    material_id: Optional[str] = None
    formula_quantity: Optional[str] = None
    formula_cut_length: Optional[str] = None
    unit_price: Optional[str] = None
    pdf_flags: Optional[Any] = None


class MaterialTemplateOut(BaseModel):
    id: str
    variant_id: str
    material_id: Optional[str] = None
    formula_quantity: str
    formula_cut_length: Optional[str] = None
    unit_price: Optional[str] = None
    pdf_flags: Optional[Any] = None
    model_config = {"from_attributes": True}


@router.post("/materials", response_model=MaterialTemplateOut, status_code=201)
def create_material_template(body: MaterialTemplateCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    t = SystemMaterialTemplate(id=str(uuid.uuid4()), **body.model_dump())
    db.add(t)
    db.commit()
    db.refresh(t)
    return t


@router.put("/materials/{template_id}", response_model=MaterialTemplateOut)
def update_material_template(template_id: str, body: MaterialTemplateUpdate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    t = db.query(SystemMaterialTemplate).filter(SystemMaterialTemplate.id == template_id).first()
    if not t:
        raise HTTPException(404, "Şablon bulunamadı")
    for k, v in body.model_dump(exclude_unset=True).items():
        setattr(t, k, v)
    db.commit()
    db.refresh(t)
    return t


@router.delete("/materials/{template_id}", status_code=204)
def delete_material_template(template_id: str, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    t = db.query(SystemMaterialTemplate).filter(SystemMaterialTemplate.id == template_id).first()
    if not t:
        raise HTTPException(404, "Şablon bulunamadı")
    db.delete(t)
    db.commit()


# ---- REMOTE TEMPLATES ----
class RemoteTemplateCreate(BaseModel):
    variant_id: str
    remote_id: str
    order_index: Optional[int] = 0
    pdf_flags: Optional[Any] = None


class RemoteTemplateUpdate(BaseModel):
    remote_id: Optional[str] = None
    order_index: Optional[int] = None
    pdf_flags: Optional[Any] = None


class RemoteTemplateOut(BaseModel):
    id: str
    variant_id: str
    remote_id: Optional[str] = None
    order_index: int
    pdf_flags: Optional[Any] = None
    model_config = {"from_attributes": True}


@router.post("/remotes", response_model=RemoteTemplateOut, status_code=201)
def create_remote_template(body: RemoteTemplateCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    t = SystemRemoteTemplate(id=str(uuid.uuid4()), **body.model_dump())
    db.add(t)
    db.commit()
    db.refresh(t)
    return t


@router.put("/remotes/{template_id}", response_model=RemoteTemplateOut)
def update_remote_template(template_id: str, body: RemoteTemplateUpdate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    t = db.query(SystemRemoteTemplate).filter(SystemRemoteTemplate.id == template_id).first()
    if not t:
        raise HTTPException(404, "Şablon bulunamadı")
    for k, v in body.model_dump(exclude_unset=True).items():
        setattr(t, k, v)
    db.commit()
    db.refresh(t)
    return t


@router.delete("/remotes/{template_id}", status_code=204)
def delete_remote_template(template_id: str, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    t = db.query(SystemRemoteTemplate).filter(SystemRemoteTemplate.id == template_id).first()
    if not t:
        raise HTTPException(404, "Şablon bulunamadı")
    db.delete(t)
    db.commit()
