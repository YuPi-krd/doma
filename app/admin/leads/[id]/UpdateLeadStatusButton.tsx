"use client";

import { useRouter } from "next/navigation";

interface Props {
  leadId: number;
  currentStatus: string;
}

export default function UpdateLeadStatusButton({
  leadId,
  currentStatus,
}: Props) {
  const router = useRouter();

  async function updateStatus(
    newStatus: string
  ) {
    try {
      const res = await fetch(
        `https://doma-nq4u.onrender.com/leads/${leadId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );

      if (!res.ok) {
        const errorText =
          await res.text();

        console.error(
          "Ошибка:",
          errorText
        );

        alert(
          `Ошибка ${res.status}`
        );

        return;
      }

      router.refresh();
    } catch (error) {
      console.error(error);

      alert(
        "Не удалось обновить статус"
      );
    }
  }

  return (
    <div
      style={{
        display: "flex",
        gap: "10px",
        flexWrap: "wrap",
      }}
    >
      {currentStatus !==
        "В работе" && (
        <button
          onClick={() =>
            updateStatus(
              "В работе"
            )
          }
          style={{
            background:
              "#2563eb",
            color: "white",
            border: "none",
            padding:
              "12px 18px",
            borderRadius:
              "10px",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          🔵 В работу
        </button>
      )}

      {currentStatus !==
        "Закрыта" && (
        <button
          onClick={() =>
            updateStatus(
              "Закрыта"
            )
          }
          style={{
            background:
              "#22c55e",
            color: "white",
            border: "none",
            padding:
              "12px 18px",
            borderRadius:
              "10px",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          ✅ Закрыть
        </button>
      )}
    </div>
  );
}