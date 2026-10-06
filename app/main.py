from datetime import datetime, timedelta
import json
import os
import shutil
import uuid
from pathlib import Path
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.parse import quote
from urllib.request import Request as UrlRequest
from urllib.request import urlopen

from fastapi import (
    FastAPI,
    File,
    Header,
    HTTPException,
    Query,
    Request,
    UploadFile,
    Depends,
)
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from jose import jwt
from passlib.context import CryptContext
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from .database import Base, SessionLocal, engine
from .database import get_db
from pydantic import BaseModel
from .models import (
    Client,
    Lead,
    Property,
    PropertyImage,
    Sale,
    User,
    SiteSettings
)
from .schemas import (
    ClientUpdate,
    LeadCreate,
    LeadStatusUpdate,
    SaleCreate,
    SaleUpdate,
)


# ============================================================
# CONFIG
# ============================================================

ALGORITHM = "HS256"

SECRET_KEY = os.getenv(
    "SECRET_KEY",
    "doma-development-secret-change-in-render",
)

YANDEX_GEOCODER_API_KEY = os.getenv(
    "YANDEX_GEOCODER_API_KEY",
    "",
)

CORS_ORIGINS = [
    "http://localhost:3000",
    "https://doma-fawn.vercel.app",
    "https://doma-lu0sdscvv-yu-pi.vercel.app",
]


# ============================================================
# PROPERTY TYPES
# ============================================================

PROPERTY_TYPES = {
    "apartment": "Квартира",
    "house": "Дом",
    "land": "Земельный участок",
    "commercial": "Коммерческая недвижимость",
    "garage": "Гараж",
}

PROPERTY_TYPE_ALIASES = {
    "flat": "apartment",
    "apartment": "apartment",
    "new_building": "apartment",
    "house": "house",
    "land": "land",
    "commercial": "commercial",
    "garage": "garage",
}

PROPERTY_SUBTYPES = {
    # Квартиры
    "secondary": "Вторичка",
    "new_building": "Новостройка",
    "studio": "Студия",
    "1_room": "1-комнатная",
    "2_room": "2-комнатная",
    "3_room": "3-комнатная",
    "4_room": "4-комнатная",
    "5_room": "5-комнатная",
    "penthouse": "Пентхаус",

    # Дома
    "house": "Дом",
    "part_of_house": "Часть дома",
    "townhouse": "Таунхаус",
    "duplex": "Дуплекс",
    "cottage": "Коттедж",
    "dacha": "Дача",

    # Земля
    "izhs": "ИЖС",
    "gardening": "Садоводство",
    "commercial_land": "Коммерческая",
    "lph": "ЛПХ",
    "dnp": "ДНП",

    # Коммерция
    "office": "Офисное",
    "business": "Готовый бизнес",
    "separate_building": "Отдельное здание",
    "production": "Производственное",
    "warehouse": "Складское",
    "retail": "Торговое помещение",

    # Гаражи
    "garage_box": "Бокс в гаражном кооперативе",
    "residential_complex": "Внутри жилого комплекса",
    "covered_parking": "Крытая стоянка",
    "separate_garage": "Отдельно стоящий гараж",
    "parking": "Отдельно стоящий паркинг",
}

DEAL_TYPES = {
    "sale": "Продажа",
    "rent": "Аренда",
    "lease": "Сдача",
}

DEAL_TYPE_ALIASES = {
    "buy": "sale",
    "sale": "sale",
    "sell": "sale",
    "rent": "rent",
    "lease": "lease",
}

DEFAULT_PROPERTY_TYPE = "apartment"
DEFAULT_PROPERTY_SUBTYPE = "secondary"
DEFAULT_DEAL_TYPE = "sale"
DEFAULT_STATUS = "Свободен"
DEFAULT_IMAGE = "/images/test-flat.jpg"


# ============================================================
# DATABASE / APP
# ============================================================

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="DOMA API",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# ENSURE MAP COLUMNS
# ============================================================

def ensure_property_coordinates() -> None:
    """
    Добавляет latitude/longitude в существующую таблицу,
    если их ещё нет.

    Это не заменяет поля в SQLAlchemy-модели.
    Поля также должны быть добавлены в models.py.
    """

    try:
        with engine.begin() as connection:
            connection.execute(
                text(
                    """
                    ALTER TABLE properties
                    ADD COLUMN IF NOT EXISTS
                    latitude DOUBLE PRECISION
                    """
                )
            )

            connection.execute(
                text(
                    """
                    ALTER TABLE properties
                    ADD COLUMN IF NOT EXISTS
                    longitude DOUBLE PRECISION
                    """
                )
            )

    except Exception as exc:
        print(
            "Не удалось проверить координаты properties:",
            exc,
        )


ensure_property_coordinates()


# ============================================================
# IMAGES
# ============================================================

BASE_DIR = (
    Path(__file__).resolve().parent.parent
)

IMAGE_DIR = BASE_DIR / "images"

IMAGE_DIR.mkdir(
    parents=True,
    exist_ok=True,
)

app.mount(
    "/images",
    StaticFiles(
        directory=IMAGE_DIR
    ),
    name="images",
)


# ============================================================
# AUTH
# ============================================================

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
)


class LoginSchema(
    __import__("pydantic").BaseModel
):
    username: str
    password: str


class SaleStatusUpdate(
    __import__("pydantic").BaseModel
):
    status: str


def create_access_token(
    data: dict[str, Any],
) -> str:

    payload = data.copy()

    payload["exp"] = (
        datetime.utcnow()
        + timedelta(days=7)
    )

    return jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM,
    )


def verify_password(
    plain_password: str,
    hashed_password: str,
) -> bool:

    return pwd_context.verify(
        plain_password,
        hashed_password,
    )


# ============================================================
# HELPERS
# ============================================================

def normalize_property_type(
    value: str | None,
) -> str:

    value = (
        value
        or DEFAULT_PROPERTY_TYPE
    ).strip().lower()

    result = PROPERTY_TYPE_ALIASES.get(
        value
    )

    if result is None:
        raise HTTPException(
            status_code=400,
            detail=(
                "Неизвестный тип недвижимости."
            ),
        )

    return result


def normalize_deal_type(
    value: str | None,
) -> str:

    value = (
        value
        or DEFAULT_DEAL_TYPE
    ).strip().lower()

    result = DEAL_TYPE_ALIASES.get(
        value
    )

    if result is None:
        raise HTTPException(
            status_code=400,
            detail=(
                "Неизвестный тип сделки."
            ),
        )

    return result


def normalize_property_subtype(
    value: str | None,
) -> str:

    value = (
        value
        or DEFAULT_PROPERTY_SUBTYPE
    ).strip().lower()

    if value not in PROPERTY_SUBTYPES:
        raise HTTPException(
            status_code=400,
            detail=(
                "Неизвестный подтип недвижимости."
            ),
        )

    return value


