import uuid
from sqlalchemy import Column, String, Boolean, ForeignKey, Integer, Numeric, Float, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.database import Base


def gen_uuid():
    return str(uuid.uuid4())


class Project(Base):
    __tablename__ = "project"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    project_kodu = Column(String(100), unique=True, nullable=True)
    project_name = Column(String(300), nullable=False)
    press_price = Column(Numeric(precision=14, scale=4), nullable=True, default=0)
    painted_price = Column(Numeric(precision=14, scale=4), nullable=True, default=0)
    is_teklif = Column(Boolean, default=True)
    paint_status = Column(Boolean, default=False)
    glass_status = Column(Boolean, default=False)
    production_status = Column(Boolean, default=False)
    created_by = Column(UUID(as_uuid=False), ForeignKey("app_user.id", ondelete="SET NULL"), nullable=True)
    customer_id = Column(UUID(as_uuid=False), ForeignKey("customer.id", ondelete="SET NULL"), nullable=True)
    profile_color_id = Column(UUID(as_uuid=False), ForeignKey("color.id", ondelete="SET NULL"), nullable=True)
    glass_color_id = Column(UUID(as_uuid=False), ForeignKey("color.id", ondelete="SET NULL"), nullable=True)

    creator = relationship("AppUser", back_populates="projects", foreign_keys=[created_by])
    customer = relationship("Customer", back_populates="projects")
    profile_color = relationship("Color", back_populates="projects_profile_color", foreign_keys=[profile_color_id])
    glass_color = relationship("Color", back_populates="projects_glass_color", foreign_keys=[glass_color_id])
    systems = relationship("ProjectSystem", back_populates="project", cascade="all, delete-orphan")
    extra_profiles = relationship("ProjectExtraProfile", back_populates="project", cascade="all, delete-orphan")
    extra_glasses = relationship("ProjectExtraGlass", back_populates="project", cascade="all, delete-orphan")
    extra_materials = relationship("ProjectExtraMaterial", back_populates="project", cascade="all, delete-orphan")
    extra_remotes = relationship("ProjectExtraRemote", back_populates="project", cascade="all, delete-orphan")
    code_ledger_entry = relationship("ProjectCodeLedger", back_populates="project", uselist=False)
    sales_orders = relationship("SalesOrder", back_populates="from_project")


class ProjectSystem(Base):
    __tablename__ = "project_system"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    project_id = Column(UUID(as_uuid=False), ForeignKey("project.id", ondelete="CASCADE"), nullable=False)
    variant_id = Column(UUID(as_uuid=False), ForeignKey("system_variant.id", ondelete="SET NULL"), nullable=True)
    width_mm = Column(Float, nullable=True)
    height_mm = Column(Float, nullable=True)
    quantity = Column(Integer, default=1)
    display_order = Column(Integer, default=0)

    project = relationship("Project", back_populates="systems")
    variant = relationship("SystemVariant", back_populates="project_systems")
    profiles = relationship("ProjectSystemProfile", back_populates="project_system", cascade="all, delete-orphan")
    glasses = relationship("ProjectSystemGlass", back_populates="project_system", cascade="all, delete-orphan")
    materials = relationship("ProjectSystemMaterial", back_populates="project_system", cascade="all, delete-orphan")
    remotes = relationship("ProjectSystemRemote", back_populates="project_system", cascade="all, delete-orphan")
    order_items = relationship("OrderItem", back_populates="project_system")


class ProjectSystemProfile(Base):
    __tablename__ = "project_system_profile"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    project_system_id = Column(UUID(as_uuid=False), ForeignKey("project_system.id", ondelete="CASCADE"), nullable=False)
    profile_id = Column(UUID(as_uuid=False), ForeignKey("profile.id", ondelete="SET NULL"), nullable=True)
    cut_length = Column(Float, nullable=True)
    cut_count = Column(Float, nullable=True)
    weight = Column(Float, nullable=True)
    price = Column(Numeric(precision=12, scale=4), nullable=True)
    is_painted = Column(Boolean, default=False)
    pdf_flags = Column(JSON, nullable=True)

    project_system = relationship("ProjectSystem", back_populates="profiles")
    profile = relationship("Profile")


class ProjectSystemGlass(Base):
    __tablename__ = "project_system_glass"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    project_system_id = Column(UUID(as_uuid=False), ForeignKey("project_system.id", ondelete="CASCADE"), nullable=False)
    glass_type_id = Column(UUID(as_uuid=False), ForeignKey("glass_type.id", ondelete="SET NULL"), nullable=True)
    width = Column(Float, nullable=True)
    height = Column(Float, nullable=True)
    count = Column(Float, nullable=True)
    area = Column(Float, nullable=True)
    price = Column(Numeric(precision=12, scale=4), nullable=True)
    glass_color_1_id = Column(UUID(as_uuid=False), ForeignKey("color.id", ondelete="SET NULL"), nullable=True)
    glass_color_2_id = Column(UUID(as_uuid=False), ForeignKey("color.id", ondelete="SET NULL"), nullable=True)
    pdf_flags = Column(JSON, nullable=True)

    project_system = relationship("ProjectSystem", back_populates="glasses")
    glass_type = relationship("GlassType")
    glass_color_1 = relationship("Color", foreign_keys=[glass_color_1_id])
    glass_color_2 = relationship("Color", foreign_keys=[glass_color_2_id])


