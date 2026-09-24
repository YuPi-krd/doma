"use client";

import { useRouter } from "next/navigation";

export default function CompleteSaleButton({
  saleId,
}: {
  saleId: number;
}) {
  const router = useRouter();

  async function completeSale() {
    const res = await fetch(
      `https://doma-nq4u.onrender.com/sales/${saleId}/complete`,
      {
        method: "PATCH",
      }
    );

    if (res.ok) {
      router.refresh();
    }
  }

  return (
    <button
      onClick={completeSale}
      style={{
        background: "#22c55e",
        color: "white",
        border: "none",
        padding: "12px 18px",
        borderRadius: "10px",
        cursor: "pointer",
        fontWeight: 600,
      }}
    >
      ✅ Завершить
    </button>
  );
}