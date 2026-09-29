"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

const API_URL =
  "https://doma-nq4u.onrender.com";

const DEFAULT_CENTER: [
  number,
  number
] = [38.9769, 45.0355];

interface AddressMapPickerProps {
  city: string;
  address: string;

  latitude: number | null;
  longitude: number | null;

  onAddressChange: (
    value: string
  ) => void;

  onCoordinatesChange: (
    latitude: number | null,
    longitude: number | null
  ) => void;
}

declare global {
  interface Window {
    ymaps3?: any;
  }
}

let yandexMapsPromise:
  Promise<any> | null = null;

function loadYandexMaps(): Promise<any> {
  if (
    typeof window === "undefined"
  ) {
    return Promise.reject(
      new Error(
        "Яндекс.Карты доступны только в браузере."
      )
    );
  }

  if (window.ymaps3) {
    return Promise.resolve(
      window.ymaps3
    );
  }

  if (yandexMapsPromise) {
    return yandexMapsPromise;
  }

  const apiKey =
    process.env
      .NEXT_PUBLIC_YANDEX_MAPS_API_KEY;

  if (!apiKey) {
    return Promise.reject(
      new Error(
        "Не найден NEXT_PUBLIC_YANDEX_MAPS_API_KEY."
      )
    );
  }

  yandexMapsPromise =
    new Promise(
      (
        resolve,
        reject
      ) => {
        const existingScript =
          document.querySelector(
            'script[data-doma-yandex-maps="true"]'
          ) as HTMLScriptElement | null;

        if (
          existingScript
        ) {
          existingScript.addEventListener(
            "load",
            async () => {
              try {
                if (
                  !window.ymaps3
                ) {
                  throw new Error(
                    "ymaps3 не найден после загрузки."
                  );
                }

                await window.ymaps3
                  .ready;

                resolve(
                  window.ymaps3
                );
              } catch (
                error
              ) {
                reject(
                  error
                );
              }
            },
            {
              once: true,
            }
          );

          existingScript.addEventListener(
            "error",
            () => {
              reject(
                new Error(
                  "Не удалось загрузить Яндекс.Карты."
                )
              );
            },
            {
              once: true,
            }
          );

          return;
        }

        const script =
          document.createElement(
            "script"
          );

        script.src =
          `https://api-maps.yandex.ru/v3/?apikey=${encodeURIComponent(
            apiKey
          )}&lang=ru_RU`;

        script.async = true;

        script.dataset.domaYandexMaps =
          "true";

        script.onload =
          async () => {
            try {
              if (
                !window.ymaps3
              ) {
                throw new Error(
                  "ymaps3 не найден после загрузки."
                );
              }

              await window.ymaps3
                .ready;

              resolve(
                window.ymaps3
              );
            } catch (
              error
            ) {
              reject(
                error
              );
            }
          };

        script.onerror =
          () => {
            reject(
              new Error(
                "Не удалось загрузить Яндекс.Карты."
              )
            );
          };

        document.head.appendChild(
          script
        );
      }
    );

  return yandexMapsPromise;
}

