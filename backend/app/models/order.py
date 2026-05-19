import uuid
from sqlalchemy import Column, String, ForeignKey, Integer, Float, Numeric, JSON, Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.database import Base
import enum


def gen_uuid():
    return str(uuid.uuid4())


class OrderStatus(str, enum.Enum):
    draft = "draft"
    confirmed = "confirmed"
    in_production = "in_production"
    completed = "completed"
    cancelled = "cancelled"


class SalesOrder(Base):
    __tablename__ = "sales_order"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    order_no = Column(String(100), unique=True, nullable=True)
    order_name = Column(String(300), nullable=True)
    order_date = Column(String(50), nullable=True)
    status = Column(String(50), default="draft", nullable=False)
    created_by = Column(UUID(as_uuid=False), ForeignKey("app_user.id", ondelete="SET NULL"), nullable=True)
    customer_id = Column(UUID(as_uuid=False), ForeignKey("customer.id", ondelete="SET NULL"), nullable=True)
    project_id = Column(UUID(as_uuid=False), ForeignKey("project.id", ondelete="SET NULL"), nullable=True)

    creator = relationship("AppUser", back_populates="sales_orders", foreign_keys=[created_by])
    for_customer = relationship("Customer", back_populates="sales_orders")
    from_project = relationship("Project", back_populates="sales_orders")
    items = relationship("OrderItem", back_populates="sales_order", cascade="all, delete-orphan")


class OrderItem(Base):
    __tablename__ = "order_item"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    sales_order_id = Column(UUID(as_uuid=False), ForeignKey("sales_order.id", ondelete="CASCADE"), nullable=False)
    project_system_id = Column(UUID(as_uuid=False), ForeignKey("project_system.id", ondelete="SET NULL"), nullable=True)
    color_id = Column(UUID(as_uuid=False), ForeignKey("color.id", ondelete="SET NULL"), nullable=True)
    width_mm = Column(Float, nullable=True)
    height_mm = Column(Float, nullable=True)
    quantity = Column(Integer, default=1)
    display_order = Column(Integer, default=0)

    sales_order = relationship("SalesOrder", back_populates="items")
    project_system = relationship("ProjectSystem", back_populates="order_items")
    color = relationship("Color")
    profiles = relationship("OrderItemProfile", back_populates="order_item", cascade="all, delete-orphan")
    glasses = relationship("OrderItemGlass", back_populates="order_item", cascade="all, delete-orphan")
    materials = relationship("OrderItemMaterial", back_populates="order_item", cascade="all, delete-orphan")
    extra_materials = relationship("OrderItemExtraMaterial", back_populates="order_item", cascade="all, delete-orphan")
    extra_profiles = relationship("OrderItemExtraProfile", back_populates="order_item", cascade="all, delete-orphan")
    extra_glasses = relationship("OrderItemExtraGlass", back_populates="order_item", cascade="all, delete-orphan")
    extra_remotes = relationship("OrderItemExtraRemote", back_populates="order_item", cascade="all, delete-orphan")


class OrderItemProfile(Base):
    __tablename__ = "order_item_profile"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    order_item_id = Column(UUID(as_uuid=False), ForeignKey("order_item.id", ondelete="CASCADE"), nullable=False)
    profile_id = Column(UUID(as_uuid=False), ForeignKey("profile.id", ondelete="SET NULL"), nullable=True)
    cut_length = Column(Float, nullable=True)
    cut_count = Column(Float, nullable=True)
    weight = Column(Float, nullable=True)

    order_item = relationship("OrderItem", back_populates="profiles")
    profile = relationship("Profile")


class OrderItemGlass(Base):
    __tablename__ = "order_item_glass"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    order_item_id = Column(UUID(as_uuid=False), ForeignKey("order_item.id", ondelete="CASCADE"), nullable=False)
    glass_type_id = Column(UUID(as_uuid=False), ForeignKey("glass_type.id", ondelete="SET NULL"), nullable=True)
    width = Column(Float, nullable=True)
    height = Column(Float, nullable=True)
    count = Column(Float, nullable=True)
    area = Column(Float, nullable=True)

    order_item = relationship("OrderItem", back_populates="glasses")
    glass_type = relationship("GlassType")


class OrderItemMaterial(Base):
    __tablename__ = "order_item_material"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    order_item_id = Column(UUID(as_uuid=False), ForeignKey("order_item.id", ondelete="CASCADE"), nullable=False)
    material_id = Column(UUID(as_uuid=False), ForeignKey("other_material.id", ondelete="SET NULL"), nullable=True)
    cut_length = Column(Float, nullable=True)
    count = Column(Float, nullable=True)

    order_item = relationship("OrderItem", back_populates="materials")
    material = relationship("OtherMaterial")


class OrderItemExtraMaterial(Base):
    __tablename__ = "order_item_extra_material"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    order_item_id = Column(UUID(as_uuid=False), ForeignKey("order_item.id", ondelete="CASCADE"), nullable=False)
    material_id = Column(UUID(as_uuid=False), ForeignKey("other_material.id", ondelete="SET NULL"), nullable=True)
    cut_length = Column(Float, nullable=True)
    count = Column(Float, nullable=True)

    order_item = relationship("OrderItem", back_populates="extra_materials")
    material = relationship("OtherMaterial")


class OrderItemExtraProfile(Base):
    __tablename__ = "order_item_extra_profile"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    order_item_id = Column(UUID(as_uuid=False), ForeignKey("order_item.id", ondelete="CASCADE"), nullable=False)
    profile_id = Column(UUID(as_uuid=False), ForeignKey("profile.id", ondelete="SET NULL"), nullable=True)
    cut_length = Column(Float, nullable=True)
    cut_count = Column(Float, nullable=True)

    order_item = relationship("OrderItem", back_populates="extra_profiles")
    profile = relationship("Profile")


class OrderItemExtraGlass(Base):
    __tablename__ = "order_item_extra_glass"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    order_item_id = Column(UUID(as_uuid=False), ForeignKey("order_item.id", ondelete="CASCADE"), nullable=False)
    glass_type_id = Column(UUID(as_uuid=False), ForeignKey("glass_type.id", ondelete="SET NULL"), nullable=True)
    width = Column(Float, nullable=True)
    height = Column(Float, nullable=True)
    count = Column(Float, nullable=True)
    area = Column(Float, nullable=True)

    order_item = relationship("OrderItem", back_populates="extra_glasses")
    glass_type = relationship("GlassType")


class OrderItemExtraRemote(Base):
    __tablename__ = "order_item_extra_remote"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    order_item_id = Column(UUID(as_uuid=False), ForeignKey("order_item.id", ondelete="CASCADE"), nullable=False)
    remote_id = Column(UUID(as_uuid=False), ForeignKey("remote.id", ondelete="SET NULL"), nullable=True)
    count = Column(Integer, default=1)

    order_item = relationship("OrderItem", back_populates="extra_remotes")
    remote = relationship("Remote")
