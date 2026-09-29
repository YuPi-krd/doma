"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

const API_URL =
  "https://doma-nq4u.onrender.com";

// ============================================================
// ТИПЫ
// ============================================================

type DealMode =
  | "sale"
  | "rent"
  | "lease";

type ApplicationType =
  | "Продать"
  | "Снять"
  | "Сдать";

type Category = {
  title: string;
  categorySlug: string;
  items: {
    title: string;
    slug: string;
  }[];
};

// ============================================================
// ОСНОВНЫЕ ТИПЫ
// ============================================================

const propertyTypes = [
  {
    value: "apartment",
    label: "Квартиры",
  },
  {
    value: "house",
    label: "Дома",
  },
  {
    value: "land",
    label: "Земельные участки",
  },
  {
    value: "commercial",
    label: "Коммерция",
  },
  {
    value: "garage",
    label: "Гаражи",
  },
];

// ============================================================
// ПОДТИПЫ
// ============================================================

const subTypes: Record<
  string,
  {
    value: string;
    label: string;
    slug: string;
  }[]
> = {
  apartment: [
    {
      value: "secondary",
      label: "Вторичка",
      slug: "secondary",
    },
    {
      value: "new_building",
      label: "Новостройки",
      slug: "new-buildings",
    },
    {
      value: "studio",
      label: "Студии",
      slug: "studios",
    },
    {
      value: "1_room",
      label: "1-комнатные",
      slug: "1-room",
    },
    {
      value: "2_room",
      label: "2-комнатные",
      slug: "2-room",
    },
    {
      value: "3_room",
      label: "3-комнатные",
      slug: "3-room",
    },
    {
      value: "4_room",
      label: "4-комнатные",
      slug: "4-room",
    },
    {
      value: "5_room",
      label: "5-комнатные",
      slug: "5-room",
    },
    {
      value: "penthouse",
      label: "Пентхаусы",
      slug: "penthouses",
    },
  ],

  house: [
    {
      value: "house",
      label: "Дом",
      slug: "houses",
    },
    {
      value: "part_of_house",
      label: "Часть дома",
      slug: "part-of-house",
    },
    {
      value: "townhouse",
      label: "Таунхаус",
      slug: "townhouses",
    },
    {
      value: "duplex",
      label: "Дуплекс",
      slug: "duplexes",
    },
    {
      value: "cottage",
      label: "Коттедж",
      slug: "cottages",
    },
    {
      value: "dacha",
      label: "Дача",
      slug: "dachas",
    },
  ],

  land: [
    {
      value: "izhs",
      label: "ИЖС",
      slug: "izhs",
    },
    {
      value: "gardening",
      label: "Садоводство",
      slug: "gardening",
    },
    {
      value: "commercial_land",
      label: "Коммерческая земля",
      slug: "commercial-land",
    },
    {
      value: "lph",
      label: "ЛПХ",
      slug: "lph",
    },
    {
      value: "dnp",
      label: "ДНП",
      slug: "dnp",
    },
  ],

  commercial: [
    {
      value: "office",
      label: "Офисное",
      slug: "offices",
    },
    {
      value: "business",
      label: "Готовый бизнес",
      slug: "business",
    },
    {
      value: "separate_building",
      label: "Отдельное здание",
      slug: "separate-building",
    },
    {
      value: "production",
      label: "Производственное",
      slug: "production",
    },
    {
      value: "warehouse",
      label: "Складское",
      slug: "warehouses",
    },
    {
      value: "retail",
      label: "Торговое помещение",
      slug: "retail",
    },
  ],

  garage: [
    {
      value: "garage_box",
      label: "Бокс в гаражном кооперативе",
      slug: "garage-box",
    },
    {
      value: "residential_complex",
      label: "Внутри жилого комплекса",
      slug: "residential-complex",
    },
    {
      value: "covered_parking",
      label: "Крытая стоянка",
      slug: "covered-parking",
    },
    {
      value: "separate_garage",
      label: "Отдельно стоящий гараж",
      slug: "separate-garage",
    },
    {
      value: "parking",
      label: "Паркинг",
      slug: "parking",
    },
  ],
};

