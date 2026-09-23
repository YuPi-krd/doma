"use client";

import { useRouter } from "next/navigation";

interface Props {
  id: number;
}

export default function DeletePropertyButton({
  id,
}: Props) {
  const router = useRouter();

  async function handleDelete() {
    const confirmed = confirm(
      "Удалить объект?"
    );

    if (!confirmed) {
      return;
    }

    const res = await fetch(
      `http://127.0.0.1:8000/properties/${id}`,
      {
        method: "DELETE",
      }
    );

    if (res.ok) {
      router.refresh();
    }
  }

  return (
    <button
      onClick={handleDelete}
      style={{
        flex: 1,
        background: "#ef4444",
        color: "white",
        border: "none",
        padding: "12px",
        borderRadius: "10px",
        cursor: "pointer",
        fontWeight: 600,
      }}
    >
      🗑 Удалить
    </button>
  );
}