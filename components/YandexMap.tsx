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
  coordinates?: [number, number];
  address?: string;
  district?: string;
  city?: string;
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

const API_URL = "https://doma-nq4u.onrender.com";

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

/** Определяет координаты по адресу через backend, где хранится серверный ключ Геокодера. */
async function geocodePublicAddress(address: string): Promise<[number, number] | null> {
  const cleanAddress = address.trim();
  if (!cleanAddress) return null;

  const query = new URLSearchParams({ address: cleanAddress });
  const response = await fetch(`${API_URL}/geocode?${query.toString()}`, { cache: "no-store" });
  if (!response.ok) return null;

  const data = await response.json();
  if (data?.found !== true) return null;
  const longitude = Number(data.longitude);
  const latitude = Number(data.latitude);
  if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) return null;
  if (longitude < -180 || longitude > 180 || latitude < -90 || latitude > 90) return null;
  return [longitude, latitude];
}

function validCoordinates(value?: [number, number] | null): value is [number, number] {
  return Array.isArray(value) && value.length === 2 &&
    Number.isFinite(Number(value[0])) && Number.isFinite(Number(value[1])) &&
    Number(value[0]) >= -180 && Number(value[0]) <= 180 &&
    Number(value[1]) >= -90 && Number(value[1]) <= 90;
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

type YandexPropertyLocationMapProps = {
  address: string;
  latitude?: number | null;
  longitude?: number | null;
  height?: string;
};

/** Публичная карта объекта. Использует сохранённые координаты или геокодирует публичный адрес. */
export function YandexPropertyLocationMap({
  address,
  latitude,
  longitude,
  height = "300px",
}: YandexPropertyLocationMapProps) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const currentPointRef = useRef<[number, number] | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "no-point" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const onFullscreenChange = () => {
      const active = document.fullscreenElement === wrapperRef.current;
      setIsFullscreen(active);
      // After entering fullscreen, ask the map to redraw around the last resolved point.
      const point = currentPointRef.current;
      if (active && point && mapRef.current) {
        window.setTimeout(() => {
          mapRef.current?.update({ location: { center: point, zoom: 16, duration: 0 } });
        }, 100);
      }
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  async function toggleFullscreen() {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    try {
      if (document.fullscreenElement === wrapper) {
        await document.exitFullscreen();
      } else if (wrapper.requestFullscreen) {
        await wrapper.requestFullscreen();
      } else {
        const url = `https://yandex.ru/maps/?text=${encodeURIComponent(address)}`;
        window.open(url, "_blank", "noopener,noreferrer");
      }
    } catch (error) {
      console.warn("Не удалось развернуть карту на весь экран:", error);
      const url = `https://yandex.ru/maps/?text=${encodeURIComponent(address)}`;
      window.open(url, "_blank", "noopener,noreferrer");
    }
  }

  useEffect(() => {
    let cancelled = false;
    let map: any = null;
    let marker: any = null;

    async function init() {
      try {
        setStatus("loading");
        const ymaps = await loadYandexMaps();
        if (cancelled || !containerRef.current) return;

        const hasSavedCoordinates =
          latitude !== null && latitude !== undefined &&
          longitude !== null && longitude !== undefined &&
          Number.isFinite(Number(latitude)) && Number.isFinite(Number(longitude)) &&
          Number(latitude) >= -90 && Number(latitude) <= 90 &&
          Number(longitude) >= -180 && Number(longitude) <= 180;

        let point: [number, number] | null = hasSavedCoordinates
          ? [Number(longitude), Number(latitude)]
          : null;

        map = new ymaps.YMap(containerRef.current, {
          location: { center: point ?? KRASNODAR_CENTER, zoom: point ? 16 : 11 },
          mode: "vector",
        });
        mapRef.current = map;
        map.addChild(new ymaps.YMapDefaultSchemeLayer({}));
        map.addChild(new ymaps.YMapDefaultFeaturesLayer({}));

        if (!point && address.trim()) {
          point = await geocodePublicAddress(address).catch((error) => {
            console.warn("Не удалось определить адрес объекта:", error);
            return null;
          });
        }

        if (cancelled) return;
        if (!point) {
          setStatus("no-point");
          return;
        }

        currentPointRef.current = point;
        map.update({ location: { center: point, zoom: 16, duration: 250 } });
        const pin = document.createElement("div");
        pin.setAttribute("aria-label", "Расположение объекта");
        pin.style.cssText = "width:24px;height:24px;border:3px solid #fff;border-radius:50% 50% 50% 0;background:#ef3340;box-shadow:0 3px 10px rgba(0,0,0,.3);transform:translate(-50%,-100%) rotate(-45deg);display:flex;align-items:center;justify-content:center;box-sizing:border-box;";
        const dot = document.createElement("span");
        dot.style.cssText = "width:6px;height:6px;border-radius:50%;background:#fff;";
        pin.appendChild(dot);
        marker = new ymaps.YMapMarker({ coordinates: point }, pin);
        map.addChild(marker);
        setStatus("ready");
      } catch (error) {
        console.error("Ошибка карты расположения объекта:", error);
        if (!cancelled) {
          setErrorMessage(error instanceof Error ? error.message : "Не удалось загрузить карту");
          setStatus("error");
        }
      }
    }

    void init();
    return () => {
      cancelled = true;
      if (map) {
        if (marker) {
          try { map.removeChild(marker); } catch { /* ignore */ }
        }
        try { map.destroy(); } catch { /* ignore */ }
      }
      if (mapRef.current === map) mapRef.current = null;
      currentPointRef.current = null;
    };
  }, [address, latitude, longitude]);

  return (
    <div ref={wrapperRef} className="doma-property-map" style={{ height }}>
      <div ref={containerRef} className="doma-property-map__canvas" />
      <button
        type="button"
        className="doma-property-map__fullscreen"
        onClick={() => void toggleFullscreen()}
        aria-label={isFullscreen ? "Свернуть карту" : "Открыть карту на весь экран"}
        title={isFullscreen ? "Свернуть карту" : "Открыть большую карту"}
      >
        {isFullscreen ? "⤢" : "⛶"}
      </button>
      {status === "loading" && <div className="doma-property-map__overlay">Определяем расположение объекта…</div>}
      {status === "no-point" && <div className="doma-property-map__overlay">Не удалось определить точку по адресу. Проверьте публичный адрес объекта.</div>}
      {status === "error" && <div className="doma-property-map__overlay">Не удалось загрузить карту{errorMessage ? `: ${errorMessage}` : ""}</div>}
      <style jsx>{`
        .doma-property-map { position: relative; width: 100%; margin-top: 16px; overflow: hidden; border: 1px solid #e9ebe8; border-radius: 16px; background: #eef1f4; }
        .doma-property-map__canvas { width: 100%; height: 100%; }
        .doma-property-map__fullscreen { position: absolute; top: 12px; right: 12px; z-index: 30; width: 48px; height: 48px; display: grid; place-items: center; border: 1px solid #d8dee8; border-radius: 50%; background: rgba(255,255,255,.97); color: #26313d; font-size: 24px; cursor: pointer; box-shadow: 0 2px 10px rgba(15,23,42,.10); }
        .doma-property-map__fullscreen:hover { background: #fff; box-shadow: 0 4px 15px rgba(15,23,42,.17); }
        .doma-property-map:fullscreen { width: 100vw !important; height: 100vh !important; max-height: none; margin: 0; border: 0; border-radius: 0; background: #eef1f4; }
        .doma-property-map:fullscreen .doma-property-map__canvas { height: 100vh !important; }
        .doma-property-map__overlay { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; padding: 20px; background: rgba(238,241,244,.94); color: #64707d; font-size: 13px; text-align: center; }
      `}</style>
    </div>
  );
}

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
  const effectiveMarkers = markers !== undefined ? markers : apiMarkers;

  useEffect(() => {
    if (markers !== undefined) return;
    let cancelled = false;

    async function loadPropertyMarkers() {
      try {
        const response = await fetch("https://doma-nq4u.onrender.com/properties", { cache: "no-store" });
        if (!response.ok) return;
        const rows = await response.json();
        if (cancelled || !Array.isArray(rows)) return;
        const mapped: MapMarker[] = rows
          .filter((item: any) => item && item.is_draft !== true)
          .map((item: any) => {
            const hasCoordinates =
              item.latitude !== null && item.latitude !== undefined &&
              item.longitude !== null && item.longitude !== undefined &&
              Number.isFinite(Number(item.latitude)) && Number.isFinite(Number(item.longitude));
            return {
              id: Number(item.id),
              title: String(item.title ?? "Объект недвижимости"),
              price: Number(item.price ?? 0),
              coordinates: hasCoordinates
                ? [Number(item.longitude), Number(item.latitude)] as [number, number]
                : undefined,
              address: String(item.address ?? item.public_address ?? ""),
              district: String(item.district ?? ""),
              city: String(item.city ?? "Краснодар"),
            };
          })
          .filter((item: MapMarker) => item.coordinates || item.address || item.district);
        setApiMarkers(mapped);
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

    let cancelled = false;
    markersRef.current.forEach((marker) => {
      try { map.removeChild(marker); } catch { /* already removed */ }
    });
    markersRef.current = [];

    async function drawMarkers() {
      const resolved = await Promise.all(effectiveMarkers.map(async (item) => {
        if (validCoordinates(item.coordinates)) {
          return { item, coordinates: item.coordinates };
        }
        const query = [item.address, item.district, item.city]
          .map((part) => (part || "").trim())
          .filter(Boolean)
          .join(", ");
        if (!query) return null;
        try {
          const coordinates = await geocodePublicAddress(query);
          return coordinates ? { item, coordinates } : null;
        } catch (error) {
          console.warn(`Не удалось определить адрес объявления №${item.id}:`, error);
          return null;
        }
      }));

      if (cancelled) return;
      const valid = resolved.filter((entry): entry is { item: MapMarker; coordinates: [number, number] } => entry !== null);

      if (valid.length > 0) {
        const center: [number, number] = [
          valid.reduce((sum, entry) => sum + entry.coordinates[0], 0) / valid.length,
          valid.reduce((sum, entry) => sum + entry.coordinates[1], 0) / valid.length,
        ];
        map.update({ location: { center, zoom: valid.length === 1 ? 14 : 11, duration: 300 } });
      }

      valid.forEach(({ item, coordinates }) => {
        const content = document.createElement("div");
        content.className = "doma-map-marker";
        content.setAttribute("title", [item.title, item.address].filter(Boolean).join(" · "));
        content.innerHTML = `
          <div class="doma-map-marker__price">
            ${Number(item.price || 0).toLocaleString("ru-RU")} ₽
          </div>
        `;
        const marker = new ymaps.YMapMarker({ coordinates }, content);
        map.addChild(marker);
        markersRef.current.push(marker);
      });
    }

    void drawMarkers();
    return () => { cancelled = true; };
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