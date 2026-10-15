"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";
import type { CSSProperties } from "react";

interface MapMarker {
  id: number;
  title: string;
  price: number;
  coordinates: [number, number];
}

/** Получает координаты по публичному адресу объекта. */
async function geocodePublicAddress(address: string, apiKey: string): Promise<[number, number] | null> {
  const cleanAddress = address.trim();
  if (!cleanAddress) return null;

  try {
    const params = new URLSearchParams({
      apikey: apiKey,
      geocode: cleanAddress,
      format: "json",
      lang: "ru_RU",
      results: "1",
    });
    const response = await fetch(`https://geocode-maps.yandex.ru/v1/?${params.toString()}`);
    if (!response.ok) return null;

    const data = await response.json();
    const position = data?.response?.GeoObjectCollection?.featureMember?.[0]?.GeoObject?.Point?.pos;
    if (typeof position !== "string") return null;

    // Геокодер возвращает координаты в порядке «долгота широта».
    const [longitudeText, latitudeText] = position.split(" ");
    const longitude = Number(longitudeText);
    const latitude = Number(latitudeText);
    if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) return null;
    return [longitude, latitude];
  } catch (error) {
    console.warn("Не удалось определить координаты публичного адреса:", error);
    return null;
  }
}

interface YandexMapProps {
  markers?: MapMarker[];
  height?: string;
}

declare global {
  interface Window {
    ymaps3?: any;
  }
}

const KRASNODAR_CENTER: [
  number,
  number
] = [38.9769, 45.0355];

let ymapsPromise: Promise<any> | null =
  null;

function loadYandexMaps() {
  if (
    typeof window ===
    "undefined"
  ) {
    return Promise.reject(
      new Error(
        "Yandex Maps доступен только в браузере"
      )
    );
  }

  if (window.ymaps3) {
    return Promise.resolve(
      window.ymaps3
    );
  }

  if (ymapsPromise) {
    return ymapsPromise;
  }

  const apiKey =
    process.env
      .NEXT_PUBLIC_YANDEX_MAPS_API_KEY;

  if (!apiKey) {
    return Promise.reject(
      new Error(
        "Не найден NEXT_PUBLIC_YANDEX_MAPS_API_KEY"
      )
    );
  }

  ymapsPromise =
    new Promise(
      (
        resolve,
        reject
      ) => {
        const existingScript =
          document.querySelector(
            'script[data-yandex-maps="true"]'
          ) as HTMLScriptElement | null;

        const script =
          existingScript ??
          document.createElement(
            "script"
          );

        const handleLoad =
          async () => {
            try {
              if (
                !window.ymaps3
              ) {
                throw new Error(
                  "ymaps3 не появился после загрузки API"
                );
              }

              await window.ymaps3
                .ready;

              resolve(
                window.ymaps3
              );
            } catch (error) {
              reject(error);
            }
          };

        const handleError =
          () => {
            reject(
              new Error(
                "Не удалось загрузить API Яндекс.Карт. Проверь API-ключ и ограничения HTTP Referer."
              )
            );
          };

        script.addEventListener(
          "load",
          handleLoad,
          {
            once: true,
          }
        );

        script.addEventListener(
          "error",
          handleError,
          {
            once: true,
          }
        );

        if (!existingScript) {
          script.src =
            `https://api-maps.yandex.ru/v3/?apikey=${encodeURIComponent(
              apiKey
            )}&lang=ru_RU`;

          script.async = true;
          script.dataset.yandexMaps =
            "true";

          document.head.appendChild(
            script
          );
        } else if (
          window.ymaps3
        ) {
          handleLoad();
        }
      }
    );

  return ymapsPromise;
}

type YandexAddressPreviewProps = {
  address: string;
  height?: string;
  onCoordinatesChange?: (coordinates: [number, number]) => void;
};

/**
 * Карта для формы CRM. Она показывается под полем адреса,
 * центрируется по введённому адресу и позволяет уточнить точку кликом.
 * Основной компонент YandexMap ниже оставлен без изменений.
 */
