"use client";

import Link from "next/link";

const buttonStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 108,
  padding: "28px 36px",
  borderRadius: 14,
  color: "#ffffff",
  textDecoration: "none",
  fontSize: 22,
  fontWeight: 700,
  boxShadow: "0 8px 20px rgba(15, 23, 42, 0.10)",
  transition: "transform 160ms ease, box-shadow 160ms ease",
} as const;

export default function PropertiesPage() {
  return (
    <main
      style={{
        boxSizing: "border-box",
        width: "100%",
        minHeight: "100%",
        padding: "56px 40px",
        background: "#f1f5f9",
      }}
    >
      <section
        style={{
          maxWidth: 900,
          margin: "0 auto",
        }}
      >
        <h1
          style={{
            margin: "0 0 32px",
            color: "#111827",
            fontSize: 32,
            fontWeight: 750,
            lineHeight: 1.2,
          }}
        >
          Объекты недвижимости
        </h1>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 22,
          }}
        >
          <Link
            href="/crm/sale"
            style={{ ...buttonStyle, background: "#dc2626" }}
            aria-label="Перейти в CRM для продажи недвижимости"
          >
            Продажа
          </Link>

          <Link
            href="/crm/rent"
            style={{ ...buttonStyle, background: "#1e293b" }}
            aria-label="Перейти в CRM для аренды недвижимости"
          >
            Аренда
          </Link>
        </div>
      </section>
    </main>
  );
}