export default function AddressMapPicker({
  city,
  address,
  latitude,
  longitude,
  onAddressChange,
  onCoordinatesChange,
}: AddressMapPickerProps) {
  const mapContainerRef =
    useRef<HTMLDivElement | null>(
      null
    );

  const mapRef =
    useRef<any>(null);

  const markerRef =
    useRef<any>(null);

  const listenerRef =
    useRef<any>(null);

  const ymapsRef =
    useRef<any>(null);

  const [
    mapReady,
    setMapReady,
  ] = useState(false);

  const [
    searching,
    setSearching,
  ] = useState(false);

  const [
    message,
    setMessage,
  ] = useState("");

  const [
    mapError,
    setMapError,
  ] = useState("");

  const [
    markerCoordinates,
    setMarkerCoordinates,
  ] = useState<
    [
      number,
      number
    ] | null
  >(
    latitude !== null &&
      longitude !== null
      ? [
          longitude,
          latitude,
        ]
      : null
  );

  /*
   * =========================================================
   * Создание / обновление маркера
   * =========================================================
   */

  function setMarker(
    coordinates: [
      number,
      number
    ],
    ymaps: any
  ) {
    const map =
      mapRef.current;

    if (!map) {
      return;
    }

    /*
     * Старый маркер удаляем.
     */

    if (
      markerRef.current
    ) {
      try {
        map.removeChild(
          markerRef.current
        );
      } catch {
        // ignore
      }

      markerRef.current =
        null;
    }

    /*
     * Создаём элемент маркера.
     */

    const markerElement =
      document.createElement(
        "div"
      );

    markerElement.className =
      "doma-address-marker";

    markerElement.innerHTML = `
      <div class="doma-address-marker-pin">
        <div class="doma-address-marker-center"></div>
      </div>
    `;

    /*
     * В Yandex Maps v3 маркер поддерживает
     * draggable и onDragEnd.
     */

    const marker =
      new ymaps.YMapMarker(
        {
          coordinates,
          draggable: true,
          mapFollowsOnDrag: true,

          onDragEnd: async (
            newCoordinates: [
              number,
              number
            ]
          ) => {
            const [
              newLongitude,
              newLatitude,
            ] = newCoordinates;

            setMarkerCoordinates(
              [
                newLongitude,
                newLatitude,
              ]
            );

            onCoordinatesChange(
              newLatitude,
              newLongitude
            );

            await reverseGeocode(
              newLatitude,
              newLongitude
            );
          },
        },
        markerElement
      );

    map.addChild(
      marker
    );

    markerRef.current =
      marker;
  }

  /*
   * =========================================================
   * Инициализация карты
   * =========================================================
   */

  useEffect(() => {
    let cancelled = false;

    async function initMap() {
      try {
        setMapError("");

        const ymaps =
          await loadYandexMaps();

        if (
          cancelled ||
          !mapContainerRef.current
        ) {
          return;
        }

        ymapsRef.current =
          ymaps;

        if (
          mapRef.current
        ) {
          setMapReady(true);
          return;
        }

        const {
          YMap,
          YMapDefaultSchemeLayer,
          YMapDefaultFeaturesLayer,
          YMapListener,
        } = ymaps;

        const initialCenter =
          latitude !== null &&
          longitude !== null
            ? [
                longitude,
                latitude,
              ]
            : DEFAULT_CENTER;

        const initialZoom =
          latitude !== null &&
          longitude !== null
            ? 17
            : 11;

        const map =
          new YMap(
            mapContainerRef.current,
            {
              location: {
                center:
                  initialCenter,
                zoom:
                  initialZoom,
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

        /*
         * Клик по карте создаёт / перемещает
         * маркер.
         */

        const mapListener =
          new YMapListener({
            layer: "any",

            onClick: (
              object: any,
              event: any
            ) => {
              /*
               * Если кликнули по существующему
               * маркеру — ничего не делаем.
               */
              if (
                object?.type ===
                "marker"
              ) {
                return;
              }

              const coordinates =
                event?.coordinates;

              if (
                !Array.isArray(
                  coordinates
                ) ||
                coordinates.length !==
                  2
              ) {
                return;
              }

              const [
                clickedLongitude,
                clickedLatitude,
              ] = coordinates;

              setMarkerCoordinates(
                [
                  clickedLongitude,
                  clickedLatitude,
                ]
              );

              onCoordinatesChange(
                clickedLatitude,
                clickedLongitude
              );

              setMarker(
                [
                  clickedLongitude,
                  clickedLatitude,
                ],
                ymaps
              );

              reverseGeocode(
                clickedLatitude,
                clickedLongitude
              );
            },
          });

        map.addChild(
          mapListener
        );

        mapRef.current =
          map;

        listenerRef.current =
          mapListener;

        /*
         * Если координаты уже есть —
         * ставим существующий маркер.
         */

        if (
          latitude !== null &&
          longitude !== null
        ) {
          setMarker(
            [
              longitude,
              latitude,
            ],
            ymaps
          );
        }

        setMapReady(true);
      } catch (
        error
      ) {
        console.error(
          "DOMA map error:",
          error
        );

        if (!cancelled) {
          setMapError(
            error instanceof Error
              ? error.message
              : "Не удалось загрузить карту."
          );
        }
      }
    }

    initMap();

    return () => {
      cancelled = true;

      if (
        mapRef.current
      ) {
        try {
          mapRef.current.destroy();
        } catch {
          // ignore
        }

        mapRef.current =
          null;
      }

      markerRef.current =
        null;

      listenerRef.current =
        null;
    };
  }, []);

  /*
   * =========================================================
   * ПОИСК АДРЕСА
   * =========================================================
   */

  async function geocodeAddress() {
    const cleanCity =
      city.trim();

    const cleanAddress =
      address.trim();

    if (!cleanAddress) {
      setMessage(
        "Введите адрес."
      );

      return;
    }

    const fullAddress = [
      cleanCity,
      cleanAddress,
    ]
      .filter(Boolean)
      .join(", ");

    try {
      setSearching(true);
      setMessage("");

      const response =
        await fetch(
          `${API_URL}/geocode?address=${encodeURIComponent(
            fullAddress
          )}`
        );

      const data =
        await response.json();

      if (
        !response.ok
      ) {
        throw new Error(
          data?.detail ||
            "Ошибка геокодирования."
        );
      }

      if (
        !data?.found
      ) {
        setMessage(
          "Адрес не найден. Попробуйте уточнить улицу и номер дома."
        );

        return;
      }

      const foundLatitude =
        Number(
          data.latitude
        );

      const foundLongitude =
        Number(
          data.longitude
        );

      if (
        !Number.isFinite(
          foundLatitude
        ) ||
        !Number.isFinite(
          foundLongitude
        )
      ) {
        throw new Error(
          "Яндекс не вернул корректные координаты."
        );
      }

      const coordinates: [
        number,
        number
      ] = [
        foundLongitude,
        foundLatitude,
      ];

      setMarkerCoordinates(
        coordinates
      );

      onCoordinatesChange(
        foundLatitude,
        foundLongitude
      );

      /*
       * Берём нормализованный адрес
       * Яндекса, если он есть.
       */

      if (
        data.formatted
      ) {
        onAddressChange(
          data.formatted
        );
      }

      /*
       * Перемещаем карту.
       */

      if (
        mapRef.current
      ) {
        mapRef.current.setLocation(
          {
            center:
              coordinates,
            zoom: 17,
            duration: 500,
          }
        );
      }

      /*
       * Ставим маркер.
       */

      if (
        ymapsRef.current
      ) {
        setMarker(
          coordinates,
          ymapsRef.current
        );
      }

      if (
        data.precision ===
        "exact"
      ) {
        setMessage(
          "✓ Точный адрес найден. При необходимости перетащи метку."
        );
      } else {
        setMessage(
          "✓ Адрес найден. Проверь положение метки на карте."
        );
      }
    } catch (
      error
    ) {
      console.error(
        "Geocode error:",
        error
      );

      setMessage(
        error instanceof Error
          ? error.message
          : "Не удалось найти адрес."
      );
    } finally {
      setSearching(false);
    }
  }

  /*
   * =========================================================
   * ОБРАТНОЕ ГЕОКОДИРОВАНИЕ
   * =========================================================
   */

  async function reverseGeocode(
    nextLatitude: number,
    nextLongitude: number
  ) {
    try {
      const response =
        await fetch(
          `${API_URL}/reverse-geocode?latitude=${encodeURIComponent(
            nextLatitude
          )}&longitude=${encodeURIComponent(
            nextLongitude
          )}`
        );

      const data =
        await response.json();

      if (
        !response.ok
      ) {
        throw new Error(
          data?.detail ||
            "Ошибка обратного геокодирования."
        );
      }

      if (
        data?.found &&
        data.formatted
      ) {
        onAddressChange(
          data.formatted
        );

        setMessage(
          "✓ Точка и адрес обновлены."
        );
      } else {
        setMessage(
          "Точка установлена. Точный адрес не найден."
        );
      }
    } catch (
      error
    ) {
      console.error(
        "Reverse geocode error:",
        error
      );

      setMessage(
        "Точка сохранена, но адрес автоматически определить не удалось."
      );
    }
  }

  /*
   * =========================================================
   * Сброс точки
   * =========================================================
   */

  function clearLocation() {
    if (
      mapRef.current &&
      markerRef.current
    ) {
      try {
        mapRef.current.removeChild(
          markerRef.current
        );
      } catch {
        // ignore
      }
    }

    markerRef.current =
      null;

    setMarkerCoordinates(
      null
    );

    onCoordinatesChange(
      null,
      null
    );

    setMessage(
      "Точка на карте удалена."
    );

    if (
      mapRef.current
    ) {
      mapRef.current.setLocation(
        {
          center:
            DEFAULT_CENTER,
          zoom: 11,
          duration: 400,
        }
      );
    }
  }

  return (
    <div className="picker">

      {/* ====================================================
          ПОИСК
      ==================================================== */}

      <div className="search-row">

        <input
          value={address}
          onChange={(e) =>
            onAddressChange(
              e.target.value
            )
          }
          placeholder="Например: ул. Красная, 1"
          className="address-input"
        />

        <button
          type="button"
          className="find-button"
          onClick={
            geocodeAddress
          }
          disabled={
            searching
          }
        >
          {searching
            ? "Ищем..."
            : "🔎 Найти на карте"}
        </button>

      </div>

      {/* ====================================================
          КАРТА
      ==================================================== */}

      <div className="map-box">

        <div
          ref={
            mapContainerRef
          }
          className="map"
        />

        {!mapReady &&
          !mapError && (
            <div className="map-overlay">
              <div className="loader" />

              <span>
                Загружаем карту...
              </span>
            </div>
          )}

        {mapError && (
          <div className="map-overlay error">

            <div className="error-icon">
              ⚠
            </div>

            <strong>
              Не удалось загрузить карту
            </strong>

            <p>
              {mapError}
            </p>

          </div>
        )}

      </div>

      {/* ====================================================
          СТАТУС
      ==================================================== */}

      <div
        className={
          message.startsWith("✓")
            ? "message success"
            : "message"
        }
      >
        {message ||
          "Введи адрес и нажми «Найти на карте». Метку можно переместить вручную."}
      </div>

      {/* ====================================================
          КООРДИНАТЫ НЕ ПОКАЗЫВАЕМ
      ==================================================== */}

      {markerCoordinates && (
        <div className="location-actions">

          <span>
            📍 Точка объекта установлена
          </span>

          <button
            type="button"
            onClick={
              clearLocation
            }
          >
            Удалить точку
          </button>

        </div>
      )}

      <style jsx>{`
        .picker {
          display: grid;
          gap: 10px;
        }

        .search-row {
          display: grid;
          grid-template-columns:
            minmax(0, 1fr)
            auto;
          gap: 8px;
        }

        .address-input {
          width: 100%;
          height: 48px;
          box-sizing: border-box;
          padding:
            0
            15px;
          border:
            1px solid
            #d8dee6;
          border-radius: 13px;
          outline: none;
          background: #ffffff;
          color: #202832;
          font-size: 14px;
        }

        .address-input:focus {
          border-color: #ef4444;
          box-shadow:
            0 0 0 3px
              rgba(
                239,
                68,
                68,
                0.08
              );
        }

        .find-button {
          height: 48px;
          min-width: 175px;
          padding:
            0
            17px;
          border: 0;
          border-radius: 13px;
          background: #ef4444;
          color: #ffffff;
          cursor: pointer;
          font-size: 13px;
          font-weight: 700;
        }

        .find-button:hover:not(
          :disabled
        ) {
          background: #dc3741;
        }

        .find-button:disabled {
          cursor: wait;
          opacity: 0.65;
        }

        .map-box {
          position: relative;
          width: 100%;
          height: 370px;
          overflow: hidden;
          border-radius: 20px;
          background: #edf1f4;
        }

        .map {
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

          background: #edf1f4;
          color: #667382;
          font-size: 14px;
        }

        .map-overlay.error {
          padding: 30px;
          box-sizing: border-box;
          text-align: center;
        }

        .map-overlay.error p {
          max-width: 600px;
          margin:
            5px
            0
            0;
          color: #7a8491;
          font-size: 13px;
          line-height: 1.6;
        }

        .error-icon {
          font-size: 35px;
        }

        .loader {
          width: 32px;
          height: 32px;
          border:
            3px solid
            #dce2e8;
          border-top-color:
            #ef4444;
          border-radius: 50%;
          animation:
            doma-map-spin
            0.8s linear infinite;
        }

        @keyframes doma-map-spin {
          to {
            transform: rotate(
              360deg
            );
          }
        }

        .message {
          padding:
            10px
            13px;
          border-radius: 10px;
          background: #f1f3f6;
          color: #687482;
          font-size: 12px;
          line-height: 1.5;
        }

        .message.success {
          background: #dcfce7;
          color: #166534;
        }

        .location-actions {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          padding:
            10px
            13px;
          border-radius: 10px;
          background: #f8fafc;
          color: #475569;
          font-size: 12px;
        }

        .location-actions button {
          border: 0;
          background: transparent;
          color: #ef4444;
          cursor: pointer;
          font-size: 12px;
          font-weight: 600;
        }

        /*
         * ====================================================
         * CUSTOM MARKER
         * ====================================================
         */

        :global(.doma-address-marker) {
          transform:
            translate(
              -50%,
              -50%
            );
          cursor: grab;
        }

        :global(
          .doma-address-marker:active
        ) {
          cursor: grabbing;
        }

        :global(
          .doma-address-marker-pin
        ) {
          position: relative;
          width: 34px;
          height: 34px;

          display: grid;
          place-items: center;

          border:
            4px solid
            #ffffff;

          border-radius: 50% 50%
            50% 0;

          transform:
            rotate(-45deg);

          background: #ef4444;

          box-shadow:
            0 5px 15px
              rgba(
                0,
                0,
                0,
                0.28
              );
        }

        :global(
          .doma-address-marker-center
        ) {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #ffffff;
          transform:
            rotate(45deg);
        }

        @media (max-width: 650px) {
          .search-row {
            grid-template-columns: 1fr;
          }

          .find-button {
            width: 100%;
          }

          .map-box {
            height: 310px;
          }

          .location-actions {
            align-items: flex-start;
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}