import uuid
from sqlalchemy import Column, String, Boolean, ForeignKey, Integer, Text, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.database import Base


def gen_uuid():
    return str(uuid.uuid4())


class System(Base):
    __tablename__ = "system"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    name = Column(String(200), unique=True, nullable=False)
    is_published = Column(Boolean, default=True)
    is_active = Column(Boolean, default=True)
    sort_index = Column(Integer, default=0)
    photo_path = Column(String(500), nullable=True)

    variants = relationship("SystemVariant", back_populates="system", cascade="all, delete-orphan")


class SystemVariant(Base):
    __tablename__ = "system_variant"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    system_id = Column(UUID(as_uuid=False), ForeignKey("system.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(200), nullable=False)
    is_published = Column(Boolean, default=True)
    is_active = Column(Boolean, default=True)
    sort_index = Column(Integer, default=0)
    photo_path = Column(String(500), nullable=True)
    pdf_photo_path = Column(String(500), nullable=True)

    system = relationship("System", back_populates="variants")
    profile_templates = relationship("SystemProfileTemplate", back_populates="variant", cascade="all, delete-orphan")
    glass_templates = relationship("SystemGlassTemplate", back_populates="variant", cascade="all, delete-orphan")
    material_templates = relationship("SystemMaterialTemplate", back_populates="variant", cascade="all, delete-orphan")
    remote_templates = relationship("SystemRemoteTemplate", back_populates="variant", cascade="all, delete-orphan")
    project_systems = relationship("ProjectSystem", back_populates="variant")


class SystemProfileTemplate(Base):
    __tablename__ = "system_profile_template"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    variant_id = Column(UUID(as_uuid=False), ForeignKey("system_variant.id", ondelete="CASCADE"), nullable=False)
    profile_id = Column(UUID(as_uuid=False), ForeignKey("profile.id", ondelete="CASCADE"), nullable=False)
    formula_cut_length = Column(String(500), nullable=False)
    formula_cut_count = Column(String(500), nullable=False)
    is_painted = Column(Boolean, default=False)
    pdf_flags = Column(JSON, nullable=True)

    variant = relationship("SystemVariant", back_populates="profile_templates")
    profile = relationship("Profile", back_populates="system_templates")


class SystemGlassTemplate(Base):
    __tablename__ = "system_glass_template"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    variant_id = Column(UUID(as_uuid=False), ForeignKey("system_variant.id", ondelete="CASCADE"), nullable=False)
    glass_type_id = Column(UUID(as_uuid=False), ForeignKey("glass_type.id", ondelete="CASCADE"), nullable=False)
    formula_width = Column(String(500), nullable=False)
    formula_height = Column(String(500), nullable=False)
    formula_count = Column(String(500), nullable=False)
    default_color_id = Column(UUID(as_uuid=False), ForeignKey("color.id", ondelete="SET NULL"), nullable=True)
    pdf_flags = Column(JSON, nullable=True)

    variant = relationship("SystemVariant", back_populates="glass_templates")
    glass_type = relationship("GlassType", back_populates="system_templates")
    default_color = relationship("Color", back_populates="glass_templates", foreign_keys=[default_color_id])


class SystemMaterialTemplate(Base):
    __tablename__ = "system_material_template"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    variant_id = Column(UUID(as_uuid=False), ForeignKey("system_variant.id", ondelete="CASCADE"), nullable=False)
    material_id = Column(UUID(as_uuid=False), ForeignKey("other_material.id", ondelete="CASCADE"), nullable=False)
    formula_quantity = Column(String(500), nullable=False)
    formula_cut_length = Column(String(500), nullable=True)
    unit_price = Column(String(500), nullable=True)
    pdf_flags = Column(JSON, nullable=True)

    variant = relationship("SystemVariant", back_populates="material_templates")
    material = relationship("OtherMaterial", back_populates="system_templates")


class SystemRemoteTemplate(Base):
    __tablename__ = "system_remote_template"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    variant_id = Column(UUID(as_uuid=False), ForeignKey("system_variant.id", ondelete="CASCADE"), nullable=False)
    remote_id = Column(UUID(as_uuid=False), ForeignKey("remote.id", ondelete="CASCADE"), nullable=False)
    order_index = Column(Integer, default=0)
    pdf_flags = Column(JSON, nullable=True)

    variant = relationship("SystemVariant", back_populates="remote_templates")
    remote = relationship("Remote", back_populates="system_templates")