export function YandexAddressPreview({
  address,
  height = "220px",
  onCoordinatesChange,
}: YandexAddressPreviewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedCoordinates, setSelectedCoordinates] = useState<[number, number] | null>(null);
  const hasAddress = address.trim().length > 0;

  useEffect(() => {
    let cancelled = false;

    async function init() {
      if (!hasAddress || !containerRef.current) return;
      try {
        setStatus("loading");
        const ymaps = await loadYandexMaps();
        if (cancelled || !containerRef.current) return;

        // The component may remount in React Strict Mode.
        if (mapRef.current) {
          setStatus("ready");
          return;
        }

        const map = new ymaps.YMap(containerRef.current, {
          location: { center: KRASNODAR_CENTER, zoom: 11 },
          mode: "vector",
        });
        map.addChild(new ymaps.YMapDefaultSchemeLayer({}));
        map.addChild(new ymaps.YMapDefaultFeaturesLayer({}));

        const listener = new ymaps.YMapListener({
          onClick: (_object: unknown, event: any) => {
            const coordinates = event?.coordinates;
            if (!Array.isArray(coordinates) || coordinates.length !== 2) return;
            const point: [number, number] = [Number(coordinates[0]), Number(coordinates[1])];
            if (!point.every(Number.isFinite)) return;

            setSelectedCoordinates(point);
            onCoordinatesChange?.(point);

            if (markerRef.current) {
              try { map.removeChild(markerRef.current); } catch { /* marker already removed */ }
            }
            const pin = document.createElement("div");
            pin.className = "doma-address-pin";
            pin.setAttribute("aria-label", "Выбранное местоположение");
            pin.innerHTML = '<span></span>';
            markerRef.current = new ymaps.YMapMarker({ coordinates: point }, pin);
            map.addChild(markerRef.current);
          },
        });
        map.addChild(listener);
        mapRef.current = map;
        setStatus("ready");
      } catch (error) {
        console.error("Yandex address preview error:", error);
        if (!cancelled) {
          setStatus("error");
          setErrorMessage(error instanceof Error ? error.message : "Не удалось загрузить карту");
        }
      }
    }

    void init();
    return () => {
      cancelled = true;
      if (mapRef.current) {
        try { mapRef.current.destroy(); } catch { /* ignore */ }
        mapRef.current = null;
        markerRef.current = null;
      }
    };
    // Reinitialize when the address field changes from empty to non-empty.
  }, [hasAddress]);

  useEffect(() => {
    let cancelled = false;
    const cleanAddress = address.trim();
    if (!cleanAddress || status !== "ready" || !mapRef.current) return;

    async function locateAddress() {
      const apiKey = process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY;
      if (!apiKey) return;
      try {
        const query = new URLSearchParams({
          apikey: apiKey,
          geocode: cleanAddress,
          format: "json",
          lang: "ru_RU",
          results: "1",
        });
        const response = await fetch(`https://geocode-maps.yandex.ru/v1/?${query.toString()}`);
        if (!response.ok) return;
        const data = await response.json();
        if (cancelled) return;
        const pos = data?.response?.GeoObjectCollection?.featureMember?.[0]?.GeoObject?.Point?.pos;
        if (typeof pos !== "string") return;
        const [longitudeText, latitudeText] = pos.split(" ");
        const longitude = Number(longitudeText);
        const latitude = Number(latitudeText);
        if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) return;

        const point: [number, number] = [longitude, latitude];
        mapRef.current?.update({ location: { center: point, zoom: 16, duration: 250 } });
        setSelectedCoordinates(point);
        onCoordinatesChange?.(point);

        const ymaps = window.ymaps3;
        if (ymaps && mapRef.current) {
          if (markerRef.current) {
            try { mapRef.current.removeChild(markerRef.current); } catch { /* ignore */ }
          }
          const pin = document.createElement("div");
          pin.className = "doma-address-pin";
          pin.setAttribute("aria-label", "Выбранное местоположение");
          pin.innerHTML = '<span></span>';
          markerRef.current = new ymaps.YMapMarker({ coordinates: point }, pin);
          mapRef.current.addChild(markerRef.current);
        }
      } catch (error) {
        // Keep the interactive map available if address lookup fails.
        console.warn("Не удалось определить координаты адреса:", error);
      }
    }

    const delay = window.setTimeout(() => { void locateAddress(); }, 450);
    return () => {
      cancelled = true;
      window.clearTimeout(delay);
    };
  }, [address, status, onCoordinatesChange]);

  if (!hasAddress) return null;

  return (
    // Нулевой контейнер не сдвигает форму: карта открывается поверх формы
    // сразу под полем реального адреса и не занимает постоянное место.
    <div style={{ position: "relative", width: "100%", height: 0, zIndex: 30 }}>
      <div style={{
        position: "absolute",
        top: "8px",
        left: 0,
        width: "min(360px, calc(100vw - 48px))",
        height,
        zIndex: 30,
        overflow: "hidden",
        borderRadius: "14px",
        border: "1px solid #e6ebf2",
        background: "#eef1f4",
        boxShadow: "0 16px 40px rgba(15, 23, 42, .20)",
      }}>
        <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
        {status === "loading" && (
          <div style={addressMapOverlayStyle}>Загружаем карту…</div>
        )}
        {status === "error" && (
          <div style={addressMapOverlayStyle}>
            <strong>Не удалось загрузить карту</strong>
            <span style={{ maxWidth: "90%", textAlign: "center" }}>{errorMessage}</span>
          </div>
        )}
        {status === "ready" && (
          <div style={{ position: "absolute", left: "8px", bottom: "8px", zIndex: 5, padding: "6px 8px", borderRadius: "8px", background: "rgba(255,255,255,.96)", color: "#475569", fontSize: "10px", boxShadow: "0 2px 8px rgba(15,23,42,.12)" }}>
            Нажмите на карту, чтобы уточнить точку
          </div>
        )}
        {selectedCoordinates && status === "ready" && (
          <div style={{ position: "absolute", top: "8px", right: "8px", zIndex: 5, padding: "5px 7px", borderRadius: "7px", background: "rgba(255,255,255,.96)", color: "#475569", fontSize: "10px" }}>
            Точка выбрана
          </div>
        )}
      </div>
      <style jsx global>{`
        .doma-address-pin {
          width: 22px;
          height: 22px;
          border: 3px solid #fff;
          border-radius: 50% 50% 50% 0;
          background: #ef3340;
          box-shadow: 0 2px 8px rgba(0,0,0,.28);
          transform: translate(-50%, -100%) rotate(-45deg);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .doma-address-pin span {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: white;
        }
      `}</style>
    </div>
  );
}

