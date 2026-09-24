import Link from "next/link";
import SaleDeleteButton from "./SaleDeleteButton";

interface Sale {
  id: number;
  client_id: number;
  client_name: string;
  property_id: number;
  property_title: string;
  amount: number;
  status: string;
}

async function getSale(
  id: string
): Promise<Sale | null> {
  try {
    const res = await fetch(
      `https://doma-nq4u.onrender.com/sales/${id}`,
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

export default async function SalePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const sale = await getSale(id);

  if (!sale) {
    return (
      <main
        style={{
          padding: "40px",
        }}
      >
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
            gap: "20px",
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: "42px",
                fontWeight: 800,
              }}
            >
              Сделка №{sale.id}
            </h1>

            <p
              style={{
                color: "#64748b",
                marginTop: "10px",
              }}
            >
              Карточка сделки
            </p>
          </div>

          <div
            style={{
              display: "flex",
              gap: "12px",
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <Link
              href="/admin/sales"
              style={{
                background: "#e2e8f0",
                color: "#0f172a",
                textDecoration: "none",
                padding: "12px 18px",
                borderRadius: "12px",
                fontWeight: 600,
              }}
            >
              ← К сделкам
            </Link>

            <Link
              href={`/admin/sales/${sale.id}/edit`}
              style={{
                background: "#f59e0b",
                color: "white",
                textDecoration: "none",
                padding: "12px 18px",
                borderRadius: "12px",
                fontWeight: 600,
              }}
            >
              ✏️ Редактировать
            </Link>

            <SaleDeleteButton
              saleId={sale.id}
            />

            <div
              style={{
                background:
                  getStatusColor(
                    sale.status
                  ),
                color: "white",
                padding: "12px 20px",
                borderRadius: "999px",
                fontWeight: 700,
              }}
            >
              {sale.status}
            </div>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(300px,1fr))",
            gap: "25px",
          }}
        >
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
                color: "#64748b",
                marginBottom: "10px",
              }}
            >
              Клиент
            </div>

            <h2
              style={{
                margin: 0,
                fontSize: "28px",
              }}
            >
              👤 {sale.client_name}
            </h2>

            <div
              style={{
                marginTop: "15px",
                color: "#64748b",
              }}
            >
              ID клиента: {sale.client_id}
            </div>
          </div>

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
                color: "#64748b",
                marginBottom: "10px",
              }}
            >
              Объект недвижимости
            </div>

            <h2
              style={{
                margin: 0,
                fontSize: "28px",
              }}
            >
              🏠 {sale.property_title}
            </h2>

            <div
              style={{
                marginTop: "15px",
                color: "#64748b",
              }}
            >
              ID объекта: {sale.property_id}
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: "30px",
            background: "white",
            borderRadius: "24px",
            padding: "35px",
            boxShadow:
              "0 10px 30px rgba(0,0,0,.05)",
          }}
        >
          <div
            style={{
              color: "#64748b",
              marginBottom: "10px",
            }}
          >
            Сумма сделки
          </div>

          <div
            style={{
              fontSize: "52px",
              fontWeight: 800,
              color: "#22c55e",
            }}
          >
            {sale.amount.toLocaleString()} ₽
          </div>
        </div>

        <div
          style={{
            marginTop: "30px",
            background: "white",
            borderRadius: "24px",
            padding: "35px",
            boxShadow:
              "0 10px 30px rgba(0,0,0,.05)",
          }}
        >
          <h2
            style={{
              marginTop: 0,
            }}
          >
            Информация о сделке
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit,minmax(250px,1fr))",
              gap: "20px",
              marginTop: "20px",
            }}
          >
            <div>
              <b>ID сделки:</b>
              <br />
              {sale.id}
            </div>

            <div>
              <b>Статус:</b>
              <br />
              {sale.status}
            </div>

            <div>
              <b>Клиент:</b>
              <br />
              {sale.client_name}
            </div>

            <div>
              <b>Объект:</b>
              <br />
              {sale.property_title}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}