def text_value(
    value: Any,
    default: str = "",
) -> str:

    if value is None:
        return default

    return str(value).strip()


def to_int(
    value: Any,
    field_name: str,
    default: int | None = None,
) -> int:

    if value is None or value == "":
        if default is not None:
            return default

        raise HTTPException(
            status_code=400,
            detail=(
                f"Поле '{field_name}' "
                "обязательно."
            ),
        )

    try:
        return int(value)

    except (
        TypeError,
        ValueError,
    ):
        raise HTTPException(
            status_code=400,
            detail=(
                f"Поле '{field_name}' "
                "должно быть числом."
            ),
        )


def to_float(
    value: Any,
    field_name: str,
    default: float = 0,
) -> float:

    if value is None or value == "":
        return default

    try:
        return float(value)

    except (
        TypeError,
        ValueError,
    ):
        raise HTTPException(
            status_code=400,
            detail=(
                f"Поле '{field_name}' "
                "должно быть числом."
            ),
        )


def optional_float(
    value: Any,
    field_name: str,
) -> float | None:

    if value is None:
        return None

    if value == "":
        return None

    try:
        return float(value)

    except (
        TypeError,
        ValueError,
    ):
        raise HTTPException(
            status_code=400,
            detail=(
                f"Поле '{field_name}' "
                "должно быть числом."
            ),
        )


def delete_local_file(
    image_url: str | None,
) -> None:

    if not image_url:
        return

    filename = Path(
        image_url
    ).name

    if not filename:
        return

    path = IMAGE_DIR / filename

    try:
        if (
            path.exists()
            and path.is_file()
        ):
            path.unlink()

    except OSError:
        pass


async def save_upload(
    file: UploadFile,
) -> str:

    extension = Path(
        file.filename or "image"
    ).suffix.lower()

    allowed_extensions = {
        ".jpg",
        ".jpeg",
        ".png",
        ".webp",
        ".gif",
    }

    if extension not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=(
                "Поддерживаются только "
                "JPG, JPEG, PNG, WEBP и GIF."
            ),
        )

    filename = (
        f"{uuid.uuid4().hex}"
        f"{extension}"
    )

    path = (
        IMAGE_DIR / filename
    )

    with path.open("wb") as buffer:
        shutil.copyfileobj(
            file.file,
            buffer,
        )

    return (
        f"/images/{filename}"
    )


# ============================================================
# PROPERTY SERIALIZATION
# ============================================================

def property_to_dict(
    item: Property,
) -> dict[str, Any]:

    property_type = (
        item.property_type
        if item.property_type
        in PROPERTY_TYPES
        else DEFAULT_PROPERTY_TYPE
    )

    property_subtype = (
        item.property_subtype
        if item.property_subtype
        in PROPERTY_SUBTYPES
        else DEFAULT_PROPERTY_SUBTYPE
    )

    deal_type = (
        item.deal_type
        if item.deal_type
        in DEAL_TYPES
        else DEFAULT_DEAL_TYPE
    )

    latitude = getattr(
        item,
        "latitude",
        None,
    )

    longitude = getattr(
        item,
        "longitude",
        None,
    )

    return {
        "id":
            item.id,

        "title":
            item.title or "",

        "description":
            item.description or "",

        "price":
            int(item.price or 0),

        "area":
            float(item.area or 0),

        "rooms":
            int(item.rooms or 0),

        "city":
            item.city or "",

        "district":
            item.district or "",

        "address":
            item.address or "",

        "property_type":
            property_type,

        "property_type_label":
            PROPERTY_TYPES[
                property_type
            ],

        "property_subtype":
            property_subtype,

        "property_subtype_label":
            PROPERTY_SUBTYPES[
                property_subtype
            ],

        "deal_type":
            deal_type,

        "deal_type_label":
            DEAL_TYPES[
                deal_type
            ],

        "status":
            item.status
            or DEFAULT_STATUS,

        "image_url":
            item.image_url
            or DEFAULT_IMAGE,

        "latitude":
            (
                float(latitude)
                if latitude is not None
                else None
            ),

        "longitude":
            (
                float(longitude)
                if longitude is not None
                else None
            ),
    }


# ============================================================
# PROPERTY REQUEST PARSER
# ============================================================

async def read_property_request(
    request: Request,
) -> tuple[
    dict[str, Any],
    UploadFile | None,
]:

    content_type = (
        request.headers
        .get(
            "content-type",
            "",
        )
        .lower()
    )

    if (
        "multipart/form-data"
        in content_type
        or
        "application/x-www-form-urlencoded"
        in content_type
    ):

        form = await request.form()

        payload = {
            "title":
                form.get(
                    "title"
                ),

            "description":
                form.get(
                    "description",
                    "",
                ),

            "price":
                form.get(
                    "price"
                ),

            "area":
                form.get(
                    "area",
                    0,
                ),

            "rooms":
                form.get(
                    "rooms",
                    0,
                ),

            "city":
                form.get(
                    "city",
                    "",
                ),

            "district":
                form.get(
                    "district",
                    "",
                ),

            "address":
                form.get(
                    "address",
                    "",
                ),

            "property_type":
                form.get(
                    "property_type",
                    form.get(
                        "propertyType",
                        form.get(
                            "type",
                            DEFAULT_PROPERTY_TYPE,
                        ),
                    ),
                ),

            "property_subtype":
                form.get(
                    "property_subtype",
                    form.get(
                        "propertySubtype",
                        form.get(
                            "subtype",
                            DEFAULT_PROPERTY_SUBTYPE,
                        ),
                    ),
                ),

            "deal_type":
                form.get(
                    "deal_type",
                    form.get(
                        "dealType",
                        form.get(
                            "operation",
                            DEFAULT_DEAL_TYPE,
                        ),
                    ),
                ),

            "latitude":
                form.get(
                    "latitude"
                ),

            "longitude":
                form.get(
                    "longitude"
                ),

            "status":
                form.get(
                    "status",
                    DEFAULT_STATUS,
                ),

            "image_url":
                form.get(
                    "image_url"
                ),
        }

        image = form.get(
            "image"
        )

        if (
            image is not None
            and hasattr(
                image,
                "filename",
            )
        ):
            return (
                payload,
                image,
            )

        return (
            payload,
            None,
        )

    try:
        payload = await request.json()

    except Exception:
        payload = {}

    if not isinstance(
        payload,
        dict,
    ):
        raise HTTPException(
            status_code=400,
            detail=(
                "Некорректное тело запроса."
            ),
        )

    return (
        payload,
        None,
    )


# ============================================================
# PROPERTY VALIDATION
# ============================================================

