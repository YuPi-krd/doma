"use client";

import Link from "next/link";
import {
  FormEvent,
  useMemo,
  useState,
} from "react";

const API_URL =
  "https://doma-nq4u.onrender.com";

type DealMode =
  | "buy"
  | "rent"
  | "sell"
  | "lease"
  | "mortgage"
  | "valuation";

type PropertyType =
  | "apartment"
  | "house"
  | "land"
  | "commercial"
  | "garage";

type Category = {
  title: string;
  slug: string;
  items: {
    title: string;
    slug: string;
  }[];
};

const PROPERTY_TYPES: {
  value: PropertyType;
  title: string;
}[] = [
  {
    value: "apartment",
    title: "Квартиры",
  },
  {
    value: "house",
    title: "Дома",
  },
  {
    value: "land",
    title: "Земельные участки",
  },
  {
    value: "commercial",
    title: "Коммерция",
  },
  {
    value: "garage",
    title: "Гаражи",
  },
];

const SUBTYPES: Record<
  PropertyType,
  {
    value: string;
    title: string;
  }[]
> = {
  apartment: [
    {
      value: "secondary",
      title: "Вторичка",
    },
    {
      value: "new_building",
      title: "Новостройки",
    },
    {
      value: "studio",
      title: "Студии",
    },
    {
      value: "1_room",
      title: "1-комнатные",
    },
    {
      value: "2_room",
      title: "2-комнатные",
    },
    {
      value: "3_room",
      title: "3-комнатные",
    },
    {
      value: "4_room",
      title: "4-комнатные",
    },
    {
      value: "5_room",
      title: "5-комнатные",
    },
    {
      value: "penthouse",
      title: "Пентхаусы",
    },
  ],

  house: [
    {
      value: "house",
      title: "Дома",
    },
    {
      value: "part_of_house",
      title: "Части дома",
    },
    {
      value: "townhouse",
      title: "Таунхаусы",
    },
    {
      value: "duplex",
      title: "Дуплексы",
    },
    {
      value: "cottage",
      title: "Коттеджи",
    },
    {
      value: "dacha",
      title: "Дачи",
    },
  ],

  land: [
    {
      value: "izhs",
      title: "ИЖС",
    },
    {
      value: "gardening",
      title: "Садоводство",
    },
    {
      value: "commercial_land",
      title: "Коммерческая земля",
    },
    {
      value: "lph",
      title: "ЛПХ",
    },
    {
      value: "dnp",
      title: "ДНП",
    },
  ],

  commercial: [
    {
      value: "office",
      title: "Офисы",
    },
    {
      value: "business",
      title: "Готовый бизнес",
    },
    {
      value: "separate_building",
      title: "Отдельные здания",
    },
    {
      value: "production",
      title: "Производственные",
    },
    {
      value: "warehouse",
      title: "Складские",
    },
    {
      value: "retail",
      title: "Торговые помещения",
    },
  ],

  garage: [
    {
      value: "garage_box",
      title: "Гаражные боксы",
    },
    {
      value: "residential_complex",
      title: "Внутри ЖК",
    },
    {
      value: "covered_parking",
      title: "Крытая парковка",
    },
    {
      value: "separate_garage",
      title: "Отдельно стоящие гаражи",
    },
    {
      value: "parking",
      title: "Паркинг",
    },
  ],
};

const CATEGORY_SLUGS: Record<
  PropertyType,
  string
> = {
  apartment: "apartments",
  house: "houses",
  land: "land",
  commercial: "commercial",
  garage: "garages",
};

const BUY_CATEGORIES: Category[] = [
  {
    title: "Квартиры",
    slug: "apartments",
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
        title: "5-комнатные",
        slug: "5-room",
      },
      {
        title: "Пентхаусы",
        slug: "penthouses",
      },
    ],
  },

  {
    title: "Дома",
    slug: "houses",
    items: [
      {
        title: "Дома",
        slug: "houses",
      },
      {
        title: "Части дома",
        slug: "part-of-house",
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
        title: "Коттеджи",
        slug: "cottages",
      },
      {
        title: "Дачи",
        slug: "dachas",
      },
    ],
  },

  {
    title: "Земельные участки",
    slug: "land",
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
    title: "Коммерция",
    slug: "commercial",
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
        title: "Отдельные здания",
        slug: "separate-building",
      },
      {
        title: "Производственные",
        slug: "production",
      },
      {
        title: "Складские",
        slug: "warehouses",
      },
      {
        title: "Торговые помещения",
        slug: "retail",
      },
    ],
  },

  {
    title: "Гаражи",
    slug: "garages",
    items: [
      {
        title: "Гаражные боксы",
        slug: "garage-box",
      },
      {
        title: "Внутри ЖК",
        slug: "residential-complex",
      },
      {
        title: "Крытая парковка",
        slug: "covered-parking",
      },
      {
        title: "Отдельные гаражи",
        slug: "separate-garage",
      },
      {
        title: "Паркинг",
        slug: "parking",
      },
    ],
  },
];

