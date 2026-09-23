"use client";

import { useState } from "react";

interface PropertyImage {
  id: number;
  image_url: string;
}

interface PropertyGalleryProps {
  images: PropertyImage[];
}

export default function PropertyGallery({
  images,
}: PropertyGalleryProps) {
  const [currentImage, setCurrentImage] =
    useState<string | null>(
      images.length > 0
        ? images[0].image_url
        : null
    );

  async function deleteImage(
    imageId: number
  ) {
    const confirmed = confirm(
      "Удалить фотографию?"
    );

    if (!confirmed) return;

    try {
      const res = await fetch(
        `http://127.0.0.1:8000/property-images/${imageId}`,
        {
          method: "DELETE",
        }
      );

      if (!res.ok) {
        alert("Ошибка удаления");
        return;
      }

      window.location.reload();
    } catch {
      alert("Ошибка сервера");
    }
  }

  return (
    <>
      <div
        style={{
          background: "white",
          borderRadius: "24px",
          overflow: "hidden",
          marginBottom: "20px",
          boxShadow:
            "0 10px 30px rgba(0,0,0,.05)",
        }}
      >
        {currentImage ? (
          <img
            src={`http://127.0.0.1:8000${currentImage}`}
            alt="Фото объекта"
            style={{
              width: "100%",
              height: "550px",
              objectFit: "cover",
              display: "block",
            }}
          />
        ) : (
          <div
            style={{
              height: "550px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#f1f5f9",
              color: "#64748b",
              fontSize: "18px",
            }}
          >
            Нет фотографий
          </div>
        )}
      </div>

      {images.length > 0 && (
        <div
          style={{
            background: "white",
            padding: "20px",
            borderRadius: "24px",
            marginBottom: "30px",
            boxShadow:
              "0 10px 30px rgba(0,0,0,.05)",
          }}
        >
          <h3
            style={{
              marginTop: 0,
              marginBottom: "20px",
            }}
          >
            Галерея объекта
          </h3>

          <div
            style={{
              display: "flex",
              gap: "12px",
              flexWrap: "wrap",
            }}
          >
            {images.map((img) => (
              <div
                key={img.id}
                style={{
                  position: "relative",
                }}
              >
                <img
                  src={`http://127.0.0.1:8000${img.image_url}`}
                  alt="Миниатюра"
                  onClick={() =>
                    setCurrentImage(
                      img.image_url
                    )
                  }
                  style={{
                    width: "180px",
                    height: "120px",
                    objectFit: "cover",
                    borderRadius: "12px",
                    cursor: "pointer",
                    border:
                      currentImage ===
                      img.image_url
                        ? "3px solid #2563eb"
                        : "2px solid #e2e8f0",
                  }}
                />

                <button
                  onClick={() =>
                    deleteImage(img.id)
                  }
                  style={{
                    position: "absolute",
                    top: "8px",
                    right: "8px",
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    border: "none",
                    background: "#ef4444",
                    color: "white",
                    cursor: "pointer",
                    fontWeight: 700,
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}