def validate_property_payload(
    payload: dict[str, Any],
    existing: Property | None = None,
) -> dict[str, Any]:

    title = text_value(
        payload.get(
            "title",
            (
                existing.title
                if existing
                else None
            ),
        )
    )

    if not title:
        raise HTTPException(
            status_code=400,
            detail=(
                "Поле 'title' обязательно."
            ),
        )

    property_type = (
        normalize_property_type(
            payload.get(
                "property_type",
                (
                    existing.property_type
                    if existing
                    else DEFAULT_PROPERTY_TYPE
                ),
            )
        )
    )

    property_subtype = (
        normalize_property_subtype(
            payload.get(
                "property_subtype",
                (
                    existing.property_subtype
                    if existing
                    else DEFAULT_PROPERTY_SUBTYPE
                ),
            )
        )
    )

    deal_type = (
        normalize_deal_type(
            payload.get(
                "deal_type",
                (
                    existing.deal_type
                    if existing
                    else DEFAULT_DEAL_TYPE
                ),
            )
        )
    )

    if property_type == "apartment":

        allowed = {
            "secondary",
            "new_building",
            "studio",
            "1_room",
            "2_room",
            "3_room",
            "4_room",
            "5_room",
            "penthouse",
        }

        if property_subtype not in allowed:
            property_subtype = (
                DEFAULT_PROPERTY_SUBTYPE
            )

    elif property_type == "house":

        allowed = {
            "house",
            "part_of_house",
            "townhouse",
            "duplex",
            "cottage",
            "dacha",
        }

        if property_subtype not in allowed:
            property_subtype = "house"

    elif property_type == "land":

        allowed = {
            "izhs",
            "gardening",
            "commercial_land",
            "lph",
            "dnp",
        }

        if property_subtype not in allowed:
            property_subtype = "izhs"

    elif property_type == "commercial":

        allowed = {
            "office",
            "business",
            "separate_building",
            "production",
            "warehouse",
            "retail",
        }

        if property_subtype not in allowed:
            property_subtype = "office"

    elif property_type == "garage":

        allowed = {
            "garage_box",
            "residential_complex",
            "covered_parking",
            "separate_garage",
            "parking",
        }

        if property_subtype not in allowed:
            property_subtype = "garage_box"

    latitude = optional_float(
        payload.get(
            "latitude",
            (
                getattr(
                    existing,
                    "latitude",
                    None,
                )
                if existing
                else None
            ),
        ),
        "latitude",
    )

    longitude = optional_float(
        payload.get(
            "longitude",
            (
                getattr(
                    existing,
                    "longitude",
                    None,
                )
                if existing
                else None
            ),
        ),
        "longitude",
    )

    return {
        "title":
            title,

        "description":
            text_value(
                payload.get(
                    "description",
                    (
                        existing.description
                        if existing
                        else ""
                    ),
                )
            ),

        "price":
            to_int(
                payload.get(
                    "price",
                    (
                        existing.price
                        if existing
                        else 0
                    ),
                ),
                "price",
                0,
            ),

        "area":
            to_float(
                payload.get(
                    "area",
                    (
                        existing.area
                        if existing
                        else 0
                    ),
                ),
                "area",
                0,
            ),

        "rooms":
            to_int(
                payload.get(
                    "rooms",
                    (
                        existing.rooms
                        if existing
                        else 0
                    ),
                ),
                "rooms",
                0,
            ),

        "city":
            text_value(
                payload.get(
                    "city",
                    (
                        existing.city
                        if existing
                        else ""
                    ),
                )
            ),

        "district":
            text_value(
                payload.get(
                    "district",
                    (
                        existing.district
                        if existing
                        else ""
                    ),
                )
            ),

        "address":
            text_value(
                payload.get(
                    "address",
                    (
                        existing.address
                        if existing
                        else ""
                    ),
                )
            ),

        "property_type":
            property_type,

        "property_subtype":
            property_subtype,

        "deal_type":
            deal_type,

        "latitude":
            latitude,

        "longitude":
            longitude,

        "status":
            (
                text_value(
                    payload.get(
                        "status",
                        (
                            existing.status
                            if existing
                            else DEFAULT_STATUS
                        ),
                    ),
                    DEFAULT_STATUS,
                )
                or DEFAULT_STATUS
            ),

        "image_url":
            (
                text_value(
                    payload.get(
                        "image_url",
                        (
                            existing.image_url
                            if existing
                            else ""
                        ),
                    )
                )
                or None
            ),

        "real_address":
            text_value(
                payload.get(
                    "real_address",
                    (
                        existing.real_address
                        if existing
                        else ""
                    ),
                )
            ),

        "public_address":
            text_value(
                payload.get(
                    "public_address",
                    (
                        existing.public_address
                        if existing
                        else ""
                    ),
                )
            ),

        "owner_name":
            text_value(
                payload.get(
                    "owner_name",
                    (
                        existing.owner_name
                        if existing
                        else ""
                    ),
                )
            ),

        "owner_phone":
            text_value(
                payload.get(
                    "owner_phone",
                    (
                        existing.owner_phone
                        if existing
                        else ""
                    ),
                )
            ),

        "agent_comment":
            text_value(
                payload.get(
                    "agent_comment",
                    (
                        existing.agent_comment
                        if existing
                        else ""
                    ),
                )
            ),
    }


# ============================================================
# BASIC
# ============================================================

@app.get("/")
def root():

    return {
        "status": "ok",
        "service": "DOMA API",
    }


@app.get("/health")
def health():

    return {
        "status": "ok",
    }


# ============================================================
# TYPE DIRECTORIES
# ============================================================

@app.get("/property-types")
def get_property_types():

    return [
        {
            "value": key,
            "label": value,
        }
        for key, value
        in PROPERTY_TYPES.items()
    ]


@app.get("/property-subtypes")
def get_property_subtypes(
    property_type: str = Query(...),
):

    normalized = (
        normalize_property_type(
            property_type
        )
    )

    mapping = {
        "apartment": [
            "secondary",
            "new_building",
            "studio",
            "1_room",
            "2_room",
            "3_room",
            "4_room",
            "5_room",
            "penthouse",
        ],

        "house": [
            "house",
            "part_of_house",
            "townhouse",
            "duplex",
            "cottage",
            "dacha",
        ],

        "land": [
            "izhs",
            "gardening",
            "commercial_land",
            "lph",
            "dnp",
        ],

        "commercial": [
            "office",
            "business",
            "separate_building",
            "production",
            "warehouse",
            "retail",
        ],

        "garage": [
            "garage_box",
            "residential_complex",
            "covered_parking",
            "separate_garage",
            "parking",
        ],
    }

    return [
        {
            "value": subtype,
            "label":
                PROPERTY_SUBTYPES[
                    subtype
                ],
        }
        for subtype
        in mapping.get(
            normalized,
            [],
        )
    ]


@app.get("/deal-types")
def get_deal_types():

    return [
        {
            "value": key,
            "label": value,
        }
        for key, value
        in DEAL_TYPES.items()
    ]


# ============================================================
# PROPERTIES
# ============================================================