const DEAL_LABELS: Record<
  DealMode,
  string
> = {
  buy: "Купить",
  rent: "Снять",
  sell: "Продать",
  lease: "Сдать",
  mortgage: "Ипотека",
  valuation: "Оценить",
};

function Dropdown({
  value,
  placeholder,
  options,
  onChange,
}: {
  value: string;
  placeholder: string;
  options: {
    value: string;
    title: string;
  }[];
  onChange: (
    value: string
  ) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) =>
        onChange(e.target.value)
      }
      className="hero-select"
    >
      <option value="">
        {placeholder}
      </option>

      {options.map((option) => (
        <option
          key={option.value}
          value={option.value}
        >
          {option.title}
        </option>
      ))}
    </select>
  );
}

function ApplicationForm({
  mode,
}: {
  mode: "sell" | "rent" | "lease";
}) {
  const [name, setName] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [
    propertyType,
    setPropertyType,
  ] = useState<PropertyType>(
    "apartment"
  );

  const [subtype, setSubtype] =
    useState("secondary");

  const [rooms, setRooms] =
    useState("");

  const [comment, setComment] =
    useState("");

  const [sending, setSending] =
    useState(false);

  const [sent, setSent] =
    useState(false);

  const [error, setError] =
    useState("");

  const subtypeOptions = useMemo(
    () =>
      SUBTYPES[
        propertyType
      ] || [],
    [propertyType]
  );

  function changeType(
    value: PropertyType
  ) {
    setPropertyType(value);

    const nextSubtypes =
      SUBTYPES[value];

    setSubtype(
      nextSubtypes?.[0]?.value ||
        ""
    );
  }

  async function submit(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setSending(true);
    setError("");
    setSent(false);

    try {
      const dealLabel =
        DEAL_LABELS[mode];

      const details = [
        `Заявка: ${dealLabel}`,
        `Тип недвижимости: ${
          PROPERTY_TYPES.find(
            (item) =>
              item.value ===
              propertyType
          )?.title || ""
        }`,
        `Подтип: ${
          subtypeOptions.find(
            (item) =>
              item.value ===
              subtype
          )?.title || ""
        }`,
        rooms
          ? `Комнатность: ${rooms}`
          : "",
        comment.trim()
          ? `Комментарий: ${comment.trim()}`
          : "",
      ]
        .filter(Boolean)
        .join("\n");

      const response =
        await fetch(
          `${API_URL}/leads`,
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              name,
              phone,
              comment: details,
            }),
          }
        );

      const data =
        await response
          .json()
          .catch(
            () => ({})
          );

      if (!response.ok) {
        throw new Error(
          typeof data?.detail ===
            "string"
            ? data.detail
            : "Не удалось отправить заявку."
        );
      }

      setSent(true);
      setName("");
      setPhone("");
      setComment("");
    } catch (
      submitError
    ) {
      console.error(
        submitError
      );

      setError(
        submitError instanceof Error
          ? submitError.message
          : "Не удалось отправить заявку."
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="application-panel">
      <div className="application-grid">
        <input
          className="hero-input"
          value={name}
          onChange={(e) =>
            setName(e.target.value)
          }
          placeholder="Ваше имя"
          minLength={2}
          required
        />

        <input
          className="hero-input"
          value={phone}
          onChange={(e) =>
            setPhone(e.target.value)
          }
          placeholder="+7 (___) ___-__-__"
          minLength={6}
          required
        />

        <Dropdown
          value={propertyType}
          placeholder="Тип недвижимости"
          options={PROPERTY_TYPES.map(
            (item) => ({
              value:
                item.value,
              title:
                item.title,
            })
          )}
          onChange={(value) =>
            changeType(
              value as PropertyType
            )
          }
        />

        <Dropdown
          value={subtype}
          placeholder="Подтип"
          options={
            subtypeOptions
          }
          onChange={setSubtype}
        />

        <Dropdown
          value={rooms}
          placeholder="Комнатность"
          options={[
            {
              value: "1",
              title: "1 комната",
            },
            {
              value: "2",
              title: "2 комнаты",
            },
            {
              value: "3",
              title: "3 комнаты",
            },
            {
              value: "4",
              title: "4 комнаты",
            },
            {
              value: "5+",
              title: "5+ комнат",
            },
          ]}
          onChange={setRooms}
        />

        <textarea
          className="hero-textarea"
          rows={3}
          value={comment}
          onChange={(e) =>
            setComment(
              e.target.value
            )
          }
          placeholder="Комментарий"
        />
      </div>

      <button
        type="button"
        className="hero-primary-button"
        disabled={sending}
        onClick={() => {
          const form =
            document.getElementById(
              `application-${mode}`
            ) as
              | HTMLFormElement
              | null;

          form?.requestSubmit();
        }}
      >
        {sending
          ? "Отправляем..."
          : "Оставить заявку"}
      </button>

      <form
        id={`application-${mode}`}
        onSubmit={submit}
        style={{
          display: "none",
        }}
      >
        <input
          value={name}
          readOnly
          name="name"
        />

        <input
          value={phone}
          readOnly
          name="phone"
        />
      </form>

      {sent && (
        <div className="form-success">
          ✓ Заявка отправлена.
          Менеджер свяжется с вами.
        </div>
      )}

      {error && (
        <div className="form-error">
          {error}
        </div>
      )}
    </div>
  );
}

