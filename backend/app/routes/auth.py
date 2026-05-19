from fastapi import APIRouter, Depends, HTTPException, status, Response, Cookie
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import Optional
from pydantic import BaseModel
from app.db.database import get_db
from app.models.user import AppUser, RefreshToken, UserToken
from app.core.security import verify_password, get_password_hash, create_access_token, create_refresh_token, decode_token
from app.core.deps import get_current_user
from app.core.config import settings
import uuid

router = APIRouter(prefix="/auth", tags=["auth"])


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str | None = None
    is_admin: bool = False


class RefreshResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str | None = None
    is_admin: bool = False


class MeResponse(BaseModel):
    id: str
    username: str
    role: str
    is_admin: bool

    model_config = {"from_attributes": True}


class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str


class ResetPasswordRequest(BaseModel):
    token: str
    password: str


class ForgotPasswordRequest(BaseModel):
    email: str


class ChangeUsernameRequest(BaseModel):
    new_username: str


@router.post("/token", response_model=TokenResponse)
def login(
    response: Response,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    user = db.query(AppUser).filter(AppUser.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Kullanıcı adı veya şifre hatalı",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token({"sub": user.id, "role": user.role})
    refresh_token_str = create_refresh_token({"sub": user.id, "role": user.role})

    # Save refresh token
    rt = RefreshToken(
        id=str(uuid.uuid4()),
        user_id=user.id,
        token=refresh_token_str,
        is_active=True,
    )
    db.add(rt)
    db.commit()

    # Set refresh token as HTTP-only cookie
    response.set_cookie(
        key="refresh_token",
        value=refresh_token_str,
        httponly=True,
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 86400,
        samesite="lax",
    )

    return TokenResponse(
        access_token=access_token,
        role=user.role,
        is_admin=(user.role == "admin"),
    )


@router.post("/refresh", response_model=RefreshResponse)
def refresh_token(
    response: Response,
    refresh_token: Optional[str] = Cookie(default=None),
    db: Session = Depends(get_db),
):
    if not refresh_token:
        raise HTTPException(status_code=401, detail="Refresh token bulunamadı")

    payload = decode_token(refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Geçersiz refresh token")

    user_id = payload.get("sub")
    db_rt = db.query(RefreshToken).filter(
        RefreshToken.token == refresh_token,
        RefreshToken.user_id == user_id,
        RefreshToken.is_active == True,
    ).first()

    if not db_rt:
        raise HTTPException(status_code=401, detail="Refresh token geçersiz veya iptal edilmiş")

    user = db.query(AppUser).filter(AppUser.id == user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="Kullanıcı bulunamadı")

    new_access_token = create_access_token({"sub": user.id, "role": user.role})

    return RefreshResponse(
        access_token=new_access_token,
        role=user.role,
        is_admin=(user.role == "admin"),
    )


@router.get("/me", response_model=MeResponse)
def get_me(current_user: AppUser = Depends(get_current_user)):
    return MeResponse(
        id=current_user.id,
        username=current_user.username,
        role=current_user.role,
        is_admin=(current_user.role == "admin"),
    )


@router.post("/logout")
def logout(
    response: Response,
    refresh_token: Optional[str] = Cookie(default=None),
    db: Session = Depends(get_db),
):
    if refresh_token:
        db_rt = db.query(RefreshToken).filter(RefreshToken.token == refresh_token).first()
        if db_rt:
            db_rt.is_active = False
            db.commit()
    response.delete_cookie("refresh_token")
    return {"message": "Çıkış yapıldı"}


@router.post("/change-password")
def change_password(
    req: ChangePasswordRequest,
    current_user: AppUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not verify_password(req.old_password, current_user.password_hash):
        raise HTTPException(status_code=400, detail="Mevcut şifre hatalı")
    current_user.password_hash = get_password_hash(req.new_password)
    db.commit()
    return {"message": "Şifre başarıyla değiştirildi"}


@router.post("/change-username")
def change_username(
    req: ChangeUsernameRequest,
    current_user: AppUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    existing = db.query(AppUser).filter(AppUser.username == req.new_username).first()
    if existing:
        raise HTTPException(status_code=400, detail="Bu kullanıcı adı zaten kullanılıyor")
    current_user.username = req.new_username
    db.commit()
    return {"message": "Kullanıcı adı güncellendi", "username": req.new_username}


@router.post("/forgot-password")
def forgot_password(req: ForgotPasswordRequest):
    # Email sistemi kurulmadı — stub olarak döner
    return {"message": "Şifre sıfırlama bağlantısı e-posta adresinize gönderildi."}


@router.post("/reset-password")
def reset_password_with_token(req: ResetPasswordRequest, db: Session = Depends(get_db)):
    payload = decode_token(req.token)
    if not payload:
        raise HTTPException(status_code=400, detail="Geçersiz veya süresi dolmuş token")
    user_id = payload.get("sub")
    user = db.query(AppUser).filter(AppUser.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")
    user.password_hash = get_password_hash(req.password)
    db.commit()
    return {"message": "Şifreniz sıfırlandı"}
