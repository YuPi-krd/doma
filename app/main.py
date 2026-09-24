from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from fastapi import UploadFile, File
import shutil
import uuid
from .database import engine, SessionLocal
from .models import Base, Property, Lead, Client, Sale, PropertyImage
from pathlib import Path
from .schemas import (
    LeadCreate,
    PropertyCreate,
    PropertyResponse,
    PropertyUpdate,
    SaleCreate,
    SaleUpdate,
    LeadUpdate,
)
from fastapi.staticfiles import StaticFiles
from fastapi import UploadFile, File, Form
from fastapi.staticfiles import StaticFiles
import shutil
import os
from pydantic import BaseModel
from sqlalchemy.exc import SQLAlchemyError
from fastapi import UploadFile, File
import uuid
import shutil
from app.auth import create_access_token
from app.models import User
from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta
from fastapi import HTTPException, Header

SECRET_KEY = "..."
ALGORITHM = "HS256"

def create_access_token(data: dict):
    to_encode = data.copy()

    expire = (
        datetime.utcnow()
        + timedelta(days=7)
    )

    to_encode.update(
        {"exp": expire}
    )

    return jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM
    )

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)

def verify_password(
    plain_password: str,
    hashed_password: str
):
    return pwd_context.verify(
        plain_password,
        hashed_password
    )

class LoginSchema(BaseModel):
    username: str
    password: str

Base.metadata.create_all(bind=engine)

BASE_DIR = Path(__file__).resolve().parent.parent

app = FastAPI()

if not os.path.exists("images"):
    os.makedirs("images")

app.mount(
    "/images",
    StaticFiles(directory=BASE_DIR / "images"),
    name="images",
)

os.makedirs("images", exist_ok=True)

app.mount(
    "/images",
    StaticFiles(directory="images"),
    name="images",
)

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://doma-fawn.vercel.app",
        "https://doma-lu0sdscvv-yu-pi.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class SaleStatusUpdate(BaseModel):
    status: str

class LeadStatusUpdate(BaseModel):
    status: str

class ClientUpdate(BaseModel):
    name: str
    phone: str
    email: str | None = None
    status: str
    notes: str | None = None


@app.get("/")
def root():
    return {"status": "ok"}


@app.get("/properties")
def get_properties():
    db: Session = SessionLocal()

    try:
        properties = db.query(Property).all()

        return [
            {
                "id": item.id,

                "title": item.title or "",

                "description": (
                    item.description or ""
                ),

                "price": item.price or 0,

                "area": float(
                    item.area or 0
                ),

                "rooms": item.rooms or 1,

                "city": item.city or "",

                "district": (
                    item.district or ""
                ),

                "address": (
                    item.address or ""
                ),

                "status": (
                    item.status
                    or "Свободен"
                ),

                "image_url": (
                    item.image_url
                    or "/images/test-flat.jpg"
                ),
            }
            for item in properties
        ]

    finally:
        db.close()


@app.get("/properties/{property_id}")
def get_property(property_id: int):
    db = SessionLocal()

    try:
        property_obj = (
            db.query(Property)
            .filter(Property.id == property_id)
            .first()
        )

        if not property_obj:
            return {
                "error": "not found"
            }

        return {
            "id": property_obj.id,

            "title":
                property_obj.title
                or "Без названия",

            "description":
                property_obj.description
                or "",

            "price":
                property_obj.price
                or 0,

            "area":
                float(property_obj.area)
                if property_obj.area is not None
                else 0,

            "rooms":
                property_obj.rooms
                or 0,

            "city":
                property_obj.city
                or "",

            "district":
                property_obj.district
                or "",

            "address":
                property_obj.address
                or "",

            "status":
                property_obj.status
                or "Свободен",

            "image_url":
                property_obj.image_url
                or "/images/test-flat.jpg",
        }

    finally:
        db.close()


