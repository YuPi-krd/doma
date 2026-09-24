"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function PropertyPhotosPage() {
  const params = useParams();
  const router = useRouter();

  const propertyId = params.id as string;

  const [file, setFile] =
    useState<File | null>(null);

  const [loading, setLoading] =
    useState(false);

  async function uploadPhoto() {
    if (!file) {
      alert("Выберите фотографию");
      return;
    }

    setLoading(true);

    try {
      const formData =
        new FormData();

      formData.append(
        "file",
        file
      );

      const res = await fetch(
        `https://doma-nq4u.onrender.com/properties/${propertyId}/images`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!res.ok) {
        alert(
          "Ошибка загрузки фото"
        );
        return;
      }

      alert("Фото загружено");

      router.refresh();
    } catch {
      alert("Ошибка сервера");
    } finally {
      setLoading(false);
    }
  }

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
          maxWidth: "700px",
          margin: "0 auto",
          background: "white",
          padding: "35px",
          borderRadius: "24px",
          boxShadow:
            "0 10px 30px rgba(0,0,0,.05)",
        }}
      >
        <h1>
          📷 Добавить фото
        </h1>

        <input
          type="file"
          accept="image/*"
          onChange={(e) =>
            setFile(
              e.target.files?.[0] ||
                null
            )
          }
        />

        <div
          style={{
            marginTop: "25px",
          }}
        >
          <button
            onClick={uploadPhoto}
            disabled={loading}
            style={{
              background: "#2563eb",
              color: "white",
              border: "none",
              padding:
                "14px 24px",
              borderRadius:
                "12px",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            {loading
              ? "Загрузка..."
              : "Загрузить фото"}
          </button>
        </div>
      </div>
    </main>
  );
}