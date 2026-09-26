from datetime import datetime, timedelta
import os
import shutil
import uuid
from pathlib import Path
from typing import Any

from fastapi import (
    FastAPI,
    File,
    Header,
    HTTPException,
    Query,
    Request,
    UploadFile,
)
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from jose import jwt
from passlib.context import CryptContext
from pydantic import BaseModel
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from .database import Base, SessionLocal, engine
from .models import Client, Lead, Property, PropertyImage, Sale, User
from .schemas import ClientUpdate, LeadCreate, SaleCreate, SaleUpdate


# ============================================================
# CONFIG
# ============================================================

ALGORITHM = "HS256"

# В Render желательно добавить SECRET_KEY в Environment Variables.
# Fallback оставлен для локального запуска.
SECRET_KEY = os.getenv(
    "SECRET_KEY",
    "doma-development-secret-change-in-render",
)

CORS_ORIGINS = [
    "http://localhost:3000",
    "https://doma-fawn.vercel.app",
    "https://doma-lu0sdscvv-yu-pi.vercel.app",
]


# ============================================================
# ТИПЫ НЕДВИЖИМОСТИ
# ============================================================

PROPERTY_TYPES = {
    "apartment": "Квартира",
    "new_building": "Квартира в новостройке",
    "house": "Дом",
    "land": "Земельный участок",
    "commercial": "Коммерческая недвижимость",
    "garage": "Гараж",
}

# Совместимость со старыми ссылками
PROPERTY_TYPE_ALIASES = {
    "flat": "apartment",
    "new": "new_building",

    "apartment": "apartment",
    "new_building": "new_building",
    "house": "house",
    "land": "land",
    "commercial": "commercial",
    "garage": "garage",
}

DEFAULT_PROPERTY_TYPE = "apartment"
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
# IMAGES
# ============================================================

BASE_DIR = Path(__file__).resolve().parent.parent

IMAGE_DIR = BASE_DIR / "images"
IMAGE_DIR.mkdir(
    parents=True,
    exist_ok=True,
)

app.mount(
    "/images",
    StaticFiles(directory=IMAGE_DIR),
    name="images",
)


# ============================================================
# AUTH
# ============================================================

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
)


class LoginSchema(BaseModel):
    username: str
    password: str


class SaleStatusUpdate(BaseModel):
    status: str


class LeadStatusUpdate(BaseModel):
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

    normalized = PROPERTY_TYPE_ALIASES.get(
        value
    )

    if normalized is None:
        raise HTTPException(
            status_code=400,
            detail=(
                "Неизвестный тип недвижимости. "
                f"Допустимые значения: "
                f"{', '.join(PROPERTY_TYPES)}"
            ),
        )

    return normalized


def property_to_dict(
    item: Property,
) -> dict[str, Any]:

    property_type = (
        item.property_type
        if item.property_type in PROPERTY_TYPES
        else DEFAULT_PROPERTY_TYPE
    )

    return {
        "id": item.id,

        "title": item.title or "",

        "description": (
            item.description
            or ""
        ),

        "price": int(
            item.price or 0
        ),

        "area": float(
            item.area or 0
        ),

        "rooms": int(
            item.rooms or 0
        ),

        "city": (
            item.city
            or ""
        ),

        "district": (
            item.district
            or ""
        ),

        "address": (
            item.address
            or ""
        ),

        "property_type": property_type,

        "property_type_label": (
            PROPERTY_TYPES[
                property_type
            ]
        ),

        "status": (
            item.status
            or DEFAULT_STATUS
        ),

        "image_url": (
            item.image_url
            or DEFAULT_IMAGE
        ),
    }


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


def text_value(
    value: Any,
    default: str = "",
) -> str:

    if value is None:
        return default

    return str(value).strip()


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

    file_path = (
        IMAGE_DIR / filename
    )

    try:

        if (
            file_path.exists()
            and file_path.is_file()
        ):
            file_path.unlink()

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

    file_path = (
        IMAGE_DIR / filename
    )

    with file_path.open("wb") as buffer:

        shutil.copyfileobj(
            file.file,
            buffer,
        )

    return (
        f"/images/{filename}"
    )