@app.post("/leads")
def create_lead(lead: LeadCreate):
    db = SessionLocal()

    try:
        new_lead = Lead(
            property_id=lead.property_id,
            name=lead.name,
            phone=lead.phone,
            comment=lead.comment,
        )

        db.add(new_lead)

        existing_client = (
            db.query(Client)
            .filter(Client.phone == lead.phone)
            .first()
        )

        if not existing_client:
            client = Client(
                name=lead.name,
                phone=lead.phone,
                status="Новый",
            )

            db.add(client)

        db.commit()
        db.refresh(new_lead)

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
        leads = db.query(Lead).all()

        return [
            {
                "id": lead.id,
                "name": lead.name,
                "phone": lead.phone,
                "comment": lead.comment,
                "status": lead.status,
            }
            for lead in leads
        ]

    finally:
        db.close()


@app.get("/leads/{lead_id}")
def get_lead(lead_id: int):
    db = SessionLocal()

    try:
        lead = (
            db.query(Lead)
            .filter(Lead.id == lead_id)
            .first()
        )

        if not lead:
            return {
                "error": "Lead not found"
            }

        return {
            "id": lead.id,
            "property_id": lead.property_id,
            "name": lead.name,
            "phone": lead.phone,
            "comment": lead.comment,
            "status": lead.status,
        }

    finally:
        db.close()

@app.put("/leads/{lead_id}")
def update_lead(
    lead_id: int,
    data: LeadStatusUpdate,
):
    db = SessionLocal()

    try:
        lead = (
            db.query(Lead)
            .filter(Lead.id == lead_id)
            .first()
        )

        if not lead:
            return {
                "error": "Lead not found"
            }

        lead.status = data.status

        db.commit()
        db.refresh(lead)

        return {
            "status": "updated",
            "lead_status": lead.status,
        }

    finally:
        db.close()

@app.delete("/leads/{lead_id}")
def delete_lead(lead_id: int):
    db = SessionLocal()

    try:
        lead = (
            db.query(Lead)
            .filter(Lead.id == lead_id)
            .first()
        )

        if not lead:
            return {
                "error": "Lead not found"
            }

        db.delete(lead)

        db.commit()

        return {
            "status": "deleted"
        }

    finally:
        db.close()

@app.post("/properties")
async def create_property(
    title: str = Form(...),
    description: str = Form(""),
    price: int = Form(...),
    rooms: int = Form(...),
    city: str = Form(...),
    district: str = Form(...),
    address: str = Form(...),
    status: str = Form("Свободен"),
    image: UploadFile | None = File(None),
):
    db = SessionLocal()

    try:
        image_url = None

        if image:
            filename = image.filename

            file_path = f"images/{filename}"

            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(
                    image.file,
                    buffer,
                )

            image_url = f"/images/{filename}"

        property_obj = Property(
            title=title,
            description=description,
            price=price,
            rooms=rooms,
            city=city,
            district=district,
            address=address,
            status=status,
            image_url=image_url,
        )

        db.add(property_obj)

        db.commit()
        db.refresh(property_obj)

        return {
            "status": "success",
            "id": property_obj.id,
        }

    finally:
        db.close()


@app.put("/properties/{property_id}")
async def update_property(
    property_id: int,
    title: str = Form(...),
    description: str = Form(""),
    price: int = Form(...),
    rooms: int = Form(...),
    city: str = Form(...),
    district: str = Form(...),
    address: str = Form(...),
    status: str = Form("Свободен"),
    image: UploadFile | None = File(None),
):
    db = SessionLocal()

    try:
        property_obj = (
            db.query(Property)
            .filter(Property.id == property_id)
            .first()
        )

        if not property_obj:
            return {
                "error": "not found"
            }

        property_obj.title = title
        property_obj.description = description
        property_obj.price = price
        property_obj.rooms = rooms
        property_obj.city = city
        property_obj.district = district
        property_obj.address = address
        property_obj.status = status

        if image:
            filename = image.filename

            file_path = f"images/{filename}"

            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(
                    image.file,
                    buffer,
                )

            property_obj.image_url = (
                f"/images/{filename}"
            )

        db.commit()

        return {
            "status": "success"
        }

    finally:
        db.close()


@app.get("/stats")
def get_stats():
    db = SessionLocal()

    try:
        properties_count = db.query(Property).count()
        leads_count = db.query(Lead).count()
        clients_count = db.query(Client).count()
        sales_count = db.query(Sale).count()

        revenue = sum(
            sale.amount or 0
            for sale in db.query(Sale).all()
        )

        return {
            "properties": properties_count,
            "leads": leads_count,
            "clients": clients_count,
            "sales": sales_count,
            "revenue": revenue,
        }

    finally:
        db.close()


