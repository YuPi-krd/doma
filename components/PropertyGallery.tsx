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

  const [currentIndex, setCurrentIndex] = useState(0);
  const [previousIndex, setPreviousIndex] = useState<number | null>(null);
  const [slideDirection, setSlideDirection] = useState<"next" | "previous">("next");
  const [isAnimating, setIsAnimating] = useState(false);
  const animationTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const mouseStart = useRef<{ x: number; y: number } | null>(null);

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

  function goToImage(index: number, direction: "next" | "previous", e?: React.MouseEvent) {
    e?.preventDefault();
    e?.stopPropagation();
    if (images.length <= 1 || index === currentIndex) return;

    if (animationTimer.current) window.clearTimeout(animationTimer.current);
    setPreviousIndex(currentIndex);
    setSlideDirection(direction);
    setCurrentIndex(index);
    setIsAnimating(true);
    animationTimer.current = window.setTimeout(() => {
      setIsAnimating(false);
      setPreviousIndex(null);
      animationTimer.current = null;
    }, 360);
  }

  function previousImage(e?: React.MouseEvent) {
    goToImage(currentIndex === 0 ? images.length - 1 : currentIndex - 1, "previous", e);
  }

  function nextImage(e?: React.MouseEvent) {
    goToImage(currentIndex === images.length - 1 ? 0 : currentIndex + 1, "next", e);
  }

  function selectImage(index: number, e?: React.MouseEvent) {
    goToImage(index, index >= currentIndex ? "next" : "previous", e);
  }

  // На компьютере движение мышью только распознаётся как жест перелистывания:
  // фотография не следует за курсором, а после отпускания проигрывается слайд.
  function handleMouseDown(e: React.MouseEvent<HTMLDivElement>) {
    if (!isDetail || e.button !== 0) return;
    const target = e.target as HTMLElement;
    if (target.closest("button, a, input, textarea, select")) {
      mouseStart.current = null;
      return;
    }
    mouseStart.current = { x: e.clientX, y: e.clientY };
    e.preventDefault(); // отключаем нативное перетаскивание изображения
  }

  function handleMouseUp(e: React.MouseEvent<HTMLDivElement>) {
    const start = mouseStart.current;
    mouseStart.current = null;
    if (!isDetail || !start || e.button !== 0) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    if (Math.abs(dx) < 55 || Math.abs(dx) < Math.abs(dy) * 1.25) return;
    if (dx < 0) nextImage();
    else previousImage();
  }

  function handleMouseLeave() {
    mouseStart.current = null;
  }

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0]?.clientX ?? null;
    touchEndX.current = null;
  }

  function handleTouchMove(e: React.TouchEvent) {
    touchEndX.current = e.touches[0]?.clientX ?? null;
  }

  function handleTouchEnd() {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const distance = touchStartX.current - touchEndX.current;
    if (Math.abs(distance) >= 45) {
      if (distance > 0) nextImage();
      else previousImage();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  }

  const isDetail =
    variant === "detail";

  // На странице объекта можно листать галерею клавишами ← и →.
  // Не перехватываем стрелки, пока пользователь вводит текст.
  useEffect(() => {
    if (!isDetail || images.length <= 1) return;

    function handleGalleryKeyDown(event: KeyboardEvent) {
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      const target = event.target as HTMLElement | null;
      if (target?.isContentEditable || target?.closest("input, textarea, select, [contenteditable='true']")) return;

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        setCurrentIndex((index) => index === 0 ? images.length - 1 : index - 1);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        setCurrentIndex((index) => index === images.length - 1 ? 0 : index + 1);
      }
    }

    document.addEventListener("keydown", handleGalleryKeyDown);
    return () => document.removeEventListener("keydown", handleGalleryKeyDown);
  }, [isDetail, images.length]);

  useEffect(() => {
    return () => {
      if (animationTimer.current) window.clearTimeout(animationTimer.current);
    };
  }, []);

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
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        {isAnimating && previousIndex !== null && (
          <img
            key={`previous-${previousIndex}-${currentIndex}`}
            src={images[previousIndex]}
            alt=""
            aria-hidden="true"
            draggable={false}
            className={`gallery-image slide-out-${slideDirection}`}
            onDragStart={(event) => event.preventDefault()}
          />
        )}
        <img
          key={`current-${currentIndex}`}
          src={images[currentIndex]}
          alt={title}
          draggable={false}
          className={`gallery-image${isAnimating ? ` slide-in-${slideDirection}` : ""}`}
          onDragStart={(event) => event.preventDefault()}
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

        .gallery-image {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
          pointer-events: none;
          user-select: none;
        }

        .slide-in-next { z-index: 2; animation: doma-slide-in-next 340ms cubic-bezier(.22,.75,.25,1) both; }
        .slide-out-next { z-index: 1; animation: doma-slide-out-next 340ms cubic-bezier(.22,.75,.25,1) both; }
        .slide-in-previous { z-index: 2; animation: doma-slide-in-previous 340ms cubic-bezier(.22,.75,.25,1) both; }
        .slide-out-previous { z-index: 1; animation: doma-slide-out-previous 340ms cubic-bezier(.22,.75,.25,1) both; }

        @keyframes doma-slide-in-next { from { transform: translateX(100%); } to { transform: translateX(0); } }
        @keyframes doma-slide-out-next { from { transform: translateX(0); } to { transform: translateX(-100%); } }
        @keyframes doma-slide-in-previous { from { transform: translateX(-100%); } to { transform: translateX(0); } }
        @keyframes doma-slide-out-previous { from { transform: translateX(0); } to { transform: translateX(100%); } }

        @media (prefers-reduced-motion: reduce) {
          .slide-in-next, .slide-out-next, .slide-in-previous, .slide-out-previous { animation-duration: 1ms; }
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