const addressMapOverlayStyle: CSSProperties = {
  position: "absolute",
  inset: 0,
  zIndex: 5,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexDirection: "column",
  gap: "8px",
  padding: "20px",
  background: "#eef1f4",
  color: "#657180",
  fontSize: "13px",
};

export default function YandexMap({
  markers,
  height = "650px",
}: YandexMapProps) {
  const mapContainerRef =
    useRef<HTMLDivElement | null>(
      null
    );

  const mapRef =
    useRef<any>(null);

  const markersRef =
    useRef<any[]>([]);

  const [status, setStatus] =
    useState<
      "loading" |
      "ready" |
      "error"
    >("loading");

  const [errorMessage, setErrorMessage] =
    useState("");

  const [apiMarkers, setApiMarkers] = useState<MapMarker[]>([]);
  const effectiveMarkers = markers && markers.length > 0 ? markers : apiMarkers;


  useEffect(() => {
    if (markers && markers.length > 0) return;
    let cancelled = false;

    async function loadPropertyMarkers() {
      try {
        const response = await fetch("https://doma-nq4u.onrender.com/properties", { cache: "no-store" });
        if (!response.ok) return;
        const rows = await response.json();
        if (cancelled || !Array.isArray(rows)) return;
        const apiKey = process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY;
        const publicProperties = rows.filter((item: any) => item && !item.is_draft);

        // Сначала используем сохранённые координаты. Если их ещё нет,
        // определяем точку по публичному адресу, чтобы старые объявления
        // тоже появились на карте без изменения схемы базы данных.
        const mappedResults = await Promise.all(publicProperties.map(async (item: any) => {
          let coordinates: [number, number] | null = null;
          const longitude = Number(item.longitude);
          const latitude = Number(item.latitude);

          if (item.longitude != null && item.latitude != null &&
              Number.isFinite(longitude) && Number.isFinite(latitude) &&
              longitude >= -180 && longitude <= 180 && latitude >= -90 && latitude <= 90) {
            coordinates = [longitude, latitude];
          } else if (apiKey) {
            // Не используем real_address: публичная карта не должна раскрывать
            // скрытый/реальный адрес продавца.
            const publicAddress = String(item.public_address || item.address || "").trim();
            const city = String(item.city || "Краснодар").trim();
            const district = String(item.district || "").trim();
            if (publicAddress) {
              const query = [publicAddress, district, city].filter(Boolean).join(", ");
              coordinates = await geocodePublicAddress(query, apiKey);
            }
          }

          if (!coordinates) return null;
          return {
            id: Number(item.id),
            title: String(item.title ?? "Объект недвижимости"),
            price: Number(item.price ?? 0),
            coordinates,
          } satisfies MapMarker;
        }));

        setApiMarkers(mappedResults.filter((item): item is MapMarker => item !== null));
      } catch (error) {
        console.error("Не удалось загрузить точки объектов:", error);
      }
    }

    void loadPropertyMarkers();
    return () => { cancelled = true; };
  }, [markers]);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        setStatus("loading");

        const ymaps =
          await loadYandexMaps();

        if (
          cancelled ||
          !mapContainerRef.current
        ) {
          return;
        }

        /*
         * Не создаём карту второй раз
         * при React Strict Mode.
         */
        if (mapRef.current) {
          setStatus("ready");
          return;
        }

        const {
          YMap,
          YMapDefaultSchemeLayer,
          YMapDefaultFeaturesLayer,
        } = ymaps;

        const map =
          new YMap(
            mapContainerRef.current,
            {
              location: {
                center:
                  KRASNODAR_CENTER,
                zoom: 11,
              },
              mode: "vector",
            }
          );

        map.addChild(
          new YMapDefaultSchemeLayer(
            {}
          )
        );

        map.addChild(
          new YMapDefaultFeaturesLayer(
            {}
          )
        );

        mapRef.current = map;

        setStatus("ready");
      } catch (error) {
        console.error(
          "Yandex Maps error:",
          error
        );

        if (!cancelled) {
          setStatus("error");

          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Не удалось загрузить карту"
          );
        }
      }
    }

    init();

    return () => {
      cancelled = true;

      if (mapRef.current) {
        try {
          mapRef.current.destroy();
        } catch {
          // ignore
        }

        mapRef.current = null;
      }

      markersRef.current = [];
    };
  }, []);


  useEffect(() => {
    const map = mapRef.current;
    const ymaps = window.ymaps3;
    if (!map || !ymaps || status !== "ready") return;

    markersRef.current.forEach((marker) => {
      try { map.removeChild(marker); } catch { /* already removed */ }
    });
    markersRef.current = [];

    effectiveMarkers.forEach((item) => {
      if (!Array.isArray(item.coordinates) || item.coordinates.length !== 2) return;
      const content = document.createElement("div");
      content.className = "doma-map-marker";
      content.innerHTML = `
        <div class="doma-map-marker__price">
          ${Number(item.price || 0).toLocaleString("ru-RU")} ₽
        </div>
      `;
      const marker = new ymaps.YMapMarker(
        { coordinates: item.coordinates },
        content
      );
      map.addChild(marker);
      markersRef.current.push(marker);
    });
  }, [effectiveMarkers, status]);

  return (
    <div
      className="map-wrapper"
      style={{
        height,
      }}
    >
      <div
        ref={mapContainerRef}
        className="map-container"
      />

      {status === "loading" && (
        <div className="map-overlay">
          <div className="loader" />

          <span>
            Загружаем карту...
          </span>
        </div>
      )}

      {status === "error" && (
        <div className="map-overlay error">
          <div className="error-icon">
            ⚠
          </div>

          <strong>
            Не удалось загрузить карту
          </strong>

          <p>
            {errorMessage}
          </p>
        </div>
      )}

      <style jsx global>{`
        .map-wrapper {
          position: relative;
          width: 100%;
          overflow: hidden;
          border-radius: 24px;
          background: #e9edf2;
        }

        .map-container {
          width: 100%;
          height: 100%;
        }

        .map-overlay {
          position: absolute;
          inset: 0;
          z-index: 20;

          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          gap: 12px;

          background: #eef1f4;
          color: #657180;
          font-size: 14px;
        }

        .map-overlay.error {
          padding: 30px;
          text-align: center;
        }

        .map-overlay.error p {
          max-width: 600px;
          margin: 4px 0 0;
          color: #7a8491;
          font-size: 13px;
          line-height: 1.6;
        }

        .error-icon {
          font-size: 36px;
        }

        .loader {
          width: 32px;
          height: 32px;
          border:
            3px solid
            #d9dee5;
          border-top-color:
            #ef4444;
          border-radius: 50%;
          animation:
            doma-map-spin
            0.8s linear infinite;
        }

        @keyframes doma-map-spin {
          to {
            transform: rotate(360deg);
          }
        }

        .doma-map-marker {
          transform:
            translate(
              -50%,
              -100%
            );
          cursor: pointer;
        }

        .doma-map-marker__price {
          display: inline-block;
          padding:
            8px
            11px;
          border-radius: 10px;
          background: #ef4444;
          color: #ffffff;
          box-shadow:
            0 5px 15px
              rgba(
                0,
                0,
                0,
                0.18
              );
          font-size: 12px;
          font-weight: 700;
          line-height: 1;
          white-space: nowrap;
        }
      `}</style>
    </div>
  );
}