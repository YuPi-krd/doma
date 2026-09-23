import Link from "next/link";

interface Lead {
  id: number;
  name: string;
  phone: string;
  comment: string;
  status: string;
}

async function getLeads(): Promise<Lead[]> {
  try {
    const res = await fetch(
      "http://127.0.0.1:8000/leads",
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
    case "Новая":
      return {
        bg: "#FEF3C7",
        color: "#92400E",
      };

    case "В работе":
      return {
        bg: "#DBEAFE",
        color: "#1E40AF",
      };

    case "Закрыта":
      return {
        bg: "#DCFCE7",
        color: "#166534",
      };

    default:
      return {
        bg: "#E2E8F0",
        color: "#475569",
      };
  }
}

export default async function LeadsPage() {
  const leads = await getLeads();

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
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "30px",
          }}
        >
          <h1
            style={{
              fontSize: "42px",
              margin: 0,
            }}
          >
            📞 Заявки клиентов
          </h1>

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
            Всего заявок: {leads.length}
          </div>
        </div>

        <div
          style={{
            background: "white",
            borderRadius: "24px",
            overflow: "hidden",
            boxShadow:
              "0 10px 30px rgba(0,0,0,.05)",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr
                style={{
                  background: "#0f172a",
                  color: "white",
                }}
              >
                <th
                  style={{
                    padding: "20px",
                    width: "80px",
                  }}
                >
                  ID
                </th>

                <th
                  style={{
                    padding: "20px",
                    textAlign: "left",
                  }}
                >
                  Имя
                </th>

                <th
                  style={{
                    padding: "20px",
                    textAlign: "left",
                  }}
                >
                  Телефон
                </th>

                <th
                  style={{
                    padding: "20px",
                    textAlign: "left",
                  }}
                >
                  Комментарий
                </th>

                <th
                  style={{
                    padding: "20px",
                    width: "160px",
                  }}
                >
                  Статус
                </th>

                <th
                  style={{
                    padding: "20px",
                    width: "180px",
                  }}
                >
                  Действия
                </th>
              </tr>
            </thead>

            <tbody>
              {leads.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    style={{
                      padding: "50px",
                      textAlign: "center",
                      color: "#64748b",
                    }}
                  >
                    Заявок пока нет
                  </td>
                </tr>
              ) : (
                leads.map((lead) => {
                  const colors =
                    getStatusColor(
                      lead.status || "Новая"
                    );

                  return (
                    <tr
                      key={lead.id}
                      style={{
                        borderBottom:
                          "1px solid #e2e8f0",
                      }}
                    >
                      <td
                        style={{
                          padding: "20px",
                          fontWeight: 600,
                        }}
                      >
                        #{lead.id}
                      </td>

                      <td
                        style={{
                          padding: "20px",
                        }}
                      >
                        {lead.name || "—"}
                      </td>

                      <td
                        style={{
                          padding: "20px",
                        }}
                      >
                        {lead.phone || "—"}
                      </td>

                      <td
                        style={{
                          padding: "20px",
                        }}
                      >
                        {lead.comment ||
                          "Без комментария"}
                      </td>

                      <td
                        style={{
                          padding: "20px",
                          textAlign: "center",
                        }}
                      >
                        <span
                          style={{
                            background:
                              colors.bg,
                            color:
                              colors.color,
                            padding:
                              "8px 14px",
                            borderRadius:
                              "999px",
                            fontWeight: 600,
                            fontSize:
                              "14px",
                          }}
                        >
                          {lead.status ||
                            "Новая"}
                        </span>
                      </td>

                      <td
                        style={{
                          padding: "20px",
                          textAlign: "center",
                        }}
                      >
                        <Link
                          href={`/admin/leads/${lead.id}`}
                          style={{
                            display:
                              "inline-block",
                            background:
                              "#2563eb",
                            color: "white",
                            padding:
                              "10px 18px",
                            borderRadius:
                              "10px",
                            textDecoration:
                              "none",
                            fontWeight: 600,
                          }}
                        >
                          👁 Открыть
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}