class ProjectSystemMaterial(Base):
    __tablename__ = "project_system_material"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    project_system_id = Column(UUID(as_uuid=False), ForeignKey("project_system.id", ondelete="CASCADE"), nullable=False)
    material_id = Column(UUID(as_uuid=False), ForeignKey("other_material.id", ondelete="SET NULL"), nullable=True)
    count = Column(Float, nullable=True)
    cut_length = Column(Float, nullable=True)
    type = Column(String(100), nullable=True)
    piece_length = Column(Float, nullable=True)
    price = Column(Numeric(precision=12, scale=4), nullable=True)
    pdf_flags = Column(JSON, nullable=True)

    project_system = relationship("ProjectSystem", back_populates="materials")
    material = relationship("OtherMaterial")


class ProjectSystemRemote(Base):
    __tablename__ = "project_system_remote"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    project_system_id = Column(UUID(as_uuid=False), ForeignKey("project_system.id", ondelete="CASCADE"), nullable=False)
    remote_id = Column(UUID(as_uuid=False), ForeignKey("remote.id", ondelete="SET NULL"), nullable=True)
    count = Column(Integer, default=1)
    price = Column(Numeric(precision=12, scale=4), nullable=True)
    order_index = Column(Integer, default=0)
    pdf_flags = Column(JSON, nullable=True)

    project_system = relationship("ProjectSystem", back_populates="remotes")
    remote = relationship("Remote")


# ---- EXTRA tables ----

class ProjectExtraProfile(Base):
    __tablename__ = "project_extra_profile"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    project_id = Column(UUID(as_uuid=False), ForeignKey("project.id", ondelete="CASCADE"), nullable=False)
    profile_id = Column(UUID(as_uuid=False), ForeignKey("profile.id", ondelete="SET NULL"), nullable=True)
    cut_length = Column(Float, nullable=True)
    cut_count = Column(Float, nullable=True)
    is_painted = Column(Boolean, default=False)
    price = Column(Numeric(precision=12, scale=4), nullable=True)
    pdf_flags = Column(JSON, nullable=True)

    project = relationship("Project", back_populates="extra_profiles")
    profile = relationship("Profile", back_populates="extra_profiles")


class ProjectExtraGlass(Base):
    __tablename__ = "project_extra_glass"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    project_id = Column(UUID(as_uuid=False), ForeignKey("project.id", ondelete="CASCADE"), nullable=False)
    glass_type_id = Column(UUID(as_uuid=False), ForeignKey("glass_type.id", ondelete="SET NULL"), nullable=True)
    width = Column(Float, nullable=True)
    height = Column(Float, nullable=True)
    count = Column(Float, nullable=True)
    area = Column(Float, nullable=True)
    price = Column(Numeric(precision=12, scale=4), nullable=True)
    glass_color_1_id = Column(UUID(as_uuid=False), ForeignKey("color.id", ondelete="SET NULL"), nullable=True)
    glass_color_2_id = Column(UUID(as_uuid=False), ForeignKey("color.id", ondelete="SET NULL"), nullable=True)
    pdf_flags = Column(JSON, nullable=True)

    project = relationship("Project", back_populates="extra_glasses")
    glass_type = relationship("GlassType", back_populates="extra_glasses")
    glass_color_1 = relationship("Color", foreign_keys=[glass_color_1_id])
    glass_color_2 = relationship("Color", foreign_keys=[glass_color_2_id])


class ProjectExtraMaterial(Base):
    __tablename__ = "project_extra_material"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    project_id = Column(UUID(as_uuid=False), ForeignKey("project.id", ondelete="CASCADE"), nullable=False)
    material_id = Column(UUID(as_uuid=False), ForeignKey("other_material.id", ondelete="SET NULL"), nullable=True)
    count = Column(Float, nullable=True)
    cut_length = Column(Float, nullable=True)
    price = Column(Numeric(precision=12, scale=4), nullable=True)
    pdf_flags = Column(JSON, nullable=True)

    project = relationship("Project", back_populates="extra_materials")
    material = relationship("OtherMaterial", back_populates="extra_materials")


class ProjectExtraRemote(Base):
    __tablename__ = "project_extra_remote"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    project_id = Column(UUID(as_uuid=False), ForeignKey("project.id", ondelete="CASCADE"), nullable=False)
    remote_id = Column(UUID(as_uuid=False), ForeignKey("remote.id", ondelete="SET NULL"), nullable=True)
    count = Column(Integer, default=1)
    price = Column(Numeric(precision=12, scale=4), nullable=True)
    pdf_flags = Column(JSON, nullable=True)

    project = relationship("Project", back_populates="extra_remotes")
    remote = relationship("Remote", back_populates="extra_remotes")