@app.delete("/properties/{property_id}")
def delete_property(property_id: int):
    db = SessionLocal()

    try:
        property_obj = (
            db.query(Property)
            .filter(Property.id == property_id)
            .first()
        )

        if not property_obj:
            return {"error": "Object not found"}

        db.query(Lead).filter(
            Lead.property_id == property_id
        ).delete()

        db.delete(property_obj)

        db.commit()

        return {
            "status": "deleted"
        }

    finally:
        db.close()


@app.get("/clients")
def get_clients():
    db = SessionLocal()

    try:
        clients = db.query(Client).all()

        return [
            {
                "id": client.id,
                "name": client.name,
                "phone": client.phone,
                "email": client.email,
                "status": client.status,
            }
            for client in clients
        ]

    finally:
        db.close()


@app.post("/clients")
def create_client(data: dict):
    db = SessionLocal()

    try:
        client = Client(
            name=data["name"],
            phone=data["phone"],
            email=data.get("email"),
            status="Новый"
        )

        db.add(client)

        db.commit()
        db.refresh(client)

        return {
            "status": "success",
            "id": client.id,
        }

    finally:
        db.close()


@app.get("/clients/{client_id}")
def get_client(client_id: int):
    db = SessionLocal()

    try:
        client = (
            db.query(Client)
            .filter(Client.id == client_id)
            .first()
        )

        if not client:
            return {"error": "not found"}

        return {
            "id": client.id,
            "name": client.name,
            "phone": client.phone,
            "email": client.email,
            "status": client.status,
            "notes": client.notes,
        }

    finally:
        db.close()


@app.put("/clients/{client_id}")
def update_client(
    client_id: int,
    data: ClientUpdate
):
    db = SessionLocal()

    try:
        client = (
            db.query(Client)
            .filter(Client.id == client_id)
            .first()
        )

        if not client:
            return {
                "error": "Client not found"
            }

        client.name = data.name
        client.phone = data.phone
        client.email = data.email
        client.status = data.status
        client.notes = data.notes

        db.commit()

        return {
            "status": "updated"
        }

    finally:
        db.close()


@app.get("/sales")
def get_sales():
    db = SessionLocal()

    try:
        sales = db.query(Sale).all()

        result = []

        for sale in sales:

            client = (
                db.query(Client)
                .filter(Client.id == sale.client_id)
                .first()
            )

            property_obj = (
                db.query(Property)
                .filter(Property.id == sale.property_id)
                .first()
            )

            result.append(
                {
                    "id": sale.id,

                    "client_id": sale.client_id,
                    "client_name": (
                        client.name
                        if client
                        else "Не найден"
                    ),

                    "property_id": sale.property_id,
                    "property_title": (
                        property_obj.title
                        if property_obj
                        else "Не найден"
                    ),

                    "amount": sale.amount,
                    "status": sale.status,
                }
            )

        return result

    finally:
        db.close()


@app.post("/sales")
def create_sale(data: SaleCreate):
    db = SessionLocal()

    try:
        sale = Sale(
            client_id=data.client_id,
            property_id=data.property_id,
            amount=data.amount,
            status="Подготовка"
        )

        db.add(sale)

        client = (
            db.query(Client)
            .filter(Client.id == data.client_id)
            .first()
        )

        if client:
            client.status = "Сделка"

        db.commit()
        db.refresh(sale)

        return {
            "id": sale.id,
            "status": "created"
        }

    finally:
        db.close()

@app.get("/sales/latest")
def get_latest_sales():
    db = SessionLocal()

    try:
        sales = (
            db.query(Sale)
            .order_by(Sale.id.desc())
            .limit(5)
            .all()
        )

        return [
            {
                "id": sale.id,
                "client_id": sale.client_id,
                "property_id": sale.property_id,
                "amount": sale.amount,
                "status": sale.status,
                "created_at": sale.created_at,
            }
            for sale in sales
        ]

    finally:
        db.close()


