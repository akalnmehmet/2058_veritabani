from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from pydantic import BaseModel
from typing import Optional, List, Any
from app.db.database import get_db
from app.models.project import (
    Project, ProjectSystem, ProjectSystemProfile, ProjectSystemGlass,
    ProjectSystemMaterial, ProjectSystemRemote,
    ProjectExtraProfile, ProjectExtraGlass, ProjectExtraMaterial, ProjectExtraRemote
)
from app.models.system import SystemVariant, SystemProfileTemplate, SystemGlassTemplate, SystemMaterialTemplate, SystemRemoteTemplate
from app.core.deps import get_current_user
from app.models.user import AppUser
import uuid

router = APIRouter(prefix="/projects", tags=["projects"])


# ---------- Schemas ----------

class ProjectCreate(BaseModel):
    project_name: str
    project_kodu: Optional[str] = None
    customer_id: Optional[str] = None
    profile_color_id: Optional[str] = None
    glass_color_id: Optional[str] = None
    is_teklif: Optional[bool] = True


class ProjectUpdate(BaseModel):
    project_name: Optional[str] = None
    project_kodu: Optional[str] = None
    customer_id: Optional[str] = None
    profile_color_id: Optional[str] = None
    glass_color_id: Optional[str] = None
    is_teklif: Optional[bool] = None
    paint_status: Optional[bool] = None
    glass_status: Optional[bool] = None
    production_status: Optional[bool] = None


class ProjectOut(BaseModel):
    id: str
    project_kodu: Optional[str] = None
    project_name: str
    press_price: Optional[float] = None
    painted_price: Optional[float] = None
    is_teklif: bool
    paint_status: bool
    glass_status: bool
    production_status: bool
    created_by: Optional[str] = None
    customer_id: Optional[str] = None
    profile_color_id: Optional[str] = None
    glass_color_id: Optional[str] = None
    model_config = {"from_attributes": True}


class PricesUpdate(BaseModel):
    press_price: Optional[float] = None
    painted_price: Optional[float] = None


class AddRequirementsBody(BaseModel):
    variant_id: str
    width_mm: Optional[float] = None
    height_mm: Optional[float] = None
    quantity: Optional[int] = 1
    display_order: Optional[int] = 0


class SystemUpdate(BaseModel):
    width_mm: Optional[float] = None
    height_mm: Optional[float] = None
    quantity: Optional[int] = None
    display_order: Optional[int] = None


class GlassColorUpdate(BaseModel):
    glass_color_1_id: Optional[str] = None
    glass_color_2_id: Optional[str] = None


class BulkGlassColorUpdate(BaseModel):
    glass_type_id: Optional[str] = None
    glass_color_1_id: Optional[str] = None
    glass_color_2_id: Optional[str] = None


class ExtraProfileCreate(BaseModel):
    project_id: str
    profile_id: Optional[str] = None
    cut_length: Optional[float] = None
    cut_count: Optional[float] = None
    is_painted: Optional[bool] = False
    price: Optional[float] = None
    pdf_flags: Optional[Any] = None


class ExtraGlassCreate(BaseModel):
    project_id: str
    glass_type_id: Optional[str] = None
    width: Optional[float] = None
    height: Optional[float] = None
    count: Optional[float] = None
    area: Optional[float] = None
    price: Optional[float] = None
    glass_color_1_id: Optional[str] = None
    glass_color_2_id: Optional[str] = None
    pdf_flags: Optional[Any] = None


class ExtraMaterialCreate(BaseModel):
    project_id: str
    material_id: Optional[str] = None
    count: Optional[float] = None
    cut_length: Optional[float] = None
    price: Optional[float] = None
    pdf_flags: Optional[Any] = None


class ExtraRemoteCreate(BaseModel):
    project_id: str
    remote_id: Optional[str] = None
    count: Optional[int] = 1
    price: Optional[float] = None
    pdf_flags: Optional[Any] = None


# ---------- Helpers ----------

def _evaluate_formula(formula: str, W: float, H: float) -> float:
    """Güvenli formül değerlendirici."""
    try:
        result = eval(formula, {"__builtins__": {}}, {"W": W, "H": H, "w": W, "h": H})
        return float(result)
    except Exception:
        return 0.0


