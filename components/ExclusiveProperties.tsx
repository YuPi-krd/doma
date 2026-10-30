"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

interface Property {
  id: number | string;
  title?: string | null;
  price?: number | string | null;
  area?: number | string | null;
  rooms?: number | string | null;
  city?: string | null;
  district?: string | null;
  address?: string | null;
  public_address?: string | null;
  image_url?: string | null;
  property_type?: string | null;
  property_subtype?: string | null;
  deal_type?: string | null;
  status?: string | null;
}

type CategoryKey = "apartment" | "house" | "land" | "commercial";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "https://doma-nq4u.onrender.com"
).replace(/\/+$/, "");

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=80";

const CATEGORIES: { key: CategoryKey; label: string }[] = [
  { key: "apartment", label: "Квартира" },
  { key: "house", label: "Дом" },
  { key: "land", label: "Земельный участок" },
  { key: "commercial", label: "Коммерческая недвижимость" },
];

function normalizeType(property: Property): CategoryKey | "garage" {
  const type = String(property.property_type || "").toLowerCase().trim();
  const subtype = String(property.property_subtype || "").toLowerCase().trim();

  if (type === "apartment" || type === "new_building") return "apartment";
  if (type === "house") return "house";
  if (type === "land") return "land";
  if (type === "commercial") return "commercial";
  if (type === "garage") return "garage";

  // Backward compatibility for records that have a title but no property_type.
  const text = `${property.title || ""} ${subtype}`.toLowerCase();
  if (/участ|земл|ижс|лпх|садов|днп/.test(text)) return "land";
  if (/гараж|парков|машино-мест/.test(text)) return "garage";
  if (/дом|коттедж|таунхаус|дач/.test(text)) return "house";
  if (/магазин|офис|коммерч|помещен|склад|бизнес/.test(text)) return "commercial";
  return "apartment";
}

function imageSource(imageUrl?: string | null): string {
  const value = typeof imageUrl === "string" ? imageUrl.trim() : "";
  if (!value) return FALLBACK_IMAGE;
  if (/^https?:\/\//i.test(value)) return value;
  return `${API_URL}${value.startsWith("/") ? value : `/${value}`}`;
}

function formatPrice(value?: number | string | null): string {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) return "Цена по запросу";
  return `${numeric.toLocaleString("ru-RU")} ₽`;
}

function formatNumber(value?: number | string | null): number {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
}

function propertyAddress(property: Property): string {
  return (
    property.public_address?.trim() ||
    property.address?.trim() ||
    [property.city, property.district].filter(Boolean).join(", ") ||
    "Адрес уточняйте у специалиста"
  );
}


interface GalleryImage {
  id?: number;
  image_url?: string | null;
}

function PropertyCardPhoto({ property }: { property: Property }) {
  const [extraImages, setExtraImages] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    async function loadGallery() {
      try {
        const response = await fetch(
          `${API_URL}/properties/${property.id}/images`,
          { cache: "no-store", signal: controller.signal }
        );
        if (!response.ok) return;

        const data: unknown = await response.json();
        if (!Array.isArray(data) || cancelled) return;

        const urls = (data as GalleryImage[])
          .map((item) => item?.image_url)
          .filter((url): url is string => typeof url === "string" && url.trim().length > 0)
          .map((url) => imageSource(url));

        setExtraImages(urls);
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error(`DOMA: не удалось загрузить фотографии объекта ${property.id}:`, error);
        }
      }
    }

    setCurrentIndex(0);
    void loadGallery();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [property.id]);

  const images = useMemo(() => {
    const result: string[] = [];
    const seen = new Set<string>();

    [imageSource(property.image_url), ...extraImages].forEach((url) => {
      const key = url.split(/[?#]/, 1)[0].toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        result.push(url);
      }
    });

    return result.length ? result : [FALLBACK_IMAGE];
  }, [property.image_url, extraImages]);

  useEffect(() => {
    if (currentIndex >= images.length) setCurrentIndex(0);
  }, [currentIndex, images.length]);

  function handleMouseMove(event: React.MouseEvent<HTMLImageElement>) {
    if (images.length <= 1) return;

    const bounds = event.currentTarget.getBoundingClientRect();
    if (bounds.width <= 0) return;

    const relativeX = Math.max(
      0,
      Math.min(0.999999, (event.clientX - bounds.left) / bounds.width)
    );
    const nextIndex = Math.min(
      images.length - 1,
      Math.floor(relativeX * images.length)
    );

    if (nextIndex !== currentIndex) setCurrentIndex(nextIndex);
  }

  return (
    <img
      key={images[currentIndex]}
      className="exclusive-photo"
      src={images[currentIndex]}
      alt={property.title || "Объект недвижимости"}
      loading="lazy"
      onMouseMove={handleMouseMove}
      onError={(event) => {
        const image = event.currentTarget;
        if (image.dataset.fallbackApplied !== "true") {
          image.dataset.fallbackApplied = "true";
          image.src = FALLBACK_IMAGE;
        }
      }}
    />
  );
}