@app.get("/properties")
def get_properties(
    property_type: str | None = Query(
        default=None
    ),

    property_subtype: str | None = Query(
        default=None
    ),

    deal_type: str | None = Query(
        default=None
    ),

    type: str | None = Query(
        default=None
    ),
):

    db: Session = SessionLocal()

    try:
        query = db.query(
            Property
        )

        selected_type = (
            property_type
            or type
        )

        if selected_type:

            normalized_type = (
                normalize_property_type(
                    selected_type
                )
            )

            query = query.filter(
                Property.property_type
                == normalized_type
            )

        if property_subtype:

            normalized_subtype = (
                normalize_property_subtype(
                    property_subtype
                )
            )

            query = query.filter(
                Property.property_subtype
                == normalized_subtype
            )

        if deal_type:

            normalized_deal = (
                normalize_deal_type(
                    deal_type
                )
            )

            query = query.filter(
                Property.deal_type
                == normalized_deal
            )

        properties = (
            query
            .order_by(
                Property.id.desc()
            )
            .all()
        )

        return [
            property_to_dict(
                item
            )
            for item
            in properties
        ]

    finally:
        db.close()


@app.get(
    "/properties/{property_id}"
)
def get_property(
    property_id: int,
):

    db = SessionLocal()

    try:

        property_obj = (
            db.query(Property)
            .filter(
                Property.id
                == property_id
            )
            .first()
        )

        if not property_obj:

            raise HTTPException(
                status_code=404,
                detail=(
                    "Property not found"
                ),
            )

        return property_to_dict(
            property_obj
        )

    finally:
        db.close()


@app.post("/properties")
async def create_property(
    request: Request,
):

    db = SessionLocal()

    try:

        payload, image = (
            await read_property_request(
                request
            )
        )

        data = (
            validate_property_payload(
                payload
            )
        )

        image_url = (
            await save_upload(
                image
            )
            if image
            else data["image_url"]
        )

        property_obj = Property(
            title=data["title"],
            description=data["description"],
            price=data["price"],
            area=data["area"],
            rooms=data["rooms"],
            city=data["city"],
            district=data["district"],
            address=data["address"],
            property_type=data[
                "property_type"
            ],
            property_subtype=data[
                "property_subtype"
            ],
            deal_type=data[
                "deal_type"
            ],
            status=data[
                "status"
            ],
            image_url=image_url,

            real_address=data["real_address"],
            public_address=data["public_address"],

            owner_name=data["owner_name"],
            owner_phone=data["owner_phone"],

            agent_comment=data["agent_comment"],

            is_draft=data.get("is_draft", True),
        )

        # Координаты добавляются после создания,
        # чтобы код был совместим с моделью,
        # пока она обновляется.
        if hasattr(
            property_obj,
            "latitude",
        ):
            property_obj.latitude = (
                data["latitude"]
            )

        if hasattr(
            property_obj,
            "longitude",
        ):
            property_obj.longitude = (
                data["longitude"]
            )

        db.add(
            property_obj
        )

        db.commit()

        db.refresh(
            property_obj
        )

        return {
            "status":
                "success",

            "id":
                property_obj.id,

            "property":
                property_to_dict(
                    property_obj
                ),
        }

    except SQLAlchemyError:

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=(
                "Ошибка базы данных "
                "при создании объекта."
            ),
        )

    finally:
        db.close()


@app.put(
    "/properties/{property_id}"
)
async def update_property(
    property_id: int,
    request: Request,
):

    db = SessionLocal()

    try:

        property_obj = (
            db.query(Property)
            .filter(
                Property.id
                == property_id
            )
            .first()
        )

        if not property_obj:

            raise HTTPException(
                status_code=404,
                detail=(
                    "Property not found"
                ),
            )

        payload, image = (
            await read_property_request(
                request
            )
        )

        data = (
            validate_property_payload(
                payload,
                existing=property_obj,
            )
        )

        old_image = (
            property_obj.image_url
        )

        property_obj.title = (
            data["title"]
        )

        property_obj.description = (
            data["description"]
        )

        property_obj.price = (
            data["price"]
        )

        property_obj.area = (
            data["area"]
        )

        property_obj.rooms = (
            data["rooms"]
        )

        property_obj.city = (
            data["city"]
        )

        property_obj.district = (
            data["district"]
        )

        property_obj.address = (
            data["address"]
        )

        property_obj.property_type = (
            data["property_type"]
        )

        property_obj.property_subtype = (
            data["property_subtype"]
        )

        property_obj.deal_type = (
            data["deal_type"]
        )

        property_obj.status = (
            data["status"]
        )

        if hasattr(
            property_obj,
            "latitude",
        ):
            property_obj.latitude = (
                data["latitude"]
            )

        if hasattr(
            property_obj,
            "longitude",
        ):
            property_obj.longitude = (
                data["longitude"]
            )

        if image:

            property_obj.image_url = (
                await save_upload(
                    image
                )
            )

        elif (
            "image_url" in payload
            and data["image_url"]
            is not None
        ):

            property_obj.image_url = (
                data["image_url"]
            )

        db.commit()

        db.refresh(
            property_obj
        )

        if (
            image
            and old_image
            != property_obj.image_url
        ):
            delete_local_file(
                old_image
            )

        return {
            "status":
                "success",

            "property":
                property_to_dict(
                    property_obj
                ),
        }

    except SQLAlchemyError:

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=(
                "Ошибка базы данных "
                "при обновлении объекта."
            ),
        )

    finally:
        db.close()


@app.delete(
    "/properties/{property_id}"
)
def delete_property(
    property_id: int,
):

    db = SessionLocal()

    try:

        property_obj = (
            db.query(Property)
            .filter(
                Property.id
                == property_id
            )
            .first()
        )

        if not property_obj:

            raise HTTPException(
                status_code=404,
                detail=(
                    "Property not found"
                ),
            )

        db.query(
            Lead
        ).filter(
            Lead.property_id
            == property_id
        ).delete(
            synchronize_session=False
        )

        db.query(
            Sale
        ).filter(
            Sale.property_id
            == property_id
        ).delete(
            synchronize_session=False
        )

        images = (
            db.query(
                PropertyImage
            )
            .filter(
                PropertyImage.property_id
                == property_id
            )
            .all()
        )

        for image in images:

            delete_local_file(
                image.image_url
            )

            db.delete(
                image
            )

        main_image = (
            property_obj.image_url
        )

        db.delete(
            property_obj
        )

        db.commit()

        delete_local_file(
            main_image
        )

        return {
            "status":
                "deleted"
        }

    except SQLAlchemyError:

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=(
                "Ошибка базы данных "
                "при удалении объекта."
            ),
        )

    finally:
        db.close()

@app.put("/properties/{property_id}/publish")
def publish_property(
    property_id: int,
    db: Session = Depends(get_db)
):
    property_obj = (
        db.query(Property)
        .filter(Property.id == property_id)
        .first()
    )

    if not property_obj:
        raise HTTPException(
            status_code=404,
            detail="Property not found"
        )

    property_obj.is_draft = False

    db.commit()
    db.refresh(property_obj)

    return {
        "status": "published",
        "id": property_obj.id
    }

