import uuid
from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.database import Base


def gen_uuid():
    return str(uuid.uuid4())


class Customer(Base):
    __tablename__ = "customer"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    user_id = Column(UUID(as_uuid=False), ForeignKey("app_user.id", ondelete="CASCADE"), nullable=False)
    company_name = Column(String(300), nullable=True)
    name = Column(String(200), nullable=False)
    phone = Column(String(50), nullable=True)
    email = Column(String(200), nullable=True)
    address = Column(String(500), nullable=True)

    owner = relationship("AppUser", back_populates="customers")
    projects = relationship("Project", back_populates="customer")
    sales_orders = relationship("SalesOrder", back_populates="for_customer")
