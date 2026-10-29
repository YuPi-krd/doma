"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";
import Link from "next/link";

import PropertyGallery from "@/components/PropertyGallery";
import YandexMap from "@/components/YandexMap";

interface Property {
  id: number;
  title: string;
  description?: string | null;

  price: number;
  area: number;
  rooms: number;

  city: string;
  district: string;
  address: string;
  status: string;

  property_type: string;
  property_type_label?: string;

  property_subtype?: string;
  property_subtype_label?: string;

  deal_type?: string;
  deal_type_label?: string;

  image_url?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  is_draft?: boolean;
}

type PropertyType =
  | "all"
  | "apartment"
  | "house"
  | "land"
  | "commercial"
  | "garage";

type DealType =
  | "all"
  | "sale"
  | "rent"
  | "lease";

const API_URL =
  "https://doma-nq4u.onrender.com";

/* ============================================================
   ТИПЫ НЕДВИЖИМОСТИ
============================================================ */

const PROPERTY_TYPES: {
  value: Exclude<
    PropertyType,
    "all"
  >;
  label: string;
}[] = [
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

const PROPERTY_TYPE_LABELS: Record<
  string,
  string
> = {
  all: "Вся недвижимость",
  apartment: "Квартиры",
  house: "Дома",
  land: "Земельные участки",
  commercial:
    "Коммерческая недвижимость",
  garage: "Гаражи",
};

/* ============================================================
   ОПЕРАЦИИ
============================================================ */

const DEAL_TYPE_LABELS: Record<
  string,
  string
> = {
  all: "Все операции",
  sale: "Продажа",
  rent: "Аренда",
  lease: "Сдача",
};

/* ============================================================
   ПОДТИПЫ
============================================================ */

const SUBTYPE_LABELS: Record<
  string,
  string
> = {
  secondary: "Вторичка",
  new_building: "Новостройки",
  studio: "Студии",

  "1_room": "1-комнатные",
  "2_room": "2-комнатные",
  "3_room": "3-комнатные",
  "4_room": "4-комнатные",
  "5_room": "5-комнатные",

  penthouse: "Пентхаусы",

  house: "Дома",
  part_of_house: "Части дома",
  townhouse: "Таунхаусы",
  duplex: "Дуплексы",
  cottage: "Коттеджи",
  dacha: "Дачи",

  izhs: "ИЖС",
  gardening: "Садоводство",
  commercial_land:
    "Коммерческая земля",
  lph: "ЛПХ",
  dnp: "ДНП",

  office: "Офисы",
  business: "Готовый бизнес",
  separate_building:
    "Отдельные здания",
  production: "Производственные",
  warehouse: "Складские",
  retail: "Торговые помещения",

  garage_box: "Гаражные боксы",
  residential_complex:
    "Внутри ЖК",
  covered_parking:
    "Крытая парковка",
  separate_garage:
    "Отдельно стоящие гаражи",
  parking: "Паркинг",
};

const SUBTYPES_BY_TYPE: Record<
  Exclude<
    PropertyType,
    "all"
  >,
  {
    value: string;
    label: string;
  }[]
> = {
  apartment: [
    {
      value: "1_room",
      label: "1-комнатные",
    },
    {
      value: "2_room",
      label: "2-комнатные",
    },
    {
      value: "3_room",
      label: "3-комнатные",
    },
    {
      value: "4_room",
      label: "4-комнатные",
    },
    {
      value: "5_room",
      label: "5-комнатные",
    },
    {
      value: "studio",
      label: "Студии",
    },
    {
      value: "secondary",
      label: "Вторичка",
    },
    {
      value: "new_building",
      label: "Новостройки",
    },
    {
      value: "penthouse",
      label: "Пентхаусы",
    },
  ],

  house: [
    {
      value: "house",
      label: "Дома",
    },
    {
      value: "cottage",
      label: "Коттеджи",
    },
    {
      value: "townhouse",
      label: "Таунхаусы",
    },
    {
      value: "duplex",
      label: "Дуплексы",
    },
    {
      value: "part_of_house",
      label: "Части дома",
    },
    {
      value: "dacha",
      label: "Дачи",
    },
  ],

  land: [
    {
      value: "izhs",
      label: "ИЖС",
    },
    {
      value: "gardening",
      label: "Садоводство",
    },
    {
      value: "commercial_land",
      label: "Коммерческая земля",
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
      label: "Офисы",
    },
    {
      value: "business",
      label: "Готовый бизнес",
    },
    {
      value: "separate_building",
      label: "Отдельные здания",
    },
    {
      value: "production",
      label: "Производственные",
    },
    {
      value: "warehouse",
      label: "Складские",
    },
    {
      value: "retail",
      label: "Торговые помещения",
    },
  ],

  garage: [
    {
      value: "garage_box",
      label: "Гаражные боксы",
    },
    {
      value: "residential_complex",
      label: "Внутри ЖК",
    },
    {
      value: "covered_parking",
      label: "Крытая парковка",
    },
    {
      value: "separate_garage",
      label:
        "Отдельно стоящие гаражи",
    },
    {
      value: "parking",
      label: "Паркинг",
    },
  ],
};

/* ============================================================
   HELPERS
============================================================ */

function normalizePropertyType(
  value: string | null
): PropertyType {
  if (!value || value === "all") {
    return "all";
  }

  if (
    value === "new_building"
  ) {
    return "apartment";
  }

  if (
    value === "apartment" ||
    value === "house" ||
    value === "land" ||
    value === "commercial" ||
    value === "garage"
  ) {
    return value;
  }

  return "all";
}

function normalizeDealType(
  value: string | null
): DealType {
  if (
    value === "sale" ||
    value === "rent" ||
    value === "lease"
  ) {
    return value;
  }

  return "sale";
}

function formatPrice(
  value: number
) {
  return Number(
    value || 0
  ).toLocaleString("ru-RU");
}

function getTypeLabel(
  item: Property
) {
  return (
    item.property_type_label ||
    PROPERTY_TYPE_LABELS[
      item.property_type
    ] ||
    "Недвижимость"
  );
}

function getSubtypeLabel(
  item: Property
) {
  return (
    item.property_subtype_label ||
    SUBTYPE_LABELS[
      item.property_subtype ||
        ""
    ] ||
    ""
  );
}

function getDealLabel(
  item: Property
) {
  return (
    item.deal_type_label ||
    DEAL_TYPE_LABELS[
      item.deal_type ||
        ""
    ] ||
    ""
  );
}

/* ============================================================
   PAGE
============================================================ */

export default function CatalogPage() {
  const [
    properties,
    setProperties,
  ] = useState<Property[]>(
    []
  );

  const [
    propertyType,
    setPropertyType,
  ] = useState<PropertyType>(
    "apartment"
  );

  const [
    propertySubtype,
    setPropertySubtype,
  ] = useState("all");

  const [
    dealType,
    setDealType,
  ] = useState<DealType>(
    "sale"
  );

  const [
    search,
    setSearch,
  ] = useState("");

  // Location chosen on the Hero page. Kept separate from the free-text search
  // so filtering by a city does not accidentally hide listings with short addresses.
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedLocationKind, setSelectedLocationKind] = useState<"city" | "location" | "">("");

  const [
    rooms,
    setRooms,
  ] = useState("all");

  const [
    district,
    setDistrict,
  ] = useState("all");

  const [
    status,
    setStatus,
  ] = useState("all");

  const [
    priceFrom,
    setPriceFrom,
  ] = useState("");

  const [
    priceTo,
    setPriceTo,
  ] = useState("");

  const [
    areaFrom,
    setAreaFrom,
  ] = useState("");

  const [
    areaTo,
    setAreaTo,
  ] = useState("");

  const [
    floorFrom,
    setFloorFrom,
  ] = useState("");

  const [
    floorTo,
    setFloorTo,
  ] = useState("");

  const [
    repair,
    setRepair,
  ] = useState("all");

  const [
    balcony,
    setBalcony,
  ] = useState("all");

  const [
    roomType,
    setRoomType,
  ] = useState("all");

  const [
    wallMaterial,
    setWallMaterial,
  ] = useState("all");

  const [
    bathroom,
    setBathroom,
  ] = useState("all");

  const [
    exclusive,
    setExclusive,
  ] = useState(false);

  const [
    sort,
    setSort,
  ] = useState("default");

  const [
    view,
    setView,
  ] = useState<
    "list" | "map"
  >("list");

  // Компактные карточки включены по умолчанию; размер можно переключить в шапке.
  const [cardSize, setCardSize] = useState<"compact" | "large">("compact");

  const [
    filterOpen,
    setFilterOpen,
  ] = useState(false);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  /* ==========================================================
     INITIAL LOAD
  ========================================================== */

  useEffect(() => {
    const params =
      new URLSearchParams(
        window.location.search
      );

    const urlType =
      params.get(
        "property_type"
      );

    const oldType =
      params.get("type");

    const urlSubtype =
      params.get(
        "property_subtype"
      );

    const urlDeal =
      params.get("deal_type");

    const urlCity = (params.get("city") || "").trim();
    const urlArea = (params.get("location") || "").trim();
    const urlLocation = urlCity || urlArea;
    const urlLocationKind: "city" | "location" | "" = urlCity
      ? "city"
      : urlArea
      ? "location"
      : "";

    setSelectedLocation(urlLocation);
    setSelectedLocationKind(urlLocationKind);

    let nextType =
      normalizePropertyType(
        urlType
      );

    if (
      !urlType &&
      oldType
    ) {
      if (
        oldType ===
        "new_building"
      ) {
        nextType =
          "apartment";
      } else {
        nextType =
          normalizePropertyType(
            oldType
          );
      }
    }

    if (
      !urlType &&
      !oldType &&
      !urlDeal &&
      !urlLocation
    ) {
      // Только чистый /catalog без поисковых параметров открывает
      // стандартную категорию квартир. Поиск по городу оставляет все типы.
      nextType = "apartment";
    }

    const nextDeal =
      normalizeDealType(
        urlDeal
      );

    const nextSubtype =
      urlSubtype ||
      (
        oldType ===
        "new_building"
          ? "new_building"
          : "all"
      );

    setPropertyType(
      nextType
    );

    setPropertySubtype(
      nextSubtype
    );

    setDealType(
      nextDeal
    );

    loadProperties({
      propertyType:
        nextType,
      propertySubtype:
        nextSubtype,
      dealType:
        nextDeal,
      location: urlLocation,
      locationKind: urlLocationKind,
    });
  }, []);

  /* ==========================================================
     LOAD PROPERTIES
  ========================================================== */

  async function loadProperties({
    propertyType,
    propertySubtype,
    dealType,
    location,
    locationKind,
  }: {
    propertyType: PropertyType;
    propertySubtype: string;
    dealType: DealType;
    location?: string;
    locationKind?: "city" | "location" | "";
  }) {
    try {
      setLoading(true);
      setError("");

      const params =
        new URLSearchParams();

      if (
        propertyType !== "all"
      ) {
        params.set(
          "property_type",
          propertyType
        );
      }

      if (
        propertySubtype !==
        "all"
      ) {
        params.set(
          "property_subtype",
          propertySubtype
        );
      }

      if (
        dealType !== "all"
      ) {
        params.set(
          "deal_type",
          dealType
        );
      }

      const locationToFilter = (location ?? selectedLocation).trim();
      const locationParameter = locationKind ?? selectedLocationKind;
      if (locationToFilter) {
        // City is an exact city-field filter; neighborhood/area values use location.
        params.set(locationParameter === "city" ? "city" : "location", locationToFilter);
      }

      const query =
        params.toString();

      const url =
        query
          ? `${API_URL}/properties?${query}`
          : `${API_URL}/properties`;

      const response =
        await fetch(url, {
          cache: "no-store",
        });

      if (!response.ok) {
        throw new Error(
          `Сервер каталога вернул HTTP ${response.status}`
        );
      }

      const data =
        await response.json();

      // Публичный каталог не должен показывать черновики из CRM.
      setProperties(
        Array.isArray(data)
          ? data.filter((item: Property) => item?.is_draft !== true)
          : []
      );
    } catch (err) {
      console.error(err);

      setProperties([]);

      setError(
        err instanceof Error
          ? `Не удалось загрузить объявления. ${err.message}`
          : "Не удалось загрузить объявления. Проверьте доступность API."
      );
    } finally {
      setLoading(false);
    }
  }

  /* ==========================================================
     CATEGORY
  ========================================================== */

  function updateCategory({
    nextDealType,
    nextPropertyType,
    nextSubtype,
  }: {
    nextDealType: DealType;
    nextPropertyType: PropertyType;
    nextSubtype: string;
  }) {
    setDealType(
      nextDealType
    );

    setPropertyType(
      nextPropertyType
    );

    setPropertySubtype(
      nextSubtype
    );

    /*
     * При смене категории
     * сбрасываем локальные фильтры,
     * которые могут стать некорректными.
     */
    setRooms("all");
    setDistrict("all");
    setStatus("all");

    loadProperties({
      propertyType:
        nextPropertyType,
      propertySubtype:
        nextSubtype,
      dealType:
        nextDealType,
      location: selectedLocation,
      locationKind: selectedLocationKind,
    });

    const params =
      new URLSearchParams();

    if (
      nextDealType !== "all"
    ) {
      params.set(
        "deal_type",
        nextDealType
      );
    }

    if (
      nextPropertyType !==
      "all"
    ) {
      params.set(
        "property_type",
        nextPropertyType
      );
    }

    if (
      nextSubtype !== "all"
    ) {
      params.set(
        "property_subtype",
        nextSubtype
      );
    }

    if (selectedLocation.trim()) {
      params.set(
        selectedLocationKind === "city" ? "city" : "location",
        selectedLocation.trim()
      );
    }

    const query =
      params.toString();

    window.history.replaceState(
      null,
      "",
      query
        ? `/catalog?${query}`
        : "/catalog"
    );
  }

  function handleTypeChange(
    value: string
  ) {
    const nextType =
      normalizePropertyType(
        value
      );

    updateCategory({
      nextDealType:
        dealType,
      nextPropertyType:
        nextType,
      nextSubtype:
        "all",
    });
  }

  function handleSubtypeChange(
    value: string
  ) {
    updateCategory({
      nextDealType:
        dealType,
      nextPropertyType:
        propertyType,
      nextSubtype:
        value,
    });
  }

  function handleDealChange(
    value: string
  ) {
    const nextDeal =
      normalizeDealType(
        value
      );

    updateCategory({
      nextDealType:
        nextDeal,
      nextPropertyType:
        propertyType,
      nextSubtype:
        propertySubtype,
    });
  }

  /* ==========================================================
     FILTER DATA
  ========================================================== */

  const districts =
    useMemo(() => {
      return Array.from(
        new Set(
          properties
            .map(
              (item) =>
                item.district
            )
            .filter(Boolean)
        )
      ).sort();
    }, [properties]);

  const currentSubtypes =
    propertyType !==
    "all"
      ? SUBTYPES_BY_TYPE[
          propertyType
        ]
      : [];

  function getSubtypeCount(
    subtype: string
  ) {
    if (
      propertySubtype !==
      "all"
    ) {
      return "";
    }

    return properties.filter(
      (item) =>
        item.property_subtype ===
        subtype
    ).length;
  }

  /* ==========================================================
     LOCAL FILTERING
  ========================================================== */

  const filteredProperties =
    useMemo(() => {
      let result = [
        ...properties,
      ];

      if (
        search.trim()
      ) {
        const query =
          search
            .trim()
            .toLowerCase();

        result =
          result.filter(
            (item) => {
              const title =
                (
                  item.title ||
                  ""
                ).toLowerCase();

              const address =
                (
                  item.address ||
                  ""
                ).toLowerCase();

              const city =
                (
                  item.city ||
                  ""
                ).toLowerCase();

              const districtValue =
                (
                  item.district ||
                  ""
                ).toLowerCase();

              return (
                title.includes(
                  query
                ) ||
                address.includes(
                  query
                ) ||
                city.includes(
                  query
                ) ||
                districtValue.includes(
                  query
                )
              );
            }
          );
      }

      if (
        rooms !== "all"
      ) {
        if (
          rooms === "4"
        ) {
          result =
            result.filter(
              (item) =>
                Number(
                  item.rooms
                ) >= 4
            );
        } else {
          result =
            result.filter(
              (item) =>
                Number(
                  item.rooms
                ) ===
                Number(
                  rooms
                )
            );
        }
      }

      if (
        district !== "all"
      ) {
        result =
          result.filter(
            (item) =>
              item.district ===
              district
          );
      }

      if (
        status !== "all"
      ) {
        result =
          result.filter(
            (item) =>
              item.status ===
              status
          );
      }

      if (
        priceFrom
      ) {
        result =
          result.filter(
            (item) =>
              Number(
                item.price
              ) >=
              Number(
                priceFrom
              )
          );
      }

      if (
        priceTo
      ) {
        result =
          result.filter(
            (item) =>
              Number(
                item.price
              ) <=
              Number(
                priceTo
              )
          );
      }

      if (
        areaFrom
      ) {
        result =
          result.filter(
            (item) =>
              Number(
                item.area
              ) >=
              Number(
                areaFrom
              )
          );
      }

      if (
        areaTo
      ) {
        result =
          result.filter(
            (item) =>
              Number(
                item.area
              ) <=
              Number(
                areaTo
              )
          );
      }

      if (
        sort ===
        "price_asc"
      ) {
        result.sort(
          (a, b) =>
            a.price -
            b.price
        );
      }

      if (
        sort ===
        "price_desc"
      ) {
        result.sort(
          (a, b) =>
            b.price -
            a.price
        );
      }

      if (
        sort ===
        "area_desc"
      ) {
        result.sort(
          (a, b) =>
            b.area -
            a.area
        );
      }

      return result;
    }, [
      properties,
      search,
      rooms,
      district,
      status,
      priceFrom,
      priceTo,
      areaFrom,
      areaTo,
      sort,
    ]);

  /* ==========================================================
     RESET
  ========================================================== */

  function resetFilters() {
    setSearch("");
    setRooms("all");
    setDistrict("all");
    setStatus("all");

    setPriceFrom("");
    setPriceTo("");

    setAreaFrom("");
    setAreaTo("");

    setFloorFrom("");
    setFloorTo("");

    setRepair("all");
    setBalcony("all");
    setRoomType("all");
    setWallMaterial("all");
    setBathroom("all");

    setExclusive(false);
    setSort("default");

    setPropertySubtype(
      "all"
    );

    setFilterOpen(false);

    updateCategory({
      nextDealType:
        dealType,
      nextPropertyType:
        propertyType,
      nextSubtype:
        "all",
    });
  }

  /* ==========================================================
     TITLES
  ========================================================== */

  const currentTypeLabel =
    PROPERTY_TYPE_LABELS[
      propertyType
    ] ||
    "Вся недвижимость";

  const currentDealLabel =
    DEAL_TYPE_LABELS[
      dealType
    ] ||
    "Продажа";

  const currentSubtypeLabel =
    propertySubtype !==
    "all"
      ? SUBTYPE_LABELS[
          propertySubtype
        ] ||
        propertySubtype
      : "";

  const displayLocation = selectedLocation || "Краснодар";

  const pageTitle =
    propertyType === "all"
      ? `${currentDealLabel} недвижимости — ${displayLocation}`
      : `${currentDealLabel} ${currentTypeLabel.toLowerCase()} — ${displayLocation}`;

  /* ==========================================================
     MAP MARKERS
  ========================================================== */

  const mapMarkers = useMemo(() => filteredProperties.map((item) => {
    const hasCoordinates =
      item.latitude !== null && item.latitude !== undefined &&
      item.longitude !== null && item.longitude !== undefined &&
      Number.isFinite(Number(item.latitude)) &&
      Number.isFinite(Number(item.longitude));

    return {
      id: item.id,
      title: item.title,
      price: Number(item.price || 0),
      coordinates: hasCoordinates
        ? [Number(item.longitude), Number(item.latitude)] as [number, number]
        : undefined,
      address: item.address || "",
      district: item.district || "",
      city: item.city || "",
      image_url: item.image_url || "",
      area: Number(item.area || 0),
      rooms: Number(item.rooms || 0),
      status: item.status || "",
      property_type: item.property_type || "",
      property_type_label: item.property_type_label || "",
      property_subtype: item.property_subtype || "",
      property_subtype_label: item.property_subtype_label || "",
      deal_type: item.deal_type || "",
      deal_type_label: item.deal_type_label || "",
    };
  }).filter((item) => item.coordinates || item.address || item.district), [filteredProperties]);

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <>
      <main className="catalog-page">
        <div className="catalog-container">

          {/* ==================================================
              BREADCRUMBS
          ================================================== */}

          <div className="breadcrumbs">
            <Link href="/">
              Недвижимость — {displayLocation}
            </Link>

            <span>/</span>

            <span>
              {currentTypeLabel}
            </span>

            {currentSubtypeLabel && (
              <>
                <span>/</span>

                <span>
                  {
                    currentSubtypeLabel
                  }
                </span>
              </>
            )}
          </div>

          {/* ==================================================
              TOP BAR
          ================================================== */}

          <div className="top-bar">

            <button
              type="button"
              className="round-sort"
              onClick={() =>
                setSort(
                  sort ===
                    "price_asc"
                    ? "default"
                    : "price_asc"
                )
              }
              title="Сортировка"
            >
              ↕
            </button>

            <div className="title-block">
              <h1>
                {pageTitle}
              </h1>

              <span>
                Найдено{" "}
                {
                  filteredProperties.length
                }{" "}
                объявлений
              </span>
            </div>

            <div className="top-bar-actions">
              <button
                type="button"
                className="filter-button"
              onClick={() =>
                setFilterOpen(
                  true
                )
              }
            >
              <span className="filter-icon">
                ⚙
              </span>

              <span>
                Настройки фильтра

                <small>
                  Настроить поиск
                </small>
              </span>
            </button>

            <div className="view-switch">

              <button
                type="button"
                className={
                  view ===
                  "list"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setView(
                    "list"
                  )
                }
              >
                ☷
                <span>
                  Списком
                </span>
              </button>

              <button
                type="button"
                className={
                  view ===
                  "map"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setView(
                    "map"
                  )
                }
              >
                ◉
                <span>
                  На карте
                </span>
              </button>

            </div>

              <div className="size-switch" role="group" aria-label="Размер карточек">
                <button
                  type="button"
                  className={cardSize === "compact" ? "active" : ""}
                  onClick={() => setCardSize("compact")}
                  aria-pressed={cardSize === "compact"}
                  title="Показывать компактные карточки"
                >
                  ▤ Компактно
                </button>
                <button
                  type="button"
                  className={cardSize === "large" ? "active" : ""}
                  onClick={() => setCardSize("large")}
                  aria-pressed={cardSize === "large"}
                  title="Показывать крупные карточки"
                >
                  ▦ Крупно
                </button>
              </div>
            </div>
          </div>

          {/* ==================================================
              CATEGORY
          ================================================== */}

          <div className="category-tabs">

            <button
              type="button"
              className={
                propertyType ===
                "all"
                  ? "selected"
                  : ""
              }
              onClick={() =>
                handleTypeChange(
                  "all"
                )
              }
            >
              Вся недвижимость
            </button>

            {PROPERTY_TYPES.map(
              (item) => (
                <button
                  key={
                    item.value
                  }
                  type="button"
                  className={
                    propertyType ===
                    item.value
                      ? "selected"
                      : ""
                  }
                  onClick={() =>
                    handleTypeChange(
                      item.value
                    )
                  }
                >
                  {
                    item.label
                  }
                </button>
              )
            )}

          </div>

          {/* ==================================================
              SUBTYPES
          ================================================== */}

          {propertyType !==
            "all" && (
            <div className="subtype-tabs">

              {currentSubtypes.map(
                (item) => {
                  const count =
                    getSubtypeCount(
                      item.value
                    );

                  return (
                    <button
                      key={
                        item.value
                      }
                      type="button"
                      className={
                        propertySubtype ===
                        item.value
                          ? "active"
                          : ""
                      }
                      onClick={() =>
                        handleSubtypeChange(
                          propertySubtype ===
                            item.value
                            ? "all"
                            : item.value
                        )
                      }
                    >
                      <span>
                        {
                          item.label
                        }
                      </span>

                      {count !==
                        "" && (
                        <small>
                          {count}
                        </small>
                      )}
                    </button>
                  );
                }
              )}

            </div>
          )}

          {/* ==================================================
              MAP
          ================================================== */}

          {view === "map" ? (
            <div className="map-view">

              <div className="map-header">

                <div>
                  <h2>
                    Объекты на карте
                  </h2>

                  <p>
                    {displayLocation} ·{" "}
                    {
                      filteredProperties.length
                    }{" "}
                    объявлений
                  </p>
                </div>

                <button
                  type="button"
                  className="back-to-list"
                  onClick={() =>
                    setView(
                      "list"
                    )
                  }
                >
                  ☷ Списком
                </button>

              </div>

              <YandexMap
                height="680px"
                markers={
                  mapMarkers
                }
              />

            </div>
          ) : (
            <>
              {/* ==================================================
                  ERROR
              ================================================== */}

              {error && (
                <div className="error-box">
                  {error}
                </div>
              )}

              {/* ==================================================
                  LOADING
              ================================================== */}

              {loading && (
                <div className="loading-box">
                  Загружаем объявления...
                </div>
              )}

              {/* ==================================================
                  EMPTY
              ================================================== */}

              {!loading &&
                !error &&
                filteredProperties.length ===
                  0 && (
                  <div className="empty-box">

                    <div className="empty-icon">
                      🏠
                    </div>

                    <h2>
                      Объявлений не найдено
                    </h2>

                    <p>
                      Попробуйте изменить
                      параметры поиска.
                    </p>

                    <button
                      type="button"
                      onClick={
                        resetFilters
                      }
                    >
                      Сбросить фильтры
                    </button>

                  </div>
                )}

              {/* ==================================================
                  GRID
              ================================================== */}

              {!loading &&
                filteredProperties.length >
                  0 && (
                  <div className={`property-grid ${cardSize === "compact" ? "compact-view" : "large-view"}`}>

                    {filteredProperties.map(
                      (item) => {
                        const pricePerMeter =
                          item.area >
                          0
                            ? Math.round(
                                item.price /
                                  item.area
                              )
                            : 0;

                        const dealLabel =
                          getDealLabel(
                            item
                          );

                        const typeLabel =
                          getTypeLabel(
                            item
                          );

                        const subtypeLabel =
                          getSubtypeLabel(
                            item
                          );

                        return (
                          <Link
                            key={
                              item.id
                            }
                            href={`/property/${item.id}`}
                            className="property-card-link"
                          >

                            <article className="property-card">

                              {/* FOTO */}

                              <div className="photo-wrap">

                                <PropertyGallery
                                  propertyId={
                                    item.id
                                  }
                                  mainImage={
                                    item.image_url ||
                                    undefined
                                  }
                                  title={
                                    item.title
                                  }
                                  variant="card"
                                />

                                {item.status ===
                                  "Забронирован" && (
                                  <div className="status-badge">
                                    Бронь
                                  </div>
                                )}

                              </div>

                              {/* CARD CONTENT */}

                              <div className="card-content">
                                <div className="card-row">
                                  <div className="card-info">
                                <div className="card-type">
                                  {dealLabel}
                                  {" · "}
                                  {
                                    typeLabel
                                  }
                                </div>

                                <div className="card-title">
                                  {
                                    item.title
                                  }
                                </div>

                                <div className="card-address">
                                  {item.city}

                                  {item.district
                                    ? `, ${item.district}`
                                    : ""}

                                  {item.address
                                    ? `, ${item.address}`
                                    : ""}
                                </div>

                                <div className="price-row">

                                  <span className="price">
                                    {formatPrice(
                                      item.price
                                    )}{" "}
                                    ₽
                                  </span>

                                  {pricePerMeter >
                                    0 && (
                                    <span className="price-meter">
                                      {formatPrice(
                                        pricePerMeter
                                      )}{" "}
                                      ₽/м²
                                    </span>
                                  )}

                                </div>

                                <div className="finance-row">

                                  {subtypeLabel && (
                                    <span className="subtype-chip">
                                      {
                                        subtypeLabel
                                      }
                                    </span>
                                  )}

                                  {item.status && (
                                    <span
                                      className={
                                        item.status ===
                                        "Свободен"
                                          ? "status-chip free"
                                          : "status-chip"
                                      }
                                    >
                                      {
                                        item.status
                                      }
                                    </span>
                                  )}

                                </div>

                                <div className="card-meta">

                                  {item.area >
                                    0 && (
                                    <span>
                                      📐{" "}
                                      {
                                        item.area
                                      }{" "}
                                      м²
                                    </span>
                                  )}

                                  {item.rooms >
                                    0 && (
                                    <span>
                                      🏠{" "}
                                      {
                                        item.rooms
                                      }{" "}
                                      комн.
                                    </span>
                                  )}

                                  {item.city && (
                                    <span>
                                      📍{" "}
                                      {
                                        item.city
                                      }
                                    </span>
                                  )}

                                </div>
                                </div>

                                  <div className="card-bottom">
                                    <span className="contact-button">
                                      Связаться
                                    </span>
                                  </div>
                                </div>
                              </div>

                            </article>
                          </Link>
                        );
                      }
                    )}

                  </div>
                )}
            </>
          )}

        </div>
      </main>

      {/* ========================================================
         FILTER MODAL
      ======================================================== */}

      {filterOpen && (
        <div
          className="modal-overlay"
          onMouseDown={() =>
            setFilterOpen(
              false
            )
          }
        >

          <div
            className="filter-modal"
            onMouseDown={(
              e
            ) =>
              e.stopPropagation()
            }
          >

            {/* HEADER */}

            <div className="modal-header">

              <h2>
                Настройки поиска
              </h2>

              <button
                type="button"
                className="close-button"
                onClick={() =>
                  setFilterOpen(
                    false
                  )
                }
                aria-label="Закрыть"
              >
                ×
              </button>

            </div>

            {/* OPERATIONS */}

            <div className="operation-tabs">

              <button
                type="button"
                className={
                  dealType ===
                  "sale"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  handleDealChange(
                    "sale"
                  )
                }
              >
                Купить
              </button>

              <button
                type="button"
                className={
                  dealType ===
                  "rent"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  handleDealChange(
                    "rent"
                  )
                }
              >
                Снять
              </button>

              <button
                type="button"
                className={
                  dealType ===
                  "lease"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  handleDealChange(
                    "lease"
                  )
                }
              >
                Сдать
              </button>

            </div>

            {/* BASIC */}

            <div className="modal-section-title">
              Основные
            </div>

            <div className="modal-two-columns">

              <div className="field">
                <label>
                  Тип недвижимости
                </label>

                <select
                  value={
                    propertyType
                  }
                  onChange={(
                    e
                  ) =>
                    handleTypeChange(
                      e.target.value
                    )
                  }
                >
                  <option value="all">
                    Вся недвижимость
                  </option>

                  {PROPERTY_TYPES.map(
                    (item) => (
                      <option
                        key={
                          item.value
                        }
                        value={
                          item.value
                        }
                      >
                        {
                          item.label
                        }
                      </option>
                    )
                  )}

                </select>
              </div>

              <div className="field">
                <label>
                  Подтип недвижимости
                </label>

                <select
                  value={
                    propertySubtype
                  }
                  disabled={
                    propertyType ===
                    "all"
                  }
                  onChange={(
                    e
                  ) =>
                    handleSubtypeChange(
                      e.target.value
                    )
                  }
                >
                  <option value="all">
                    Все подтипы
                  </option>

                  {currentSubtypes.map(
                    (item) => (
                      <option
                        key={
                          item.value
                        }
                        value={
                          item.value
                        }
                      >
                        {
                          item.label
                        }
                      </option>
                    )
                  )}

                </select>
              </div>

            </div>

            {/* SEARCH */}

            <div className="field full">
              <label>
                Поиск по городу,
                району, улице, ЖК
              </label>

              <input
                value={search}
                onChange={(
                  e
                ) =>
                  setSearch(
                    e.target.value
                  )
                }
                placeholder="Например: Красная"
              />
            </div>

            {/* PRICE */}

            <div className="modal-section-title">
              Стоимость
            </div>

            <div className="modal-two-columns">

              <div className="field">
                <label>
                  Цена от
                </label>

                <input
                  type="number"
                  min="0"
                  value={
                    priceFrom
                  }
                  onChange={(
                    e
                  ) =>
                    setPriceFrom(
                      e.target.value
                    )
                  }
                  placeholder="Цена от"
                />
              </div>

              <div className="field">
                <label>
                  Цена до
                </label>

                <input
                  type="number"
                  min="0"
                  value={
                    priceTo
                  }
                  onChange={(
                    e
                  ) =>
                    setPriceTo(
                      e.target.value
                    )
                  }
                  placeholder="Цена до"
                />
              </div>

            </div>

            {/* AREA */}

            <div className="modal-section-title">
              Площадь
            </div>

            <div className="modal-two-columns">

              <div className="field">
                <label>
                  Площадь от
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={
                    areaFrom
                  }
                  onChange={(
                    e
                  ) =>
                    setAreaFrom(
                      e.target.value
                    )
                  }
                  placeholder="Площадь от"
                />
              </div>

              <div className="field">
                <label>
                  Площадь до
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={
                    areaTo
                  }
                  onChange={(
                    e
                  ) =>
                    setAreaTo(
                      e.target.value
                    )
                  }
                  placeholder="Площадь до"
                />
              </div>

            </div>

            {/* FLOOR */}

            <div className="modal-section-title">
              Этаж
            </div>

            <div className="modal-two-columns">

              <div className="field">
                <label>
                  Этаж от
                </label>

                <input
                  type="number"
                  min="0"
                  value={
                    floorFrom
                  }
                  onChange={(
                    e
                  ) =>
                    setFloorFrom(
                      e.target.value
                    )
                  }
                  placeholder="Этаж от"
                />
              </div>

              <div className="field">
                <label>
                  Этаж до
                </label>

                <input
                  type="number"
                  min="0"
                  value={
                    floorTo
                  }
                  onChange={(
                    e
                  ) =>
                    setFloorTo(
                      e.target.value
                    )
                  }
                  placeholder="Этаж до"
                />
              </div>

            </div>

            {/* ROOMS */}

            {propertyType ===
              "apartment" && (
              <>
                <div className="modal-section-title">
                  Комнаты
                </div>

                <div className="room-buttons">

                  {[
                    ["all", "Все"],
                    ["1", "1"],
                    ["2", "2"],
                    ["3", "3"],
                    ["4", "4+"],
                  ].map(
                    (item) => (
                      <button
                        key={
                          item[0]
                        }
                        type="button"
                        className={
                          rooms ===
                          item[0]
                            ? "active"
                            : ""
                        }
                        onClick={() =>
                          setRooms(
                            item[0]
                          )
                        }
                      >
                        {
                          item[1]
                        }
                      </button>
                    )
                  )}

                </div>
              </>
            )}

            {/* DISTRICT */}

            <div className="modal-section-title">
              Район
            </div>

            <div className="field full">

              <select
                value={
                  district
                }
                onChange={(
                  e
                ) =>
                  setDistrict(
                    e.target.value
                  )
                }
              >
                <option value="all">
                  Все районы
                </option>

                {districts.map(
                  (item) => (
                    <option
                      key={
                        item
                      }
                      value={
                        item
                      }
                    >
                      {
                        item
                      }
                    </option>
                  )
                )}

              </select>

            </div>

            {/* STATUS */}

            <div className="modal-section-title">
              Статус
            </div>

            <div className="field full">

              <select
                value={
                  status
                }
                onChange={(
                  e
                ) =>
                  setStatus(
                    e.target.value
                  )
                }
              >
                <option value="all">
                  Любой
                </option>

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

            {/* ADDITIONAL */}

            <div className="modal-section-title">
              Дополнительные
            </div>

            <div className="modal-two-columns">

              <div className="field">

                <label>
                  Ремонт
                </label>

                <select
                  value={
                    repair
                  }
                  onChange={(
                    e
                  ) =>
                    setRepair(
                      e.target.value
                    )
                  }
                >
                  <option value="all">
                    Любой
                  </option>

                  <option value="cosmetic">
                    Косметический
                  </option>

                  <option value="euro">
                    Евроремонт
                  </option>

                  <option value="design">
                    Дизайнерский
                  </option>

                  <option value="none">
                    Без ремонта
                  </option>

                </select>

              </div>

              <div className="field">

                <label>
                  Балкон
                </label>

                <select
                  value={
                    balcony
                  }
                  onChange={(
                    e
                  ) =>
                    setBalcony(
                      e.target.value
                    )
                  }
                >
                  <option value="all">
                    Любой
                  </option>

                  <option value="yes">
                    Есть
                  </option>

                  <option value="no">
                    Нет
                  </option>
                </select>

              </div>

              <div className="field">

                <label>
                  Типы комнат
                </label>

                <select
                  value={
                    roomType
                  }
                  onChange={(
                    e
                  ) =>
                    setRoomType(
                      e.target.value
                    )
                  }
                >
                  <option value="all">
                    Любой
                  </option>

                  <option value="isolated">
                    Изолированные
                  </option>

                  <option value="adjacent">
                    Смежные
                  </option>

                </select>

              </div>

              <div className="field">

                <label>
                  Материал стен
                </label>

                <select
                  value={
                    wallMaterial
                  }
                  onChange={(
                    e
                  ) =>
                    setWallMaterial(
                      e.target.value
                    )
                  }
                >
                  <option value="all">
                    Любой
                  </option>

                  <option value="brick">
                    Кирпич
                  </option>

                  <option value="panel">
                    Панель
                  </option>

                  <option value="monolith">
                    Монолит
                  </option>

                  <option value="block">
                    Блок
                  </option>

                </select>

              </div>

            </div>

            {/* BATHROOM */}

            <div className="field full">

              <label>
                Санузел
              </label>

              <select
                value={
                  bathroom
                }
                onChange={(
                  e
                ) =>
                  setBathroom(
                    e.target.value
                  )
                }
              >
                <option value="all">
                  Любой
                </option>

                <option value="separate">
                  Раздельный
                </option>

                <option value="combined">
                  Совмещённый
                </option>

              </select>

            </div>

            {/* EXCLUSIVE */}

            <label className="switch-row">

              <input
                type="checkbox"
                checked={
                  exclusive
                }
                onChange={(
                  e
                ) =>
                  setExclusive(
                    e.target.checked
                  )
                }
              />

              <span className="fake-switch">
                <span />
              </span>

              <span>
                Только эксклюзивные
              </span>

            </label>

            {/* FOOTER */}

            <div className="modal-footer">

              <button
                type="button"
                className="reset-button"
                onClick={
                  resetFilters
                }
              >
                Сброс
              </button>

              <button
                type="button"
                className="search-button"
                onClick={() =>
                  setFilterOpen(
                    false
                  )
                }
              >

                <span className="search-icon">
                  ⌕
                </span>

                <span>
                  Показать объявления

                  <small>
                    Найдено{" "}
                    {
                      filteredProperties.length
                    }
                  </small>

                </span>

              </button>

            </div>

          </div>
        </div>
      )}

      <style jsx>{`
        * {
          box-sizing: border-box;
        }

        .catalog-page {
          min-height: 100vh;
          padding: 14px 20px 60px;
          background: #f3f4f7;
        }

        .catalog-container {
          max-width: 1380px;
          margin: 0 auto;
        }

        /* ========================================================
           BREADCRUMBS
        ======================================================== */

        .breadcrumbs {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 5px;
          margin-bottom: 14px;
          color: #a1a7b1;
          font-size: 13px;
        }

        .breadcrumbs a {
          color: #3d4652;
          text-decoration: none;
          font-weight: 500;
        }

        /* ========================================================
           TOP BAR
        ======================================================== */

        .top-bar {
          display: grid;
          grid-template-columns:
            48px
            minmax(240px, 1fr)
            auto;
          gap: 12px;
          align-items: center;
          padding: 10px;
          margin-bottom: 14px;
          border-radius: 36px;
          background: #ffffff;
          box-shadow:
            0 5px 18px
              rgba(
                17,
                24,
                39,
                0.04
              );
        }

        .round-sort {
          width: 44px;
          height: 44px;
          border:
            1px solid
            #dfe4eb;
          border-radius: 50%;
          background: #ffffff;
          color: #526071;
          cursor: pointer;
          font-size: 20px;
        }

        .title-block {
          min-width: 0;
        }

        .title-block h1 {
          margin: 0;
          color: #333b47;
          font-size: 18px;
          line-height: 1.2;
          font-weight: 700;
        }

        .title-block span {
          display: block;
          margin-top: 3px;
          color: #788290;
          font-size: 12px;
        }

        .top-bar-actions {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 8px;
          min-width: 0;
          flex-wrap: nowrap;
        }

        .filter-button {
          display: flex;
          align-items: center;
          gap: 10px;
          min-height: 46px;
          padding: 0 18px;
          border:
            1px solid
            #dfe4eb;
          border-radius: 24px;
          background: #ffffff;
          color: #3f4854;
          cursor: pointer;
          font-size: 13px;
          font-weight: 600;
        }

        .filter-button small {
          display: block;
          margin-top: 2px;
          color: #929ba8;
          font-size: 10px;
          text-align: left;
          font-weight: 400;
        }

        .filter-icon {
          width: 30px;
          height: 30px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: #ef4444;
          color: #ffffff;
        }

        .view-switch {
          display: flex;
          padding: 4px;
          border-radius: 24px;
          background: #f1f3f6;
        }

        .view-switch button {
          border: 0;
          border-radius: 20px;
          padding:
            10px
            15px;
          background: transparent;
          color: #8b94a1;
          cursor: pointer;
          font-size: 13px;
          white-space: nowrap;
        }

        .view-switch button.active {
          background: #ffffff;
          color: #2f3741;
          box-shadow:
            0 2px 8px
              rgba(
                0,
                0,
                0,
                0.05
              );
        }

        .size-switch {
          display: flex;
          align-items: center;
          gap: 3px;
          padding: 4px;
          border-radius: 24px;
          background: #f1f3f6;
          white-space: nowrap;
        }

        .size-switch button {
          border: 0;
          border-radius: 20px;
          padding: 10px 11px;
          background: transparent;
          color: #8b94a1;
          cursor: pointer;
          font-size: 12px;
          white-space: nowrap;
          transition: background 0.15s ease, color 0.15s ease;
        }

        .size-switch button.active {
          background: #ffffff;
          color: #2f3741;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        /* ========================================================
           CATEGORY / SUBTYPE
        ======================================================== */

        .category-tabs,
        .subtype-tabs {
          display: flex;
          align-items: center;
          gap: 8px;
          overflow-x: auto;
          scrollbar-width: none;
        }

        .category-tabs::-webkit-scrollbar,
        .subtype-tabs::-webkit-scrollbar {
          display: none;
        }

        .category-tabs {
          padding:
            2px
            0
            12px;
        }

        .subtype-tabs {
          padding:
            2px
            0
            10px;
        }

        .category-tabs button,
        .subtype-tabs button {
          flex: 0 0 auto;
          border:
            1px solid
            #dce1e8;
          border-radius: 999px;
          background: #ffffff;
          color: #4f5966;
          cursor: pointer;
          transition: 0.15s;
        }

        .category-tabs button {
          padding:
            10px
            16px;
          font-size: 13px;
        }

        .category-tabs button.selected {
          border-color: #262d35;
          background: #262d35;
          color: #ffffff;
        }

        .subtype-tabs button {
          display: flex;
          align-items: center;
          gap: 8px;
          padding:
            10px
            16px;
          font-size: 13px;
        }

        .subtype-tabs button.active {
          border-color: #c7cdd6;
          background: #ffffff;
          color: #222a34;
          box-shadow:
            inset 0 0 0 1px #d8dee7;
        }

        .subtype-tabs button small {
          color: #7e8794;
          font-size: 11px;
        }

        /* ========================================================
           MAP
        ======================================================== */

        .map-view {
          margin-top: 6px;
        }

        .map-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 12px;
          padding:
            4px
            2px;
        }

        .map-header h2 {
          margin: 0;
          color: #222a33;
          font-size: 23px;
        }

        .map-header p {
          margin:
            5px
            0
            0;
          color: #7b8592;
          font-size: 13px;
        }

        .back-to-list {
          border:
            1px solid
            #dce2e8;
          border-radius: 12px;
          padding:
            11px
            16px;
          background: #ffffff;
          color: #394451;
          cursor: pointer;
          font-size: 13px;
          font-weight: 600;
        }

        /* ========================================================
           PROPERTY GRID
        ======================================================== */

        .property-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr);
          gap: 18px;
          width: 100%;
          max-width: 1240px;
        }

        .property-card-link {
          color: inherit;
          text-decoration: none;
        }

        .property-card {
          overflow: hidden;
          min-height: 290px;
          display: grid;
          grid-template-columns: minmax(300px, 38%) minmax(0, 1fr);
          height: 100%;
          border:
            1px solid
            #e4e6ea;
          border-radius: 20px;
          background: #ffffff;
          box-shadow:
            0 4px 15px
              rgba(
                17,
                24,
                39,
                0.04
              );
          transition:
            transform
              0.18s ease,
            box-shadow
              0.18s ease;
        }

        /* Компактный режим: больше объявлений помещается на экране. */
        .property-grid.compact-view {
          gap: 8px;
          width: 100%;
          max-width: 1240px;
        }

        .property-grid.compact-view .property-card-link {
          display: block;
          height: 126px;
          min-height: 126px;
          max-height: 126px;
        }

        .property-grid.compact-view .property-card {
          box-sizing: border-box;
          height: 100%;
          min-height: 0;
          max-height: 100%;
          grid-template-rows: minmax(0, 1fr);
          grid-template-columns: 210px minmax(0, 1fr);
          border-radius: 13px;
        }

        .property-grid.compact-view .photo-wrap {
          height: 100%;
          min-height: 0 !important;
          max-height: 100%;
          align-self: stretch;
          overflow: hidden;
        }

        .property-grid.compact-view .photo-wrap > * {
          width: 100%;
          min-width: 0;
          height: 100% !important;
          min-height: 0 !important;
          max-height: 100% !important;
          flex: 1 1 0;
          overflow: hidden;
        }

        .property-grid.compact-view .card-content {
          min-height: 0;
          padding: 8px 12px;
          overflow: hidden;
        }

        .property-grid.compact-view .card-row {
          display: flex;
          align-items: center;
          gap: 20px;
          min-width: 0;
        }

        .property-grid.compact-view .card-type {
          margin-bottom: 2px;
          font-size: 10px;
          line-height: 1.15;
        }

        .property-grid.compact-view .card-title {
          font-size: 15px;
          line-height: 1.15;
        }

        .property-grid.compact-view .card-address {
          min-height: 0;
          margin-top: 2px;
          font-size: 10px;
          line-height: 1.2;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .property-grid.compact-view .price-row {
          gap: 7px;
          margin-top: 4px;
          line-height: 1.1;
        }

        .property-grid.compact-view .price {
          font-size: 17px;
          line-height: 1.1;
        }

        .property-grid.compact-view .price-meter {
          font-size: 10px;
        }

        .property-grid.compact-view .finance-row {
          gap: 4px;
          margin-top: 3px;
        }

        .property-grid.compact-view .subtype-chip,
        .property-grid.compact-view .status-chip {
          padding: 2px 5px;
          font-size: 9px;
          line-height: 1.1;
        }

        .property-grid.compact-view .card-meta {
          gap: 9px;
          margin-top: 4px;
          font-size: 10px;
          line-height: 1.15;
        }

        .property-grid.compact-view .card-info {
          flex: 1 1 auto;
          min-width: 0;
        }

        .property-grid.compact-view .card-bottom {
          flex: 0 0 auto;
          display: flex;
          justify-content: flex-end;
          align-self: center;
          margin: 0;
          padding: 0;
          border-top: 0;
        }

        .property-grid.compact-view .contact-button {
          width: auto;
          min-width: 112px;
          padding: 7px 13px;
          font-size: 10px;
          line-height: 1.1;
          white-space: nowrap;
        }

        .property-card:hover {
          transform:
            translateY(-2px);
          box-shadow:
            0 12px 30px
              rgba(
                17,
                24,
                39,
                0.08
              );
        }

        /* ========================================================
           PHOTO
        ======================================================== */

        .photo-wrap {
          position: relative;
          display: flex;
          height: 100%;
          min-height: 290px;
          overflow: hidden;
          background: #e9edf2;
        }

        .status-badge {
          position: absolute;
          top: 10px;
          left: 10px;
          z-index: 20;
          padding:
            5px
            8px;
          border-radius: 8px;
          background: #ef4444;
          color: #ffffff;
          font-size: 10px;
          font-weight: 700;
        }

        /* ========================================================
           CARD
        ======================================================== */

        .card-content {
          min-width: 0;
          padding: 22px 24px 20px;
        }

        .card-row {
          display: flex;
          align-items: center;
          gap: 24px;
          min-width: 0;
        }

        .card-info {
          flex: 1 1 auto;
          min-width: 0;
        }

        .card-type {
          margin-bottom: 8px;
          color: #ef4444;
          font-size: 12px;
          font-weight: 700;
        }

        .card-title {
          min-height: 0;
          color: #151b22;
          font-size: 22px;
          line-height: 1.3;
          font-weight: 700;
        }

        .card-address {
          min-height: 36px;
          margin-top: 8px;
          color: #6f7885;
          font-size: 13px;
          line-height: 1.5;
        }

        .price-row {
          display: flex;
          align-items: baseline;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 18px;
        }

        .price {
          color: #111827;
          font-size: 27px;
          font-weight: 700;
        }

        .price-meter {
          color: #657181;
          font-size: 13px;
        }

        .finance-row {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 13px;
        }

        .subtype-chip,
        .status-chip {
          padding: 6px 9px;
          border-radius: 8px;
          font-size: 11px;
          font-weight: 700;
        }

        .subtype-chip {
          background: #f0f2f4;
          color: #687281;
        }

        .status-chip {
          background: #fee2e2;
          color: #991b1b;
        }

        .status-chip.free {
          background: #dcfce7;
          color: #166534;
        }

        .card-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          margin-top: 15px;
          color: #475569;
          font-size: 13px;
        }

        .card-bottom {
          flex: 0 0 auto;
          display: flex;
          justify-content: flex-end;
          align-self: center;
          margin: 0;
          padding: 0;
          border-top: 0;
        }

        .contact-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: auto;
          min-width: 170px;
          padding: 12px 22px;
          border:
            1px solid
            #dbe1e7;
          border-radius: 999px;
          color: #3c4652;
          font-size: 13px;
          text-align: center;
          font-weight: 600;
        }

        /* ========================================================
           STATES
        ======================================================== */

        .loading-box,
        .empty-box,
        .map-placeholder {
          padding:
            60px
            24px;
          border-radius: 20px;
          background: #ffffff;
          text-align: center;
        }

        .loading-box {
          color: #748091;
        }

        .error-box {
          margin-bottom: 16px;
          padding:
            18px
            20px;
          border-radius: 16px;
          background: #fee2e2;
          color: #991b1b;
          font-weight: 500;
        }

        .empty-icon,
        .map-icon {
          margin-bottom: 12px;
          font-size: 48px;
        }

        .empty-box h2,
        .map-placeholder h2 {
          margin:
            0
            0
            8px;
          color: #222a33;
        }

        .empty-box p,
        .map-placeholder p {
          max-width: 550px;
          margin:
            0
            auto
            20px;
          color: #7a8491;
        }

        .empty-box button,
        .map-placeholder button {
          border: 0;
          border-radius: 10px;
          padding:
            12px
            18px;
          background: #ef4444;
          color: #ffffff;
          cursor: pointer;
          font-weight: 600;
        }

        /* ========================================================
           MODAL
        ======================================================== */

        .modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background:
            rgba(
              17,
              24,
              39,
              0.55
            );
          backdrop-filter: blur(4px);
        }

        .filter-modal {
          width: min(
            640px,
            100%
          );
          max-height: 94vh;
          overflow-y: auto;
          padding:
            24px
            28px
            18px;
          border-radius: 28px;
          background: #ffffff;
          box-shadow:
            0 30px 80px
              rgba(
                0,
                0,
                0,
                0.2
              );
        }

        .modal-header {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 18px;
        }

        .modal-header h2 {
          margin: 0;
          color: #4c5662;
          font-size: 15px;
          font-weight: 700;
        }

        .close-button {
          position: absolute;
          top: -4px;
          right: -4px;
          width: 30px;
          height: 30px;
          border: 0;
          background: transparent;
          color: #27303a;
          cursor: pointer;
          font-size: 22px;
        }

        .operation-tabs {
          display: grid;
          grid-template-columns:
            repeat(
              3,
              1fr
            );
          gap: 4px;
          width: min(
            340px,
            100%
          );
          margin:
            0
            auto
            20px;
          padding: 4px;
          border-radius: 25px;
          background: #f0f2f5;
        }

        .operation-tabs button {
          border: 0;
          border-radius: 21px;
          padding:
            10px
            8px;
          background: transparent;
          color: #8d96a2;
          cursor: pointer;
          font-size: 12px;
          font-weight: 600;
        }

        .operation-tabs button.active {
          background: #ffffff;
          color: #242b34;
          box-shadow:
            0 2px 8px
              rgba(
                0,
                0,
                0,
                0.06
              );
        }

        .modal-section-title {
          margin:
            17px
            0
            9px;
          color: #53606d;
          font-size: 13px;
          font-weight: 700;
        }

        .modal-two-columns {
          display: grid;
          grid-template-columns:
            1fr 1fr;
          gap: 8px;
        }

        .field {
          min-width: 0;
        }

        .field.full {
          margin-top: 8px;
        }

        .field label {
          display: block;
          margin:
            0
            0
            5px;
          color: #8993a0;
          font-size: 10px;
        }

        .field input,
        .field select {
          width: 100%;
          height: 43px;
          padding:
            0
            14px;
          border: 0;
          border-radius: 22px;
          outline: none;
          background: #f1f3f6;
          color: #5a6674;
          font-size: 12px;
        }

        .field select {
          cursor: pointer;
        }

        .field select:disabled {
          cursor: not-allowed;
          opacity: 0.55;
        }

        .room-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .room-buttons button {
          min-width: 58px;
          padding:
            9px
            13px;
          border:
            1px solid
            #dfe4ea;
          border-radius: 11px;
          background: #ffffff;
          color: #5d6875;
          cursor: pointer;
          font-size: 12px;
        }

        .room-buttons button.active {
          border-color: #ef4444;
          background: #ef4444;
          color: #ffffff;
        }

        .switch-row {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 14px;
          color: #323a45;
          cursor: pointer;
          font-size: 12px;
        }

        .switch-row input {
          position: absolute;
          opacity: 0;
          pointer-events: none;
        }

        .fake-switch {
          position: relative;
          width: 34px;
          height: 20px;
          flex: 0 0 34px;
          border:
            1px solid
            #e0e4e8;
          border-radius: 999px;
          background: #edf0f3;
        }

        .fake-switch span {
          position: absolute;
          top: 2px;
          left: 2px;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #ffffff;
          box-shadow:
            0 1px 3px
              rgba(
                0,
                0,
                0,
                0.15
              );
          transition: 0.18s;
        }

        .switch-row
          input:checked
          + .fake-switch {
          border-color: #ef4444;
          background: #ef4444;
        }

        .switch-row
          input:checked
          + .fake-switch
          span {
          left: 16px;
        }

        .modal-footer {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 22px;
          padding-top: 10px;
        }

        .reset-button {
          min-width: 92px;
          padding:
            12px
            16px;
          border:
            1px solid
            #dbe1e7;
          border-radius: 22px;
          background: #ffffff;
          color: #66717f;
          cursor: pointer;
          font-size: 12px;
          font-weight: 600;
        }

        .search-button {
          display: flex;
          align-items: center;
          gap: 9px;
          min-width: 190px;
          padding:
            11px
            14px;
          border: 0;
          border-radius: 24px;
          background: #ef3340;
          color: #ffffff;
          cursor: pointer;
          font-size: 12px;
          font-weight: 700;
          text-align: left;
        }

        .search-icon {
          width: 28px;
          height: 28px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background:
            rgba(
              255,
              255,
              255,
              0.18
            );
          font-size: 17px;
        }

        .search-button small {
          display: block;
          margin-top: 1px;
          opacity: 0.85;
          font-size: 9px;
          font-weight: 400;
        }

        /* ========================================================
           RESPONSIVE
        ======================================================== */

        @media (max-width: 1150px) {
          .property-grid {
            grid-template-columns: minmax(0, 1fr);
          }

          .top-bar {
            grid-template-columns:
              48px
              minmax(0, 1fr)
              auto;
          }

          .top-bar-actions {
            max-width: 100%;
            flex-wrap: wrap;
            justify-content: flex-end;
          }
        }

        @media (max-width: 850px) {
          .catalog-page {
            padding:
              12px
              12px
              40px;
          }

          .property-grid {
            grid-template-columns: minmax(0, 1fr);
          }

          .top-bar {
            grid-template-columns:
              44px
              1fr;
            border-radius: 24px;
          }

          .top-bar-actions {
            grid-column: 1 / -1;
            width: 100%;
            justify-content: stretch;
            flex-wrap: wrap;
          }

          .filter-button {
            flex: 1 1 180px;
            justify-content: center;
          }

          .size-switch {
            flex: 0 0 auto;
          }

          .view-switch {
            flex: 1 0 100%;
            width: 100%;
          }

          .view-switch button {
            flex: 1;
          }

          .map-header {
            align-items: flex-start;
          }
        }

        @media (max-width: 600px) {
          .property-grid {
            grid-template-columns: 1fr;
          }

          .property-card {
            display: block;
          }

          .card-content {
            display: block;
          }

          .card-row {
            display: block;
          }

          .card-bottom,
          .property-grid.compact-view .card-bottom {
            justify-content: flex-end;
            margin-top: 12px;
            padding-top: 10px;
            border-top: 1px solid #eceff3;
          }

          .photo-wrap {
            height: 230px;
            min-height: 0;
          }

          .property-grid.compact-view .photo-wrap {
            height: 96px;
            min-height: 96px;
            max-height: 96px;
          }

          .property-grid.compact-view .property-card-link {
            height: auto;
            min-height: 0;
            max-height: none;
          }

          .property-grid.compact-view .property-card {
            height: auto;
            min-height: 0;
            max-height: none;
          }

          .property-grid.compact-view .card-content {
            padding: 10px 12px 10px;
          }

          .filter-modal {
            padding:
              22px
              18px
              14px;
          }

          .modal-overlay {
            align-items: flex-end;
            padding: 0;
          }

          .modal-two-columns {
            grid-template-columns: 1fr;
          }

          .modal-footer {
            position: sticky;
            bottom: -1px;
            background: #ffffff;
            padding-top: 12px;
          }

          .map-header {
            flex-direction: column;
          }

          .back-to-list {
            width: 100%;
          }
        }

        @media (max-width: 420px) {
          .catalog-page {
            padding:
              8px
              8px
              30px;
          }

          .top-bar {
            padding: 8px;
          }

          .category-tabs button,
          .subtype-tabs button {
            padding:
              9px
              12px;
            font-size: 12px;
          }

          .price {
            font-size: 19px;
          }

          .filter-modal {
            padding:
              20px
              14px
              12px;
          }

          .modal-footer {
            flex-direction: column;
          }

          .reset-button,
          .search-button {
            width: 100%;
            justify-content: center;
          }
        }

        /* ========================================================
           CARD APPEARANCE ONLY — compact vertical listing cards
           All data, filters, navigation and other page sections
           remain unchanged.
        ======================================================== */

        .property-grid,
        .property-grid.compact-view,
        .property-grid.large-view {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          align-items: stretch;
          gap: 10px;
          width: 100%;
          max-width: 1240px;
        }

        .property-grid .property-card-link,
        .property-grid.compact-view .property-card-link,
        .property-grid.large-view .property-card-link {
          display: block;
          height: auto;
          min-height: 0;
          max-height: none;
          min-width: 0;
          color: inherit;
          text-decoration: none;
        }

        .property-grid .property-card,
        .property-grid.compact-view .property-card,
        .property-grid.large-view .property-card {
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          align-items: stretch;
          width: 100%;
          height: 100%;
          min-width: 0;
          min-height: 292px;
          max-height: none;
          grid-template-columns: minmax(0, 1fr);
          grid-template-rows: auto minmax(0, 1fr);
          overflow: hidden;
          border: 1.5px solid #ef403b;
          border-radius: 14px;
          background: #ffffff;
          box-shadow: 0 2px 7px rgba(23, 31, 42, 0.05);
          transition: border-color 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease;
        }

        .property-grid .property-card:hover,
        .property-grid.compact-view .property-card:hover,
        .property-grid.large-view .property-card:hover {
          border-color: #ef403b;
          box-shadow: 0 7px 18px rgba(239, 64, 59, 0.12);
          transform: translateY(-2px);
        }

        .property-grid .photo-wrap,
        .property-grid.compact-view .photo-wrap,
        .property-grid.large-view .photo-wrap {
          position: relative;
          display: flex;
          flex: 0 0 128px;
          width: 100%;
          height: 128px;
          min-height: 128px !important;
          max-height: 128px;
          overflow: hidden;
          align-self: stretch;
          background: #edf0f3;
        }

        .property-grid .photo-wrap > *,
        .property-grid.compact-view .photo-wrap > *,
        .property-grid.large-view .photo-wrap > * {
          flex: 1 1 auto;
          display: block;
          width: 100% !important;
          min-width: 0;
          height: 100% !important;
          min-height: 0 !important;
          max-height: 100% !important;
          overflow: hidden;
        }

        .property-grid .photo-wrap :global(img),
        .property-grid.compact-view .photo-wrap :global(img),
        .property-grid.large-view .photo-wrap :global(img) {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .property-grid .status-badge,
        .property-grid.compact-view .status-badge,
        .property-grid.large-view .status-badge {
          top: 8px;
          left: 8px;
          padding: 4px 7px;
          border-radius: 7px;
          font-size: 9px;
          line-height: 1.1;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.12);
        }

        .property-grid .card-content,
        .property-grid.compact-view .card-content,
        .property-grid.large-view .card-content {
          display: block;
          flex: 1 1 auto;
          min-width: 0;
          min-height: 0;
          padding: 8px 8px 9px;
          overflow: visible;
        }

        .property-grid .card-row,
        .property-grid.compact-view .card-row,
        .property-grid.large-view .card-row {
          display: flex;
          flex-direction: column;
          align-items: stretch;
          gap: 8px;
          width: 100%;
          min-width: 0;
          height: 100%;
        }

        .property-grid .card-info,
        .property-grid.compact-view .card-info,
        .property-grid.large-view .card-info {
          flex: 1 1 auto;
          width: 100%;
          min-width: 0;
        }

        .property-grid .card-type,
        .property-grid.compact-view .card-type,
        .property-grid.large-view .card-type {
          margin: 0 0 3px;
          color: #ef403b;
          font-size: 9px;
          line-height: 1.15;
          font-weight: 700;
        }

        .property-grid .card-title,
        .property-grid.compact-view .card-title,
        .property-grid.large-view .card-title {
          display: -webkit-box;
          min-height: 0;
          overflow: hidden;
          color: #171b22;
          font-size: 11px;
          line-height: 1.28;
          font-weight: 700;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
        }

        .property-grid .card-address,
        .property-grid.compact-view .card-address,
        .property-grid.large-view .card-address {
          display: -webkit-box;
          min-height: 25px;
          max-height: 25px;
          margin-top: 3px;
          overflow: hidden;
          color: #697382;
          font-size: 9px;
          line-height: 1.3;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
        }

        .property-grid .price-row,
        .property-grid.compact-view .price-row,
        .property-grid.large-view .price-row {
          display: flex;
          align-items: baseline;
          flex-wrap: wrap;
          gap: 5px 7px;
          margin-top: 7px;
          line-height: 1.15;
        }

        .property-grid .price,
        .property-grid.compact-view .price,
        .property-grid.large-view .price {
          color: #111827;
          font-size: 16px;
          line-height: 1.15;
          font-weight: 800;
        }

        .property-grid .price-meter,
        .property-grid.compact-view .price-meter,
        .property-grid.large-view .price-meter {
          color: #697382;
          font-size: 9px;
          line-height: 1.2;
        }

        .property-grid .finance-row,
        .property-grid.compact-view .finance-row,
        .property-grid.large-view .finance-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: nowrap;
          gap: 4px;
          margin-top: 6px;
          min-width: 0;
        }

        .property-grid .subtype-chip,
        .property-grid .status-chip,
        .property-grid.compact-view .subtype-chip,
        .property-grid.compact-view .status-chip,
        .property-grid.large-view .subtype-chip,
        .property-grid.large-view .status-chip {
          display: inline-block;
          max-width: 100%;
          padding: 3px 5px;
          border-radius: 5px;
          font-size: 8px;
          line-height: 1.15;
          font-weight: 600;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .property-grid .subtype-chip,
        .property-grid.compact-view .subtype-chip,
        .property-grid.large-view .subtype-chip {
          background: #f2f4f7;
          color: #687281;
        }

        .property-grid .card-meta,
        .property-grid.compact-view .card-meta,
        .property-grid.large-view .card-meta {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 5px 8px;
          margin-top: 6px;
          color: #535e6c;
          font-size: 9px;
          line-height: 1.25;
        }

        .property-grid .card-bottom,
        .property-grid.compact-view .card-bottom,
        .property-grid.large-view .card-bottom {
          display: flex;
          flex: 0 0 auto;
          align-self: stretch;
          justify-content: stretch;
          width: 100%;
          margin: 0;
          padding: 0;
          border-top: 0;
        }

        .property-grid .contact-button,
        .property-grid.compact-view .contact-button,
        .property-grid.large-view .contact-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          box-sizing: border-box;
          width: 100%;
          min-width: 0;
          padding: 7px 8px;
          border: 1px solid #e1e5eb;
          border-radius: 999px;
          background: #ffffff;
          color: #4c5867;
          font-size: 10px;
          line-height: 1.1;
          font-weight: 600;
          text-align: center;
          white-space: nowrap;
          transition: border-color 0.18s ease, background 0.18s ease;
        }

        .property-grid .property-card:hover .contact-button,
        .property-grid.compact-view .property-card:hover .contact-button,
        .property-grid.large-view .property-card:hover .contact-button {
          border-color: #ef403b;
          background: #fff8f8;
        }

        @media (max-width: 1100px) {
          .property-grid,
          .property-grid.compact-view,
          .property-grid.large-view {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }

        @media (max-width: 760px) {
          .property-grid,
          .property-grid.compact-view,
          .property-grid.large-view {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 9px;
          }

          .property-grid .photo-wrap,
          .property-grid.compact-view .photo-wrap,
          .property-grid.large-view .photo-wrap {
            flex-basis: 120px;
            height: 120px;
            min-height: 120px !important;
            max-height: 120px;
          }
        }

        @media (max-width: 480px) {
          .property-grid,
          .property-grid.compact-view,
          .property-grid.large-view {
            grid-template-columns: minmax(0, 1fr);
            gap: 10px;
          }

          .property-grid .photo-wrap,
          .property-grid.compact-view .photo-wrap,
          .property-grid.large-view .photo-wrap {
            flex-basis: 168px;
            height: 168px;
            min-height: 168px !important;
            max-height: 168px;
          }

          .property-grid .card-content,
          .property-grid.compact-view .card-content,
          .property-grid.large-view .card-content {
            padding: 10px 11px;
          }

          .property-grid .card-title,
          .property-grid.compact-view .card-title,
          .property-grid.large-view .card-title {
            font-size: 13px;
          }

          .property-grid .price,
          .property-grid.compact-view .price,
          .property-grid.large-view .price {
            font-size: 18px;
          }
        }

      `}</style>
    </>
  );
}