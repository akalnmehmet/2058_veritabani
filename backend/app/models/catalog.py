import uuid
from sqlalchemy import Column, String, Boolean, ForeignKey, Numeric, Integer, Float
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.database import Base


def gen_uuid():
    return str(uuid.uuid4())


class Color(Base):
    __tablename__ = "color"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    name = Column(String(200), nullable=False)
    type = Column(String(50), nullable=True)  # profil | cam
    unit_cost = Column(Numeric(precision=12, scale=4), nullable=True, default=0)
    is_default = Column(Boolean, default=False)

    # Relations
    profiles = relationship("Profile", back_populates="color")
    glass_templates = relationship("SystemGlassTemplate", back_populates="default_color", foreign_keys="SystemGlassTemplate.default_color_id")
    projects_profile_color = relationship("Project", back_populates="profile_color", foreign_keys="Project.profile_color_id")
    projects_glass_color = relationship("Project", back_populates="glass_color", foreign_keys="Project.glass_color_id")


class Profile(Base):
    __tablename__ = "profile"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    profil_kodu = Column(String(100), nullable=True)
    profil_isim = Column(String(200), nullable=False)
    unit_price = Column(Numeric(precision=12, scale=4), nullable=True, default=0)
    color_id = Column(UUID(as_uuid=False), ForeignKey("color.id", ondelete="SET NULL"), nullable=True)

    color = relationship("Color", back_populates="profiles")
    system_templates = relationship("SystemProfileTemplate", back_populates="profile")
    extra_profiles = relationship("ProjectExtraProfile", back_populates="profile")


class GlassType(Base):
    __tablename__ = "glass_type"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    cam_isim = Column(String(200), nullable=False)
    thickness_mm = Column(Float, nullable=True)
    belirtec_1 = Column(String(100), nullable=True)
    belirtec_2 = Column(String(100), nullable=True)

    system_templates = relationship("SystemGlassTemplate", back_populates="glass_type")
    extra_glasses = relationship("ProjectExtraGlass", back_populates="glass_type")


class OtherMaterial(Base):
    __tablename__ = "other_material"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    diger_malzeme_isim = Column(String(200), nullable=False)
    birim = Column(String(50), nullable=True)
    unit_price = Column(Numeric(precision=12, scale=4), nullable=True, default=0)

    system_templates = relationship("SystemMaterialTemplate", back_populates="material")
    extra_materials = relationship("ProjectExtraMaterial", back_populates="material")


class Remote(Base):
    __tablename__ = "remote"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    kumanda_isim = Column(String(200), nullable=False)
    price = Column(Numeric(precision=12, scale=4), nullable=True, default=0)
    kapasite = Column(String(100), nullable=True)

    system_templates = relationship("SystemRemoteTemplate", back_populates="remote")
    extra_remotes = relationship("ProjectExtraRemote", back_populates="remote")
