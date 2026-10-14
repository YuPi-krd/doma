"use client";

import {
  useEffect,
  useState,
} from "react";
import { useParams } from "next/navigation";

import PropertyGallery from "@/components/PropertyGallery";
import LeadModal from "@/components/LeadModal";

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

  image_url?: string | null;

  property_type?: string | null;
  property_type_label?: string | null;
  property_subtype?: string | null;
  property_subtype_label?: string | null;
  deal_type?: string | null;
  deal_type_label?: string | null;

  // Дополнительные характеристики из CRM.
  floor?: number | string | null;
  total_floors?: number | string | null;
  year_built?: number | string | null;
  bathroom?: string | null;
  balcony?: string | null;
  renovation?: string | null;
  building_material?: string | null;
  room_layout?: string | null;
  living_area?: number | string | null;
  kitchen_area?: number | string | null;
  plot_area?: number | string | null;
  plot_length?: number | string | null;
  plot_width?: number | string | null;
  frontage?: number | string | null;
  land_purpose?: string | null;
  heating?: string | null;
  gas?: boolean | string | null;
  water?: boolean | string | null;
  electricity?: boolean | string | null;
  sewerage?: boolean | string | null;
  fenced?: boolean | string | null;
  terrace?: boolean | string | null;
  bathhouse?: boolean | string | null;
  sauna?: boolean | string | null;
  pool?: boolean | string | null;
  garage?: boolean | string | null;
}

const API_URL =
  "https://doma-nq4u.onrender.com";

function formatPrice(
  value: number
) {
  return Number(
    value || 0
  ).toLocaleString("ru-RU");
}

