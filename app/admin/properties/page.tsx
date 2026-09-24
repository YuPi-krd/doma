import Link from "next/link";
import DeletePropertyButton from "@/components/DeletePropertyButton";
import PropertySearch from "./PropertySearch";

interface Property {
  id: number;
  title: string;
  price: number;
  rooms: number;
  city: string;
}

async function getProperties(): Promise<Property[]> {
  try {
    const res = await fetch(
      "https://doma-nq4u.onrender.com/properties",
      {
        cache: "no-store",
      }
    );

    if (!res.ok) {
      return [];
    }

    return await res.json();
  } catch {
    return [];
  }
}

export default async function PropertiesPage() {
  const properties = await getProperties();

  return (
    <main
      style={{
        padding: "40px",
        background: "#f8fafc",
        minHeight: "100vh",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "30px",
          flexWrap: "wrap",
          gap: "15px",
        }}
      >
        <h1
          style={{
            fontSize: "42px",
            margin: 0,
          }}
        >
          Объекты недвижимости
        </h1>

        <Link
          href="/admin/properties/new"
          style={{
            background: "#ef4444",
            color: "white",
            padding: "14px 22px",
            borderRadius: "12px",
            textDecoration: "none",
            fontWeight: 600,
          }}
        >
          ➕ Добавить объект
        </Link>
      </div>

      <div
        style={{
          background: "white",
          padding: "20px",
          borderRadius: "20px",
          marginBottom: "30px",
          boxShadow:
            "0 10px 30px rgba(0,0,0,.05)",
        }}
      >
        <PropertySearch properties={properties} />
      </div>
    </main>
  );
}