@app.delete("/properties/{property_id}")
def delete_property(
    property_id: int,
    db: Session = Depends(get_db)
):
    property_obj = (
        db.query(Property)
        .filter(Property.id == property_id)
        .first()
    )

    if not property_obj:
        raise HTTPException(
            status_code=404,
            detail="Property not found"
        )

    db.delete(property_obj)
    db.commit()

    return {"status": "deleted"}


# ============================================================
# YANDEX GEOCODER
# ============================================================

def call_yandex_geocoder(
    geocode: str,
) -> dict[str, Any]:

    if not YANDEX_GEOCODER_API_KEY:

        raise HTTPException(
            status_code=500,
            detail=(
                "На сервере не настроен "
                "YANDEX_GEOCODER_API_KEY."
            ),
        )

    clean_value = (
        geocode
        or ""
    ).strip()

    if not clean_value:

        raise HTTPException(
            status_code=400,
            detail="Адрес не указан.",
        )

    url = (
        "https://geocode-maps.yandex.ru/v1/"
        f"?apikey={quote(YANDEX_GEOCODER_API_KEY)}"
        f"&geocode={quote(clean_value)}"
        "&lang=ru_RU"
        "&format=json"
        "&results=1"
    )

    try:

        request = UrlRequest(
            url,
            headers={
                "User-Agent":
                    "DOMA/1.0",
            },
        )

        with urlopen(
            request,
            timeout=10,
        ) as response:

            raw = response.read()

        data = json.loads(
            raw.decode(
                "utf-8"
            )
        )

    except HTTPError as exc:

        print(
            "Yandex Geocoder HTTP error:",
            exc.code,
        )

        if exc.code == 403:

            raise HTTPException(
                status_code=403,
                detail=(
                    "Яндекс отклонил "
                    "ключ Геокодера."
                ),
            )

        raise HTTPException(
            status_code=502,
            detail=(
                "Ошибка Яндекс Геокодера."
            ),
        )

    except (
        URLError,
        TimeoutError,
        json.JSONDecodeError,
    ) as exc:

        print(
            "Yandex Geocoder error:",
            exc,
        )

        raise HTTPException(
            status_code=502,
            detail=(
                "Не удалось обратиться "
                "к Яндекс Геокодеру."
            ),
        )

    try:

        collection = (
            data[
                "response"
            ][
                "GeoObjectCollection"
            ]
        )

        members = (
            collection[
                "featureMember"
            ]
        )

        if not members:

            return {
                "found":
                    False,

                "message":
                    "Адрес не найден.",
            }

        geo_object = (
            members[0][
                "GeoObject"
            ]
        )

        position = (
            geo_object[
                "Point"
            ][
                "pos"
            ]
        )

        longitude, latitude = (
            float(value)
            for value
            in position.split()
        )

        metadata = (
            geo_object
            .get(
                "metaDataProperty",
                {},
            )
            .get(
                "GeocoderMetaData",
                {},
            )
        )

        address_data = (
            metadata.get(
                "Address",
                {},
            )
        )

        formatted = (
            address_data.get(
                "formatted"
            )
            or geo_object.get(
                "name"
            )
            or clean_value
        )

        return {
            "found":
                True,

            "latitude":
                latitude,

            "longitude":
                longitude,

            "formatted":
                formatted,

            "precision":
                metadata.get(
                    "precision"
                ),
        }

    except (
        KeyError,
        TypeError,
        ValueError,
    ) as exc:

        print(
            "Unexpected geocoder response:",
            exc,
        )

        raise HTTPException(
            status_code=502,
            detail=(
                "Яндекс вернул "
                "неожиданный ответ."
            ),
        )


@app.get("/geocode")
def geocode(
    address: str = Query(...),
):

    return call_yandex_geocoder(
        address
    )


@app.get("/reverse-geocode")
def reverse_geocode(
    latitude: float = Query(...),
    longitude: float = Query(...),
):

    result = call_yandex_geocoder(
        f"{longitude},{latitude}"
    )

    return result


# ============================================================
# LEADS
# ============================================================

@app.post("/leads")
def create_lead(
    lead: LeadCreate,
):

    db = SessionLocal()

    try:

        new_lead = Lead(
            property_id=lead.property_id,
            name=lead.name,
            phone=lead.phone,
            comment=lead.comment,
            status="Новая",
        )

        db.add(
            new_lead
        )

        existing_client = (
            db.query(Client)
            .filter(
                Client.phone
                == lead.phone
            )
            .first()
        )

        if not existing_client:

            db.add(
                Client(
                    name=lead.name,
                    phone=lead.phone,
                    status="Новый",
                )
            )

        db.commit()

        db.refresh(
            new_lead
        )

        return {
            "status":
                "success",

            "id":
                new_lead.id,
        }

    finally:
        db.close()


@app.get("/leads")
def get_leads():

    db = SessionLocal()

    try:

        leads = (
            db.query(Lead)
            .order_by(
                Lead.id.desc()
            )
            .all()
        )

        return [
            {
                "id":
                    lead.id,

                "property_id":
                    lead.property_id,

                "name":
                    lead.name,

                "phone":
                    lead.phone,

                "comment":
                    lead.comment,

                "status":
                    lead.status,

                "created_at":
                    (
                        lead.created_at.isoformat()
                        if lead.created_at
                        else None
                    ),
            }
            for lead
            in leads
        ]

    finally:
        db.close()


@app.get(
    "/leads/{lead_id}"
)
def get_lead(
    lead_id: int,
):

    db = SessionLocal()

    try:

        lead = (
            db.query(Lead)
            .filter(
                Lead.id
                == lead_id
            )
            .first()
        )

        if not lead:

            raise HTTPException(
                status_code=404,
                detail="Lead not found",
            )

        return {
            "id":
                lead.id,

            "property_id":
                lead.property_id,

            "name":
                lead.name,

            "phone":
                lead.phone,

            "comment":
                lead.comment,

            "status":
                lead.status,

            "created_at":
                (
                    lead.created_at.isoformat()
                    if lead.created_at
                    else None
                ),
        }

    finally:
        db.close()


@app.put(
    "/leads/{lead_id}"
)
def update_lead(
    lead_id: int,
    data: LeadStatusUpdate,
):

    db = SessionLocal()

    try:

        lead = (
            db.query(Lead)
            .filter(
                Lead.id
                == lead_id
            )
            .first()
        )

        if not lead:

            raise HTTPException(
                status_code=404,
                detail="Lead not found",
            )

        lead.status = (
            data.status
        )

        db.commit()

        return {
            "status":
                "updated"
        }

    finally:
        db.close()


