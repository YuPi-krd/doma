"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

interface MapMarker {
  id: number;
  title: string;
  price: number;
  coordinates: [
    number,
    number
  ];
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

export default function YandexMap({
  markers = [],
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

        /*
         * Создаём маркеры.
         *
         * Сейчас markers будет пустым,
         * потому что coordinates ещё
         * не добавлены в properties.
         */
        if (
          Array.isArray(markers) &&
          markers.length > 0
        ) {
          markersRef.current.forEach(
            (marker) => {
              try {
                map.removeChild(
                  marker
                );
              } catch {
                // ignore
              }
            }
          );

          markersRef.current = [];

          const {
            YMapMarker,
          } = ymaps;

          markers.forEach(
            (item) => {
              const content =
                document.createElement(
                  "div"
                );

              content.className =
                "doma-map-marker";

              content.innerHTML = `
                <div class="doma-map-marker__price">
                  ${Number(
                    item.price || 0
                  ).toLocaleString(
                    "ru-RU"
                  )} ₽
                </div>
              `;

              const marker =
                new YMapMarker(
                  {
                    coordinates:
                      item.coordinates,
                  },
                  content
                );

              map.addChild(
                marker
              );

              markersRef.current.push(
                marker
              );
            }
          );
        }

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

type AddressCoordinates = [number, number];

interface YandexAddressPreviewProps {
  address: string;
}

/**
 * Компактная карта фактического адреса для CRM.
 * Координаты получаем через существующий FastAPI endpoint GET /geocode?address=...
 */
export function YandexAddressPreview({
  address,
}: YandexAddressPreviewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const [coordinates, setCoordinates] = useState<AddressCoordinates | null>(null);
  const [geocodeStatus, setGeocodeStatus] = useState<
    "idle" | "searching" | "found" | "not-found" | "error"
  >("idle");
  const [mapStatus, setMapStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    const cleanAddress = address.trim();
    let cancelled = false;

    if (cleanAddress.length < 5) {
      setCoordinates(null);
      setGeocodeStatus("idle");
      return;
    }

    setGeocodeStatus("searching");
    setCoordinates(null);

    const timer = window.setTimeout(async () => {
      try {
        const apiBase =
          process.env.NEXT_PUBLIC_API_URL ||
          (["localhost", "127.0.0.1"].includes(window.location.hostname)
            ? "http://127.0.0.1:8000"
            : "https://doma-nq4u.onrender.com");

        const response = await fetch(
          `${apiBase}/geocode?address=${encodeURIComponent(cleanAddress)}`,
        );

        if (!response.ok) {
          throw new Error("Не удалось определить координаты адреса.");
        }

        const result = await response.json();

        if (cancelled) return;

        if (
          result?.found &&
          Number.isFinite(Number(result.longitude)) &&
          Number.isFinite(Number(result.latitude))
        ) {
          setCoordinates([Number(result.longitude), Number(result.latitude)]);
          setGeocodeStatus("found");
        } else {
          setCoordinates(null);
          setGeocodeStatus("not-found");
        }
      } catch (error) {
        if (cancelled) return;
        console.error("Yandex address geocoding error:", error);
        setCoordinates(null);
        setGeocodeStatus("error");
      }
    }, 650);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [address]);

  useEffect(() => {
    let cancelled = false;
    let map: any = null;

    if (!coordinates || !containerRef.current) {
      setMapStatus("loading");
      return;
    }

    async function initPreviewMap() {
      try {
        setMapStatus("loading");
        const ymaps = await loadYandexMaps();

        if (cancelled || !containerRef.current) return;

        const {
          YMap,
          YMapDefaultSchemeLayer,
          YMapDefaultFeaturesLayer,
          YMapMarker,
        } = ymaps;

        map = new YMap(containerRef.current, {
          location: {
            center: coordinates,
            zoom: 16,
          },
          mode: "vector",
        });

        map.addChild(new YMapDefaultSchemeLayer({}));
        map.addChild(new YMapDefaultFeaturesLayer({}));

        const markerContent = document.createElement("div");
        markerContent.className = "doma-address-marker";
        markerContent.setAttribute("aria-label", "Местоположение объекта");

        map.addChild(new YMapMarker({ coordinates }, markerContent));
        mapRef.current = map;

        if (!cancelled) setMapStatus("ready");
      } catch (error) {
        console.error("Yandex address preview map error:", error);
        if (!cancelled) setMapStatus("error");
      }
    }

    void initPreviewMap();

    return () => {
      cancelled = true;
      if (map) {
        try {
          map.destroy();
        } catch {
          // Карта могла быть уничтожена API при размонтировании.
        }
      }
      if (mapRef.current === map) mapRef.current = null;
    };
  }, [coordinates]);

  if (!address.trim()) return null;

  return (
    <div className="doma-address-preview">
      {geocodeStatus === "searching" && (
        <div className="doma-address-preview__message">
          Определяем местоположение по адресу…
        </div>
      )}

      {geocodeStatus === "not-found" && (
        <div className="doma-address-preview__message">
          Адрес не найден. Уточните улицу и номер дома.
        </div>
      )}

      {geocodeStatus === "error" && (
        <div className="doma-address-preview__message doma-address-preview__message--error">
          Не удалось определить адрес. Проверьте подключение к Геокодеру Яндекса.
        </div>
      )}

      {coordinates && (
        <div className="doma-address-preview__map-shell">
          <div ref={containerRef} className="doma-address-preview__map" />
          {mapStatus === "loading" && (
            <div className="doma-address-preview__map-overlay">
              Загружаем карту…
            </div>
          )}
          {mapStatus === "error" && (
            <div className="doma-address-preview__map-overlay doma-address-preview__map-overlay--error">
              Не удалось загрузить карту. Проверьте API-ключ Яндекс.Карт.
            </div>
          )}
          <div className="doma-address-preview__caption">
            <span className="doma-address-preview__pin" />
            Местоположение по реальному адресу
          </div>
        </div>
      )}

      <style jsx global>{`
        .doma-address-preview {
          width: 100%;
          margin-top: 10px;
        }
        .doma-address-preview__message {
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          background: #f8fafc;
          color: #64748b;
          padding: 10px 12px;
          font-size: 12px;
          line-height: 1.5;
        }
        .doma-address-preview__message--error {
          border-color: #fecaca;
          background: #fff7f7;
          color: #b91c1c;
        }
        .doma-address-preview__map-shell {
          position: relative;
          height: 220px;
          width: 100%;
          overflow: hidden;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          background: #eef2f6;
        }
        .doma-address-preview__map {
          height: 100%;
          width: 100%;
        }
        .doma-address-preview__map-overlay {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          background: rgba(248, 250, 252, 0.88);
          color: #64748b;
          font-size: 12px;
          text-align: center;
        }
        .doma-address-preview__map-overlay--error {
          color: #b91c1c;
        }
        .doma-address-preview__caption {
          position: absolute;
          left: 10px;
          bottom: 10px;
          display: flex;
          align-items: center;
          gap: 7px;
          border-radius: 9px;
          background: rgba(255, 255, 255, 0.96);
          padding: 7px 10px;
          box-shadow: 0 2px 10px rgba(15, 23, 42, 0.12);
          color: #334155;
          font-size: 11px;
          font-weight: 600;
        }
        .doma-address-preview__pin {
          width: 8px;
          height: 8px;
          flex: 0 0 8px;
          border-radius: 50%;
          background: #ef4444;
          box-shadow: 0 0 0 3px #fee2e2;
        }
        .doma-address-marker {
          position: relative;
          width: 18px;
          height: 18px;
          border: 3px solid white;
          border-radius: 50% 50% 50% 0;
          background: #ef4444;
          box-shadow: 0 2px 8px rgba(15, 23, 42, 0.35);
          transform: translate(-50%, -50%) rotate(-45deg);
        }
      `}</style>
    </div>
  );
}