// ============================================================
// КУПИТЬ
// ============================================================

const buyCategories: Category[] = [
  {
    title: "Квартиры",
    categorySlug: "apartments",
    items: [
      {
        title: "Вторичка",
        slug: "secondary",
      },
      {
        title: "Новостройки",
        slug: "new-buildings",
      },
      {
        title: "Студии",
        slug: "studios",
      },
      {
        title: "1-комнатные",
        slug: "1-room",
      },
      {
        title: "2-комнатные",
        slug: "2-room",
      },
      {
        title: "3-комнатные",
        slug: "3-room",
      },
      {
        title: "4-комнатные",
        slug: "4-room",
      },
      {
        title: "Пентхаусы",
        slug: "penthouses",
      },
    ],
  },

  {
    title: "Дома",
    categorySlug: "houses",
    items: [
      {
        title: "Дома",
        slug: "houses",
      },
      {
        title: "Коттеджи",
        slug: "cottages",
      },
      {
        title: "Таунхаусы",
        slug: "townhouses",
      },
      {
        title: "Дуплексы",
        slug: "duplexes",
      },
      {
        title: "Части домов",
        slug: "part-of-house",
      },
      {
        title: "Дачи",
        slug: "dachas",
      },
    ],
  },

  {
    title: "Коммерция",
    categorySlug: "commercial",
    items: [
      {
        title: "Офисы",
        slug: "offices",
      },
      {
        title: "Готовый бизнес",
        slug: "business",
      },
      {
        title: "Торговые площади",
        slug: "retail",
      },
      {
        title: "Склады",
        slug: "warehouses",
      },
      {
        title: "Производственные",
        slug: "production",
      },
    ],
  },

  {
    title: "Земельные участки",
    categorySlug: "land",
    items: [
      {
        title: "ИЖС",
        slug: "izhs",
      },
      {
        title: "Садоводство",
        slug: "gardening",
      },
      {
        title: "Коммерческая земля",
        slug: "commercial-land",
      },
      {
        title: "ЛПХ",
        slug: "lph",
      },
      {
        title: "ДНП",
        slug: "dnp",
      },
    ],
  },

  {
    title: "Гаражи",
    categorySlug: "garages",
    items: [
      {
        title: "Гаражный бокс",
        slug: "garage-box",
      },
      {
        title: "Внутри ЖК",
        slug: "residential-complex",
      },
      {
        title: "Крытая стоянка",
        slug: "covered-parking",
      },
      {
        title: "Отдельный гараж",
        slug: "separate-garage",
      },
      {
        title: "Паркинг",
        slug: "parking",
      },
    ],
  },
];

// ============================================================
// СНЯТЬ
// ============================================================

const rentCategories: Category[] = [
  {
    title: "Квартиры",
    categorySlug: "apartments",
    items: [
      {
        title: "Студии",
        slug: "studios",
      },
      {
        title: "1-комнатные",
        slug: "1-room",
      },
      {
        title: "2-комнатные",
        slug: "2-room",
      },
      {
        title: "3-комнатные",
        slug: "3-room",
      },
      {
        title: "4-комнатные",
        slug: "4-room",
      },
    ],
  },

  {
    title: "Загородная недвижимость",
    categorySlug: "houses",
    items: [
      {
        title: "Дома",
        slug: "houses",
      },
      {
        title: "Коттеджи",
        slug: "cottages",
      },
      {
        title: "Дачи",
        slug: "dachas",
      },
      {
        title: "Таунхаусы",
        slug: "townhouses",
      },
    ],
  },

  {
    title: "Коммерция",
    categorySlug: "commercial",
    items: [
      {
        title: "Офисы",
        slug: "offices",
      },
      {
        title: "Склады",
        slug: "warehouses",
      },
      {
        title: "Торговые площади",
        slug: "retail",
      },
      {
        title: "Готовый бизнес",
        slug: "business",
      },
    ],
  },
];

// ============================================================
// СДАТЬ
// ============================================================

