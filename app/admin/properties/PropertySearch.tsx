"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import DeletePropertyButton from "@/components/DeletePropertyButton";

interface Property {
  id: number;
  title: string;
  price: number;
  rooms: number;
  city: string;
}

export default function PropertySearch({
  properties,
}: {
  properties: Property[];
}) {
  const [query, setQuery] = useState("");

  const filteredProperties = useMemo(() => {
    return properties.filter((property) =>
      [
        property.title,
        property.city,
        String(property.id),
      ]
        .join(" ")
        .toLowerCase()
        .includes(query.toLowerCase())
    );
  }, [properties, query]);

  return (
    <>
      <input
        type="text"
        placeholder="Поиск по названию, городу или ID..."
        value={query}
        onChange={(e) =>
          setQuery(e.target.value)
        }
        style={{
          width: "100%",
          padding: "16px",
          border: "2px solid #e2e8f0",
          borderRadius: "14px",
          marginBottom: "25px",
          fontSize: "16px",
        }}
      />

      {filteredProperties.length === 0 ? (
        <div
          style={{
            background: "white",
            padding: "40px",
            borderRadius: "20px",
            textAlign: "center",
          }}
        >
          Ничего не найдено
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fill,minmax(350px,1fr))",
            gap: "20px",
          }}
        >
          {filteredProperties.map(
            (property) => (
              <div
                key={property.id}
                style={{
                  background: "white",
                  borderRadius: "20px",
                  padding: "25px",
                  boxShadow:
                    "0 10px 30px rgba(0,0,0,.05)",
                }}
              >
                <div
                  style={{
                    marginBottom: "15px",
                  }}
                >
                  <span
                    style={{
                      background: "#eef2ff",
                      color: "#4f46e5",
                      padding: "6px 12px",
                      borderRadius: "999px",
                      fontSize: "14px",
                    }}
                  >
                    ID #{property.id}
                  </span>
                </div>

                <h2
                  style={{
                    fontSize: "24px",
                    marginBottom: "15px",
                  }}
                >
                  {property.title}
                </h2>

                <div
                  style={{
                    fontSize: "30px",
                    fontWeight: 700,
                    color: "#ef4444",
                    marginBottom: "20px",
                  }}
                >
                  {property.price.toLocaleString()} ₽
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                    marginBottom: "20px",
                  }}
                >
                  <div>
                    <b>Комнат:</b>{" "}
                    {property.rooms}
                  </div>

                  <div>
                    <b>Город:</b>{" "}
                    {property.city}
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    flexWrap: "wrap",
                  }}
                >
                  <Link
                    href={`/admin/properties/${property.id}`}
                    style={{
                      flex: 1,
                      background: "#22c55e",
                      color: "white",
                      padding: "12px",
                      borderRadius: "10px",
                      textDecoration: "none",
                      textAlign: "center",
                      fontWeight: 600,
                    }}
                  >
                    👁️ Просмотр
                  </Link>

                  <Link
                    href={`/admin/properties/${property.id}/edit`}
                    style={{
                      flex: 1,
                      background: "#2563eb",
                      color: "white",
                      padding: "12px",
                      borderRadius: "10px",
                      textDecoration: "none",
                      textAlign: "center",
                      fontWeight: 600,
                    }}
                  >
                    ✏️ Редактировать
                  </Link>

                  <DeletePropertyButton
                    id={property.id}
                  />
                </div>
              </div>
            )
          )}
        </div>
      )}
    </>
  );
}