import Link from "next/link";
import EditSaleForm from "./EditSaleForm";

interface Sale {
  id: number;
  client_id: number;
  property_id: number;
  amount: number;
  status: string;
}

async function getSale(
  id: string
): Promise<Sale | null> {
  try {
    const res = await fetch(
      `http://127.0.0.1:8000/sales/${id}`,
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

function getStatusColor(status: string) {
  switch (status) {
    case "Подготовка":
      return "#f59e0b";

    case "Договор":
      return "#3b82f6";

    case "Регистрация":
      return "#8b5cf6";

    case "Завершена":
      return "#22c55e";

    default:
      return "#64748b";
  }
}

export default async function EditSalePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const sale = await getSale(id);

  if (!sale) {
    return (
      <main style={{ padding: 40 }}>
        Сделка не найдена
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
          maxWidth: "900px",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            background: "white",
            borderRadius: "28px",
            padding: "40px",
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
              marginBottom: "35px",
              flexWrap: "wrap",
              gap: "15px",
            }}
          >
            <div>
              <h1
                style={{
                  margin: 0,
                  fontSize: "34px",
                  fontWeight: 700,
                }}
              >
                ✏️ Редактирование сделки
              </h1>

              <p
                style={{
                  marginTop: "8px",
                  color: "#64748b",
                }}
              >
                Сделка №{sale.id}
              </p>
            </div>

            <div
              style={{
                background:
                  getStatusColor(
                    sale.status
                  ),
                color: "white",
                padding: "10px 18px",
                borderRadius: "999px",
                fontWeight: 600,
              }}
            >
              {sale.status}
            </div>
          </div>

         <EditSaleForm sale={sale} />
        </div>
      </div>
    </main>
  );
}