export default function PropertyPage() {
  const params = useParams();

  const id = Array.isArray(params.id)
    ? params.id[0]
    : params.id;

  const [property, setProperty] =
    useState<Property | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    if (!id) return;

    async function loadProperty() {
      try {
        setLoading(true);
        setError("");

        const response =
          await fetch(
            `${API_URL}/properties/${id}`,
            {
              cache: "no-store",
            }
          );

        if (!response.ok) {
          throw new Error(
            "Объект не найден"
          );
        }

        const data =
          await response.json();

        setProperty(data);
      } catch (err) {
        console.error(err);

        setError(
          err instanceof Error
            ? err.message
            : "Ошибка загрузки объекта"
        );
      } finally {
        setLoading(false);
      }
    }

    loadProperty();
  }, [id]);

  if (loading) {
    return (
      <main className="state-page">
        <div className="state-box">
          Загрузка объекта...
        </div>

        <style jsx>{`
          .state-page {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #f5f6f8;
          }

          .state-box {
            color: #697483;
            font-size: 17px;
          }
        `}</style>
      </main>
    );
  }

  if (error || !property) {
    return (
      <main className="state-page">
        <div className="error-box">
          <div className="error-icon">
            🏠
          </div>

          <h1>
            Объект не найден
          </h1>

          <p>
            {error ||
              "Не удалось загрузить объект."}
          </p>

          <a href="/catalog">
            ← Вернуться в каталог
          </a>
        </div>

        <style jsx>{`
          .state-page {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 30px;
            background: #f5f6f8;
          }

          .error-box {
            width: min(500px, 100%);
            padding: 40px;
            border-radius: 24px;
            background: #ffffff;
            text-align: center;
            box-shadow:
              0 12px 40px
                rgba(17, 24, 39, 0.06);
          }

          .error-icon {
            font-size: 48px;
            margin-bottom: 12px;
          }

          .error-box h1 {
            margin: 0 0 10px;
            color: #202731;
            font-size: 28px;
          }

          .error-box p {
            margin: 0 0 20px;
            color: #747f8d;
          }

          .error-box a {
            display: inline-block;
            padding:
              12px 18px;
            border-radius: 12px;
            background: #ef4444;
            color: #ffffff;
            text-decoration: none;
            font-weight: 600;
          }
        `}</style>
      </main>
    );
  }

  const pricePerMeter =
    property.area > 0
      ? Math.round(
          property.price /
            property.area
        )
      : 0;

  // Формируем список только из заполненных характеристик.
  // Основные поля (комнаты, площадь, город, район, статус)
  // остаются видимыми как раньше.
  const characteristics: {
    icon: string;
    label: string;
    value: string;
  }[] = [];

  const addCharacteristic = (
    icon: string,
    label: string,
    value: unknown,
    suffix = ""
  ) => {
    if (value === null || value === undefined || value === "") return;
    if (typeof value === "boolean") {
      if (value) characteristics.push({ icon, label, value: "Есть" });
      return;
    }
    const textValue = String(value).trim();
    if (!textValue || textValue === "0" || textValue.toLowerCase() === "false") return;
    if (textValue.toLowerCase() === "true" || textValue === "1") {
      characteristics.push({ icon, label, value: "Есть" });
      return;
    }
    characteristics.push({
      icon,
      label,
      value: `${textValue}${suffix}`,
    });
  };

  const propertyType = property.property_type || "apartment";

  if (Number(property.rooms) > 0) {
    addCharacteristic("🏠", "Комнаты", property.rooms);
  }
  if (Number(property.area) > 0) {
    addCharacteristic("📐", "Площадь", property.area, " м²");
  }

  if (propertyType === "apartment") {
    addCharacteristic("🛋️", "Планировка комнат", property.room_layout);
    addCharacteristic("📏", "Жилая площадь", property.living_area, " м²");
    addCharacteristic("🍽️", "Площадь кухни", property.kitchen_area, " м²");
    addCharacteristic("🏢", "Этаж", property.floor);
    addCharacteristic("🏙️", "Этажность дома", property.total_floors);
    addCharacteristic("🗓️", "Год постройки", property.year_built);
    addCharacteristic("🛁", "Санузел", property.bathroom);
    addCharacteristic("🌇", "Балкон / лоджия", property.balcony);
    addCharacteristic("🛠️", "Ремонт", property.renovation);
    addCharacteristic("🧱", "Материал дома", property.building_material);
  } else if (propertyType === "house") {
    addCharacteristic("📏", "Жилая площадь", property.living_area, " м²");
    addCharacteristic("🍽️", "Площадь кухни", property.kitchen_area, " м²");
    addCharacteristic("🏙️", "Этажность", property.total_floors);
    addCharacteristic("🗓️", "Год постройки", property.year_built);
    addCharacteristic("🧱", "Материал дома", property.building_material);
    addCharacteristic("🔥", "Отопление", property.heating);
    addCharacteristic("🛁", "Санузел", property.bathroom);
    addCharacteristic("🛠️", "Ремонт", property.renovation);
    addCharacteristic("🌳", "Площадь участка", property.plot_area, " сот.");
    addCharacteristic("🚗", "Гараж", property.garage);
    addCharacteristic("🏊", "Бассейн", property.pool);
    addCharacteristic("🧖", "Баня", property.bathhouse);
    addCharacteristic("♨️", "Сауна", property.sauna);
    addCharacteristic("🌿", "Терраса", property.terrace);
    addCharacteristic("🚧", "Участок огорожен", property.fenced);
    addCharacteristic("⚡", "Электричество", property.electricity);
    addCharacteristic("💧", "Вода", property.water);
    addCharacteristic("🔥", "Газ", property.gas);
    addCharacteristic("🚰", "Канализация", property.sewerage);
  } else if (propertyType === "land") {
    addCharacteristic("🌳", "Площадь участка", property.plot_area, " сот.");
    addCharacteristic("📏", "Длина участка", property.plot_length, " м");
    addCharacteristic("📐", "Ширина участка", property.plot_width, " м");
    addCharacteristic("🛣️", "Фасад участка", property.frontage, " м");
    addCharacteristic("📋", "Назначение земли", property.land_purpose);
    addCharacteristic("🚧", "Участок огорожен", property.fenced);
    addCharacteristic("⚡", "Электричество", property.electricity);
    addCharacteristic("💧", "Вода", property.water);
    addCharacteristic("🔥", "Газ", property.gas);
    addCharacteristic("🚰", "Канализация", property.sewerage);
  } else {
    // Для коммерческих объектов и гаражей показываем те поля,
    // которые уже сохранены и возвращены API.
    addCharacteristic("🏢", "Этаж", property.floor);
    addCharacteristic("🏙️", "Этажность", property.total_floors);
    addCharacteristic("🗓️", "Год постройки", property.year_built);
    addCharacteristic("🧱", "Материал дома", property.building_material);
    addCharacteristic("🔥", "Отопление", property.heating);
    addCharacteristic("🛁", "Санузел", property.bathroom);
  }

  addCharacteristic("🏙️", "Город", property.city);
  addCharacteristic("📍", "Район", property.district);
  addCharacteristic("●", "Статус", property.status);

  return (
    <main className="page">
      <div className="container">

        {/* ======================================================
           BREADCRUMBS
        ====================================================== */}

        <div className="breadcrumbs">
          <a href="/">
            Недвижимость в Краснодаре
          </a>

          <span>/</span>

          <a href="/catalog">
            Каталог
          </a>

          <span>/</span>

          <span>
            {property.title}
          </span>
        </div>

        {/* ======================================================
           GALLERY
        ====================================================== */}

        <PropertyGallery
          propertyId={
            property.id
          }
          mainImage={
            property.image_url ||
            undefined
          }
          title={
            property.title
          }
          variant="detail"
        />

        {/* ======================================================
           MAIN CONTENT
        ====================================================== */}

        <div className="content-grid">

          {/* ====================================================
             LEFT
          ==================================================== */}

          <div>

            {/* TITLE */}

            <div className="title-section">

              <div className="labels">

                {property.deal_type_label && (
                  <span className="deal-label">
                    {
                      property.deal_type_label
                    }
                  </span>
                )}

                {property.property_type_label && (
                  <span className="type-label">
                    {
                      property.property_type_label
                    }
                  </span>
                )}

                {property.property_subtype_label && (
                  <span className="subtype-label">
                    {
                      property.property_subtype_label
                    }
                  </span>
                )}

              </div>

              <h1>
                {
                  property.title
                }
              </h1>

              <p className="address">
                📍{" "}
                {
                  property.city
                }

                {property.district
                  ? `, ${property.district}`
                  : ""}

                {property.address
                  ? `, ${property.address}`
                  : ""}
              </p>
            </div>

            {/* PRICE */}

            <div className="mobile-price-box">
              <div className="mobile-price">
                {formatPrice(
                  property.price
                )}{" "}
                ₽
              </div>

              {pricePerMeter >
                0 && (
                <div className="mobile-meter">
                  {formatPrice(
                    pricePerMeter
                  )}{" "}
                  ₽/м²
                </div>
              )}
            </div>

            {/* CHARACTERISTICS */}

            <section className="section">

              <h2>
                Характеристики
              </h2>

              <div className="characteristics">
                {characteristics.map((item) => (
                  <div
                    className="characteristic"
                    key={`${item.label}-${item.value}`}
                  >
                    <span>{item.icon}</span>
                    <div>
                      <small>{item.label}</small>
                      <strong>{item.value}</strong>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* DESCRIPTION */}

            <section className="section white-section">

              <h2>
                Описание объекта
              </h2>

              <p className="description">
                {property.description ||
                  "Описание объекта пока не добавлено."}
              </p>

            </section>

            {/* LOCATION */}

            <section className="section white-section">

              <h2>
                Расположение
              </h2>

              <div className="location-box">

                <div className="location-icon">
                  📍
                </div>

                <div>
                  <strong>
                    {
                      property.city
                    }
                  </strong>

                  {property.district && (
                    <p>
                      {
                        property.district
                      }
                    </p>
                  )}

                  {property.address && (
                    <p>
                      {
                        property.address
                      }
                    </p>
                  )}
                </div>

              </div>

            </section>

          </div>

          {/* ====================================================
             RIGHT
          ==================================================== */}

          <aside>

            <div className="side-card">

              <div className="side-price">
                {formatPrice(
                  property.price
                )}{" "}
                ₽
              </div>

              {pricePerMeter >
                0 && (
                <div className="side-meter">
                  {formatPrice(
                    pricePerMeter
                  )}{" "}
                  ₽/м²
                </div>
              )}

              <div className="side-status">
                <span
                  className={
                    property.status ===
                    "Свободен"
                      ? "status-dot green"
                      : "status-dot"
                  }
                />

                {
                  property.status
                }
              </div>

              <div className="lead-wrapper">
                <LeadModal
                  propertyId={
                    property.id
                  }
                />
              </div>

              <div className="consultation">

                <div className="consultation-title">
                  📞 Консультация
                </div>

                <p>
                  Оставьте заявку,
                  и специалист DOMA
                  свяжется с вами
                  по этому объекту.
                </p>

              </div>

              <div className="property-id">
                ID объекта:{" "}
                {property.id}
              </div>

            </div>

          </aside>

        </div>
      </div>

      <style jsx>{`
        .page {
          min-height: 100vh;
          padding: 28px 24px 84px;
          background: #f7f7f5;
          color: #20252b;
        }
        .container { max-width: 1320px; margin: 0 auto; }
        .breadcrumbs {
          display: flex; align-items: center; flex-wrap: wrap; gap: 9px;
          margin-bottom: 18px; color: #a0a4aa; font-size: 13px;
        }
        .breadcrumbs a { color: #606872; text-decoration: none; transition: color .2s ease; }
        .breadcrumbs a:hover { color: #d94343; }
        .content-grid {
          display: grid; grid-template-columns: minmax(0, 1fr) 350px;
          gap: 30px; margin-top: 30px; align-items: start;
        }
        .title-section { margin-bottom: 25px; }
        .labels { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 14px; }
        .deal-label, .type-label, .subtype-label {
          display: inline-flex; align-items: center; padding: 7px 11px;
          border-radius: 8px; font-size: 11px; font-weight: 750; letter-spacing: .035em;
          text-transform: uppercase;
        }
        .deal-label { background: #d94343; color: #fff; }
        .type-label { background: #eceeeb; color: #4d555e; }
        .subtype-label { background: #292f35; color: #fff; }
        h1 {
          margin: 0; color: #1d2227; font-size: clamp(32px, 3.8vw, 48px);
          line-height: 1.08; letter-spacing: -1.5px; font-weight: 760;
          overflow-wrap: anywhere;
        }
        .address { margin: 13px 0 0; color: #727981; font-size: 15px; line-height: 1.65; }
        .mobile-price-box { display: none; }
        .section { margin-top: 27px; }
        .section h2 { margin: 0 0 16px; color: #242a30; font-size: 22px; letter-spacing: -.45px; }
        .white-section {
          padding: 27px; border: 1px solid #eeefec; border-radius: 20px;
          background: #fff; box-shadow: 0 8px 28px rgba(30, 35, 40, .035);
        }
        .characteristics { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
        .characteristic {
          display: flex; align-items: center; gap: 12px; min-height: 84px;
          padding: 15px; border: 1px solid #e9ebe8; border-radius: 14px; background: #fff;
          transition: border-color .2s ease, transform .2s ease;
        }
        .characteristic:hover { border-color: #e2b4b4; transform: translateY(-2px); }
        .characteristic > span {
          display: grid; place-items: center; width: 40px; height: 40px; flex: 0 0 40px;
          border-radius: 12px; background: #fff1f0; font-size: 19px;
        }
        .characteristic small { display: block; margin-bottom: 5px; color: #92989e; font-size: 11px; }
        .characteristic strong { display: block; color: #2a3036; font-size: 15px; overflow-wrap: anywhere; }
        .description { margin: 0; color: #626a72; font-size: 15px; line-height: 1.85; white-space: pre-line; }
        .location-box { display: flex; align-items: flex-start; gap: 15px; padding: 18px; border: 1px solid #eff0ed; border-radius: 15px; background: #fafaf8; }
        .location-icon { width: 44px; height: 44px; display: grid; place-items: center; flex: 0 0 44px; border-radius: 13px; background: #d94343; color: #fff; }
        .location-box strong { color: #252b31; font-size: 16px; }
        .location-box p { margin: 5px 0 0; color: #727981; font-size: 14px; line-height: 1.55; }
        aside { min-width: 0; }
        .side-card {
          position: sticky; top: 24px; padding: 28px; border: 1px solid #eceeeb;
          border-radius: 22px; background: #fff; box-shadow: 0 12px 36px rgba(28, 32, 36, .07);
        }
        .side-price { color: #1e2429; font-size: 36px; line-height: 1.12; font-weight: 780; letter-spacing: -1px; overflow-wrap: anywhere; }
        .side-meter { margin-top: 7px; color: #858b92; font-size: 13px; }
        .side-status { display: flex; align-items: center; gap: 9px; margin-top: 19px; color: #5e666e; font-size: 13px; }
        .status-dot { width: 8px; height: 8px; border-radius: 50%; background: #e9a23b; box-shadow: 0 0 0 4px #fff5e6; }
        .status-dot.green { background: #25a56a; box-shadow: 0 0 0 4px #e7f8ef; }
        .lead-wrapper { margin-top: 23px; }
        .consultation { margin-top: 25px; padding-top: 22px; border-top: 1px solid #eff0ed; }
        .consultation-title { color: #2a3036; font-size: 14px; font-weight: 750; }
        .consultation p { margin: 9px 0 0; color: #777f87; font-size: 13px; line-height: 1.7; }
        .property-id { margin-top: 21px; color: #a2a7ad; font-size: 11px; }
        .state-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 30px; background: #f7f7f5; }
        .state-box { color: #697483; font-size: 16px; }
        @media (max-width: 1000px) {
          .content-grid { grid-template-columns: 1fr; gap: 18px; }
          aside { order: -1; }
          .side-card { position: static; display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 0 20px; align-items: center; }
          .side-price, .side-meter, .side-status { grid-column: 1; }
          .lead-wrapper { grid-column: 2; grid-row: 1 / span 3; min-width: 190px; margin-top: 0; }
          .consultation, .property-id { grid-column: 1 / -1; }
          .mobile-price-box { display: none; }
        }
        @media (max-width: 700px) {
          .page { padding: 14px 13px 52px; }
          .content-grid { gap: 14px; margin-top: 20px; }
          .characteristics { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .white-section { padding: 20px; border-radius: 17px; }
          h1 { font-size: 34px; letter-spacing: -1px; }
          .side-card { display: block; padding: 22px; }
          .side-price { font-size: 32px; }
          .lead-wrapper { margin-top: 20px; }
          .consultation { margin-top: 20px; padding-top: 18px; }
        }
        @media (max-width: 480px) {
          .characteristics { grid-template-columns: 1fr 1fr; gap: 8px; }
          .characteristic { min-height: 75px; gap: 9px; padding: 10px; }
          .characteristic > span { width: 34px; height: 34px; flex-basis: 34px; font-size: 17px; }
          .characteristic strong { font-size: 13px; }
          .breadcrumbs { font-size: 11px; }
          h1 { font-size: 29px; }
          .address { font-size: 13px; }
          .section h2 { font-size: 20px; }
          .side-price { font-size: 29px; }
        }
      `}</style>
    </main>
  );
}