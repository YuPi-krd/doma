import Link from "next/link";
import UpdateLeadStatusButton from "./UpdateLeadStatusButton";

interface Lead {
  id: number;
  name: string;
  phone: string;
  comment: string;
  status: string;
  property_id: number;
}

async function getLead(
  id: string
): Promise<Lead | null> {
  try {
    const res = await fetch(
      `http://127.0.0.1:8000/leads/${id}`,
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
    case "Новая":
      return "#f59e0b";

    case "В работе":
      return "#2563eb";

    case "Закрыта":
      return "#22c55e";

    default:
      return "#64748b";
  }
}

export default async function LeadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const lead = await getLead(id);

  if (!lead) {
    return (
      <main style={{ padding: "40px" }}>
        <h1>Заявка не найдена</h1>
      </main>
    );
  }

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
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        {/* HEADER */}

        <div
          style={{
            background: "white",
            borderRadius: "24px",
            padding: "30px",
            marginBottom: "25px",
            boxShadow:
              "0 10px 30px rgba(0,0,0,.05)",
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "20px",
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: "42px",
              }}
            >
              📞 {lead.name}
            </h1>

            <p
              style={{
                marginTop: "10px",
                color: "#64748b",
                fontSize: "18px",
              }}
            >
              Заявка #{lead.id}
            </p>

            <p
              style={{
                marginTop: "8px",
                fontSize: "18px",
                fontWeight: 600,
              }}
            >
              {lead.phone}
            </p>
          </div>

          <div
            style={{
              background:
                getStatusColor(
                  lead.status
                ),
              color: "white",
              padding:
                "12px 22px",
              borderRadius:
                "999px",
              fontWeight: 700,
              fontSize: "16px",
            }}
          >
            {lead.status}
          </div>
        </div>

        {/* INFO */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(250px,1fr))",
            gap: "20px",
            marginBottom: "25px",
          }}
        >
          <div style={cardStyle}>
            <div style={labelStyle}>
              👤 Клиент
            </div>

            <div style={valueStyle}>
              {lead.name}
            </div>
          </div>

          <div style={cardStyle}>
            <div style={labelStyle}>
              📞 Телефон
            </div>

            <div style={valueStyle}>
              {lead.phone}
            </div>
          </div>

          <div style={cardStyle}>
            <div style={labelStyle}>
              🏠 Объект
            </div>

            <div style={valueStyle}>
              ID {lead.property_id}
            </div>
          </div>
        </div>

        {/* COMMENT */}

        <div
          style={{
            background: "white",
            borderRadius: "24px",
            padding: "30px",
            marginBottom: "25px",
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
            📝 Комментарий клиента
          </h2>

          <p
            style={{
              lineHeight: 1.8,
              fontSize: "17px",
            }}
          >
            {lead.comment ||
              "Комментарий отсутствует"}
          </p>
        </div>

        {/* ACTIONS */}

        <div
          style={{
            display: "flex",
            gap: "15px",
            flexWrap: "wrap",
          }}
        >
          {lead.status === "Новая" && (
            <UpdateLeadStatusButton
              leadId={lead.id}
              newStatus="В работе"
              text="🟢 Взять в работу"
            />
          )}

          {lead.status === "В работе" && (
            <UpdateLeadStatusButton
              leadId={lead.id}
              newStatus="Закрыта"
              text="✅ Закрыть заявку"
            />
          )}

          <Link
            href={`/admin/properties/${lead.property_id}`}
            style={{
              background: "#2563eb",
              color: "white",
              padding:
                "14px 24px",
              borderRadius:
                "12px",
              textDecoration:
                "none",
              fontWeight: 600,
            }}
          >
            🏠 Открыть объект
          </Link>

          <Link
            href="/admin/clients"
            style={{
              background: "#22c55e",
              color: "white",
              padding:
                "14px 24px",
              borderRadius:
                "12px",
              textDecoration:
                "none",
              fontWeight: 600,
            }}
          >
            👤 Клиенты
          </Link>

          <Link
            href="/admin/leads"
            style={{
              background: "#64748b",
              color: "white",
              padding:
                "14px 24px",
              borderRadius:
                "12px",
              textDecoration:
                "none",
              fontWeight: 600,
            }}
          >
            ← Назад
          </Link>
        </div>
      </div>
    </main>
  );
}

const cardStyle = {
  background: "white",
  borderRadius: "20px",
  padding: "25px",
  boxShadow:
    "0 10px 30px rgba(0,0,0,.05)",
};

const labelStyle = {
  color: "#64748b",
  marginBottom: "10px",
};

const valueStyle = {
  fontSize: "22px",
  fontWeight: 700,
};