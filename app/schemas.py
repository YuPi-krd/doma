from typing import Literal

from pydantic import BaseModel, Field


# ============================================================
# PROPERTY TYPES
# ============================================================

PropertyType = Literal[
    "apartment",
    "new_building",
    "house",
    "land",
    "commercial",
    "garage",
]


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


DealType = Literal[
    "sale",
    "rent",
    "lease",
]


# ============================================================
# PROPERTIES
# ============================================================

class PropertyCreate(BaseModel):
    title: str
    description: str = ""

    is_draft: bool = True

    price: int
    area: float = 0
    rooms: int = 0

    city: str = ""
    district: str = ""
    address: str = ""

    property_type: PropertyType = (
        "apartment"
    )

    property_subtype: PropertySubtype = (
        "secondary"
    )

    deal_type: DealType = (
        "sale"
    )

    latitude: float | None = None
    longitude: float | None = None

    status: str = "Свободен"

    image_url: str | None = None

    # адрес для агента
    real_address: str = ""

    # адрес для рекламы
    public_address: str = ""

    # данные собственника
    owner_name: str = ""
    owner_phone: str = ""

    # комментарий агента
    agent_comment: str = ""


class PropertyUpdate(BaseModel):
    title: str
    description: str = ""

    price: int
    area: float = 0
    rooms: int = 0

    city: str = ""
    district: str = ""
    address: str = ""

    property_type: PropertyType = (
        "apartment"
    )

    property_subtype: PropertySubtype = (
        "secondary"
    )

    deal_type: DealType = (
        "sale"
    )

    latitude: float | None = None
    longitude: float | None = None

    status: str = "Свободен"

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

    property_type: PropertyType = (
        "apartment"
    )

    property_subtype: PropertySubtype = (
        "secondary"
    )

    deal_type: DealType = (
        "sale"
    )

    latitude: float | None = None
    longitude: float | None = None

    status: str | None = None

    image_url: str | None = None

    class Config:
        from_attributes = True


# ============================================================
# LEADS
# ============================================================

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


class LeadStatusUpdate(BaseModel):
    status: str


# ============================================================
# CLIENTS
# ============================================================

class ClientUpdate(BaseModel):
    name: str
    phone: str

    email: str | None = None

    status: str

    notes: str | None = None


# ============================================================
# SALES
# ============================================================

class SaleCreate(BaseModel):
    client_id: int
    property_id: int
    amount: int


class SaleUpdate(BaseModel):
    client_id: int
    property_id: int
    amount: int
    status: str