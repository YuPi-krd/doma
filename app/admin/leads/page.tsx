"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Lead {
  id: number;
  name: string;
  phone: string;
  comment: string;
  status: string;
}

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "https://doma-nq4u.onrender.com"
).replace(/\/+$/, "");
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

export default function LeadsPage() {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadLeads = useCallback(async () => {
    setLoading(true);
    setError("");

    const storedToken =
      localStorage.getItem("access_token") ||
      localStorage.getItem("token") ||
      "";
    const token = storedToken.trim().replace(/^Bearer\s+/i, "");

    if (!token) {
      router.replace("/login");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/leads`, {
        method: "GET",
        cache: "no-store",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      const data: unknown = await response.json().catch(() => null);

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("token");
        router.replace("/login");
        return;
      }

      if (!response.ok) {
        const detail =
          data &&
          typeof data === "object" &&
          "detail" in data &&
          typeof data.detail === "string"
            ? data.detail
            : `Сервер вернул ошибку ${response.status}.`;
        throw new Error(detail);
      }

      if (!Array.isArray(data)) {
        throw new Error("Сервер вернул некорректный список заявок.");
      }

      setLeads(data as Lead[]);
    } catch (loadError) {
      console.error("DOMA: ошибка загрузки заявок:", loadError);
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Не удалось загрузить заявки. Попробуйте ещё раз."
      );
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void loadLeads();
  }, [loadLeads]);

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

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button
              type="button"
              onClick={() => void loadLeads()}
              disabled={loading}
              style={{
                background: "#fff",
                border: "1px solid #e2e8f0",
                padding: "12px 16px",
                borderRadius: "14px",
                fontWeight: 600,
                cursor: loading ? "wait" : "pointer",
                color: "#334155",
              }}
            >
              {loading ? "Обновляем…" : "↻ Обновить"}
            </button>
            <div
              style={{
                background: "white",
                padding: "12px 20px",
                borderRadius: "14px",
                boxShadow: "0 5px 15px rgba(0,0,0,.05)",
                fontWeight: 600,
              }}
            >
              Всего заявок: {loading ? "…" : error ? "—" : leads.length}
            </div>
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
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    style={{
                      padding: "50px",
                      textAlign: "center",
                      color: "#64748b",
                    }}
                  >
                    Загружаем заявки…
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td
                    colSpan={6}
                    style={{
                      padding: "32px",
                      textAlign: "center",
                      color: "#b91c1c",
                    }}
                  >
                    <div style={{ marginBottom: 14 }}>{error}</div>
                    <button
                      type="button"
                      onClick={() => void loadLeads()}
                      style={{
                        border: 0,
                        borderRadius: 10,
                        padding: "10px 18px",
                        background: "#2563eb",
                        color: "#fff",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Повторить загрузку
                    </button>
                  </td>
                </tr>
              ) : leads.length === 0 ? (
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