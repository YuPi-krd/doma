"use client";

import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    ymaps3?: any;
  }
}

const API_URL = "https://doma-nq4u.onrender.com";
const DEFAULT_CENTER: [number, number] = [38.9769, 45.0355];
let mapsPromise: Promise<any> | null = null;

function loadYandexMaps(): Promise<any> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Карта доступна только в браузере."));
  }
  if (window.ymaps3) return Promise.resolve(window.ymaps3);
  if (mapsPromise) return mapsPromise;

  const apiKey = process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY;
  if (!apiKey) {
    return Promise.reject(new Error("Не задан NEXT_PUBLIC_YANDEX_MAPS_API_KEY."));
  }

  mapsPromise = new Promise((resolve, reject) => {
    let script = document.querySelector<HTMLScriptElement>('script[data-yandex-maps="true"]');

    // If a previous load failed, clear its stale script and allow a fresh attempt.
    if (script && !window.ymaps3 && script.dataset.yandexMapsFailed === "true") {
      script.remove();
      script = null;
    }

    const handleLoad = async () => {
      try {
        if (!window.ymaps3) throw new Error("Яндекс.Карты загрузились без объекта ymaps3.");
        await window.ymaps3.ready;
        if (script) script.dataset.yandexMapsLoaded = "true";
        resolve(window.ymaps3);
      } catch (error) {
        mapsPromise = null;
        reject(error);
      }
    };

    const handleError = () => {
      if (script) script.dataset.yandexMapsFailed = "true";
      mapsPromise = null;
      reject(new Error("Не удалось загрузить API Яндекс.Карт. Проверьте NEXT_PUBLIC_YANDEX_MAPS_API_KEY и ограничения HTTP Referer."));
    };

    if (script && window.ymaps3) {
      handleLoad();
      return;
    }

    if (script && script.dataset.yandexMapsLoaded === "true" && !window.ymaps3) {
      script.remove();
      script = null;
    }

    const shouldAppend = !script;
    if (!script) {
      script = document.createElement("script");
      script.src = `https://api-maps.yandex.ru/v3/?apikey=${encodeURIComponent(apiKey)}&lang=ru_RU`;
      script.async = true;
      script.dataset.yandexMaps = "true";
    }

    script.addEventListener("load", handleLoad, { once: true });
    script.addEventListener("error", handleError, { once: true });
    if (shouldAppend) document.head.appendChild(script);
  });

  return mapsPromise;
}

interface AddressMapPickerProps {
  title: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  onSelect: (latitude: number, longitude: number) => void;
  onAddressChange: (address: string) => void;
}