def _calculate_project_system(db: Session, ps: ProjectSystem):
    """Bir project_system için şablondan hesaplanmış kalemleri oluşturur."""
    W = ps.width_mm or 0
    H = ps.height_mm or 0

    variant = db.query(SystemVariant).options(
        joinedload(SystemVariant.profile_templates),
        joinedload(SystemVariant.glass_templates),
        joinedload(SystemVariant.material_templates),
        joinedload(SystemVariant.remote_templates),
    ).filter(SystemVariant.id == ps.variant_id).first()

    if not variant:
        return

    # Clear existing calculated items
    for p in ps.profiles:
        db.delete(p)
    for g in ps.glasses:
        db.delete(g)
    for m in ps.materials:
        db.delete(m)
    for r in ps.remotes:
        db.delete(r)
    db.flush()

    # Profiles
    for tmpl in variant.profile_templates:
        cut_length = _evaluate_formula(tmpl.formula_cut_length, W, H)
        cut_count = _evaluate_formula(tmpl.formula_cut_count, W, H)
        psp = ProjectSystemProfile(
            id=str(uuid.uuid4()),
            project_system_id=ps.id,
            profile_id=tmpl.profile_id,
            cut_length=cut_length,
            cut_count=cut_count,
            is_painted=tmpl.is_painted,
            pdf_flags=tmpl.pdf_flags,
        )
        db.add(psp)

    # Glasses
    for tmpl in variant.glass_templates:
        width = _evaluate_formula(tmpl.formula_width, W, H)
        height = _evaluate_formula(tmpl.formula_height, W, H)
        count = _evaluate_formula(tmpl.formula_count, W, H)
        area = (width * height * count) / 1_000_000 if width and height else 0
        psg = ProjectSystemGlass(
            id=str(uuid.uuid4()),
            project_system_id=ps.id,
            glass_type_id=tmpl.glass_type_id,
            width=width,
            height=height,
            count=count,
            area=area,
            glass_color_1_id=tmpl.default_color_id,
            pdf_flags=tmpl.pdf_flags,
        )
        db.add(psg)

    # Materials
    for tmpl in variant.material_templates:
        qty = _evaluate_formula(tmpl.formula_quantity, W, H)
        cut_len = _evaluate_formula(tmpl.formula_cut_length or "0", W, H)
        psm = ProjectSystemMaterial(
            id=str(uuid.uuid4()),
            project_system_id=ps.id,
            material_id=tmpl.material_id,
            count=qty,
            cut_length=cut_len,
            pdf_flags=tmpl.pdf_flags,
        )
        db.add(psm)

    # Remotes
    for tmpl in variant.remote_templates:
        psr = ProjectSystemRemote(
            id=str(uuid.uuid4()),
            project_system_id=ps.id,
            remote_id=tmpl.remote_id,
            count=1,
            order_index=tmpl.order_index,
            pdf_flags=tmpl.pdf_flags,
        )
        db.add(psr)


# ---------- Endpoints ----------

@router.get("/")
def list_projects(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=200),
    name: Optional[str] = None,
    code: Optional[str] = None,
    is_teklif: Optional[bool] = None,
    paint_status: Optional[str] = None,
    glass_status: Optional[str] = None,
    production_status: Optional[str] = None,
    customer_id: Optional[str] = None,
    proje_sorted: Optional[bool] = None,
    teklifler_sorted: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user: AppUser = Depends(get_current_user),
):
    query = db.query(Project)
    if current_user.role != "admin":
        query = query.filter(Project.created_by == current_user.id)
    if name:
        query = query.filter(Project.project_name.ilike(f"%{name}%"))
    if code:
        query = query.filter(Project.project_kodu.ilike(f"%{code}%"))
    if is_teklif is not None:
        query = query.filter(Project.is_teklif == is_teklif)
    if customer_id:
        query = query.filter(Project.customer_id == customer_id)

    total = query.count()
    items = query.order_by(Project.project_name).offset((page - 1) * limit).limit(limit).all()
    return {"items": [ProjectOut.model_validate(p) for p in items], "total": total, "page": page, "limit": limit}


@router.post("/", response_model=ProjectOut, status_code=201)
def create_project(body: ProjectCreate, db: Session = Depends(get_db), current_user: AppUser = Depends(get_current_user)):
    project = Project(id=str(uuid.uuid4()), created_by=current_user.id, **body.model_dump())
    db.add(project)
    db.commit()
    db.refresh(project)
    return project


@router.get("/{project_id}", response_model=ProjectOut)
def get_project(project_id: str, db: Session = Depends(get_db), current_user: AppUser = Depends(get_current_user)):
    p = db.query(Project).filter(Project.id == project_id).first()
    if not p:
        raise HTTPException(404, "Proje bulunamadı")
    if current_user.role != "admin" and p.created_by != current_user.id:
        raise HTTPException(403, "Erişim izniniz yok")
    return p


