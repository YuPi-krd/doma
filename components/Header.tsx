"use client";

import Link from "next/link";
import CallbackModal from "@/components/CallbackModal";

export default function Header() {
  return (
    <header
      style={{
        height: "80px",
        background: "#fff",
        borderBottom: "1px solid #e5e7eb",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 30px",
        }}
      >
        {/* Логотип */}

        <Link
          href="/"
          style={{
            fontSize: "40px",
            fontWeight: 800,
            textDecoration: "none",
            color: "#111827",
          }}
        >
          DO<span style={{ color: "#ef4444" }}>MA</span>
        </Link>

        {/* Меню */}

        <nav
          style={{
            display: "flex",
            gap: "40px",
            alignItems: "center",
          }}
        >
          <Link
            href="/catalog"
            style={{
              textDecoration: "none",
              color: "#111827",
              fontWeight: 500,
            }}
          >
            Недвижимость
          </Link>

          <Link
            href="/services"
            style={{
              textDecoration: "none",
              color: "#111827",
              fontWeight: 500,
            }}
          >
            Услуги
          </Link>

          <Link
            href="/about"
            style={{
              textDecoration: "none",
              color: "#111827",
              fontWeight: 500,
            }}
          >
            О компании
          </Link>

          <Link
            href="/contacts"
            style={{
              textDecoration: "none",
              color: "#111827",
              fontWeight: 500,
            }}
          >
            Контакты
          </Link>
        </nav>

        {/* Правая часть */}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <button
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              border: "1px solid #e5e7eb",
              background: "#fff",
              cursor: "pointer",
              fontSize: "18px",
            }}
          >
            ♡
          </button>

          <CallbackModal />
        </div>
      </div>
    </header>
  );
}