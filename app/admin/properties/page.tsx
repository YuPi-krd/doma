import Link from "next/link";

export default function PropertiesPage() {
  return (
    <main
      style={{
        padding: "40px",
      }}
    >
      <h1>Объекты</h1>

      <div
        style={{
          display: "flex",
          gap: "20px",
          marginTop: "30px",
        }}
      >
        <Link
          href="/crm/sale"
          style={{
            background: "#dc2626",
            color: "white",
            padding: "20px 40px",
            borderRadius: "16px",
            textDecoration: "none",
            fontSize: "20px",
            fontWeight: 700,
          }}
        >
          Продажа
        </Link>

        <Link
          href="/crm/rent"
          style={{
            background: "#1e293b",
            color: "white",
            padding: "20px 40px",
            borderRadius: "16px",
            textDecoration: "none",
            fontSize: "20px",
            fontWeight: 700,
          }}
        >
          Аренда
        </Link>
      </div>
    </main>
  );
}