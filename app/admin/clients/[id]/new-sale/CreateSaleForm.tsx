"use client";

import { useRouter } from "next/navigation";

interface Property {
  id: number;
  title: string;
}

export default function CreateSaleForm({
  clientId,
  properties,
}: {
  clientId: string;
  properties: Property[];
}) {
  const router = useRouter();

  async function handleSubmit(
    formData: FormData
  ) {
    try {
      const data = {
        client_id: Number(clientId),
        property_id: Number(
          formData.get("property_id")
        ),
        amount: Number(
          formData.get("amount")
        ),
      };

      const res = await fetch(
        "https://doma-nq4u.onrender.com/sales",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      if (!res.ok) {
        const error =
          await res.text();

        console.error(error);

        alert(
          "Ошибка создания сделки:\n\n" +
            error
        );

        return;
      }

      router.push("/admin/sales");
      router.refresh();
    } catch (error) {
      console.error(error);

      alert(
        "Не удалось подключиться к серверу"
      );
    }
  }

  return (
    <form action={handleSubmit}>
      <div
        style={{
          marginBottom: "25px",
        }}
      >
        <label
          style={{
            display: "block",
            marginBottom: "10px",
            fontWeight: 600,
          }}
        >
          🏠 Объект недвижимости
        </label>

        <select
          name="property_id"
          required
          style={{
            width: "100%",
            padding: "14px",
            borderRadius: "12px",
            border:
              "1px solid #e2e8f0",
          }}
        >
          {properties.map(
            (property) => (
              <option
                key={property.id}
                value={property.id}
              >
                {property.title}
              </option>
            )
          )}
        </select>
      </div>

      <div
        style={{
          marginBottom: "25px",
        }}
      >
        <label
          style={{
            display: "block",
            marginBottom: "10px",
            fontWeight: 600,
          }}
        >
          💰 Сумма сделки
        </label>

        <input
          type="number"
          name="amount"
          required
          min="1"
          placeholder="5000000"
          style={{
            width: "100%",
            padding: "14px",
            borderRadius: "12px",
            border:
              "1px solid #e2e8f0",
          }}
        />
      </div>

      <button
        type="submit"
        style={{
          background: "#2563eb",
          color: "white",
          border: "none",
          padding: "14px 24px",
          borderRadius: "12px",
          cursor: "pointer",
          fontWeight: 600,
        }}
      >
        Создать сделку
      </button>
    </form>
  );
}