from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os

from app.db.database import engine, Base
from app.core.config import settings

# Router imports
from app.routes import (
    auth, colors, profiles, glasses, materials, remotes,
    customers, systems, system_variants, system_templates,
    projects, orders, users
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create upload directories
    for subdir in ["systems", "variants", "profiles", "brands"]:
        os.makedirs(os.path.join(settings.UPLOAD_DIR, subdir), exist_ok=True)

    # Auto-create tables (dev mode — production'da alembic kullan)
    Base.metadata.create_all(bind=engine)

    # Seed: Admin kullanıcısı yoksa oluştur
    from app.db.database import SessionLocal
    from app.models.user import AppUser
    from app.core.security import get_password_hash
    import uuid

    db = SessionLocal()
    try:
        admin = db.query(AppUser).filter(AppUser.role == "admin").first()
        if not admin:
            admin = AppUser(
                id=str(uuid.uuid4()),
                username="admin",
                role="admin",
                password_hash=get_password_hash("admin123"),
            )
            db.add(admin)
            db.commit()
            print("Admin kullanicisi olusturuldu: admin / admin123")
    finally:
        db.close()

    yield


app = FastAPI(
    title="Tümen Alüminyum - Teklif ve Sipariş Yönetim Sistemi API",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:5173", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router)
app.include_router(colors.router)
app.include_router(profiles.router)
app.include_router(glasses.router)
app.include_router(materials.router)
app.include_router(remotes.router)
app.include_router(customers.router)
app.include_router(systems.router)
app.include_router(system_variants.router)
app.include_router(system_templates.router)
app.include_router(projects.router)
app.include_router(orders.router)
app.include_router(users.router)


@app.get("/")
def root():
    return {"message": "Tümen Alüminyum API çalışıyor", "docs": "/docs"}


@app.get("/health")
def health():
    return {"status": "ok"}
