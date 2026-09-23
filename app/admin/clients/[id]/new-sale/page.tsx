import Link from "next/link";
import CreateSaleForm from "./CreateSaleForm";

interface Property {
  id: number;
  title: string;
  price?: number;
  city?: string;
}

async function getProperties(): Promise<Property[]> {
  try {
    const res = await fetch(
      "http://127.0.0.1:8000/properties",
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

export default async function NewSalePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const properties =
    await getProperties();

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
          maxWidth: "900px",
          margin: "0 auto",
        }}
      >
        <Link
          href={`/admin/clients/${id}`}
          style={{
            textDecoration: "none",
            color: "#64748b",
            fontWeight: 500,
          }}
        >
          ← Назад к клиенту
        </Link>

        <div
          style={{
            marginTop: "20px",
            marginBottom: "30px",
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: "42px",
              fontWeight: 700,
            }}
          >
            ➕ Новая сделка
          </h1>

          <p
            style={{
              color: "#64748b",
              marginTop: "10px",
            }}
          >
            Создание сделки для клиента №{id}
          </p>
        </div>

        <div
          style={{
            background: "white",
            borderRadius: "24px",
            padding: "35px",
            boxShadow:
              "0 10px 30px rgba(0,0,0,.05)",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit,minmax(220px,1fr))",
              gap: "20px",
              marginBottom: "30px",
            }}
          >
            <div
              style={{
                background: "#eff6ff",
                padding: "20px",
                borderRadius: "18px",
              }}
            >
              <div
                style={{
                  fontSize: "14px",
                  color: "#64748b",
                }}
              >
                Клиент
              </div>

              <div
                style={{
                  marginTop: "8px",
                  fontWeight: 700,
                  fontSize: "18px",
                }}
              >
                ID #{id}
              </div>
            </div>

            <div
              style={{
                background: "#f0fdf4",
                padding: "20px",
                borderRadius: "18px",
              }}
            >
              <div
                style={{
                  fontSize: "14px",
                  color: "#64748b",
                }}
              >
                Доступно объектов
              </div>

              <div
                style={{
                  marginTop: "8px",
                  fontWeight: 700,
                  fontSize: "18px",
                }}
              >
                {properties.length}
              </div>
            </div>
          </div>

          <CreateSaleForm
            clientId={id}
            properties={properties}
          />
        </div>
      </div>
    </main>
  );
}