@app.delete(
    "/leads/{lead_id}"
)
def delete_lead(
    lead_id: int,
):

    db = SessionLocal()

    try:

        lead = (
            db.query(Lead)
            .filter(
                Lead.id
                == lead_id
            )
            .first()
        )

        if not lead:

            raise HTTPException(
                status_code=404,
                detail="Lead not found",
            )

        db.delete(
            lead
        )

        db.commit()

        return {
            "status":
                "deleted"
        }

    finally:
        db.close()


# ============================================================
# CLIENTS
# ============================================================

@app.get("/clients")
def get_clients():

    db = SessionLocal()

    try:

        clients = (
            db.query(Client)
            .order_by(
                Client.id.desc()
            )
            .all()
        )

        return [
            {
                "id":
                    client.id,

                "name":
                    client.name,

                "phone":
                    client.phone,

                "email":
                    client.email,

                "status":
                    client.status,

                "notes":
                    client.notes,

                "created_at":
                    (
                        client.created_at.isoformat()
                        if client.created_at
                        else None
                    ),
            }
            for client
            in clients
        ]

    finally:
        db.close()


@app.post("/clients")
def create_client(
    data: dict[str, Any],
):

    db = SessionLocal()

    try:

        name = text_value(
            data.get(
                "name"
            )
        )

        phone = text_value(
            data.get(
                "phone"
            )
        )

        if not name or not phone:

            raise HTTPException(
                status_code=400,
                detail=(
                    "Имя и телефон обязательны."
                ),
            )

        client = Client(
            name=name,
            phone=phone,
            email=data.get(
                "email"
            ),
            status=data.get(
                "status",
                "Новый",
            ),
            notes=data.get(
                "notes"
            ),
        )

        db.add(
            client
        )

        db.commit()

        db.refresh(
            client
        )

        return {
            "status":
                "success",

            "id":
                client.id,
        }

    finally:
        db.close()


@app.get(
    "/clients/{client_id}"
)
def get_client(
    client_id: int,
):

    db = SessionLocal()

    try:

        client = (
            db.query(Client)
            .filter(
                Client.id
                == client_id
            )
            .first()
        )

        if not client:

            raise HTTPException(
                status_code=404,
                detail=(
                    "Client not found"
                ),
            )

        return {
            "id":
                client.id,

            "name":
                client.name,

            "phone":
                client.phone,

            "email":
                client.email,

            "status":
                client.status,

            "notes":
                client.notes,

            "created_at":
                (
                    client.created_at.isoformat()
                    if client.created_at
                    else None
                ),
        }

    finally:
        db.close()


@app.put(
    "/clients/{client_id}"
)
def update_client(
    client_id: int,
    data: ClientUpdate,
):

    db = SessionLocal()

    try:

        client = (
            db.query(Client)
            .filter(
                Client.id
                == client_id
            )
            .first()
        )

        if not client:

            raise HTTPException(
                status_code=404,
                detail=(
                    "Client not found"
                ),
            )

        client.name = (
            data.name
        )

        client.phone = (
            data.phone
        )

        client.email = (
            data.email
        )

        client.status = (
            data.status
        )

        client.notes = (
            data.notes
        )

        db.commit()

        return {
            "status":
                "success"
        }

    finally:
        db.close()


@app.delete(
    "/clients/{client_id}"
)
def delete_client(
    client_id: int,
):

    db = SessionLocal()

    try:

        client = (
            db.query(Client)
            .filter(
                Client.id
                == client_id
            )
            .first()
        )

        if not client:

            raise HTTPException(
                status_code=404,
                detail=(
                    "Client not found"
                ),
            )

        db.query(
            Sale
        ).filter(
            Sale.client_id
            == client_id
        ).delete(
            synchronize_session=False
        )

        db.delete(
            client
        )

        db.commit()

        return {
            "status":
                "deleted"
        }

    finally:
        db.close()


@app.get(
    "/clients/{client_id}/sales"
)
def get_client_sales(
    client_id: int,
):

    db = SessionLocal()

    try:

        sales = (
            db.query(Sale)
            .filter(
                Sale.client_id
                == client_id
            )
            .order_by(
                Sale.id.desc()
            )
            .all()
        )

        result = []

        for sale in sales:

            property_obj = (
                db.query(Property)
                .filter(
                    Property.id
                    == sale.property_id
                )
                .first()
            )

            result.append(
                {
                    "id":
                        sale.id,

                    "amount":
                        int(
                            sale.amount
                            or 0
                        ),

                    "status":
                        sale.status,

                    "property_title":
                        (
                            property_obj.title
                            if property_obj
                            else "Не найден"
                        ),
                }
            )

        return result

    finally:
        db.close()


# ============================================================
# SALES
# ============================================================

@app.get("/sales")
def get_sales():

    db = SessionLocal()

    try:

        sales = (
            db.query(Sale)
            .order_by(
                Sale.id.desc()
            )
            .all()
        )

        result = []

        for sale in sales:

            client = (
                db.query(Client)
                .filter(
                    Client.id
                    == sale.client_id
                )
                .first()
            )

            property_obj = (
                db.query(Property)
                .filter(
                    Property.id
                    == sale.property_id
                )
                .first()
            )

            result.append(
                {
                    "id":
                        sale.id,

                    "client_id":
                        sale.client_id,

                    "client_name":
                        (
                            client.name
                            if client
                            else "Не найден"
                        ),

                    "property_id":
                        sale.property_id,

                    "property_title":
                        (
                            property_obj.title
                            if property_obj
                            else "Не найден"
                        ),

                    "amount":
                        int(
                            sale.amount
                            or 0
                        ),

                    "status":
                        sale.status,
                }
            )

        return result

    finally:
        db.close()


@app.post("/sales")
def create_sale(
    data: SaleCreate,
):

    db = SessionLocal()

    try:

        client = (
            db.query(Client)
            .filter(
                Client.id
                == data.client_id
            )
            .first()
        )

        if not client:

            raise HTTPException(
                status_code=404,
                detail="Client not found",
            )

        property_obj = (
            db.query(Property)
            .filter(
                Property.id
                == data.property_id
            )
            .first()
        )

        if not property_obj:

            raise HTTPException(
                status_code=404,
                detail="Property not found",
            )

        sale = Sale(
            client_id=data.client_id,
            property_id=data.property_id,
            amount=data.amount,
            status="Подготовка",
        )

        db.add(
            sale
        )

        client.status = "Сделка"

        db.commit()

        db.refresh(
            sale
        )

        return {
            "id":
                sale.id,

            "status":
                "created",
        }

    finally:
        db.close()