export default function AddressMapPicker({
  title,
  address,
  latitude,
  longitude,
  onSelect,
  onAddressChange,
}: AddressMapPickerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const ymapsRef = useRef<any>(null);
  const callbacksRef = useRef({ onSelect, onAddressChange });
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("Можно передвинуть флажок на точное место.");

  useEffect(() => {
    callbacksRef.current = { onSelect, onAddressChange };
  }, [onSelect, onAddressChange]);

  useEffect(() => {
    let cancelled = false;

    const setMarker = (coords: [number, number], zoom = 16) => {
      const map = mapRef.current;
      const ymaps = ymapsRef.current;
      if (!map || !ymaps) return;

      if (markerRef.current) {
        try { map.removeChild(markerRef.current); } catch { /* already removed */ }
      }

      const pin = document.createElement("div");
      pin.style.width = "22px";
      pin.style.height = "22px";
      pin.style.borderRadius = "50% 50% 50% 0";
      pin.style.background = "#f43f4f";
      pin.style.border = "3px solid #fff";
      pin.style.boxShadow = "0 3px 12px rgba(15,23,42,.3)";
      pin.style.transform = "rotate(-45deg)";
      pin.style.cursor = "grab";

      markerRef.current = new ymaps.YMapMarker({ coordinates: coords }, pin);
      map.addChild(markerRef.current);
      map.setLocation({ center: coords, zoom, duration: 250 });
    };

    async function init() {
      try {
        setStatus("loading");
        const ymaps = await loadYandexMaps();
        if (cancelled || !containerRef.current) return;

        const map = new ymaps.YMap(containerRef.current, {
          location: {
            center: latitude != null && longitude != null
              ? [longitude, latitude]
              : DEFAULT_CENTER,
            zoom: latitude != null && longitude != null ? 16 : 11,
          },
          mode: "vector",
        });
        map.addChild(new ymaps.YMapDefaultSchemeLayer({}));
        map.addChild(new ymaps.YMapDefaultFeaturesLayer({}));
        const listener = new ymaps.YMapListener({
          onClick: (_object: any, event: any) => {
            const coords = event?.coordinates as [number, number] | undefined;
            if (!coords || coords.length < 2) return;
            setMarker(coords);
            callbacksRef.current.onSelect(coords[1], coords[0]);
            setMessage("Точка выбрана. Флажок можно передвинуть повторным нажатием на карту.");
            void fetch(`${API_URL}/reverse-geocode?latitude=${coords[1]}&longitude=${coords[0]}`)
              .then((response) => response.ok ? response.json() : null)
              .then((data) => {
                if (data?.found && data?.formatted) callbacksRef.current.onAddressChange(data.formatted);
              })
              .catch(() => {});
          },
        });
        map.addChild(listener);
        mapRef.current = map;
        ymapsRef.current = ymaps;

        if (latitude != null && longitude != null) {
          setMarker([longitude, latitude]);
        }
        setStatus("ready");
      } catch (cause) {
        if (cancelled) return;
        setStatus("error");
        setError(cause instanceof Error ? cause.message : "Не удалось загрузить карту.");
      }
    }

    void init();
    return () => {
      cancelled = true;
      if (mapRef.current) {
        try { mapRef.current.destroy(); } catch { /* ignore */ }
      }
      mapRef.current = null;
      markerRef.current = null;
      ymapsRef.current = null;
    };
  // initialize one map per picker; marker updates are handled below
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (status !== "ready" || latitude == null || longitude == null) return;
    const map = mapRef.current;
    const ymaps = ymapsRef.current;
    if (!map || !ymaps) return;

    if (markerRef.current) {
      try { map.removeChild(markerRef.current); } catch { /* ignore */ }
    }
    const pin = document.createElement("div");
    pin.style.width = "22px";
    pin.style.height = "22px";
    pin.style.borderRadius = "50% 50% 50% 0";
    pin.style.background = "#f43f4f";
    pin.style.border = "3px solid #fff";
    pin.style.boxShadow = "0 3px 12px rgba(15,23,42,.3)";
    pin.style.transform = "rotate(-45deg)";
    pin.style.cursor = "grab";
    markerRef.current = new ymaps.YMapMarker({ coordinates: [longitude, latitude] }, pin);
    map.addChild(markerRef.current);
    map.setLocation({ center: [longitude, latitude], zoom: 16, duration: 250 });
  }, [latitude, longitude, status]);

  // Geocode the entered address after the user pauses typing; this does not overwrite their text.
  useEffect(() => {
    if (!address.trim()) return;
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(`${API_URL}/geocode?address=${encodeURIComponent(address.trim())}`);
        if (!response.ok) return;
        const data = await response.json();
        if (cancelled || !data?.found || !Number.isFinite(data.latitude) || !Number.isFinite(data.longitude)) return;
        callbacksRef.current.onSelect(Number(data.latitude), Number(data.longitude));
        setMessage("Адрес найден. При необходимости уточните точку на карте.");
      } catch {
        // The user can still choose the location manually on the map.
      }
    }, 650);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [address]);

  return (
    <section style={{ marginTop: 10, border: "1px solid #e2e8f0", borderRadius: 16, padding: 10, background: "#f8fafc" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 8 }}>
        <strong style={{ fontSize: 11, color: "#334155" }}>{title}</strong>
        <span style={{ fontSize: 10, color: "#64748b" }}>
          {latitude != null && longitude != null ? "Точка выбрана" : "Выберите точку"}
        </span>
      </div>
      <div ref={containerRef} style={{ width: "100%", height: 220, borderRadius: 12, overflow: "hidden", background: "#e9edf2" }} />
      {status === "loading" && <div style={{ padding: "8px 2px", fontSize: 11, color: "#64748b" }}>Загружаем карту…</div>}
      {status === "error" && (
        <div style={{ padding: "10px 2px", color: "#dc2626", fontSize: 11, lineHeight: 1.5 }}>
          {error}
        </div>
      )}
      <div style={{ marginTop: 7, fontSize: 10, color: "#64748b" }}>{message}</div>
    </section>
  );
}
