from typing import Literal

from pydantic import BaseModel, Field


# =========================================================
# Property types
# =========================================================

PropertyType = Literal[
    "apartment",
    "new_building",
    "house",
    "land",
    "commercial",
    "garage",
]


# =========================================================
# Property subtypes
# =========================================================

PropertySubtype = Literal[
    # Квартиры
    "secondary",
    "new_building",
    "studio",
    "1_room",
    "2_room",
    "3_room",
    "4_room",
    "5_room",
    "penthouse",

    # Дома
    "house",
    "part_of_house",
    "townhouse",
    "duplex",
    "cottage",
    "dacha",

    # Земельные участки
    "izhs",
    "gardening",
    "commercial_land",
    "lph",
    "dnp",

    # Коммерция
    "office",
    "business",
    "separate_building",
    "production",
    "warehouse",
    "retail",

    # Гаражи
    "garage_box",
    "residential_complex",
    "covered_parking",
    "separate_garage",
    "parking",
]


# =========================================================
# Deal types
# =========================================================

DealType = Literal[
    "sale",
    "rent",
    "lease",
]


# =========================================================
# Properties
# =========================================================

class PropertyCreate(BaseModel):
    title: str
    description: str

    price: int
    area: float
    rooms: int

    city: str
    district: str
    address: str

    # Основной тип
    property_type: PropertyType = "apartment"

    # Подтип
    property_subtype: PropertySubtype = "secondary"

    # Продажа / аренда / сдача
    deal_type: DealType = "sale"

    # Картинка
    image_url: str | None = None


class PropertyUpdate(BaseModel):
    title: str
    description: str

    price: int
    area: float
    rooms: int

    city: str
    district: str
    address: str

    # Основной тип
    property_type: PropertyType = "apartment"

    # Подтип
    property_subtype: PropertySubtype = "secondary"

    # Продажа / аренда / сдача
    deal_type: DealType = "sale"

    # Статус объекта
    status: str = "Свободен"

    # Картинка
    image_url: str | None = None


class PropertyResponse(BaseModel):
    id: int

    title: str
    description: str | None = None

    price: int
    area: float | None = None
    rooms: int | None = None

    city: str | None = None
    district: str | None = None
    address: str | None = None

    property_type: PropertyType = "apartment"

    property_subtype: PropertySubtype = "secondary"

    deal_type: DealType = "sale"

    status: str | None = None

    image_url: str | None = None

    class Config:
        from_attributes = True


# =========================================================
# Leads
# =========================================================

class LeadCreate(BaseModel):
    property_id: int | None = None

    name: str = Field(
        ...,
        min_length=2,
    )

    phone: str = Field(
        ...,
        min_length=6,
    )

    comment: str | None = None


class LeadUpdate(BaseModel):
    name: str
    phone: str
    comment: str | None = None
    status: str


# =========================================================
# Clients
# =========================================================

class ClientUpdate(BaseModel):
    name: str
    phone: str
    email: str | None = None
    status: str
    notes: str | None = None


# =========================================================
# Sales
# =========================================================

class SaleCreate(BaseModel):
    client_id: int
    property_id: int
    amount: int


class SaleUpdate(BaseModel):
    client_id: int
    property_id: int
    amount: int
    status: str