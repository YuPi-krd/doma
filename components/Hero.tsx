"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

const API_URL = "https://doma-nq4u.onrender.com";

/* ============================================================
   ТИПЫ
============================================================ */

type ApplicationType =
  | "Продать"
  | "Снять"
  | "Сдать";

type PropertyType =
  | "Квартиры"
  | "Дома"
  | "Земельные участки"
  | "Коммерция"
  | "Гаражи";

type Category = {
  title: string;
  items: {
    title: string;
    slug: string;
  }[];
};

/* ============================================================
   ОСНОВНЫЕ ТИПЫ
============================================================ */

const propertyTypes: PropertyType[] = [
  "Квартиры",
  "Дома",
  "Земельные участки",
  "Коммерция",
  "Гаражи",
];

/* ============================================================
   ПОДТИПЫ
============================================================ */

const subTypes: Record<
  PropertyType,
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
    "5-комнатные",
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

/* ============================================================
   ФИЛЬТРЫ
============================================================ */

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

/* ============================================================
   МАППИНГИ
============================================================ */

const typeMap: Record<
  PropertyType,
  string
> = {
  Квартиры: "apartment",
  Дома: "house",
  "Земельные участки": "land",
  Коммерция: "commercial",
  Гаражи: "garage",
};

const subtypeSlugMap: Record<
  string,
  string
> = {
  Квартиры: "apartments",

  "Квартиры во вторичке":
    "secondary",

  "Квартиры в новостройке":
    "new-buildings",

  /*
   * Важно:
   * "От застройщика" открывает
   * существующий раздел новостроек.
   */
  "Квартиры от застройщика":
    "new-buildings",

  Студии: "studios",

  "1-комнатные": "1-room",
  "2-комнатные": "2-room",
  "3-комнатные": "3-room",
  "4-комнатные": "4-room",
  "5-комнатные": "5-room",

  Пентхаусы: "penthouses",

  Дом: "houses",
  "Часть дома": "part-of-house",
  Таунхаус: "townhouses",
  Дуплекс: "duplexes",
  Коттедж: "cottages",
  Дача: "dachas",

  ИЖС: "izhs",
  Садоводство: "gardening",
  Коммерческое:
    "commercial-land",

  "Личное подсобное хозяйство":
    "lph",

  ДНП: "dnp",

  Офисное: "offices",
  "Готовый бизнес": "business",
  "Отдельное здание":
    "separate-building",

  Производственное:
    "production",

  Складское: "warehouses",

  "Торговое помещение":
    "retail",

  "Бокс в гаражном кооперативе":
    "garage-box",

  "Внутри жилого комплекса":
    "residential-complex",

  "Крытая стоянка":
    "covered-parking",

  "Отдельно стоящий гараж":
    "separate-garage",

  "Отдельно стоящий паркинг":
    "parking",

  Комнаты: "secondary",
};

/* ============================================================
   КАТЕГОРИИ
============================================================ */

