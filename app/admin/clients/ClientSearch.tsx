"use client";

import { useState } from "react";
import Link from "next/link";

interface Client {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  status: string;
}

function getStatusColor(status: string) {
  switch (status) {
    case "Новый":
      return "#3b82f6";

    case "Связались":
      return "#f59e0b";

    case "Подбор объекта":
      return "#8b5cf6";

    case "Показ":
      return "#ec4899";

    case "Переговоры":
      return "#ef4444";

    case "Сделка":
      return "#22c55e";

    case "Закрыт":
      return "#64748b";

    default:
      return "#64748b";
  }
}

export default function ClientSearch({
  clients,
}: {
  clients: Client[];
}) {
  const [search, setSearch] =
    useState("");

  const filteredClients =
    clients.filter((client) => {
      const value =
        search.toLowerCase();

      return (
        client.name
          .toLowerCase()
          .includes(value) ||
        client.phone.includes(value) ||
        (client.email || "")
          .toLowerCase()
          .includes(value)
      );
    });

  return (
    <>
      <input
        type="text"
        placeholder="🔍 Поиск клиента..."
        value={search}
        onChange={(e) =>
          setSearch(e.target.value)
        }
        style={{
          width: "100%",
          padding: "16px",
          marginBottom: "25px",
          borderRadius: "14px",
          border: "1px solid #e2e8f0",
          fontSize: "16px",
          background: "white",
        }}
      />

      <div
        style={{
          display: "grid",
          gap: "20px",
        }}
      >
        {filteredClients.map(
          (client) => (
            <Link
              key={client.id}
              href={`/admin/clients/${client.id}`}
              style={{
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <div
                style={{
                  background: "white",
                  padding: "25px",
                  borderRadius: "20px",
                  boxShadow:
                    "0 10px 30px rgba(0,0,0,.05)",
                  transition: ".2s",
                  cursor: "pointer",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "15px",
                  }}
                >
                  <div>
                    <h2
                      style={{
                        marginTop: 0,
                        marginBottom: "12px",
                      }}
                    >
                      👤 {client.name}
                    </h2>

                    <p
                      style={{
                        margin: "6px 0",
                      }}
                    >
                      📞 {client.phone}
                    </p>

                    <p
                      style={{
                        margin: "6px 0",
                        color: "#64748b",
                      }}
                    >
                      📧{" "}
                      {client.email ||
                        "Не указан"}
                    </p>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexDirection:
                        "column",
                      alignItems:
                        "flex-end",
                      gap: "10px",
                    }}
                  >
                    <div
                      style={{
                        background:
                          getStatusColor(
                            client.status
                          ),
                        color: "white",
                        padding:
                          "10px 18px",
                        borderRadius:
                          "999px",
                        fontWeight: 600,
                        minWidth: "140px",
                        textAlign:
                          "center",
                      }}
                    >
                      {client.status}
                    </div>

                    <div
                      style={{
                        fontSize: "14px",
                        color: "#64748b",
                      }}
                    >
                      ID: {client.id}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          )
        )}

        {filteredClients.length ===
          0 && (
          <div
            style={{
              background: "white",
              padding: "40px",
              borderRadius: "20px",
              textAlign: "center",
            }}
          >
            Клиенты не найдены
          </div>
        )}
      </div>
    </>
  );
}