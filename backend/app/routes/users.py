from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List, Any
from app.db.database import get_db
from app.models.user import AppUser, DealerProfilePicture, PdfBrand, PdfTitleTemplate, ProjectCodeRule
from app.core.deps import get_current_user, require_admin
from app.core.security import get_password_hash
from app.core.config import settings
import uuid, os, shutil

router = APIRouter(prefix="/users", tags=["users"])


class UserCreate(BaseModel):
    username: str
    password: str
    role: Optional[str] = "dealer"


class UserUpdate(BaseModel):
    username: Optional[str] = None
    role: Optional[str] = None


class UserOut(BaseModel):
    id: str
    username: str
    role: str
    model_config = {"from_attributes": True}


class PdfBrandOut(BaseModel):
    id: str
    user_id: str
    brand_name: Optional[str] = None
    file_path: Optional[str] = None
    model_config = {"from_attributes": True}


class PdfTitleOut(BaseModel):
    id: str
    user_id: str
    key: str
    value: Optional[str] = None
    model_config = {"from_attributes": True}


# ---- Admin: User management ----

@router.get("/", response_model=List[UserOut])
def list_users(
    page: int = Query(1, ge=1),
    limit: int = Query(10),
    q: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: AppUser = Depends(require_admin),
):
    query = db.query(AppUser)
    if q:
        query = query.filter(AppUser.username.ilike(f"%{q}%"))
    return query.offset((page - 1) * limit).limit(limit).all()


