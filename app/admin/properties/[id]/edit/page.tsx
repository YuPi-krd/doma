"use client";

import {
  useEffect,
  useState,
  type CSSProperties,
  type FormEvent,
} from "react";
import {
  useParams,
  useRouter,
} from "next/navigation";

const API_URL =
  "https://doma-nq4u.onrender.com";

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

type DealType =
  | "sale"
  | "rent"
  | "lease";

interface Property {
  id: number;
  title: string;
  description?: string | null;
  price?: number | null;
  area?: number | null;
  rooms?: number | null;
  city?: string | null;
  district?: string | null;
  address?: string | null;
  status?: string | null;
  image_url?: string | null;

  property_type?: string | null;
  property_subtype?: string | null;
  deal_type?: string | null;
}

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

const categorySlugs: Record<
  PropertyType,
  string
> = {
  apartment: "apartments",
  house: "houses",
  land: "land",
  commercial: "commercial",
  garage: "garages",
};

function normalizePropertyType(
  type?: string | null
): PropertyType {
  if (type === "house") return "house";
  if (type === "land") return "land";
  if (type === "commercial") return "commercial";
  if (type === "garage") return "garage";

  // Старые записи могли хранить new_building
  // как property_type.
  return "apartment";
}

function normalizeDealType(
  type?: string | null
): DealType {
  if (type === "rent") return "rent";
  if (type === "lease") return "lease";

  return "sale";
}

function getDefaultSubtype(
  propertyType: PropertyType
): PropertySubtype {
  return subtypesByType[propertyType][0]
    .value;
}

function normalizeSubtype(
  propertyType: PropertyType,
  subtype?: string | null
): PropertySubtype {
  const available =
    subtypesByType[propertyType];

  const found = available.find(
    (item) => item.value === subtype
  );

  if (found) {
    return found.value;
  }

  return getDefaultSubtype(propertyType);
}

function getTypeLabel(
  propertyType: PropertyType
) {
  return (
    propertyTypes.find(
      (item) =>
        item.value === propertyType
    )?.label ?? propertyType
  );
}

function getSubtypeLabel(
  propertyType: PropertyType,
  propertySubtype: PropertySubtype
) {
  return (
    subtypesByType[propertyType].find(
      (item) =>
        item.value === propertySubtype
    )?.label ?? propertySubtype
  );
}

function getDealLabel(
  dealType: DealType
) {
  return (
    dealTypes.find(
      (item) =>
        item.value === dealType
    )?.label ?? dealType
  );
}