@router.put("/{project_id}", response_model=ProjectOut)
def update_project(project_id: str, body: ProjectUpdate, db: Session = Depends(get_db), current_user: AppUser = Depends(get_current_user)):
    p = db.query(Project).filter(Project.id == project_id).first()
    if not p:
        raise HTTPException(404, "Proje bulunamadı")
    if current_user.role != "admin" and p.created_by != current_user.id:
        raise HTTPException(403, "Erişim izniniz yok")
    for k, v in body.model_dump(exclude_unset=True).items():
        setattr(p, k, v)
    db.commit()
    db.refresh(p)
    return p


@router.delete("/{project_id}", status_code=204)
def delete_project(project_id: str, db: Session = Depends(get_db), current_user: AppUser = Depends(get_current_user)):
    p = db.query(Project).filter(Project.id == project_id).first()
    if not p:
        raise HTTPException(404, "Proje bulunamadı")
    if current_user.role != "admin" and p.created_by != current_user.id:
        raise HTTPException(403, "Erişim izniniz yok")
    db.delete(p)
    db.commit()


@router.put("/{project_id}/prices")
def update_project_prices(project_id: str, body: PricesUpdate, db: Session = Depends(get_db), current_user: AppUser = Depends(get_current_user)):
    p = db.query(Project).filter(Project.id == project_id).first()
    if not p:
        raise HTTPException(404, "Proje bulunamadı")
    for k, v in body.model_dump(exclude_unset=True).items():
        setattr(p, k, v)
    db.commit()
    return {"ok": True}


@router.post("/{project_id}/add-requirements")
def add_system_to_project(
    project_id: str,
    body: AddRequirementsBody,
    db: Session = Depends(get_db),
    current_user: AppUser = Depends(get_current_user),
):
    p = db.query(Project).filter(Project.id == project_id).first()
    if not p:
        raise HTTPException(404, "Proje bulunamadı")

    ps = ProjectSystem(
        id=str(uuid.uuid4()),
        project_id=project_id,
        variant_id=body.variant_id,
        width_mm=body.width_mm,
        height_mm=body.height_mm,
        quantity=body.quantity or 1,
        display_order=body.display_order or 0,
    )
    db.add(ps)
    db.flush()

    _calculate_project_system(db, ps)
    db.commit()
    db.refresh(ps)
    return {"id": ps.id, "message": "Sistem eklendi ve hesaplandı"}


@router.get("/{project_id}/requirements-detailed")
def get_project_requirements_detailed(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: AppUser = Depends(get_current_user),
):
    p = db.query(Project).options(
        joinedload(Project.systems).joinedload(ProjectSystem.profiles),
        joinedload(Project.systems).joinedload(ProjectSystem.glasses),
        joinedload(Project.systems).joinedload(ProjectSystem.materials),
        joinedload(Project.systems).joinedload(ProjectSystem.remotes),
        joinedload(Project.extra_profiles),
        joinedload(Project.extra_glasses),
        joinedload(Project.extra_materials),
        joinedload(Project.extra_remotes),
    ).filter(Project.id == project_id).first()
    if not p:
        raise HTTPException(404, "Proje bulunamadı")

    def _ps_to_dict(ps):
        return {
            "id": ps.id,
            "variant_id": ps.variant_id,
            "width_mm": ps.width_mm,
            "height_mm": ps.height_mm,
            "quantity": ps.quantity,
            "display_order": ps.display_order,
            "profiles": [{"id": x.id, "profile_id": x.profile_id, "cut_length": x.cut_length, "cut_count": x.cut_count, "is_painted": x.is_painted, "price": float(x.price) if x.price else None, "pdf_flags": x.pdf_flags} for x in ps.profiles],
            "glasses": [{"id": x.id, "glass_type_id": x.glass_type_id, "width": x.width, "height": x.height, "count": x.count, "area": x.area, "price": float(x.price) if x.price else None, "glass_color_1_id": x.glass_color_1_id, "glass_color_2_id": x.glass_color_2_id, "pdf_flags": x.pdf_flags} for x in ps.glasses],
            "materials": [{"id": x.id, "material_id": x.material_id, "count": x.count, "cut_length": x.cut_length, "price": float(x.price) if x.price else None, "pdf_flags": x.pdf_flags} for x in ps.materials],
            "remotes": [{"id": x.id, "remote_id": x.remote_id, "count": x.count, "order_index": x.order_index, "price": float(x.price) if x.price else None, "pdf_flags": x.pdf_flags} for x in ps.remotes],
        }

    return {
        "id": p.id,
        "project_name": p.project_name,
        "project_kodu": p.project_kodu,
        "systems": [_ps_to_dict(ps) for ps in sorted(p.systems, key=lambda x: x.display_order)],
        "extra_profiles": [{"id": x.id, "profile_id": x.profile_id, "cut_length": x.cut_length, "cut_count": x.cut_count, "is_painted": x.is_painted, "price": float(x.price) if x.price else None, "pdf_flags": x.pdf_flags} for x in p.extra_profiles],
        "extra_glasses": [{"id": x.id, "glass_type_id": x.glass_type_id, "width": x.width, "height": x.height, "count": x.count, "area": x.area, "price": float(x.price) if x.price else None, "glass_color_1_id": x.glass_color_1_id, "glass_color_2_id": x.glass_color_2_id, "pdf_flags": x.pdf_flags} for x in p.extra_glasses],
        "extra_materials": [{"id": x.id, "material_id": x.material_id, "count": x.count, "cut_length": x.cut_length, "price": float(x.price) if x.price else None, "pdf_flags": x.pdf_flags} for x in p.extra_materials],
        "extra_remotes": [{"id": x.id, "remote_id": x.remote_id, "count": x.count, "price": float(x.price) if x.price else None, "pdf_flags": x.pdf_flags} for x in p.extra_remotes],
    }


