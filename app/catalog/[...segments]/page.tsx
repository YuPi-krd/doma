import Link from "next/link";
import { notFound } from "next/navigation";

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
  property_type: string;
  property_type_label?: string;
  property_subtype: string;
  property_subtype_label?: string;
  deal_type: string;
  deal_type_label?: string;
  image_url: string;
}

const API_URL =
  "https://doma-nq4u.onrender.com";

const typeLabels: Record<string, string> = {
  apartments: "Квартиры",
  houses: "Дома",
  land: "Земельные участки",
  commercial: "Коммерческая недвижимость",
  garages: "Гаражи",
};

const subtypeLabels: Record<string, string> = {
  secondary: "Вторичка",
  "new-buildings": "Новостройки",
  studios: "Студии",
  "1-room": "1-комнатные",
  "2-room": "2-комнатные",
  "3-room": "3-комнатные",
  "4-room": "4-комнатные",
  "5-room": "5-комнатные",
  penthouses: "Пентхаусы",

  houses: "Дома",
  cottages: "Коттеджи",
  townhouses: "Таунхаусы",
  duplexes: "Дуплексы",
  "part-of-house": "Части дома",
  dachas: "Дачи",

  izhs: "ИЖС",
  gardening: "Садоводство",
  "commercial-land": "Коммерческая земля",
  lph: "ЛПХ",
  dnp: "ДНП",

  offices: "Офисы",
  business: "Готовый бизнес",
  "separate-building":
    "Отдельные здания",
  production: "Производственные",
  warehouses: "Складские",
  retail: "Торговые помещения",

  "garage-box":
    "Бокс в гаражном кооперативе",
  "residential-complex":
    "Внутри жилого комплекса",
  "covered-parking":
    "Крытая стоянка",
  "separate-garage":
    "Отдельно стоящий гараж",
  parking: "Паркинг",
};

const subtypeMap: Record<
  string,
  string
> = {
  secondary: "secondary",
  "new-buildings": "new_building",
  studios: "studio",

  "1-room": "1_room",
  "2-room": "2_room",
  "3-room": "3_room",
  "4-room": "4_room",
  "5-room": "5_room",

  penthouses: "penthouse",

  houses: "house",
  cottages: "cottage",
  townhouses: "townhouse",
  duplexes: "duplex",
  "part-of-house":
    "part_of_house",
  dachas: "dacha",

  izhs: "izhs",
  gardening: "gardening",
  "commercial-land":
    "commercial_land",
  lph: "lph",
  dnp: "dnp",

  offices: "office",
  business: "business",
  "separate-building":
    "separate_building",
  production: "production",
  warehouses: "warehouse",
  retail: "retail",

  "garage-box":
    "garage_box",
  "residential-complex":
    "residential_complex",
  "covered-parking":
    "covered_parking",
  "separate-garage":
    "separate_garage",
  parking: "parking",
};

const typeMap: Record<
  string,
  string
> = {
  apartments: "apartment",
  houses: "house",
  land: "land",
  commercial: "commercial",
  garages: "garage",
};

const dealLabels: Record<
  string,
  string
> = {
  sale: "Продажа",
  rent: "Аренда",
  lease: "Сдача",
};

function formatPrice(
  value: number
) {
  return value.toLocaleString(
    "ru-RU"
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{
    segments: string[];
  }>;
}) {
  const { segments } =
    await params;

  const [
    deal,
    category,
    subtype,
  ] = segments;

  const dealLabel =
    dealLabels[deal];

  const categoryLabel =
    typeLabels[category];

  const subtypeLabel =
    subtypeLabels[subtype];

  if (
    !dealLabel ||
    !categoryLabel
  ) {
    return {
      title:
        "Каталог недвижимости — DOMA",
    };
  }

  const title = subtypeLabel
    ? `${dealLabel}: ${subtypeLabel} — ${categoryLabel}`
    : `${dealLabel}: ${categoryLabel}`;

  return {
    title: `${title} | DOMA`,
    description:
      `Каталог: ${title}`,
  };
}

