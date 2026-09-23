import Link from "next/link";
import PropertyGallery from "./PropertyGallery";

interface Property {
  id: number;
  title: string;
  description: string;
  price: number;
  area: number;
  rooms: number;
  city: string;
  district: string;
  address: string;
  status: string;
}

interface PropertyImage {
  id: number;
  image_url: string;
}

async function getProperty(
  id: string
): Promise<Property | null> {
  try {
    const res = await fetch(
      `http://127.0.0.1:8000/properties/${id}`,
      {
        cache: "no-store",
      }
    );

    if (!res.ok) {
      return null;
    }

    return await res.json();
  } catch {
    return null;
  }
}

async function getImages(
  propertyId: string
): Promise<PropertyImage[]> {
  try {
    const res = await fetch(
      `http://127.0.0.1:8000/properties/${propertyId}/images`,
      {
        cache: "no-store",
      }
    );

    if (!res.ok) {
      return [];
    }

    return await res.json();
  } catch {
    return [];
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case "Свободен":
      return "#22c55e";

    case "Бронь":
      return "#f59e0b";

    case "Продан":
      return "#ef4444";

    default:
      return "#64748b";
  }
}

export default async function PropertyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const property =
    await getProperty(id);

  const images =
    await getImages(id);

  if (!property) {
    return (
      <main
        style={{
          padding: "40px",
        }}
      >
        <h1>
          Объект не найден
        </h1>
      </main>
    );
  }

  return (
    <main
      style={{
        padding: "40px",
        background: "#f8fafc",
        minHeight: "100vh",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "center",
            marginBottom: "30px",
            flexWrap: "wrap",
            gap: "15px",
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: "40px",
              }}
            >
              {property.title}
            </h1>

            <p
              style={{
                color: "#64748b",
              }}
            >
              ID объекта: {property.id}
            </p>
          </div>

          <div
            style={{
              display: "flex",
              gap: "10px",
            }}
          >
            <Link
              href="/admin/properties"
              style={{
                background: "#e2e8f0",
                color: "#0f172a",
                padding: "12px 20px",
                borderRadius: "12px",
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              ← К объектам
            </Link>

            <Link
              href={`/admin/properties/${property.id}/edit`}
              style={{
                background: "#2563eb",
                color: "white",
                padding: "12px 20px",
                borderRadius: "12px",
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              ✏️ Редактировать
            </Link>

            <Link
              href={`/admin/properties/${property.id}/photos`}
              style={{
                background: "#7c3aed",
                color: "white",
                padding: "12px 20px",
                borderRadius: "12px",
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              📷 Фотографии
            </Link>
          </div>
        </div>

        <PropertyGallery images={images} />

        <div
          style={{
            background: "white",
            borderRadius: "24px",
            padding: "30px",
            boxShadow:
              "0 10px 30px rgba(0,0,0,.05)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent:
                "space-between",
              alignItems: "center",
              marginBottom: "25px",
              flexWrap: "wrap",
              gap: "10px",
            }}
          >
            <h2
              style={{
                margin: 0,
              }}
            >
              Информация об объекте
            </h2>

            <div
              style={{
                background:
                  getStatusColor(
                    property.status
                  ),
                color: "white",
                padding:
                  "10px 18px",
                borderRadius:
                  "999px",
                fontWeight: 600,
              }}
            >
              {property.status}
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit,minmax(250px,1fr))",
              gap: "20px",
              marginBottom: "30px",
            }}
          >
            <div>
              <strong>
                💰 Цена
              </strong>

              <p
                style={{
                  fontSize: "32px",
                  fontWeight: 700,
                  color: "#22c55e",
                }}
              >
                {property.price.toLocaleString()} ₽
              </p>
            </div>

            <div>
              <strong>
                📐 Площадь
              </strong>

              <p>
                {property.area} м²
              </p>
            </div>

            <div>
              <strong>
                🚪 Комнат
              </strong>

              <p>
                {property.rooms}
              </p>
            </div>
          </div>

          <hr
            style={{
              border: "none",
              borderTop:
                "1px solid #e2e8f0",
              margin: "25px 0",
            }}
          />

          <div
            style={{
              marginBottom: "20px",
            }}
          >
            <strong>
              🏙 Город
            </strong>
            <p>{property.city}</p>
          </div>

          <div
            style={{
              marginBottom: "20px",
            }}
          >
            <strong>
              📍 Район
            </strong>
            <p>
              {property.district}
            </p>
          </div>

          <div
            style={{
              marginBottom: "20px",
            }}
          >
            <strong>
              🏠 Адрес
            </strong>
            <p>
              {property.address}
            </p>
          </div>

          <div>
            <strong>
              📝 Описание
            </strong>

            <p
              style={{
                lineHeight: 1.8,
                color: "#334155",
              }}
            >
              {property.description}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}