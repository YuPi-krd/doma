"use client";

import { useState } from "react";
import Image from "next/image";

interface Props {
  images: string[];
}

export default function PropertyGallery({
  images,
}: Props) {
  const validImages = images.filter(
    (img) => img && img !== "null"
  );

  const API_URL = "https://doma-nq4u.onrender.com";

const [activeImage, setActiveImage] =
  useState(
    validImages[0] ||
      `${API_URL}/images/test-flat.jpg`
  );

  return (
    <div>
      {/* Главное фото */}

      <div
        style={{
          marginBottom: "16px",
        }}
      >
        <Image
          src={activeImage}
          alt="Фото объекта"
          width={1200}
          height={700}
          unoptimized
          style={{
            width: "100%",
            height: "550px",
            objectFit: "cover",
            borderRadius: "24px",
          }}
        />
      </div>

      {/* Миниатюры */}

      <div
        style={{
          display: "flex",
          gap: "12px",
          flexWrap: "wrap",
        }}
      >
        {validImages.map((img, index) => (
          <div
            key={`${img}-${index}`}
            onClick={() =>
              setActiveImage(img)
            }
            style={{
              width: "120px",
              height: "90px",
              cursor: "pointer",
              overflow: "hidden",
              borderRadius: "12px",
              border:
                activeImage === img
                  ? "3px solid #2563eb"
                  : "2px solid #e2e8f0",
            }}
          >
            <Image
              src={img}
              alt={`Фото ${index + 1}`}
              width={300}
              height={200}
              unoptimized
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}