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
  image_url?: string | null;
  area?: number | null;
  rooms?: number | null;
  status?: string | null;
  property_type?: string | null;
  property_type_label?: string | null;
  property_subtype?: string | null;
  property_subtype_label?: string | null;
  deal_type?: string | null;
  deal_type_label?: string | null;
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
const DOMA_MAP_MARKER_SOURCE = "doma-property-markers";

const KRASNODAR_CENTER: [
  number,
  number
] = [38.9769, 45.0355];

const MAP_PROPERTY_TYPE_LABELS: Record<string, string> = {
  apartment: "Квартира",
  house: "Дом",
  land: "Участок",
  commercial: "Коммерция",
  garage: "Гараж",
};

const MAP_DEAL_TYPE_LABELS: Record<string, string> = {
  sale: "Продажа",
  rent: "Аренда",
  lease: "Сдача",
};

const MAP_SUBTYPE_LABELS: Record<string, string> = {
  secondary: "Вторичка",
  new_building: "Новостройка",
  studio: "Студия",
  "1_room": "1-комнатная",
  "2_room": "2-комнатная",
  "3_room": "3-комнатная",
  "4_room": "4-комнатная",
  "5_room": "5-комнатная",
  penthouse: "Пентхаус",
  house: "Дом",
  part_of_house: "Часть дома",
  townhouse: "Таунхаус",
  duplex: "Дуплекс",
  cottage: "Коттедж",
  dacha: "Дача",
  izhs: "ИЖС",
  gardening: "Садоводство",
  commercial_land: "Коммерческий участок",
  lph: "ЛПХ",
  dnp: "ДНП",
  office: "Офис",
  business: "Готовый бизнес",
  separate_building: "Отдельное здание",
  production: "Производство",
  warehouse: "Склад",
  retail: "Торговое помещение",
  sto: "СТО",
  hotel: "Гостиница",
  car_wash: "Автомойка",
  cafe: "Кафе",
  shop: "Магазин",
  garage_box: "Гараж-бокс",
  residential_complex: "Паркинг ЖК",
  covered_parking: "Крытый паркинг",
  separate_garage: "Отдельный гараж",
  parking: "Машино-место",
};