@app.get(
    "/sales/latest"
)
def get_latest_sales():

    db = SessionLocal()

    try:

        sales = (
            db.query(Sale)
            .order_by(
                Sale.id.desc()
            )
            .limit(10)
            .all()
        )

        result = []

        for sale in sales:

            client = (
                db.query(Client)
                .filter(
                    Client.id
                    == sale.client_id
                )
                .first()
            )

            property_obj = (
                db.query(Property)
                .filter(
                    Property.id
                    == sale.property_id
                )
                .first()
            )

            result.append(
                {
                    "id":
                        sale.id,

                    "client_id":
                        sale.client_id,

                    "client_name":
                        (
                            client.name
                            if client
                            else "Не найден"
                        ),

                    "property_id":
                        sale.property_id,

                    "property_title":
                        (
                            property_obj.title
                            if property_obj
                            else "Не найден"
                        ),

                    "amount":
                        int(
                            sale.amount
                            or 0
                        ),

                    "status":
                        sale.status,
                }
            )

        return result

    finally:
        db.close()


@app.get(
    "/sales/{sale_id}"
)
def get_sale(
    sale_id: int,
):

    db = SessionLocal()

    try:

        sale = (
            db.query(Sale)
            .filter(
                Sale.id
                == sale_id
            )
            .first()
        )

        if not sale:

            raise HTTPException(
                status_code=404,
                detail="Sale not found",
            )

        client = (
            db.query(Client)
            .filter(
                Client.id
                == sale.client_id
            )
            .first()
        )

        property_obj = (
            db.query(Property)
            .filter(
                Property.id
                == sale.property_id
            )
            .first()
        )

        return {
            "id":
                sale.id,

            "client_id":
                sale.client_id,

            "client_name":
                (
                    client.name
                    if client
                    else ""
                ),

            "property_id":
                sale.property_id,

            "property_title":
                (
                    property_obj.title
                    if property_obj
                    else ""
                ),

            "amount":
                int(
                    sale.amount
                    or 0
                ),

            "status":
                sale.status,
        }

    finally:
        db.close()


@app.put(
    "/sales/{sale_id}"
)
def update_sale(
    sale_id: int,
    data: SaleUpdate,
):

    db = SessionLocal()

    try:

        sale = (
            db.query(Sale)
            .filter(
                Sale.id
                == sale_id
            )
            .first()
        )

        if not sale:

            raise HTTPException(
                status_code=404,
                detail="Sale not found",
            )

        sale.client_id = (
            data.client_id
        )

        sale.property_id = (
            data.property_id
        )

        sale.amount = (
            data.amount
        )

        sale.status = (
            data.status
        )

        db.commit()

        return {
            "status":
                "updated"
        }

    finally:
        db.close()


@app.put(
    "/sales/{sale_id}/status"
)
def update_sale_status(
    sale_id: int,
    data: SaleStatusUpdate,
):

    db = SessionLocal()

    try:

        sale = (
            db.query(Sale)
            .filter(
                Sale.id
                == sale_id
            )
            .first()
        )

        if not sale:

            raise HTTPException(
                status_code=404,
                detail="Sale not found",
            )

        sale.status = (
            data.status
        )

        db.commit()

        return {
            "status":
                "updated"
        }

    finally:
        db.close()


@app.patch(
    "/sales/{sale_id}/complete"
)
def complete_sale(
    sale_id: int,
):

    db = SessionLocal()

    try:

        sale = (
            db.query(Sale)
            .filter(
                Sale.id
                == sale_id
            )
            .first()
        )

        if not sale:

            raise HTTPException(
                status_code=404,
                detail="Sale not found",
            )

        sale.status = (
            "Завершена"
        )

        client = (
            db.query(Client)
            .filter(
                Client.id
                == sale.client_id
            )
            .first()
        )

        if client:
            client.status = (
                "Постоянный"
            )

        db.commit()

        db.refresh(
            sale
        )

        return {
            "id":
                sale.id,

            "status":
                "completed",
        }

    finally:
        db.close()


@app.delete(
    "/sales/{sale_id}"
)
def delete_sale(
    sale_id: int,
):

    db = SessionLocal()

    try:

        sale = (
            db.query(Sale)
            .filter(
                Sale.id
                == sale_id
            )
            .first()
        )

        if not sale:

            raise HTTPException(
                status_code=404,
                detail="Sale not found",
            )

        db.delete(
            sale
        )

        db.commit()

        return {
            "status":
                "deleted"
        }

    finally:
        db.close()


# ============================================================
# STATS
# ============================================================

@app.get("/stats")
def get_stats():

    db = SessionLocal()

    try:

        sales = (
            db.query(Sale)
            .all()
        )

        return {
            "properties":
                db.query(
                    Property
                ).count(),

            "leads":
                db.query(
                    Lead
                ).count(),

            "clients":
                db.query(
                    Client
                ).count(),

            "sales":
                len(sales),

            "revenue":
                sum(
                    int(
                        sale.amount
                        or 0
                    )
                    for sale
                    in sales
                ),
        }

    finally:
        db.close()


# ============================================================
# PROPERTY IMAGES
# ============================================================

@app.get(
    "/test-images"
)
def test_images():

    return {
        "cwd":
            os.getcwd(),

        "images_exists":
            IMAGE_DIR.exists(),

        "images_dir":
            str(IMAGE_DIR),

        "files":
            sorted(
                item.name
                for item
                in IMAGE_DIR.iterdir()
                if item.is_file()
            ),
    }


@app.post(
    "/upload-image"
)
async def upload_image(
    file: UploadFile = File(...),
):

    return {
        "image_url":
            await save_upload(
                file
            )
    }


@app.post(
    "/properties/{property_id}/images"
)
async def upload_property_image(
    property_id: int,
    file: UploadFile = File(...),
):

    db = SessionLocal()

    try:

        property_obj = (
            db.query(Property)
            .filter(
                Property.id
                == property_id
            )
            .first()
        )

        if not property_obj:

            raise HTTPException(
                status_code=404,
                detail=(
                    "Property not found"
                ),
            )

        image_url = (
            await save_upload(
                file
            )
        )

        image = PropertyImage(
            property_id=property_id,
            image_url=image_url,
        )

        db.add(
            image
        )

        db.commit()

        db.refresh(
            image
        )

        return {
            "id":
                image.id,

            "image_url":
                image.image_url,
        }

    finally:
        db.close()


@app.get(
    "/properties/{property_id}/images"
)
def get_property_images(
    property_id: int,
):

    db = SessionLocal()

    try:

        property_obj = (
            db.query(Property)
            .filter(
                Property.id
                == property_id
            )
            .first()
        )

        if not property_obj:

            raise HTTPException(
                status_code=404,
                detail=(
                    "Property not found"
                ),
            )

        images = (
            db.query(
                PropertyImage
            )
            .filter(
                PropertyImage.property_id
                == property_id
            )
            .order_by(
                PropertyImage.id.asc()
            )
            .all()
        )

        return [
            {
                "id":
                    image.id,

                "image_url":
                    image.image_url,
            }
            for image
            in images
        ]

    finally:
        db.close()


@app.delete(
    "/property-images/{image_id}"
)
def delete_property_image(
    image_id: int,
):

    db = SessionLocal()

    try:

        image = (
            db.query(
                PropertyImage
            )
            .filter(
                PropertyImage.id
                == image_id
            )
            .first()
        )

        if not image:

            raise HTTPException(
                status_code=404,
                detail=(
                    "Image not found"
                ),
            )

        delete_local_file(
            image.image_url
        )

        db.delete(
            image
        )

        db.commit()

        return {
            "status":
                "deleted"
        }

    finally:
        db.close()