export default function ExclusiveProperties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [retryVersion, setRetryVersion] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey>("apartment");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [activeIndex, setActiveIndex] = useState(0);
  const trackRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 15000);

    async function loadProperties() {
      try {
        setLoadError(false);
        const response = await fetch(`${API_URL}/properties`, {
          cache: "no-store",
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Backend вернул HTTP ${response.status}`);
        }

        const data: unknown = await response.json();
        if (!Array.isArray(data)) {
          throw new Error("Backend вернул некорректный список объектов");
        }

        if (active) {
          const items = data as Property[];
          setProperties(items);

          // Prefer apartments like in the reference video, but don't show an
          // empty carousel when the database currently contains other types.
          const apartmentExists = items.some(
            (property) => normalizeType(property) === "apartment"
          );
          if (!apartmentExists) {
            const firstCategoryWithItems = CATEGORIES.find(({ key }) =>
              items.some((property) => normalizeType(property) === key)
            );
            if (firstCategoryWithItems) {
              setSelectedCategory(firstCategoryWithItems.key);
            }
          }
        }
      } catch (error) {
        console.error("DOMA: не удалось загрузить эксклюзивные предложения:", error);
        if (active) {
          setProperties([]);
          setLoadError(true);
        }
      } finally {
        window.clearTimeout(timeoutId);
        if (active) setLoading(false);
      }
    }

    void loadProperties();

    return () => {
      active = false;
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [retryVersion]);

  const visibleProperties = useMemo(
    () =>
      properties.filter(
        (property) => normalizeType(property) === selectedCategory
      ),
    [properties, selectedCategory]
  );

  useEffect(() => {
    setActiveIndex(0);
    if (trackRef.current) trackRef.current.scrollTo({ left: 0 });
  }, [selectedCategory]);

  function updateActiveIndex() {
    const track = trackRef.current;
    if (!track) return;
    const left = track.getBoundingClientRect().left;
    const children = Array.from(track.children) as HTMLElement[];
    if (!children.length) {
      setActiveIndex(0);
      return;
    }

    let closestIndex = 0;
    let closestDistance = Number.POSITIVE_INFINITY;
    children.forEach((child, index) => {
      const distance = Math.abs(child.getBoundingClientRect().left - left);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });
    setActiveIndex(closestIndex);
  }

  function scrollToCard(index: number) {
    const track = trackRef.current;
    if (!track) return;
    const child = track.children[index] as HTMLElement | undefined;
    if (!child) return;
    const trackLeft = track.getBoundingClientRect().left;
    const childLeft = child.getBoundingClientRect().left;
    track.scrollTo({
      left: track.scrollLeft + childLeft - trackLeft,
      behavior: "smooth",
    });
    setActiveIndex(index);
  }

  function scrollCarousel(direction: -1 | 1) {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({
      left: direction * Math.max(260, track.clientWidth * 0.78),
      behavior: "smooth",
    });
  }

  function toggleFavorite(id: number | string) {
    const key = String(id);
    setFavorites((previous) => {
      const next = new Set(previous);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  return (
    <section className="exclusive-section" aria-labelledby="exclusive-title">
      <div className="exclusive-inner">
        <div className="exclusive-heading">
          <h2 id="exclusive-title">Только у нас</h2>
        </div>

        <div className="exclusive-tabs" role="tablist" aria-label="Тип недвижимости">
          {CATEGORIES.map((category) => (
            <button
              key={category.key}
              type="button"
              role="tab"
              aria-selected={selectedCategory === category.key}
              className={`exclusive-tab ${selectedCategory === category.key ? "is-active" : ""}`}
              onClick={() => setSelectedCategory(category.key)}
            >
              {category.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="exclusive-message" role="status">
            Загружаем предложения…
          </div>
        ) : loadError ? (
          <div className="exclusive-message" role="status">
            <p>Не удалось загрузить объявления. Главная страница продолжает работать.</p>
            <button
              type="button"
              className="exclusive-retry"
              onClick={() => {
                setLoading(true);
                setLoadError(false);
                setRetryVersion((version) => version + 1);
              }}
            >
              Повторить загрузку
            </button>
          </div>
        ) : visibleProperties.length === 0 ? (
          <div className="exclusive-message">
            В этой категории пока нет опубликованных объектов.
            <Link href="/catalog" className="exclusive-empty-link">
              Смотреть весь каталог →
            </Link>
          </div>
        ) : (
          <>
            <div className="exclusive-carousel-shell">
              <button
                className="exclusive-arrow exclusive-arrow-left"
                type="button"
                aria-label="Предыдущие объекты"
                onClick={() => scrollCarousel(-1)}
                disabled={activeIndex === 0}
              >
                ‹
              </button>

              <div
                className="exclusive-track"
                ref={trackRef}
                onScroll={updateActiveIndex}
              >
                {visibleProperties.map((property) => {
                  const favorite = favorites.has(String(property.id));
                  const area = formatNumber(property.area);
                  const rooms = formatNumber(property.rooms);

                  return (
                    <article className="exclusive-card" key={property.id}>
                      <div className="exclusive-photo-wrap">
                        <Link
                          href={`/property/${property.id}`}
                          className="exclusive-photo-link"
                          aria-label={`Открыть объект: ${property.title || "Недвижимость"}`}
                        >
                          <PropertyCardPhoto property={property} />
                        </Link>
                        <span className="exclusive-badge">Эксклюзив</span>
                        <button
                          type="button"
                          className={`exclusive-favorite ${favorite ? "is-favorite" : ""}`}
                          aria-label={favorite ? "Убрать из избранного" : "Добавить в избранное"}
                          aria-pressed={favorite}
                          onClick={() => toggleFavorite(property.id)}
                        >
                          {favorite ? "♥" : "♡"}
                        </button>
                      </div>

                      <div className="exclusive-card-body">
                        <div className="exclusive-price-row">
                          <p className="exclusive-price">{formatPrice(property.price)}</p>
                          {area > 0 && Number(property.price) > 0 ? (
                            <span className="exclusive-price-per-meter">
                              {Math.round(Number(property.price) / area).toLocaleString("ru-RU")} ₽/м²
                            </span>
                          ) : null}
                        </div>

                        <Link href={`/property/${property.id}`} className="exclusive-card-title">
                          {property.title || "Объект недвижимости"}
                        </Link>

                        <p className="exclusive-characteristics">
                          {area > 0 ? `${area.toLocaleString("ru-RU")} м²` : "Площадь уточняется"}
                          {selectedCategory === "apartment" && rooms > 0
                            ? ` · ${rooms}+ комн.`
                            : ""}
                        </p>

                        <p className="exclusive-address">{propertyAddress(property)}</p>

                        <div className="exclusive-card-footer">
                          <span className="exclusive-deal">
                            {property.deal_type === "rent" || property.deal_type === "lease"
                              ? "Аренда"
                              : "Продажа"}
                          </span>
                          <Link href={`/property/${property.id}`} className="exclusive-details">
                            Подробнее <span aria-hidden="true">→</span>
                          </Link>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>

              <button
                className="exclusive-arrow exclusive-arrow-right"
                type="button"
                aria-label="Следующие объекты"
                onClick={() => scrollCarousel(1)}
                disabled={activeIndex >= visibleProperties.length - 1}
              >
                ›
              </button>
            </div>

            {visibleProperties.length > 1 ? (
              <div className="exclusive-dots" aria-label="Навигация по объектам">
                {visibleProperties.map((property, index) => (
                  <button
                    type="button"
                    key={property.id}
                    aria-label={`Показать объект ${index + 1}`}
                    aria-current={activeIndex === index ? "true" : undefined}
                    className={`exclusive-dot ${activeIndex === index ? "is-active" : ""}`}
                    onClick={() => scrollToCard(index)}
                  />
                ))}
              </div>
            ) : null}
          </>
        )}

      </div>

      <style jsx>{`
        .exclusive-section {
          width: 100%;
          margin: 76px 0;
          padding: 58px 24px 48px;
          background: #f5f6fa;
          box-sizing: border-box;
          overflow: hidden;
        }
        .exclusive-inner {
          max-width: 1240px;
          margin: 0 auto;
        }
        .exclusive-heading {
          text-align: center;
          margin: 0 auto 24px;
        }
        .exclusive-heading h2 {
          margin: 0;
          color: #101828;
          font-size: clamp(30px, 3vw, 38px);
          line-height: 1.15;
          letter-spacing: -1.2px;
          font-weight: 750;
        }
        .exclusive-tabs {
          display: flex;
          justify-content: center;
          align-items: center;
          flex-wrap: wrap;
          gap: 4px;
          width: fit-content;
          max-width: 100%;
          margin: 0 auto 25px;
          padding: 5px;
          border: 1px solid #e6e9f0;
          border-radius: 999px;
          background: #fff;
        }
        .exclusive-tab {
          padding: 10px 17px;
          border: 0;
          border-radius: 999px;
          background: transparent;
          color: #727e92;
          font: inherit;
          font-size: 12px;
          font-weight: 600;
          white-space: nowrap;
          cursor: pointer;
          transition: background 160ms ease, color 160ms ease;
        }
        .exclusive-tab:hover {
          color: #ed3f46;
        }
        .exclusive-tab.is-active {
          background: #fff0f0;
          color: #e93942;
        }
        .exclusive-carousel-shell {
          position: relative;
        }
        .exclusive-track {
          display: flex;
          align-items: stretch;
          gap: 12px;
          overflow-x: auto;
          overflow-y: hidden;
          padding: 0 2px 8px;
          scroll-snap-type: x mandatory;
          scroll-behavior: smooth;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .exclusive-track::-webkit-scrollbar {
          display: none;
        }
        .exclusive-card {
          flex: 0 0 clamp(230px, 22.5%, 276px);
          min-width: 0;
          overflow: hidden;
          scroll-snap-align: start;
          border: 1.5px solid #f0444d;
          border-radius: 19px;
          background: #fff;
          box-shadow: 0 5px 14px rgba(17, 24, 39, 0.035);
        }
        .exclusive-photo-wrap {
          position: relative;
          height: 168px;
          overflow: hidden;
          background: #e7eaf0;
        }
        .exclusive-photo-link {
          display: block;
          width: 100%;
          height: 100%;
        }
        .exclusive-photo {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 220ms ease;
        }
        .exclusive-card:hover .exclusive-photo {
          transform: scale(1.035);
        }
        .exclusive-badge {
          position: absolute;
          top: 10px;
          left: 10px;
          padding: 5px 10px;
          border-radius: 999px;
          background: #f15b54;
          color: white;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.1px;
          pointer-events: none;
        }
        .exclusive-favorite {
          position: absolute;
          top: 8px;
          right: 8px;
          display: grid;
          place-items: center;
          width: 32px;
          height: 32px;
          border: 1px solid rgba(255, 255, 255, 0.8);
          border-radius: 50%;
          background: rgba(28, 34, 45, 0.64);
          color: #fff;
          font-size: 20px;
          line-height: 1;
          cursor: pointer;
        }
        .exclusive-favorite.is-favorite {
          background: #ed4149;
          border-color: #ed4149;
        }
        .exclusive-card-body {
          display: flex;
          min-height: 202px;
          flex-direction: column;
          padding: 13px 13px 12px;
        }
        .exclusive-price-row {
          display: flex;
          flex-wrap: wrap;
          align-items: baseline;
          justify-content: space-between;
          gap: 3px 7px;
          margin-bottom: 8px;
        }
        .exclusive-price {
          margin: 0;
          color: #151a23;
          font-size: 21px;
          line-height: 1.2;
          font-weight: 800;
          letter-spacing: -0.45px;
        }
        .exclusive-price-per-meter {
          color: #8590a3;
          font-size: 10px;
          white-space: nowrap;
        }
        .exclusive-card-title {
          display: -webkit-box;
          min-height: 36px;
          overflow: hidden;
          color: #1d2431;
          font-size: 13px;
          font-weight: 700;
          line-height: 1.4;
          text-decoration: none;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }
        .exclusive-card-title:hover {
          color: #e83c45;
        }
        .exclusive-characteristics {
          margin: 7px 0 0;
          color: #7a879d;
          font-size: 11px;
          line-height: 1.4;
        }
        .exclusive-address {
          display: -webkit-box;
          min-height: 31px;
          overflow: hidden;
          margin: 7px 0 12px;
          color: #69768c;
          font-size: 11px;
          line-height: 1.4;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }
        .exclusive-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          margin-top: auto;
        }
        .exclusive-deal {
          display: inline-flex;
          align-items: center;
          min-height: 24px;
          padding: 4px 8px;
          border-radius: 7px;
          background: #f5f6f9;
          color: #68758a;
          font-size: 10px;
          white-space: nowrap;
        }
        .exclusive-details {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          color: #e83e47;
          font-size: 11px;
          font-weight: 700;
          text-decoration: none;
          white-space: nowrap;
        }
        .exclusive-details:hover {
          text-decoration: underline;
        }
        .exclusive-arrow {
          position: absolute;
          z-index: 2;
          top: 44%;
          display: grid;
          place-items: center;
          width: 38px;
          height: 38px;
          border: 1px solid #e4e7ed;
          border-radius: 50%;
          background: #fff;
          color: #364152;
          font-size: 28px;
          line-height: 1;
          box-shadow: 0 4px 14px rgba(18, 24, 38, 0.1);
          cursor: pointer;
          transform: translateY(-50%);
        }
        .exclusive-arrow:disabled {
          opacity: 0.35;
          cursor: default;
        }
        .exclusive-arrow-left {
          left: -17px;
        }
        .exclusive-arrow-right {
          right: -17px;
        }
        .exclusive-dots {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 5px;
          margin: 13px 0 0;
        }
        .exclusive-dot {
          width: 6px;
          height: 6px;
          padding: 0;
          border: 0;
          border-radius: 50%;
          background: #cbd0da;
          cursor: pointer;
        }
        .exclusive-dot.is-active {
          background: #ef444c;
          transform: scale(1.12);
        }
        .exclusive-message {
          padding: 28px 18px;
          border: 1px solid #e7eaf1;
          border-radius: 18px;
          background: #fff;
          color: #69768c;
          text-align: center;
          font-size: 14px;
        }
        .exclusive-message p {
          margin: 0 0 13px;
        }
        .exclusive-retry {
          padding: 9px 16px;
          border: 0;
          border-radius: 999px;
          background: #ef444c;
          color: #fff;
          font: inherit;
          font-weight: 600;
          cursor: pointer;
        }
        .exclusive-empty-link {
          display: block;
          width: fit-content;
          margin: 12px auto 0;
          color: #e83e47;
          font-weight: 700;
          text-decoration: none;
        }
        @media (max-width: 700px) {
          .exclusive-section {
            margin: 48px 0;
            padding: 42px 15px 36px;
          }
          .exclusive-heading {
            margin-bottom: 18px;
          }
          .exclusive-tabs {
            width: 100%;
            flex-wrap: nowrap;
            justify-content: flex-start;
            overflow-x: auto;
            border-radius: 16px;
            margin-bottom: 18px;
            scrollbar-width: none;
          }
          .exclusive-tabs::-webkit-scrollbar {
            display: none;
          }
          .exclusive-tab {
            padding: 9px 13px;
            font-size: 11px;
          }
          .exclusive-card {
            flex-basis: min(78vw, 285px);
          }
          .exclusive-photo-wrap {
            height: 178px;
          }
          .exclusive-arrow {
            width: 32px;
            height: 32px;
            font-size: 24px;
          }
          .exclusive-arrow-left {
            left: -8px;
          }
          .exclusive-arrow-right {
            right: -8px;
          }
        }
      `}</style>
    </section>
  );
}