@router.put("/{project_id}/systems/{project_system_id}")
def update_project_system(
    project_id: str,
    project_system_id: str,
    body: SystemUpdate,
    db: Session = Depends(get_db),
    current_user: AppUser = Depends(get_current_user),
):
    ps = db.query(ProjectSystem).filter(
        ProjectSystem.id == project_system_id,
        ProjectSystem.project_id == project_id,
    ).first()
    if not ps:
        raise HTTPException(404, "Proje sistemi bulunamadı")
    for k, v in body.model_dump(exclude_unset=True).items():
        setattr(ps, k, v)
    db.flush()
    _calculate_project_system(db, ps)
    db.commit()
    return {"ok": True}


@router.delete("/{project_id}/systems/{project_system_id}", status_code=204)
def delete_project_system(
    project_id: str,
    project_system_id: str,
    db: Session = Depends(get_db),
    current_user: AppUser = Depends(get_current_user),
):
    ps = db.query(ProjectSystem).filter(
        ProjectSystem.id == project_system_id,
        ProjectSystem.project_id == project_id,
    ).first()
    if not ps:
        raise HTTPException(404, "Proje sistemi bulunamadı")
    db.delete(ps)
    db.commit()


@router.put("/{project_id}/system-glasses/{psg_id}/color")
def update_system_glass_color(
    project_id: str,
    psg_id: str,
    body: GlassColorUpdate,
    db: Session = Depends(get_db),
    current_user: AppUser = Depends(get_current_user),
):
    psg = db.query(ProjectSystemGlass).filter(ProjectSystemGlass.id == psg_id).first()
    if not psg:
        raise HTTPException(404, "Cam kaydı bulunamadı")
    for k, v in body.model_dump(exclude_unset=True).items():
        setattr(psg, k, v)
    db.commit()
    return {"ok": True}


@router.put("/{project_id}/system-glasses/colors/bulk")
def update_same_glasses_color(
    project_id: str,
    body: BulkGlassColorUpdate,
    db: Session = Depends(get_db),
    current_user: AppUser = Depends(get_current_user),
):
    query = db.query(ProjectSystemGlass).join(ProjectSystem).filter(ProjectSystem.project_id == project_id)
    if body.glass_type_id:
        query = query.filter(ProjectSystemGlass.glass_type_id == body.glass_type_id)
    glasses = query.all()
    for g in glasses:
        if body.glass_color_1_id is not None:
            g.glass_color_1_id = body.glass_color_1_id
        if body.glass_color_2_id is not None:
            g.glass_color_2_id = body.glass_color_2_id
    db.commit()
    return {"updated": len(glasses)}


@router.put("/{project_id}/glasses/colors/all")
def update_all_glasses_color(
    project_id: str,
    body: BulkGlassColorUpdate,
    db: Session = Depends(get_db),
    current_user: AppUser = Depends(get_current_user),
):
    glasses = db.query(ProjectSystemGlass).join(ProjectSystem).filter(ProjectSystem.project_id == project_id).all()
    for g in glasses:
        if body.glass_color_1_id is not None:
            g.glass_color_1_id = body.glass_color_1_id
        if body.glass_color_2_id is not None:
            g.glass_color_2_id = body.glass_color_2_id
    db.commit()
    return {"updated": len(glasses)}


