"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = "https://doma-nq4u.onrender.com";

type PropertyType =
  | "apartment"
  | "house"
  | "land"
  | "commercial"
  | "garage";

type PropertySubtype =
  | "secondary"
  | "new_building"
  | "studio"
  | "1_room"
  | "2_room"
  | "3_room"
  | "4_room"
  | "5_room"
  | "penthouse"
  | "house"
  | "part_of_house"
  | "townhouse"
  | "duplex"
  | "cottage"
  | "dacha"
  | "izhs"
  | "gardening"
  | "commercial_land"
  | "lph"
  | "dnp"
  | "office"
  | "business"
  | "separate_building"
  | "production"
  | "warehouse"
  | "retail"
  | "garage_box"
  | "residential_complex"
  | "covered_parking"
  | "separate_garage"
  | "parking";

type DealType = "sale" | "rent" | "lease";

const propertyTypes: {
  value: PropertyType;
  label: string;
}[] = [
  {
    value: "apartment",
    label: "Квартира",
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

const subtypesByType: Record<
  PropertyType,
  {
    value: PropertySubtype;
    label: string;
  }[]
> = {
  apartment: [
    {
      value: "secondary",
      label: "Вторичное жильё",
    },
    {
      value: "new_building",
      label: "Новостройка",
    },
    {
      value: "studio",
      label: "Студия",
    },
    {
      value: "1_room",
      label: "1-комнатная",
    },
    {
      value: "2_room",
      label: "2-комнатная",
    },
    {
      value: "3_room",
      label: "3-комнатная",
    },
    {
      value: "4_room",
      label: "4-комнатная",
    },
    {
      value: "5_room",
      label: "5-комнатная",
    },
    {
      value: "penthouse",
      label: "Пентхаус",
    },
  ],

  house: [
    {
      value: "house",
      label: "Частный дом",
    },
    {
      value: "part_of_house",
      label: "Часть дома",
    },
    {
      value: "townhouse",
      label: "Таунхаус",
    },
    {
      value: "duplex",
      label: "Дуплекс",
    },
    {
      value: "cottage",
      label: "Коттедж",
    },
    {
      value: "dacha",
      label: "Дача",
    },
  ],

  land: [
    {
      value: "izhs",
      label: "ИЖС",
    },
    {
      value: "gardening",
      label: "Садовый участок",
    },
    {
      value: "commercial_land",
      label: "Земля под коммерцию",
    },
    {
      value: "lph",
      label: "ЛПХ",
    },
    {
      value: "dnp",
      label: "ДНП",
    },
  ],

  commercial: [
    {
      value: "office",
      label: "Офис",
    },
    {
      value: "business",
      label: "Бизнес",
    },
    {
      value: "separate_building",
      label: "Отдельное здание",
    },
    {
      value: "production",
      label: "Производство",
    },
    {
      value: "warehouse",
      label: "Склад",
    },
    {
      value: "retail",
      label: "Торговое помещение",
    },
  ],

  garage: [
    {
      value: "garage_box",
      label: "Гаражный бокс",
    },
    {
      value: "residential_complex",
      label: "Гараж в ГСК",
    },
    {
      value: "covered_parking",
      label: "Крытая парковка",
    },
    {
      value: "separate_garage",
      label: "Отдельный гараж",
    },
    {
      value: "parking",
      label: "Парковочное место",
    },
  ],
};

const dealTypes: {
  value: DealType;
  label: string;
}[] = [
  {
    value: "sale",
    label: "Продажа",
  },
  {
    value: "rent",
    label: "Аренда",
  },
  {
    value: "lease",
    label: "Сдача в аренду",
  },
];

const categorySlugs: Record<PropertyType, string> = {
  apartment: "apartments",
  house: "houses",
  land: "land",
  commercial: "commercial",
  garage: "garages",
};

function getDefaultSubtype(
  propertyType: PropertyType
): PropertySubtype {
  return subtypesByType[propertyType][0].value;
}

function getSubtypeLabel(
  propertyType: PropertyType,
  propertySubtype: PropertySubtype
) {
  const subtype = subtypesByType[propertyType].find(
    (item) => item.value === propertySubtype
  );

  return subtype?.label ?? propertySubtype;
}

function getTypeLabel(propertyType: PropertyType) {
  return (
    propertyTypes.find(
      (item) => item.value === propertyType
    )?.label ?? propertyType
  );
}

function getDealLabel(dealType: DealType) {
  return (
    dealTypes.find(
      (item) => item.value === dealType
    )?.label ?? dealType
  );
}

export default function NewPropertyPage() {
  const router = useRouter();

  const [title, setTitle] = useState("ЖК Самолёт");

  const [propertyType, setPropertyType] =
    useState<PropertyType>("apartment");

  const [propertySubtype, setPropertySubtype] =
    useState<PropertySubtype>("secondary");

  const [dealType, setDealType] =
    useState<DealType>("sale");

  const [price, setPrice] = useState("6000000");

  const [area, setArea] = useState("75");

  const [rooms, setRooms] = useState("3");

  const [city, setCity] = useState("Краснодар");

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

  const [error, setError] = useState("");

  function handlePropertyTypeChange(
    newType: PropertyType
  ) {
    setPropertyType(newType);

    setPropertySubtype(
      getDefaultSubtype(newType)
    );

    if (
      newType === "land" ||
      newType === "commercial" ||
      newType === "garage"
    ) {
      setRooms("0");
    } else if (rooms === "0") {
      setRooms("1");
    }
  }

  const availableSubtypes =
    subtypesByType[propertyType];

  const catalogPath = `/catalog/${dealType}/${categorySlugs[propertyType]}/${propertySubtype}`;

  async function handleSubmit(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();

      formData.append("title", title);
      formData.append(
        "property_type",
        propertyType
      );
      formData.append(
        "property_subtype",
        propertySubtype
      );
      formData.append("deal_type", dealType);

      formData.append("price", price);
      formData.append("area", area);

      formData.append(
        "rooms",
        rooms || "0"
      );

      formData.append("city", city);
      formData.append("district", district);
      formData.append("address", address);

      formData.append(
        "image_url",
        imageUrl
      );

      formData.append(
        "description",
        description
      );

      formData.append("status", status);

      const token =
        localStorage.getItem("token");

      const headers: HeadersInit = {};

      if (token) {
        headers.Authorization =
          `Bearer ${token}`;
      }

      const response = await fetch(
        `${API_URL}/properties`,
        {
          method: "POST",
          headers,
          body: formData,
        }
      );

      const responseText =
        await response.text();

      let data: any = null;

      try {
        data = responseText
          ? JSON.parse(responseText)
          : null;
      } catch {
        data = null;
      }

      if (!response.ok) {
        let message =
          "Не удалось сохранить объект";

        if (typeof data?.detail === "string") {
          message = data.detail;
        } else if (Array.isArray(data?.detail)) {
          message = data.detail
            .map(
              (item: any) =>
                item?.msg ?? "Ошибка в данных"
            )
            .join(", ");
        } else if (responseText) {
          message = responseText;
        }

        throw new Error(message);
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
    <main className="page">
      <div className="container">
        <div className="header">
          <h1>🏠 Новый объект</h1>

          <p>
            Добавьте новый объект
            недвижимости в каталог
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="form"
        >
          {error && (
            <div className="error">
              {error}
            </div>
          )}

          {/* ОСНОВНЫЕ ПАРАМЕТРЫ */}

          <div className="section-title">
            Основные параметры
          </div>

          <div className="main-grid">
            {/* Название */}

            <div>
              <label style={labelStyle}>
                Название объекта
              </label>

              <input
                required
                value={title}
                onChange={(e) =>
                  setTitle(e.target.value)
                }
                placeholder="ЖК Самолёт"
                style={inputStyle}
              />
            </div>

            {/* Операция */}

            <div>
              <label style={labelStyle}>
                Операция
              </label>

              <select
                required
                value={dealType}
                onChange={(e) =>
                  setDealType(
                    e.target.value as DealType
                  )
                }
                style={selectStyle}
              >
                {dealTypes.map((type) => (
                  <option
                    key={type.value}
                    value={type.value}
                  >
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Тип */}

            <div>
              <label style={labelStyle}>
                Тип недвижимости
              </label>

              <select
                required
                value={propertyType}
                onChange={(e) =>
                  handlePropertyTypeChange(
                    e.target.value as PropertyType
                  )
                }
                style={selectStyle}
              >
                {propertyTypes.map(
                  (type) => (
                    <option
                      key={type.value}
                      value={type.value}
                    >
                      {type.label}
                    </option>
                  )
                )}
              </select>
            </div>

            {/* Подтип */}

            <div>
              <label style={labelStyle}>
                Подтип недвижимости
              </label>

              <select
                required
                value={propertySubtype}
                onChange={(e) =>
                  setPropertySubtype(
                    e.target
                      .value as PropertySubtype
                  )
                }
                style={selectStyle}
              >
                {availableSubtypes.map(
                  (subtype) => (
                    <option
                      key={subtype.value}
                      value={subtype.value}
                    >
                      {subtype.label}
                    </option>
                  )
                )}
              </select>
            </div>

            {/* Цена */}

            <div>
              <label style={labelStyle}>
                Цена
              </label>

              <input
                required
                type="number"
                min="0"
                value={price}
                onChange={(e) =>
                  setPrice(e.target.value)
                }
                placeholder="6000000"
                style={inputStyle}
              />
            </div>

            {/* Площадь */}

            <div>
              <label style={labelStyle}>
                Площадь (м²)
              </label>

              <input
                type="number"
                min="0"
                step="0.1"
                value={area}
                onChange={(e) =>
                  setArea(e.target.value)
                }
                placeholder="75"
                style={inputStyle}
              />
            </div>

            {/* Комнаты */}

            {(propertyType ===
              "apartment" ||
              propertyType ===
                "house") && (
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
            )}

            {/* Статус */}

            <div>
              <label style={labelStyle}>
                Статус
              </label>

              <select
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value)
                }
                style={selectStyle}
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
              <label style={labelStyle}>
                Город
              </label>

              <input
                required
                value={city}
                onChange={(e) =>
                  setCity(e.target.value)
                }
                placeholder="Краснодар"
                style={inputStyle}
              />
            </div>

            {/* Район */}

            <div>
              <label style={labelStyle}>
                Район
              </label>

              <input
                value={district}
                onChange={(e) =>
                  setDistrict(e.target.value)
                }
                placeholder="Центральный"
                style={inputStyle}
              />
            </div>
          </div>

          {/* ПРЕДПРОСМОТР КАТАЛОГА */}

          <div className="catalog-preview">
            <div className="catalog-preview-title">
              Объявление попадёт в раздел
            </div>

            <div className="catalog-preview-main">
              {getDealLabel(dealType)}
              {" → "}
              {getTypeLabel(propertyType)}
              {" → "}
              {getSubtypeLabel(
                propertyType,
                propertySubtype
              )}
            </div>

            <div className="catalog-preview-path">
              {catalogPath}
            </div>
          </div>

          {/* АДРЕС */}

          <div className="full-field">
            <label style={labelStyle}>
              Адрес
            </label>

            <input
              value={address}
              onChange={(e) =>
                setAddress(e.target.value)
              }
              placeholder="ул. Красная 1"
              style={inputStyle}
            />
          </div>

          {/* ФОТО */}

          <div className="full-field">
            <label style={labelStyle}>
              Путь к фото
            </label>

            <input
              value={imageUrl}
              onChange={(e) =>
                setImageUrl(e.target.value)
              }
              placeholder="/images/test-flat.jpg"
              style={inputStyle}
            />

            <div className="hint">
              Например: /images/test-flat.jpg
            </div>
          </div>

          {/* ОПИСАНИЕ */}

          <div className="full-field">
            <label style={labelStyle}>
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
                resize: "vertical",
                minHeight: "170px",
              }}
            />
          </div>

          {/* КНОПКА */}

          <button
            type="submit"
            disabled={loading}
            className="submit"
          >
            {loading
              ? "Сохраняем..."
              : "💾 Сохранить объект"}
          </button>
        </form>
      </div>

      <style jsx>{`
        .page {
          min-height: 100vh;
          background: #f8fafc;
          padding: 40px 20px 70px;
        }

        .container {
          max-width: 1000px;
          margin: 0 auto;
        }

        .header {
          margin-bottom: 30px;
        }

        .header h1 {
          margin: 0;
          font-size: clamp(36px, 5vw, 48px);
          font-weight: 700;
          color: #111827;
          letter-spacing: -1px;
        }

        .header p {
          margin-top: 10px;
          margin-bottom: 0;
          color: #64748b;
          font-size: 16px;
        }

        .form {
          background: #ffffff;
          border-radius: 26px;
          padding: 36px;
          box-shadow:
            0 12px 35px rgba(0, 0, 0, 0.06);
        }

        .section-title {
          margin-bottom: 20px;
          color: #111827;
          font-size: 20px;
          font-weight: 700;
        }

        .main-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }

        .full-field {
          margin-top: 24px;
        }

        .error {
          background: #fee2e2;
          color: #991b1b;
          border-radius: 14px;
          padding: 14px 16px;
          margin-bottom: 24px;
          font-weight: 500;
        }

        .hint {
          margin-top: 7px;
          color: #94a3b8;
          font-size: 13px;
        }

        .catalog-preview {
          margin-top: 28px;
          padding: 20px;
          border-radius: 16px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
        }

        .catalog-preview-title {
          color: #64748b;
          font-size: 13px;
          margin-bottom: 7px;
        }

        .catalog-preview-main {
          color: #111827;
          font-size: 16px;
          font-weight: 700;
        }

        .catalog-preview-path {
          margin-top: 8px;
          color: #94a3b8;
          font-size: 13px;
          word-break: break-all;
        }

        .submit {
          width: 100%;
          margin-top: 28px;
          border: none;
          border-radius: 15px;
          padding: 17px 24px;
          background: ${loading
            ? "#fca5a5"
            : "#ef4444"};
          color: #ffffff;
          font-size: 17px;
          font-weight: 700;
          cursor: ${loading
            ? "not-allowed"
            : "pointer"};
          transition: 0.2s;
        }

        .submit:hover {
          opacity: ${loading ? "1" : "0.92"};
        }

        @media (max-width: 700px) {
          .page {
            padding: 25px 14px 50px;
          }

          .form {
            padding: 22px;
          }

          .main-grid {
            grid-template-columns: 1fr;
          }

          .header h1 {
            font-size: 36px;
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
  padding: "15px 16px",
  border: "1px solid #dbe3ec",
  borderRadius: "12px",
  background: "#ffffff",
  color: "#111827",
  fontSize: "15px",
  outline: "none",
};

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  cursor: "pointer",
};