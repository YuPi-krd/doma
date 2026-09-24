import Link from "next/link";
import CompleteSaleButton from "./CompleteSaleButton";

interface Sale {
  id: number;
  client_id: number;
  client_name: string;
  property_id: number;
  property_title: string;
  amount: number;
  status: string;
}

async function getSales(): Promise<Sale[]> {
  try {
    const res = await fetch(
      "https://doma-nq4u.onrender.com/sales",
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

export default async function SalesPage() {
  const sales = await getSales();

  const totalAmount = sales.reduce(
    (sum, sale) => sum + sale.amount,
    0
  );

  const completedSales = sales.filter(
    (sale) => sale.status === "Завершена"
  ).length;

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
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "30px",
          flexWrap: "wrap",
          gap: "15px",
        }}
      >
        <h1
          style={{
            fontSize: "42px",
            fontWeight: 700,
            margin: 0,
          }}
        >
          💰 Продажи
        </h1>

        <div
          style={{
            display: "flex",
            gap: "12px",
            alignItems: "center",
          }}
        >
          <div
            style={{
              background: "white",
              padding: "12px 20px",
              borderRadius: "14px",
              boxShadow:
                "0 5px 15px rgba(0,0,0,.05)",
              fontWeight: 600,
            }}
          >
            Всего сделок: {sales.length}
          </div>

          <Link
            href="/admin/sales/new"
            style={{
              background: "#22c55e",
              color: "white",
              padding: "12px 20px",
              borderRadius: "12px",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            ➕ Создать сделку
          </Link>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "20px",
          marginBottom: "30px",
        }}
      >
        <div
          style={{
            background: "white",
            padding: "25px",
            borderRadius: "20px",
            boxShadow:
              "0 10px 30px rgba(0,0,0,.05)",
          }}
        >
          <div style={{ color: "#64748b" }}>
            Всего сделок
          </div>

          <div
            style={{
              fontSize: "32px",
              fontWeight: 700,
              marginTop: "10px",
            }}
          >
            {sales.length}
          </div>
        </div>

        <div
          style={{
            background: "white",
            padding: "25px",
            borderRadius: "20px",
            boxShadow:
              "0 10px 30px rgba(0,0,0,.05)",
          }}
        >
          <div style={{ color: "#64748b" }}>
            Завершено
          </div>

          <div
            style={{
              fontSize: "32px",
              fontWeight: 700,
              marginTop: "10px",
              color: "#22c55e",
            }}
          >
            {completedSales}
          </div>
        </div>

        <div
          style={{
            background: "white",
            padding: "25px",
            borderRadius: "20px",
            boxShadow:
              "0 10px 30px rgba(0,0,0,.05)",
          }}
        >
          <div style={{ color: "#64748b" }}>
            Общая сумма
          </div>

          <div
            style={{
              fontSize: "28px",
              fontWeight: 700,
              marginTop: "10px",
            }}
          >
            {totalAmount.toLocaleString()} ₽
          </div>
        </div>
      </div>

      {sales.length === 0 ? (
        <div
          style={{
            background: "white",
            padding: "60px",
            borderRadius: "24px",
            textAlign: "center",
            boxShadow:
              "0 10px 30px rgba(0,0,0,.05)",
          }}
        >
          <h2>Сделок пока нет</h2>

          <p
            style={{
              color: "#64748b",
            }}
          >
            После оформления первой сделки
            она появится здесь.
          </p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gap: "20px",
          }}
        >
          {sales.map((sale) => (
            <div
              key={sale.id}
              style={{
                background: "white",
                padding: "30px",
                borderRadius: "24px",
                boxShadow:
                  "0 10px 30px rgba(0,0,0,.05)",
              }}
            >
              <h2>
                Сделка №{sale.id}
              </h2>

              <p>
                🏠 Объект: {sale.property_title}
              </p>

              <p>
                👤 Клиент: {sale.client_name}
              </p>

              <p
                style={{
                  fontSize: "24px",
                  fontWeight: 700,
                }}
              >
                💰 {sale.amount.toLocaleString()} ₽
              </p>

              <div
                style={{
                  display: "inline-block",
                  background:
                    getStatusColor(
                      sale.status
                    ),
                  color: "white",
                  padding: "8px 16px",
                  borderRadius: "999px",
                  fontWeight: 600,
                }}
              >
                {sale.status}
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  marginTop: "20px",
                  flexWrap: "wrap",
                }}
              >
                <Link
                  href={`/admin/sales/${sale.id}`}
                  style={{
                    background: "#2563eb",
                    color: "white",
                    padding: "12px 18px",
                    borderRadius: "10px",
                    textDecoration: "none",
                    fontWeight: 600,
                  }}
                >
                  👁 Открыть
                </Link>

                <Link
                  href={`/admin/sales/${sale.id}/edit`}
                  style={{
                    background: "#f59e0b",
                    color: "white",
                    padding: "12px 18px",
                    borderRadius: "10px",
                    textDecoration: "none",
                    fontWeight: 600,
                  }}
                >
                  ✏️ Редактировать
                </Link>

                {sale.status !==
                  "Завершена" && (
                  <CompleteSaleButton
                    saleId={sale.id}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}