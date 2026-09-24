"use client";

import { useRouter } from "next/navigation";

export default function CreateClientForm() {
  const router = useRouter();

  async function handleSubmit(
    formData: FormData
  ) {
    const data = {
      name: formData.get("name"),
      phone: formData.get("phone"),
      email: formData.get("email"),
    };

    const res = await fetch(
      "https://doma-nq4u.onrender.com/clients",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify(data),
      }
    );

    if (res.ok) {
      router.push("/admin/clients");
      router.refresh();
    } else {
      alert(
        "Ошибка создания клиента"
      );
    }
  }

  return (
    <form action={handleSubmit}>
      <div
        style={{
          display: "grid",
          gap: "20px",
        }}
      >
        <input
          name="name"
          placeholder="Имя клиента"
          required
          style={{
            padding: "14px",
            borderRadius: "12px",
            border: "1px solid #e2e8f0",
          }}
        />

        <input
          name="phone"
          placeholder="Телефон"
          required
          style={{
            padding: "14px",
            borderRadius: "12px",
            border: "1px solid #e2e8f0",
          }}
        />

        <input
          name="email"
          placeholder="Email"
          style={{
            padding: "14px",
            borderRadius: "12px",
            border: "1px solid #e2e8f0",
          }}
        />

        <button
          type="submit"
          style={{
            background: "#22c55e",
            color: "white",
            border: "none",
            padding: "14px",
            borderRadius: "12px",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Создать клиента
        </button>
      </div>
    </form>
  );
}