import Link from "next/link";
import ClientDeleteButton from "./ClientDeleteButton";

interface Client {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  status: string;
  notes: string | null;
}

interface ClientSale {
  id: number;
  amount: number;
  status: string;
  property_title: string;
}

async function getClient(
  id: string
): Promise<Client> {
  const res = await fetch(
    `http://127.0.0.1:8000/clients/${id}`,
    {
      cache: "no-store",
    }
  );

  if (!res.ok) {
    throw new Error("Клиент не найден");
  }

  return await res.json();
}

async function getClientSales(
  id: string
): Promise<ClientSale[]> {
  try {
    const res = await fetch(
      `http://127.0.0.1:8000/clients/${id}/sales`,
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
    case "Новый":
      return "#3b82f6";

    case "В работе":
      return "#f59e0b";

    case "Постоянный":
      return "#22c55e";

    case "Сделка":
      return "#8b5cf6";

    default:
      return "#64748b";
  }
}

export default async function ClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const client = await getClient(id);

  const sales =
    await getClientSales(id);

  const totalAmount =
    sales.reduce(
      (sum, sale) => sum + sale.amount,
      0
    );

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
          maxWidth: "1100px",
          margin: "0 auto",
        }}
      >
        {/* Шапка */}

        <div
          style={{
            background: "white",
            padding: "35px",
            borderRadius: "24px",
            boxShadow:
              "0 10px 30px rgba(0,0,0,.05)",
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: "38px",
              fontWeight: 700,
            }}
          >
            👤 {client.name}
          </h1>

          <div
            style={{
              marginTop: "20px",
              display: "grid",
              gap: "12px",
              fontSize: "18px",
            }}
          >
            <div>📞 {client.phone}</div>

            <div>
              📧{" "}
              {client.email ||
                "Не указан"}
            </div>

            <div
              style={{
                display: "inline-block",
                width: "fit-content",
                background:
                  getStatusColor(
                    client.status
                  ),
                color: "white",
                padding: "8px 16px",
                borderRadius: "999px",
                fontWeight: 600,
              }}
            >
              {client.status}
            </div>
          </div>

          <div
            style={{
              marginTop: "30px",
              display: "flex",
              gap: "15px",
              flexWrap: "wrap",
            }}
          >
            <Link
              href={`/admin/clients/${client.id}/new-sale`}
              style={{
                background: "#22c55e",
                color: "white",
                padding: "14px 24px",
                borderRadius: "12px",
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              ➕ Создать сделку
            </Link>

            <Link
              href={`/admin/clients/${client.id}/edit`}
              style={{
                background: "#f59e0b",
                color: "white",
                padding: "14px 24px",
                borderRadius: "12px",
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              ✏️ Редактировать
            </Link>

            <ClientDeleteButton
              clientId={client.id}
            />
          </div>
        </div>

        {/* Статистика */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(220px,1fr))",
            gap: "20px",
            marginTop: "30px",
          }}
        >
          <div
            style={cardStyle}
          >
            <div style={labelStyle}>
              Всего сделок
            </div>

            <div style={valueStyle}>
              {sales.length}
            </div>
          </div>

          <div
            style={cardStyle}
          >
            <div style={labelStyle}>
              Общая сумма
            </div>

            <div style={valueStyle}>
              {totalAmount.toLocaleString()} ₽
            </div>
          </div>

          <div
            style={cardStyle}
          >
            <div style={labelStyle}>
              Статус
            </div>

            <div style={valueStyle}>
              {client.status}
            </div>
          </div>
        </div>

        {/* Заметки */}

        <div
          style={{
            marginTop: "30px",
            background: "white",
            padding: "30px",
            borderRadius: "24px",
            boxShadow:
              "0 10px 30px rgba(0,0,0,.05)",
          }}
        >
          <h2>
            📝 Заметки клиента
          </h2>

          <div
            style={{
              marginTop: "15px",
              lineHeight: 1.7,
              color: "#475569",
            }}
          >
            {client.notes ||
              "Заметок пока нет"}
          </div>
        </div>

        {/* Сделки */}

        <div
          style={{
            marginTop: "30px",
            background: "white",
            padding: "30px",
            borderRadius: "24px",
            boxShadow:
              "0 10px 30px rgba(0,0,0,.05)",
          }}
        >
          <h2>
            💰 История сделок
          </h2>

          {sales.length === 0 ? (
            <div
              style={{
                color: "#64748b",
                marginTop: "15px",
              }}
            >
              Сделок пока нет
            </div>
          ) : (
            <>
              {sales.map((sale) => (
                <div
                  key={sale.id}
                  style={{
                    padding:
                      "18px 0",
                    borderBottom:
                      "1px solid #e2e8f0",
                  }}
                >
                  <div
                    style={{
                      fontWeight: 600,
                    }}
                  >
                    🏠{" "}
                    {
                      sale.property_title
                    }
                  </div>

                  <div
                    style={{
                      marginTop: "8px",
                      fontWeight: 700,
                    }}
                  >
                    💰{" "}
                    {sale.amount.toLocaleString()} ₽
                  </div>

                  <div
                    style={{
                      marginTop: "8px",
                      color: "#64748b",
                    }}
                  >
                    📄 {sale.status}
                  </div>
                </div>
              ))}

              <div
                style={{
                  marginTop: "20px",
                  paddingTop: "20px",
                  borderTop:
                    "2px solid #e2e8f0",
                  fontSize: "22px",
                  fontWeight: 700,
                }}
              >
                Общая сумма сделок:{" "}
                {totalAmount.toLocaleString()} ₽
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

const cardStyle = {
  background: "white",
  padding: "25px",
  borderRadius: "20px",
  boxShadow:
    "0 10px 30px rgba(0,0,0,.05)",
};

const labelStyle = {
  color: "#64748b",
};

const valueStyle = {
  fontSize: "32px",
  fontWeight: 700,
  marginTop: "10px",
};