@app.get("/sales/{sale_id}")
def get_sale(sale_id: int):
    db = SessionLocal()

    try:
        sale = (
            db.query(Sale)
            .filter(Sale.id == sale_id)
            .first()
        )

        if not sale:
            return {"error": "Sale not found"}

        client = (
            db.query(Client)
            .filter(Client.id == sale.client_id)
            .first()
        )

        property_obj = (
            db.query(Property)
            .filter(Property.id == sale.property_id)
            .first()
        )

        return {
            "id": sale.id,
            "client_id": sale.client_id,
            "client_name": client.name if client else "",
            "property_id": sale.property_id,
            "property_title": property_obj.title if property_obj else "",
            "amount": sale.amount,
            "status": sale.status,
        }

    finally:
        db.close()


@app.post("/sales")
def create_sale(data: SaleCreate):
    db = SessionLocal()

    try:
        sale = Sale(
            client_id=data.client_id,
            property_id=data.property_id,
            amount=data.amount,
            status="Подготовка",
        )

        db.add(sale)

        client = (
            db.query(Client)
            .filter(Client.id == data.client_id)
            .first()
        )

        if client:
            client.status = "Сделка"

        db.commit()
        db.refresh(sale)

        return {
            "id": sale.id,
            "status": "created",
        }

    finally:
        db.close()


@app.put("/sales/{sale_id}")
def update_sale(
    sale_id: int,
    data: SaleUpdate,
):
    db = SessionLocal()

    try:
        sale = (
            db.query(Sale)
            .filter(Sale.id == sale_id)
            .first()
        )

        if not sale:
            return {"error": "Sale not found"}

        sale.client_id = data.client_id
        sale.property_id = data.property_id
        sale.amount = data.amount
        sale.status = data.status

        db.commit()
        db.refresh(sale)

        return {
            "status": "updated"
        }

    finally:
        db.close()


@app.delete("/sales/{sale_id}")
def delete_sale(sale_id: int):
    db = SessionLocal()

    try:
        sale = (
            db.query(Sale)
            .filter(Sale.id == sale_id)
            .first()
        )

        if not sale:
            return {
                "error": "Sale not found"
            }

        db.delete(sale)
        db.commit()

        return {
            "status": "deleted"
        }

    finally:
        db.close()

@app.put("/properties/{property_id}")
def update_property(
    property_id: int,
    data: PropertyUpdate,
):
    db = SessionLocal()

    try:
        property_obj = (
            db.query(Property)
            .filter(Property.id == property_id)
            .first()
        )

        if not property_obj:
            return {
                "error": "Property not found"
            }

        property_obj.title = data.title
        property_obj.description = data.description
        property_obj.price = data.price
        property_obj.area = data.area
        property_obj.rooms = data.rooms
        property_obj.city = data.city
        property_obj.district = data.district
        property_obj.address = data.address
        property_obj.status = data.status

        db.commit()

        return {
            "status": "updated"
        }

    finally:
        db.close()


@app.get("/clients/{client_id}/sales")
def get_client_sales(client_id: int):
    db = SessionLocal()

    try:
        sales = (
            db.query(Sale)
            .filter(Sale.client_id == client_id)
            .all()
        )

        result = []

        for sale in sales:
            property_obj = (
                db.query(Property)
                .filter(Property.id == sale.property_id)
                .first()
            )

            result.append(
                {
                    "id": sale.id,
                    "amount": sale.amount,
                    "status": sale.status,
                    "property_title": (
                        property_obj.title
                        if property_obj
                        else "Не найден"
                    ),
                }
            )

        return result

    finally:
        db.close()


@app.put("/clients/{client_id}")
def update_client(
    client_id: int,
    data: ClientUpdate,
):
    db = SessionLocal()

    try:
        client = (
            db.query(Client)
            .filter(Client.id == client_id)
            .first()
        )

        if not client:
            return {
                "error": "Client not found"
            }

        client.name = data.name
        client.phone = data.phone
        client.email = data.email
        client.status = data.status
        client.notes = data.notes

        db.commit()

        return {
            "status": "success"
        }

    finally:
        db.close()


@app.put("/sales/{sale_id}/status")
def update_sale_status(
    sale_id: int,
    data: SaleStatusUpdate,
):
    db = SessionLocal()

    try:
        sale = (
            db.query(Sale)
            .filter(Sale.id == sale_id)
            .first()
        )

        if not sale:
            return {
                "error": "Sale not found"
            }

        sale.status = data.status

        db.commit()

        return {
            "status": "updated"
        }

    finally:
        db.close()


