"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

<<<<<<< HEAD
=======
// ============================================================
// ТИПЫ
// ============================================================

>>>>>>> dee4ecb (Add address geocoding)
type Category = {
  title: string;
  items: string[];
};

<<<<<<< HEAD
=======
type ApplicationType =
  | "Продать"
  | "Снять"
  | "Сдать";

// ============================================================
// ОСНОВНЫЕ КАТЕГОРИИ
// ============================================================

const propertyTypes = [
  "Квартиры",
  "Дома",
  "Земельные участки",
  "Коммерция",
  "Гаражи",
];

// ============================================================
// ПОДТИПЫ
// ============================================================

const subTypes: Record<
  string,
  string[]
> = {
  Квартиры: [
    "Квартиры",
    "Квартиры во вторичке",
    "Квартиры в новостройке",
    "Квартиры от застройщика",
    "Студии",
    "1-комнатные",
    "2-комнатные",
    "3-комнатные",
    "4-комнатные",
    "Пентхаусы",
  ],

  Дома: [
    "Дом",
    "Часть дома",
    "Таунхаус",
    "Дуплекс",
    "Коттедж",
    "Дача",
  ],

  "Земельные участки": [
    "ИЖС",
    "Садоводство",
    "Коммерческое",
    "Личное подсобное хозяйство",
    "ДНП",
  ],

  Коммерция: [
    "Офисное",
    "Готовый бизнес",
    "Отдельное здание",
    "Производственное",
    "Складское",
    "Торговое помещение",
  ],

  Гаражи: [
    "Бокс в гаражном кооперативе",
    "Внутри жилого комплекса",
    "Крытая стоянка",
    "Отдельно стоящий гараж",
    "Отдельно стоящий паркинг",
  ],
};

// ============================================================
// КАТЕГОРИИ "КУПИТЬ"
// ============================================================

>>>>>>> dee4ecb (Add address geocoding)
const buyCategories: Category[] = [
  {
    title: "Квартиры",
    items: [
      "Студии",
      "1 комнатные",
      "2 комнатные",
      "3 комнатные",
      "4 комнатные",
      "5 комнатные",
      "Пентхаусы",
      "От застройщика",
    ],
  },
  {
    title: "Дома",
    items: [
      "Дачи",
      "Таунхаусы",
      "Дуплексы",
      "Части домов",
    ],
  },
  {
    title: "Коммерция",
    items: [
      "Торговые площади",
      "Коммерческая земля",
      "Офисы",
      "Бизнес",
      "Склады",
    ],
  },
  {
    title: "Земельные участки",
    items: [
      "Участки",
      "Под ИЖС",
      "Садоводство",
    ],
  },
];

<<<<<<< HEAD
=======
// ============================================================
// КАТЕГОРИИ "СНЯТЬ"
// ============================================================

>>>>>>> dee4ecb (Add address geocoding)
const rentCategories: Category[] = [
  {
    title: "Квартиры",
    items: [
      "1-комнатная",
      "2-комнатная",
      "3-комнатная",
      "4-комнатная",
      "Квартиры-студии",
      "Комнаты",
    ],
  },
  {
    title: "Загородная недвижимость",
    items: [
<<<<<<< HEAD
=======
      "Коттеджи",
>>>>>>> dee4ecb (Add address geocoding)
      "Дома",
      "Дачи",
      "Таунхаусы",
      "Участки",
    ],
  },
  {
    title: "Коммерческая",
    items: [
      "Офисы",
      "Склады",
      "Готовый бизнес",
      "Торговые площади",
    ],
  },
];

<<<<<<< HEAD
=======
// ============================================================
// КАТЕГОРИИ "СДАТЬ"
// ============================================================

>>>>>>> dee4ecb (Add address geocoding)
const leaseCategories: Category[] = [
  {
    title: "Квартиры",
    items: [
      "Студии",
      "1-комнатные",
      "2-комнатные",
      "3-комнатные",
      "4-комнатные",
    ],
  },
  {
    title: "Дома",
    items: [
      "Дома",
      "Дачи",
      "Таунхаусы",
      "Коттеджи",
    ],
  },
  {
    title: "Коммерция",
    items: [
      "Офисы",
      "Торговые площади",
      "Склады",
      "Готовый бизнес",
    ],
  },
  {
    title: "Гаражи",
    items: [
      "Гаражи",
      "Машино-места",
    ],
  },
];

<<<<<<< HEAD
const propertyTypes = [
  "Квартира",
  "Квартира в новостройке",
  "Дом",
  "Земельный участок",
  "Коммерческая недвижимость",
  "Гараж",
];
=======
// ============================================================
// ДОПОЛНИТЕЛЬНЫЕ ВАРИАНТЫ
// ============================================================
>>>>>>> dee4ecb (Add address geocoding)

const roomOptions = [
  "Не важно",
  "Студия",
  "1",
  "2",
  "3",
  "4+",
];

const priceOptions = [
  "Не важно",
  "До 3 млн ₽",
  "3–5 млн ₽",
  "5–8 млн ₽",
  "8–12 млн ₽",
  "12–20 млн ₽",
  "От 20 млн ₽",
];

const areaOptions = [
  "Не важно",
  "До 40 м²",
  "40–60 м²",
  "60–80 м²",
  "80–120 м²",
  "120–200 м²",
  "От 200 м²",
];

const locationOptions = [
  "Краснодар",
  "Центральный район",
  "ФМР",
  "ЮМР",
  "ГМР",
  "ККБ",
];

const API_URL =
  "https://doma-nq4u.onrender.com";

// ============================================================
<<<<<<< HEAD
// Форма заявки
// ============================================================