function normalizeMapImageUrl(value?: string | null): string {
  const path = (value || "").trim();
  if (!path) return "";
  if (/^(https?:\/\/|data:|blob:)/i.test(path)) return path;
  return `${API_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

function getMapAddress(item: MapMarker): string {
  return [item.address, item.district, item.city]
    .map((part) => (part || "").trim())
    .filter(Boolean)
    .join(", ");
}

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
              address: String(item.public_address ?? item.address ?? ""),
              district: String(item.district ?? ""),
              city: String(item.city ?? "Краснодар"),
              image_url: item.image_url ? String(item.image_url) : "",
              area: Number(item.area ?? 0),
              rooms: Number(item.rooms ?? 0),
              status: String(item.status ?? ""),
              property_type: String(item.property_type ?? ""),
              property_type_label: String(item.property_type_label ?? ""),
              property_subtype: String(item.property_subtype ?? ""),
              property_subtype_label: String(item.property_subtype_label ?? ""),
              deal_type: String(item.deal_type ?? ""),
              deal_type_label: String(item.deal_type_label ?? ""),
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
          YMapFeatureDataSource,
          YMapLayer,
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

        // Separate marker layer is required by YMapClusterer.
        map.addChild(new YMapFeatureDataSource({ id: DOMA_MAP_MARKER_SOURCE }));
        map.addChild(new YMapLayer({
          source: DOMA_MAP_MARKER_SOURCE,
          type: "markers",
          zIndex: 1800,
        }));

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
    markersRef.current.forEach((entity) => {
      try { map.removeChild(entity); } catch { /* already removed */ }
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

      if (!valid.length) return;

      // Keep the source record available when the clusterer asks us to render a point.
      const itemById = new Map<number, MapMarker>();
      valid.forEach(({ item }) => itemById.set(item.id, item));

      // Repeatedly clicking a dense cluster keeps increasing zoom until points split.
      let clusterClickCount = 0;
      const initialZoom = valid.length === 1 ? 14 : 11;

      // Only one listing preview may be open at a time.
      let activePopup: HTMLDivElement | null = null;

      const renderPropertyMarker = (feature: any) => {
        const itemId = Number(feature?.properties?.propertyId ?? feature?.id);
        const item = itemById.get(itemId);
        const coordinates = feature?.geometry?.coordinates as [number, number];
        const content = document.createElement("div");
        content.className = "doma-map-marker";

        if (!item) {
          content.classList.add("doma-map-marker--empty");
          return new ymaps.YMapMarker({ coordinates, source: DOMA_MAP_MARKER_SOURCE }, content);
        }

        // Capture the narrowed object in a stable, non-optional constant.
        // TypeScript loses narrowing of `item` inside nested callbacks otherwise.
        const propertyItem: MapMarker = item;

        content.setAttribute("title", [item.title, getMapAddress(item)].filter(Boolean).join(" · "));

        // Map pin is a simple red dot. Price is shown only inside the listing preview.
        const dotButton = document.createElement("button");
        dotButton.type = "button";
        dotButton.className = "doma-map-marker__dot";
        dotButton.setAttribute("aria-label", `Показать объявление: ${item.title || "Объект недвижимости"}`);
        dotButton.setAttribute("aria-expanded", "false");
        dotButton.title = item.title || "Объект недвижимости";

        const popup = document.createElement("div");
        popup.className = "doma-map-marker__popup";
        popup.hidden = true;
        popup.setAttribute("role", "dialog");
        popup.setAttribute("aria-label", `Объявление: ${item.title || "Объект недвижимости"}`);
        popup.addEventListener("click", (event) => event.stopPropagation());

        const closeButton = document.createElement("button");
        closeButton.type = "button";
        closeButton.className = "doma-map-marker__close";
        closeButton.textContent = "×";
        closeButton.setAttribute("aria-label", "Закрыть объявление");
        closeButton.addEventListener("click", (event) => {
          event.preventDefault();
          event.stopPropagation();
          popup.hidden = true;
          dotButton.setAttribute("aria-expanded", "false");
          if (activePopup === popup) activePopup = null;
        });

        const propertyHref = `/property/${item.id}`;
        const cardLink = document.createElement("div");
        cardLink.className = "doma-map-marker__link";
        cardLink.setAttribute("role", "group");
        cardLink.setAttribute("aria-label", `Объявление: ${item.title || "Объект недвижимости"}`);

        // Галерея в карточке на карте: главное фото сразу, остальные загружаются
        // лениво из того же endpoint, который используется в CRM.
        const photoBox = document.createElement("div");
        photoBox.className = "doma-map-marker__photo";
        photoBox.setAttribute("role", "group");
        photoBox.setAttribute("aria-label", "Фотографии объекта. Проведите мышью влево или вправо для перелистывания.");

        const photoUrls: string[] = [];
        const mainImageUrl = normalizeMapImageUrl(item.image_url);
        if (mainImageUrl) photoUrls.push(mainImageUrl);
        let photoIndex = 0;
        let galleryLoaded = false;
        let galleryLoading = false;

        const image = document.createElement("img");
        image.alt = item.title || "Фотография объекта";
        image.draggable = false;
        image.decoding = "async";
        image.hidden = true;
        image.onerror = () => {
          image.hidden = true;
          photoPlaceholder.hidden = false;
          photoBox.classList.add("doma-map-marker__photo--empty");
        };
        image.onload = () => {
          image.hidden = false;
          photoPlaceholder.hidden = true;
          photoBox.classList.remove("doma-map-marker__photo--empty");
        };

        const photoPlaceholder = document.createElement("span");
        photoPlaceholder.className = "doma-map-marker__photo-placeholder";
        photoPlaceholder.textContent = "Фото объекта";
        photoPlaceholder.hidden = true;

        const photoCounter = document.createElement("span");
        photoCounter.className = "doma-map-marker__photo-counter";
        photoCounter.setAttribute("aria-live", "polite");
        photoCounter.hidden = true;

        const photoDots = document.createElement("div");
        photoDots.className = "doma-map-marker__photo-dots";
        photoDots.hidden = true;
        photoDots.addEventListener("click", (event) => event.stopPropagation());

        const previousPhotoButton = document.createElement("button");
        previousPhotoButton.type = "button";
        previousPhotoButton.className = "doma-map-marker__photo-arrow doma-map-marker__photo-arrow--prev";
        previousPhotoButton.textContent = "‹";
        previousPhotoButton.setAttribute("aria-label", "Предыдущее фото");
        previousPhotoButton.hidden = true;

        const nextPhotoButton = document.createElement("button");
        nextPhotoButton.type = "button";
        nextPhotoButton.className = "doma-map-marker__photo-arrow doma-map-marker__photo-arrow--next";
        nextPhotoButton.textContent = "›";
        nextPhotoButton.setAttribute("aria-label", "Следующее фото");
        nextPhotoButton.hidden = true;

        function renderMapPhoto(nextIndex = photoIndex) {
          if (photoUrls.length === 0) {
            photoIndex = 0;
            image.removeAttribute("src");
            image.hidden = true;
            photoPlaceholder.hidden = false;
            photoBox.classList.add("doma-map-marker__photo--empty");
            photoCounter.hidden = true;
            previousPhotoButton.hidden = true;
            nextPhotoButton.hidden = true;
            photoDots.hidden = true;
            photoDots.replaceChildren();
            return;
          }

          photoIndex = (nextIndex + photoUrls.length) % photoUrls.length;
          photoPlaceholder.hidden = true;
          image.hidden = false;
          image.alt = `${propertyItem.title || "Фотография объекта"} — фото ${photoIndex + 1}`;
          if (image.src !== photoUrls[photoIndex]) image.src = photoUrls[photoIndex];
          photoCounter.textContent = `${photoIndex + 1} / ${photoUrls.length}`;
          const hasMultiplePhotos = photoUrls.length > 1;
          photoCounter.hidden = !hasMultiplePhotos;
          previousPhotoButton.hidden = !hasMultiplePhotos;
          nextPhotoButton.hidden = !hasMultiplePhotos;
          photoDots.hidden = !hasMultiplePhotos;
          photoDots.replaceChildren();

          if (hasMultiplePhotos) {
            photoUrls.forEach((_, dotIndex) => {
              const dot = document.createElement("button");
              dot.type = "button";
              dot.className = dotIndex === photoIndex
                ? "doma-map-marker__photo-dot is-active"
                : "doma-map-marker__photo-dot";
              dot.setAttribute("aria-label", `Показать фото ${dotIndex + 1}`);
              dot.setAttribute("aria-current", dotIndex === photoIndex ? "true" : "false");
              dot.addEventListener("click", (event) => {
                event.preventDefault();
                event.stopPropagation();
                renderMapPhoto(dotIndex);
              });
              photoDots.appendChild(dot);
            });
          }
        }

        function stepMapPhoto(direction: number) {
          if (photoUrls.length > 1) renderMapPhoto(photoIndex + direction);
        }

        previousPhotoButton.addEventListener("click", (event) => {
          event.preventDefault();
          event.stopPropagation();
          stepMapPhoto(-1);
        });
        nextPhotoButton.addEventListener("click", (event) => {
          event.preventDefault();
          event.stopPropagation();
          stepMapPhoto(1);
        });

        async function loadMapPhotoGallery() {
          if (galleryLoaded || galleryLoading) return;
          galleryLoading = true;
          try {
            const response = await fetch(`${API_URL}/properties/${propertyItem.id}/images`, { cache: "no-store" });
            if (response.ok) {
              const payload: any = await response.json();
              const galleryRows: any[] = Array.isArray(payload)
                ? payload
                : Array.isArray(payload?.images)
                ? payload.images
                : Array.isArray(payload?.items)
                ? payload.items
                : [];

              for (const entry of galleryRows) {
                const rawUrl = typeof entry === "string"
                  ? entry
                  : entry?.image_url ?? entry?.url ?? entry?.src ?? "";
                const normalizedUrl = normalizeMapImageUrl(String(rawUrl || ""));
                if (normalizedUrl && !photoUrls.includes(normalizedUrl)) photoUrls.push(normalizedUrl);
              }
            }
          } catch (error) {
            console.warn(`Не удалось загрузить фотографии объекта №${propertyItem.id}:`, error);
          } finally {
            galleryLoading = false;
            galleryLoaded = true;
            renderMapPhoto(photoIndex);
          }
        }

        // Горизонтальное перетаскивание работает мышью и на сенсорных экранах.
        // Обычный клик по фото открывает объект, а жест листания не активирует ссылку.
        let pointerStart: { id: number; x: number; y: number } | null = null;
        let didSwipe = false;
        let suppressPhotoClick = false;

        photoBox.addEventListener("pointerdown", (event: PointerEvent) => {
          if ((event.target as HTMLElement).closest("button")) return;
          if (event.pointerType === "mouse" && event.button !== 0) return;
          pointerStart = { id: event.pointerId, x: event.clientX, y: event.clientY };
          didSwipe = false;
          photoBox.classList.add("is-pointer-down");
          event.stopPropagation();
          try { photoBox.setPointerCapture(event.pointerId); } catch { /* pointer capture may be unavailable */ }
        });

        photoBox.addEventListener("pointermove", (event: PointerEvent) => {
          if (!pointerStart || pointerStart.id !== event.pointerId) return;
          // Пока указатель захвачен фотографией, не даём карте двигаться под карточкой.
          event.stopPropagation();
          const deltaX = event.clientX - pointerStart.x;
          const deltaY = event.clientY - pointerStart.y;
          if (Math.abs(deltaX) > 8 && Math.abs(deltaX) > Math.abs(deltaY)) {
            didSwipe = true;
            event.preventDefault();
          }
        });

        const finishPhotoPointer = (event: PointerEvent) => {
          if (!pointerStart || pointerStart.id !== event.pointerId) return;
          const deltaX = event.clientX - pointerStart.x;
          const deltaY = event.clientY - pointerStart.y;
          const wasSwipe = didSwipe && Math.abs(deltaX) >= 38 && Math.abs(deltaX) > Math.abs(deltaY);
          if (wasSwipe) stepMapPhoto(deltaX < 0 ? 1 : -1);
          suppressPhotoClick = didSwipe;
          pointerStart = null;
          didSwipe = false;
          photoBox.classList.remove("is-pointer-down");
          if (suppressPhotoClick) {
            window.setTimeout(() => { suppressPhotoClick = false; }, 0);
          }
          event.stopPropagation();
        };

        photoBox.addEventListener("pointerup", finishPhotoPointer);
        photoBox.addEventListener("pointercancel", (event: PointerEvent) => {
          pointerStart = null;
          didSwipe = false;
          photoBox.classList.remove("is-pointer-down");
          event.stopPropagation();
        });
        photoBox.addEventListener("click", (event: MouseEvent) => {
          event.preventDefault();
          event.stopPropagation();
          if (suppressPhotoClick || (event.target as HTMLElement).closest("button")) {
            suppressPhotoClick = false;
            return;
          }
          window.location.assign(propertyHref);
        });

        photoBox.append(image, photoPlaceholder, photoCounter, previousPhotoButton, nextPhotoButton, photoDots);
        renderMapPhoto();
        const details = document.createElement("div");
        details.className = "doma-map-marker__details";

        const dealType = item.deal_type_label || MAP_DEAL_TYPE_LABELS[item.deal_type || ""] || "Недвижимость";
        const propertyType = item.property_type_label || MAP_PROPERTY_TYPE_LABELS[item.property_type || ""] || "Объект";
        const subtype = item.property_subtype_label || MAP_SUBTYPE_LABELS[item.property_subtype || ""] || "";

        const typeLine = document.createElement("div");
        typeLine.className = "doma-map-marker__type";
        typeLine.textContent = `${dealType} · ${propertyType}`;

        const title = document.createElement("div");
        title.className = "doma-map-marker__title";
        title.textContent = item.title || "Объект недвижимости";

        const address = document.createElement("div");
        address.className = "doma-map-marker__address";
        address.textContent = getMapAddress(item) || "Краснодар";

        const price = document.createElement("div");
        price.className = "doma-map-marker__full-price";
        price.textContent = `${Number(item.price || 0).toLocaleString("ru-RU")} ₽${item.deal_type === "rent" || item.deal_type === "lease" ? "/мес." : ""}`;

        const facts = document.createElement("div");
        facts.className = "doma-map-marker__facts";
        if (subtype) {
          const subtypeTag = document.createElement("span");
          subtypeTag.className = "doma-map-marker__tag";
          subtypeTag.textContent = subtype;
          facts.appendChild(subtypeTag);
        }
        if (Number(item.area) > 0) {
          const areaTag = document.createElement("span");
          areaTag.className = "doma-map-marker__fact";
          areaTag.textContent = `${Number(item.area).toLocaleString("ru-RU")} м²`;
          facts.appendChild(areaTag);
        }
        if (Number(item.rooms) > 0 && item.property_type !== "land" && item.property_type !== "commercial" && item.property_type !== "garage") {
          const roomsTag = document.createElement("span");
          roomsTag.className = "doma-map-marker__fact";
          roomsTag.textContent = `${Number(item.rooms)} комн.`;
          facts.appendChild(roomsTag);
        }
        if (item.status) {
          const statusTag = document.createElement("span");
          statusTag.className = `doma-map-marker__tag${item.status === "Свободен" ? " doma-map-marker__tag--free" : ""}`;
          statusTag.textContent = item.status;
          facts.appendChild(statusTag);
        }

        const action = document.createElement("div");
        action.className = "doma-map-marker__action";
        action.textContent = "Подробнее об объекте →";

        details.append(typeLine, title, address, price);
        if (facts.childElementCount) details.appendChild(facts);
        details.appendChild(action);
        const detailsLink = document.createElement("a");
        detailsLink.className = "doma-map-marker__details-link";
        detailsLink.href = propertyHref;
        detailsLink.setAttribute("aria-label", `Открыть объявление ${item.title || "Объект недвижимости"}`);
        detailsLink.appendChild(details);
        cardLink.append(photoBox, detailsLink);
        popup.append(closeButton, cardLink);

        dotButton.addEventListener("click", (event) => {
          event.preventDefault();
          event.stopPropagation();
          const shouldOpen = popup.hidden;
          if (activePopup && activePopup !== popup) {
            activePopup.hidden = true;
            activePopup.parentElement?.querySelector<HTMLButtonElement>(".doma-map-marker__dot")?.setAttribute("aria-expanded", "false");
          }
          popup.hidden = !shouldOpen;
          dotButton.setAttribute("aria-expanded", shouldOpen ? "true" : "false");
          activePopup = shouldOpen ? popup : null;
          if (shouldOpen) void loadMapPhotoGallery();
        });

        content.append(dotButton, popup);
        return new ymaps.YMapMarker({ coordinates, source: DOMA_MAP_MARKER_SOURCE }, content);
      };

      // Features are clustered by screen-space distance, so nearby pins do not stack.
      const features = valid.map(({ item, coordinates }) => ({
        type: "Feature" as const,
        id: item.id,
        geometry: { type: "Point" as const, coordinates },
        properties: { propertyId: item.id },
      }));

      try {
        const { YMapClusterer, clusterByGrid } = await ymaps.import("@yandex/ymaps3-clusterer");
        if (cancelled) return;

        const renderCluster = (coordinates: [number, number], clusterFeatures: any[]) => {
          const button = document.createElement("button");
          button.type = "button";
          button.className = "doma-map-cluster";
          button.textContent = String(clusterFeatures.length);
          button.setAttribute("aria-label", `${clusterFeatures.length} объявлений рядом. Приблизить карту`);
          button.title = `${clusterFeatures.length} объявлений — нажмите, чтобы приблизить`;
          button.addEventListener("click", (event) => {
            event.preventDefault();
            event.stopPropagation();
            clusterClickCount += 1;
            const nextZoom = Math.min(initialZoom + clusterClickCount * 2, 20);
            map.update({ location: { center: coordinates, zoom: nextZoom, duration: 300 } });
          });
          return new ymaps.YMapMarker({ coordinates, source: DOMA_MAP_MARKER_SOURCE }, button);
        };

        const clusterer = new YMapClusterer({
          method: clusterByGrid({ gridSize: 64 }),
          features,
          marker: renderPropertyMarker,
          cluster: renderCluster,
        });
        map.addChild(clusterer);
        markersRef.current.push(clusterer);
      } catch (error) {
        // If the optional cluster module is unavailable, still show red dots instead of prices.
        console.error("Не удалось включить группировку меток карты:", error);
        if (cancelled) return;
        valid.forEach(({ item, coordinates }) => {
          const marker = renderPropertyMarker({
            id: item.id,
            geometry: { coordinates },
            properties: { propertyId: item.id },
          });
          map.addChild(marker);
          markersRef.current.push(marker);
        });
      }
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
          position: relative;
          width: 18px;
          height: 18px;
          transform: translate(-50%, -50%);
          cursor: default;
          font-family: Arial, Helvetica, sans-serif;
        }

        .doma-map-marker__dot {
          display: block;
          width: 16px;
          height: 16px;
          padding: 0;
          border: 2px solid #ffffff;
          border-radius: 50%;
          background: #ef3340;
          box-shadow: 0 2px 7px rgba(15, 23, 42, .38);
          cursor: pointer;
          transition: transform .15s ease, background .15s ease;
        }

        .doma-map-marker__dot:hover,
        .doma-map-marker__dot[aria-expanded="true"] {
          background: #c91f2d;
          transform: scale(1.18);
        }

        .doma-map-cluster {
          display: grid;
          place-items: center;
          width: 34px;
          height: 34px;
          padding: 0;
          border: 3px solid #ffffff;
          border-radius: 50%;
          background: #ef3340;
          color: #ffffff;
          box-shadow: 0 3px 10px rgba(15, 23, 42, .30);
          font: 700 12px/1 Arial, Helvetica, sans-serif;
          cursor: pointer;
          transform: translate(-50%, -50%);
          transition: transform .15s ease, background .15s ease;
        }

        .doma-map-cluster:hover {
          background: #c91f2d;
          transform: translate(-50%, -50%) scale(1.08);
        }

        .doma-map-marker__popup[hidden] { display: none !important; }

        .doma-map-marker__popup {
          position: absolute;
          z-index: 1000;
          left: 50%;
          bottom: calc(100% + 10px);
          width: 286px;
          max-width: min(286px, calc(100vw - 32px));
          overflow: visible;
          transform: translateX(-50%);
          border: 1px solid #e5eaf0;
          border-radius: 15px;
          background: #ffffff;
          box-shadow: 0 12px 32px rgba(15, 23, 42, .22);
          color: #13202e;
          white-space: normal;
        }

        .doma-map-marker__popup::after {
          content: "";
          position: absolute;
          left: 50%;
          bottom: -7px;
          width: 13px;
          height: 13px;
          background: #fff;
          border-right: 1px solid #e5eaf0;
          border-bottom: 1px solid #e5eaf0;
          transform: translateX(-50%) rotate(45deg);
        }

        .doma-map-marker__close {
          position: absolute;
          z-index: 2;
          top: 7px;
          right: 7px;
          display: grid;
          place-items: center;
          width: 27px;
          height: 27px;
          padding: 0;
          border: 1px solid rgba(225, 231, 239, .9);
          border-radius: 50%;
          background: rgba(255, 255, 255, .96);
          color: #334155;
          font-size: 19px;
          line-height: 1;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(15, 23, 42, .10);
        }

        .doma-map-marker__link {
          position: relative;
          z-index: 1;
          display: block;
          overflow: hidden;
          border-radius: 14px;
          color: inherit;
          text-decoration: none;
        }

        .doma-map-marker__details-link {
          display: block;
          color: inherit;
          text-decoration: none;
          outline-offset: -3px;
        }

        .doma-map-marker__details-link:hover .doma-map-marker__action { color: #d92f3b; }

        .doma-map-marker__photo {
          position: relative;
          display: block;
          width: 100%;
          height: 132px;
          overflow: hidden;
          background: #edf1f5;
          color: #7b8795;
          font-size: 12px;
          cursor: grab;
          touch-action: pan-y;
          user-select: none;
          -webkit-user-select: none;
        }

        .doma-map-marker__photo.is-pointer-down { cursor: grabbing; }

        .doma-map-marker__photo img {
          position: relative;
          z-index: 1;
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
          pointer-events: none;
          -webkit-user-drag: none;
        }

        .doma-map-marker__photo img[hidden],
        .doma-map-marker__photo-placeholder[hidden],
        .doma-map-marker__photo-counter[hidden],
        .doma-map-marker__photo-arrow[hidden],
        .doma-map-marker__photo-dots[hidden] { display: none !important; }

        .doma-map-marker__photo-placeholder {
          position: absolute;
          inset: 0;
          z-index: 0;
          display: grid;
          place-items: center;
          background: linear-gradient(135deg, #edf1f5, #dce3eb);
          color: #7b8795;
        }

        .doma-map-marker__photo--empty { background: linear-gradient(135deg, #edf1f5, #dce3eb); }

        .doma-map-marker__photo-counter {
          position: absolute;
          z-index: 4;
          top: 8px;
          left: 8px;
          padding: 4px 7px;
          border-radius: 7px;
          background: rgba(18, 27, 40, .74);
          color: #fff;
          font-size: 10px;
          font-weight: 700;
          line-height: 1.2;
          pointer-events: none;
        }

        .doma-map-marker__photo-arrow {
          position: absolute;
          z-index: 4;
          top: 50%;
          display: grid;
          place-items: center;
          width: 28px;
          height: 28px;
          padding: 0 0 2px;
          transform: translateY(-50%);
          border: 1px solid rgba(255, 255, 255, .9);
          border-radius: 50%;
          background: rgba(255, 255, 255, .93);
          color: #344052;
          font: 22px/1 Arial, Helvetica, sans-serif;
          cursor: pointer;
          box-shadow: 0 2px 7px rgba(15, 23, 42, .18);
          opacity: .94;
        }

        .doma-map-marker__photo-arrow:hover { background: #fff; color: #e33442; }
        .doma-map-marker__photo-arrow--prev { left: 7px; }
        .doma-map-marker__photo-arrow--next { right: 7px; }

        .doma-map-marker__photo-dots {
          position: absolute;
          z-index: 4;
          left: 50%;
          bottom: 7px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          max-width: calc(100% - 64px);
          transform: translateX(-50%);
          padding: 4px 7px;
          border-radius: 999px;
          background: rgba(20, 29, 42, .45);
        }

        .doma-map-marker__photo-dot {
          width: 5px;
          height: 5px;
          flex: 0 0 5px;
          padding: 0;
          border: 0;
          border-radius: 50%;
          background: rgba(255, 255, 255, .56);
          cursor: pointer;
        }

        .doma-map-marker__photo-dot.is-active { background: #fff; transform: scale(1.25); }

        .doma-map-marker__details { padding: 11px 13px 12px; }
        .doma-map-marker__type { margin-bottom: 4px; color: #ef4444; font-size: 10px; font-weight: 700; line-height: 1.3; }
        .doma-map-marker__title { overflow: hidden; color: #172333; font-size: 14px; font-weight: 750; line-height: 1.3; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
        .doma-map-marker__address { overflow: hidden; margin-top: 4px; color: #738094; font-size: 10px; line-height: 1.35; text-overflow: ellipsis; white-space: nowrap; }
        .doma-map-marker__full-price { margin-top: 9px; color: #142033; font-size: 19px; font-weight: 800; line-height: 1.2; }
        .doma-map-marker__facts { display: flex; flex-wrap: wrap; align-items: center; gap: 5px; margin-top: 8px; }
        .doma-map-marker__tag,
        .doma-map-marker__fact { display: inline-flex; align-items: center; min-height: 20px; padding: 3px 7px; border-radius: 6px; background: #f0f3f6; color: #667386; font-size: 10px; line-height: 1; }
        .doma-map-marker__tag--free { background: #dcfce7; color: #15803d; }
        .doma-map-marker__action { margin-top: 10px; padding-top: 9px; border-top: 1px solid #edf0f4; color: #344256; font-size: 11px; font-weight: 700; transition: color .15s ease; }
      `}</style>
    </div>
  );
}