@app.patch("/sales/{sale_id}/complete")
def complete_sale(sale_id: int):
    db = SessionLocal()

    try:
        sale = (
            db.query(Sale)
            .filter(Sale.id == sale_id)
            .first()
        )

        if not sale:
            return {
                "error": "Sale not found"
            }

        sale.status = "Завершена"

        client = (
            db.query(Client)
            .filter(Client.id == sale.client_id)
            .first()
        )

        if client:
            client.status = "Постоянный"

        db.commit()
        db.refresh(sale)

        return {
            "id": sale.id,
            "status": "completed",
        }

    finally:
        db.close()

@app.delete("/clients/{client_id}")
def delete_client(client_id: int):
    db = SessionLocal()

    try:
        client = (
            db.query(Client)
            .filter(Client.id == client_id)
            .first()
        )

        if not client:
            return {
                "error": "Client not found"
            }

        db.query(Sale).filter(
            Sale.client_id == client_id
        ).delete()

        db.delete(client)

        db.commit()

        return {
            "status": "deleted"
        }

    except SQLAlchemyError as e:
        db.rollback()
        print("DELETE CLIENT ERROR:", e)

        return {
            "error": str(e)
        }

    finally:
        db.close()

@app.delete("/sales/{sale_id}")
def delete_sale(sale_id: int):
    db = SessionLocal()

    try:
        sale = (
            db.query(Sale)
            .filter(Sale.id == sale_id)
            .first()
        )

        if not sale:
            return {
                "error": "Sale not found"
            }

        db.delete(sale)

        db.commit()

        return {
            "status": "deleted"
        }

    finally:
        db.close()

@app.get("/test-images")
def test_images():
    import os
    return {
        "cwd": os.getcwd(),
        "images_exists": os.path.exists("images"),
        "files": os.listdir("images") if os.path.exists("images") else []
    }

@app.post("/upload-image")
async def upload_image(
    file: UploadFile = File(...)
):
    ext = file.filename.split(".")[-1]

    filename = f"{uuid.uuid4()}.{ext}"

    file_path = f"images/{filename}"

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(
            file.file,
            buffer
        )

    return {
        "image_url": f"/images/{filename}"
    }

@app.post(
    "/properties/{property_id}/images"
)
async def upload_property_image(
    property_id: int,
    file: UploadFile = File(...)
):
    db = SessionLocal()

    try:
        property_obj = (
            db.query(Property)
            .filter(
                Property.id == property_id
            )
            .first()
        )

        if not property_obj:
            return {
                "error": "Property not found"
            }

        ext = file.filename.split(".")[-1]

        filename = (
            f"{uuid.uuid4()}.{ext}"
        )

        file_path = (
            f"images/{filename}"
        )

        with open(
                file_path,
                "wb"
        ) as buffer:
            shutil.copyfileobj(
                file.file,
                buffer
            )

        image = PropertyImage(
            property_id=property_id,
            image_url=f"/images/{filename}"
        )

        db.add(image)
        db.commit()
        db.refresh(image)

        return {
            "id": image.id,
            "image_url": image.image_url,
        }

    finally:
        db.close()

@app.get(
    "/properties/{property_id}/images"
)
def get_property_images(
    property_id: int
):
    db = SessionLocal()

    try:
        images = (
            db.query(PropertyImage)
            .filter(
                PropertyImage.property_id
                == property_id
            )
            .all()
        )

        return [
            {
                "id": img.id,
                "image_url": img.image_url,
            }
            for img in images
        ]

    finally:
        db.close()

@app.delete("/images/{image_id}")
def delete_image(image_id: int):
    db = SessionLocal()

    try:
        image = (
            db.query(PropertyImage)
            .filter(
                PropertyImage.id == image_id
            )
            .first()
        )

        if not image:
            return {
                "error": "Image not found"
            }

        db.delete(image)

        db.commit()

        return {
            "status": "deleted"
        }

    finally:
        db.close()

