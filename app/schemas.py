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
    "sto",
    "hotel",
    "car_wash",
    "cafe",
    "shop",

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

    # Дополнительные характеристики объекта.
    floor: int | None = None
    total_floors: int | None = None
    bathroom: str | None = None
    balcony: str | None = None
    renovation: str | None = None
    building_material: str | None = None
    year_built: int | None = None
    room_layout: str | None = None
    living_area: float | None = None
    kitchen_area: float | None = None
    plot_area: float | None = None
    plot_length: float | None = None
    plot_width: float | None = None
    frontage: float | None = None
    land_purpose: str | None = None
    heating: str | None = None
    hot_water: str | None = None
    sewerage_type: str | None = None
    water_supply: str | None = None
    gas_supply: str | None = None
    amenities: str | None = None
    appliances: str | None = None
    roof_material: str | None = None
    plot_coverage: str | None = None
    fence_material: str | None = None
    ownership_certificate: str | None = None  # CRM only; never in public response.
    furniture: str | None = None
    ceiling_height: float | None = None
    condition: str | None = None
    source: str | None = None
    deal_date: str | None = None
    monthly_payment: int = 0
    has_maternal_capital: bool = False
    show_price_per_sqm: bool = False
    residential_complex: str | None = None
    cadastral_number: str | None = None
    land_cadastral_number: str | None = None
    metro: str | None = None


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

    floor: int | None = None
    total_floors: int | None = None
    bathroom: str | None = None
    balcony: str | None = None
    renovation: str | None = None
    building_material: str | None = None
    year_built: int | None = None
    room_layout: str | None = None
    living_area: float | None = None
    kitchen_area: float | None = None
    plot_area: float | None = None
    plot_length: float | None = None
    plot_width: float | None = None
    frontage: float | None = None
    land_purpose: str | None = None
    heating: str | None = None
    hot_water: str | None = None
    sewerage_type: str | None = None
    water_supply: str | None = None
    gas_supply: str | None = None
    amenities: str | None = None
    appliances: str | None = None
    roof_material: str | None = None
    plot_coverage: str | None = None
    fence_material: str | None = None
    ownership_certificate: str | None = None  # CRM only.
    furniture: str | None = None
    ceiling_height: float | None = None
    condition: str | None = None
    source: str | None = None
    deal_date: str | None = None
    monthly_payment: int = 0
    has_maternal_capital: bool = False
    show_price_per_sqm: bool = False
    residential_complex: str | None = None
    cadastral_number: str | None = None
    land_cadastral_number: str | None = None
    metro: str | None = None


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

    floor: int | None = None
    total_floors: int | None = None
    bathroom: str | None = None
    balcony: str | None = None
    renovation: str | None = None
    building_material: str | None = None
    year_built: int | None = None
    room_layout: str | None = None
    living_area: float | None = None
    kitchen_area: float | None = None
    plot_area: float | None = None
    plot_length: float | None = None
    plot_width: float | None = None
    frontage: float | None = None
    land_purpose: str | None = None
    heating: str | None = None
    hot_water: str | None = None
    sewerage_type: str | None = None
    water_supply: str | None = None
    gas_supply: str | None = None
    amenities: str | None = None
    appliances: str | None = None
    roof_material: str | None = None
    plot_coverage: str | None = None
    fence_material: str | None = None
    furniture: str | None = None
    ceiling_height: float | None = None
    condition: str | None = None

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