export default function EditPropertyPage() {
  const router = useRouter();
  const params = useParams();

  const rawId = params.id;

  const id = Array.isArray(rawId)
    ? rawId[0]
    : rawId;

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [imageFile, setImageFile] =
    useState<File | null>(null);

  const [error, setError] =
    useState("");

  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    area: "",
    rooms: "",
    city: "",
    district: "",
    address: "",
    status: "Свободен",
  });

  const [propertyType, setPropertyType] =
    useState<PropertyType>("apartment");

  const [propertySubtype, setPropertySubtype] =
    useState<PropertySubtype>("secondary");

  const [dealType, setDealType] =
    useState<DealType>("sale");

  useEffect(() => {
    if (id) {
      loadProperty();
    }
  }, [id]);

  async function loadProperty() {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(
        `${API_URL}/properties/${id}`,
        {
          cache: "no-store",
        }
      );

      if (!res.ok) {
        throw new Error(
          "Объект не найден"
        );
      }

      const data: Property =
        await res.json();

      let normalizedType =
        normalizePropertyType(
          data.property_type
        );

      let normalizedSubtype =
        normalizeSubtype(
          normalizedType,
          data.property_subtype
        );

      /*
       * Поддержка старых объявлений,
       * где new_building хранился
       * в property_type.
       */
      if (
        data.property_type ===
        "new_building"
      ) {
        normalizedType = "apartment";
        normalizedSubtype =
          "new_building";
      }

      setPropertyType(normalizedType);

      setPropertySubtype(
        normalizedSubtype
      );

      setDealType(
        normalizeDealType(
          data.deal_type
        )
      );

      setForm({
        title: data.title || "",
        description:
          data.description || "",
        price:
          data.price != null
            ? String(data.price)
            : "",
        area:
          data.area != null
            ? String(data.area)
            : "",
        rooms:
          data.rooms != null
            ? String(data.rooms)
            : "",
        city: data.city || "",
        district:
          data.district || "",
        address:
          data.address || "",
        status:
          data.status || "Свободен",
      });
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Не удалось загрузить объект"
      );
    } finally {
      setLoading(false);
    }
  }

  function updateField(
    field: keyof typeof form,
    value: string
  ) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function handleTypeChange(
    newType: PropertyType
  ) {
    setPropertyType(newType);

    const newSubtype =
      getDefaultSubtype(newType);

    setPropertySubtype(
      newSubtype
    );

    if (
      newType === "land" ||
      newType === "commercial" ||
      newType === "garage"
    ) {
      updateField("rooms", "0");
    } else if (
      form.rooms === "0"
    ) {
      updateField("rooms", "1");
    }
  }

  async function saveProperty(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setSaving(true);
    setError("");

    try {
      const formData =
        new FormData();

      formData.append(
        "title",
        form.title
      );

      formData.append(
        "description",
        form.description
      );

      formData.append(
        "price",
        form.price
      );

      formData.append(
        "area",
        form.area || "0"
      );

      formData.append(
        "rooms",
        form.rooms || "0"
      );

      formData.append(
        "city",
        form.city
      );

      formData.append(
        "district",
        form.district
      );

      formData.append(
        "address",
        form.address
      );

      formData.append(
        "status",
        form.status
      );

      formData.append(
        "property_type",
        propertyType
      );

      formData.append(
        "property_subtype",
        propertySubtype
      );

      formData.append(
        "deal_type",
        dealType
      );

      if (imageFile) {
        formData.append(
          "image",
          imageFile
        );
      }

      const token =
        localStorage.getItem("token");

      const headers: HeadersInit = {};

      if (token) {
        headers.Authorization =
          `Bearer ${token}`;
      }

      const res = await fetch(
        `${API_URL}/properties/${id}`,
        {
          method: "PUT",
          headers,
          body: formData,
        }
      );

      const responseText =
        await res.text();

      let data: any = null;

      try {
        data = responseText
          ? JSON.parse(responseText)
          : null;
      } catch {
        data = null;
      }

      if (!res.ok) {
        let message =
          "Ошибка сохранения";

        if (
          typeof data?.detail ===
          "string"
        ) {
          message = data.detail;
        } else if (
          Array.isArray(data?.detail)
        ) {
          message = data.detail
            .map(
              (item: any) =>
                item?.msg ??
                "Ошибка в данных"
            )
            .join(", ");
        } else if (
          responseText
        ) {
          message = responseText;
        }

        throw new Error(message);
      }

      router.push(
        `/admin/properties/${id}`
      );

      router.refresh();
    } catch (err) {
      console.error(err);

      const message =
        err instanceof Error
          ? err.message
          : "Не удалось сохранить объект";

      setError(message);

      alert(message);
    } finally {
      setSaving(false);
    }
  }

  const catalogPath =
    `/catalog/${dealType}/${categorySlugs[propertyType]}/${propertySubtype}`;

  const availableSubtypes =
    subtypesByType[propertyType];

  if (loading) {
    return (
      <main className="loading-page">
        <div className="loading-box">
          Загрузка объекта...
        </div>

        <style jsx>{`
          .loading-page {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #f8fafc;
          }

          .loading-box {
            color: #64748b;
            font-size: 18px;
          }
        `}</style>
      </main>
    );
  }

  return (
    <main className="page">
      <div className="container">
        <div className="header">
          <div>
            <h1>
              ✏️ Редактирование
              объекта
            </h1>

            <p>
              Измените параметры
              объявления и его
              положение в каталоге
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              router.push(
                `/admin/properties/${id}`
              )
            }
            className="back-button"
          >
            ← Назад
          </button>
        </div>

        <form
          onSubmit={saveProperty}
          className="form"
        >
          {error && (
            <div className="error">
              {error}
            </div>
          )}

          <div className="section-title">
            Основные параметры
          </div>

          <div className="grid">
            {/* Название */}

            <div>
              <label
                style={labelStyle}
              >
                Название объекта
              </label>

              <input
                required
                value={form.title}
                onChange={(e) =>
                  updateField(
                    "title",
                    e.target.value
                  )
                }
                placeholder="Название объекта"
                style={inputStyle}
              />
            </div>

            {/* Операция */}

            <div>
              <label
                style={labelStyle}
              >
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
                {dealTypes.map(
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

            {/* Тип */}

            <div>
              <label
                style={labelStyle}
              >
                Тип недвижимости
              </label>

              <select
                required
                value={propertyType}
                onChange={(e) =>
                  handleTypeChange(
                    e.target
                      .value as PropertyType
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
              <label
                style={labelStyle}
              >
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
                      key={
                        subtype.value
                      }
                      value={
                        subtype.value
                      }
                    >
                      {subtype.label}
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
                value={form.price}
                onChange={(e) =>
                  updateField(
                    "price",
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
                value={form.area}
                onChange={(e) =>
                  updateField(
                    "area",
                    e.target.value
                  )
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
                  value={form.rooms}
                  onChange={(e) =>
                    updateField(
                      "rooms",
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
              <label
                style={labelStyle}
              >
                Статус
              </label>

              <select
                value={form.status}
                onChange={(e) =>
                  updateField(
                    "status",
                    e.target.value
                  )
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
              <label
                style={labelStyle}
              >
                Город
              </label>

              <input
                required
                value={form.city}
                onChange={(e) =>
                  updateField(
                    "city",
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
                value={form.district}
                onChange={(e) =>
                  updateField(
                    "district",
                    e.target.value
                  )
                }
                placeholder="Центральный"
                style={inputStyle}
              />
            </div>
          </div>

          {/* Куда попадёт */}

          <div className="catalog-preview">
            <div className="preview-label">
              Раздел каталога
            </div>

            <div className="preview-title">
              {getDealLabel(dealType)}
              {" → "}
              {getTypeLabel(
                propertyType
              )}
              {" → "}
              {getSubtypeLabel(
                propertyType,
                propertySubtype
              )}
            </div>

            <div className="preview-path">
              {catalogPath}
            </div>
          </div>

          {/* Адрес */}

          <div className="full-field">
            <label
              style={labelStyle}
            >
              Адрес
            </label>

            <input
              value={form.address}
              onChange={(e) =>
                updateField(
                  "address",
                  e.target.value
                )
              }
              placeholder="ул. Красная 1"
              style={inputStyle}
            />
          </div>

          {/* Фото */}

          <div className="full-field">
            <label
              style={labelStyle}
            >
              📷 Новое фото
            </label>

            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setImageFile(
                  e.target.files?.[0] ??
                    null
                )
              }
              style={fileInputStyle}
            />

            {imageFile && (
              <div className="selected-file">
                Выбрано:{" "}
                {imageFile.name}
              </div>
            )}
          </div>

          {/* Описание */}

          <div className="full-field">
            <label
              style={labelStyle}
            >
              Описание
            </label>

            <textarea
              rows={7}
              value={form.description}
              onChange={(e) =>
                updateField(
                  "description",
                  e.target.value
                )
              }
              placeholder="Описание объекта..."
              style={{
                ...inputStyle,
                resize: "vertical",
                minHeight: "170px",
              }}
            />
          </div>

          {/* Кнопка */}

          <button
            type="submit"
            disabled={saving}
            className="save-button"
          >
            {saving
              ? "Сохраняем..."
              : "💾 Сохранить изменения"}
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
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 30px;
        }

        .header h1 {
          margin: 0;
          font-size: clamp(34px, 5vw, 46px);
          line-height: 1.05;
          font-weight: 700;
          color: #111827;
          letter-spacing: -1px;
        }

        .header p {
          margin: 12px 0 0;
          color: #64748b;
          font-size: 16px;
        }

        .back-button {
          border: 1px solid #dbe3ec;
          background: #ffffff;
          color: #111827;
          border-radius: 12px;
          padding: 12px 16px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
        }

        .form {
          background: #ffffff;
          padding: 36px;
          border-radius: 26px;
          box-shadow:
            0 12px 35px rgba(0, 0, 0, 0.06);
        }

        .section-title {
          margin-bottom: 20px;
          font-size: 20px;
          font-weight: 700;
          color: #111827;
        }

        .grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 22px;
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

        .catalog-preview {
          margin-top: 28px;
          padding: 20px;
          border-radius: 16px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
        }

        .preview-label {
          color: #64748b;
          font-size: 13px;
          margin-bottom: 7px;
        }

        .preview-title {
          color: #111827;
          font-size: 16px;
          font-weight: 700;
        }

        .preview-path {
          margin-top: 8px;
          color: #94a3b8;
          font-size: 13px;
          word-break: break-all;
        }

        .selected-file {
          margin-top: 8px;
          color: #64748b;
          font-size: 13px;
        }

        .save-button {
          width: 100%;
          margin-top: 28px;
          border: none;
          border-radius: 15px;
          padding: 17px 24px;
          background: ${saving
            ? "#93c5fd"
            : "#2563eb"};
          color: #ffffff;
          font-size: 17px;
          font-weight: 700;
          cursor: ${saving
            ? "not-allowed"
            : "pointer"};
          transition: 0.2s;
        }

        .save-button:hover {
          opacity: ${saving
            ? "1"
            : "0.92"};
        }

        @media (max-width: 700px) {
          .page {
            padding: 25px 14px 50px;
          }

          .form {
            padding: 22px;
          }

          .grid {
            grid-template-columns: 1fr;
          }

          .header {
            flex-direction: column;
          }

          .back-button {
            width: 100%;
          }
        }
      `}</style>
    </main>
  );
}

const labelStyle: CSSProperties = {
  display: "block",
  marginBottom: "8px",
  color: "#111827",
  fontSize: "15px",
  fontWeight: 600,
};

const inputStyle: CSSProperties = {
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

const selectStyle: CSSProperties = {
  ...inputStyle,
  cursor: "pointer",
};

const fileInputStyle: CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: "12px",
  border: "1px dashed #cbd5e1",
  borderRadius: "12px",
  background: "#f8fafc",
  color: "#475569",
};