@app.post("/properties/{property_id}/image")
async def set_property_image(
    property_id: int,
    file: UploadFile = File(...)
):
    db = SessionLocal()

    try:
        property_obj = (
            db.query(Property)
            .filter(Property.id == property_id)
            .first()
        )

        if not property_obj:
            return {"error": "Property not found"}

        ext = file.filename.split(".")[-1]

        filename = f"{uuid.uuid4()}.{ext}"

        file_path = f"images/{filename}"

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(
                file.file,
                buffer
            )

        property_obj.image_url = (
            f"/images/{filename}"
        )

        db.commit()

        return {
            "image_url": property_obj.image_url
        }

    finally:
        db.close()

@app.delete(
    "/property-images/{image_id}"
)
def delete_property_image(
    image_id: int
):
    db = SessionLocal()

    try:
        image = (
            db.query(PropertyImage)
            .filter(
                PropertyImage.id == image_id
            )
            .first()
        )

        if not image:
            return {
                "error": "not found"
            }

        db.delete(image)
        db.commit()

        return {
            "status": "deleted"
        }

    finally:
        db.close()

@app.delete(
    "/property-images/{image_id}"
)
def delete_property_image(
    image_id: int
):
    db = SessionLocal()

    try:
        image = (
            db.query(PropertyImage)
            .filter(
                PropertyImage.id
                == image_id
            )
            .first()
        )

        if not image:
            return {
                "error": "not found"
            }

        db.delete(image)
        db.commit()

        return {
            "status": "deleted"
        }

    finally:
        db.close()

@app.post("/login")
def login(data: LoginSchema):
    db = SessionLocal()

    try:
        print("=" * 50)
        print("USERNAME:", data.username)
        print("PASSWORD:", data.password)

        user = (
            db.query(User)
            .filter(
                User.username == data.username
            )
            .first()
        )

        if not user:
            print("USER NOT FOUND")

            raise HTTPException(
                status_code=401,
                detail="Неверный логин"
            )

        print("USER FOUND")
        print("DB USERNAME:", user.username)
        print("HASH:", user.password_hash)

        password_ok = verify_password(
            data.password,
            user.password_hash
        )

        print(
            "PASSWORD VALID:",
            password_ok
        )

        if not password_ok:
            raise HTTPException(
                status_code=401,
                detail="Неверный пароль"
            )

        token = create_access_token(
            {
                "sub": str(user.id)
            }
        )

        print("TOKEN CREATED")
        print("=" * 50)

        return {
            "access_token": token
        }

    finally:
        db.close()

@app.get("/create-admin")
def create_admin():
    db = SessionLocal()

    existing = (
        db.query(User)
        .filter(
            User.username == "admin"
        )
        .first()
    )

    if existing:
        return {
            "message": "admin already exists"
        }

    password_hash = (
        pwd_context.hash("admin123")
    )

    user = User(
        username="admin",
        password_hash=password_hash,
        role="admin",
    )

    db.add(user)
    db.commit()

    return {
        "message": "admin created"
    }

@app.get("/test-hash")
def test_hash():
    return {
        "hash": pwd_context.hash("admin123")
    }

@app.get("/test-users")
def test_users():
    db = SessionLocal()

    users = db.query(User).all()

    return [
        {
            "id": u.id,
            "username": u.username,
            "role": u.role
        }
        for u in users
    ]

@app.get("/me")
def me(authorization: str = Header(None)):
    print("AUTH:", authorization)

    if not authorization:
        raise HTTPException(
            status_code=401,
            detail="Not authenticated"
        )

    token = authorization.replace(
        "Bearer ",
        ""
    )

    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        print("PAYLOAD:", payload)

        return payload

    except Exception as e:
        print("JWT ERROR:", e)

        raise HTTPException(
            status_code=401,
            detail="Invalid token"
        )

@app.get("/debug-properties")
def debug_properties():
    db = SessionLocal()

    return [
        {
            "id": p.id,
            "title": p.title,
            "price": p.price,
            "area": p.area,
            "rooms": p.rooms,
            "status": p.status,
        }
        for p in db.query(Property).all()
    ]

@app.get("/fix-properties")
def fix_properties():
    db = SessionLocal()

    props = db.query(Property).all()

    for p in props:

        if p.area is None:
            p.area = 0

        if p.rooms is None:
            p.rooms = 1

        if p.price is None:
            p.price = 0

        if not p.status:
            p.status = "Свободен"

    db.commit()

    return {
        "status": "fixed"
    }