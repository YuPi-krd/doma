"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL =
  "https://doma-nq4u.onrender.com";

const propertyTypes = [
  {
    value: "apartment",
    label: "Квартира",
  },
  {
    value: "new_building",
    label: "Квартира в новостройке",
  },
  {
    value: "house",
    label: "Дом",
  },
  {
    value: "land",
    label: "Земельный участок",
  },
  {
    value: "commercial",
    label: "Коммерческая недвижимость",
  },
  {
    value: "garage",
    label: "Гараж",
  },
];

export default function NewPropertyPage() {
  const router = useRouter();

  const [title, setTitle] =
    useState("ЖК Самолёт");

  const [propertyType, setPropertyType] =
    useState("apartment");

  const [price, setPrice] =
    useState("6000000");

  const [area, setArea] =
    useState("75");

  const [rooms, setRooms] =
    useState("3");

  const [city, setCity] =
    useState("Краснодар");

  const [district, setDistrict] =
    useState("Центральный");

  const [address, setAddress] =
    useState("ул. Красная 1");

  const [imageUrl, setImageUrl] =
    useState("/images/test-flat.jpg");

  const [description, setDescription] =
    useState("");

  const [status, setStatus] =
    useState("Свободен");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  // ============================================================
  // Сохранение
  // ============================================================

  async function handleSubmit(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();

      formData.append(
        "title",
        title
      );

      formData.append(
        "property_type",
        propertyType
      );

      formData.append(
        "price",
        price
      );

      formData.append(
        "area",
        area
      );

      formData.append(
        "rooms",
        rooms
      );

      formData.append(
        "city",
        city
      );

      formData.append(
        "district",
        district
      );

      formData.append(
        "address",
        address
      );

      formData.append(
        "image_url",
        imageUrl
      );

      formData.append(
        "description",
        description
      );

      formData.append(
        "status",
        status
      );

      const token =
        localStorage.getItem(
          "token"
        );

      const headers: HeadersInit = {};

      if (token) {
        headers.Authorization =
          `Bearer ${token}`;
      }

      const response =
        await fetch(
          `${API_URL}/properties`,
          {
            method: "POST",
            headers,
            body: formData,
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            "Не удалось сохранить объект"
        );
      }

      router.push(
        "/admin/properties"
      );

      router.refresh();
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Произошла ошибка"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        padding: "40px 20px 70px",
      }}
    >
      <div
        style={{
          maxWidth: "1000px",
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
              margin: 0,
              fontSize:
                "clamp(36px, 5vw, 48px)",
              fontWeight: 700,
              color: "#111827",
              letterSpacing:
                "-1px",
            }}
          >
            🏠 Новый объект
          </h1>

          <p
            style={{
              marginTop: "10px",
              marginBottom: 0,
              color: "#64748b",
              fontSize: "16px",
            }}
          >
            Добавьте новый объект
            недвижимости в каталог
          </p>
        </div>

        {/* ================================================== */}
        {/* Форма */}
        {/* ================================================== */}

        <form
          onSubmit={handleSubmit}
          style={{
            background:
              "#ffffff",
            borderRadius:
              "26px",
            padding:
              "36px",
            boxShadow:
              "0 12px 35px rgba(0,0,0,.06)",
          }}
        >
          {/* Сообщение об ошибке */}

          {error && (
            <div
              style={{
                background:
                  "#fee2e2",
                color:
                  "#991b1b",
                borderRadius:
                  "14px",
                padding:
                  "14px 16px",
                marginBottom:
                  "24px",
                fontWeight:
                  500,
              }}
            >
              {error}
            </div>
          )}

          {/* ================================================= */}
          {/* ОСНОВНЫЕ ПОЛЯ */}
          {/* ================================================= */}

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "1fr 1fr",
              gap: "24px",
            }}
          >
            {/* Название */}

            <div>
              <label
                style={labelStyle}
              >
                Название объекта
              </label>

              <input
                required
                value={title}
                onChange={(e) =>
                  setTitle(
                    e.target.value
                  )
                }
                placeholder="ЖК Самолёт"
                style={inputStyle}
              />
            </div>

            {/* Тип недвижимости */}

            <div>
              <label
                style={labelStyle}
              >
                Тип недвижимости
              </label>

              <select
                required
                value={
                  propertyType
                }
                onChange={(e) =>
                  setPropertyType(
                    e.target.value
                  )
                }
                style={{
                  ...inputStyle,
                  cursor:
                    "pointer",
                  background:
                    "#ffffff",
                }}
              >
                {propertyTypes.map(
                  (type) => (
                    <option
                      key={
                        type.value
                      }
                      value={
                        type.value
                      }
                    >
                      {type.label}
                    </option>
                  )
                )}
              </select>
            </div>

            {/* Цена */}

            <div>
              <label
                style={labelStyle}
              >
                Цена
              </label>

              <input
                required
                type="number"
                min="0"
                value={price}
                onChange={(e) =>
                  setPrice(
                    e.target.value
                  )
                }
                placeholder="6000000"
                style={inputStyle}
              />
            </div>

            {/* Площадь */}

            <div>
              <label
                style={labelStyle}
              >
                Площадь (м²)
              </label>

              <input
                type="number"
                min="0"
                step="0.1"
                value={area}
                onChange={(e) =>
                  setArea(
                    e.target.value
                  )
                }
                placeholder="75"
                style={inputStyle}
              />
            </div>

            {/* Комнаты */}

            <div>
              <label
                style={labelStyle}
              >
                Количество комнат
              </label>

              <input
                type="number"
                min="0"
                value={rooms}
                onChange={(e) =>
                  setRooms(
                    e.target.value
                  )
                }
                placeholder="3"
                style={inputStyle}
              />
            </div>

            {/* Статус */}

            <div>
              <label
                style={labelStyle}
              >
                Статус
              </label>

              <select
                value={status}
                onChange={(e) =>
                  setStatus(
                    e.target.value
                  )
                }
                style={{
                  ...inputStyle,
                  cursor:
                    "pointer",
                  background:
                    "#ffffff",
                }}
              >
                <option value="Свободен">
                  Свободен
                </option>

                <option value="Забронирован">
                  Забронирован
                </option>

                <option value="Продан">
                  Продан
                </option>

                <option value="Скрыт">
                  Скрыт
                </option>
              </select>
            </div>

            {/* Город */}

            <div>
              <label
                style={labelStyle}
              >
                Город
              </label>

              <input
                required
                value={city}
                onChange={(e) =>
                  setCity(
                    e.target.value
                  )
                }
                placeholder="Краснодар"
                style={inputStyle}
              />
            </div>

            {/* Район */}

            <div>
              <label
                style={labelStyle}
              >
                Район
              </label>

              <input
                value={district}
                onChange={(e) =>
                  setDistrict(
                    e.target.value
                  )
                }
                placeholder="Центральный"
                style={inputStyle}
              />
            </div>
          </div>

          {/* ================================================= */}
          {/* АДРЕС */}
          {/* ================================================= */}

          <div
            style={{
              marginTop: "24px",
            }}
          >
            <label
              style={labelStyle}
            >
              Адрес
            </label>

            <input
              value={address}
              onChange={(e) =>
                setAddress(
                  e.target.value
                )
              }
              placeholder="ул. Красная 1"
              style={inputStyle}
            />
          </div>

          {/* ================================================= */}
          {/* ПУТЬ К ФОТО */}
          {/* ================================================= */}

          <div
            style={{
              marginTop: "24px",
            }}
          >
            <label
              style={labelStyle}
            >
              Путь к фото
            </label>

            <input
              value={imageUrl}
              onChange={(e) =>
                setImageUrl(
                  e.target.value
                )
              }
              placeholder="/images/test-flat.jpg"
              style={inputStyle}
            />
          </div>

          {/* ================================================= */}
          {/* ОПИСАНИЕ */}
          {/* ================================================= */}

          <div
            style={{
              marginTop: "24px",
            }}
          >
            <label
              style={labelStyle}
            >
              Описание
            </label>

            <textarea
              value={description}
              onChange={(e) =>
                setDescription(
                  e.target.value
                )
              }
              placeholder="Описание объекта..."
              rows={7}
              style={{
                ...inputStyle,
                resize:
                  "vertical",
                minHeight:
                  "170px",
              }}
            />
          </div>

          {/* ================================================= */}
          {/* КНОПКА */}
          {/* ================================================= */}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              marginTop: "28px",
              border: "none",
              borderRadius:
                "15px",
              padding:
                "17px 24px",
              background:
                loading
                  ? "#fca5a5"
                  : "#ef4444",
              color:
                "#ffffff",
              fontSize:
                "17px",
              fontWeight: 700,
              cursor:
                loading
                  ? "not-allowed"
                  : "pointer",
              transition:
                ".2s",
            }}
          >
            {loading
              ? "Сохраняем..."
              : "💾 Сохранить объект"}
          </button>
        </form>
      </div>

      {/* ==================================================== */}
      {/* АДАПТИВ */}
      {/* ==================================================== */}

      <style jsx>{`
        @media (max-width: 700px) {
          main {
            padding: 25px 14px 50px !important;
          }

          form {
            padding: 22px !important;
          }

          form > div:first-of-type {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </main>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  marginBottom: "8px",
  color: "#111827",
  fontSize: "15px",
  fontWeight: 500,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding:
    "15px 16px",
  border:
    "1px solid #dbe3ec",
  borderRadius:
    "12px",
  background:
    "#ffffff",
  color: "#111827",
  fontSize: "15px",
  outline: "none",
};