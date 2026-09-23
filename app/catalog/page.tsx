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
  image_url: string;
}

export default function CatalogPage() {
  const [properties, setProperties] =
    useState<Property[]>([]);

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

  useEffect(() => {
    fetch(
      "http://127.0.0.1:8000/properties"
    )
      .then((res) => res.json())
      .then(setProperties)
      .catch(console.error);
  }, []);

  const filteredProperties =
    useMemo(() => {
      let result = [...properties];

      if (search) {
        const query =
          search.toLowerCase();

        result = result.filter(
          (item) =>
            item.title
              .toLowerCase()
              .includes(query) ||
            item.address
              .toLowerCase()
              .includes(query) ||
            item.district
              .toLowerCase()
              .includes(query)
        );
      }

      if (rooms !== "all") {
        if (rooms === "4") {
          result = result.filter(
            (item) =>
              item.rooms >= 4
          );
        } else {
          result = result.filter(
            (item) =>
              item.rooms ===
              Number(rooms)
          );
        }
      }

      if (status !== "all") {
        result = result.filter(
          (item) =>
            item.status === status
        );
      }

      if (district !== "all") {
        result = result.filter(
          (item) =>
            item.district ===
            district
        );
      }

      if (priceFrom) {
        result = result.filter(
          (item) =>
            item.price >=
            Number(priceFrom)
        );
      }

      if (priceTo) {
        result = result.filter(
          (item) =>
            item.price <=
            Number(priceTo)
        );
      }

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

  return (
    <main
      style={{
        background: "#f8fafc",
        minHeight: "100vh",
        padding: "40px",
      }}
    >
      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
        }}
      >
        <h1
          style={{
            fontSize: "48px",
            marginBottom: "10px",
          }}
        >
          Каталог недвижимости
        </h1>

        <p
          style={{
            color: "#64748b",
            marginBottom: "30px",
          }}
        >
          Найдено объектов:
          {" "}
          {filteredProperties.length}
        </p>

        <div
          style={{
            position: "sticky",
            top: "20px",
            zIndex: 100,
            background: "white",
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
                "repeat(6,1fr)",
              gap: "12px",
            }}
          >
            <input
              placeholder="Поиск..."
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
            />

            <input
              type="number"
              placeholder="Цена от"
              value={priceFrom}
              onChange={(e) =>
                setPriceFrom(
                  e.target.value
                )
              }
            />

            <input
              type="number"
              placeholder="Цена до"
              value={priceTo}
              onChange={(e) =>
                setPriceTo(
                  e.target.value
                )
              }
            />

            <select
              value={rooms}
              onChange={(e) =>
                setRooms(
                  e.target.value
                )
              }
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

            <select
              value={district}
              onChange={(e) =>
                setDistrict(
                  e.target.value
                )
              }
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

            <select
              value={sort}
              onChange={(e) =>
                setSort(
                  e.target.value
                )
              }
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

        <div
          style={{
            display: "flex",
            flexDirection: "column",
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

              return (
                <Link
                  key={item.id}
                  href={`/property/${item.id}`}
                  style={{
                    textDecoration:
                      "none",
                    color: "inherit",
                  }}
                >
                  <div
  style={{
    background: "white",
    borderRadius: "32px",
    overflow: "hidden",
    display: "grid",
    gridTemplateColumns: "420px 1fr",
    minHeight: "300px",
    alignItems: "stretch",
    boxShadow:
      "0 15px 40px rgba(0,0,0,.06)",
    transition: ".2s",
  }}
>
  {/* Фото */}

  <div
  style={{
    position: "relative",
    width: "100%",
    height: "100%",
    minHeight: "100%",
    overflow: "hidden",
    background: "#f1f5f9",
    alignSelf: "stretch",
  }}
>
  <img
    src={
      item.image_url
        ? `http://127.0.0.1:8000${item.image_url}`
        : "http://127.0.0.1:8000/images/test-flat.jpg"
    }
    alt={item.title}
    style={{
      position: "absolute",
      inset: 0,
      width: "100%",
      height: "100%",
      objectFit: "cover",
      display: "block",
    }}
    onError={(e) => {
      e.currentTarget.src =
        "http://127.0.0.1:8000/images/test-flat.jpg";
    }}
  />

  <div
    style={{
      position: "absolute",
      top: "15px",
      left: "15px",
      background: "#2563eb",
      color: "white",
      padding: "8px 14px",
      borderRadius: "999px",
      fontWeight: 600,
      zIndex: 2,
    }}
  >
    {item.district}
  </div>
</div>

  {/* Контент */}

  <div
    style={{
      padding: "30px",
      display: "flex",
      flexDirection: "column",
    }}
  >
    <div
      style={{
        display: "flex",
        justifyContent:
          "space-between",
        alignItems: "flex-start",
      }}
    >
      <div>
        <h2
          style={{
            fontSize: "28px",
            marginBottom: "8px",
          }}
        >
          {item.title}
        </h2>

        <p
          style={{
            color: "#64748b",
          }}
        >
          {item.address}
        </p>
      </div>

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

          padding: "8px 14px",
          borderRadius: "999px",
          fontWeight: 600,
        }}
      >
        {item.status}
      </span>
    </div>

    <div
      style={{
        fontSize: "46px",
        fontWeight: 700,
        color: "#22c55e",
        marginTop: "20px",
        letterSpacing: "-1px",
      }}
    >
      {item.price.toLocaleString(
        "ru-RU"
      )} ₽
    </div>

    {pricePerMeter > 0 && (
      <div
        style={{
          color: "#64748b",
          marginTop: "4px",
        }}
      >
        {pricePerMeter.toLocaleString(
          "ru-RU"
        )} ₽/м²
      </div>
    )}

    <div
      style={{
        display: "flex",
        gap: "24px",
        marginTop: "20px",
        flexWrap: "wrap",
        fontWeight: 500,
      }}
    >
      <span>
        🏠 {item.rooms} комн.
      </span>

      {item.area > 0 && (
        <span>
          📐 {item.area} м²
        </span>
      )}

      <span>
        📍 {item.city}
      </span>
    </div>

    <p
      style={{
        marginTop: "20px",
        color: "#475569",
        lineHeight: "1.7",
        display: "-webkit-box",
        WebkitLineClamp: 2,
        WebkitBoxOrient: "vertical",
        overflow: "hidden",
      }}
    >
      {item.description}
    </p>

    <div
      style={{
        marginTop: "auto",
        paddingTop: "24px",
      }}
    >
      <button
        style={{
          background: "#ef4444",
          color: "white",
          border: "none",
          borderRadius: "14px",
          padding: "14px 24px",
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        Подробнее
      </button>
    </div>
  </div>
</div>
</Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}