import PropertyGallery from "@/components/PropertyGallery";
import LeadModal from "@/components/LeadModal";

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
  image_url: string | null;
}

async function getProperty(
  id: string
): Promise<Property> {
  const res = await fetch(
    `https://doma-nq4u.onrender.com/properties/${id}`,
    {
      cache: "no-store",
    }
  );

  if (!res.ok) {
    throw new Error(
      "Ошибка загрузки объекта"
    );
  }

  return res.json();
}

export default async function PropertyPage({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const { id } = await params;

  const property =
    await getProperty(id);

  const imageUrl =
    property.image_url
      ? `https://doma-nq4u.onrender.com${property.image_url}`
      : "/images/test-flat.jpg";

  return (
    <main
      style={{
        background: "#f8fafc",
        minHeight: "100vh",
        padding: "40px",
      }}
    >
      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
        }}
      >
        {/* Галерея */}

        <PropertyGallery
          images={[imageUrl]}
        />

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "2fr 380px",
            gap: "30px",
            marginTop: "30px",
          }}
        >
          {/* Левая колонка */}

          <div>
            <h1
              style={{
                fontSize: "48px",
                marginBottom: "10px",
              }}
            >
              {property.title}
            </h1>

            <p
              style={{
                color: "#64748b",
                fontSize: "18px",
                marginBottom: "25px",
              }}
            >
              {property.address}
            </p>

            {/* Характеристики */}

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit,minmax(180px,1fr))",
                gap: "16px",
                marginBottom: "30px",
              }}
            >
              <div
                style={{
                  background: "white",
                  padding: "20px",
                  borderRadius: "16px",
                }}
              >
                🏠 Комнат

                <h3>
                  {property.rooms}
                </h3>
              </div>

              <div
                style={{
                  background: "white",
                  padding: "20px",
                  borderRadius: "16px",
                }}
              >
                📐 Площадь

                <h3>
                  {property.area || 0} м²
                </h3>
              </div>

              <div
                style={{
                  background: "white",
                  padding: "20px",
                  borderRadius: "16px",
                }}
              >
                🏙️ Город

                <h3>
                  {property.city}
                </h3>
              </div>

              <div
                style={{
                  background: "white",
                  padding: "20px",
                  borderRadius: "16px",
                }}
              >
                📍 Район

                <h3>
                  {property.district}
                </h3>
              </div>
            </div>

            {/* Описание */}

            <div
              style={{
                background: "white",
                padding: "30px",
                borderRadius: "24px",
                marginBottom: "25px",
              }}
            >
              <h2>
                Описание объекта
              </h2>

              <p
                style={{
                  lineHeight: "1.8",
                  color: "#475569",
                }}
              >
                {property.description}
              </p>
            </div>

            {/* Адрес */}

            <div
              style={{
                background: "white",
                padding: "30px",
                borderRadius: "24px",
              }}
            >
              <h2>
                Расположение
              </h2>

              <p>
                {property.address}
              </p>
            </div>
          </div>

          {/* Правая колонка */}

          <div>
            <div
              style={{
                position: "sticky",
                top: "30px",
                background: "white",
                borderRadius: "24px",
                padding: "30px",
                boxShadow:
                  "0 10px 30px rgba(0,0,0,.05)",
              }}
            >
              <div
                style={{
                  fontSize: "42px",
                  fontWeight: 700,
                  color: "#22c55e",
                }}
              >
                {property.price.toLocaleString(
                  "ru-RU"
                )} ₽
              </div>

              <p
                style={{
                  color: "#64748b",
                  marginTop: "10px",
                }}
              >
                Стоимость объекта
              </p>

              <div
                style={{
                  marginTop: "25px",
                }}
              >
                <LeadModal
                  propertyId={
                    property.id
                  }
                />
              </div>

              <hr
                style={{
                  margin:
                    "25px 0",
                }}
              />

              <p>
                📞 Консультация
              </p>

              <p
                style={{
                  color: "#475569",
                  lineHeight: "1.7",
                }}
              >
                Поможем подобрать
                объект и оформить
                сделку.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}