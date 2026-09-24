import Link from "next/link";

interface Property {
  id: number;
  title: string;
  price: number;
  area: number;
  rooms: number;
  city: string;
  district: string;
  image_url: string;
}

const API_URL = "https://doma-nq4u.onrender.com";

async function getProperties(): Promise<Property[]> {
  const res = await fetch(
    `${API_URL}/properties`,
    {
      cache: "no-store",
    }
  );

  if (!res.ok) {
    return [];
  }

  return res.json();
}

export default async function ExclusiveProperties() {
  const properties = await getProperties();

  return (
    <section
      style={{
        maxWidth: "1400px",
        margin: "100px auto",
        padding: "0 20px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "30px",
        }}
      >
        <div>
          <p
            style={{
              color: "#94a3b8",
              textTransform: "uppercase",
              fontSize: "12px",
              letterSpacing: "2px",
            }}
          >
            Эксклюзивная база
          </p>

          <h2
            style={{
              fontSize: "48px",
              fontWeight: 700,
            }}
          >
            Только у нас
          </h2>
        </div>

        <Link
          href="/catalog"
          style={{
            textDecoration: "none",
            color: "#111827",
            fontWeight: 600,
          }}
        >
          Все объекты →
        </Link>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(350px,1fr))",
          gap: "24px",
        }}
      >
        {properties.slice(0, 3).map((property) => (
          <Link
            key={property.id}
            href={`/property/${property.id}`}
            style={{
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <div
              style={{
                background: "#fff",
                borderRadius: "24px",
                overflow: "hidden",
                boxShadow:
                  "0 10px 30px rgba(0,0,0,.05)",
              }}
            >
              <div
                style={{
                  position: "relative",
                }}
              >
                <img
  src={`${API_URL}${property.image_url}`}
  alt={property.title}
  style={{
    width: "100%",
    height: "260px",
    objectFit: "cover",
  }}
/>

                <div
                  style={{
                    position: "absolute",
                    top: "15px",
                    left: "15px",
                    background: "#fff",
                    padding: "6px 12px",
                    borderRadius: "999px",
                    fontSize: "12px",
                    fontWeight: 600,
                  }}
                >
                  Эксклюзив
                </div>
              </div>

              <div
                style={{
                  padding: "20px",
                }}
              >
                <h3
                  style={{
                    fontSize: "32px",
                    fontWeight: 700,
                    marginBottom: "10px",
                  }}
                >
                  {property.price.toLocaleString(
                    "ru-RU"
                  )} ₽
                </h3>

                <p
                  style={{
                    fontWeight: 600,
                    marginBottom: "8px",
                  }}
                >
                  {property.title}
                </p>

                <p
                  style={{
                    color: "#64748b",
                    marginBottom: "12px",
                  }}
                >
                  {property.area} м² • {property.rooms} комн.
                </p>

                <p
                  style={{
                    color: "#94a3b8",
                  }}
                >
                  {property.city}, {property.district}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}