export default function Hero() {
  const [mode, setMode] =
    useState<DealMode>("buy");

  const [propertyType, setPropertyType] =
    useState<PropertyType>(
      "apartment"
    );

  const [subtype, setSubtype] =
    useState("secondary");

  const [rooms, setRooms] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [filterOpen, setFilterOpen] =
    useState(false);

  const [
    mortgageRequested,
    setMortgageRequested,
  ] = useState(false);

  const [
    valuationRequested,
    setValuationRequested,
  ] = useState(false);

  const currentSubtypes =
    SUBTYPES[
      propertyType
    ] || [];

  function changePropertyType(
    value: PropertyType
  ) {
    setPropertyType(value);

    const first =
      SUBTYPES[value]?.[0];

    setSubtype(
      first?.value || ""
    );
  }

  function openSearch() {
    setFilterOpen(true);
  }

  function searchCatalog() {
    const params =
      new URLSearchParams();

    if (search.trim()) {
      params.set(
        "search",
        search.trim()
      );
    }

    if (rooms) {
      params.set(
        "rooms",
        rooms
      );
    }

    if (propertyType) {
      params.set(
        "property_type",
        propertyType
      );
    }

    if (subtype) {
      params.set(
        "property_subtype",
        subtype
      );
    }

    const modeToDeal: Record<
      "buy" | "rent",
      string
    > = {
      buy: "sale",
      rent: "rent",
    };

    const deal =
      mode === "rent"
        ? "rent"
        : "sale";

    params.set(
      "deal_type",
      modeToDeal[
        mode === "rent"
          ? "rent"
          : "buy"
      ] || deal
    );

    const query =
      params.toString();

    const categorySlug =
      CATEGORY_SLUGS[
        propertyType
      ];

    let url =
      `/catalog/${
        mode === "rent"
          ? "rent"
          : "sale"
      }/${categorySlug}`;

    if (subtype) {
      const subtypeUrl =
        getSubtypeSlug(
          subtype
        );

      if (subtypeUrl) {
        url += `/${subtypeUrl}`;
      }
    }

    if (query) {
      url += `?${query}`;
    }

    window.location.href =
      url;
  }

  function getSubtypeSlug(
    value: string
  ) {
    const mapping: Record<
      string,
      string
    > = {
      secondary:
        "secondary",
      new_building:
        "new-buildings",
      studio:
        "studios",
      "1_room":
        "1-room",
      "2_room":
        "2-room",
      "3_room":
        "3-room",
      "4_room":
        "4-room",
      "5_room":
        "5-room",
      penthouse:
        "penthouses",

      house:
        "houses",
      part_of_house:
        "part-of-house",
      townhouse:
        "townhouses",
      duplex:
        "duplexes",
      cottage:
        "cottages",
      dacha:
        "dachas",

      izhs:
        "izhs",
      gardening:
        "gardening",
      commercial_land:
        "commercial-land",
      lph:
        "lph",
      dnp:
        "dnp",

      office:
        "offices",
      business:
        "business",
      separate_building:
        "separate-building",
      production:
        "production",
      warehouse:
        "warehouses",
      retail:
        "retail",

      garage_box:
        "garage-box",
      residential_complex:
        "residential-complex",
      covered_parking:
        "covered-parking",
      separate_garage:
        "separate-garage",
      parking:
        "parking",
    };

    return mapping[value];
  }

  function openMortgage() {
    setMortgageRequested(
      true
    );
  }

  function openValuation() {
    setValuationRequested(
      true
    );
  }

  function renderApplication(
    applicationMode:
      | "sell"
      | "rent"
      | "lease"
  ) {
    return (
      <ApplicationForm
        mode={
          applicationMode
        }
      />
    );
  }

  return (
    <>
      <section className="hero">
        <div className="hero-background">
          <div className="hero-glow glow-one" />
          <div className="hero-glow glow-two" />
        </div>

        <div className="hero-container">
          <div className="hero-content">

            <div className="hero-eyebrow">
              НЕДВИЖИМОСТЬ • КРАСНОДАР
            </div>

            <h1 className="hero-title">
              Найдём место,
              <br />
              которое станет
              <br />
              <span>домом</span>
            </h1>

            <p className="hero-description">
              Подберём квартиру,
              дом или другой
              объект под вашу
              задачу.
            </p>

            <div className="hero-tabs">
              {(
                [
                  "buy",
                  "sell",
                  "rent",
                  "lease",
                  "mortgage",
                  "valuation",
                ] as DealMode[]
              ).map(
                (item) => (
                  <button
                    key={item}
                    type="button"
                    className={
                      mode === item
                        ? "hero-tab active"
                        : "hero-tab"
                    }
                    onClick={() =>
                      setMode(item)
                    }
                  >
                    {
                      DEAL_LABELS[
                        item
                      ]
                    }
                  </button>
                )
              )}
            </div>

            {mode ===
              "buy" && (
              <div className="search-card">
                <div className="search-grid">

                  <div className="field-block">
                    <label>
                      Тип недвижимости
                    </label>

                    <Dropdown
                      value={
                        propertyType
                      }
                      placeholder="Тип недвижимости"
                      options={
                        PROPERTY_TYPES.map(
                          (item) => ({
                            value:
                              item.value,
                            title:
                              item.title,
                          })
                        )
                      }
                      onChange={(
                        value
                      ) =>
                        changePropertyType(
                          value as PropertyType
                        )
                      }
                    />
                  </div>

                  <div className="field-block">
                    <label>
                      Подтип
                    </label>

                    <Dropdown
                      value={
                        subtype
                      }
                      placeholder="Подтип недвижимости"
                      options={
                        currentSubtypes
                      }
                      onChange={
                        setSubtype
                      }
                    />
                  </div>

                  <div className="field-block">
                    <label>
                      Комнатность
                    </label>

                    <Dropdown
                      value={
                        rooms
                      }
                      placeholder="Комнатность"
                      options={[
                        {
                          value:
                            "1",
                          title:
                            "1 комната",
                        },
                        {
                          value:
                            "2",
                          title:
                            "2 комнаты",
                        },
                        {
                          value:
                            "3",
                          title:
                            "3 комнаты",
                        },
                        {
                          value:
                            "4",
                          title:
                            "4 комнаты",
                        },
                        {
                          value:
                            "5+",
                          title:
                            "5+ комнат",
                        },
                      ]}
                      onChange={
                        setRooms
                      }
                    />
                  </div>

                  <div className="field-block field-wide">
                    <label>
                      Где ищем?
                    </label>

                    <input
                      className="hero-input"
                      value={
                        search
                      }
                      onChange={(
                        e
                      ) =>
                        setSearch(
                          e.target.value
                        )
                      }
                      placeholder="Город, район, улица, ЖК"
                    />
                  </div>
                </div>

                <div className="search-card-footer">
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() =>
                      setFilterOpen(
                        !filterOpen
                      )
                    }
                  >
                    Все фильтры
                  </button>

                  <Link
                    href="/map"
                    className="secondary-button"
                  >
                    На карте
                  </Link>

                  <button
                    type="button"
                    className="primary-button"
                    onClick={
                      searchCatalog
                    }
                  >
                    Найти объявления
                  </button>
                </div>

                {filterOpen && (
                  <div className="advanced-filters">
                    <div>
                      <strong>
                        Дополнительные
                        фильтры
                      </strong>
                    </div>

                    <div className="advanced-filter-row">
                      <span>
                        Цена
                      </span>

                      <span>
                        Площадь
                      </span>

                      <span>
                        Район
                      </span>

                      <span>
                        Этаж
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {mode ===
              "sell" && (
              renderApplication(
                "sell"
              )
            )}

            {mode ===
              "rent" && (
              renderApplication(
                "rent"
              )
            )}

            {mode ===
              "lease" && (
              renderApplication(
                "lease"
              )
            )}

            {mode ===
              "mortgage" && (
              <div className="info-card">
                <div>
                  <span className="info-card-icon">
                    ₽
                  </span>
                </div>

                <div>
                  <h3>
                    Ипотечная консультация
                  </h3>

                  <p>
                    Оставьте
                    контакты, и
                    менеджер
                    свяжется с вами
                    для консультации.
                  </p>

                  <button
                    type="button"
                    className="primary-button"
                    onClick={
                      openMortgage
                    }
                  >
                    Получить консультацию
                  </button>
                </div>
              </div>
            )}

            {mode ===
              "valuation" && (
              <div className="info-card">
                <div>
                  <span className="info-card-icon">
                    ₽
                  </span>
                </div>

                <div>
                  <h3>
                    Оценка недвижимости
                  </h3>

                  <p>
                    Поможем определить
                    ориентировочную
                    стоимость объекта.
                  </p>

                  <button
                    type="button"
                    className="primary-button"
                    onClick={
                      openValuation
                    }
                  >
                    Узнать стоимость
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="hero-side-card">
            <div className="hero-side-badge">
              DOMA
            </div>

            <div className="hero-side-image">
              <div className="hero-image-shape shape-one" />
              <div className="hero-image-shape shape-two" />
              <div className="hero-image-shape shape-three" />
            </div>

            <div className="hero-side-text">
              <span>
                Краснодар
              </span>

              <strong>
                Недвижимость,
                <br />
                в которую хочется
                возвращаться
              </strong>
            </div>
          </div>
        </div>
      </section>

      <section className="category-section">
        <div className="category-container">

          <div className="category-heading">
            <div>
              <div className="category-eyebrow">
                КАТАЛОГ
              </div>

              <h2>
                Найдите свой
                вариант
              </h2>
            </div>

            <Link
              href="/catalog"
              className="category-all-link"
            >
              Смотреть весь каталог →
            </Link>
          </div>

          <div className="category-grid">
            {BUY_CATEGORIES.map(
              (category) => (
                <div
                  key={
                    category.slug
                  }
                  className="category-card"
                >
                  <Link
                    href={`/catalog/sale/${category.slug}`}
                    className="category-title"
                  >
                    {category.title}
                  </Link>

                  <div className="category-items">
                    {category.items.map(
                      (item) => (
                        <Link
                          key={
                            item.slug
                          }
                          href={`/catalog/sale/${category.slug}/${item.slug}`}
                          className="category-item"
                        >
                          {item.title}
                        </Link>
                      )
                    )}
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {mortgageRequested && (
        <div
          className="hero-modal-backdrop"
          onClick={() =>
            setMortgageRequested(
              false
            )
          }
        >
          <div
            className="hero-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <button
              type="button"
              className="modal-close"
              onClick={() =>
                setMortgageRequested(
                  false
                )
              }
            >
              ×
            </button>

            <div className="modal-eyebrow">
              КОНСУЛЬТАЦИЯ
            </div>

            <h3>
              Оставьте контакты
            </h3>

            <p>
              Менеджер свяжется
              с вами и ответит
              на вопросы.
            </p>

            <form
              onSubmit={
                async (e) => {
                  e.preventDefault();

                  const form =
                    e.currentTarget;

                  const formData =
                    new FormData(
                      form
                    );

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
                              formData.get(
                                "name"
                              ),
                            phone:
                              formData.get(
                                "phone"
                              ),
                            comment:
                              "Заявка: Ипотека",
                          }
                        ),
                    }
                  );

                  form.reset();

                  setMortgageRequested(
                    false
                  );
                }
              }
            >
              <input
                name="name"
                className="hero-input"
                placeholder="Ваше имя"
                required
              />

              <input
                name="phone"
                className="hero-input"
                placeholder="+7 (___) ___-__-__"
                required
              />

              <button
                type="submit"
                className="primary-button full-button"
              >
                Отправить заявку
              </button>
            </form>
          </div>
        </div>
      )}

      {valuationRequested && (
        <div
          className="hero-modal-backdrop"
          onClick={() =>
            setValuationRequested(
              false
            )
          }
        >
          <div
            className="hero-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <button
              type="button"
              className="modal-close"
              onClick={() =>
                setValuationRequested(
                  false
                )
              }
            >
              ×
            </button>

            <div className="modal-eyebrow">
              ОЦЕНКА
            </div>

            <h3>
              Оценим ваш объект
            </h3>

            <p>
              Оставьте контакты
              и данные об объекте.
            </p>

            <form
              onSubmit={
                async (e) => {
                  e.preventDefault();

                  const form =
                    e.currentTarget;

                  const formData =
                    new FormData(
                      form
                    );

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
                              formData.get(
                                "name"
                              ),
                            phone:
                              formData.get(
                                "phone"
                              ),
                            comment:
                              `Заявка: Оценить\n${String(
                                formData.get(
                                  "comment"
                                ) || ""
                              )}`,
                          }
                        ),
                    }
                  );

                  form.reset();

                  setValuationRequested(
                    false
                  );
                }
              }
            >
              <input
                name="name"
                className="hero-input"
                placeholder="Ваше имя"
                required
              />

              <input
                name="phone"
                className="hero-input"
                placeholder="+7 (___) ___-__-__"
                required
              />

              <textarea
                name="comment"
                className="hero-textarea"
                placeholder="Что нужно оценить?"
                rows={4}
              />

              <button
                type="submit"
                className="primary-button full-button"
              >
                Отправить заявку
              </button>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .hero {
          position: relative;
          overflow: hidden;
          padding:
            95px
            32px
            80px;
          background:
            linear-gradient(
              135deg,
              #f8fafc 0%,
              #eef2f7 100%
            );
        }

        .hero-background {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        .hero-glow {
          position: absolute;
          border-radius: 999px;
          filter: blur(80px);
        }

        .glow-one {
          width: 360px;
          height: 360px;
          top: -130px;
          right: 8%;
          background: rgba(
            239,
            68,
            68,
            0.11
          );
        }

        .glow-two {
          width: 300px;
          height: 300px;
          left: -100px;
          bottom: -130px;
          background: rgba(
            59,
            130,
            246,
            0.08
          );
        }

        .hero-container {
          position: relative;
          z-index: 1;

          width: 100%;
          max-width: 1240px;
          margin: 0 auto;

          display: grid;
          grid-template-columns:
            minmax(0, 1.35fr)
            minmax(320px, 0.65fr);

          gap: 60px;
          align-items: center;
        }

        .hero-eyebrow,
        .category-eyebrow,
        .modal-eyebrow {
          color: #ef4444;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.14em;
        }

        .hero-title {
          margin:
            16px 0
            18px;

          color: #0f172a;

          font-size:
            clamp(48px, 6vw, 78px);

          line-height: 0.98;
          letter-spacing: -0.045em;
          font-weight: 800;
        }

        .hero-title span {
          color: #ef4444;
        }

        .hero-description {
          max-width: 620px;
          margin-bottom: 28px;

          color: #64748b;

          font-size: 17px;
          line-height: 1.7;
        }

        .hero-tabs {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 18px;
        }

        .hero-tab {
          border: 1px solid #d8dee7;
          background: rgba(
            255,
            255,
            255,
            0.75
          );
          color: #475569;

          border-radius: 999px;
          padding:
            10px
            18px;

          cursor: pointer;

          font-size: 14px;
          font-weight: 700;

          transition:
            0.2s
            ease;
        }

        .hero-tab:hover {
          border-color: #cbd5e1;
          transform:
            translateY(-1px);
        }

        .hero-tab.active {
          border-color: #ef4444;
          background: #ef4444;
          color: #ffffff;
        }

        .search-card,
        .application-panel,
        .info-card {
          border:
            1px solid
            rgba(
              226,
              232,
              240,
              0.9
            );

          background:
            rgba(
              255,
              255,
              255,
              0.94
            );

          border-radius: 24px;

          box-shadow:
            0
            18px
            50px
            rgba(
              15,
              23,
              42,
              0.08
            );
        }

        .search-card {
          padding: 22px;
        }

        .search-grid {
          display: grid;
          grid-template-columns:
            repeat(3, minmax(0, 1fr));
          gap: 12px;
        }

        .field-wide {
          grid-column:
            span 3;
        }

        .field-block {
          min-width: 0;
        }

        .field-block label {
          display: block;
          margin-bottom: 7px;
          color: #64748b;
          font-size: 12px;
          font-weight: 700;
        }

        .hero-select,
        .hero-input,
        .hero-textarea {
          box-sizing: border-box;
          width: 100%;

          border:
            1px solid
            #d8dee7;

          border-radius: 13px;

          background: #ffffff;
          color: #0f172a;

          font-size: 14px;

          outline: none;
        }

        .hero-select,
        .hero-input {
          min-height: 48px;
          padding:
            0
            14px;
        }

        .hero-textarea {
          padding:
            13px
            14px;
          resize: vertical;
          line-height: 1.5;
        }

        .hero-select:focus,
        .hero-input:focus,
        .hero-textarea:focus {
          border-color: #ef4444;
          box-shadow:
            0
            0
            0
            3px
            rgba(
              239,
              68,
              68,
              0.08
            );
        }

        .search-card-footer {
          display: flex;
          gap: 10px;
          margin-top: 14px;
        }

        .secondary-button,
        .primary-button,
        .hero-primary-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;

          min-height: 46px;
          border-radius: 13px;

          padding:
            0
            18px;

          font-size: 14px;
          font-weight: 750;
          text-decoration: none;
          cursor: pointer;

          transition:
            0.2s
            ease;
        }

        .secondary-button {
          border:
            1px solid
            #d8dee7;
          background: #ffffff;
          color: #334155;
        }

        .secondary-button:hover {
          background: #f8fafc;
        }

        .primary-button,
        .hero-primary-button {
          border:
            1px solid
            #ef4444;
          background: #ef4444;
          color: #ffffff;
        }

        .primary-button:hover,
        .hero-primary-button:hover {
          background: #dc3741;
          border-color: #dc3741;
          transform:
            translateY(-1px);
        }

        .search-card-footer
          .primary-button {
          margin-left: auto;
        }

        .advanced-filters {
          margin-top: 16px;
          padding-top: 16px;

          border-top:
            1px solid
            #e2e8f0;
        }

        .advanced-filter-row {
          display: grid;
          grid-template-columns:
            repeat(
              4,
              minmax(0, 1fr)
            );

          gap: 8px;
          margin-top: 10px;
        }

        .advanced-filter-row span {
          padding: 12px;
          border-radius: 12px;
          background: #f8fafc;
          color: #64748b;
          font-size: 13px;
        }

        .application-panel {
          padding: 22px;
        }

        .application-grid {
          display: grid;
          grid-template-columns:
            repeat(2, minmax(0, 1fr));
          gap: 10px;
        }

        .application-grid
          .hero-textarea {
          grid-column:
            span 2;
        }

        .application-panel
          .hero-primary-button {
          width: 100%;
          margin-top: 12px;
        }

        .form-success,
        .form-error {
          margin-top: 12px;
          padding:
            11px
            13px;

          border-radius: 11px;

          font-size: 13px;
          line-height: 1.5;
        }

        .form-success {
          background: #dcfce7;
          color: #166534;
        }

        .form-error {
          background: #fee2e2;
          color: #991b1b;
        }

        .info-card {
          display: grid;
          grid-template-columns:
            auto
            1fr;

          gap: 16px;
          padding: 24px;
        }

        .info-card h3 {
          margin:
            0
            0
            8px;

          font-size: 22px;
          color: #0f172a;
        }

        .info-card p {
          margin:
            0
            0
            16px;

          color: #64748b;
          line-height: 1.6;
        }

        .info-card-icon {
          display: grid;
          place-items: center;

          width: 52px;
          height: 52px;

          border-radius: 16px;
          background: #fee2e2;
          color: #ef4444;

          font-size: 22px;
          font-weight: 800;
        }

        .hero-side-card {
          position: relative;
          min-height: 560px;

          padding: 28px;
          border-radius: 32px;

          overflow: hidden;

          background:
            linear-gradient(
              155deg,
              #111827 0%,
              #1f2937 65%,
              #334155 100%
            );

          box-shadow:
            0
            24px
            60px
            rgba(
              15,
              23,
              42,
              0.2
            );
        }

        .hero-side-badge {
          position: relative;
          z-index: 3;

          width: fit-content;

          padding:
            8px
            12px;

          border-radius: 999px;

          background:
            rgba(
              255,
              255,
              255,
              0.1
            );

          color: #ffffff;

          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.08em;
        }

        .hero-side-image {
          position: absolute;
          inset: 20% -5% 16%;
        }

        .hero-image-shape {
          position: absolute;
          border-radius: 28px;
          transform:
            rotate(-7deg);
        }

        .shape-one {
          width: 72%;
          height: 64%;
          left: 11%;
          top: 12%;

          background:
            linear-gradient(
              145deg,
              #f8fafc,
              #cbd5e1
            );
        }

        .shape-two {
          width: 62%;
          height: 47%;
          right: 0;
          bottom: 5%;

          background:
            linear-gradient(
              145deg,
              #ef4444,
              #b91c1c
            );

          transform:
            rotate(11deg);
        }

        .shape-three {
          width: 38%;
          height: 42%;
          left: 26%;
          bottom: -2%;

          background:
            linear-gradient(
              145deg,
              #64748b,
              #1e293b
            );

          transform:
            rotate(-2deg);
        }

        .hero-side-text {
          position: absolute;
          left: 28px;
          right: 28px;
          bottom: 28px;

          z-index: 3;

          color: #ffffff;
        }

        .hero-side-text span {
          display: block;
          margin-bottom: 8px;

          color: #cbd5e1;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.12em;
        }

        .hero-side-text strong {
          display: block;

          font-size: 27px;
          line-height: 1.15;
        }

        .category-section {
          padding:
            84px
            32px;
          background: #ffffff;
        }

        .category-container {
          width: 100%;
          max-width: 1240px;
          margin: 0 auto;
        }

        .category-heading {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 24px;
          margin-bottom: 30px;
        }

        .category-heading h2 {
          margin:
            8px 0
            0;

          color: #0f172a;

          font-size:
            clamp(32px, 4vw, 52px);

          letter-spacing:
            -0.035em;
        }

        .category-all-link {
          color: #475569;
          font-size: 14px;
          font-weight: 700;
          text-decoration: none;
        }

        .category-grid {
          display: grid;
          grid-template-columns:
            repeat(5, minmax(0, 1fr));
          gap: 16px;
        }

        .category-card {
          min-height: 280px;

          padding: 22px;

          border:
            1px solid
            #e2e8f0;

          border-radius: 22px;

          background: #f8fafc;

          transition:
            0.2s
            ease;
        }

        .category-card:hover {
          transform:
            translateY(-3px);

          box-shadow:
            0
            14px
            35px
            rgba(
              15,
              23,
              42,
              0.07
            );
        }

        .category-title {
          display: block;
          margin-bottom: 18px;

          color: #0f172a;

          font-size: 18px;
          font-weight: 800;
          text-decoration: none;
        }

        .category-items {
          display: grid;
          gap: 9px;
        }

        .category-item {
          color: #64748b;
          font-size: 13px;
          text-decoration: none;
        }

        .category-item:hover {
          color: #ef4444;
        }

        .hero-modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 1000;

          display: flex;
          align-items: center;
          justify-content: center;

          padding: 20px;

          background:
            rgba(
              15,
              23,
              42,
              0.55
            );

          backdrop-filter:
            blur(8px);
        }

        .hero-modal {
          position: relative;
          width: 100%;
          max-width: 470px;

          padding: 28px;

          border-radius: 24px;

          background: #ffffff;

          box-shadow:
            0
            30px
            80px
            rgba(
              0,
              0,
              0,
              0.2
            );
        }

        .hero-modal h3 {
          margin:
            10px 0
            8px;

          color: #0f172a;
          font-size: 30px;
        }

        .hero-modal p {
          margin:
            0
            18px;

          color: #64748b;
          line-height: 1.6;
        }

        .hero-modal form {
          display: grid;
          gap: 10px;
        }

        .modal-close {
          position: absolute;
          right: 16px;
          top: 14px;

          width: 36px;
          height: 36px;

          border: 0;
          border-radius: 50%;

          background: #f1f5f9;
          color: #334155;

          cursor: pointer;

          font-size: 20px;
        }

        .full-button {
          width: 100%;
        }

        @media (max-width: 1050px) {
          .hero-container {
            grid-template-columns: 1fr;
          }

          .hero-side-card {
            min-height: 380px;
          }

          .category-grid {
            grid-template-columns:
              repeat(
                2,
                minmax(0, 1fr)
              );
          }
        }

        @media (max-width: 720px) {
          .hero {
            padding:
              65px
              18px
              55px;
          }

          .hero-container {
            gap: 30px;
          }

          .hero-title {
            font-size: 48px;
          }

          .search-grid {
            grid-template-columns: 1fr;
          }

          .field-wide {
            grid-column: auto;
          }

          .search-card-footer {
            flex-wrap: wrap;
          }

          .search-card-footer
            .primary-button {
            width: 100%;
            margin-left: 0;
          }

          .application-grid {
            grid-template-columns: 1fr;
          }

          .application-grid
            .hero-textarea {
            grid-column: auto;
          }

          .advanced-filter-row {
            grid-template-columns:
              repeat(
                2,
                minmax(0, 1fr)
              );
          }

          .category-section {
            padding:
              60px
              18px;
          }

          .category-heading {
            align-items: flex-start;
            flex-direction: column;
          }

          .category-grid {
            grid-template-columns: 1fr;
          }

          .hero-side-card {
            min-height: 330px;
          }
        }
      `}</style>
    </>
  );
}