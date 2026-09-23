from pydantic import BaseModel, Field


# --------------------
# Properties
# --------------------

class PropertyCreate(BaseModel):
    title: str
    description: str
    price: int
    rooms: int
    city: str
    district: str
    address: str
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

    status: str


class PropertyResponse(BaseModel):
    id: int
    title: str
    description: str | None = None
    price: int
    rooms: int | None = None
    city: str | None = None
    district: str | None = None
    address: str | None = None

    class Config:
        from_attributes = True


# --------------------
# Leads
# --------------------

class LeadCreate(BaseModel):
    property_id: int

    name: str = Field(..., min_length=2)
    phone: str = Field(..., min_length=6)

    comment: str | None = None


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

class LeadUpdate(BaseModel):
    name: str
    phone: str
    comment: str | None = None
    status: str

class LeadCreate(BaseModel):
    property_id: int
    name: str
    phone: str
    comment: str | None = None