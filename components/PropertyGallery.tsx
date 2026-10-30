"use client";

import {
  useCallback,
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

  if (imageUrl.startsWith("//")) {
    return `https:${imageUrl}`;
  }

  return `${API_URL}${imageUrl.startsWith("/") ? "" : "/"}${imageUrl}`;
}

// Сравниваем URL без query/hash и учитываем имя файла: один снимок может
// приходить с относительным URL, абсолютным URL или cache-параметрами.
function imageDedupeKeys(url: string): string[] {
  try {
    const parsed = new URL(url, API_URL);
    const path = decodeURIComponent(parsed.pathname)
      .replace(/\\+/g, "/")
      .replace(/\/$/, "")
      .toLowerCase();
    const filename = path.split("/").pop() || path;
    return [`${parsed.origin.toLowerCase()}${path}`, `file:${filename}`];
  } catch {
    const clean = url.split(/[?#]/, 1)[0].replace(/\\+/g, "/").replace(/\/$/, "").toLowerCase();
    return [clean, `file:${clean.split("/").pop() || clean}`];
  }
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

  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Индекс предыдущего слайда нужен для анимации смены изображения.
  const [previousIndex, setPreviousIndex] = useState<number | null>(null);
  const [slideDirection, setSlideDirection] = useState<"next" | "prev">("next");
  const animationTimerRef = useRef<number | null>(null);

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
    const seen = new Set<string>();

    const addImage = (rawUrl?: string) => {
      if (!rawUrl) return;
      const url = normalizeImageUrl(rawUrl);
      const keys = imageDedupeKeys(url);
      if (keys.some((key) => seen.has(key))) return;
      keys.forEach((key) => seen.add(key));
      result.push(url);
    };

    // Главная фотография стоит первой; если API отдаёт её же в галерее,
    // она добавляется только один раз.
    addImage(mainImage);
    for (const image of galleryImages) addImage(image.image_url);

    if (result.length === 0) {
      result.push(`${API_URL}/images/test-flat.jpg`);
    }
    return result;
  }, [mainImage, galleryImages]);

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

  const goToImage = useCallback((
    requestedIndex: number,
    direction: "next" | "prev",
    e?: React.MouseEvent
  ) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (images.length <= 1) return;

    const nextIndex = ((requestedIndex % images.length) + images.length) % images.length;
    if (nextIndex === currentIndex) return;

    if (animationTimerRef.current !== null) {
      window.clearTimeout(animationTimerRef.current);
    }

    setPreviousIndex(currentIndex);
    setSlideDirection(direction);
    setCurrentIndex(nextIndex);
    animationTimerRef.current = window.setTimeout(() => {
      setPreviousIndex(null);
      animationTimerRef.current = null;
    }, 290);
  }, [currentIndex, images.length]);

  function previousImage(e?: React.MouseEvent) {
    goToImage(currentIndex - 1, "prev", e);
  }

  function nextImage(e?: React.MouseEvent) {
    goToImage(currentIndex + 1, "next", e);
  }

  function selectImage(index: number, e?: React.MouseEvent) {
    goToImage(index, index >= currentIndex ? "next" : "prev", e);
  }

  // Как в каталоге Ajax: позиция курсора над фотографией выбирает сегмент галереи.
  // Изображения при этом именно сменяются слайдом — курсор не захватывает фото.
  function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    if (variant !== "card" || images.length <= 1) return;
    const target = event.target as HTMLElement | null;
    if (target?.closest("button")) return;

    const bounds = event.currentTarget.getBoundingClientRect();
    if (bounds.width <= 0) return;
    const relativeX = Math.max(0, Math.min(0.999999, (event.clientX - bounds.left) / bounds.width));
    const targetIndex = Math.min(images.length - 1, Math.floor(relativeX * images.length));
    if (targetIndex === currentIndex) return;

    goToImage(targetIndex, targetIndex > currentIndex ? "next" : "prev");
  }

  useEffect(() => () => {
    if (animationTimerRef.current !== null) {
      window.clearTimeout(animationTimerRef.current);
    }
  }, []);

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

  // На странице объекта можно листать галерею клавишами ← и →.
  // Не перехватываем стрелки, пока пользователь вводит текст.
  useEffect(() => {
    if (!isDetail) return;

    function handleGalleryKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && isLightboxOpen) {
        event.preventDefault();
        setIsLightboxOpen(false);
        return;
      }

      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      const target = event.target as HTMLElement | null;
      if (!isLightboxOpen && (target?.isContentEditable || target?.closest("input, textarea, select, [contenteditable='true']"))) return;

      if (images.length > 1 && event.key === "ArrowLeft") {
        event.preventDefault();
        goToImage(currentIndex - 1, "prev");
      } else if (images.length > 1 && event.key === "ArrowRight") {
        event.preventDefault();
        goToImage(currentIndex + 1, "next");
      }
    }

    document.addEventListener("keydown", handleGalleryKeyDown);
    return () => document.removeEventListener("keydown", handleGalleryKeyDown);
  }, [isDetail, isLightboxOpen, images.length, currentIndex, goToImage]);

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
        onMouseMove={handleMouseMove}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {previousIndex !== null && (
          <img
            key={`previous-${previousIndex}-${currentIndex}`}
            src={images[previousIndex]}
            alt=""
            aria-hidden="true"
            draggable={false}
            className={`gallery-image is-leaving ${slideDirection}`}
          />
        )}
        <img
          key={`current-${currentIndex}`}
          src={images[currentIndex]}
          alt={title}
          draggable={false}
          className={`gallery-image${previousIndex !== null ? ` is-entering ${slideDirection}` : ""}`}
          onClick={() => {
            if (isDetail) setIsLightboxOpen(true);
          }}
          role={isDetail ? "button" : undefined}
          tabIndex={isDetail ? 0 : undefined}
          aria-label={isDetail ? "Открыть фотографию в полном размере" : undefined}
          onKeyDown={(e) => {
            if (isDetail && (e.key === "Enter" || e.key === " ")) {
              e.preventDefault();
              setIsLightboxOpen(true);
            }
          }}
          onError={(e) => {
            const fallback = `${API_URL}/images/test-flat.jpg`;
            if (e.currentTarget.src !== fallback) e.currentTarget.src = fallback;
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

      {isDetail && isLightboxOpen && (
        <div
          className="gallery-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Фотография объекта"
          onClick={() => setIsLightboxOpen(false)}
        >
          <button
            type="button"
            className="lightbox-close"
            onClick={() => setIsLightboxOpen(false)}
            aria-label="Закрыть фотографию"
          >
            ×
          </button>

          {images.length > 1 && (
            <button
              type="button"
              className="lightbox-arrow left"
              onClick={(e) => {
                e.stopPropagation();
                previousImage(e);
              }}
              aria-label="Предыдущее фото"
            >
              ‹
            </button>
          )}

          <img
            src={images[currentIndex]}
            alt={title}
            className="lightbox-image"
            onClick={(e) => e.stopPropagation()}
          />

          {images.length > 1 && (
            <button
              type="button"
              className="lightbox-arrow right"
              onClick={(e) => {
                e.stopPropagation();
                nextImage(e);
              }}
              aria-label="Следующее фото"
            >
              ›
            </button>
          )}

          <div className="lightbox-counter">
            {currentIndex + 1} / {images.length}
          </div>
        </div>
      )}

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
          height: 100%;
        }

        .gallery-card {
          height: 100%;
          display: flex;
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
          width: 100%;
          height: 100%;
          min-height: 290px;
        }

        .gallery-detail .image-stage {
          height: min(
            62vh,
            620px
          );
          min-height: 380px;
          border-radius: 28px;
        }

        .gallery-detail .gallery-image {
          cursor: zoom-in;
        }

        .gallery-lightbox {
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 56px 76px;
          background: rgba(10, 12, 16, 0.94);
          cursor: zoom-out;
        }

        .lightbox-image {
          display: block;
          max-width: 100%;
          max-height: 100%;
          width: auto;
          height: auto;
          object-fit: contain;
          cursor: default;
          user-select: none;
          -webkit-user-drag: none;
        }

        .lightbox-close,
        .lightbox-arrow {
          position: absolute;
          z-index: 2;
          display: grid;
          place-items: center;
          border: 0;
          border-radius: 50%;
          color: #fff;
          background: rgba(255, 255, 255, 0.16);
          cursor: pointer;
          transition: background 0.18s ease;
        }

        .lightbox-close:hover,
        .lightbox-arrow:hover {
          background: rgba(255, 255, 255, 0.28);
        }

        .lightbox-close {
          top: 22px;
          right: 24px;
          width: 44px;
          height: 44px;
          font-size: 32px;
          line-height: 1;
        }

        .lightbox-arrow {
          top: 50%;
          transform: translateY(-50%);
          width: 48px;
          height: 48px;
          font-size: 36px;
          line-height: 1;
        }

        .lightbox-arrow.left { left: 20px; }
        .lightbox-arrow.right { right: 20px; }

        .lightbox-counter {
          position: absolute;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          padding: 7px 12px;
          border-radius: 20px;
          color: #fff;
          background: rgba(255, 255, 255, 0.16);
          font-size: 13px;
          font-weight: 600;
        }

        .gallery-image {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
          user-select: none;
          -webkit-user-drag: none;
        }

        .gallery-image.is-leaving {
          z-index: 1;
          pointer-events: none;
        }

        .gallery-image.is-entering {
          z-index: 2;
          pointer-events: none;
          animation-duration: 280ms;
          animation-timing-function: cubic-bezier(.22, .68, 0, 1);
          animation-fill-mode: both;
        }

        .gallery-image.is-entering.next {
          animation-name: doma-gallery-enter-from-right;
        }

        .gallery-image.is-entering.prev {
          animation-name: doma-gallery-enter-from-left;
        }

        .gallery-image.is-leaving.next {
          animation: doma-gallery-leave-to-left 280ms cubic-bezier(.22, .68, 0, 1) both;
        }

        .gallery-image.is-leaving.prev {
          animation: doma-gallery-leave-to-right 280ms cubic-bezier(.22, .68, 0, 1) both;
        }

        @keyframes doma-gallery-enter-from-right {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }

        @keyframes doma-gallery-enter-from-left {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }

        @keyframes doma-gallery-leave-to-left {
          from { transform: translateX(0); }
          to { transform: translateX(-100%); }
        }

        @keyframes doma-gallery-leave-to-right {
          from { transform: translateX(0); }
          to { transform: translateX(100%); }
        }

        @media (prefers-reduced-motion: reduce) {
          .gallery-image.is-entering,
          .gallery-image.is-leaving {
            animation-duration: 1ms !important;
          }
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
          .gallery-lightbox {
            padding: 56px 48px;
          }

          .lightbox-arrow {
            width: 38px;
            height: 38px;
            font-size: 29px;
          }

          .lightbox-arrow.left { left: 6px; }
          .lightbox-arrow.right { right: 6px; }

          .lightbox-close {
            top: 12px;
            right: 12px;
          }

          .gallery-card
            .image-stage {
            height: 230px;
            min-height: 230px;
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