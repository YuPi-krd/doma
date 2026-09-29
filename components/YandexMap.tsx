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