"use client";

import { useRouter } from "next/navigation";

export default function ClientDeleteButton({
  clientId,
}: {
  clientId: number;
}) {
  const router = useRouter();

  async function handleDelete() {
    const confirmed = confirm(
      "Удалить клиента?"
    );

    if (!confirmed) return;

    const res = await fetch(
      `http://127.0.0.1:8000/clients/${clientId}`,
      {
        method: "DELETE",
      }
    );

    if (res.ok) {
      router.push("/admin/clients");
      router.refresh();
    } else {
      alert("Ошибка удаления");
    }
  }

  return (
    <button
      onClick={handleDelete}
      style={{
        background: "#ef4444",
        color: "white",
        border: "none",
        padding: "14px 24px",
        borderRadius: "12px",
        cursor: "pointer",
        fontWeight: 600,
      }}
    >
      🗑 Удалить клиента
    </button>
  );
}