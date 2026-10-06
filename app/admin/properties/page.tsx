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
  property_type_label?: string;
  area?: number;
  rooms?: number;
}

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [activeTab, setActiveTab] = useState<"sale" | "rent">("sale");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("https://doma-nq4u.onrender.com/properties")
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

  const filteredProperties = useMemo(() => {
    return properties.filter(
      (item) => item.deal_type === activeTab
    );
  }, [properties, activeTab]);

  return (
    <main
      style={{
        padding: 40,
        maxWidth: 1400,
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
          marginBottom: 40,
        }}
      >
        <button
          onClick={() => setActiveTab("sale")}
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
          onClick={() => setActiveTab("rent")}
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
          marginBottom: 30,
          fontSize: 20,
          fontWeight: 600,
        }}
      >
        {activeTab === "sale"
          ? `Продажа (${filteredProperties.length})`
          : `Аренда (${filteredProperties.length})`}
      </div>

      {loading && <p>Загрузка объектов...</p>}

      {!loading && filteredProperties.length === 0 && (
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
        {filteredProperties.map((property) => (
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
              src={`https://doma-nq4u.onrender.com${property.image_url}`}
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

              <p>{property.city}</p>

              <p>{property.district}</p>

              <p>
                {property.rooms} комн. •{" "}
                {property.area} м²
              </p>

              <div
                style={{
                  color: "#dc2626",
                  fontWeight: 700,
                  fontSize: 24,
                  marginTop: 10,
                }}
              >
                {Number(property.price).toLocaleString()}
                ₽
              </div>

              <div
                style={{
                  marginTop: 15,
                  display: "inline-block",
                  background: "#dcfce7",
                  color: "#166534",
                  padding: "8px 12px",
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
                  href={`/crm/property/${property.id}`}
                  style={{
                    flex: 1,
                    textAlign: "center",
                    background: "#1e293b",
                    color: "#fff",
                    padding: 12,
                    borderRadius: 12,
                    textDecoration: "none",
                  }}
                >
                  Открыть
                </Link>

                <button
                  style={{
                    flex: 1,
                    background: "#dc2626",
                    color: "#fff",
                    border: "none",
                    borderRadius: 12,
                    cursor: "pointer",
                  }}
                >
                  Удалить
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}