const buyCategories: Category[] = [
  {
    title: "Квартиры",
    items: [
      {
        title: "Студии",
        slug: "studios",
      },
      {
        title: "1 комнатные",
        slug: "1-room",
      },
      {
        title: "2 комнатные",
        slug: "2-room",
      },
      {
        title: "3 комнатные",
        slug: "3-room",
      },
      {
        title: "4 комнатные",
        slug: "4-room",
      },
      {
        title: "5 комнатные",
        slug: "5-room",
      },
      {
        title: "Пентхаусы",
        slug: "penthouses",
      },
      {
        title: "От застройщика",
        slug: "new-buildings",
      },
    ],
  },

  {
    title: "Дома",
    items: [
      {
        title: "Дачи",
        slug: "dachas",
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
    ],
  },

  {
    title: "Коммерция",
    items: [
      {
        title: "Торговые площади",
        slug: "retail",
      },
      {
        title: "Коммерческая земля",
        slug: "commercial-land",
      },
      {
        title: "Офисы",
        slug: "offices",
      },
      {
        title: "Бизнес",
        slug: "business",
      },
      {
        title: "Склады",
        slug: "warehouses",
      },
    ],
  },

  {
    title: "Земельные участки",
    items: [
      {
        title: "Участки",
        slug: "izhs",
      },
      {
        title: "Под ИЖС",
        slug: "izhs",
      },
      {
        title: "Садоводство",
        slug: "gardening",
      },
    ],
  },
];

const rentCategories: Category[] = [
  {
    title: "Квартиры",
    items: [
      {
        title: "1-комнатная",
        slug: "1-room",
      },
      {
        title: "2-комнатная",
        slug: "2-room",
      },
      {
        title: "3-комнатная",
        slug: "3-room",
      },
      {
        title: "4-комнатная",
        slug: "4-room",
      },
      {
        title: "Квартиры-студии",
        slug: "studios",
      },
      {
        title: "Комнаты",
        slug: "rooms",
      },
    ],
  },

  {
    title:
      "Загородная недвижимость",
    items: [
      {
        title: "Коттеджи",
        slug: "cottages",
      },
      {
        title: "Дома",
        slug: "houses",
      },
      {
        title: "Дачи",
        slug: "dachas",
      },
      {
        title: "Таунхаусы",
        slug: "townhouses",
      },
      {
        title: "Участки",
        slug: "izhs",
      },
    ],
  },

  {
    title: "Коммерческая",
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
        title: "Готовый бизнес",
        slug: "business",
      },
      {
        title: "Торговые площади",
        slug: "retail",
      },
    ],
  },
];

const leaseCategories: Category[] = [
  {
    title: "Квартиры",
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
    items: [
      {
        title: "Дома",
        slug: "houses",
      },
      {
        title: "Дачи",
        slug: "dachas",
      },
      {
        title: "Таунхаусы",
        slug: "townhouses",
      },
      {
        title: "Коттеджи",
        slug: "cottages",
      },
    ],
  },

  {
    title: "Коммерция",
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
    items: [
      {
        title: "Гаражи",
        slug: "garage-box",
      },
      {
        title: "Машино-места",
        slug: "parking",
      },
    ],
  },
];

/* ============================================================
   DROPDOWN
============================================================ */

type DropdownProps = {
  label: string;
  value: string;
  options: string[];
  open: boolean;
  onOpen: () => void;
  onChange: (
    value: string
  ) => void;
};

function CustomDropdown({
  label,
  value,
  options,
  open,
  onOpen,
  onChange,
}: DropdownProps) {
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
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
          padding:
            "0 16px",
        }}
      >
        <span
          style={{
            color: value
              ? "#111827"
              : "#9ca3af",
            fontWeight: value
              ? 600
              : 400,
            overflow:
              "hidden",
            textOverflow:
              "ellipsis",
            whiteSpace:
              "nowrap",
          }}
        >
          {value || label}
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
            top:
              "calc(100% + 8px)",
            left: 0,
            right: 0,
            background:
              "#f1f3f7",
            borderRadius:
              "18px",
            padding: "8px",
            boxShadow:
              "0 15px 35px rgba(0,0,0,.12)",
            zIndex: 1000,
            maxHeight:
              "280px",
            overflowY:
              "auto",
          }}
        >
          {options.length ===
          0 ? (
            <div
              style={{
                padding:
                  "12px 10px",
                color:
                  "#9ca3af",
                fontSize:
                  "14px",
              }}
            >
              Нет вариантов
            </div>
          ) : (
            options.map(
              (option) => {
                const selected =
                  option === value;

                return (
                  <button
                    key={option}
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
                        "transparent",
                      borderRadius:
                        "12px",
                      padding:
                        "11px 10px",
                      display:
                        "flex",
                      alignItems:
                        "center",
                      gap: "12px",
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
                          "14px",
                        height:
                          "14px",
                        minWidth:
                          "14px",
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
                            : "transparent",
                        color:
                          "white",
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
              }
            )
          )}
        </div>
      )}
    </div>
  );
}