const leaseCategories: Category[] = [
  {
    title: "Квартиры",
    categorySlug: "apartments",
    items: [
      {
        title: "Студии",
        slug: "studios",
      },
      {
        title: "1-комнатные",
        slug: "1-room",
      },
      {
        title: "2-комнатные",
        slug: "2-room",
      },
      {
        title: "3-комнатные",
        slug: "3-room",
      },
      {
        title: "4-комнатные",
        slug: "4-room",
      },
    ],
  },

  {
    title: "Дома",
    categorySlug: "houses",
    items: [
      {
        title: "Дома",
        slug: "houses",
      },
      {
        title: "Коттеджи",
        slug: "cottages",
      },
      {
        title: "Таунхаусы",
        slug: "townhouses",
      },
      {
        title: "Дачи",
        slug: "dachas",
      },
    ],
  },

  {
    title: "Коммерция",
    categorySlug: "commercial",
    items: [
      {
        title: "Офисы",
        slug: "offices",
      },
      {
        title: "Торговые площади",
        slug: "retail",
      },
      {
        title: "Склады",
        slug: "warehouses",
      },
      {
        title: "Готовый бизнес",
        slug: "business",
      },
    ],
  },

  {
    title: "Гаражи",
    categorySlug: "garages",
    items: [
      {
        title: "Гаражи",
        slug: "garage-box",
      },
      {
        title: "Паркинг",
        slug: "parking",
      },
    ],
  },
];

// ============================================================
// КОМНАТЫ
// ============================================================

const roomOptions = [
  "Не важно",
  "Студия",
  "1",
  "2",
  "3",
  "4+",
];

// ============================================================
// ЦЕНЫ
// ============================================================

const priceOptions = [
  "Не важно",
  "До 3 млн ₽",
  "3–5 млн ₽",
  "5–8 млн ₽",
  "8–12 млн ₽",
  "12–20 млн ₽",
  "От 20 млн ₽",
];

// ============================================================
// ПЛОЩАДЬ
// ============================================================

const areaOptions = [
  "Не важно",
  "До 40 м²",
  "40–60 м²",
  "60–80 м²",
  "80–120 м²",
  "120–200 м²",
  "От 200 м²",
];

// ============================================================
// РАЙОН
// ============================================================

const locationOptions = [
  "Краснодар",
  "Центральный район",
  "ФМР",
  "ЮМР",
  "ГМР",
  "ККБ",
];

// ============================================================
// КАСТОМНЫЙ DROPDOWN
// ============================================================

type DropdownProps = {
  label: string;
  value: string;
  options: string[];
  open: boolean;
  disabled?: boolean;
  onOpen: () => void;
  onChange: (
    value: string
  ) => void;
};