@router.post("/", response_model=UserOut, status_code=201)
def create_user(body: UserCreate, db: Session = Depends(get_db), current_user: AppUser = Depends(require_admin)):
    existing = db.query(AppUser).filter(AppUser.username == body.username).first()
    if existing:
        raise HTTPException(400, "Bu kullanıcı adı zaten kullanılıyor")
    user = AppUser(
        id=str(uuid.uuid4()),
        username=body.username,
        role=body.role,
        password_hash=get_password_hash(body.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.get("/me/profile-picture")
def get_my_profile_picture(
    db: Session = Depends(get_db),
    current_user: AppUser = Depends(get_current_user),
):
    pic = db.query(DealerProfilePicture).filter(DealerProfilePicture.user_id == current_user.id).first()
    if not pic or not os.path.exists(pic.file_path):
        raise HTTPException(404, "Profil fotoğrafı bulunamadı")
    return FileResponse(pic.file_path)


@router.post("/me/profile-picture")
async def upload_profile_picture(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: AppUser = Depends(get_current_user),
):
    upload_dir = os.path.join(settings.UPLOAD_DIR, "profiles")
    os.makedirs(upload_dir, exist_ok=True)
    ext = os.path.splitext(file.filename or "photo.jpg")[1] or ".jpg"
    filename = f"{current_user.id}{ext}"
    filepath = os.path.join(upload_dir, filename)
    with open(filepath, "wb") as f:
        shutil.copyfileobj(file.file, f)

    pic = db.query(DealerProfilePicture).filter(DealerProfilePicture.user_id == current_user.id).first()
    if pic:
        pic.file_path = filepath
    else:
        pic = DealerProfilePicture(id=str(uuid.uuid4()), user_id=current_user.id, file_path=filepath)
        db.add(pic)
    db.commit()
    return {"message": "Profil fotoğrafı yüklendi"}


# ---- PDF Brand ----

@router.get("/me/pdf-brand", response_model=PdfBrandOut)
def get_pdf_brand(db: Session = Depends(get_db), current_user: AppUser = Depends(get_current_user)):
    brand = db.query(PdfBrand).filter(PdfBrand.user_id == current_user.id).first()
    if not brand:
        raise HTTPException(404, "PDF marka bilgisi bulunamadı")
    return brand


@router.post("/me/pdf-brand")
async def upload_pdf_brand(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: AppUser = Depends(get_current_user),
):
    upload_dir = os.path.join(settings.UPLOAD_DIR, "brands")
    os.makedirs(upload_dir, exist_ok=True)
    ext = os.path.splitext(file.filename or "brand.png")[1] or ".png"
    filename = f"{current_user.id}_brand{ext}"
    filepath = os.path.join(upload_dir, filename)
    with open(filepath, "wb") as f:
        shutil.copyfileobj(file.file, f)
    brand = db.query(PdfBrand).filter(PdfBrand.user_id == current_user.id).first()
    if brand:
        brand.file_path = filepath
    else:
        brand = PdfBrand(id=str(uuid.uuid4()), user_id=current_user.id, file_path=filepath)
        db.add(brand)
    db.commit()
    return {"message": "Marka görseli yüklendi"}


# ---- PDF Title Templates ----

@router.get("/me/pdf-titles", response_model=List[PdfTitleOut])
def get_pdf_titles(db: Session = Depends(get_db), current_user: AppUser = Depends(get_current_user)):
    return db.query(PdfTitleTemplate).filter(PdfTitleTemplate.user_id == current_user.id).all()


@router.post("/me/pdf-titles", response_model=PdfTitleOut, status_code=201)
def create_pdf_title(
    body: dict,
    db: Session = Depends(get_db),
    current_user: AppUser = Depends(get_current_user),
):
    t = PdfTitleTemplate(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        key=body.get("key", ""),
        value=body.get("value"),
    )
    db.add(t)
    db.commit()
    db.refresh(t)
    return t


@router.put("/me/pdf-titles/{title_id}", response_model=PdfTitleOut)
def update_pdf_title(
    title_id: str,
    body: dict,
    db: Session = Depends(get_db),
    current_user: AppUser = Depends(get_current_user),
):
    t = db.query(PdfTitleTemplate).filter(
        PdfTitleTemplate.id == title_id,
        PdfTitleTemplate.user_id == current_user.id,
    ).first()
    if not t:
        raise HTTPException(404, "Şablon bulunamadı")
    for k, v in body.items():
        if hasattr(t, k):
            setattr(t, k, v)
    db.commit()
    db.refresh(t)
    return t


@router.delete("/me/pdf-titles/{title_id}", status_code=204)
def delete_pdf_title(
    title_id: str,
    db: Session = Depends(get_db),
    current_user: AppUser = Depends(get_current_user),
):
    t = db.query(PdfTitleTemplate).filter(
        PdfTitleTemplate.id == title_id,
        PdfTitleTemplate.user_id == current_user.id,
    ).first()
    if not t:
        raise HTTPException(404, "Şablon bulunamadı")
    db.delete(t)
    db.commit()


# ---- Admin CRUD ----

@router.get("/{user_id}", response_model=UserOut)
def get_user(user_id: str, db: Session = Depends(get_db), current_user: AppUser = Depends(require_admin)):
    u = db.query(AppUser).filter(AppUser.id == user_id).first()
    if not u:
        raise HTTPException(404, "Kullanıcı bulunamadı")
    return u


@router.put("/{user_id}", response_model=UserOut)
def update_user(user_id: str, body: UserUpdate, db: Session = Depends(get_db), current_user: AppUser = Depends(require_admin)):
    u = db.query(AppUser).filter(AppUser.id == user_id).first()
    if not u:
        raise HTTPException(404, "Kullanıcı bulunamadı")
    for k, v in body.model_dump(exclude_unset=True).items():
        setattr(u, k, v)
    db.commit()
    db.refresh(u)
    return u


@router.delete("/{user_id}", status_code=204)
def delete_user(user_id: str, db: Session = Depends(get_db), current_user: AppUser = Depends(require_admin)):
    u = db.query(AppUser).filter(AppUser.id == user_id).first()
    if not u:
        raise HTTPException(404, "Kullanıcı bulunamadı")
    db.delete(u)
    db.commit()
