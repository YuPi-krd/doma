"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminSidebar() {
  const pathname = usePathname();

  function logout() {
    localStorage.removeItem("token");

    window.location.href = "/login";
  }

  const menu = [
    {
      href: "/admin",
      label: "📊 Dashboard",
    },
    {
      href: "/admin/properties",
      label: "🏠 Объекты",
    },
    {
      href: "/admin/leads",
      label: "📞 Заявки",
    },
    {
      href: "/admin/clients",
      label: "👥 Клиенты",
    },
    {
      href: "/admin/sales",
      label: "💰 Продажи",
    },
    {
      href: "/admin/settings",
      label: "⚙️ Настройки",
    },
  ];

  return (
    <aside
      style={{
        width: "260px",
        background: "#0f172a",
        color: "white",
        padding: "24px",
        borderRight: "1px solid #1e293b",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <h2
        style={{
          margin: 0,
          marginBottom: "40px",
          fontSize: "24px",
          fontWeight: 700,
        }}
      >
        🏠 DOMA CRM
      </h2>

      <nav
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        }}
      >
        {menu.map((item) => {
          const active =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "12px 16px",
                borderRadius: "12px",
                textDecoration: "none",
                color: active
                  ? "white"
                  : "#cbd5e1",
                background: active
                  ? "#2563eb"
                  : "transparent",
                fontWeight: active
                  ? 700
                  : 500,
                transition: "0.2s",
              }}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div
        style={{
          marginTop: "auto",
          paddingTop: "24px",
          borderTop: "1px solid #1e293b",
        }}
      >
        <button
          onClick={logout}
          style={{
            width: "100%",
            padding: "12px",
            background: "#ef4444",
            color: "white",
            border: "none",
            borderRadius: "12px",
            cursor: "pointer",
            fontWeight: 600,
            marginBottom: "16px",
          }}
        >
          🚪 Выйти
        </button>

        <div
          style={{
            color: "#94a3b8",
            fontSize: "14px",
            textAlign: "center",
          }}
        >
          DOMA CRM v1.0
        </div>
      </div>
    </aside>
  );
}