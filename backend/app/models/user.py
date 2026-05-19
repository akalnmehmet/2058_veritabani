import uuid
from sqlalchemy import Column, String, Boolean, ForeignKey, Numeric, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.database import Base


def gen_uuid():
    return str(uuid.uuid4())


class AppUser(Base):
    __tablename__ = "app_user"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    username = Column(String(100), unique=True, nullable=False, index=True)
    role = Column(String(50), nullable=False, default="dealer")  # admin | dealer
    password_hash = Column(String(255), nullable=False)

    # Relations
    customers = relationship("Customer", back_populates="owner", cascade="all, delete-orphan")
    projects = relationship("Project", back_populates="creator", foreign_keys="Project.created_by")
    tokens = relationship("UserToken", back_populates="user", cascade="all, delete-orphan")
    refresh_tokens = relationship("RefreshToken", back_populates="user", cascade="all, delete-orphan")
    pdf_brand = relationship("PdfBrand", back_populates="user", uselist=False, cascade="all, delete-orphan")
    pdf_title_templates = relationship("PdfTitleTemplate", back_populates="user", cascade="all, delete-orphan")
    profile_picture = relationship("DealerProfilePicture", back_populates="user", uselist=False, cascade="all, delete-orphan")
    project_code_rule = relationship("ProjectCodeRule", back_populates="user", uselist=False, cascade="all, delete-orphan")
    project_code_ledger = relationship("ProjectCodeLedger", back_populates="owner", cascade="all, delete-orphan")
    calculation_helper = relationship("CalculationHelper", back_populates="user", uselist=False, cascade="all, delete-orphan")
    sales_orders = relationship("SalesOrder", back_populates="creator", foreign_keys="SalesOrder.created_by")


class UserToken(Base):
    __tablename__ = "user_token"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    user_id = Column(UUID(as_uuid=False), ForeignKey("app_user.id", ondelete="CASCADE"), nullable=False)
    token = Column(Text, nullable=False, unique=True)
    device_info = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True)

    user = relationship("AppUser", back_populates="tokens")


class RefreshToken(Base):
    __tablename__ = "refresh_token"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    user_id = Column(UUID(as_uuid=False), ForeignKey("app_user.id", ondelete="CASCADE"), nullable=False)
    token = Column(Text, nullable=False, unique=True)
    is_active = Column(Boolean, default=True)

    user = relationship("AppUser", back_populates="refresh_tokens")


class DealerProfilePicture(Base):
    __tablename__ = "dealer_profile_picture"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    user_id = Column(UUID(as_uuid=False), ForeignKey("app_user.id", ondelete="CASCADE"), nullable=False, unique=True)
    file_path = Column(String(500), nullable=False)

    user = relationship("AppUser", back_populates="profile_picture")


class PdfBrand(Base):
    __tablename__ = "pdf_brand"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    user_id = Column(UUID(as_uuid=False), ForeignKey("app_user.id", ondelete="CASCADE"), nullable=False, unique=True)
    brand_name = Column(String(255), nullable=True)
    file_path = Column(String(500), nullable=True)

    user = relationship("AppUser", back_populates="pdf_brand")


class PdfTitleTemplate(Base):
    __tablename__ = "pdf_title_template"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    user_id = Column(UUID(as_uuid=False), ForeignKey("app_user.id", ondelete="CASCADE"), nullable=False)
    key = Column(String(100), nullable=False)
    value = Column(String(500), nullable=True)

    user = relationship("AppUser", back_populates="pdf_title_templates")


class ProjectCodeRule(Base):
    __tablename__ = "project_code_rule"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    user_id = Column(UUID(as_uuid=False), ForeignKey("app_user.id", ondelete="CASCADE"), nullable=False, unique=True)
    prefix = Column(String(20), nullable=True)
    padding = Column(String(10), nullable=True, default="4")
    separator = Column(String(5), nullable=True, default="-")

    user = relationship("AppUser", back_populates="project_code_rule")


class ProjectCodeLedger(Base):
    __tablename__ = "project_code_ledger"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    owner_id = Column(UUID(as_uuid=False), ForeignKey("app_user.id", ondelete="CASCADE"), nullable=False)
    number = Column(String(50), nullable=False)
    project_id = Column(UUID(as_uuid=False), ForeignKey("project.id", ondelete="SET NULL"), nullable=True)

    owner = relationship("AppUser", back_populates="project_code_ledger")
    project = relationship("Project", back_populates="code_ledger_entry")


class CalculationHelper(Base):
    __tablename__ = "calculation_helper"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    user_id = Column(UUID(as_uuid=False), ForeignKey("app_user.id", ondelete="CASCADE"), nullable=False, unique=True)
    param_key = Column(String(100), nullable=False)
    param_value = Column(Numeric(precision=18, scale=6), nullable=True)
    description = Column(Text, nullable=True)

    user = relationship("AppUser", back_populates="calculation_helper")
