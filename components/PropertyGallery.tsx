"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

interface GalleryImage {
  id: number;
  image_url: string;
}

interface PropertyGalleryProps {
  propertyId: number;
  mainImage?: string;
  title: string;
  variant?: "card" | "detail";
}

const API_URL =
  "https://doma-nq4u.onrender.com";

function normalizeImageUrl(
  imageUrl?: string
) {
  if (!imageUrl) {
    return `${API_URL}/images/test-flat.jpg`;
  }

  if (
    imageUrl.startsWith("http://") ||
    imageUrl.startsWith("https://")
  ) {
    return imageUrl;
  }

  return `${API_URL}${imageUrl}`;
}

export default function PropertyGallery({
  propertyId,
  mainImage,
  title,
  variant = "card",
}: PropertyGalleryProps) {
  const [galleryImages, setGalleryImages] =
    useState<GalleryImage[]>([]);

  const [currentIndex, setCurrentIndex] =
    useState(0);

  const touchStartX =
    useRef<number | null>(null);

  const touchEndX =
    useRef<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadImages() {
      try {
        const response =
          await fetch(
            `${API_URL}/properties/${propertyId}/images`,
            {
              cache: "no-store",
            }
          );

        if (!response.ok) {
          return;
        }

        const data =
          await response.json();

        if (
          !cancelled &&
          Array.isArray(data)
        ) {
          setGalleryImages(data);
        }
      } catch (error) {
        console.error(
          "Ошибка загрузки фотографий:",
          error
        );
      }
    }

    loadImages();

    return () => {
      cancelled = true;
    };
  }, [propertyId]);

  const images = useMemo(() => {
    const result: string[] = [];

    if (mainImage) {
      result.push(
        normalizeImageUrl(mainImage)
      );
    }

    for (const image of galleryImages) {
      const url =
        normalizeImageUrl(
          image.image_url
        );

      if (!result.includes(url)) {
        result.push(url);
      }
    }

    if (result.length === 0) {
      result.push(
        `${API_URL}/images/test-flat.jpg`
      );
    }

    return result;
  }, [
    mainImage,
    galleryImages,
  ]);

  useEffect(() => {
    if (
      currentIndex >= images.length
    ) {
      setCurrentIndex(0);
    }
  }, [
    currentIndex,
    images.length,
  ]);

  function previousImage(
    e?: React.MouseEvent
  ) {
    e?.preventDefault();
    e?.stopPropagation();

    setCurrentIndex((index) =>
      index === 0
        ? images.length - 1
        : index - 1
    );
  }

  function nextImage(
    e?: React.MouseEvent
  ) {
    e?.preventDefault();
    e?.stopPropagation();

    setCurrentIndex((index) =>
      index === images.length - 1
        ? 0
        : index + 1
    );
  }

  function selectImage(
    index: number,
    e?: React.MouseEvent
  ) {
    e?.preventDefault();
    e?.stopPropagation();

    setCurrentIndex(index);
  }

  function handleTouchStart(
    e: React.TouchEvent
  ) {
    touchStartX.current =
      e.touches[0]?.clientX ?? null;

    touchEndX.current = null;
  }

  function handleTouchMove(
    e: React.TouchEvent
  ) {
    touchEndX.current =
      e.touches[0]?.clientX ?? null;
  }

  function handleTouchEnd() {
    if (
      touchStartX.current === null ||
      touchEndX.current === null
    ) {
      return;
    }

    const distance =
      touchStartX.current -
      touchEndX.current;

    if (Math.abs(distance) < 45) {
      return;
    }

    if (distance > 0) {
      nextImage();
    } else {
      previousImage();
    }

    touchStartX.current = null;
    touchEndX.current = null;
  }

  const isDetail =
    variant === "detail";

  return (
    <div
      className={
        isDetail
          ? "gallery gallery-detail"
          : "gallery gallery-card"
      }
    >
      <div
        className="image-stage"
        onTouchStart={
          handleTouchStart
        }
        onTouchMove={
          handleTouchMove
        }
        onTouchEnd={
          handleTouchEnd
        }
      >
        <img
          src={images[currentIndex]}
          alt={title}
          draggable={false}
          className="gallery-image"
          onError={(e) => {
            const fallback =
              `${API_URL}/images/test-flat.jpg`;

            if (
              e.currentTarget.src !==
              fallback
            ) {
              e.currentTarget.src =
                fallback;
            }
          }}
        />

        {images.length > 1 && (
          <>
            <button
              type="button"
              className="gallery-arrow left"
              onClick={
                previousImage
              }
              aria-label="Предыдущее фото"
            >
              ‹
            </button>

            <button
              type="button"
              className="gallery-arrow right"
              onClick={
                nextImage
              }
              aria-label="Следующее фото"
            >
              ›
            </button>

            <div className="gallery-counter">
              {currentIndex + 1}
              {" / "}
              {images.length}
            </div>

            <div className="gallery-dots">
              {images.map(
                (_, index) => (
                  <button
                    key={index}
                    type="button"
                    className={
                      index ===
                      currentIndex
                        ? "gallery-dot active"
                        : "gallery-dot"
                    }
                    onClick={(e) =>
                      selectImage(
                        index,
                        e
                      )
                    }
                    aria-label={`Фото ${
                      index + 1
                    }`}
                  />
                )
              )}
            </div>
          </>
        )}
      </div>

      {isDetail &&
        images.length > 1 && (
          <div className="thumbnails">
            {images.map(
              (image, index) => (
                <button
                  key={image + index}
                  type="button"
                  className={
                    index ===
                    currentIndex
                      ? "thumbnail active"
                      : "thumbnail"
                  }
                  onClick={(e) =>
                    selectImage(
                      index,
                      e
                    )
                  }
                >
                  <img
                    src={image}
                    alt={`Фото ${
                      index + 1
                    }`}
                  />
                </button>
              )
            )}
          </div>
        )}

      <style jsx>{`
        .gallery {
          width: 100%;
        }

        .image-stage {
          position: relative;
          width: 100%;
          overflow: hidden;
          background: #edf0f3;
          touch-action: pan-y;
          user-select: none;
        }

        .gallery-card .image-stage {
          height: 190px;
        }

        .gallery-detail .image-stage {
          height: min(
            62vh,
            620px
          );
          min-height: 380px;
          border-radius: 28px;
        }

        .gallery-image {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
        }

        /*
         * На странице объекта не растягиваем
         * изображение. Оно занимает весь блок
         * с аккуратным обрезанием по краям.
         */
        .gallery-detail
          .gallery-image {
          object-fit: contain;
          background: #eef1f4;
        }

        .gallery-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 42px;
          height: 42px;
          display: grid;
          place-items: center;
          padding: 0;
          border: 0;
          border-radius: 50%;
          background: rgba(
            25,
            29,
            34,
            0.72
          );
          color: #ffffff;
          cursor: pointer;
          font-size: 30px;
          line-height: 1;
          opacity: 0;
          transition:
            opacity 0.18s ease,
            background 0.18s ease;
          z-index: 5;
        }

        .image-stage:hover
          .gallery-arrow {
          opacity: 1;
        }

        .gallery-arrow:hover {
          background: rgba(
            25,
            29,
            34,
            0.92
          );
        }

        .gallery-arrow.left {
          left: 15px;
        }

        .gallery-arrow.right {
          right: 15px;
        }

        .gallery-counter {
          position: absolute;
          top: 14px;
          left: 14px;
          padding: 7px 10px;
          border-radius: 9px;
          background: rgba(
            25,
            29,
            34,
            0.72
          );
          color: #ffffff;
          font-size: 12px;
          font-weight: 600;
          z-index: 5;
        }

        .gallery-dots {
          position: absolute;
          left: 50%;
          bottom: 14px;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
          gap: 6px;
          z-index: 5;
        }

        .gallery-dot {
          width: 7px;
          height: 7px;
          padding: 0;
          border: 0;
          border-radius: 50%;
          background: rgba(
            255,
            255,
            255,
            0.55
          );
          cursor: pointer;
        }

        .gallery-dot.active {
          width: 9px;
          height: 9px;
          background: #ffffff;
        }

        .thumbnails {
          display: flex;
          gap: 10px;
          margin-top: 12px;
          overflow-x: auto;
          padding-bottom: 4px;
        }

        .thumbnail {
          flex: 0 0 92px;
          height: 68px;
          padding: 0;
          overflow: hidden;
          border: 2px solid transparent;
          border-radius: 12px;
          background: #eef1f4;
          cursor: pointer;
          opacity: 0.72;
          transition:
            opacity 0.15s ease,
            border-color 0.15s ease;
        }

        .thumbnail.active {
          border-color: #ef4444;
          opacity: 1;
        }

        .thumbnail img {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
        }

        @media (max-width: 700px) {
          .gallery-card
            .image-stage {
            height: 230px;
          }

          .gallery-detail
            .image-stage {
            min-height: 300px;
            height: 55vh;
            border-radius: 20px;
          }

          .gallery-arrow {
            opacity: 1;
            width: 36px;
            height: 36px;
          }

          .thumbnail {
            flex-basis: 76px;
            height: 58px;
          }
        }
      `}</style>
    </div>
  );
}