@app.post(
    "/properties/{property_id}/image"
)
async def set_property_image(
    property_id: int,
    file: UploadFile = File(...),
):

    db = SessionLocal()

    try:

        property_obj = (
            db.query(Property)
            .filter(
                Property.id
                == property_id
            )
            .first()
        )

        if not property_obj:

            raise HTTPException(
                status_code=404,
                detail=(
                    "Property not found"
                ),
            )

        old_image = (
            property_obj.image_url
        )

        property_obj.image_url = (
            await save_upload(
                file
            )
        )

        db.commit()

        db.refresh(
            property_obj
        )

        delete_local_file(
            old_image
        )

        return {
            "image_url":
                property_obj.image_url
        }

    finally:
        db.close()


# ============================================================
# AUTH
# ============================================================

@app.post("/login")
def login(
    data: LoginSchema,
):

    db = SessionLocal()

    try:

        user = (
            db.query(User)
            .filter(
                User.username
                == data.username
            )
            .first()
        )

        if not user:

            raise HTTPException(
                status_code=401,
                detail="Неверный логин",
            )

        if not verify_password(
            data.password,
            user.password_hash,
        ):

            raise HTTPException(
                status_code=401,
                detail="Неверный пароль",
            )

        token = (
            create_access_token(
                {
                    "sub":
                        str(
                            user.id
                        ),

                    "role":
                        user.role,
                }
            )
        )

        return {
            "access_token":
                token
        }

    finally:
        db.close()


@app.get("/me")
def me(
    authorization: str | None = Header(
        default=None
    ),
):

    if not authorization:

        raise HTTPException(
            status_code=401,
            detail=(
                "Not authenticated"
            ),
        )

    scheme, _, token = (
        authorization.partition(" ")
    )

    if (
        scheme.lower()
        != "bearer"
        or not token
    ):

        raise HTTPException(
            status_code=401,
            detail=(
                "Invalid authorization header"
            ),
        )

    try:

        return jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[
                ALGORITHM
            ],
        )

    except Exception:

        raise HTTPException(
            status_code=401,
            detail=(
                "Invalid token"
            ),
        )

DEFAULT_SITE_SETTINGS = {
    "hero_eyebrow": "НЕДВИЖИМОСТЬ • КРАСНОДАР",
    "hero_title_line1": "Найдём место,",
    "hero_title_line2": "которое станет",
    "hero_title_line3": "домом",
    "hero_description": (
        "Покупка, продажа и аренда недвижимости в Краснодаре. "
        "Полное сопровождение сделки и персональный подход к каждому клиенту."
    ),
    "hero_image": None,
    "stat1_value": "500+",
    "stat1_label": "Объектов",
    "stat2_value": "150+",
    "stat2_label": "Сделок",
    "stat3_value": "98%",
    "stat3_label": "Довольных клиентов",
}


class SiteSettingsPayload(BaseModel):
    hero_eyebrow: str
    hero_title_line1: str
    hero_title_line2: str
    hero_title_line3: str
    hero_description: str
    hero_image: str | None = None
    stat1_value: str
    stat1_label: str
    stat2_value: str
    stat2_label: str
    stat3_value: str
    stat3_label: str


def get_or_create_site_settings(db):
    settings = (
        db.query(SiteSettings)
        .order_by(SiteSettings.id.asc())
        .first()
    )

    if not settings:
        settings = SiteSettings(**DEFAULT_SITE_SETTINGS)
        db.add(settings)
        db.commit()
        db.refresh(settings)

    return settings


def site_settings_to_dict(settings):
    return {
        "id": settings.id,
        "hero_eyebrow": settings.hero_eyebrow,
        "hero_title_line1": settings.hero_title_line1,
        "hero_title_line2": settings.hero_title_line2,
        "hero_title_line3": settings.hero_title_line3,
        "hero_description": settings.hero_description,
        "hero_image": settings.hero_image,
        "stat1_value": settings.stat1_value,
        "stat1_label": settings.stat1_label,
        "stat2_value": settings.stat2_value,
        "stat2_label": settings.stat2_label,
        "stat3_value": settings.stat3_value,
        "stat3_label": settings.stat3_label,
    }


def require_admin(authorization: str | None):
    if not authorization:
        raise HTTPException(
            status_code=401,
            detail="Необходима авторизация администратора.",
        )

    scheme, _, token = authorization.partition(" ")

    if scheme.lower() != "bearer" or not token:
        raise HTTPException(
            status_code=401,
            detail="Некорректный Authorization header.",
        )

    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM],
        )
    except Exception:
        raise HTTPException(
            status_code=401,
            detail="Недействительный токен.",
        )

    role = payload.get("role")

    if role != "admin":
        raise HTTPException(
            status_code=403,
            detail="Недостаточно прав для изменения настроек сайта.",
        )

    return payload


@app.get("/site-settings")
def get_site_settings():
    """Публичные настройки Hero. Нужны главной странице сайта."""
    db = SessionLocal()

    try:
        settings = get_or_create_site_settings(db)
        return site_settings_to_dict(settings)
    finally:
        db.close()


@app.put("/site-settings")
def update_site_settings(
    data: SiteSettingsPayload,
    authorization: str | None = Header(default=None),
):
    """Изменение Hero. Только для администратора."""
    require_admin(authorization)

    db = SessionLocal()

    try:
        settings = get_or_create_site_settings(db)

        # Поддержка Pydantic v1 и v2.
        payload = (
            data.model_dump()
            if hasattr(data, "model_dump")
            else data.dict()
        )

        for field, value in payload.items():
            setattr(settings, field, value)

        db.commit()
        db.refresh(settings)

        return {
            "status": "success",
            "settings": site_settings_to_dict(settings),
        }

    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


# ============================================================
# DEBUG
# ============================================================

@app.get(
    "/debug-properties"
)
def debug_properties():

    db = SessionLocal()

    try:

        properties = (
            db.query(Property)
            .order_by(
                Property.id.asc()
            )
            .all()
        )

        return [
            {
                "id":
                    p.id,

                "title":
                    p.title,

                "price":
                    int(
                        p.price
                        or 0
                    ),

                "area":
                    float(
                        p.area
                        or 0
                    ),

                "rooms":
                    p.rooms,

                "property_type":
                    p.property_type,

                "property_subtype":
                    p.property_subtype,

                "deal_type":
                    p.deal_type,

                "status":
                    p.status,

                "latitude":
                    getattr(
                        p,
                        "latitude",
                        None,
                    ),

                "longitude":
                    getattr(
                        p,
                        "longitude",
                        None,
                    ),
            }
            for p
            in properties
        ]

    finally:
        db.close()