from datetime import datetime
from typing import Optional

from pydantic import BaseModel
from sqlalchemy import (
    BigInteger,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
)

from .database import Base


# =========================================================
# Дополнительные схемы
# =========================================================

class LeadUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    comment: Optional[str] = None
    status: Optional[str] = None


class LeadStatusUpdate(BaseModel):
    status: str


# =========================================================
# Properties
# =========================================================

class Property(Base):
    __tablename__ = "properties"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    title = Column(
        String,
        nullable=False,
    )

    description = Column(
        Text,
        nullable=True,
    )

    price = Column(
        BigInteger,
        nullable=False,
        default=0,
    )

    area = Column(
        Numeric,
        nullable=False,
        default=0,
    )

    rooms = Column(
        Integer,
        nullable=False,
        default=1,
    )

    city = Column(
        String,
        nullable=True,
    )

    district = Column(
        String,
        nullable=True,
    )

    address = Column(
        Text,
        nullable=True,
    )

    # -----------------------------------------------------
    # Основной тип недвижимости
    #
    # apartment   = Квартира
    # house       = Дом
    # land        = Земельный участок
    # commercial  = Коммерческая недвижимость
    # garage      = Гараж
    # -----------------------------------------------------

    property_type = Column(
        String(50),
        nullable=False,
        default="apartment",
    )

    # -----------------------------------------------------
    # Подтип недвижимости
    #
    # secondary
    # new_building
    # studio
    # 1_room
    # 2_room
    # 3_room
    # townhouse
    # duplex
    # cottage
    # izhs
    # gardening
    # office
    # warehouse
    # parking
    # и т.д.
    # -----------------------------------------------------

    property_subtype = Column(
        String(80),
        nullable=False,
        default="secondary",
    )

    # -----------------------------------------------------
    # Тип сделки
    #
    # sale  = Продать
    # rent  = Снять
    # lease = Сдать
    # -----------------------------------------------------

    deal_type = Column(
        String(20),
        nullable=False,
        default="sale",
    )

    latitude = Column(
        Float,
        nullable=True,
    )

    longitude = Column(
        Float,
        nullable=True,
    )

    status = Column(
        String,
        nullable=False,
        default="Свободен",
    )

    image_url = Column(
        String,
        nullable=True,
    )


# =========================================================
# Clients
# =========================================================

class Client(Base):
    __tablename__ = "clients"

    id = Column(
        Integer,
        primary_key=True,
    )

    name = Column(
        String,
        nullable=True,
    )

    phone = Column(
        String,
        nullable=True,
    )

    email = Column(
        String,
        nullable=True,
    )

    status = Column(
        String,
        default="Новый",
    )

    notes = Column(
        Text,
        nullable=True,
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
    )


# =========================================================
# Sales
# =========================================================

class Sale(Base):
    __tablename__ = "sales"

    id = Column(
        Integer,
        primary_key=True,
    )

    client_id = Column(
        Integer,
        ForeignKey("clients.id"),
    )

    property_id = Column(
        Integer,
        ForeignKey("properties.id"),
    )

    amount = Column(
        BigInteger,
    )

    status = Column(
        String,
        default="В работе",
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
    )


# =========================================================
# Leads
# =========================================================

class Lead(Base):
    __tablename__ = "leads"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    property_id = Column(
        Integer,
        ForeignKey("properties.id"),
        nullable=True,
    )

    name = Column(
        String(255),
        nullable=False,
    )

    phone = Column(
        String(50),
        nullable=False,
    )

    comment = Column(
        Text,
        nullable=True,
    )

    status = Column(
        String,
        default="Новая",
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
    )


# =========================================================
# Property Images
# =========================================================

class PropertyImage(Base):
    __tablename__ = "property_images"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    property_id = Column(
        Integer,
        ForeignKey("properties.id"),
        nullable=False,
    )

    image_url = Column(
        String,
        nullable=False,
    )


# =========================================================
# Users
# =========================================================

class User(Base):
    __tablename__ = "users"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    username = Column(
        String,
        unique=True,
        nullable=False,
    )

    password_hash = Column(
        String,
        nullable=False,
    )

    role = Column(
        String,
        default="admin",
    )