"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import type { CSSProperties } from "react";

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


type SiteSettings = {
  hero_eyebrow: string;
  hero_title_line1: string;
  hero_title_line2: string;
  hero_title_line3: string;
  hero_description: string;
  hero_image: string | null;
  stat1_value: string;
  stat1_label: string;
  stat2_value: string;
  stat2_label: string;
  stat3_value: string;
  stat3_label: string;
};

const DEFAULT_SITE_SETTINGS: SiteSettings = {
  hero_eyebrow: "НЕДВИЖИМОСТЬ • КРАСНОДАР",
  hero_title_line1: "Найдём место,",
  hero_title_line2: "которое станет",
  hero_title_line3: "домом",
  hero_description:
    "Покупка, продажа и аренда недвижимости в Краснодаре. Полное сопровождение сделки и персональный подход к каждому клиенту.",
  hero_image: null,
  stat1_value: "500+",
  stat1_label: "Объектов",
  stat2_value: "150+",
  stat2_label: "Сделок",
  stat3_value: "98%",
  stat3_label: "Довольных клиентов",
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
        aria-expanded={open}
        style={{
          width: "100%",
          minHeight: "56px",
          height: "56px",
          boxSizing: "border-box",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "10px",
          border: value ? "1px solid #e7e9ef" : "1px solid transparent",
          borderRadius: "999px",
          background: "#f1f3f7",
          cursor: "pointer",
          textAlign: "left",
          padding: value ? "8px 18px" : "0 18px",
          transition: "background .18s ease, border-color .18s ease, box-shadow .18s ease",
        }}
      >
        <span style={{ minWidth: 0, display: "flex", flexDirection: "column", gap: value ? "2px" : 0, overflow: "hidden" }}>
          {value && <span style={{ color: "#8992a0", fontSize: "11px", lineHeight: 1.15, fontWeight: 500 }}>{label}</span>}
          <span
            style={{
              color: value ? "#171b22" : "#8992a0",
              fontWeight: value ? 600 : 400,
              fontSize: value ? "16px" : "17px",
              lineHeight: 1.25,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {value || label}
          </span>
        </span>

        <span
          style={{
            color: "#9ca3af",
            fontSize: "18px",
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
            background: "#f1f3f7",
            borderRadius: "22px",
            padding: "8px",
            border: "1px solid #edf0f5",
            boxShadow: "0 15px 35px rgba(0,0,0,.12)",
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
                      background:
                        selected ? "#fff0f1" : "#ffffff",
                      border: selected ? "1px solid #ef4440" : "1px solid transparent",
                      borderRadius:
                        "999px",
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
                        selected ? "#991b1b" : "#111827",
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
                          "50%",
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
   ОВАЛЬНЫЙ МУЛЬТИВЫБОР ДЛЯ РАСШИРЕННЫХ ФИЛЬТРОВ
============================================================ */

type MultiSelectDropdownProps = {
  label: string;
  value: string[];
  options: string[];
  onChange: (value: string[]) => void;
};

function MultiSelectDropdown({ label, value, options, onChange }: MultiSelectDropdownProps) {
  const [open, setOpen] = useState(false);
  const summary = value.length ? value.join(", ") : label;

  return (
    <div style={{ position: "relative", minWidth: 0, width: "100%" }}>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        style={{
          width: "100%", minHeight: "46px", boxSizing: "border-box", border: "1px solid #edf0f5",
          borderRadius: "999px", background: "#f1f3f7", color: value.length ? "#202631" : "#8992a0",
          padding: "0 16px", display: "flex", alignItems: "center", justifyContent: "space-between",
          gap: "10px", textAlign: "left", cursor: "pointer", fontSize: "13px", fontFamily: "inherit",
        }}
      >
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{summary}</span>
        <span style={{ flexShrink: 0, color: "#8992a0" }}>{open ? "⌃" : "⌄"}</span>
      </button>
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 7px)", left: 0, right: 0, zIndex: 1200,
          maxHeight: "230px", overflowY: "auto", padding: "7px", borderRadius: "24px",
          background: "#f1f3f7", border: "1px solid #edf0f5", boxShadow: "0 14px 30px rgba(15,23,42,.16)",
        }}>
          {options.map((option) => {
            const selected = value.includes(option);
            return (
              <button key={option} type="button" onClick={() => {
                onChange(selected ? value.filter((item) => item !== option) : [...value, option]);
              }} style={{
                width: "100%", minHeight: "44px", border: "none", borderRadius: "999px", marginBottom: "2px",
                padding: "0 12px", background: selected ? "#e5e7eb" : "#ffffff", display: "flex", alignItems: "center",
                gap: "11px", textAlign: "left", color: "#111827", cursor: "pointer", fontSize: "13px", fontFamily: "inherit",
              }}>
                <span style={{
                  width: "14px", height: "14px", flexShrink: 0, borderRadius: "4px", border: "1px solid #ff3344",
                  background: selected ? "#ff3344" : "transparent", color: "white", display: "inline-flex", alignItems: "center",
                  justifyContent: "center", fontSize: "10px", fontWeight: 700,
                }}>{selected ? "✓" : ""}</span>
                <span>{option}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ============================================================
   RANGE DROPDOWN — PRICE / AREA
============================================================ */

type RangeDropdownProps = {
  label: string;
  from: string;
  to: string;
  open: boolean;
  onToggle: () => void;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
  suffix?: string;
};

function RangeDropdown({ label, from, to, open, onToggle, onFromChange, onToChange, suffix }: RangeDropdownProps) {
  const hasValue = Boolean(from || to);
  const summary = from || to
    ? `${from ? `От ${from}${suffix || ""}` : ""}${from && to ? " · " : ""}${to ? `До ${to}${suffix || ""}` : ""}`
    : "";

  return (
    <div style={{ position: "relative", width: "100%", minWidth: 0 }}>
      <button
        type="button"
        aria-expanded={open}
        onClick={onToggle}
        className="search-input"
        style={{
          width: "100%", minHeight: "56px", height: "56px", boxSizing: "border-box", display: "flex", alignItems: "center",
          justifyContent: "space-between", gap: "10px", border: hasValue ? "1px solid #e7e9ef" : "1px solid transparent",
          borderRadius: "999px", background: "#f1f3f7", cursor: "pointer", textAlign: "left",
          padding: hasValue ? "8px 18px" : "0 18px", transition: "background .18s ease, border-color .18s ease",
        }}
      >
        <span style={{ minWidth: 0, display: "flex", flexDirection: "column", gap: hasValue ? "2px" : 0, overflow: "hidden" }}>
          {hasValue && <span style={{ color: "#8992a0", fontSize: "11px", lineHeight: 1.15 }}>{label}</span>}
          <span style={{ color: hasValue ? "#171b22" : "#8992a0", fontSize: hasValue ? "16px" : "17px", lineHeight: 1.25, fontWeight: hasValue ? 600 : 400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {summary || label}
          </span>
        </span>
        <span style={{ color: "#8992a0", fontSize: "18px", flexShrink: 0 }}>{open ? "⌃" : "⌄"}</span>
      </button>
      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 8px)", left: 0, right: 0, zIndex: 1100, display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "8px", padding: "8px", borderRadius: "999px", background: "#ffffff", border: "1px solid #edf0f5", boxShadow: "0 12px 28px rgba(15,23,42,.12)" }}>
          <input aria-label={`${label}: от`} inputMode="numeric" type="number" min="0" placeholder="От" value={from} onChange={(e) => onFromChange(e.target.value)} style={{ width: "100%", minWidth: 0, height: "46px", boxSizing: "border-box", border: "none", outline: "none", borderRadius: "999px", padding: "0 14px", background: "#f1f3f7", color: "#202631", fontSize: "14px" }} />
          <input aria-label={`${label}: до`} inputMode="numeric" type="number" min="0" placeholder="До" value={to} onChange={(e) => onToChange(e.target.value)} style={{ width: "100%", minWidth: 0, height: "46px", boxSizing: "border-box", border: "none", outline: "none", borderRadius: "999px", padding: "0 14px", background: "#f1f3f7", color: "#202631", fontSize: "14px" }} />
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

  const [areaFrom, setAreaFrom] = useState("");
  const [areaTo, setAreaTo] = useState("");
  const [price, setPrice] = useState("");

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

  const [openArea, setOpenArea] = useState(false);

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

  // Комнатность доступна только для квартир.
  const isApartment = propertyType === "Квартиры";

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

          areaFrom || areaTo
            ? `Площадь: ${areaFrom ? `от ${areaFrom} м²` : ""}${areaFrom && areaTo ? " до " : ""}${areaTo ? `${areaTo} м²` : ""}`
            : "",

          price.trim()
            ? `${applicationType === "Сдать" ? "Арендная плата" : "Цена"}: ${price.trim()} ₽${applicationType === "Сдать" ? " в месяц" : ""}`
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
      setAreaFrom("");
      setAreaTo("");
      setPrice("");
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
        aria-label={title}
        onSubmit={handleSubmit}
      >
        <div
          className="application-form-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
            gap: "10px",
            alignItems: "center",
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

              setOpenArea(false);
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

              if (value !== "Квартиры") {
                setRooms("");
                setOpenRooms(false);
              }

              setOpenType(
                false
              );
            }}
          />

          {!isApartment && (
            <CustomDropdown
              label={propertyType ? "Тип" : "Сначала выберите недвижимость"}
              value={subType}
              options={availableSubTypes}
              open={openSubType}
              onOpen={() => {
                if (!availableSubTypes.length) return;
                setOpenSubType((value) => !value);
                setOpenType(false);
                setOpenRooms(false);
                setOpenArea(false);
              }}
              onChange={(value) => {
                setSubType(value);
                setOpenSubType(false);
              }}
            />
          )}

          {isApartment && (
            <CustomDropdown
              label="Комнатность"
              value={rooms}
              options={roomOptions}
              open={openRooms}
              onOpen={() => {
                setOpenRooms((value) => !value);
                setOpenType(false);
                setOpenSubType(false);
                setOpenArea(false);
              }}
              onChange={(value) => {
                setRooms(value);
                setOpenRooms(false);
              }}
            />
          )}

          <input
            className="search-input application-pill-input"
            type="number"
            min="0"
            inputMode="numeric"
            placeholder={applicationType === "Сдать" ? "Арендная плата, ₽/мес." : "Цена, ₽"}
            aria-label={applicationType === "Сдать" ? "Арендная плата в рублях за месяц" : "Цена в рублях"}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />

          <RangeDropdown
            label="Площадь"
            from={areaFrom}
            to={areaTo}
            open={openArea}
            onToggle={() => {
              setOpenArea((value) => !value);
              setOpenType(false);
              setOpenSubType(false);
              setOpenRooms(false);
            }}
            onFromChange={setAreaFrom}
            onToChange={setAreaTo}
            suffix=" м²"
          />

          <input
            className="search-input application-pill-input"
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
            className="search-input application-pill-input"
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
            className="search-input application-pill-input"
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
            className="btn btn-red application-submit"
            disabled={loading}
            style={{
              width: "100%",
              minWidth: 0,
              minHeight: "56px",
              height: "56px",
              boxSizing: "border-box",
              border: "none",
              borderRadius: "999px",
              padding: "0 16px",
              background: "linear-gradient(135deg, #ff4b55 0%, #ed2635 100%)",
              boxShadow: "0 8px 18px rgba(239, 51, 64, .18)",
              opacity: loading ? 0.72 : 1,
              cursor: loading ? "not-allowed" : "pointer",
              fontFamily: "inherit",
              fontSize: "13px",
              fontWeight: 700,
            }}
          >
            {loading
              ? "Отправляем..."
              : "Оставить заявку"}
          </button>
        </div>

        <label
          className="application-consent"
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "9px",
            marginTop: "10px",
            color: "#687487",
            fontSize: "11px",
            lineHeight: 1.45,
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

      <style>{`
        .application-form-grid { width: 100%; }
        .application-form-grid .application-pill-input {
          width: 100%;
          min-width: 0;
          height: 56px;
          min-height: 56px;
          max-height: 56px;
          display: block;
          box-sizing: border-box;
          border: 1px solid transparent;
          border-radius: 999px;
          background: #f1f3f7;
          color: #202631;
          padding: 0 16px;
          outline: none;
          box-shadow: none;
          font: inherit;
          font-size: 13px;
        }
        .application-form-grid .application-pill-input::placeholder { color: #8993a2; opacity: 1; }
        .application-form-grid .application-pill-input:focus {
          border-color: #d7deea;
          background: #f7f8fb;
          box-shadow: 0 0 0 3px rgba(255, 59, 72, .07);
        }
        .application-form-grid .application-submit { white-space: nowrap; }
        .application-consent input { width: 16px; height: 16px; margin: 1px 0 0; accent-color: #ff3b48; flex-shrink: 0; }
        @media (max-width: 900px) {
          .application-form-grid { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
        }
        @media (max-width: 560px) {
          .application-form-grid { grid-template-columns: minmax(0, 1fr) !important; }
          .application-form-grid .application-submit { min-height: 56px; height: 56px; }
        }
      `}</style>

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

const modalInputStyle: CSSProperties = {
  width: "100%", minWidth: 0, height: "44px", boxSizing: "border-box", border: "1px solid transparent",
  outline: "none", borderRadius: "999px", padding: "0 15px", background: "#f1f3f7", color: "#202631", fontSize: "13px", fontFamily: "inherit",
};
const modalSelectStyle: CSSProperties = {
  ...modalInputStyle, appearance: "auto", cursor: "pointer", paddingRight: "12px",
};
const fieldLabelStyle: CSSProperties = {
  display: "grid", gap: "6px", minWidth: 0, color: "#8490a1", fontSize: "11px",
};
const twoColumnGridStyle: CSSProperties = {
  display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "10px",
};
const toggleRowStyle: CSSProperties = {
  display: "flex", alignItems: "center", gap: "9px", fontSize: "13px", color: "#253044", cursor: "pointer",
};
const toggleInputStyle: CSSProperties = {
  width: "18px", height: "18px", accentColor: "#ff3b48", cursor: "pointer", flexShrink: 0,
};

/* ============================================================
   HERO
============================================================ */

export default function Hero() {
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(
    DEFAULT_SITE_SETTINGS
  );

  useEffect(() => {
    let mounted = true;

    async function loadSiteSettings() {
      try {
        const response = await fetch(`${API_URL}/site-settings`, {
          cache: "no-store",
        });

        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as Partial<SiteSettings>;

        if (mounted) {
          setSiteSettings({
            ...DEFAULT_SITE_SETTINGS,
            ...data,
          });
        }
      } catch (error) {
        console.error("Не удалось загрузить настройки Hero:", error);
      }
    }

    loadSiteSettings();

    return () => {
      mounted = false;
    };
  }, []);

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

  const [priceFrom, setPriceFrom] = useState("");
  const [priceTo, setPriceTo] = useState("");
  const [areaFrom, setAreaFrom] = useState("");
  const [areaTo, setAreaTo] = useState("");
  // Состояния расширенных фильтров. Они находятся в Hero,
  // поскольку используются окном «Все фильтры» и handleSearch.
  const [floorFrom, setFloorFrom] = useState("");
  const [floorTo, setFloorTo] = useState("");
  const [filterDistrict, setFilterDistrict] = useState("");
  const [filterStatus, setFilterStatus] = useState("Любой");
  const [renovations, setRenovations] = useState<string[]>([]);
  const [balconies, setBalconies] = useState<string[]>([]);
  const [roomLayouts, setRoomLayouts] = useState<string[]>([]);
  const [wallMaterials, setWallMaterials] = useState<string[]>([]);
  const [bathrooms, setBathrooms] = useState<string[]>([]);
  const [mortgageOnly, setMortgageOnly] = useState(false);
  const [exclusiveOnly, setExclusiveOnly] = useState(false);
  const [poolOnly, setPoolOnly] = useState(false);
  const [gasOnly, setGasOnly] = useState(false);
  const [garageOnly, setGarageOnly] = useState(false);

  const [
    location,
    setLocation,
  ] = useState("");

  const [
    showFilters,
    setShowFilters,
  ] = useState(false);

  // Управление выпадающими списками в модальном окне поиска.
  const [modalPropertyMenuOpen, setModalPropertyMenuOpen] = useState(false);
  const [modalSubtypeMenuOpen, setModalSubtypeMenuOpen] = useState(false);

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

  // Показываем фильтр комнат только для квартир.
  const isApartment = propertyType === "Квартиры";

  // Отдельные значения для формы ипотеки/оценки.
  const [requestPropertyType, setRequestPropertyType] =
    useState<PropertyType | "">("");
  const [requestRooms, setRequestRooms] = useState("");
  const [valuationPrice, setValuationPrice] = useState("");
  const [openRequestPropertyType, setOpenRequestPropertyType] = useState(false);
  const [openRequestRooms, setOpenRequestRooms] = useState(false);

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

      if (priceFrom) params.set("price_from", priceFrom);
      if (priceTo) params.set("price_to", priceTo);
      if (priceFrom || priceTo) {
        params.set("price", `${priceFrom || "0"}-${priceTo || ""}`);
      }

      if (areaFrom) params.set("area_from", areaFrom);
      if (areaTo) params.set("area_to", areaTo);
      if (areaFrom || areaTo) {
        params.set("area", `${areaFrom || "0"}-${areaTo || ""}`);
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

      if (floorFrom) params.set("floor_from", floorFrom);
      if (floorTo) params.set("floor_to", floorTo);
      if (filterDistrict && filterDistrict !== "Все районы") params.set("district", filterDistrict);
      if (filterStatus && filterStatus !== "Любой") params.set("status", filterStatus);
      if (renovations.length) params.set("renovation", renovations.join(","));
      if (balconies.length) params.set("balcony", balconies.join(","));
      if (roomLayouts.length) params.set("room_layout", roomLayouts.join(","));
      if (wallMaterials.length) params.set("building_material", wallMaterials.join(","));
      if (bathrooms.length) params.set("bathroom", bathrooms.join(","));
      if (mortgageOnly) params.set("mortgage", "true");
      if (exclusiveOnly) params.set("exclusive", "true");
      if (poolOnly) params.set("pool", "true");
      if (gasOnly) params.set("gas", "true");
      if (garageOnly) params.set("garage", "true");

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
    <section
      className="hero"
      style={{
        backgroundImage: siteSettings.hero_image
          ? `linear-gradient(rgba(0,0,0,.22), rgba(0,0,0,.22)), url("${siteSettings.hero_image}")`
          : undefined,
      }}
    >
      <style jsx global>{`
        .hero .search-input,
        .hero .application-pill-input {
          font-size: 15px !important;
          line-height: 1.25;
        }
        .hero .search-tab {
          font-size: 15px;
        }
        @media (max-width: 700px) {
          .hero .search-input,
          .hero .application-pill-input {
            font-size: 14px !important;
          }
        }
      `}</style>

      <div className="container hero-content">

        <div
          style={{
            color: "white",
            fontWeight: 700,
            letterSpacing: "2px",
            marginBottom: "20px",
          }}
        >
          {siteSettings.hero_eyebrow}
        </div>

        <h1 className="hero-title">
          {siteSettings.hero_title_line1}
          <br />
          {siteSettings.hero_title_line2}
          <br />
          {siteSettings.hero_title_line3}
        </h1>

        <p
          className="hero-text"
          style={{
            whiteSpace: "pre-line",
          }}
        >
          {siteSettings.hero_description}
        </p>

        <div
          style={{
            display: "flex",
            gap: "50px",
            marginTop: "35px",
            marginBottom: "40px",
            color: "white",
            flexWrap: "wrap",
          }}
        >
          <div>
            <div
              style={{
                fontSize: "36px",
                fontWeight: 700,
              }}
            >
              {siteSettings.stat1_value}
            </div>
            <div>{siteSettings.stat1_label}</div>
          </div>

          <div>
            <div
              style={{
                fontSize: "36px",
                fontWeight: 700,
              }}
            >
              {siteSettings.stat2_value}
            </div>
            <div>{siteSettings.stat2_label}</div>
          </div>

          <div>
            <div
              style={{
                fontSize: "36px",
                fontWeight: 700,
              }}
            >
              {siteSettings.stat3_value}
            </div>
            <div>{siteSettings.stat3_label}</div>
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

          {(activeTab === "Купить" || activeTab === "Снять") && (
            <>
              <div
                className="search-grid"
                style={{
                  display:
                    "grid",
                  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
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

                    if (nextType !== "Квартиры") {
                      setRooms("");
                      setOpenRooms(false);
                    }

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
                {!isApartment && (
                  <CustomDropdown
                    label={propertyType ? "Тип" : "Выберите недвижимость"}
                    value={subType}
                    options={currentSubTypes}
                    open={openSubType}
                    onOpen={() => {
                      if (!currentSubTypes.length) return;
                      setOpenSubType((value) => !value);
                      setOpenPropertyType(false);
                      setOpenRooms(false);
                      setOpenPrice(false);
                      setOpenArea(false);
                      setOpenLocation(false);
                    }}
                    onChange={(value) => {
                      setSubType(value);
                      setOpenSubType(false);
                    }}
                  />
                )}

                {isApartment && (
                  <CustomDropdown
                    label="Комнатность"
                    value={rooms}
                    options={roomOptions}
                    open={openRooms}
                    onOpen={() => {
                      setOpenRooms((value) => !value);
                      setOpenPropertyType(false);
                      setOpenSubType(false);
                      setOpenPrice(false);
                      setOpenArea(false);
                      setOpenLocation(false);
                    }}
                    onChange={(value) => {
                      setRooms(value);
                      setOpenRooms(false);
                    }}
                  />
                )}

                <RangeDropdown
                  label="Цена"
                  from={priceFrom}
                  to={priceTo}
                  open={openPrice}
                  onToggle={() => {
                    setOpenPrice((value) => !value);
                    setOpenPropertyType(false);
                    setOpenSubType(false);
                    setOpenRooms(false);
                    setOpenArea(false);
                    setOpenLocation(false);
                  }}
                  onFromChange={setPriceFrom}
                  onToChange={setPriceTo}
                  suffix=" ₽"
                />


                <RangeDropdown
                  label="Площадь"
                  from={areaFrom}
                  to={areaTo}
                  open={openArea}
                  onToggle={() => {
                    setOpenArea((value) => !value);
                    setOpenPropertyType(false);
                    setOpenSubType(false);
                    setOpenRooms(false);
                    setOpenPrice(false);
                    setOpenLocation(false);
                  }}
                  onFromChange={setAreaFrom}
                  onToChange={setAreaTo}
                  suffix=" м²"
                />
              </div>

              <div
                className="search-grid"
                style={{
                  display:
                    "grid",
                  // Поле города занимает одну колонку, как поле комнатности.
                  // Кнопки рядом равномерно заполняют оставшееся пространство.
                  gridTemplateColumns: "minmax(0, 3.2fr) minmax(130px, 1fr) minmax(130px, 1fr) minmax(160px, 1fr)",
                  gap: "12px",
                  marginTop:
                    "12px",
                }}
              >

                <input
                  type="text"
                  className="search-input application-pill-input"
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                  placeholder="Город, район, улица или ЖК"
                  aria-label="Город, район, улица или жилой комплекс"
                  autoComplete="street-address"
                  style={{
                    width: "100%",
                    minWidth: 0,
                    minHeight: "56px",
                    height: "56px",
                    maxHeight: "56px",
                    flexShrink: 0,
                    border: "1px solid #d9dee8",
                    background: "#f1f3f7",
                    color: "#64748b",
                    outline: "none",
                    borderRadius: "9999px",
                    padding: "0 18px",
                    boxSizing: "border-box",
                    fontSize: "16px",
                    lineHeight: 1.25,
                    fontFamily: "inherit",
                    boxShadow: "none",
                    appearance: "none",
                    transition: "border-color .18s ease, background .18s ease",
                  }}
                  onFocus={(event) => {
                    event.currentTarget.style.borderColor = "#c7cfdd";
                    event.currentTarget.style.background = "#ffffff";
                  }}
                  onBlur={(event) => {
                    event.currentTarget.style.borderColor = "#d9dee8";
                    event.currentTarget.style.background = "#f1f3f7";
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
                  style={{
                    minHeight: "56px",
                    width: "100%",
                    minWidth: 0,
                    boxSizing: "border-box",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    padding: "0 14px",
                    border: "1px solid #d9dee8",
                    borderRadius: "999px",
                    background: "#ffffff",
                    color: "#111827",
                    fontSize: "16px",
                    fontWeight: 650,
                    lineHeight: 1.2,
                    whiteSpace: "nowrap",
                    cursor: "pointer",
                    transition: "background .18s ease, border-color .18s ease, transform .18s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#f8f9fb";
                    e.currentTarget.style.borderColor = "#c6ccd8";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#ffffff";
                    e.currentTarget.style.borderColor = "#d9dee8";
                  }}
                >
                  <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M4 7h7M15 7h5M4 17h3M11 17h9"/><circle cx="13" cy="7" r="2"/><circle cx="9" cy="17" r="2"/></svg>
                  <span>Все фильтры</span>
                </button>

                <Link
                  href="/map"
                  className="btn"
                  style={{
                    minHeight: "56px",
                    width: "100%",
                    minWidth: 0,
                    boxSizing: "border-box",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    padding: "0 14px",
                    border: "1px solid #d9dee8",
                    borderRadius: "999px",
                    background: "#ffffff",
                    color: "#111827",
                    fontSize: "16px",
                    fontWeight: 650,
                    lineHeight: 1.2,
                    whiteSpace: "nowrap",
                    cursor: "pointer",
                    textDecoration: "none",
                    transition: "background .18s ease, border-color .18s ease, transform .18s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#f8f9fb";
                    e.currentTarget.style.borderColor = "#c6ccd8";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#ffffff";
                    e.currentTarget.style.borderColor = "#d9dee8";
                  }}
                >
                  <span aria-hidden="true" style={{ width: "28px", height: "28px", minWidth: "28px", display: "inline-flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", background: "#ef3340", color: "#ffffff", lineHeight: 1 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 6.5 8.5 4l7 2.5L21 4v13.5L15.5 20l-7-2.5L3 20V6.5Z" />
                      <path d="M8.5 4v13.5M15.5 6.5V20" />
                      <path d="M12 8.5V4.8M12 5h5l-1.4 1.5L17 8h-5" />
                    </svg>
                  </span>
                  <span>На карте</span>
                </Link>

                <button
                  type="button"
                  className="btn btn-red"
                  onClick={handleSearch}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-1px)";
                    e.currentTarget.style.boxShadow = "0 11px 24px rgba(239, 51, 64, .32)";
                    e.currentTarget.style.filter = "brightness(1.02)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 8px 20px rgba(239, 51, 64, .24)";
                    e.currentTarget.style.filter = "none";
                  }}
                  style={{
                    minHeight: "56px",
                    width: "100%",
                    minWidth: 0,
                    boxSizing: "border-box",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "7px",
                    padding: "0 10px",
                    border: "1px solid #f23843",
                    borderRadius: "999px",
                    background: "linear-gradient(135deg, #ff4b55 0%, #ed2635 100%)",
                    color: "#ffffff",
                    fontSize: "13px",
                    fontWeight: 700,
                    lineHeight: 1.15,
                    whiteSpace: "nowrap",
                    cursor: "pointer",
                    boxShadow: "0 8px 20px rgba(239, 51, 64, .24)",
                    transition: "transform .18s ease, box-shadow .18s ease, filter .18s ease",
                  }}
                >
                  <span
                    aria-hidden="true"
                    style={{
                      width: "26px",
                      height: "26px",
                      minWidth: "26px",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "50%",
                      background: "rgba(255,255,255,.18)",
                      border: "1px solid rgba(255,255,255,.42)",
                      fontSize: "17px",
                      lineHeight: 1,
                    }}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden="true"
                    >
                      <circle cx="10.8" cy="10.8" r="6.8" stroke="currentColor" strokeWidth="2" />
                      <path d="m16 16 4.2 4.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </span>
                  <span>Поиск объявлений</span>
                  <span aria-hidden="true" style={{ fontSize: "14px", marginLeft: "0px", flexShrink: 0 }}>→</span>
                </button>
              </div>



              {showFilters && (
                <div
                  role="presentation"
                  onMouseDown={(event) => {
                    if (event.target === event.currentTarget) setShowFilters(false);
                  }}
                  style={{
                    position: "fixed",
                    inset: 0,
                    zIndex: 10000,
                    background: "rgba(30, 32, 36, .78)",
                    backdropFilter: "blur(3px)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "16px",
                    boxSizing: "border-box",
                  }}
                >
                  <div
                    role="dialog"
                    aria-modal="true"
                    aria-label="Настройки поиска"
                    style={{
                      width: "min(100%, 500px)",
                      maxHeight: "min(92vh, 900px)",
                      overflowY: "auto",
                      background: "#fff",
                      borderRadius: "26px",
                      padding: "20px",
                      boxSizing: "border-box",
                      boxShadow: "0 24px 70px rgba(0,0,0,.24)",
                      color: "#263044",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 24 }}>
                      <span style={{ width: 28 }} />
                      <h2 style={{ margin: 0, flex: 1, textAlign: "center", fontSize: 16, lineHeight: 1.3, fontWeight: 700, color: "#647080" }}>
                        Настройки поиска
                      </h2>
                      <button
                        type="button"
                        aria-label="Закрыть фильтры"
                        onClick={() => { setShowFilters(false); setModalPropertyMenuOpen(false); setModalSubtypeMenuOpen(false); }}
                        style={{ width: 28, height: 28, border: 0, background: "transparent", color: "#111827", fontSize: 20, lineHeight: 1, cursor: "pointer", padding: 0 }}
                      >×</button>
                    </div>

                    <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 10, color: "#536174" }}>Основные</div>
                    <div className="filters-modal-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8, marginBottom: 8 }}>
                      <div style={{ ...fieldLabelStyle, position: "relative", zIndex: modalPropertyMenuOpen ? 40 : 1 }}>
                        <span>Тип недвижимости</span>
                        <button
                          type="button"
                          aria-expanded={modalPropertyMenuOpen}
                          onClick={() => {
                            setModalPropertyMenuOpen((open) => !open);
                            setModalSubtypeMenuOpen(false);
                          }}
                          style={{
                            ...modalInputStyle,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 8,
                            height: 44,
                            textAlign: "left",
                            cursor: "pointer",
                            fontSize: 12,
                            color: (propertyType || subType) ? "#111827" : "#8490a1",
                            fontWeight: (propertyType || subType) ? 600 : 400,
                          }}
                        >
                          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {subType || propertyType || "Тип недвижимости"}
                          </span>
                          <span aria-hidden="true" style={{ color: "#8490a1", fontSize: 12 }}>⌄</span>
                        </button>

                        {modalPropertyMenuOpen && (
                          <div
                            role="listbox"
                            aria-label="Тип недвижимости"
                            style={{
                              position: "absolute",
                              top: "calc(100% + 8px)",
                              left: 0,
                              right: 0,
                              maxHeight: 300,
                              overflowY: "auto",
                              padding: "8px 7px",
                              background: "#f1f3f7",
                              border: "1px solid rgba(211,217,227,.85)",
                              borderRadius: 22,
                              boxShadow: "0 8px 18px rgba(31,41,55,.10)",
                              zIndex: 50,
                              color: "#111827",
                              fontSize: 12,
                            }}
                          >
                            <div style={{ padding: "5px 9px 8px", marginBottom: 2, color: "#8a94a3", fontSize: 10, fontWeight: 500 }}>
                              Тип недвижимости
                            </div>
                            {[
                              ...subTypes["Квартиры"].filter((item) => item !== "Квартиры").map((item) => ({
                                label: item,
                                type: "Квартиры" as PropertyType,
                                subtype: item,
                              })),
                              ...propertyTypes.filter((item) => item !== "Квартиры").map((item) => ({
                                label: item === "Земельные участки" ? "Участки" : item,
                                type: item,
                                subtype: "",
                              })),
                            ].map((item) => {
                              const checked = propertyType === item.type &&
                                (item.type === "Квартиры" ? subType === item.subtype : true);
                              return (
                                <button
                                  key={item.label}
                                  type="button"
                                  role="option"
                                  aria-selected={checked}
                                  onClick={() => {
                                    setPropertyType(item.type);
                                    setSubType(item.subtype);
                                    if (item.type !== "Квартиры") setRooms("");
                                    setModalPropertyMenuOpen(false);
                                    setMortgageOnly(false);
                                    setPoolOnly(false);
                                    setGasOnly(false);
                                    setGarageOnly(false);
                                  }}
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 12,
                                    width: "100%",
                                    minHeight: 43,
                                    padding: "7px 12px",
                                    border: 0,
                                    borderRadius: 10,
                                    background: "transparent",
                                    color: "#111827",
                                    textAlign: "left",
                                    fontFamily: "inherit",
                                    fontSize: 12,
                                    lineHeight: 1.35,
                                    cursor: "pointer",
                                  }}
                                >
                                  <span aria-hidden="true" style={{
                                    flex: "0 0 13px",
                                    width: 13,
                                    height: 13,
                                    boxSizing: "border-box",
                                    border: "1px solid #ff3b49",
                                    borderRadius: 3,
                                    background: checked ? "#f23845" : "transparent",
                                    color: "#fff",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: 9,
                                    fontWeight: 800,
                                  }}>{checked ? "✓" : ""}</span>
                                  <span>{item.label}</span>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      <div style={{ ...fieldLabelStyle, position: "relative", zIndex: modalSubtypeMenuOpen ? 40 : 1 }}>
                        <span>{propertyType === "Квартиры" ? "Комнатность" : "Тип"}</span>
                        <button
                          type="button"
                          aria-expanded={modalSubtypeMenuOpen}
                          disabled={!propertyType}
                          onClick={() => {
                            if (!propertyType) return;
                            setModalSubtypeMenuOpen((open) => !open);
                            setModalPropertyMenuOpen(false);
                          }}
                          style={{
                            ...modalInputStyle,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 8,
                            height: 44,
                            textAlign: "left",
                            cursor: propertyType ? "pointer" : "not-allowed",
                            opacity: propertyType ? 1 : .9,
                            fontSize: 12,
                            color: (propertyType === "Квартиры" ? rooms : subType) ? "#111827" : "#8490a1",
                          }}
                        >
                          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {propertyType === "Квартиры"
                              ? (rooms || "Комнатность")
                              : (subType || (propertyType ? "Тип" : "Выберите недвижимость"))}
                          </span>
                          <span aria-hidden="true" style={{ color: "#8490a1", fontSize: 12 }}>⌄</span>
                        </button>

                        {modalSubtypeMenuOpen && propertyType && (
                          <div
                            role="listbox"
                            aria-label={propertyType === "Квартиры" ? "Комнатность" : "Подтип недвижимости"}
                            style={{
                              position: "absolute",
                              top: "calc(100% + 8px)",
                              left: 0,
                              right: 0,
                              maxHeight: 270,
                              overflowY: "auto",
                              padding: "8px 7px",
                              background: "#f1f3f7",
                              border: "1px solid rgba(211,217,227,.85)",
                              borderRadius: 22,
                              boxShadow: "0 8px 18px rgba(31,41,55,.10)",
                              zIndex: 50,
                              color: "#111827",
                              fontSize: 12,
                            }}
                          >
                            <div style={{ padding: "5px 9px 8px", marginBottom: 2, color: "#8a94a3", fontSize: 10, fontWeight: 500 }}>
                              {propertyType === "Квартиры" ? "Комнатность" : "Тип"}
                            </div>
                            {(propertyType === "Квартиры"
                              ? roomOptions.filter((item) => item !== "Не важно")
                              : (subTypes[propertyType] || [])
                            ).map((item) => {
                              const checked = propertyType === "Квартиры" ? rooms === item : subType === item;
                              return (
                                <button
                                  key={item}
                                  type="button"
                                  role="option"
                                  aria-selected={checked}
                                  onClick={() => {
                                    if (propertyType === "Квартиры") setRooms(item);
                                    else setSubType(item);
                                    setModalSubtypeMenuOpen(false);
                                  }}
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 12,
                                    width: "100%",
                                    minHeight: 43,
                                    padding: "7px 12px",
                                    border: 0,
                                    borderRadius: 10,
                                    background: "transparent",
                                    color: "#111827",
                                    textAlign: "left",
                                    fontFamily: "inherit",
                                    fontSize: 12,
                                    lineHeight: 1.35,
                                    cursor: "pointer",
                                  }}
                                >
                                  <span aria-hidden="true" style={{
                                    flex: "0 0 13px",
                                    width: 13,
                                    height: 13,
                                    boxSizing: "border-box",
                                    border: "1px solid #ff3b49",
                                    borderRadius: 3,
                                    background: checked ? "#f23845" : "transparent",
                                    color: "#fff",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: 9,
                                    fontWeight: 800,
                                  }}>{checked ? "✓" : ""}</span>
                                  <span>{item}</span>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>

                    <input
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Поиск по городу, району, улице, ЖК"
                      aria-label="Город, район, улица или жилой комплекс"
                      style={{ ...modalInputStyle, height: 44, marginBottom: 14, fontSize: 12 }}
                    />

                    {propertyType === "Квартиры" && (
                      <label style={{ ...toggleRowStyle, marginBottom: 18 }}>
                        <input type="checkbox" checked={mortgageOnly} onChange={(e) => setMortgageOnly(e.target.checked)} style={toggleInputStyle} />
                        <span>Ипотека</span>
                      </label>
                    )}

                    <div style={{ fontSize: 12, fontWeight: 600, margin: "12px 0 9px", color: "#536174" }}>Цена</div>
                    <div style={twoColumnGridStyle}>
                      <input aria-label="Цена от" type="number" min="0" value={priceFrom} onChange={(e) => setPriceFrom(e.target.value)} placeholder="Цена от" style={{ ...modalInputStyle, height: 44, fontSize: 12 }} />
                      <input aria-label="Цена до" type="number" min="0" value={priceTo} onChange={(e) => setPriceTo(e.target.value)} placeholder="Цена до" style={{ ...modalInputStyle, height: 44, fontSize: 12 }} />
                    </div>

                    <div style={{ fontSize: 12, fontWeight: 600, margin: "13px 0 9px", color: "#536174" }}>Площадь</div>
                    <div style={twoColumnGridStyle}>
                      <input aria-label="Площадь от" type="number" min="0" value={areaFrom} onChange={(e) => setAreaFrom(e.target.value)} placeholder="Площадь от" style={{ ...modalInputStyle, height: 44, fontSize: 12 }} />
                      <input aria-label="Площадь до" type="number" min="0" value={areaTo} onChange={(e) => setAreaTo(e.target.value)} placeholder="Площадь до" style={{ ...modalInputStyle, height: 44, fontSize: 12 }} />
                    </div>

                    {propertyType === "Квартиры" && (
                      <>
                        <div style={{ fontSize: 12, fontWeight: 600, margin: "13px 0 9px", color: "#536174" }}>Этаж</div>
                        <div style={twoColumnGridStyle}>
                          <input aria-label="Этаж от" type="number" min="0" value={floorFrom} onChange={(e) => setFloorFrom(e.target.value)} placeholder="Этаж от" style={{ ...modalInputStyle, height: 44, fontSize: 12 }} />
                          <input aria-label="Этаж до" type="number" min="0" value={floorTo} onChange={(e) => setFloorTo(e.target.value)} placeholder="Этаж до" style={{ ...modalInputStyle, height: 44, fontSize: 12 }} />
                        </div>
                      </>
                    )}

                    {(propertyType === "Квартиры" || propertyType === "Дома") && (
                      <>
                        <div style={{ fontSize: 12, fontWeight: 600, margin: "15px 0 9px", color: "#536174" }}>Дополнительные</div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8 }}>
                          <MultiSelectDropdown label="Ремонт" value={renovations} onChange={setRenovations} options={["Евроремонт", "Косметический", "Дизайнерский", "Требует ремонта", "Современный"]} />
                          {propertyType === "Квартиры" && <MultiSelectDropdown label="Балконы" value={balconies} onChange={setBalconies} options={["Балкон", "Лоджия", "2 балкона", "2 лоджии", "Французский балкон"]} />}
                          {propertyType === "Квартиры" && <MultiSelectDropdown label="Типы комнат" value={roomLayouts} onChange={setRoomLayouts} options={["Изолированная", "Смежно-изолированная", "Смежная"]} />}
                          <MultiSelectDropdown label="Материал стен" value={wallMaterials} onChange={setWallMaterials} options={["Деревянный", "Кирпичный", "Монолитный", "Панельный", "Блочный", "Каркасный"]} />
                          <MultiSelectDropdown label="Санузел" value={bathrooms} onChange={setBathrooms} options={["Совмещенный", "Раздельный", "1", "2", "3"]} />
                        </div>
                      </>
                    )}

                    {propertyType === "Дома" && (
                      <div style={{ display: "grid", gap: 13, marginTop: 16 }}>
                        <label style={toggleRowStyle}>
                          <input type="checkbox" checked={poolOnly} onChange={(e) => setPoolOnly(e.target.checked)} style={toggleInputStyle} />
                          <span>С бассейном</span>
                        </label>
                        <label style={toggleRowStyle}>
                          <input type="checkbox" checked={gasOnly} onChange={(e) => setGasOnly(e.target.checked)} style={toggleInputStyle} />
                          <span>Газоснабжение</span>
                        </label>
                        <label style={toggleRowStyle}>
                          <input type="checkbox" checked={garageOnly} onChange={(e) => setGarageOnly(e.target.checked)} style={toggleInputStyle} />
                          <span>С гаражом</span>
                        </label>
                      </div>
                    )}

                    {propertyType === "Земельные участки" && (
                      <label style={{ ...toggleRowStyle, marginTop: 16 }}>
                        <input type="checkbox" checked={exclusiveOnly} onChange={(e) => setExclusiveOnly(e.target.checked)} style={toggleInputStyle} />
                        <span>продается только в «Аякс»</span>
                      </label>
                    )}

                    <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 8, marginTop: 22, paddingTop: 2 }}>
                      <button
                        type="button"
                        onClick={() => {
                          setPropertyType(""); setSubType(""); setRooms(""); setLocation("");
                          setPriceFrom(""); setPriceTo(""); setAreaFrom(""); setAreaTo(""); setFloorFrom(""); setFloorTo("");
                          setFilterDistrict(""); setFilterStatus("Любой"); setRenovations([]); setBalconies([]); setRoomLayouts([]); setWallMaterials([]); setBathrooms([]);
                          setMortgageOnly(false); setExclusiveOnly(false); setPoolOnly(false); setGasOnly(false); setGarageOnly(false);
                        }}
                        style={{ minHeight: 42, border: "1px solid #d8dee8", borderRadius: 999, background: "#fff", color: "#687487", padding: "0 23px", cursor: "pointer", fontFamily: "inherit", fontSize: 12, fontWeight: 600 }}
                      >Сброс</button>
                      <button
                        type="button"
                        onClick={() => { setShowFilters(false); handleSearch(); }}
                        style={{ minHeight: 44, border: "none", borderRadius: 999, background: "linear-gradient(135deg,#ff4b55 0%,#ed2635 100%)", color: "#fff", padding: "0 14px", display: "inline-flex", alignItems: "center", gap: 9, cursor: "pointer", fontFamily: "inherit", fontSize: 12, fontWeight: 700, boxShadow: "0 7px 18px rgba(239,51,64,.2)", whiteSpace: "nowrap" }}
                      >
                        <span style={{ width: 27, height: 27, flexShrink: 0, display: "inline-flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", background: "#fff", color: "#ef3340", fontSize: 17, lineHeight: 1 }}>⌕</span>
                        <span style={{ textAlign: "left", lineHeight: 1.1 }}>Поиск объявлений</span>
                        <span aria-hidden="true" style={{ fontSize: 15 }}>→</span>
                      </button>
                    </div>
                  </div>
                  <style>{`
                    @media (max-width: 600px) {
                      .filters-modal-grid { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
                    }
                  `}</style>
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
                  title={activeTab === "Снять" ? "Снять недвижимость" : "Купить недвижимость"}
                  categories={activeTab === "Снять" ? rentCategories : buyCategories}
                  selectedCategory={selectedCategory}
                  setSelectedCategory={setSelectedCategory}
                  dealType={activeTab === "Снять" ? "rent" : "sale"}
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
              <CustomDropdown
                label="Тип недвижимости"
                value={requestPropertyType}
                options={propertyTypes}
                open={openRequestPropertyType}
                onOpen={() => {
                  setOpenRequestPropertyType((value) => !value);
                  setOpenRequestRooms(false);
                }}
                onChange={(value) => {
                  const nextType = value as PropertyType;
                  setRequestPropertyType(nextType);
                  if (nextType !== "Квартиры") {
                    setRequestRooms("");
                  }
                  setOpenRequestPropertyType(false);
                }}
              />

              {requestPropertyType === "Квартиры" && (
                <CustomDropdown
                  label="Комнатность"
                  value={requestRooms}
                  options={roomOptions}
                  open={openRequestRooms}
                  onOpen={() => {
                    setOpenRequestRooms((value) => !value);
                    setOpenRequestPropertyType(false);
                  }}
                  onChange={(value) => {
                    setRequestRooms(value);
                    setOpenRequestRooms(false);
                  }}
                />
              )}

              {activeTab === "Оценить" && (
                <input
                  className="search-input application-pill-input"
                  type="number"
                  min="0"
                  inputMode="numeric"
                  placeholder="Ориентировочная цена, ₽"
                  aria-label="Ориентировочная цена в рублях"
                  value={valuationPrice}
                  onChange={(e) => setValuationPrice(e.target.value)}
                />
              )}

              <input
                className="search-input application-pill-input"
                placeholder="Имя"
              />

              <input
                className="search-input application-pill-input"
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