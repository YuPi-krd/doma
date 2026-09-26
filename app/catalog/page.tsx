"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

interface Property {
  id: number;
  title: string;
  description: string;
  price: number;
  area: number;
  rooms: number;
  city: string;
  district: string;
  address: string;
  status: string;

  property_type: string;
  property_type_label?: string;

  image_url: string;
}

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  all: "Вся недвижимость",
  apartment: "Квартиры",
  new_building: "Квартиры в новостройке",
  house: "Дома",
  land: "Земельные участки",
  commercial: "Коммерческая недвижимость",
  garage: "Гаражи",
};

const API_URL =
  "https://doma-nq4u.onrender.com";

export default function CatalogPage() {
  const [properties, setProperties] =
    useState<Property[]>([]);

  const [propertyType, setPropertyType] =
    useState("all");

  const [search, setSearch] =
    useState("");

  const [rooms, setRooms] =
    useState("all");

  const [status, setStatus] =
    useState("all");

  const [district, setDistrict] =
    useState("all");

  const [priceFrom, setPriceFrom] =
    useState("");

  const [priceTo, setPriceTo] =
    useState("");

  const [sort, setSort] =
    useState("default");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // ============================================================
  // Определяем категорию из URL и загружаем объекты
  // ============================================================

  useEffect(() => {
    const params = new URLSearchParams(
      window.location.search
    );

    const typeFromUrl =
      params.get("type") || "all";

    setPropertyType(typeFromUrl);

    const url =
      typeFromUrl === "all"
        ? `${API_URL}/properties`
        : `${API_URL}/properties?type=${encodeURIComponent(
            typeFromUrl
          )}`;

    setLoading(true);
    setError("");

    fetch(url)
      .then((res) => {
        if (!res.ok) {
          throw new Error(
            "Не удалось загрузить каталог"
          );
        }

        return res.json();
      })
      .then((data) => {
        setProperties(
          Array.isArray(data)
            ? data
            : []
        );
      })
      .catch((err) => {
        console.error(err);

        setError(
          "Не удалось загрузить объекты недвижимости."
        );

        setProperties([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // ============================================================
  // Название текущей категории
  // ============================================================

  const currentTypeLabel =
    PROPERTY_TYPE_LABELS[propertyType] ||
    "Вся недвижимость";

  // ============================================================
  // Фильтрация
  // ============================================================

  const filteredProperties =
    useMemo(() => {
      let result = [...properties];

      // Поиск
      if (search.trim()) {
        const query =
          search
            .trim()
            .toLowerCase();

        result =
          result.filter(
            (item) =>
              item.title
                .toLowerCase()
                .includes(query) ||
              item.address
                .toLowerCase()
                .includes(query) ||
              item.district
                .toLowerCase()
                .includes(query) ||
              item.city
                .toLowerCase()
                .includes(query)
          );
      }

      // Комнаты
      if (rooms !== "all") {
        if (rooms === "4") {
          result =
            result.filter(
              (item) =>
                item.rooms >= 4
            );
        } else {
          result =
            result.filter(
              (item) =>
                item.rooms ===
                Number(rooms)
            );
        }
      }

      // Статус
      if (status !== "all") {
        result =
          result.filter(
            (item) =>
              item.status === status
          );
      }

      // Район
      if (district !== "all") {
        result =
          result.filter(
            (item) =>
              item.district ===
              district
          );
      }

      // Цена от
      if (priceFrom) {
        result =
          result.filter(
            (item) =>
              item.price >=
              Number(priceFrom)
          );
      }

      // Цена до
      if (priceTo) {
        result =
          result.filter(
            (item) =>
              item.price <=
              Number(priceTo)
          );
      }

      // Сортировка
      if (sort === "price_asc") {
        result.sort(
          (a, b) =>
            a.price - b.price
        );
      }

      if (sort === "price_desc") {
        result.sort(
          (a, b) =>
            b.price - a.price
        );
      }

      if (sort === "area_desc") {
        result.sort(
          (a, b) =>
            b.area - a.area
        );
      }

      return result;
    }, [
      properties,
      search,
      rooms,
      status,
      district,
      priceFrom,
      priceTo,
      sort,
    ]);

  // ============================================================
  // Переход между категориями
  // ============================================================

  const changePropertyType = (
    type: string
  ) => {
    if (type === "all") {
      window.location.href =
        "/catalog";
      return;
    }

    window.location.href =
      `/catalog?type=${encodeURIComponent(
        type
      )}`;
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <main
      style={{
        background: "#f8fafc",
        minHeight: "100vh",
        padding: "40px 20px 80px",
      }}
    >
      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
        }}
      >
        {/* ================================================== */}
        {/* Заголовок */}
        {/* ================================================== */}

        <div
          style={{
            marginBottom: "30px",
          }}
        >
          <h1
            style={{
              fontSize:
                "clamp(34px, 5vw, 52px)",
              lineHeight: 1.05,
              margin: 0,
              marginBottom: "12px",
              fontWeight: 700,
              letterSpacing: "-1.5px",
              color: "#111827",
            }}
          >
            Каталог недвижимости
          </h1>

          <div
            style={{
              fontSize: "21px",
              fontWeight: 600,
              color: "#111827",
              marginBottom: "8px",
            }}
          >
            {currentTypeLabel}
          </div>

          <p
            style={{
              margin: 0,
              color: "#64748b",
              fontSize: "16px",
            }}
          >
            Найдено объектов:{" "}
            <strong>
              {filteredProperties.length}
            </strong>
          </p>
        </div>

        {/* ================================================== */}
        {/* Фильтры */}
        {/* ================================================== */}

        <div
          style={{
            position: "sticky",
            top: "20px",
            zIndex: 100,
            background: "#ffffff",
            padding: "24px",
            borderRadius: "24px",
            marginBottom: "30px",
            boxShadow:
              "0 10px 30px rgba(0,0,0,.05)",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(6, minmax(0, 1fr))",
              gap: "12px",
            }}
          >
            {/* Тип */}
            <select
              value={propertyType}
              onChange={(e) =>
                changePropertyType(
                  e.target.value
                )
              }
              style={{
                width: "100%",
                padding:
                  "13px 14px",
                border:
                  "1px solid #e2e8f0",
                borderRadius: "12px",
                background:
                  "#ffffff",
                fontSize: "14px",
                outline: "none",
              }}
            >
              <option value="all">
                Тип недвижимости
              </option>

              <option value="apartment">
                Квартира
              </option>

              <option value="new_building">
                Квартира в новостройке
              </option>

              <option value="house">
                Дом
              </option>

              <option value="land">
                Земельный участок
              </option>

              <option value="commercial">
                Коммерческая недвижимость
              </option>

              <option value="garage">
                Гараж
              </option>
            </select>

            {/* Поиск */}
            <input
              placeholder="Город, район, улица..."
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              style={{
                width: "100%",
                padding:
                  "13px 14px",
                border:
                  "1px solid #e2e8f0",
                borderRadius: "12px",
                fontSize: "14px",
                outline: "none",
              }}
            />

            {/* Цена от */}
            <input
              type="number"
              placeholder="Цена от"
              value={priceFrom}
              onChange={(e) =>
                setPriceFrom(
                  e.target.value
                )
              }
              style={{
                width: "100%",
                padding:
                  "13px 14px",
                border:
                  "1px solid #e2e8f0",
                borderRadius: "12px",
                fontSize: "14px",
                outline: "none",
              }}
            />

            {/* Цена до */}
            <input
              type="number"
              placeholder="Цена до"
              value={priceTo}
              onChange={(e) =>
                setPriceTo(
                  e.target.value
                )
              }
              style={{
                width: "100%",
                padding:
                  "13px 14px",
                border:
                  "1px solid #e2e8f0",
                borderRadius: "12px",
                fontSize: "14px",
                outline: "none",
              }}
            />

            {/* Комнаты */}
            <select
              value={rooms}
              onChange={(e) =>
                setRooms(
                  e.target.value
                )
              }
              style={{
                width: "100%",
                padding:
                  "13px 14px",
                border:
                  "1px solid #e2e8f0",
                borderRadius: "12px",
                background:
                  "#ffffff",
                fontSize: "14px",
                outline: "none",
              }}
            >
              <option value="all">
                Комнаты
              </option>

              <option value="1">
                1
              </option>

              <option value="2">
                2
              </option>

              <option value="3">
                3
              </option>

              <option value="4">
                4+
              </option>
            </select>

            {/* Район */}
            <select
              value={district}
              onChange={(e) =>
                setDistrict(
                  e.target.value
                )
              }
              style={{
                width: "100%",
                padding:
                  "13px 14px",
                border:
                  "1px solid #e2e8f0",
                borderRadius: "12px",
                background:
                  "#ffffff",
                fontSize: "14px",
                outline: "none",
              }}
            >
              <option value="all">
                Район
              </option>

              <option value="Центральный">
                Центральный
              </option>

              <option value="ФМР">
                ФМР
              </option>

              <option value="ЮМР">
                ЮМР
              </option>

              <option value="ГМР">
                ГМР
              </option>

              <option value="ККБ">
                ККБ
              </option>
            </select>
          </div>

          {/* Сортировка */}
          <div
            style={{
              marginTop: "12px",
              display: "flex",
              justifyContent:
                "flex-end",
            }}
          >
            <select
              value={sort}
              onChange={(e) =>
                setSort(
                  e.target.value
                )
              }
              style={{
                minWidth: "220px",
                padding:
                  "13px 14px",
                border:
                  "1px solid #e2e8f0",
                borderRadius: "12px",
                background:
                  "#ffffff",
                fontSize: "14px",
                outline: "none",
              }}
            >
              <option value="default">
                Сортировка
              </option>

              <option value="price_asc">
                Цена ↑
              </option>

              <option value="price_desc">
                Цена ↓
              </option>

              <option value="area_desc">
                Площадь ↓
              </option>
            </select>
          </div>
        </div>

        {/* ================================================== */}
        {/* Ошибка */}
        {/* ================================================== */}

        {error && (
          <div
            style={{
              background: "#fee2e2",
              color: "#991b1b",
              padding: "18px 20px",
              borderRadius: "16px",
              marginBottom: "24px",
              fontWeight: 500,
            }}
          >
            {error}
          </div>
        )}

        {/* ================================================== */}
        {/* Загрузка */}
        {/* ================================================== */}

        {loading && (
          <div
            style={{
              background:
                "#ffffff",
              borderRadius: "24px",
              padding: "60px 30px",
              textAlign: "center",
              color: "#64748b",
              boxShadow:
                "0 10px 30px rgba(0,0,0,.04)",
            }}
          >
            Загружаем объекты...
          </div>
        )}

        {/* ================================================== */}
        {/* Нет объектов */}
        {/* ================================================== */}

        {!loading &&
          !error &&
          filteredProperties.length ===
            0 && (
            <div
              style={{
                background:
                  "#ffffff",
                borderRadius: "24px",
                padding:
                  "70px 30px",
                textAlign: "center",
                boxShadow:
                  "0 10px 30px rgba(0,0,0,.04)",
              }}
            >
              <div
                style={{
                  fontSize: "48px",
                  marginBottom: "15px",
                }}
              >
                🏠
              </div>

              <h2
                style={{
                  margin:
                    "0 0 10px",
                  color:
                    "#111827",
                }}
              >
                Объектов не найдено
              </h2>

              <p
                style={{
                  margin: 0,
                  color:
                    "#64748b",
                }}
              >
                Попробуйте изменить
                параметры поиска.
              </p>
            </div>
          )}

        {/* ================================================== */}
        {/* Карточки */}
        {/* ================================================== */}

        {!loading &&
          filteredProperties.length >
            0 && (
            <div
              style={{
                display: "flex",
                flexDirection:
                  "column",
                gap: "20px",
              }}
            >
              {filteredProperties.map(
                (item) => {
                  const pricePerMeter =
                    item.area > 0
                      ? Math.round(
                          item.price /
                            item.area
                        )
                      : 0;

                  const imageSrc =
                    item.image_url
                      ? `${API_URL}${item.image_url}`
                      : `${API_URL}/images/test-flat.jpg`;

                  const typeLabel =
                    item.property_type_label ||
                    PROPERTY_TYPE_LABELS[
                      item.property_type
                    ] ||
                    "Недвижимость";

                  return (
                    <Link
                      key={item.id}
                      href={`/property/${item.id}`}
                      style={{
                        textDecoration:
                          "none",
                        color:
                          "inherit",
                        display:
                          "block",
                      }}
                    >
                      <div
                        style={{
                          background:
                            "#ffffff",
                          borderRadius:
                            "32px",
                          overflow:
                            "hidden",
                          display:
                            "grid",
                          gridTemplateColumns:
                            "420px 1fr",
                          minHeight:
                            "300px",
                          alignItems:
                            "stretch",
                          boxShadow:
                            "0 15px 40px rgba(0,0,0,.06)",
                          transition:
                            "transform .2s, box-shadow .2s",
                        }}
                      >
                        {/* ============================ */}
                        {/* Фото */}
                        {/* ============================ */}

                        <div
                          style={{
                            position:
                              "relative",
                            width:
                              "100%",
                            height:
                              "100%",
                            minHeight:
                              "300px",
                            overflow:
                              "hidden",
                            background:
                              "#f1f5f9",
                          }}
                        >
                          <img
                            src={imageSrc}
                            alt={
                              item.title
                            }
                            style={{
                              position:
                                "absolute",
                              inset: 0,
                              width:
                                "100%",
                              height:
                                "100%",
                              objectFit:
                                "cover",
                              display:
                                "block",
                            }}
                            onError={(
                              e
                            ) => {
                              e.currentTarget.src =
                                `${API_URL}/images/test-flat.jpg`;
                            }}
                          />

                          {/* Район */}
                          {item.district && (
                            <div
                              style={{
                                position:
                                  "absolute",
                                top:
                                  "15px",
                                left:
                                  "15px",
                                background:
                                  "rgba(17,24,39,.85)",
                                color:
                                  "#ffffff",
                                padding:
                                  "8px 14px",
                                borderRadius:
                                  "999px",
                                fontWeight:
                                  600,
                                zIndex: 2,
                                fontSize:
                                  "13px",
                              }}
                            >
                              {
                                item.district
                              }
                            </div>
                          )}

                          {/* Категория */}
                          <div
                            style={{
                              position:
                                "absolute",
                              bottom:
                                "15px",
                              left:
                                "15px",
                              background:
                                "#ffffff",
                              color:
                                "#111827",
                              padding:
                                "8px 14px",
                              borderRadius:
                                "999px",
                              fontWeight:
                                600,
                              zIndex: 2,
                              fontSize:
                                "13px",
                            }}
                          >
                            {
                              typeLabel
                            }
                          </div>
                        </div>

                        {/* ============================ */}
                        {/* Контент */}
                        {/* ============================ */}

                        <div
                          style={{
                            padding:
                              "30px",
                            display:
                              "flex",
                            flexDirection:
                              "column",
                            minWidth: 0,
                          }}
                        >
                          <div
                            style={{
                              display:
                                "flex",
                              justifyContent:
                                "space-between",
                              alignItems:
                                "flex-start",
                              gap:
                                "20px",
                            }}
                          >
                            <div>
                              <h2
                                style={{
                                  fontSize:
                                    "28px",
                                  margin:
                                    "0 0 8px",
                                  lineHeight:
                                    1.2,
                                  color:
                                    "#111827",
                                }}
                              >
                                {
                                  item.title
                                }
                              </h2>

                              <p
                                style={{
                                  margin: 0,
                                  color:
                                    "#64748b",
                                }}
                              >
                                {
                                  item.address
                                }
                              </p>
                            </div>

                            {/* Статус */}
                            <span
                              style={{
                                background:
                                  item.status ===
                                  "Свободен"
                                    ? "#dcfce7"
                                    : "#fee2e2",
                                color:
                                  item.status ===
                                  "Свободен"
                                    ? "#166534"
                                    : "#991b1b",
                                padding:
                                  "8px 14px",
                                borderRadius:
                                  "999px",
                                fontWeight:
                                  600,
                                fontSize:
                                  "13px",
                                whiteSpace:
                                  "nowrap",
                              }}
                            >
                              {
                                item.status
                              }
                            </span>
                          </div>

                          {/* Цена */}
                          <div
                            style={{
                              fontSize:
                                "46px",
                              fontWeight:
                                700,
                              color:
                                "#22c55e",
                              marginTop:
                                "20px",
                              letterSpacing:
                                "-1px",
                            }}
                          >
                            {item.price.toLocaleString(
                              "ru-RU"
                            )}{" "}
                            ₽
                          </div>

                          {/* Цена за метр */}
                          {pricePerMeter >
                            0 && (
                            <div
                              style={{
                                color:
                                  "#64748b",
                                marginTop:
                                  "4px",
                              }}
                            >
                              {pricePerMeter.toLocaleString(
                                "ru-RU"
                              )}{" "}
                              ₽/м²
                            </div>
                          )}

                          {/* Характеристики */}
                          <div
                            style={{
                              display:
                                "flex",
                              gap:
                                "24px",
                              marginTop:
                                "20px",
                              flexWrap:
                                "wrap",
                              fontWeight:
                                500,
                              color:
                                "#334155",
                            }}
                          >
                            {item.rooms >
                              0 && (
                              <span>
                                🏠{" "}
                                {
                                  item.rooms
                                }{" "}
                                комн.
                              </span>
                            )}

                            {item.area >
                              0 && (
                              <span>
                                📐{" "}
                                {
                                  item.area
                                }{" "}
                                м²
                              </span>
                            )}

                            {item.city && (
                              <span>
                                📍{" "}
                                {
                                  item.city
                                }
                              </span>
                            )}
                          </div>

                          {/* Описание */}
                          {item.description && (
                            <p
                              style={{
                                marginTop:
                                  "20px",
                                color:
                                  "#475569",
                                lineHeight:
                                  "1.7",
                                display:
                                  "-webkit-box",
                                WebkitLineClamp:
                                  2,
                                WebkitBoxOrient:
                                  "vertical",
                                overflow:
                                  "hidden",
                              }}
                            >
                              {
                                item.description
                              }
                            </p>
                          )}

                          {/* Кнопка */}
                          <div
                            style={{
                              marginTop:
                                "auto",
                              paddingTop:
                                "24px",
                            }}
                          >
                            <span
                              style={{
                                display:
                                  "inline-block",
                                background:
                                  "#ef4444",
                                color:
                                  "#ffffff",
                                borderRadius:
                                  "14px",
                                padding:
                                  "14px 24px",
                                fontWeight:
                                  600,
                              }}
                            >
                              Подробнее
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                }
              )}
            </div>
          )}
      </div>

      {/* Адаптивная сетка */}
      <style jsx>{`
        @media (max-width: 1100px) {
          main > div > div:nth-child(3) > div {
            grid-template-columns: repeat(
              3,
              minmax(0, 1fr)
            ) !important;
          }
        }

        @media (max-width: 900px) {
          main {
            padding: 25px 14px 60px !important;
          }

          main > div > div:nth-child(3) > div {
            grid-template-columns: repeat(
              2,
              minmax(0, 1fr)
            ) !important;
          }

          div[style*="gridTemplateColumns: 420px 1fr"] {
            grid-template-columns: 1fr !important;
          }

          div[style*="gridTemplateColumns: 420px 1fr"]
            > div:first-child {
            min-height: 260px !important;
          }
        }

        @media (max-width: 700px) {
          div[style*="repeat(6, minmax(0, 1fr))"] {
            grid-template-columns: 1fr 1fr !important;
          }
        }

        @media (max-width: 520px) {
          div[style*="repeat(6, minmax(0, 1fr))"] {
            grid-template-columns: 1fr !important;
          }

          div[style*="gridTemplateColumns: 420px 1fr"]
            > div:last-child {
            padding: 22px !important;
          }

          div[style*="gridTemplateColumns: 420px 1fr"]
            h2 {
            font-size: 22px !important;
          }

          div[style*="gridTemplateColumns: 420px 1fr"]
            div[style*="fontSize: 46px"] {
            font-size: 34px !important;
          }
        }
      `}</style>
    </main>
  );
}