/* ============================================================
   SUCCESS MODAL
============================================================ */

type SuccessModalProps = {
  open: boolean;
  title: string;
  onClose: () => void;
};

function SuccessModal({
  open,
  title,
  onClose,
}: SuccessModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div
      onMouseDown={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        background:
          "rgba(15,23,42,.62)",
        display: "flex",
        alignItems:
          "center",
        justifyContent:
          "center",
        padding: "20px",
        backdropFilter:
          "blur(3px)",
      }}
    >
      <div
        onMouseDown={(e) =>
          e.stopPropagation()
        }
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "520px",
          background:
            "#ffffff",
          borderRadius:
            "26px",
          padding:
            "34px 30px 30px",
          boxShadow:
            "0 25px 70px rgba(0,0,0,.22)",
        }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Закрыть"
          style={{
            position:
              "absolute",
            top: "16px",
            right: "16px",
            width: "40px",
            height: "40px",
            borderRadius:
              "50%",
            border:
              "1px solid #e5e7eb",
            background:
              "#ffffff",
            color:
              "#111827",
            fontSize:
              "24px",
            lineHeight: 1,
            cursor:
              "pointer",
          }}
        >
          ×
        </button>

        <h2
          style={{
            margin:
              "0 50px 12px 0",
            color:
              "#0f172a",
            fontSize:
              "32px",
            fontWeight:
              500,
            lineHeight:
              1.2,
          }}
        >
          {title}
        </h2>

        <p
          style={{
            margin:
              "0 0 26px",
            color:
              "#64748b",
            fontSize:
              "16px",
            lineHeight:
              1.6,
          }}
        >
          Оставьте свои контакты,
          и менеджер свяжется с вами.
        </p>

        <div
          style={{
            borderRadius:
              "18px",
            background:
              "#dcfce7",
            padding:
              "22px 20px",
            color:
              "#166534",
          }}
        >
          <div
            style={{
              fontSize:
                "16px",
              fontWeight:
                700,
              marginBottom:
                "5px",
            }}
          >
            Заявка отправлена.
          </div>

          <div
            style={{
              fontSize:
                "16px",
              lineHeight:
                1.5,
            }}
          >
            Менеджер свяжется с вами
            в ближайшее время.
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   ФОРМА ЗАЯВКИ
============================================================ */

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
  const [
    propertyType,
    setPropertyType,
  ] = useState("");

  const [
    subType,
    setSubType,
  ] = useState("");

  const [
    rooms,
    setRooms,
  ] = useState("");

  const [
    name,
    setName,
  ] = useState("");

  const [
    phone,
    setPhone,
  ] = useState("");

  const [
    comment,
    setComment,
  ] = useState("");

  const [
    agreement,
    setAgreement,
  ] = useState(false);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    success,
    setSuccess,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    openType,
    setOpenType,
  ] = useState(false);

  const [
    openSubType,
    setOpenSubType,
  ] = useState(false);

  const [
    openRooms,
    setOpenRooms,
  ] = useState(false);

  const [
    showSuccessModal,
    setShowSuccessModal,
  ] = useState(false);

  const availableSubTypes =
    propertyType
      ? subTypes[
          propertyType as PropertyType
        ] || []
      : [];

  async function handleSubmit(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setError("");
    setSuccess(false);

    const cleanName =
      name.trim();

    const cleanPhone =
      phone.trim();

    const cleanComment =
      comment.trim();

    if (
      cleanName.length < 2
    ) {
      setError(
        "Введите имя."
      );
      return;
    }

    if (
      cleanPhone.length < 6
    ) {
      setError(
        "Введите корректный телефон."
      );
      return;
    }

    if (!agreement) {
      setError(
        "Подтвердите согласие на обработку персональных данных."
      );
      return;
    }

    setLoading(true);

    try {
      const commentParts =
        [
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

          cleanComment
            ? `Комментарий: ${cleanComment}`
            : "",
        ].filter(Boolean);

      const response =
        await fetch(
          `${API_URL}/leads`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify(
              {
                property_id:
                  null,

                name:
                  cleanName,

                phone:
                  cleanPhone,

                comment:
                  commentParts.join(
                    ". "
                  ),
              }
            ),
          }
        );

      const raw =
        await response.text();

      let data: any = {};

      try {
        data = raw
          ? JSON.parse(raw)
          : {};
      } catch {
        data = {};
      }

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
            data.detail
              .message ||
            JSON.stringify(
              data.detail
            );
        }

        throw new Error(
          message
        );
      }

      setSuccess(true);
      setShowSuccessModal(
        true
      );

      setName("");
      setPhone("");
      setComment("");
      setPropertyType("");
      setSubType("");
      setRooms("");
      setAgreement(false);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Произошла ошибка при отправке заявки."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <form
        onSubmit={
          handleSubmit
        }
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(2, minmax(0, 1fr))",
            gap: "12px",
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
              openType
            }
            onOpen={() => {
              setOpenType(
                (value) =>
                  !value
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
            open={
              openSubType
            }
            onOpen={() => {
              if (
                !availableSubTypes.length
              ) {
                return;
              }

              setOpenSubType(
                (value) =>
                  !value
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
                (value) =>
                  !value
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

          <input
            className="search-input"
            required
            placeholder="Имя"
            value={name}
            onChange={(e) =>
              setName(
                e.target.value
              )
            }
          />

          <input
            className="search-input"
            required
            type="tel"
            placeholder="+7 (999) 999-99-99"
            value={phone}
            onChange={(e) =>
              setPhone(
                e.target.value
              )
            }
          />

          <input
            className="search-input"
            placeholder="Комментарий"
            value={
              comment
            }
            onChange={(e) =>
              setComment(
                e.target.value
              )
            }
          />

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
              cursor:
                loading
                  ? "not-allowed"
                  : "pointer",
            }}
          >
            {loading
              ? "Отправляем..."
              : "Оставить заявку"}
          </button>
        </div>

        <label
          style={{
            display: "flex",
            alignItems:
              "flex-start",
            gap: "10px",
            marginTop:
              "12px",
            color:
              "rgba(255,255,255,.9)",
            fontSize:
              "12px",
            lineHeight:
              1.5,
          }}
        >
          <input
            type="checkbox"
            checked={
              agreement
            }
            onChange={(e) =>
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
            «Оставить заявку», я
            даю согласие на обработку
            персональных данных.
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
            Менеджер свяжется
            с вами.
          </div>
        )}
      </form>

      <SuccessModal
        open={
          showSuccessModal
        }
        title={title}
        onClose={() =>
          setShowSuccessModal(
            false
          )
        }
      />
    </>
  );
}

/* ============================================================
   HERO
============================================================ */

export default function Hero() {
  const [
    activeTab,
    setActiveTab,
  ] = useState(
    "Купить"
  );

  const [
    propertyType,
    setPropertyType,
  ] = useState<
    PropertyType | ""
  >("");

  const [
    subType,
    setSubType,
  ] = useState("");

  const [
    rooms,
    setRooms,
  ] = useState("");

  const [
    price,
    setPrice,
  ] = useState("");

  const [
    area,
    setArea,
  ] = useState("");

  const [
    location,
    setLocation,
  ] = useState("");

  const [
    showFilters,
    setShowFilters,
  ] = useState(false);

  const [
    selectedCategory,
    setSelectedCategory,
  ] = useState<
    string | null
  >(null);

  const [
    openPropertyType,
    setOpenPropertyType,
  ] = useState(false);

  const [
    openSubType,
    setOpenSubType,
  ] = useState(false);

  const [
    openRooms,
    setOpenRooms,
  ] = useState(false);

  const [
    openPrice,
    setOpenPrice,
  ] = useState(false);

  const [
    openArea,
    setOpenArea,
  ] = useState(false);

  const [
    openLocation,
    setOpenLocation,
  ] = useState(false);

  const currentSubTypes =
    propertyType
      ? subTypes[
          propertyType
        ]
      : [];

  let categories:
    Category[] = [];

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

  const closeDropdowns =
    () => {
      setOpenPropertyType(
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

  const handleTabChange =
    (
      tab: string
    ) => {
      setActiveTab(tab);

      closeDropdowns();

      setSelectedCategory(
        null
      );

      setShowFilters(
        false
      );
    };

  const handleSearch =
    () => {
      const params =
        new URLSearchParams();

      const type =
        propertyType
          ? typeMap[
              propertyType
            ]
          : "";

      const deal =
        activeTab ===
        "Снять"
          ? "rent"
          : activeTab ===
            "Сдать"
          ? "lease"
          : "sale";

      if (type) {
        params.set(
          "type",
          type
        );

        params.set(
          "property_type",
          type
        );
      }

      if (subType) {
        const slug =
          subtypeSlugMap[
            subType
          ];

        if (slug) {
          params.set(
            "subtype",
            slug
          );

          params.set(
            "property_subtype",
            slug
          );
        }
      }

      if (
        rooms &&
        rooms !== "Не важно"
      ) {
        params.set(
          "rooms",
          rooms
        );
      }

      if (
        price &&
        price !==
          "Не важно"
      ) {
        params.set(
          "price",
          price
        );
      }

      if (
        area &&
        area !==
          "Не важно"
      ) {
        params.set(
          "area",
          area
        );
      }

      if (
        location &&
        location !==
          "Не важно"
      ) {
        params.set(
          "location",
          location
        );
      }

      params.set(
        "deal_type",
        deal
      );

      const categorySlug =
        type ===
        "apartment"
          ? "apartments"
          : type ===
            "house"
          ? "houses"
          : type ===
            "land"
          ? "land"
          : type ===
            "commercial"
          ? "commercial"
          : type ===
            "garage"
          ? "garages"
          : "apartments";

      const subtypeSlug =
        subType
          ? subtypeSlugMap[
              subType
            ] || ""
          : "";

      let url =
        `/catalog/${deal}/${categorySlug}`;

      if (
        subtypeSlug &&
        subtypeSlug !==
          categorySlug
      ) {
        url +=
          `/${subtypeSlug}`;
      }

      const query =
        params.toString();

      window.location.href =
        query
          ? `${url}?${query}`
          : url;
    };

  return (
    <section className="hero">
      <div className="container hero-content">

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
          Покупка, продажа и
          аренда недвижимости
          в Краснодаре. Полное
          сопровождение сделки
          и персональный подход
          к каждому клиенту.
        </p>

        <div
          style={{
            display:
              "flex",
            gap: "50px",
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

        <div
          className="search-box"
          style={{
            position:
              "relative",
            zIndex: 20,
          }}
        >

          <div
            className="search-tabs"
            style={{
              display:
                "flex",
              gap: "8px",
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
                  key={tab}
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
                  {tab}
                </button>
              )
            )}
          </div>

          {/* ====================================================
             КУПИТЬ
          ==================================================== */}

          {activeTab ===
            "Купить" && (
            <>
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
                      (value) =>
                        !value
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
                  }}
                  onChange={(
                    value
                  ) => {
                    const nextType =
                      value as PropertyType;

                    setPropertyType(
                      nextType
                    );

                    /*
                     * При смене
                     * основного типа
                     * подтип сбрасывается.
                     */
                    setSubType(
                      ""
                    );

                    setOpenPropertyType(
                      false
                    );
                  }}
                />

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
                      !currentSubTypes.length
                    ) {
                      return;
                    }

                    setOpenSubType(
                      (value) =>
                        !value
                    );

                    setOpenPropertyType(
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
                      (value) =>
                        !value
                    );

                    setOpenPropertyType(
                      false
                    );

                    setOpenSubType(
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
                      (value) =>
                        !value
                    );

                    setOpenPropertyType(
                      false
                    );

                    setOpenSubType(
                      false
                    );

                    setOpenRooms(
                      false
                    );

                    setOpenArea(
                      false
                    );

                    setOpenLocation(
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

              <div
                className="search-grid"
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
                      (value) =>
                        !value
                    );

                    setOpenPropertyType(
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

                    setOpenLocation(
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

                <button
                  type="button"
                  className="btn"
                  onClick={() =>
                    setShowFilters(
                      (value) =>
                        !value
                    )
                  }
                >
                  ☷ Все фильтры
                </button>

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

              <div
                style={{
                  marginTop:
                    "12px",
                  position:
                    "relative",
                  zIndex:
                    30,
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
                      (value) =>
                        !value
                    );

                    setOpenPropertyType(
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
                    position:
                      "relative",
                    zIndex:
                      20,
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
                    onOpen={() =>
                      undefined
                    }
                    onChange={() =>
                      undefined
                    }
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
                    onOpen={() =>
                      undefined
                    }
                    onChange={() =>
                      undefined
                    }
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
                    onOpen={() =>
                      undefined
                    }
                    onChange={() =>
                      undefined
                    }
                  />
                </div>
              )}

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
                  dealType="sale"
                />
              </div>
            </>
          )}

          {/* ====================================================
             ПРОДАТЬ
          ==================================================== */}

          {activeTab ===
            "Продать" && (
            <ApplicationForm
              applicationType="Продать"
              title="Заявка на продажу недвижимости"
            />
          )}

          {/* ====================================================
             СНЯТЬ
          ==================================================== */}

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
                  categories={
                    rentCategories
                  }
                  selectedCategory={
                    selectedCategory
                  }
                  setSelectedCategory={
                    setSelectedCategory
                  }
                  dealType="rent"
                />
              </div>
            </>
          )}

          {/* ====================================================
             СДАТЬ
          ==================================================== */}

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
                  categories={
                    leaseCategories
                  }
                  selectedCategory={
                    selectedCategory
                  }
                  setSelectedCategory={
                    setSelectedCategory
                  }
                  dealType="lease"
                />
              </div>
            </>
          )}

          {/* ====================================================
             ИПОТЕКА / ОЦЕНКА
          ==================================================== */}

          {(
            activeTab ===
              "Ипотека" ||
            activeTab ===
              "Оценить"
          ) && (
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
                      key={
                        item
                      }
                      value={
                        item
                      }
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
                      key={
                        item
                      }
                      value={
                        item
                      }
                    >
                      {item}
                    </option>
                  )
                )}
              </select>

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
    </section>
  );
}