export default async function SubcatalogPage({
  params,
}: {
  params: Promise<{
    segments: string[];
  }>;
}) {
  const { segments } =
    await params;

  if (
    segments.length < 2 ||
    segments.length > 3
  ) {
    notFound();
  }

  const [
    deal,
    category,
    subtype,
  ] = segments;

  if (
    !dealLabels[deal] ||
    !typeMap[category]
  ) {
    notFound();
  }

  if (
    subtype &&
    !subtypeMap[subtype]
  ) {
    notFound();
  }

  const apiParams =
    new URLSearchParams();

  apiParams.set(
    "deal_type",
    deal
  );

  apiParams.set(
    "property_type",
    typeMap[category]
  );

  if (subtype) {
    apiParams.set(
      "property_subtype",
      subtypeMap[subtype]
    );
  }

  let properties: Property[] =
    [];

  let error = "";

  try {
    const response =
      await fetch(
        `${API_URL}/properties?${apiParams.toString()}`,
        {
          cache: "no-store",
        }
      );

    if (!response.ok) {
      throw new Error(
        "Ошибка загрузки каталога"
      );
    }

    const data =
      await response.json();

    properties = Array.isArray(
      data
    )
      ? data
      : [];
  } catch (err) {
    console.error(err);

    error =
      "Не удалось загрузить объявления.";
  }

  const dealLabel =
    dealLabels[deal];

  const categoryLabel =
    typeLabels[category];

  const subtypeLabel =
    subtypeLabels[subtype];

  const pageTitle = subtypeLabel
    ? `${dealLabel} ${subtypeLabel.toLowerCase()}`
    : `${dealLabel} ${categoryLabel.toLowerCase()}`;

  return (
    <main
      style={{
        minHeight:
          "100vh",
        background:
          "#f8fafc",
        padding:
          "40px 20px 80px",
      }}
    >
      <div
        style={{
          maxWidth:
            "1400px",
          margin:
            "0 auto",
        }}
      >
        {/* ================================================= */}
        {/* ХЛЕБНЫЕ КРОШКИ */}
        {/* ================================================= */}

        <div
          style={{
            marginBottom:
              "20px",
            color:
              "#64748b",
            fontSize:
              "14px",
          }}
        >
          <Link
            href="/catalog"
            style={{
              color:
                "#64748b",
              textDecoration:
                "none",
            }}
          >
            Каталог
          </Link>

          {" → "}

          <Link
            href={`/catalog/${deal}/${category}`}
            style={{
              color:
                "#64748b",
              textDecoration:
                "none",
            }}
          >
            {
              categoryLabel
            }
          </Link>

          {subtype && (
            <>
              {" → "}
              <span
                style={{
                  color:
                    "#111827",
                }}
              >
                {
                  subtypeLabel
                }
              </span>
            </>
          )}
        </div>

        {/* ================================================= */}
        {/* ЗАГОЛОВОК */}
        {/* ================================================= */}

        <div
          style={{
            marginBottom:
              "30px",
          }}
        >
          <h1
            style={{
              margin:
                0,
              fontSize:
                "clamp(34px, 5vw, 50px)",
              fontWeight:
                700,
              color:
                "#111827",
              letterSpacing:
                "-1.5px",
            }}
          >
            {pageTitle}
          </h1>

          <p
            style={{
              margin:
                "10px 0 0",
              color:
                "#64748b",
              fontSize:
                "16px",
            }}
          >
            Краснодар
            {" · "}
            Найдено:
            {" "}
            <strong>
              {
                properties.length
              }
            </strong>
          </p>
        </div>

        {/* ================================================= */}
        {/* ПОДКАТЕГОРИИ */}
        {/* ================================================= */}

        {!subtype && (
          <div
            style={{
              background:
                "#ffffff",
              borderRadius:
                "24px",
              padding:
                "22px",
              marginBottom:
                "30px",
              boxShadow:
                "0 10px 30px rgba(0,0,0,.05)",
            }}
          >
            <h2
              style={{
                margin:
                  "0 0 16px",
                fontSize:
                  "22px",
                color:
                  "#111827",
              }}
            >
              Подкатегории
            </h2>

            <SubcategoryLinks
              deal={deal}
              category={category}
            />
          </div>
        )}

        {/* ================================================= */}
        {/* ОШИБКА */}
        {/* ================================================= */}

        {error && (
          <div
            style={{
              padding:
                "18px",
              background:
                "#fee2e2",
              color:
                "#991b1b",
              borderRadius:
                "16px",
              marginBottom:
                "20px",
            }}
          >
            {error}
          </div>
        )}

        {/* ================================================= */}
        {/* НЕТ ОБЪЕКТОВ */}
        {/* ================================================= */}

        {!error &&
          properties.length ===
            0 && (
            <div
              style={{
                background:
                  "#ffffff",
                borderRadius:
                  "24px",
                padding:
                  "70px 30px",
                textAlign:
                  "center",
                boxShadow:
                  "0 10px 30px rgba(0,0,0,.05)",
              }}
            >
              <div
                style={{
                  fontSize:
                    "48px",
                  marginBottom:
                    "12px",
                }}
              >
                🏠
              </div>

              <h2
                style={{
                  margin:
                    "0 0 8px",
                  color:
                    "#111827",
                }}
              >
                Объявлений пока нет
              </h2>

              <p
                style={{
                  margin:
                    0,
                  color:
                    "#64748b",
                }}
              >
                В этом подкаталоге
                пока нет объектов.
              </p>
            </div>
          )}

        {/* ================================================= */}
        {/* ОБЪЕКТЫ */}
        {/* ================================================= */}

        {properties.length >
          0 && (
          <div
            style={{
              display:
                "grid",
              gridTemplateColumns:
                "repeat(4, minmax(0, 1fr))",
              gap:
                "18px",
            }}
          >
            {properties.map(
              (item) => {
                const image =
                  item.image_url?.startsWith(
                    "http"
                  )
                    ? item.image_url
                    : `${API_URL}${
                        item.image_url ||
                        "/images/test-flat.jpg"
                      }`;

                return (
                  <Link
                    key={
                      item.id
                    }
                    href={`/property/${item.id}`}
                    style={{
                      textDecoration:
                        "none",
                      color:
                        "inherit",
                    }}
                  >
                    <article
                      style={{
                        background:
                          "#ffffff",
                        borderRadius:
                          "22px",
                        overflow:
                          "hidden",
                        boxShadow:
                          "0 10px 30px rgba(0,0,0,.06)",
                        height:
                          "100%",
                        display:
                          "flex",
                        flexDirection:
                          "column",
                      }}
                    >
                      <div
                        style={{
                          width:
                            "100%",
                          height:
                            "240px",
                          background:
                            "#e5e7eb",
                          overflow:
                            "hidden",
                        }}
                      >
                        <img
                          src={
                            image
                          }
                          alt={
                            item.title
                          }
                          style={{
                            width:
                              "100%",
                            height:
                              "100%",
                            objectFit:
                              "cover",
                            display:
                              "block",
                          }}
                        />
                      </div>

                      <div
                        style={{
                          padding:
                            "20px",
                        }}
                      >
                        <div
                          style={{
                            color:
                              "#ef4444",
                            fontSize:
                              "13px",
                            fontWeight:
                              600,
                            marginBottom:
                              "8px",
                          }}
                        >
                          {
                            item.property_subtype_label
                          }
                        </div>

                        <h2
                          style={{
                            margin:
                              "0 0 8px",
                            fontSize:
                              "20px",
                            lineHeight:
                              1.25,
                            color:
                              "#111827",
                          }}
                        >
                          {
                            item.title
                          }
                        </h2>

                        <p
                          style={{
                            margin:
                              "0 0 15px",
                            color:
                              "#64748b",
                            fontSize:
                              "14px",
                          }}
                        >
                          {
                            item.city
                          }
                          {item.district
                            ? `, ${item.district}`
                            : ""}
                        </p>

                        <div
                          style={{
                            fontSize:
                              "25px",
                            fontWeight:
                              700,
                            color:
                              "#111827",
                            marginBottom:
                              "10px",
                          }}
                        >
                          {formatPrice(
                            item.price
                          )}{" "}
                          ₽
                        </div>

                        <div
                          style={{
                            display:
                              "flex",
                            gap:
                              "14px",
                            flexWrap:
                              "wrap",
                            fontSize:
                              "14px",
                            color:
                              "#475569",
                          }}
                        >
                          {item.area >
                            0 && (
                            <span>
                              {item.area}{" "}
                              м²
                            </span>
                          )}

                          {item.rooms >
                            0 && (
                            <span>
                              {
                                item.rooms
                              }{" "}
                              комн.
                            </span>
                          )}
                        </div>
                      </div>
                    </article>
                  </Link>
                );
              }
            )}
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 1100px) {
          main > div > div:last-child {
            grid-template-columns: repeat(
              3,
              minmax(0, 1fr)
            ) !important;
          }
        }

        @media (max-width: 800px) {
          main > div > div:last-child {
            grid-template-columns: repeat(
              2,
              minmax(0, 1fr)
            ) !important;
          }
        }

        @media (max-width: 550px) {
          main > div > div:last-child {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </main>
  );
}

function SubcategoryLinks({
  deal,
  category,
}: {
  deal: string;
  category: string;
}) {
  const links: Record<
    string,
    {
      slug: string;
      label: string;
    }[]
  > = {
    apartments: [
      {
        slug:
          "secondary",
        label:
          "Вторичка",
      },
      {
        slug:
          "new-buildings",
        label:
          "Новостройки",
      },
      {
        slug:
          "studios",
        label:
          "Студии",
      },
      {
        slug:
          "1-room",
        label:
          "1-комнатные",
      },
      {
        slug:
          "2-room",
        label:
          "2-комнатные",
      },
      {
        slug:
          "3-room",
        label:
          "3-комнатные",
      },
      {
        slug:
          "4-room",
        label:
          "4-комнатные",
      },
      {
        slug:
          "5-room",
        label:
          "5-комнатные",
      },
      {
        slug:
          "penthouses",
        label:
          "Пентхаусы",
      },
    ],

    houses: [
      {
        slug:
          "houses",
        label:
          "Дома",
      },
      {
        slug:
          "cottages",
        label:
          "Коттеджи",
      },
      {
        slug:
          "townhouses",
        label:
          "Таунхаусы",
      },
      {
        slug:
          "duplexes",
        label:
          "Дуплексы",
      },
      {
        slug:
          "part-of-house",
        label:
          "Части дома",
      },
      {
        slug:
          "dachas",
        label:
          "Дачи",
      },
    ],

    land: [
      {
        slug:
          "izhs",
        label:
          "ИЖС",
      },
      {
        slug:
          "gardening",
        label:
          "Садоводство",
      },
      {
        slug:
          "commercial-land",
        label:
          "Коммерческая земля",
      },
      {
        slug:
          "lph",
        label:
          "ЛПХ",
      },
      {
        slug:
          "dnp",
        label:
          "ДНП",
      },
    ],

    commercial: [
      {
        slug:
          "offices",
        label:
          "Офисы",
      },
      {
        slug:
          "business",
        label:
          "Готовый бизнес",
      },
      {
        slug:
          "separate-building",
        label:
          "Отдельные здания",
      },
      {
        slug:
          "production",
        label:
          "Производственные",
      },
      {
        slug:
          "warehouses",
        label:
          "Складские",
      },
      {
        slug:
          "retail",
        label:
          "Торговые помещения",
      },
    ],

    garages: [
      {
        slug:
          "garage-box",
        label:
          "Гаражный бокс",
      },
      {
        slug:
          "residential-complex",
        label:
          "Внутри ЖК",
      },
      {
        slug:
          "covered-parking",
        label:
          "Крытая стоянка",
      },
      {
        slug:
          "separate-garage",
        label:
          "Отдельно стоящий гараж",
      },
      {
        slug:
          "parking",
        label:
          "Паркинг",
      },
    ],
  };

  return (
    <div
      style={{
        display:
          "flex",
        flexWrap:
          "wrap",
        gap:
          "10px",
      }}
    >
      {(
        links[
          category
        ] || []
      ).map(
        (item) => (
          <Link
            key={
              item.slug
            }
            href={`/catalog/${deal}/${category}/${item.slug}`}
            style={{
              padding:
                "12px 16px",
              border:
                "1px solid #e5e7eb",
              borderRadius:
                "12px",
              color:
                "#111827",
              textDecoration:
                "none",
              fontWeight:
                600,
              background:
                "#ffffff",
            }}
          >
            {
              item.label
            }
          </Link>
        )
      )}
    </div>
  );
}