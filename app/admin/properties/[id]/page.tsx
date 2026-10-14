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
  floor?: number | null;
  total_floors?: number | null;
  bathroom?: string | null;
  balcony?: string | null;
  renovation?: string | null;
  building_material?: string | null;
  year_built?: number | null;
  room_layout?: string | null;
  living_area?: number | null;
  kitchen_area?: number | null;
  plot_area?: number | null;
  plot_length?: number | null;
  plot_width?: number | null;
  frontage?: number | null;
  land_purpose?: string | null;
  heating?: string | null;
  gas?: boolean;
  water?: boolean;
  electricity?: boolean;
  sewerage?: boolean;
  fenced?: string | null;
  terrace?: boolean;
  bathhouse?: boolean;
  sauna?: boolean;
  pool?: boolean;
  garage?: boolean;
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
      `https://doma-nq4u.onrender.com/properties/${id}`,
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
      `https://doma-nq4u.onrender.com/properties/${propertyId}/images`,
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

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "12px",
              margin: "8px 0 24px",
            }}
          >
            {[
              property.floor != null && property.floor > 0 ? { label: "Этаж", value: `${property.floor}${property.total_floors ? ` из ${property.total_floors}` : ""}` } : null,
              property.year_built ? { label: "Год постройки", value: String(property.year_built) } : null,
              property.room_layout ? { label: "Планировка", value: property.room_layout } : null,
              property.living_area ? { label: "Жилая площадь", value: `${property.living_area} м²` } : null,
              property.kitchen_area ? { label: "Площадь кухни", value: `${property.kitchen_area} м²` } : null,
              property.bathroom ? { label: "Санузел", value: property.bathroom } : null,
              property.balcony ? { label: "Балкон / лоджия", value: property.balcony } : null,
              property.renovation ? { label: "Ремонт", value: property.renovation } : null,
              property.building_material ? { label: "Материал стен", value: property.building_material } : null,
              property.heating ? { label: "Отопление", value: property.heating } : null,
              property.plot_area ? { label: "Площадь участка", value: `${property.plot_area} сот.` } : null,
              property.plot_length ? { label: "Длина участка", value: `${property.plot_length} м` } : null,
              property.plot_width ? { label: "Ширина участка", value: `${property.plot_width} м` } : null,
              property.frontage ? { label: "Фасад участка", value: `${property.frontage} м` } : null,
              property.land_purpose ? { label: "Назначение земли", value: property.land_purpose } : null,
              property.fenced ? { label: "Ограждение", value: property.fenced } : null,
              property.gas ? { label: "Коммуникации", value: "Газ" } : null,
              property.water ? { label: "Коммуникации", value: "Вода" } : null,
              property.electricity ? { label: "Коммуникации", value: "Электричество" } : null,
              property.sewerage ? { label: "Коммуникации", value: "Канализация" } : null,
              property.terrace ? { label: "Дополнительно", value: "Терраса" } : null,
              property.bathhouse ? { label: "Дополнительно", value: "Баня" } : null,
              property.sauna ? { label: "Дополнительно", value: "Сауна" } : null,
              property.pool ? { label: "Дополнительно", value: "Бассейн" } : null,
              property.garage ? { label: "Дополнительно", value: "Гараж" } : null,
            ].filter((item): item is { label: string; value: string } => Boolean(item)).map((item, index) => (
              <div key={`${item.label}-${item.value}-${index}`} style={{ background: "#f8fafc", borderRadius: "12px", padding: "12px 14px" }}>
                <div style={{ color: "#64748b", fontSize: "12px", marginBottom: "5px" }}>{item.label}</div>
                <strong style={{ color: "#0f172a", fontSize: "14px" }}>{item.value}</strong>
              </div>
            ))}
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