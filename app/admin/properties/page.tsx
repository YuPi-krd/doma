"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

interface Property {
  id: number;
  title: string;
  city: string;
  district: string;
  price: number;
  status: string;
  image_url?: string;
  deal_type: string;
  is_draft?: boolean;
  property_type_label?: string;
  area?: number;
  rooms?: number;
}

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [activeTab, setActiveTab] =
    useState<"sale" | "rent">("sale");

  const [showDrafts, setShowDrafts] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    fetch(
      "https://doma-nq4u.onrender.com/properties"
    )
      .then((res) => res.json())
      .then((data) => {
        setProperties(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const publishProperty = async (
  id: number
) => {
  try {
    const res = await fetch(
      `https://doma-nq4u.onrender.com/properties/${id}/publish`,
      {
        method: "PUT",
      }
    );

    if (!res.ok) {
      throw new Error(
        "Ошибка публикации"
      );
    }

    setProperties((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              is_draft: false,
            }
          : item
      )
    );
  } catch (err) {
    console.error(err);
    alert(
      "Не удалось опубликовать объект"
    );
  }
};

const deleteProperty = async (
  id: number
) => {
  if (!confirm("Удалить объект?")) {
    return;
  }

  try {
    const res = await fetch(
      `https://doma-nq4u.onrender.com/properties/${id}`,
      {
        method: "DELETE",
      }
    );

    if (!res.ok) {
      throw new Error(
        "Ошибка удаления"
      );
    }

    setProperties((prev) =>
      prev.filter(
        (item) => item.id !== id
      )
    );
  } catch (err) {
    console.error(err);
    alert(
      "Не удалось удалить объект"
    );
  }
};

  const publishedProperties = useMemo(() => {
    return properties.filter(
      (item) =>
        item.deal_type === activeTab &&
        !item.is_draft
    );
  }, [properties, activeTab]);

  const draftProperties = useMemo(() => {
    return properties.filter(
      (item) =>
        item.deal_type === activeTab &&
        item.is_draft
    );
  }, [properties, activeTab]);

  const visibleProperties = showDrafts
    ? draftProperties
    : publishedProperties;

  return (
    <main
      style={{
        padding: 40,
        maxWidth: 1400,
        margin: "0 auto",
      }}
    >
      <h1
        style={{
          fontSize: 36,
          fontWeight: 700,
          marginBottom: 30,
        }}
      >
        Объекты недвижимости
      </h1>

      <div
        style={{
          display: "flex",
          gap: 20,
          marginBottom: 20,
        }}
      >
        <button
          onClick={() =>
            setActiveTab("sale")
          }
          style={{
            background:
              activeTab === "sale"
                ? "#dc2626"
                : "#1e293b",
            color: "#fff",
            border: "none",
            padding: "20px 40px",
            borderRadius: 16,
            fontSize: 20,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Продажа
        </button>

        <button
          onClick={() =>
            setActiveTab("rent")
          }
          style={{
            background:
              activeTab === "rent"
                ? "#dc2626"
                : "#1e293b",
            color: "#fff",
            border: "none",
            padding: "20px 40px",
            borderRadius: 16,
            fontSize: 20,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Аренда
        </button>
      </div>

      <div
        style={{
          display: "flex",
          gap: 12,
          marginBottom: 30,
        }}
      >
        <button
          onClick={() =>
            setShowDrafts(false)
          }
          style={{
            background: !showDrafts
              ? "#dc2626"
              : "#e5e7eb",
            color: !showDrafts
              ? "#fff"
              : "#111827",
            border: "none",
            padding: "12px 24px",
            borderRadius: 12,
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Объявления
        </button>

        <button
          onClick={() =>
            setShowDrafts(true)
          }
          style={{
            background: showDrafts
              ? "#f59e0b"
              : "#e5e7eb",
            color: showDrafts
              ? "#fff"
              : "#111827",
            border: "none",
            padding: "12px 24px",
            borderRadius: 12,
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Черновики
        </button>
      </div>

      <div
        style={{
          marginBottom: 30,
          fontSize: 20,
          fontWeight: 600,
        }}
      >
        {showDrafts
          ? `Черновики (${draftProperties.length})`
          : activeTab === "sale"
          ? `Продажа (${publishedProperties.length})`
          : `Аренда (${publishedProperties.length})`}
      </div>

      {loading && (
        <p>Загрузка объектов...</p>
      )}

      {!loading &&
        visibleProperties.length === 0 && (
          <div
            style={{
              background: "#fff",
              padding: 40,
              borderRadius: 20,
            }}
          >
            Объектов пока нет
          </div>
        )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fill,minmax(350px,1fr))",
          gap: 24,
        }}
      >
        {visibleProperties.map(
          (property) => (
            <div
              key={property.id}
              style={{
                background: "#fff",
                borderRadius: 20,
                overflow: "hidden",
                boxShadow:
                  "0 8px 30px rgba(0,0,0,.08)",
              }}
            >
              <img
                src={
                  property.image_url
                    ? `https://doma-nq4u.onrender.com${property.image_url}`
                    : "/placeholder.jpg"
                }
                alt={property.title}
                style={{
                  width: "100%",
                  height: 220,
                  objectFit: "cover",
                }}
              />

              <div
                style={{
                  padding: 20,
                }}
              >
                <h3
                  style={{
                    margin: 0,
                    marginBottom: 10,
                    fontSize: 22,
                  }}
                >
                  {property.title}
                </h3>

                {property.is_draft && (
                  <div
                    style={{
                      display:
                        "inline-block",
                      background:
                        "#f59e0b",
                      color: "#fff",
                      padding:
                        "6px 12px",
                      borderRadius: 999,
                      fontSize: 12,
                      marginBottom: 10,
                      fontWeight: 600,
                    }}
                  >
                    Черновик
                  </div>
                )}

                <p>{property.city}</p>

                <p>
                  {property.district}
                </p>

                <p>
                  {property.rooms} комн.
                  • {property.area} м²
                </p>

                <div
                  style={{
                    color: "#dc2626",
                    fontWeight: 700,
                    fontSize: 24,
                    marginTop: 10,
                  }}
                >
                  {Number(
                    property.price
                  ).toLocaleString()}
                  ₽
                </div>

                <div
                  style={{
                    marginTop: 15,
                    display:
                      "inline-block",
                    background:
                      "#dcfce7",
                    color: "#166534",
                    padding:
                      "8px 12px",
                    borderRadius: 999,
                    fontSize: 14,
                  }}
                >
                  {property.status}
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    marginTop: 20,
                  }}
                >
                  <Link
                    href={`/admin/property/${property.id}`}
                    style={{
                      flex: 1,
                      textAlign:
                        "center",
                      background:
                        "#1e293b",
                      color: "#fff",
                      padding: 12,
                      borderRadius: 12,
                      textDecoration:
                        "none",
                    }}
                  >
                    Открыть
                  </Link>

                  {property.is_draft ? (
                    <button
                      onClick={() =>
                        publishProperty(property.id)
                      }
                      style={{
                        flex: 1,
                        background:
                          "#16a34a",
                        color: "#fff",
                        border: "none",
                        borderRadius: 12,
                        cursor:
                          "pointer",
                        padding: 12,
                      }}
                    >
                      Опубликовать
                    </button>
                  ) : (
                    <button
                      onClick={() =>
                        deleteProperty(property.id)
                      }
                      style={{
                        flex: 1,
                        background:
                          "#dc2626",
                        color: "#fff",
                        border: "none",
                        borderRadius: 12,
                        cursor:
                          "pointer",
                        padding: 12,
                      }}
                    >
                      Удалить
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        )}
      </div>
    </main>
  );
}