from typing import Literal

from pydantic import BaseModel, Field


# --------------------
# Property types
# --------------------

PropertyType = Literal[
    "apartment",
    "new_building",
    "house",
    "land",
    "commercial",
    "garage",
]


# --------------------
# Properties
# --------------------

class PropertyCreate(BaseModel):
    title: str
    description: str

    price: int
    area: float
    rooms: int

    city: str
    district: str
    address: str

    property_type: PropertyType = "apartment"
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

    property_type: PropertyType = "apartment"
    status: str = "Свободен"


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
    status: str | None = None
    image_url: str | None = None

    class Config:
        from_attributes = True


# --------------------
# Leads
# --------------------

class LeadCreate(BaseModel):
    property_id: int | None = None
    name: str = Field(..., min_length=2)
    phone: str = Field(..., min_length=6)
    comment: str | None = None


class LeadUpdate(BaseModel):
    name: str
    phone: str
    comment: str | None = None
    status: str


# --------------------
# Clients
# --------------------

class ClientUpdate(BaseModel):
    name: str
    phone: str
    email: str | None = None
    status: str
    notes: str | None = None


# --------------------
# Sales
# --------------------

class SaleCreate(BaseModel):
    client_id: int
    property_id: int
    amount: int


class SaleUpdate(BaseModel):
    client_id: int
    property_id: int
    amount: int
    status: str