type ApplicationFormProps = {
  applicationType:
    | "Продать"
    | "Снять"
    | "Сдать";

  title: string;

  submitText?: string;
=======
// КАСТОМНЫЙ DROPDOWN
// ============================================================

type CustomDropdownProps = {
  label: string;
  value: string;
  options: string[];
  open: boolean;
  onOpen: () => void;
  onChange: (value: string) => void;
};

function CustomDropdown({
  label,
  value,
  options,
  open,
  onOpen,
  onChange,
}: CustomDropdownProps) {
  return (
    <div
      style={{
        position: "relative",
      }}
    >
      <button
        type="button"
        onClick={onOpen}
        className="search-input"
        style={{
          width: "100%",
          minHeight: "56px",
          display: "flex",
          alignItems: "center",
          justifyContent:
            "space-between",
          gap: "10px",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <span>
          {value ? (
            <span
              style={{
                color: "#111827",
                fontWeight: 600,
              }}
            >
              {value}
            </span>
          ) : (
            <span
              style={{
                color: "#9ca3af",
              }}
            >
              {label}
            </span>
          )}
        </span>

        <span
          style={{
            color: "#9ca3af",
            fontSize: "15px",
          }}
        >
          {open ? "⌃" : "⌄"}
        </span>
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            left: 0,
            width: "100%",
            background: "#f1f3f7",
            borderRadius: "18px",
            padding: "8px",
            boxShadow:
              "0 15px 35px rgba(0,0,0,.12)",
            zIndex: 100,
            maxHeight: "270px",
            overflowY: "auto",
          }}
        >
          {options.map((option) => {
            const selected =
              option === value;

            return (
              <button
                key={option}
                type="button"
                onClick={() => {
                  onChange(option);
                }}
                style={{
                  width: "100%",
                  border: "none",
                  background:
                    "transparent",
                  borderRadius: "12px",
                  padding:
                    "12px 10px",
                  display: "flex",
                  alignItems:
                    "center",
                  gap: "12px",
                  cursor:
                    "pointer",
                  textAlign:
                    "left",
                  color: "#111827",
                  fontSize: "14px",
                }}
              >
                <span
                  style={{
                    width: "14px",
                    height: "14px",
                    minWidth: "14px",
                    border:
                      "1.5px solid #ef3340",
                    borderRadius:
                      "4px",
                    display: "flex",
                    alignItems:
                      "center",
                    justifyContent:
                      "center",
                    background:
                      selected
                        ? "#ef3340"
                        : "transparent",
                    color:
                      "#ffffff",
                    fontSize:
                      "10px",
                    fontWeight:
                      700,
                  }}
                >
                  {selected
                    ? "✓"
                    : ""}
                </span>

                <span
                  style={{
                    fontWeight:
                      selected
                        ? 600
                        : 400,
                  }}
                >
                  {option}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ============================================================
// ФОРМА ЗАЯВКИ
// ============================================================

type ApplicationFormProps = {
  applicationType: ApplicationType;
  title: string;
>>>>>>> dee4ecb (Add address geocoding)
};

function ApplicationForm({
  applicationType,
  title,
<<<<<<< HEAD
  submitText = "Оставить заявку",
=======
>>>>>>> dee4ecb (Add address geocoding)
}: ApplicationFormProps) {
  const [propertyType, setPropertyType] =
    useState("");

<<<<<<< HEAD
=======
  const [subType, setSubType] =
    useState("");

>>>>>>> dee4ecb (Add address geocoding)
  const [rooms, setRooms] =
    useState("");

  const [name, setName] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [comment, setComment] =
    useState("");

  const [agreement, setAgreement] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [success, setSuccess] =
    useState(false);

  const [error, setError] =
    useState("");

<<<<<<< HEAD
=======
  const [openType, setOpenType] =
    useState(false);

  const [openSubType, setOpenSubType] =
    useState(false);

  const availableSubTypes =
    propertyType
      ? subTypes[propertyType] || []
      : [];

>>>>>>> dee4ecb (Add address geocoding)
  async function handleSubmit(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    if (!agreement) {
      setError(
        "Подтвердите согласие на обработку персональных данных."
      );
      return;
    }

<<<<<<< HEAD
    if (!name.trim()) {
      setError("Введите имя.");
      return;
    }

    if (!phone.trim()) {
      setError("Введите телефон.");
      return;
    }

=======
>>>>>>> dee4ecb (Add address geocoding)
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const commentParts = [
        `Заявка: ${applicationType}`,
        propertyType
<<<<<<< HEAD
          ? `Тип: ${propertyType}`
=======
          ? `Тип недвижимости: ${propertyType}`
          : "",
        subType
          ? `Подтип: ${subType}`
>>>>>>> dee4ecb (Add address geocoding)
          : "",
        rooms
          ? `Комнатность: ${rooms}`
          : "",
        comment.trim()
          ? `Комментарий: ${comment.trim()}`
          : "",
      ].filter(Boolean);

      const response = await fetch(
        `${API_URL}/leads`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            name: name.trim(),
            phone: phone.trim(),
            comment:
              commentParts.join(". "),
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        let message =
          "Не удалось отправить заявку.";

        if (
          Array.isArray(
            data?.detail
          )
        ) {
          message =
            data.detail
              .map(
                (item: any) =>
                  typeof item ===
                  "string"
                    ? item
                    : item?.msg ||
                      item?.message ||
                      JSON.stringify(
                        item
                      )
              )
              .join(", ");
        } else if (
          typeof data?.detail ===
          "string"
        ) {
          message =
            data.detail;
        } else if (
          data?.detail
        ) {
          message =
            data.detail.msg ||
            data.detail.message ||
            JSON.stringify(
              data.detail
            );
        }

        throw new Error(
          message
        );
      }

      setSuccess(true);

      setName("");
      setPhone("");
      setComment("");
      setPropertyType("");
<<<<<<< HEAD
=======
      setSubType("");
>>>>>>> dee4ecb (Add address geocoding)
      setRooms("");
      setAgreement(false);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
<<<<<<< HEAD
          : "Произошла ошибка при отправке заявки."
=======
          : "Ошибка отправки заявки."
>>>>>>> dee4ecb (Add address geocoding)
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={
        handleSubmit
      }
    >
<<<<<<< HEAD
=======
      {/* ================================================== */}
      {/* ОСНОВНЫЕ ПОЛЯ */}
      {/* ================================================== */}

>>>>>>> dee4ecb (Add address geocoding)
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(2, minmax(0, 1fr))",
          gap: "12px",
        }}
      >
<<<<<<< HEAD
        {/* Тип */}

        <select
          className="search-input"
          required
          value={propertyType}
          onChange={(e) =>
            setPropertyType(
              e.target.value
            )
          }
        >
          <option value="">
            Тип недвижимости
          </option>

          {propertyTypes.map(
            (item) => (
              <option
                key={item}
                value={item}
              >
                {item}
              </option>
            )
          )}
        </select>

        {/* Комнаты */}

        <select
          className="search-input"
          value={rooms}
          onChange={(e) =>
            setRooms(
              e.target.value
            )
          }
        >
          <option value="">
            Количество комнат
          </option>

          {roomOptions.map(
            (item) => (
              <option
                key={item}
                value={item}
              >
                {item}
              </option>
            )
          )}
        </select>
=======
        {/* Тип недвижимости */}

        <CustomDropdown
          label="Тип недвижимости"
          value={
            propertyType
          }
          options={
            propertyTypes
          }
          open={openType}
          onOpen={() => {
            setOpenType(
              !openType
            );
            setOpenSubType(
              false
            );
          }}
          onChange={(value) => {
            setPropertyType(
              value
            );
            setSubType("");
            setOpenType(false);
          }}
        />

        {/* Подтип */}

        <CustomDropdown
          label={
            propertyType
              ? "Тип"
              : "Сначала выберите недвижимость"
          }
          value={
            subType
          }
          options={
            availableSubTypes
          }
          open={openSubType}
          onOpen={() => {
            if (
              availableSubTypes.length
            ) {
              setOpenSubType(
                !openSubType
              );
              setOpenType(
                false
              );
            }
          }}
          onChange={(value) => {
            setSubType(
              value
            );
            setOpenSubType(
              false
            );
          }}
        />

        {/* Комнатность */}

        <CustomDropdown
          label="Количество комнат"
          value={
            rooms
          }
          options={
            roomOptions
          }
          open={false}
          onOpen={() => {}}
          onChange={() => {}}
        />
>>>>>>> dee4ecb (Add address geocoding)

        {/* Имя */}

        <input
          className="search-input"
          required
          placeholder="Имя"
<<<<<<< HEAD
          value={name}
=======
          value={
            name
          }
>>>>>>> dee4ecb (Add address geocoding)
          onChange={(e) =>
            setName(
              e.target.value
            )
          }
        />

        {/* Телефон */}

        <input
          className="search-input"
          required
          type="tel"
          placeholder="+7 (999) 999-99-99"
<<<<<<< HEAD
          value={phone}
=======
          value={
            phone
          }
>>>>>>> dee4ecb (Add address geocoding)
          onChange={(e) =>
            setPhone(
              e.target.value
            )
          }
        />

        {/* Комментарий */}

        <input
          className="search-input"
          placeholder="Комментарий"
<<<<<<< HEAD
          value={comment}
=======
          value={
            comment
          }
>>>>>>> dee4ecb (Add address geocoding)
          onChange={(e) =>
            setComment(
              e.target.value
            )
          }
        />

        {/* Кнопка */}

        <button
          type="submit"
          className="btn btn-red"
<<<<<<< HEAD
          disabled={loading}
          style={{
            border: "none",
            opacity:
              loading ? 0.7 : 1,
=======
          disabled={
            loading
          }
          style={{
            border: "none",
            opacity:
              loading
                ? 0.7
                : 1,
>>>>>>> dee4ecb (Add address geocoding)
          }}
        >
          {loading
            ? "Отправляем..."
<<<<<<< HEAD
            : submitText}
        </button>
      </div>

      {/* Согласие */}
=======
            : "Оставить заявку"}
        </button>
      </div>

      {/* ================================================== */}
      {/* СОГЛАСИЕ */}
      {/* ================================================== */}
>>>>>>> dee4ecb (Add address geocoding)

      <label
        style={{
          display: "flex",
          alignItems:
            "flex-start",
          gap: "10px",
          marginTop: "12px",
          color:
            "rgba(255,255,255,.9)",
          fontSize: "12px",
          lineHeight: 1.5,
        }}
      >
        <input
          type="checkbox"
<<<<<<< HEAD
          checked={agreement}
=======
          checked={
            agreement
          }
>>>>>>> dee4ecb (Add address geocoding)
          onChange={(e) =>
            setAgreement(
              e.target.checked
            )
          }
          style={{
<<<<<<< HEAD
            marginTop: "2px",
=======
            marginTop:
              "2px",
>>>>>>> dee4ecb (Add address geocoding)
            accentColor:
              "#ef4444",
          }}
        />

        <span>
          Нажимая кнопку
<<<<<<< HEAD
          «{submitText}», я
          даю согласие на
          обработку
          персональных данных.
        </span>
      </label>

      {/* Ошибка */}
=======
          «Оставить заявку»,
          я даю согласие
          на обработку
          персональных
          данных.
        </span>
      </label>

      {/* ================================================== */}
      {/* ОШИБКА */}
      {/* ================================================== */}
>>>>>>> dee4ecb (Add address geocoding)

      {error && (
        <div
          style={{
<<<<<<< HEAD
            marginTop: "12px",
=======
            marginTop:
              "12px",
>>>>>>> dee4ecb (Add address geocoding)
            padding:
              "12px 14px",
            borderRadius:
              "12px",
            background:
              "rgba(254,226,226,.95)",
            color:
              "#991b1b",
<<<<<<< HEAD
            fontSize: "13px",
=======
            fontSize:
              "13px",
>>>>>>> dee4ecb (Add address geocoding)
          }}
        >
          {error}
        </div>
      )}

<<<<<<< HEAD
      {/* Успех */}
=======
      {/* ================================================== */}
      {/* УСПЕХ */}
      {/* ================================================== */}
>>>>>>> dee4ecb (Add address geocoding)

      {success && (
        <div
          style={{
<<<<<<< HEAD
            marginTop: "12px",
=======
            marginTop:
              "12px",
>>>>>>> dee4ecb (Add address geocoding)
            padding:
              "12px 14px",
            borderRadius:
              "12px",
            background:
              "rgba(220,252,231,.95)",
            color:
              "#166534",
<<<<<<< HEAD
            fontSize: "13px",
            fontWeight: 600,
          }}
        >
          {title} отправлена.
          Менеджер свяжется с
          вами.
=======
            fontSize:
              "13px",
            fontWeight:
              600,
          }}
        >
          {title} отправлена.
          Менеджер свяжется
          с вами.
>>>>>>> dee4ecb (Add address geocoding)
        </div>
      )}
    </form>
  );
}
<<<<<<< HEAD
=======

// ============================================================
// HERO
// ============================================================
>>>>>>> dee4ecb (Add address geocoding)

export default function Hero() {
  const [activeTab, setActiveTab] =
    useState("Купить");

  const [propertyType, setPropertyType] =
    useState("");

<<<<<<< HEAD
=======
  const [subType, setSubType] =
    useState("");

>>>>>>> dee4ecb (Add address geocoding)
  const [rooms, setRooms] =
    useState("");

  const [price, setPrice] =
    useState("");

  const [area, setArea] =
    useState("");

  const [location, setLocation] =
    useState("");

  const [showFilters, setShowFilters] =
    useState(false);

<<<<<<< HEAD
  const [selectedCategory, setSelectedCategory] =
    useState<string | null>(null);

=======
  const [openPropertyType, setOpenPropertyType] =
    useState(false);

  const [openSubType, setOpenSubType] =
    useState(false);

  const [openRooms, setOpenRooms] =
    useState(false);

  const [openPrice, setOpenPrice] =
    useState(false);

  const [openArea, setOpenArea] =
    useState(false);

  const [openLocation, setOpenLocation] =
    useState(false);

  const [selectedCategory, setSelectedCategory] =
    useState<string | null>(null);

  // ==========================================================
  // Подтипы для основного фильтра
  // ==========================================================

  const currentSubTypes =
    propertyType
      ? subTypes[propertyType] || []
      : [];

  // ==========================================================
  // Категории под поиском
  // ==========================================================

  let categories: Category[] = [];

  if (
    activeTab === "Купить"
  ) {
    categories =
      buyCategories;
  }

  if (
    activeTab === "Снять"
  ) {
    categories =
      rentCategories;
  }

  if (
    activeTab === "Сдать"
  ) {
    categories =
      leaseCategories;
  }

  // ==========================================================
  // TAB
  // ==========================================================

>>>>>>> dee4ecb (Add address geocoding)
  const handleTabChange = (
    tab: string
  ) => {
    setActiveTab(tab);
<<<<<<< HEAD
    setShowFilters(false);
    setSelectedCategory(null);
  };

=======

    setOpenPropertyType(false);
    setOpenSubType(false);
    setOpenRooms(false);
    setOpenPrice(false);
    setOpenArea(false);
    setOpenLocation(false);

    setSelectedCategory(
      null
    );

    setShowFilters(
      false
    );
  };

  // ==========================================================
  // SEARCH
  // ==========================================================

>>>>>>> dee4ecb (Add address geocoding)
  const typeMap: Record<
    string,
    string
  > = {
<<<<<<< HEAD
    "Квартира": "apartment",
    "Квартира в новостройке":
      "new_building",
    "Дом": "house",
    "Земельный участок":
      "land",
    "Коммерческая недвижимость":
      "commercial",
    "Гараж": "garage",
=======
    Квартиры:
      "apartment",

    Дома:
      "house",

    "Земельные участки":
      "land",

    Коммерция:
      "commercial",

    Гаражи:
      "garage",
>>>>>>> dee4ecb (Add address geocoding)
  };

  const handleSearch = () => {
    const params =
      new URLSearchParams();

<<<<<<< HEAD
    if (propertyType) {
      const type =
        typeMap[propertyType];

      if (type) {
        params.set(
          "type",
          type
        );
      }
=======
    if (
      propertyType &&
      typeMap[propertyType]
    ) {
      params.set(
        "type",
        typeMap[
          propertyType
        ]
      );
    }

    if (subType) {
      params.set(
        "subtype",
        subType
      );
>>>>>>> dee4ecb (Add address geocoding)
    }

    if (rooms) {
      params.set(
        "rooms",
        rooms
      );
    }

    if (price) {
      params.set(
        "price",
        price
      );
    }

    if (area) {
      params.set(
        "area",
        area
      );
    }

    if (location) {
      params.set(
        "location",
        location
      );
    }

    const query =
      params.toString();

    window.location.href =
      query
        ? `/catalog?${query}`
        : "/catalog";
  };
<<<<<<< HEAD

  let categories: Category[] = [];

  if (
    activeTab === "Купить"
  ) {
    categories =
      buyCategories;
  }

  if (
    activeTab === "Снять"
  ) {
    categories =
      rentCategories;
  }

  if (
    activeTab === "Сдать"
  ) {
    categories =
      leaseCategories;
  }
=======
>>>>>>> dee4ecb (Add address geocoding)

  return (
    <section className="hero">
      <div className="container hero-content">

        {/* ================================================== */}
<<<<<<< HEAD
        {/* Заголовок */}
=======
        {/* HERO */}
>>>>>>> dee4ecb (Add address geocoding)
        {/* ================================================== */}

        <div
          style={{
            color:
              "white",
            fontWeight:
              700,
            letterSpacing:
              "2px",
            marginBottom:
              "20px",
          }}
        >
          НЕДВИЖИМОСТЬ • КРАСНОДАР
        </div>

        <h1 className="hero-title">
          Найдём место,
          <br />
          которое станет
          <br />
          домом
        </h1>

        <p className="hero-text">
<<<<<<< HEAD
          Покупка, продажа и аренда
          недвижимости в Краснодаре.
          Полное сопровождение сделки
          и персональный подход
          к каждому клиенту.
        </p>

        {/* ================================================== */}
        {/* Статистика */}
=======
          Покупка, продажа и
          аренда недвижимости
          в Краснодаре.
          Полное сопровождение
          сделки и персональный
          подход к каждому клиенту.
        </p>

        {/* ================================================== */}
        {/* СТАТИСТИКА */}
>>>>>>> dee4ecb (Add address geocoding)
        {/* ================================================== */}

        <div
          style={{
            display:
              "flex",
            gap:
              "50px",
            marginTop:
              "35px",
            marginBottom:
              "40px",
            color:
              "white",
            flexWrap:
              "wrap",
          }}
        >
          <div>
            <div
              style={{
                fontSize:
                  "36px",
                fontWeight:
                  700,
              }}
            >
              500+
            </div>

            <div>
              Объектов
            </div>
          </div>

          <div>
            <div
              style={{
                fontSize:
                  "36px",
                fontWeight:
                  700,
              }}
            >
              150+
            </div>

            <div>
              Сделок
            </div>
          </div>

          <div>
            <div
              style={{
                fontSize:
                  "36px",
                fontWeight:
                  700,
              }}
            >
              98%
            </div>

            <div>
              Довольных клиентов
            </div>
          </div>
        </div>

        {/* ================================================== */}
        {/* SEARCH BOX */}
        {/* ================================================== */}

        <div
          className="search-box"
          style={{
            position:
              "relative",
<<<<<<< HEAD
            zIndex: 20,
          }}
        >
          {/* ================================================= */}
          {/* ТАБЫ */}
=======
            zIndex:
              20,
          }}
        >

          {/* ================================================= */}
          {/* ВКЛАДКИ */}
>>>>>>> dee4ecb (Add address geocoding)
          {/* ================================================= */}

          <div
            className="search-tabs"
            style={{
<<<<<<< HEAD
              display: "flex",
              gap: "8px",
=======
              display:
                "flex",
              gap:
                "8px",
>>>>>>> dee4ecb (Add address geocoding)
              flexWrap:
                "wrap",
              marginBottom:
                "18px",
            }}
          >
            {[
              "Купить",
              "Продать",
              "Ипотека",
              "Оценить",
              "Снять",
              "Сдать",
            ].map(
              (tab) => (
                <button
<<<<<<< HEAD
                  key={tab}
=======
                  key={
                    tab
                  }
>>>>>>> dee4ecb (Add address geocoding)
                  type="button"
                  onClick={() =>
                    handleTabChange(
                      tab
                    )
                  }
                  className={
                    activeTab ===
                    tab
                      ? "search-tab active"
                      : "search-tab"
                  }
                >
<<<<<<< HEAD
                  {tab}
=======
                  {
                    tab
                  }
>>>>>>> dee4ecb (Add address geocoding)
                </button>
              )
            )}
          </div>

          {/* ================================================= */}
          {/* КУПИТЬ */}
          {/* ================================================= */}

          {activeTab ===
            "Купить" && (
            <>
              <div
                className="search-grid"
                style={{
<<<<<<< HEAD
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(4, minmax(0, 1fr))",
                  gap: "12px",
                }}
              >
                <select
                  className="search-input"
                  value={
                    propertyType
                  }
                  onChange={(e) =>
                    setPropertyType(
                      e.target.value
                    )
                  }
                >
                  <option value="">
                    Тип недвижимости
                  </option>

                  {propertyTypes.map(
                    (item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        {item}
                      </option>
                    )
                  )}
                </select>

                <select
                  className="search-input"
                  value={rooms}
                  onChange={(e) =>
                    setRooms(
                      e.target.value
                    )
                  }
                >
                  <option value="">
                    Количество комнат
                  </option>

                  {roomOptions.map(
                    (item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        {item}
                      </option>
                    )
                  )}
                </select>

                <select
                  className="search-input"
                  value={price}
                  onChange={(e) =>
                    setPrice(
                      e.target.value
                    )
                  }
                >
                  <option value="">
                    Цена
                  </option>

                  {priceOptions.map(
                    (item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        {item}
                      </option>
                    )
                  )}
                </select>

                <select
                  className="search-input"
                  value={area}
                  onChange={(e) =>
                    setArea(
                      e.target.value
                    )
                  }
                >
                  <option value="">
                    Площадь
                  </option>

                  {areaOptions.map(
                    (item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        {item}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "1fr auto auto auto",
                  gap: "12px",
=======
                  display:
                    "grid",
                  gridTemplateColumns:
                    "repeat(4, minmax(0, 1fr))",
                  gap:
                    "12px",
                }}
              >

                {/* Тип */}

                <CustomDropdown
                  label="Тип недвижимости"
                  value={
                    propertyType
                  }
                  options={
                    propertyTypes
                  }
                  open={
                    openPropertyType
                  }
                  onOpen={() => {
                    setOpenPropertyType(
                      !openPropertyType
                    );

                    setOpenSubType(
                      false
                    );

                    setOpenRooms(
                      false
                    );
                  }}
                  onChange={(
                    value
                  ) => {
                    setPropertyType(
                      value
                    );

                    setSubType(
                      ""
                    );

                    setOpenPropertyType(
                      false
                    );
                  }}
                />

                {/* Подтип */}

                <CustomDropdown
                  label={
                    propertyType
                      ? "Тип"
                      : "Выберите недвижимость"
                  }
                  value={
                    subType
                  }
                  options={
                    currentSubTypes
                  }
                  open={
                    openSubType
                  }
                  onOpen={() => {
                    if (
                      currentSubTypes.length >
                      0
                    ) {
                      setOpenSubType(
                        !openSubType
                      );

                      setOpenPropertyType(
                        false
                      );
                    }
                  }}
                  onChange={(
                    value
                  ) => {
                    setSubType(
                      value
                    );

                    setOpenSubType(
                      false
                    );
                  }}
                />

                {/* Комнаты */}

                <CustomDropdown
                  label="Количество комнат"
                  value={
                    rooms
                  }
                  options={
                    roomOptions
                  }
                  open={
                    openRooms
                  }
                  onOpen={() => {
                    setOpenRooms(
                      !openRooms
                    );

                    setOpenPropertyType(
                      false
                    );

                    setOpenSubType(
                      false
                    );
                  }}
                  onChange={(
                    value
                  ) => {
                    setRooms(
                      value
                    );

                    setOpenRooms(
                      false
                    );
                  }}
                />

                {/* Цена */}

                <CustomDropdown
                  label="Цена"
                  value={
                    price
                  }
                  options={
                    priceOptions
                  }
                  open={
                    openPrice
                  }
                  onOpen={() => {
                    setOpenPrice(
                      !openPrice
                    );

                    setOpenPropertyType(
                      false
                    );

                    setOpenSubType(
                      false
                    );
                  }}
                  onChange={(
                    value
                  ) => {
                    setPrice(
                      value
                    );

                    setOpenPrice(
                      false
                    );
                  }}
                />
              </div>

              {/* ============================================ */}
              {/* ВТОРАЯ СТРОКА */}
              {/* ============================================ */}

              <div
                style={{
                  display:
                    "grid",
                  gridTemplateColumns:
                    "1fr auto auto",
                  gap:
                    "12px",
>>>>>>> dee4ecb (Add address geocoding)
                  marginTop:
                    "12px",
                }}
              >
<<<<<<< HEAD
                <select
                  className="search-input"
                  value={location}
                  onChange={(e) =>
                    setLocation(
                      e.target.value
                    )
                  }
                >
                  <option value="">
                    Город, район
                  </option>

                  {locationOptions.map(
                    (item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        {item}
                      </option>
                    )
                  )}
                </select>
=======

                {/* Площадь */}

                <CustomDropdown
                  label="Площадь"
                  value={
                    area
                  }
                  options={
                    areaOptions
                  }
                  open={
                    openArea
                  }
                  onOpen={() => {
                    setOpenArea(
                      !openArea
                    );

                    setOpenPropertyType(
                      false
                    );

                    setOpenSubType(
                      false
                    );
                  }}
                  onChange={(
                    value
                  ) => {
                    setArea(
                      value
                    );

                    setOpenArea(
                      false
                    );
                  }}
                />

                {/* Все фильтры */}
>>>>>>> dee4ecb (Add address geocoding)

                <button
                  type="button"
                  className="btn"
                  onClick={() =>
                    setShowFilters(
                      !showFilters
                    )
                  }
                >
                  ☷ Все фильтры
                </button>

<<<<<<< HEAD
=======
                {/* Карта */}

>>>>>>> dee4ecb (Add address geocoding)
                <Link
                  href="/map"
                  className="btn"
                  style={{
                    textDecoration:
                      "none",
<<<<<<< HEAD
                    display: "flex",
=======
                    display:
                      "flex",
>>>>>>> dee4ecb (Add address geocoding)
                    alignItems:
                      "center",
                    justifyContent:
                      "center",
                  }}
                >
                  ◉ На карте
                </Link>

<<<<<<< HEAD
=======
                {/* Поиск */}

>>>>>>> dee4ecb (Add address geocoding)
                <button
                  type="button"
                  className="btn btn-red"
                  onClick={
                    handleSearch
                  }
                >
                  Поиск объявлений
                </button>
              </div>

<<<<<<< HEAD
=======
              {/* ============================================ */}
              {/* ГОРОД / РАЙОН */}
              {/* ============================================ */}

              <div
                style={{
                  marginTop:
                    "12px",
                  display:
                    "grid",
                  gridTemplateColumns:
                    "1fr",
                }}
              >
                <CustomDropdown
                  label="Город, район"
                  value={
                    location
                  }
                  options={
                    locationOptions
                  }
                  open={
                    openLocation
                  }
                  onOpen={() => {
                    setOpenLocation(
                      !openLocation
                    );

                    setOpenPropertyType(
                      false
                    );

                    setOpenSubType(
                      false
                    );
                  }}
                  onChange={(
                    value
                  ) => {
                    setLocation(
                      value
                    );

                    setOpenLocation(
                      false
                    );
                  }}
                />
              </div>

              {/* ============================================ */}
              {/* ДОПОЛНИТЕЛЬНЫЕ ФИЛЬТРЫ */}
              {/* ============================================ */}

>>>>>>> dee4ecb (Add address geocoding)
              {showFilters && (
                <div
                  style={{
                    marginTop:
                      "14px",
                    padding:
                      "18px",
                    borderRadius:
                      "18px",
                    background:
                      "#f8fafc",
                    border:
                      "1px solid #e5e7eb",
<<<<<<< HEAD
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(3, 1fr)",
                    gap: "12px",
                  }}
                >
                  <select
                    className="search-input"
                    value={
                      propertyType
                    }
                    onChange={(e) =>
                      setPropertyType(
                        e.target.value
                      )
                    }
                  >
                    <option value="">
                      Тип недвижимости
                    </option>

                    {propertyTypes.map(
                      (item) => (
                        <option
                          key={item}
                          value={item}
                        >
                          {item}
                        </option>
                      )
                    )}
                  </select>

                  <select
                    className="search-input"
                    value={rooms}
                    onChange={(e) =>
                      setRooms(
                        e.target.value
                      )
                    }
                  >
                    <option value="">
                      Количество комнат
                    </option>

                    {roomOptions.map(
                      (item) => (
                        <option
                          key={item}
                          value={item}
                        >
                          {item}
                        </option>
                      )
                    )}
                  </select>

                  <select
                    className="search-input"
                    value={location}
                    onChange={(e) =>
                      setLocation(
                        e.target.value
                      )
                    }
                  >
                    <option value="">
                      Район
                    </option>

                    {locationOptions.map(
                      (item) => (
                        <option
                          key={item}
                          value={item}
                        >
                          {item}
                        </option>
                      )
                    )}
                  </select>
                </div>
              )}

              {/* Категории */}
=======
                    display:
                      "grid",
                    gridTemplateColumns:
                      "repeat(3, 1fr)",
                    gap:
                      "12px",
                  }}
                >
                  <CustomDropdown
                    label="Тип недвижимости"
                    value={
                      propertyType
                    }
                    options={
                      propertyTypes
                    }
                    open={
                      false
                    }
                    onOpen={() => {}}
                    onChange={() => {}}
                  />

                  <CustomDropdown
                    label="Тип"
                    value={
                      subType
                    }
                    options={
                      currentSubTypes
                    }
                    open={
                      false
                    }
                    onOpen={() => {}}
                    onChange={() => {}}
                  />

                  <CustomDropdown
                    label="Район"
                    value={
                      location
                    }
                    options={
                      locationOptions
                    }
                    open={
                      false
                    }
                    onOpen={() => {}}
                    onChange={() => {}}
                  />
                </div>
              )}

              {/* ============================================ */}
              {/* БЛОК КАТЕГОРИЙ */}
              {/* ============================================ */}
>>>>>>> dee4ecb (Add address geocoding)

              <div
                style={{
                  marginTop:
                    "22px",
                  background:
                    "#ffffff",
                  borderRadius:
                    "28px",
                  padding:
                    "22px",
                  boxShadow:
                    "0 20px 50px rgba(0,0,0,.12)",
                  color:
                    "#111827",
                }}
              >
                <CategoryBlock
                  title="Купить недвижимость"
                  categories={
                    buyCategories
                  }
                  selectedCategory={
                    selectedCategory
                  }
                  setSelectedCategory={
                    setSelectedCategory
                  }
                />
              </div>
            </>
          )}

          {/* ================================================= */}
          {/* ПРОДАТЬ */}
          {/* ================================================= */}

          {activeTab ===
            "Продать" && (
<<<<<<< HEAD
            <div>
              <ApplicationForm
                applicationType="Продать"
                title="Заявка на продажу недвижимости"
              />
            </div>
=======
            <ApplicationForm
              applicationType="Продать"
              title="Заявка на продажу недвижимости"
            />
>>>>>>> dee4ecb (Add address geocoding)
          )}

          {/* ================================================= */}
          {/* СНЯТЬ */}
          {/* ================================================= */}

          {activeTab ===
            "Снять" && (
            <>
<<<<<<< HEAD
              <div>
                <ApplicationForm
                  applicationType="Снять"
                  title="Заявка на аренду недвижимости"
                />
              </div>
=======
              <ApplicationForm
                applicationType="Снять"
                title="Заявка на аренду недвижимости"
              />
>>>>>>> dee4ecb (Add address geocoding)

              <div
                style={{
                  marginTop:
                    "22px",
                  background:
                    "#ffffff",
                  borderRadius:
                    "28px",
                  padding:
                    "22px",
                  boxShadow:
                    "0 20px 50px rgba(0,0,0,.12)",
                  color:
                    "#111827",
                }}
              >
                <CategoryBlock
                  title="Снять недвижимость"
                  categories={
                    rentCategories
                  }
                  selectedCategory={
                    selectedCategory
                  }
                  setSelectedCategory={
                    setSelectedCategory
                  }
                />
              </div>
            </>
          )}

          {/* ================================================= */}
          {/* СДАТЬ */}
          {/* ================================================= */}

          {activeTab ===
            "Сдать" && (
            <>
<<<<<<< HEAD
              <div>
                <ApplicationForm
                  applicationType="Сдать"
                  title="Заявка на сдачу недвижимости"
                />
              </div>
=======
              <ApplicationForm
                applicationType="Сдать"
                title="Заявка на сдачу недвижимости"
              />
>>>>>>> dee4ecb (Add address geocoding)

              <div
                style={{
                  marginTop:
                    "22px",
                  background:
                    "#ffffff",
                  borderRadius:
                    "28px",
                  padding:
                    "22px",
                  boxShadow:
                    "0 20px 50px rgba(0,0,0,.12)",
                  color:
                    "#111827",
                }}
              >
                <CategoryBlock
                  title="Сдать недвижимость"
                  categories={
                    leaseCategories
                  }
                  selectedCategory={
                    selectedCategory
                  }
                  setSelectedCategory={
                    setSelectedCategory
                  }
                />
              </div>
            </>
          )}

          {/* ================================================= */}
<<<<<<< HEAD
          {/* ИПОТЕКА / ОЦЕНИТЬ */}
=======
          {/* ИПОТЕКА / ОЦЕНКА */}
>>>>>>> dee4ecb (Add address geocoding)
          {/* ================================================= */}

          {(activeTab ===
            "Ипотека" ||
            activeTab ===
              "Оценить") && (
            <div
              style={{
<<<<<<< HEAD
                display: "grid",
                gridTemplateColumns:
                  "repeat(2, minmax(0, 1fr))",
                gap: "12px",
              }}
            >
              <select
                className="search-input"
                defaultValue=""
              >
                <option value="">
                  Тип недвижимости
                </option>

                {propertyTypes.map(
                  (item) => (
                    <option
                      key={item}
                      value={item}
                    >
                      {item}
                    </option>
                  )
                )}
              </select>

              <select
                className="search-input"
                defaultValue=""
              >
                <option value="">
                  Количество комнат
                </option>

                {roomOptions.map(
                  (item) => (
                    <option
                      key={item}
                      value={item}
                    >
                      {item}
                    </option>
                  )
                )}
              </select>
=======
                display:
                  "grid",
                gridTemplateColumns:
                  "repeat(2, minmax(0, 1fr))",
                gap:
                  "12px",
              }}
            >
              <CustomDropdown
                label="Тип недвижимости"
                value=""
                options={
                  propertyTypes
                }
                open={
                  false
                }
                onOpen={() => {}}
                onChange={() => {}}
              />

              <CustomDropdown
                label="Количество комнат"
                value=""
                options={
                  roomOptions
                }
                open={
                  false
                }
                onOpen={() => {}}
                onChange={() => {}}
              />
>>>>>>> dee4ecb (Add address geocoding)

              <input
                className="search-input"
                placeholder="Имя"
              />

              <input
                className="search-input"
                placeholder="Телефон"
              />

              <button
                type="button"
                className="btn btn-red"
                onClick={() =>
                  alert(
                    "Оставьте контакты для связи с менеджером."
                  )
                }
              >
                Оставить заявку
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ==================================================== */}
      {/* АДАПТИВ */}
      {/* ==================================================== */}

      <style jsx>{`
<<<<<<< HEAD
        @media (max-width: 1000px) {
          .search-grid {
            grid-template-columns: 1fr 1fr !important;
          }

          .search-box form > div:first-child {
            grid-template-columns: 1fr 1fr !important;
          }
=======
        @media (max-width: 1100px) {
          .search-grid {
            grid-template-columns: 1fr 1fr !important;
          }
>>>>>>> dee4ecb (Add address geocoding)
        }

        @media (max-width: 800px) {
          .search-grid {
            grid-template-columns: 1fr !important;
          }

          .search-box > div {
<<<<<<< HEAD
            overflow-x: visible;
          }
        }

        @media (max-width: 700px) {
          .category-grid {
            grid-template-columns: 1fr !important;
=======
            overflow: visible;
          }
        }

        @media (max-width: 650px) {
          .search-box {
            padding: 15px !important;
>>>>>>> dee4ecb (Add address geocoding)
          }
        }
      `}</style>
    </section>
  );
}