/* ============================================================
   CATEGORY BLOCK
============================================================ */

type CategoryBlockProps = {
  title: string;
  categories: Category[];
  selectedCategory:
    | string
    | null;
  setSelectedCategory: (
    category:
      | string
      | null
  ) => void;
  dealType:
    | "sale"
    | "rent"
    | "lease";
};

function CategoryBlock({
  title,
  categories,
  selectedCategory,
  setSelectedCategory,
  dealType,
}: CategoryBlockProps) {
  return (
    <>
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
              margin: 0,
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
        className="category-grid"
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
                  padding: 0,
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

              {category.items.map(
                (item) => (
                  <Link
                    key={
                      `${category.title}-${item.slug}`
                    }
                    href={`/catalog/${dealType}/${categorySlugFromTitle(
                      category.title
                    )}/${item.slug}`}
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
                  ✓ Категория
                  выбрана
                </div>
              )}
            </div>
          )
        )}
      </div>
    </>
  );
}

/* ============================================================
   SLUG КАТЕГОРИИ
============================================================ */

function categorySlugFromTitle(
  title: string
) {
  switch (title) {
    case "Квартиры":
      return "apartments";

    case "Дома":
      return "houses";

    case "Земельные участки":
      return "land";

    case "Коммерция":
    case "Коммерческая":
      return "commercial";

    case "Гаражи":
      return "garages";

    case "Загородная недвижимость":
      return "houses";

    default:
      return "apartments";
  }
}