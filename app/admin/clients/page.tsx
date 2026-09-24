import Link from "next/link";
import ClientSearch from "./ClientSearch";

interface Client {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  status: string;
}

async function getClients(): Promise<Client[]> {
  try {
    const res = await fetch(
      "https://doma-nq4u.onrender.com/clients",
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

export default async function ClientsPage() {
  const clients = await getClients();

  const newClients = clients.filter(
    (c) => c.status === "Новый"
  ).length;

  const selectionClients = clients.filter(
    (c) => c.status === "Подбор объекта"
  ).length;

  const dealClients = clients.filter(
    (c) => c.status === "Сделка"
  ).length;

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        padding: "40px",
      }}
    >
      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
        }}
      >
        {/* HEADER */}

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
          <div>
            <h1
              style={{
                fontSize: "42px",
                margin: 0,
              }}
            >
              👥 Клиенты
            </h1>

            <p
              style={{
                color: "#64748b",
                marginTop: "8px",
              }}
            >
              Управление клиентской базой
            </p>
          </div>

          <Link
            href="/admin/clients/new"
            style={{
              background: "#22c55e",
              color: "white",
              padding: "14px 24px",
              borderRadius: "12px",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            ➕ Новый клиент
          </Link>
        </div>

        {/* CRM STATS */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(220px,1fr))",
            gap: "20px",
            marginBottom: "30px",
          }}
        >
          <div style={cardStyle}>
            <div style={labelStyle}>
              Всего клиентов
            </div>

            <div style={valueStyle}>
              {clients.length}
            </div>
          </div>

          <div style={cardStyle}>
            <div style={labelStyle}>
              Новые
            </div>

            <div
              style={{
                ...valueStyle,
                color: "#f59e0b",
              }}
            >
              {newClients}
            </div>
          </div>

          <div style={cardStyle}>
            <div style={labelStyle}>
              Подбор объекта
            </div>

            <div
              style={{
                ...valueStyle,
                color: "#2563eb",
              }}
            >
              {selectionClients}
            </div>
          </div>

          <div style={cardStyle}>
            <div style={labelStyle}>
              Сделка
            </div>

            <div
              style={{
                ...valueStyle,
                color: "#22c55e",
              }}
            >
              {dealClients}
            </div>
          </div>
        </div>

        {/* CLIENTS */}

        {clients.length === 0 ? (
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
            <h2>Клиентов пока нет</h2>

            <p
              style={{
                color: "#64748b",
              }}
            >
              Добавьте первого клиента
            </p>
          </div>
        ) : (
          <ClientSearch clients={clients} />
        )}
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
  marginBottom: "10px",
};

const valueStyle = {
  fontSize: "34px",
  fontWeight: 700,
};