// ============================================================
<<<<<<< HEAD
// Блок категорий
=======
// БЛОК КАТЕГОРИЙ
>>>>>>> dee4ecb (Add address geocoding)
// ============================================================

type CategoryBlockProps = {
  title: string;
  categories: Category[];
  selectedCategory: string | null;
  setSelectedCategory: (
    category: string | null
  ) => void;
};

function CategoryBlock({
  title,
  categories,
  selectedCategory,
  setSelectedCategory,
}: CategoryBlockProps) {
  return (
    <>
<<<<<<< HEAD
      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
          gap: "20px",
=======
      {/* Заголовок */}

      <div
        style={{
          display:
            "flex",
          justifyContent:
            "space-between",
          alignItems:
            "center",
          gap:
            "20px",
>>>>>>> dee4ecb (Add address geocoding)
          marginBottom:
            "20px",
        }}
      >
        <div>
          <div
            style={{
              color:
                "#6b7280",
              fontSize:
                "14px",
              marginBottom:
                "5px",
            }}
          >
            Категории
          </div>

          <h2
            style={{
<<<<<<< HEAD
              margin: 0,
=======
              margin:
                0,
>>>>>>> dee4ecb (Add address geocoding)
              fontSize:
                "26px",
              fontWeight:
                700,
            }}
          >
            {title}
          </h2>
        </div>

        <Link
          href="/catalog"
          style={{
            color:
              "#111827",
            textDecoration:
              "none",
<<<<<<< HEAD
            fontWeight: 600,
=======
            fontWeight:
              600,
>>>>>>> dee4ecb (Add address geocoding)
            whiteSpace:
              "nowrap",
          }}
        >
          Все объявления →
        </Link>
      </div>

<<<<<<< HEAD
      <div
        className="category-grid"
        style={{
          display: "grid",
=======
      {/* Категории */}

      <div
        className="category-grid"
        style={{
          display:
            "grid",
>>>>>>> dee4ecb (Add address geocoding)
          gridTemplateColumns:
            `repeat(${Math.min(
              categories.length,
              4
            )}, 1fr)`,
<<<<<<< HEAD
          gap: "12px",
=======
          gap:
            "12px",
>>>>>>> dee4ecb (Add address geocoding)
        }}
      >
        {categories.map(
          (category) => (
            <div
              key={
                category.title
              }
              style={{
                border:
                  "1px solid #e5e7eb",
                borderRadius:
                  "18px",
                padding:
                  "18px",
              }}
            >
<<<<<<< HEAD
=======
              {/* Заголовок */}

>>>>>>> dee4ecb (Add address geocoding)
              <button
                type="button"
                onClick={() =>
                  setSelectedCategory(
                    selectedCategory ===
                      category.title
                      ? null
                      : category.title
                  )
                }
                style={{
<<<<<<< HEAD
                  width: "100%",
=======
                  width:
                    "100%",
>>>>>>> dee4ecb (Add address geocoding)
                  display:
                    "flex",
                  justifyContent:
                    "space-between",
                  alignItems:
                    "center",
                  background:
                    "transparent",
                  border:
                    "none",
<<<<<<< HEAD
                  padding: 0,
=======
                  padding:
                    0,
>>>>>>> dee4ecb (Add address geocoding)
                  cursor:
                    "pointer",
                  textAlign:
                    "left",
                  color:
                    category.title ===
                    "Земельные участки"
                      ? "#ef4444"
                      : "#111827",
                  fontSize:
                    "17px",
                  fontWeight:
                    700,
                }}
              >
                <span>
                  {
                    category.title
                  }
                </span>

                <span>
                  →
                </span>
              </button>

              <div
                style={{
                  height:
                    "1px",
                  background:
                    "#e5e7eb",
                  margin:
                    "14px 0 8px",
                }}
              />

<<<<<<< HEAD
              {category.items.map(
                (item) => (
                  <Link
                    key={item}
=======
              {/* Пункты */}

              {category.items.map(
                (item) => (
                  <Link
                    key={
                      item
                    }
>>>>>>> dee4ecb (Add address geocoding)
                    href="/catalog"
                    style={{
                      display:
                        "flex",
                      justifyContent:
                        "space-between",
                      padding:
                        "7px 0",
                      color:
                        "#374151",
                      textDecoration:
                        "none",
                      fontSize:
                        "14px",
                    }}
                  >
                    <span>
                      {item}
                    </span>

                    <span
                      style={{
                        color:
                          "#9ca3af",
                      }}
                    >
                      ›
                    </span>
                  </Link>
                )
              )}

<<<<<<< HEAD
=======
              {/* Выбрано */}

>>>>>>> dee4ecb (Add address geocoding)
              {selectedCategory ===
                category.title && (
                <div
                  style={{
                    marginTop:
                      "10px",
                    paddingTop:
                      "10px",
                    borderTop:
                      "1px solid #e5e7eb",
                    color:
                      "#ef4444",
                    fontSize:
                      "13px",
                    fontWeight:
                      600,
                  }}
                >
<<<<<<< HEAD
                  Категория выбрана
=======
                  ✓ Категория выбрана
>>>>>>> dee4ecb (Add address geocoding)
                </div>
              )}
            </div>
          )
        )}
      </div>
    </>
  );
}