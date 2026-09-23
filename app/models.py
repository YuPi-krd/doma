from sqlalchemy import Column, Integer, String, Text, BigInteger, Numeric
from .database import Base
from sqlalchemy import Column, Integer, String, Text, DateTime
from datetime import datetime
from sqlalchemy import DateTime
from app.database import engine
from sqlalchemy import ForeignKey
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.orm import relationship


class LeadUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    comment: Optional[str] = None
    status: Optional[str] = None



class Property(Base):
    __tablename__ = "properties"

    id = Column(Integer, primary_key=True, index=True)

    title = Column(String, nullable=False)

    description = Column(Text)

    price = Column(
        BigInteger,
        nullable=False,
        default=0
    )

    area = Column(
        Numeric,
        nullable=False,
        default=0
    )

    rooms = Column(
        Integer,
        nullable=False,
        default=1
    )

    city = Column(String)

    district = Column(String)

    address = Column(Text)

    status = Column(
        String,
        default="Свободен"
    )

    image_url = Column(
        String,
        nullable=True
    )

class Client(Base):
    __tablename__ = "clients"

    id = Column(Integer, primary_key=True)

    name = Column(String)
    phone = Column(String)

    email = Column(String, nullable=True)

    status = Column(
        String,
        default="Новый"
    )

    notes = Column(
        Text,
        nullable=True
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

class Sale(Base):
    __tablename__ = "sales"

    id = Column(Integer, primary_key=True)

    client_id = Column(
        Integer,
        ForeignKey("clients.id")
    )

    property_id = Column(
        Integer,
        ForeignKey("properties.id")
    )

    amount = Column(BigInteger)

    status = Column(
        String,
        default="В работе"
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

image_url = Column(
    String,
    nullable=True
)

class Lead(Base):
    __tablename__ = "leads"

    id = Column(Integer, primary_key=True, index=True)

    property_id = Column(Integer)

    name = Column(String(255), nullable=False)

    phone = Column(String(50), nullable=False)

    comment = Column(Text)

    status = Column(
        String,
        default="Новая"
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

class LeadStatusUpdate(BaseModel):
    status: str

class PropertyImage(Base):
    __tablename__ = "property_images"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    property_id = Column(
        Integer,
        ForeignKey("properties.id")
    )

    image_url = Column(String)

class User(Base):
    __tablename__ = "users"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    username = Column(
        String,
        unique=True,
        nullable=False
    )

    password_hash = Column(
        String,
        nullable=False
    )

    role = Column(
        String,
        default="admin"
    )