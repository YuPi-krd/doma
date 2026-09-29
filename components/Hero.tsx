"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

type Category = {
  title: string;
  items: string[];
};

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

const propertyTypes = [
  "Квартира",
  "Квартира в новостройке",
  "Дом",
  "Земельный участок",
  "Коммерческая недвижимость",
  "Гараж",
];

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
// Форма заявки
// ============================================================

type ApplicationFormProps = {
  applicationType:
    | "Продать"
    | "Снять"
    | "Сдать";

  title: string;

  submitText?: string;
};

function ApplicationForm({
  applicationType,
  title,
  submitText = "Оставить заявку",
}: ApplicationFormProps) {
  const [propertyType, setPropertyType] =
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

    if (!name.trim()) {
      setError("Введите имя.");
      return;
    }

    if (!phone.trim()) {
      setError("Введите телефон.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const commentParts = [
        `Заявка: ${applicationType}`,
        propertyType
          ? `Тип: ${propertyType}`
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

        {/* Имя */}

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

        {/* Телефон */}

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

        {/* Комментарий */}

        <input
          className="search-input"
          placeholder="Комментарий"
          value={comment}
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
          disabled={loading}
          style={{
            border: "none",
            opacity:
              loading ? 0.7 : 1,
          }}
        >
          {loading
            ? "Отправляем..."
            : submitText}
        </button>
      </div>

      {/* Согласие */}

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
          checked={agreement}
          onChange={(e) =>
            setAgreement(
              e.target.checked
            )
          }
          style={{
            marginTop: "2px",
            accentColor:
              "#ef4444",
          }}
        />

        <span>
          Нажимая кнопку
          «{submitText}», я
          даю согласие на
          обработку
          персональных данных.
        </span>
      </label>

      {/* Ошибка */}

      {error && (
        <div
          style={{
            marginTop: "12px",
            padding:
              "12px 14px",
            borderRadius:
              "12px",
            background:
              "rgba(254,226,226,.95)",
            color:
              "#991b1b",
            fontSize: "13px",
          }}
        >
          {error}
        </div>
      )}

      {/* Успех */}

      {success && (
        <div
          style={{
            marginTop: "12px",
            padding:
              "12px 14px",
            borderRadius:
              "12px",
            background:
              "rgba(220,252,231,.95)",
            color:
              "#166534",
            fontSize: "13px",
            fontWeight: 600,
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

export default function Hero() {
  const [activeTab, setActiveTab] =
    useState("Купить");

  const [propertyType, setPropertyType] =
    useState("");

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

  const [selectedCategory, setSelectedCategory] =
    useState<string | null>(null);

  const handleTabChange = (
    tab: string
  ) => {
    setActiveTab(tab);
    setShowFilters(false);
    setSelectedCategory(null);
  };

  const typeMap: Record<
    string,
    string
  > = {
    "Квартира": "apartment",
    "Квартира в новостройке":
      "new_building",
    "Дом": "house",
    "Земельный участок":
      "land",
    "Коммерческая недвижимость":
      "commercial",
    "Гараж": "garage",
  };

  const handleSearch = () => {
    const params =
      new URLSearchParams();

    if (propertyType) {
      const type =
        typeMap[propertyType];

      if (type) {
        params.set(
          "type",
          type
        );
      }
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

  return (
    <section className="hero">
      <div className="container hero-content">

        {/* ================================================== */}
        {/* Заголовок */}
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
          Покупка, продажа и аренда
          недвижимости в Краснодаре.
          Полное сопровождение сделки
          и персональный подход
          к каждому клиенту.
        </p>

        {/* ================================================== */}
        {/* Статистика */}
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
            zIndex: 20,
          }}
        >
          {/* ================================================= */}
          {/* ТАБЫ */}
          {/* ================================================= */}

          <div
            className="search-tabs"
            style={{
              display: "flex",
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

          {/* ================================================= */}
          {/* КУПИТЬ */}
          {/* ================================================= */}

          {activeTab ===
            "Купить" && (
            <>
              <div
                className="search-grid"
                style={{
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
                  marginTop:
                    "12px",
                }}
              >
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

                <Link
                  href="/map"
                  className="btn"
                  style={{
                    textDecoration:
                      "none",
                    display: "flex",
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
            <div>
              <ApplicationForm
                applicationType="Продать"
                title="Заявка на продажу недвижимости"
              />
            </div>
          )}

          {/* ================================================= */}
          {/* СНЯТЬ */}
          {/* ================================================= */}

          {activeTab ===
            "Снять" && (
            <>
              <div>
                <ApplicationForm
                  applicationType="Снять"
                  title="Заявка на аренду недвижимости"
                />
              </div>

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
              <div>
                <ApplicationForm
                  applicationType="Сдать"
                  title="Заявка на сдачу недвижимости"
                />
              </div>

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
          {/* ИПОТЕКА / ОЦЕНИТЬ */}
          {/* ================================================= */}

          {(activeTab ===
            "Ипотека" ||
            activeTab ===
              "Оценить") && (
            <div
              style={{
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
        @media (max-width: 1000px) {
          .search-grid {
            grid-template-columns: 1fr 1fr !important;
          }

          .search-box form > div:first-child {
            grid-template-columns: 1fr 1fr !important;
          }
        }

        @media (max-width: 800px) {
          .search-grid {
            grid-template-columns: 1fr !important;
          }

          .search-box > div {
            overflow-x: visible;
          }
        }

        @media (max-width: 700px) {
          .category-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}

// ============================================================
// Блок категорий
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
      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
          gap: "20px",
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
            fontWeight: 600,
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
          display: "grid",
          gridTemplateColumns:
            `repeat(${Math.min(
              categories.length,
              4
            )}, 1fr)`,
          gap: "12px",
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
                  width: "100%",
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
                    key={item}
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
                  Категория выбрана
                </div>
              )}
            </div>
          )
        )}
      </div>
    </>
  );
}