function Dropdown({
  label,
  value,
  options,
  open,
  disabled = false,
  onOpen,
  onChange,
}: DropdownProps) {
  return (
    <div
      style={{
        position:
          "relative",
      }}
    >
      <button
        type="button"
        disabled={
          disabled
        }
        onClick={onOpen}
        className="search-input"
        style={{
          width:
            "100%",
          minHeight:
            "56px",
          display:
            "flex",
          alignItems:
            "center",
          justifyContent:
            "space-between",
          gap:
            "10px",
          textAlign:
            "left",
          cursor:
            disabled
              ? "not-allowed"
              : "pointer",
          opacity:
            disabled
              ? 0.6
              : 1,
        }}
      >
        <span
          style={{
            overflow:
              "hidden",
            textOverflow:
              "ellipsis",
            whiteSpace:
              "nowrap",
          }}
        >
          {value ? (
            <span
              style={{
                color:
                  "#111827",
                fontWeight:
                  600,
              }}
            >
              {value}
            </span>
          ) : (
            <span
              style={{
                color:
                  "#9ca3af",
              }}
            >
              {label}
            </span>
          )}
        </span>

        <span
          style={{
            color:
              "#9ca3af",
            fontSize:
              "15px",
            flexShrink:
              0,
          }}
        >
          {open
            ? "⌃"
            : "⌄"}
        </span>
      </button>

      {open &&
        !disabled && (
          <div
            style={{
              position:
                "absolute",
              top:
                "calc(100% + 8px)",
              left: 0,
              width:
                "100%",
              background:
                "#f1f3f7",
              borderRadius:
                "18px",
              padding:
                "8px",
              boxShadow:
                "0 15px 35px rgba(0,0,0,.14)",
              zIndex:
                200,
              maxHeight:
                "280px",
              overflowY:
                "auto",
            }}
          >
            {options.map(
              (option) => {
                const selected =
                  option ===
                  value;

                return (
                  <button
                    key={
                      option
                    }
                    type="button"
                    onClick={() =>
                      onChange(
                        option
                      )
                    }
                    style={{
                      width:
                        "100%",
                      border:
                        "none",
                      background:
                        selected
                          ? "#e5e7eb"
                          : "transparent",
                      borderRadius:
                        "12px",
                      padding:
                        "12px 10px",
                      display:
                        "flex",
                      alignItems:
                        "center",
                      gap:
                        "12px",
                      cursor:
                        "pointer",
                      textAlign:
                        "left",
                      color:
                        "#111827",
                      fontSize:
                        "14px",
                    }}
                  >
                    <span
                      style={{
                        width:
                          "15px",
                        height:
                          "15px",
                        minWidth:
                          "15px",
                        border:
                          "1.5px solid #ef3340",
                        borderRadius:
                          "4px",
                        display:
                          "flex",
                        alignItems:
                          "center",
                        justifyContent:
                          "center",
                        background:
                          selected
                            ? "#ef3340"
                            : "#ffffff",
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
                      {
                        option
                      }
                    </span>
                  </button>
                );
              }
            )}
          </div>
        )}
    </div>
  );
}

// ============================================================
// ФОРМА ЗАЯВКИ
// ============================================================

type ApplicationFormProps = {
  applicationType:
    | "Продать"
    | "Снять"
    | "Сдать";
  title: string;
};

function ApplicationForm({
  applicationType,
  title,
}: ApplicationFormProps) {
  const [propertyType, setPropertyType] =
    useState("");

  const [subType, setSubType] =
    useState("");

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

  const [openType, setOpenType] =
    useState(false);

  const [openSubType, setOpenSubType] =
    useState(false);

  const [openRooms, setOpenRooms] =
    useState(false);

  const selectedProperty =
    propertyTypes.find(
      (item) =>
        item.label ===
        propertyType
    );

  const availableSubTypes =
    selectedProperty
      ? subTypes[
          selectedProperty.value
        ] || []
      : [];

  async function submit(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setError("");
    setSuccess(false);

    if (!agreement) {
      setError(
        "Подтвердите согласие на обработку персональных данных."
      );
      return;
    }

    if (!name.trim()) {
      setError(
        "Введите имя."
      );
      return;
    }

    if (!phone.trim()) {
      setError(
        "Введите телефон."
      );
      return;
    }

    setLoading(true);

    try {
      const details = [
        `Заявка: ${applicationType}`,

        propertyType
          ? `Тип недвижимости: ${propertyType}`
          : "",

        subType
          ? `Подтип: ${subType}`
          : "",

        rooms
          ? `Комнатность: ${rooms}`
          : "",

        comment.trim()
          ? `Комментарий: ${comment.trim()}`
          : "",
      ].filter(Boolean);

      const response =
        await fetch(
          `${API_URL}/leads`,
          {
            method:
              "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body:
              JSON.stringify(
                {
                  name:
                    name.trim(),
                  phone:
                    phone.trim(),
                  comment:
                    details.join(
                      ". "
                    ),
                }
              ),
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
                (
                  item: any
                ) =>
                  typeof item ===
                  "string"
                    ? item
                    : item?.msg ||
                      item?.message ||
                      JSON.stringify(
                        item
                      )
              )
              .join(
                ", "
              );
        } else if (
          typeof data?.detail ===
          "string"
        ) {
          message =
            data.detail;
        }

        throw new Error(
          message
        );
      }

      setSuccess(
        true
      );

      setName("");
      setPhone("");
      setComment("");
      setPropertyType("");
      setSubType("");
      setRooms("");
      setAgreement(
        false
      );

      setOpenType(
        false
      );
      setOpenSubType(
        false
      );
      setOpenRooms(
        false
      );
    } catch (
      error
    ) {
      console.error(
        error
      );

      setError(
        error instanceof
          Error
          ? error.message
          : "Произошла ошибка."
      );
    } finally {
      setLoading(
        false
      );
    }
  }

  return (
    <form
      onSubmit={
        submit
      }
    >
      <div
        style={{
          display:
            "grid",
          gridTemplateColumns:
            "repeat(2, minmax(0, 1fr))",
          gap:
            "12px",
        }}
      >
        {/* Тип недвижимости */}

        <Dropdown
          label="Тип недвижимости"
          value={
            propertyType
          }
          options={propertyTypes.map(
            (item) =>
              item.label
          )}
          open={
            openType
          }
          onOpen={() => {
            setOpenType(
              !openType
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
            setOpenType(
              false
            );
          }}
        />

        {/* Подтип */}

        <Dropdown
          label={
            propertyType
              ? "Тип"
              : "Сначала выберите недвижимость"
          }
          value={
            subType
          }
          options={availableSubTypes.map(
            (item) =>
              item.label
          )}
          open={
            openSubType
          }
          disabled={
            !propertyType ||
            availableSubTypes.length ===
              0
          }
          onOpen={() => {
            setOpenSubType(
              !openSubType
            );
            setOpenType(
              false
            );
            setOpenRooms(
              false
            );
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

        {/* Комнатность */}

        <Dropdown
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
            setOpenType(
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

        {/* Имя */}

        <input
          className="search-input"
          required
          placeholder="Имя"
          value={
            name
          }
          onChange={(
            e
          ) =>
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
          value={
            phone
          }
          onChange={(
            e
          ) =>
            setPhone(
              e.target.value
            )
          }
        />

        {/* Комментарий */}

        <input
          className="search-input"
          placeholder="Комментарий"
          value={
            comment
          }
          onChange={(
            e
          ) =>
            setComment(
              e.target.value
            )
          }
        />

        {/* Кнопка */}

        <button
          type="submit"
          className="btn btn-red"
          disabled={
            loading
          }
          style={{
            border:
              "none",
            opacity:
              loading
                ? 0.7
                : 1,
          }}
        >
          {loading
            ? "Отправляем..."
            : "Оставить заявку"}
        </button>
      </div>

      {/* Согласие */}

      <label
        style={{
          display:
            "flex",
          alignItems:
            "flex-start",
          gap:
            "10px",
          marginTop:
            "12px",
          color:
            "rgba(255,255,255,.9)",
          fontSize:
            "12px",
          lineHeight:
            1.5,
          cursor:
            "pointer",
        }}
      >
        <input
          type="checkbox"
          checked={
            agreement
          }
          onChange={(
            e
          ) =>
            setAgreement(
              e.target.checked
            )
          }
          style={{
            marginTop:
              "2px",
            accentColor:
              "#ef4444",
          }}
        />

        <span>
          Нажимая кнопку
          «Оставить заявку»,
          я даю согласие
          на обработку
          персональных
          данных.
        </span>
      </label>

      {error && (
        <div
          style={{
            marginTop:
              "12px",
            padding:
              "12px 14px",
            borderRadius:
              "12px",
            background:
              "rgba(254,226,226,.95)",
            color:
              "#991b1b",
            fontSize:
              "13px",
          }}
        >
          {error}
        </div>
      )}

      {success && (
        <div
          style={{
            marginTop:
              "12px",
            padding:
              "12px 14px",
            borderRadius:
              "12px",
            background:
              "rgba(220,252,231,.95)",
            color:
              "#166534",
            fontSize:
              "13px",
            fontWeight:
              600,
          }}
        >
          {title} отправлена.
          Менеджер свяжется с
          вами.
        </div>
      )}
    </form>
  );
}

// ============================================================
// ГЛАВНЫЙ HERO
// ============================================================

export default function Hero() {
  const [activeTab, setActiveTab] =
    useState<
      | "Купить"
      | "Продать"
      | "Ипотека"
      | "Оценить"
      | "Снять"
      | "Сдать"
    >("Купить");

  const [propertyType, setPropertyType] =
    useState("");

  const [subType, setSubType] =
    useState("");

  const [rooms, setRooms] =
    useState("");

  const [price, setPrice] =
    useState("");

  const [area, setArea] =
    useState("");

  const [location, setLocation] =
    useState("");

  const [openType, setOpenType] =
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

  const [showFilters, setShowFilters] =
    useState(false);

  const [selectedCategory, setSelectedCategory] =
    useState<string | null>(
      null
    );

  // ==========================================================
  // Выбранный основной тип
  // ==========================================================

  const selectedPropertyType =
    propertyTypes.find(
      (item) =>
        item.label ===
        propertyType
    );

  const currentSubTypes =
    selectedPropertyType
      ? subTypes[
          selectedPropertyType
            .value
        ] || []
      : [];

  // ==========================================================
  // Категории под поиском
  // ==========================================================

  let categories: Category[] =
    [];

  if (
    activeTab ===
    "Купить"
  ) {
    categories =
      buyCategories;
  }

  if (
    activeTab ===
    "Снять"
  ) {
    categories =
      rentCategories;
  }

  if (
    activeTab ===
    "Сдать"
  ) {
    categories =
      leaseCategories;
  }

  // ==========================================================
  // Закрыть dropdown
  // ==========================================================

  const closeDropdowns =
    () => {
      setOpenType(
        false
      );
      setOpenSubType(
        false
      );
      setOpenRooms(
        false
      );
      setOpenPrice(
        false
      );
      setOpenArea(
        false
      );
      setOpenLocation(
        false
      );
    };

  // ==========================================================
  // Смена вкладки
  // ==========================================================

  const handleTabChange =
    (
      tab: typeof activeTab
    ) => {
      setActiveTab(
        tab
      );

      closeDropdowns();

      setShowFilters(
        false
      );

      setSelectedCategory(
        null
      );
    };

  // ==========================================================
  // ПОИСК
  // ==========================================================

  const handleSearch =
    () => {
      const typeData =
        propertyTypes.find(
          (item) =>
            item.label ===
            propertyType
        );

      if (
        typeData &&
        subType
      ) {
        const subtypeData =
          (
            subTypes[
              typeData.value
            ] || []
          ).find(
            (item) =>
              item.label ===
              subType
          );

        if (
          subtypeData
        ) {
          window.location.href =
            `/catalog/sale/${getCategorySlug(
              typeData.value
            )}/${subtypeData.slug}`;
          return;
        }
      }

      if (typeData) {
        window.location.href =
          `/catalog/sale/${getCategorySlug(
            typeData.value
          )}`;
        return;
      }

      window.location.href =
        "/catalog";
    };

  // ==========================================================
  // РЕНДЕР
  // ==========================================================

  return (
    <section className="hero">
      <div className="container hero-content">

        {/* ================================================== */}
        {/* HERO TEXT */}
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
          Покупка, продажа
          и аренда
          недвижимости в
          Краснодаре.
          Полное сопровождение
          сделки и персональный
          подход к каждому
          клиенту.
        </p>

        {/* ================================================== */}
        {/* СТАТИСТИКА */}
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
            zIndex:
              20,
          }}
        >

          {/* ================================================= */}
          {/* TABS */}
          {/* ================================================= */}

          <div
            className="search-tabs"
            style={{
              display:
                "flex",
              gap:
                "8px",
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
              (
                tab
              ) => (
                <button
                  key={
                    tab
                  }
                  type="button"
                  onClick={() =>
                    handleTabChange(
                      tab as typeof activeTab
                    )
                  }
                  className={
                    activeTab ===
                    tab
                      ? "search-tab active"
                      : "search-tab"
                  }
                >
                  {
                    tab
                  }
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
              {/* ============================================ */}
              {/* ФИЛЬТРЫ */}
              {/* ============================================ */}

              <div
                className="search-grid"
                style={{
                  display:
                    "grid",
                  gridTemplateColumns:
                    "repeat(4, minmax(0, 1fr))",
                  gap:
                    "12px",
                }}
              >

                {/* Тип */}

                <Dropdown
                  label="Тип недвижимости"
                  value={
                    propertyType
                  }
                  options={propertyTypes.map(
                    (item) =>
                      item.label
                  )}
                  open={
                    openType
                  }
                  onOpen={() => {
                    setOpenType(
                      !openType
                    );
                    setOpenSubType(
                      false
                    );
                    setOpenRooms(
                      false
                    );
                    setOpenPrice(
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
                    setOpenType(
                      false
                    );
                  }}
                />

                {/* Подтип */}

                <Dropdown
                  label={
                    propertyType
                      ? "Тип"
                      : "Выберите недвижимость"
                  }
                  value={
                    subType
                  }
                  options={currentSubTypes.map(
                    (item) =>
                      item.label
                  )}
                  open={
                    openSubType
                  }
                  disabled={
                    !propertyType ||
                    currentSubTypes.length ===
                      0
                  }
                  onOpen={() => {
                    setOpenSubType(
                      !openSubType
                    );
                    setOpenType(
                      false
                    );
                    setOpenRooms(
                      false
                    );
                    setOpenPrice(
                      false
                    );
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

                <Dropdown
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
                    setOpenType(
                      false
                    );
                    setOpenSubType(
                      false
                    );
                    setOpenPrice(
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

                <Dropdown
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
                    setOpenType(
                      false
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
                    "1fr auto auto auto",
                  gap:
                    "12px",
                  marginTop:
                    "12px",
                }}
              >
                {/* Площадь */}

                <Dropdown
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
                    setOpenType(
                      false
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
                    setArea(
                      value
                    );
                    setOpenArea(
                      false
                    );
                  }}
                />

                {/* Фильтры */}

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

                {/* Карта */}

                <Link
                  href="/map"
                  className="btn"
                  style={{
                    textDecoration:
                      "none",
                    display:
                      "flex",
                    alignItems:
                      "center",
                    justifyContent:
                      "center",
                  }}
                >
                  ◉ На карте
                </Link>

                {/* Поиск */}

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

              {/* ============================================ */}
              {/* РАЙОН */}
              {/* ============================================ */}

              <div
                style={{
                  marginTop:
                    "12px",
                }}
              >
                <Dropdown
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
                    setOpenType(
                      false
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
              {/* РАСШИРЕННЫЕ */}
              {/* ============================================ */}

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
                    display:
                      "grid",
                    gridTemplateColumns:
                      "repeat(3, 1fr)",
                    gap:
                      "12px",
                  }}
                >
                  <Dropdown
                    label="Тип недвижимости"
                    value={
                      propertyType
                    }
                    options={propertyTypes.map(
                      (item) =>
                        item.label
                    )}
                    open={
                      false
                    }
                    onOpen={() => {}}
                    onChange={() => {}}
                  />

                  <Dropdown
                    label="Тип"
                    value={
                      subType
                    }
                    options={currentSubTypes.map(
                      (item) =>
                        item.label
                    )}
                    open={
                      false
                    }
                    onOpen={() => {}}
                    onChange={() => {}}
                    disabled={
                      !propertyType
                    }
                  />

                  <Dropdown
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
              {/* КАТЕГОРИИ */}
              {/* ============================================ */}

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
                  dealType="sale"
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
            <ApplicationForm
              applicationType="Продать"
              title="Заявка на продажу недвижимости"
            />
          )}

          {/* ================================================= */}
          {/* СНЯТЬ */}
          {/* ================================================= */}

          {activeTab ===
            "Снять" && (
            <>
              <ApplicationForm
                applicationType="Снять"
                title="Заявка на аренду недвижимости"
              />

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
                  dealType="rent"
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
              <ApplicationForm
                applicationType="Сдать"
                title="Заявка на сдачу недвижимости"
              />

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
                  dealType="lease"
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
          {/* ИПОТЕКА */}
          {/* ================================================= */}

          {activeTab ===
            "Ипотека" && (
            <div
              style={{
                display:
                  "grid",
                gridTemplateColumns:
                  "repeat(2, minmax(0, 1fr))",
                gap:
                  "12px",
              }}
            >
              <Dropdown
                label="Тип недвижимости"
                value=""
                options={propertyTypes.map(
                  (item) =>
                    item.label
                )}
                open={
                  false
                }
                onOpen={() => {}}
                onChange={() => {}}
              />

              <Dropdown
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
                    "Форма заявки на ипотеку будет подключена к CRM."
                  )
                }
              >
                Оставить заявку
              </button>
            </div>
          )}

          {/* ================================================= */}
          {/* ОЦЕНИТЬ */}
          {/* ================================================= */}

          {activeTab ===
            "Оценить" && (
            <div
              style={{
                display:
                  "grid",
                gridTemplateColumns:
                  "repeat(2, minmax(0, 1fr))",
                gap:
                  "12px",
              }}
            >
              <Dropdown
                label="Тип недвижимости"
                value=""
                options={propertyTypes.map(
                  (item) =>
                    item.label
                )}
                open={
                  false
                }
                onOpen={() => {}}
                onChange={() => {}}
              />

              <Dropdown
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
                    "Форма оценки будет подключена к CRM."
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
        @media (max-width: 1100px) {
          .search-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }

        @media (max-width: 800px) {
          .search-grid {
            grid-template-columns: 1fr !important;
          }

          .search-box
            > div {
            overflow:
              visible !important;
          }
        }

        @media (max-width: 700px) {
          .search-box
            form
            > div:first-child {
            grid-template-columns:
              1fr !important;
          }
        }
      `}</style>
    </section>
  );
}

// ============================================================
// КАТЕГОРИИ
// ============================================================

function CategoryBlock({
  title,
  dealType,
  categories,
  selectedCategory,
  setSelectedCategory,
}: {
  title: string;
  dealType: DealMode;
  categories: Category[];
  selectedCategory: string | null;
  setSelectedCategory: (
    value: string | null
  ) => void;
}) {
  return (
    <>
      <div
        style={{
          display:
            "flex",
          alignItems:
            "center",
          justifyContent:
            "space-between",
          gap:
            "20px",
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
              margin:
                0,
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
          href={`/catalog/${dealType}/apartments`}
          style={{
            color:
              "#111827",
            textDecoration:
              "none",
            fontWeight:
              600,
            whiteSpace:
              "nowrap",
          }}
        >
          Все объявления →
        </Link>
      </div>

      <div
        style={{
          display:
            "grid",
          gridTemplateColumns:
            `repeat(${Math.min(
              categories.length,
              4
            )}, 1fr)`,
          gap:
            "12px",
        }}
      >
        {categories.map(
          (
            category
          ) => (
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
                  width:
                    "100%",
                  border:
                    "none",
                  background:
                    "transparent",
                  padding:
                    0,
                  display:
                    "flex",
                  justifyContent:
                    "space-between",
                  alignItems:
                    "center",
                  cursor:
                    "pointer",
                  fontSize:
                    "17px",
                  fontWeight:
                    700,
                  textAlign:
                    "left",
                  color:
                    "#111827",
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

              {category.items.map(
                (
                  item
                ) => (
                  <Link
                    key={
                      item.slug
                    }
                    href={`/catalog/${dealType}/${category.categorySlug}/${item.slug}`}
                    style={{
                      display:
                        "flex",
                      justifyContent:
                        "space-between",
                      alignItems:
                        "center",
                      padding:
                        "7px 0",
                      textDecoration:
                        "none",
                      color:
                        "#374151",
                      fontSize:
                        "14px",
                    }}
                  >
                    <span>
                      {
                        item.title
                      }
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
                  ✓ Категория выбрана
                </div>
              )}
            </div>
          )
        )}
      </div>
    </>
  );
}

// ============================================================
// SLUG ОСНОВНОЙ КАТЕГОРИИ
// ============================================================

function getCategorySlug(
  propertyType: string
) {
  const map: Record<
    string,
    string
  > = {
    apartment:
      "apartments",

    house:
      "houses",

    land:
      "land",

    commercial:
      "commercial",

    garage:
      "garages",
  };

  return (
    map[propertyType] ||
    "apartments"
  );
}