async def read_property_request(
    request: Request,
) -> tuple[
    dict[str, Any],
    UploadFile | None,
]:

    content_type = (
        request.headers
        .get("content-type", "")
        .lower()
    )

    # --------------------------------------------------------
    # multipart/form-data
    # --------------------------------------------------------

    if (
        "multipart/form-data"
        in content_type
        or
        "application/x-www-form-urlencoded"
        in content_type
    ):

        form = await request.form()

        payload = {
            "title": form.get(
                "title"
            ),

            "description": form.get(
                "description",
                "",
            ),

            "price": form.get(
                "price"
            ),

            "area": form.get(
                "area",
                0,
            ),

            "rooms": form.get(
                "rooms",
                0,
            ),

            "city": form.get(
                "city",
                "",
            ),

            "district": form.get(
                "district",
                "",
            ),

            "address": form.get(
                "address",
                "",
            ),

            "property_type": (
                form.get(
                    "property_type",
                    form.get(
                        "propertyType",
                        form.get(
                            "type",
                            DEFAULT_PROPERTY_TYPE,
                        ),
                    ),
                )
            ),

            "status": form.get(
                "status",
                DEFAULT_STATUS,
            ),

            "image_url": form.get(
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

    # --------------------------------------------------------
    # JSON
    # --------------------------------------------------------

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


def validate_property_payload(
    payload: dict[str, Any],
    existing: Property | None = None,
) -> dict[str, Any]:

    get = payload.get

    title = text_value(
        get(
            "title",
            existing.title
            if existing
            else None,
        )
    )

    if not title:

        raise HTTPException(
            status_code=400,
            detail=(
                "Поле 'title' обязательно."
            ),
        )

    property_type_value = get(
        "property_type",
        get(
            "propertyType",
            get(
                "type",
                (
                    existing.property_type
                    if existing
                    else DEFAULT_PROPERTY_TYPE
                ),
            ),
        ),
    )

    return {

        "title": title,

        "description": text_value(
            get(
                "description",
                (
                    existing.description
                    if existing
                    else ""
                ),
            )
        ),

        "price": to_int(
            get(
                "price",
                (
                    existing.price
                    if existing
                    else None
                ),
            ),
            "price",
        ),

        "area": to_float(
            get(
                "area",
                (
                    existing.area
                    if existing
                    else 0
                ),
            ),
            "area",
        ),

        "rooms": to_int(
            get(
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

        "city": text_value(
            get(
                "city",
                (
                    existing.city
                    if existing
                    else ""
                ),
            )
        ),

        "district": text_value(
            get(
                "district",
                (
                    existing.district
                    if existing
                    else ""
                ),
            )
        ),

        "address": text_value(
            get(
                "address",
                (
                    existing.address
                    if existing
                    else ""
                ),
            )
        ),

        "property_type": (
            normalize_property_type(
                property_type_value
            )
        ),

        "status": (
            text_value(
                get(
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

        "image_url": (
            text_value(
                get(
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


@app.get("/property-types")
def get_property_types():

    return [
        {
            "value": value,
            "label": label,
        }
        for value, label
        in PROPERTY_TYPES.items()
    ]


# ============================================================
# PROPERTIES
# ============================================================

@app.get("/properties")
def get_properties(
    property_type: str | None = Query(
        default=None,
        alias="type",
    ),
):

    db: Session = (
        SessionLocal()
    )

    try:

        query = db.query(
            Property
        )

        if property_type:

            normalized_type = (
                normalize_property_type(
                    property_type
                )
            )

            query = query.filter(
                Property.property_type
                == normalized_type
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
            await save_upload(image)
            if image
            else data["image_url"]
        )

        property_obj = Property(

            title=data["title"],

            description=data[
                "description"
            ],

            price=data[
                "price"
            ],

            area=data[
                "area"
            ],

            rooms=data[
                "rooms"
            ],

            city=data[
                "city"
            ],

            district=data[
                "district"
            ],

            address=data[
                "address"
            ],

            property_type=data[
                "property_type"
            ],

            status=data[
                "status"
            ],

            image_url=image_url,
        )

        db.add(
            property_obj
        )

        db.commit()

        db.refresh(
            property_obj
        )

        return {
            "status": "success",
            "id": property_obj.id,
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

        property_obj.status = (
            data["status"]
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
            "status": "success",
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

        # Удаляем связанные заявки
        db.query(Lead).filter(
            Lead.property_id
            == property_id
        ).delete(
            synchronize_session=False
        )

        # Удаляем связанные сделки
        db.query(Sale).filter(
            Sale.property_id
            == property_id
        ).delete(
            synchronize_session=False
        )

        # Удаляем галерею
        gallery = (
            db.query(PropertyImage)
            .filter(
                PropertyImage.property_id
                == property_id
            )
            .all()
        )

        for item in gallery:

            delete_local_file(
                item.image_url
            )

            db.delete(
                item
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
            "status": "deleted"
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
            property_id=(
                lead.property_id
            ),
            name=lead.name,
            phone=lead.phone,
            comment=lead.comment,
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
            "status": "success",
            "id": new_lead.id,
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
                "id": lead.id,
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
            }

            for lead in leads

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
                Lead.id == lead_id
            )
            .first()
        )

        if not lead:

            raise HTTPException(
                status_code=404,
                detail="Lead not found",
            )

        return {
            "id": lead.id,
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
                Lead.id == lead_id
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
                "updated",
            "lead_status":
                lead.status,
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
                Lead.id == lead_id
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
                "id": c.id,
                "name":
                    c.name,
                "phone":
                    c.phone,
                "email":
                    c.email,
                "status":
                    c.status,
                "notes":
                    c.notes,
            }

            for c in clients

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
                    "Имя и телефон "
                    "обязательны."
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

        db.query(Sale).filter(
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

    except SQLAlchemyError:

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=(
                "Ошибка базы данных "
                "при удалении клиента."
            ),
        )

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

            result.append({

                "id":
                    sale.id,

                "amount":
                    sale.amount,

                "status":
                    sale.status,

                "property_title":
                    (
                        property_obj.title
                        if property_obj
                        else "Не найден"
                    ),
            })

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

            result.append({

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
                    sale.amount,

                "status":
                    sale.status,
            })

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

            client_id=(
                data.client_id
            ),

            property_id=(
                data.property_id
            ),

            amount=(
                data.amount
            ),

            status="Подготовка",
        )

        db.add(
            sale
        )

        client.status = (
            "Сделка"
        )

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

            result.append({

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
                    sale.amount,

                "status":
                    sale.status,
            })

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
                detail=(
                    "Sale not found"
                ),
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
                sale.amount,

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
                detail=(
                    "Sale not found"
                ),
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
                detail=(
                    "Sale not found"
                ),
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
                detail=(
                    "Sale not found"
                ),
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
                detail=(
                    "Sale not found"
                ),
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
# IMAGES / GALLERY
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
            str(
                IMAGE_DIR
            ),

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

            property_id=(
                property_id
            ),

            image_url=(
                image_url
            ),
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
                detail=(
                    "Неверный логин"
                ),
            )

        if not verify_password(
            data.password,
            user.password_hash,
        ):

            raise HTTPException(
                status_code=401,
                detail=(
                    "Неверный пароль"
                ),
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
        default=None,
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
        authorization.partition(
            " "
        )
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