# ---- Extra items ----

@router.post("/extra-profiles", status_code=201)
def add_extra_profile(body: ExtraProfileCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    ep = ProjectExtraProfile(id=str(uuid.uuid4()), **body.model_dump())
    db.add(ep)
    db.commit()
    db.refresh(ep)
    return ep


@router.put("/extra-profiles/{ep_id}")
def update_extra_profile(ep_id: str, body: dict, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    ep = db.query(ProjectExtraProfile).filter(ProjectExtraProfile.id == ep_id).first()
    if not ep:
        raise HTTPException(404, "Ekstra profil bulunamadı")
    for k, v in body.items():
        if hasattr(ep, k):
            setattr(ep, k, v)
    db.commit()
    db.refresh(ep)
    return ep


@router.delete("/extra-profiles/{ep_id}", status_code=204)
def delete_extra_profile(ep_id: str, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    ep = db.query(ProjectExtraProfile).filter(ProjectExtraProfile.id == ep_id).first()
    if not ep:
        raise HTTPException(404, "Ekstra profil bulunamadı")
    db.delete(ep)
    db.commit()


@router.post("/extra-glasses", status_code=201)
def add_extra_glass(body: ExtraGlassCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    eg = ProjectExtraGlass(id=str(uuid.uuid4()), **body.model_dump())
    db.add(eg)
    db.commit()
    db.refresh(eg)
    return eg


@router.put("/extra-glasses/{eg_id}")
def update_extra_glass(eg_id: str, body: dict, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    eg = db.query(ProjectExtraGlass).filter(ProjectExtraGlass.id == eg_id).first()
    if not eg:
        raise HTTPException(404, "Ekstra cam bulunamadı")
    for k, v in body.items():
        if hasattr(eg, k):
            setattr(eg, k, v)
    db.commit()
    db.refresh(eg)
    return eg


@router.delete("/extra-glasses/{eg_id}", status_code=204)
def delete_extra_glass(eg_id: str, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    eg = db.query(ProjectExtraGlass).filter(ProjectExtraGlass.id == eg_id).first()
    if not eg:
        raise HTTPException(404, "Ekstra cam bulunamadı")
    db.delete(eg)
    db.commit()


@router.post("/extra-materials", status_code=201)
def add_extra_material(body: ExtraMaterialCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    em = ProjectExtraMaterial(id=str(uuid.uuid4()), **body.model_dump())
    db.add(em)
    db.commit()
    db.refresh(em)
    return em


@router.put("/extra-materials/{em_id}")
def update_extra_material(em_id: str, body: dict, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    em = db.query(ProjectExtraMaterial).filter(ProjectExtraMaterial.id == em_id).first()
    if not em:
        raise HTTPException(404, "Ekstra malzeme bulunamadı")
    for k, v in body.items():
        if hasattr(em, k):
            setattr(em, k, v)
    db.commit()
    db.refresh(em)
    return em


@router.delete("/extra-materials/{em_id}", status_code=204)
def delete_extra_material(em_id: str, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    em = db.query(ProjectExtraMaterial).filter(ProjectExtraMaterial.id == em_id).first()
    if not em:
        raise HTTPException(404, "Ekstra malzeme bulunamadı")
    db.delete(em)
    db.commit()


@router.post("/extra-remotes", status_code=201)
def add_extra_remote(body: ExtraRemoteCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    er = ProjectExtraRemote(id=str(uuid.uuid4()), **body.model_dump())
    db.add(er)
    db.commit()
    db.refresh(er)
    return er


@router.put("/extra-remotes/{er_id}")
def update_extra_remote(er_id: str, body: dict, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    er = db.query(ProjectExtraRemote).filter(ProjectExtraRemote.id == er_id).first()
    if not er:
        raise HTTPException(404, "Ekstra kumanda bulunamadı")
    for k, v in body.items():
        if hasattr(er, k):
            setattr(er, k, v)
    db.commit()
    db.refresh(er)
    return er


@router.delete("/extra-remotes/{er_id}", status_code=204)
def delete_extra_remote(er_id: str, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    er = db.query(ProjectExtraRemote).filter(ProjectExtraRemote.id == er_id).first()
    if not er:
        raise HTTPException(404, "Ekstra kumanda bulunamadı")
    db.delete(er)
    db.commit()
