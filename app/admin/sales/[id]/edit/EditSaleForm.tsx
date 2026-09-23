"use client";

import { useRouter } from "next/navigation";

export default function EditSaleForm({
  sale,
}: {
  sale: {
    id: number;
    client_id: number;
    property_id: number;
    amount: number;
    status: string;
  };
}) {
  const router = useRouter();

  async function handleSubmit(
    formData: FormData
  ) {
    const data = {
      client_id: sale.client_id,
      property_id: sale.property_id,
      amount: Number(
        formData.get("amount")
      ),
      status: String(
        formData.get("status")
      ),
    };

    const res = await fetch(
      `http://127.0.0.1:8000/sales/${sale.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify(data),
      }
    );

    if (res.ok) {
      router.push(
        `/admin/sales/${sale.id}`
      );

      router.refresh();
    } else {
      alert(
        "Ошибка сохранения сделки"
      );
    }
  }

  return (
    <form action={handleSubmit}>
      <div
        style={{
          display: "grid",
          gap: "25px",
        }}
      >
        <div>
          <label>
            💰 Сумма сделки
          </label>

          <input
            type="number"
            name="amount"
            defaultValue={sale.amount}
            required
            style={{
              width: "100%",
              padding: "16px",
              marginTop: "8px",
              border:
                "2px solid #e2e8f0",
              borderRadius: "14px",
            }}
          />
        </div>

        <div>
          <label>
            📄 Статус сделки
          </label>

          <select
            name="status"
            defaultValue={sale.status}
            style={{
              width: "100%",
              padding: "16px",
              marginTop: "8px",
              border:
                "2px solid #e2e8f0",
              borderRadius: "14px",
            }}
          >
            <option>
              Подготовка
            </option>

            <option>
              Договор
            </option>

            <option>
              Регистрация
            </option>

            <option>
              Завершена
            </option>
          </select>
        </div>
      </div>

      <button
        type="submit"
        style={{
          marginTop: "30px",
          background: "#2563eb",
          color: "white",
          border: "none",
          padding: "16px 28px",
          borderRadius: "14px",
          cursor: "pointer",
          fontWeight: 600,
        }}
      >
        💾 Сохранить изменения
      </button>
    </form>
  );
}