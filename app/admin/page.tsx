import Link from "next/link";

interface Stats {
  properties: number;
  leads: number;
  clients: number;
  sales: number;
  revenue: number;
}

interface Lead {
  id: number;
  name: string;
  phone: string;
  comment: string;
  status?: string;
}

interface Sale {
  id: number;
  client: string;
  property: string;
  amount: number;
  status: string;
}

async function getLatestSales(): Promise<Sale[]> {
  try {
    const res = await fetch(
      "https://doma-nq4u.onrender.com/sales/latest",
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

async function getStats(): Promise<Stats> {
  try {
    const res = await fetch(
      "https://doma-nq4u.onrender.com/stats",
      {
        cache: "no-store",
      }
    );

    if (!res.ok) {
      throw new Error();
    }

    return await res.json();
  } catch {
    return {
      properties: 0,
      leads: 0,
      clients: 0,
      sales: 0,
      revenue: 0,
    };
  }
}

async function getLeads(): Promise<Lead[]> {
  try {
    const res = await fetch(
      "https://doma-nq4u.onrender.com/leads",
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

export default async function AdminDashboard() {
  const stats = await getStats();
  const leads = await getLeads();
  const sales = await getLatestSales();

  const cards = [
    {
      title: "Объекты",
      value: stats.properties,
      icon: "🏠",
      color: "#2563eb",
    },
    {
      title: "Заявки",
      value: stats.leads,
      icon: "📞",
      color: "#f59e0b",
    },
    {
      title: "Клиенты",
      value: stats.clients,
      icon: "👥",
      color: "#8b5cf6",
    },
    {
      title: "Сделки",
      value: stats.sales,
      icon: "💰",
      color: "#22c55e",
    },
    {
      title: "Выручка",
      value:
        stats.revenue.toLocaleString() +
        " ₽",
      icon: "📈",
      color: "#ef4444",
    },
  ];

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
          marginBottom: "35px",
        }}
      >
        <h1
          style={{
            fontSize: "44px",
            margin: 0,
            fontWeight: 700,
          }}
        >
          DOMA CRM
        </h1>

        <p
          style={{
            color: "#64748b",
            marginTop: "10px",
            fontSize: "18px",
          }}
        >
          Панель управления агентством недвижимости
        </p>
      </div>

      {/* Статистика */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(220px,1fr))",
          gap: "20px",
          marginBottom: "35px",
        }}
      >
        {cards.map((item) => (
          <div
            key={item.title}
            style={{
              background: "white",
              padding: "25px",
              borderRadius: "24px",
              boxShadow:
                "0 10px 30px rgba(0,0,0,.05)",
              borderTop: `5px solid ${item.color}`,
            }}
          >
            <div
              style={{
                fontSize: "32px",
                marginBottom: "10px",
              }}
            >
              {item.icon}
            </div>

            <div
              style={{
                color: "#64748b",
                fontSize: "15px",
              }}
            >
              {item.title}
            </div>

            <div
              style={{
                fontSize: "32px",
                fontWeight: 700,
                marginTop: "10px",
              }}
            >
              {item.value}
            </div>
          </div>
        ))}
      </div>

      {/* Быстрые действия */}

      <div
        style={{
          background: "white",
          padding: "30px",
          borderRadius: "24px",
          marginBottom: "35px",
          boxShadow:
            "0 10px 30px rgba(0,0,0,.05)",
        }}
      >
        <h2
          style={{
            marginTop: 0,
            marginBottom: "20px",
          }}
        >
          ⚡ Быстрые действия
        </h2>

        <div
          style={{
            display: "flex",
            gap: "15px",
            flexWrap: "wrap",
          }}
        >
          <Link
            href="/admin/properties/new"
            style={buttonBlue}
          >
            ➕ Новый объект
          </Link>

          <Link
            href="/admin/clients"
            style={buttonGreen}
          >
            👥 Клиенты
          </Link>

          <Link
            href="/admin/leads"
            style={buttonOrange}
          >
            📞 Заявки
          </Link>

          <Link
            href="/admin/sales"
            style={buttonPurple}
          >
            💰 Сделки
          </Link>
        </div>
      </div>

      {/* Последние заявки */}

      <div
        style={{
          background: "white",
          borderRadius: "24px",
          padding: "30px",
          boxShadow:
            "0 10px 30px rgba(0,0,0,.05)",
        }}
      >
        <h2
          style={{
            marginTop: 0,
            marginBottom: "25px",
          }}
        >
          📞 Последние заявки
        </h2>

        {leads.length === 0 ? (
          <div
            style={{
              color: "#64748b",
            }}
          >
            Заявок пока нет
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gap: "15px",
            }}
          >
            {leads
              .slice(0, 5)
              .map((lead) => (
                <div
                  key={lead.id}
                  style={{
                    border:
                      "1px solid #e2e8f0",
                    borderRadius: "16px",
                    padding: "20px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent:
                        "space-between",
                      alignItems: "center",
                    }}
                  >
                    <strong>
                      {lead.name}
                    </strong>

                    <span
                      style={{
                        color: "#64748b",
                      }}
                    >
                      #{lead.id}
                    </span>
                  </div>

                  <div
                    style={{
                      marginTop: "8px",
                      color: "#64748b",
                    }}
                  >
                    {lead.phone}
                  </div>

                  <div
                    style={{
                      marginTop: "12px",
                    }}
                  >
                    {lead.comment ||
                      "Без комментария"}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
      {/* Последние сделки */}

<div
  style={{
    marginTop: "35px",
    background: "white",
    borderRadius: "24px",
    padding: "30px",
    boxShadow:
      "0 10px 30px rgba(0,0,0,.05)",
  }}
>
  <h2
    style={{
      marginTop: 0,
      marginBottom: "25px",
    }}
  >
    💰 Последние сделки
  </h2>

  {sales.length === 0 ? (
    <div
      style={{
        color: "#64748b",
      }}
    >
      Сделок пока нет
    </div>
  ) : (
    <div
      style={{
        display: "grid",
        gap: "15px",
      }}
    >
      {sales.map((sale) => (
        <div
          key={sale.id}
          style={{
            border:
              "1px solid #e2e8f0",
            borderRadius: "16px",
            padding: "20px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent:
                "space-between",
              alignItems: "center",
            }}
          >
            <strong>
              Сделка #{sale.id}
            </strong>

            <span
              style={{
                fontWeight: 700,
                color: "#22c55e",
              }}
            >
              {sale.amount.toLocaleString()} ₽
            </span>
          </div>

          <div
            style={{
              marginTop: "10px",
              color: "#64748b",
            }}
          >
            👤 {sale.client}
          </div>

          <div
            style={{
              marginTop: "5px",
              color: "#64748b",
            }}
          >
            🏠 {sale.property}
          </div>

          <div
            style={{
              marginTop: "10px",
              display: "inline-block",
              background:
                sale.status ===
                "Завершена"
                  ? "#22c55e"
                  : "#f59e0b",
              color: "white",
              padding: "6px 12px",
              borderRadius: "999px",
              fontSize: "14px",
              fontWeight: 600,
            }}
          >
            {sale.status}
          </div>
        </div>
      ))}
    </div>
  )}
</div>
    </main>
  );
}

const buttonBlue = {
  background: "#2563eb",
  color: "white",
  padding: "14px 22px",
  borderRadius: "12px",
  textDecoration: "none",
  fontWeight: 600,
};

const buttonGreen = {
  background: "#22c55e",
  color: "white",
  padding: "14px 22px",
  borderRadius: "12px",
  textDecoration: "none",
  fontWeight: 600,
};

const buttonOrange = {
  background: "#f59e0b",
  color: "white",
  padding: "14px 22px",
  borderRadius: "12px",
  textDecoration: "none",
  fontWeight: 600,
};

const buttonPurple = {
  background: "#8b5cf6",
  color: "white",
  padding: "14px 22px",
  borderRadius: "12px",
  textDecoration: "none",
  fontWeight: 600,
};