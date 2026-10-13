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

  const [deletingId, setDeletingId] = useState<number | null>(null);

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

const deleteProperty = async (id: number) => {
  if (deletingId !== null) return;
  if (!window.confirm(`Удалить объект №${id}? Это действие нельзя отменить.`)) return;

  setDeletingId(id);

  try {
    const response = await fetch(
      `https://doma-nq4u.onrender.com/properties/${id}`,
      { method: "DELETE" }
    );

    const responseText = await response.text();
    let payload: { detail?: string; message?: string; status?: string; error?: string } = {};
    if (responseText) {
      try {
        payload = JSON.parse(responseText);
      } catch {
        // Backend may return plain-text error details.
      }
    }

    if (!response.ok) {
      const reason = payload.detail || payload.message || payload.error || responseText;
      throw new Error(
        reason
          ? `Сервер не удалил объект (${response.status}): ${reason}`
          : `Сервер не удалил объект. Код ответа: ${response.status}`
      );
    }

    setProperties((current) => current.filter((item) => item.id !== id));
  } catch (error) {
    console.error("DOMA: ошибка удаления объекта", error);
    const message = error instanceof Error ? error.message : "Неизвестная ошибка";
    window.alert(`Не удалось удалить объект.\n\n${message}\n\nЕсли ошибка связана с сервером, проверьте логи backend на Render.`);
  } finally {
    setDeletingId(null);
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
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 20,
          flexWrap: "wrap",
          marginBottom: 30,
        }}
      >
        <h1
          style={{
            fontSize: 36,
            fontWeight: 700,
            margin: 0,
          }}
        >
          Объекты недвижимости
        </h1>

        {/* Открываем CRM-форму создания объекта для выбранного типа сделки. */}
        <Link
          href={activeTab === "rent" ? "/crm/rent" : "/crm/sale"}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            minHeight: 48,
            padding: "0 22px",
            borderRadius: 12,
            background: "#16a34a",
            color: "#fff",
            fontSize: 15,
            fontWeight: 700,
            textDecoration: "none",
            whiteSpace: "nowrap",
            boxShadow: "0 6px 16px rgba(22, 163, 74, .18)",
          }}
        >
          <span aria-hidden="true" style={{ fontSize: 20, lineHeight: 1 }}>+</span>
          Добавить объявление
        </Link>
      </div>

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
                    href={`/admin/properties/${property.id}`}
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
                      type="button"
                      onClick={() => deleteProperty(property.id)}
                      disabled={deletingId !== null}
                      style={{
                        flex: 1,
                        background: deletingId === property.id ? "#991b1b" : "#dc2626",
                        color: "#fff",
                        border: "none",
                        borderRadius: 12,
                        cursor: deletingId !== null ? "wait" : "pointer",
                        opacity: deletingId !== null && deletingId !== property.id ? 0.65 : 1,
                        padding: 12,
                      }}
                    >
                      {deletingId === property.id ? "Удаление…" : "Удалить"}
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