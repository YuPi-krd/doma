"use client";

import {
  useEffect,
  useState,
} from "react";
import { useParams } from "next/navigation";

import PropertyGallery from "@/components/PropertyGallery";
import LeadModal from "@/components/LeadModal";
import { YandexPropertyLocationMap } from "@/components/YandexMap";

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
  latitude?: number | null;
  longitude?: number | null;

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

  const [shareCopied, setShareCopied] = useState(false);
  const [shareMessage, setShareMessage] = useState("");

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

  const copyPropertyLink = async () => {
    if (typeof window === "undefined") return;
    const url = window.location.href;

    try {
      if (navigator.clipboard?.writeText && window.isSecureContext) {
        await navigator.clipboard.writeText(url);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = url;
        textarea.setAttribute("readonly", "");
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        const copied = document.execCommand("copy");
        textarea.remove();
        if (!copied) throw new Error("Буфер обмена недоступен");
      }

      setShareCopied(true);
      setShareMessage("Ссылка скопирована");
      window.setTimeout(() => {
        setShareCopied(false);
        setShareMessage("");
      }, 2500);
    } catch (copyError) {
      console.error("Не удалось скопировать ссылку:", copyError);
      setShareCopied(false);
      setShareMessage("Не удалось скопировать. Скопируйте адрес из браузера.");
    }
  };

  const shareVia = (platform: "vk" | "ok" | "telegram") => {
    if (typeof window === "undefined") return;
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(property?.title || "Объект недвижимости DOMA");
    const shareUrls = {
      vk: `https://vk.com/share.php?url=${url}`,
      ok: `https://connect.ok.ru/offer?url=${url}&title=${title}`,
      telegram: `https://t.me/share/url?url=${url}&text=${title}`,
    };
    window.open(shareUrls[platform], "_blank", "noopener,noreferrer,width=720,height=620");
  };

  const shareProperty = async () => {
    if (typeof window === "undefined") return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: property?.title || "Объект недвижимости DOMA",
          text: "Посмотрите объект недвижимости на DOMA",
          url: window.location.href,
        });
      } catch (shareError) {
        if (shareError instanceof Error && shareError.name !== "AbortError") {
          await copyPropertyLink();
        }
      }
    } else {
      await copyPropertyLink();
    }
  };

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

  const valueLabels: Record<string, Record<string, string>> = {
    "Планировка комнат": {
      isolated: "Изолированная",
      isolated_rooms: "Изолированная",
      adjacent: "Смежная",
      kitchen_living: "Кухня-гостиная",
      free: "Свободная планировка",
      "Изолированные": "Изолированная",
      "Смежно-изолированная": "Смежно-изолированная",
      "Смежная": "Смежная",
    },
    "Санузел": {
      combined: "Совмещённый",
      separate: "Раздельный",
      multiple: "Несколько",
      "combined bathroom": "Совмещённый",
    },
    "Балкон / лоджия": {
      yes: "Есть",
      no: "Нет",
      balcony: "Балкон",
      loggia: "Лоджия",
    },
    "Ремонт": {
      none: "Без отделки",
      cosmetic: "Косметический",
      euro: "Евроремонт",
      designer: "Дизайнерский",
      "pre-finish": "Предчистовая отделка",
      "no_finish": "Без отделки",
    },
    "Материал стен": {
      brick: "Кирпичный",
      monolith: "Монолитный",
      panel: "Панельный",
      block: "Блочный",
      wood: "Деревянный",
      frame: "Каркасный",
      concrete: "Бетон",
    },
    "Материал дома": {
      brick: "Кирпичный",
      monolith: "Монолитный",
      panel: "Панельный",
      block: "Блочный",
      wood: "Деревянный",
      frame: "Каркасный",
      concrete: "Бетон",
    },
    "Отопление": {
      gas: "Газовое",
      electric: "Электрическое",
      solid_fuel: "Твердотопливное",
      central: "Центральное",
    },
    "Назначение земли": {
      izhs: "ИЖС",
      lph: "ЛПХ",
      gardening: "Садоводство",
      dnp: "ДНП",
      commercial_land: "Коммерческое",
    },
  };

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

    const rawValue = String(value).trim();
    if (!rawValue || rawValue === "0" || rawValue.toLowerCase() === "false") return;

    // Backend может вернуть как русские значения, так и старые enum-коды.
    // Переводим известные коды, но не меняем числа (например, санузел "1", "2", "3").
    const translated = valueLabels[label]?.[rawValue] ??
      (["true", "yes", "да"].includes(rawValue.toLowerCase()) ? "Есть" :
       ["no", "нет"].includes(rawValue.toLowerCase()) ? "Нет" : rawValue);

    characteristics.push({
      icon,
      label,
      value: `${translated}${suffix}`,
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
    addCharacteristic("🧱", "Материал стен", property.building_material);
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
        <nav className="breadcrumbs" aria-label="Хлебные крошки">
          <a href="/">Недвижимость DOMA</a>
          <span>/</span>
          <a href="/catalog">Каталог</a>
          <span>/</span>
          <span className="breadcrumb-current">{property.title}</span>
        </nav>

        <div className="detail-layout">
          <div className="main-column">
            <article className="property-main-card">
              <div className="gallery-frame">
                <PropertyGallery
                  propertyId={property.id}
                  mainImage={property.image_url || undefined}
                  title={property.title}
                  variant="card"
                  detailInteractive
                />
              </div>

              <div className="summary-block">
                <div className="summary-heading-row">
                  <div className="summary-title-group">
                    <h1>{property.title}</h1>
                    <div className="summary-price-row">
                      <strong className="summary-price">{formatPrice(property.price)} ₽</strong>
                      {pricePerMeter > 0 && (
                        <span className="summary-meter">{formatPrice(pricePerMeter)} ₽/м²</span>
                      )}
                    </div>
                  </div>
                  <div className="summary-actions" aria-label="Действия с объектом">
                    <button type="button" className="summary-action" onClick={shareProperty} aria-label="Поделиться объектом" title="Поделиться объектом">
                      ↗
                    </button>
                    <button type="button" className="summary-action" onClick={copyPropertyLink} aria-label="Скопировать ссылку" title="Скопировать ссылку">
                      ⧉
                    </button>
                  </div>
                </div>

                <p className="summary-address">
                  { [property.city, property.district, property.address].filter(Boolean).join(", ") }
                </p>

                <div className="summary-bottom-row">
                  <div className="summary-tags">
                    {property.property_type_label && <span>{property.property_type_label}</span>}
                    {property.property_subtype_label && <span>{property.property_subtype_label}</span>}
                    {property.status && (
                      <span className={property.status === "Свободен" ? "summary-status free" : "summary-status"}>
                        <i />{property.status}
                      </span>
                    )}
                  </div>
                  <button type="button" className="small-share-button" onClick={shareProperty}>
                    <span aria-hidden="true">↗</span> Поделиться
                  </button>
                </div>
              </div>

              <section className="detail-section description-section">
                <h2>Описание</h2>
                <p className="description">
                  {property.description || "Описание объекта пока не добавлено."}
                </p>
              </section>

              <div className="property-id-inline">
                <span>№</span>
                <div>
                  <small>Артикул</small>
                  <strong>{property.id}</strong>
                </div>
              </div>
            </article>

            <section className="content-panel characteristics-panel">
              <h2>Характеристики</h2>
              <div className="characteristics">
                {characteristics.map((item) => (
                  <div className="characteristic" key={`${item.label}-${item.value}`}>
                    <span className="characteristic-icon" aria-hidden="true">{item.icon}</span>
                    <div className="characteristic-copy">
                      <small>{item.label}</small>
                      <strong>{item.value}</strong>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="content-panel map-panel">
              <h2>На карте</h2>
              <YandexPropertyLocationMap
                address={[property.address, property.district, property.city].filter(Boolean).join(", ")}
                latitude={property.latitude}
                longitude={property.longitude}
                height="300px"
              />
            </section>
          </div>

          <aside className="detail-sidebar">
            <section className="agency-card">
              <div className="agency-header">
                <div className="agency-logo" aria-label="DOMA">DOMA</div>
                <div className="agency-heading-copy">
                  <strong>Агентство недвижимости DOMA</strong>
                  <span>{property.city ? `Объект в городе ${property.city}` : "Консультация по объекту"}</span>
                </div>
              </div>
              <div className="agency-contact-line">
                <span className="agency-contact-icon" aria-hidden="true">☎</span>
                <span>Ответим на вопросы по этому объекту</span>
              </div>
              <div className="agency-buttons">
                <div className="agency-application">
                  <LeadModal propertyId={property.id} />
                </div>
                <a className="agency-contact-button" href="/#contacts">
                  <span aria-hidden="true">●</span> Контакты DOMA
                </a>
              </div>
            </section>

            <section className="share-card">
              <h2>Поделиться</h2>
              <div className="share-options">
                <button type="button" onClick={() => shareVia("vk")} aria-label="Поделиться ВКонтакте" title="ВКонтакте">
                  <svg className="social-icon social-icon-vk" viewBox="0 0 24 24" role="img" aria-label="VK">
                    <path d="M12.785 16.2s.341-.038.516-.228c.16-.173.155-.498.155-.498s-.022-1.52.682-1.744c.694-.222 1.585 1.468 2.53 2.117.715.49 1.258.383 1.258.383l2.532-.035s1.323-.081.696-1.122c-.052-.051-.37-.843-1.91-2.385-1.61-1.61-1.395-1.35.545-4.137 1.18-1.694 1.653-2.727 1.505-3.17-.142-.424-1.015-.312-1.015-.312l-2.85.017s-.211-.029-.368.065c-.153.093-.253.31-.253.31s-.45 1.2-1.05 2.218c-1.267 2.146-1.775 2.26-1.983 2.127-.481-.31-.361-1.247-.361-1.912 0-2.08.315-2.947-.615-3.172-.309-.075-.536-.125-1.325-.133-1.014-.01-1.873.004-2.359.241-.323.158-.573.51-.421.53.188.024.614.116.84.427.292.402.282 1.306.282 1.306s.168 2.49-.392 2.8c-.384.212-.91-.22-2.04-2.166-.58-.999-1.017-2.103-1.017-2.103s-.084-.21-.235-.322c-.183-.135-.438-.177-.438-.177l-2.709.017s-.406.011-.555.188c-.132.157-.01.48-.01.48s2.12 4.961 4.52 7.46c2.203 2.298 4.706 2.147 4.706 2.147h1.134z" />
                  </svg>
                </button>
                <button type="button" onClick={() => shareVia("ok")} aria-label="Поделиться в Одноклассниках" title="Одноклассники">
                  <svg className="social-icon social-icon-ok" viewBox="0 0 24 24" role="img" aria-label="Одноклассники">
                    <circle cx="12" cy="5.2" r="3.15" />
                    <path d="M7.15 9.8 12 12.7l4.85-2.9M12 12.7v4.6m0 0-3.25 2.6m3.25-2.6 3.25 2.6" fill="none" stroke="currentColor" strokeWidth="2.15" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <button type="button" onClick={() => shareVia("telegram")} aria-label="Поделиться в Telegram" title="Telegram">
                  <svg className="social-icon social-icon-telegram" viewBox="0 0 24 24" role="img" aria-label="Telegram">
                    <path d="M21.65 3.35a1.15 1.15 0 0 0-1.22-.2L2.35 10.2c-1.08.43-1.03 1.2-.18 1.48l4.62 1.5 1.78 5.52c.22.67.4.92.78.93.35.01.55-.13.84-.42l2.64-2.56 4.66 3.45c.86.47 1.48.22 1.7-.8l3.07-14.5c.17-.8-.15-1.22-.61-1.45ZM9.1 12.84l9.08-5.72c.45-.28.87-.1.53.22l-7.5 6.77-.29 3.08-1.82-4.35Z" />
                  </svg>
                </button>
              </div>
              <button type="button" className={`copy-link-button ${shareCopied ? "copied" : ""}`} onClick={copyPropertyLink}>
                {shareCopied ? "✓ Ссылка скопирована" : "Скопировать ссылку"}
              </button>
              {shareMessage && <p className="share-message" role="status">{shareMessage}</p>}
            </section>
          </aside>
        </div>
      </div>

      <style jsx>{`
        .page {
          min-height: 100vh;
          padding: 22px 24px 72px;
          background: #f2f3f7;
          color: #171b22;
          font-family: inherit;
        }
        .container {
          width: 100%;
          max-width: 1220px;
          margin: 0 auto;
        }
        .breadcrumbs {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 9px;
          margin: 0 0 16px;
          color: #8c95a3;
          font-size: 12px;
          line-height: 1.5;
        }
        .breadcrumbs a {
          color: #657184;
          text-decoration: none;
          transition: color .18s ease;
        }
        .breadcrumbs a:hover { color: #ef4444; }
        .breadcrumb-current { overflow-wrap: anywhere; color: #3e4858; }
        .detail-layout {
          display: grid;
          grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
          gap: 16px;
          align-items: start;
        }
        .main-column, .detail-sidebar { min-width: 0; }
        .property-main-card, .content-panel, .agency-card, .share-card {
          background: #fff;
          border: 1px solid #e7eaf0;
          border-radius: 22px;
          box-shadow: 0 8px 28px rgba(25, 34, 48, .045);
        }
        .property-main-card {
          overflow: hidden;
          border-color: #e8eaf0;
        }
        .gallery-frame {
          position: relative;
          width: 100%;
          overflow: hidden;
          border: 2px solid #ef4444;
          border-bottom: 0;
          border-radius: 23px 23px 0 0;
          background: #e9edf2;
          box-sizing: border-box;
        }
        .gallery-frame :global(.gallery-card) {
          width: 100%;
          border-radius: 0;
          overflow: hidden;
        }
        .gallery-frame :global(.gallery-card .image-stage) {
          height: clamp(240px, 15vw, 270px) !important;
          min-height: 240px !important;
          border-radius: 19px 19px 0 0 !important;
          background: #e7ebf0;
        }
        .gallery-frame :global(.gallery-card .gallery-image) {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover !important;
          object-position: center;
          opacity: 1 !important;
          filter: brightness(1.06) contrast(1.025) saturate(1.025);
        }
        .gallery-frame :global(.gallery-card .gallery-arrow) {
          width: 48px;
          height: 48px;
          font-size: 30px;
          opacity: 1;
          border: 1px solid rgba(255,255,255,.85);
          background: rgba(255,255,255,.94);
          color: #4b5565;
          box-shadow: 0 4px 16px rgba(20, 28, 40, .13);
        }
        .gallery-frame :global(.gallery-card .gallery-arrow:hover) {
          background: #fff;
          color: #ef4444;
        }
        .gallery-frame :global(.gallery-card .gallery-arrow.left) { left: 18px; }
        .gallery-frame :global(.gallery-card .gallery-arrow.right) { right: 18px; }
        .gallery-frame :global(.gallery-card .gallery-counter) {
          top: auto;
          right: auto;
          left: 50%;
          bottom: 15px;
          transform: translateX(-50%);
          padding: 5px 10px;
          border: 1px solid rgba(255,255,255,.12);
          border-radius: 8px;
          background: rgba(24, 29, 37, .72);
          color: #fff;
          font-size: 11px;
          line-height: 1.2;
          backdrop-filter: blur(8px);
        }
        .gallery-frame :global(.gallery-card .gallery-dots) { bottom: 17px; }
        .summary-block {
          position: relative;
          z-index: 2;
          margin-top: -12px;
          padding: 22px 24px 18px;
          border-radius: 22px 22px 0 0;
          background: #fff;
        }
        .summary-heading-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
        }
        .summary-title-group { min-width: 0; flex: 1; }
        h1 {
          margin: 0;
          color: #171b22;
          font-size: clamp(21px, 1.75vw, 27px);
          line-height: 1.28;
          font-weight: 760;
          letter-spacing: -.5px;
          overflow-wrap: anywhere;
        }
        .summary-price-row {
          display: flex;
          flex-wrap: wrap;
          align-items: baseline;
          gap: 12px;
          margin-top: 14px;
        }
        .summary-price {
          color: #14181e;
          font-size: clamp(23px, 1.9vw, 29px);
          line-height: 1.2;
          font-weight: 820;
          letter-spacing: -.5px;
        }
        .summary-meter { color: #8490a1; font-size: 13px; }
        .summary-actions { display: flex; gap: 8px; flex: 0 0 auto; }
        .summary-action {
          width: 48px;
          height: 48px;
          display: grid;
          place-items: center;
          padding: 0;
          border: 1px solid #dce1e9;
          border-radius: 50%;
          background: #fff;
          color: #596477;
          font-size: 20px;
          cursor: pointer;
          transition: color .18s ease, border-color .18s ease, background .18s ease, transform .18s ease;
        }
        .summary-action:hover {
          color: #ed4146;
          border-color: #f0a2a5;
          background: #fff7f7;
          transform: translateY(-1px);
        }
        .summary-address {
          margin: 14px 0 0;
          color: #333d4c;
          font-size: 14px;
          line-height: 1.55;
          overflow-wrap: anywhere;
        }
        .summary-bottom-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          margin-top: 16px;
        }
        .summary-tags { display: flex; flex-wrap: wrap; gap: 7px; min-width: 0; }
        .summary-tags > span {
          display: inline-flex;
          align-items: center;
          padding: 6px 10px;
          border-radius: 999px;
          background: #f1f3f7;
          color: #5b6676;
          font-size: 11px;
          line-height: 1.3;
        }
        .summary-tags .summary-status { gap: 6px; background: #f0f8f2; color: #477458; }
        .summary-status i { width: 6px; height: 6px; border-radius: 50%; background: #35a765; }
        .summary-tags .summary-status:not(.free) { background: #fff3e7; color: #94652b; }
        .summary-tags .summary-status:not(.free) i { background: #e9a23b; }
        .small-share-button {
          flex: 0 0 auto;
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 10px 14px;
          border: 0;
          border-radius: 999px;
          background: #f1f3f7;
          color: #3d4653;
          font-size: 12px;
          font-weight: 650;
          cursor: pointer;
          transition: background .18s ease, color .18s ease;
        }
        .small-share-button:hover { background: #e8ebf1; color: #ef4444; }
        .detail-section { margin: 0 24px; padding: 22px 0; border-top: 1px solid #edf0f4; }
        .detail-section h2, .content-panel h2, .share-card h2 {
          margin: 0 0 14px;
          color: #242a33;
          font-size: 18px;
          line-height: 1.35;
          font-weight: 760;
          letter-spacing: -.2px;
        }
        .description {
          margin: 0;
          color: #475263;
          font-size: 14px;
          line-height: 1.8;
          white-space: pre-line;
          overflow-wrap: anywhere;
        }
        .property-id-inline {
          display: flex;
          gap: 10px;
          align-items: center;
          padding: 9px 24px 20px;
          color: #687386;
          border-top: 1px solid #f0f2f6;
        }
        .property-id-inline > span {
          width: 28px;
          height: 28px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: #f1f3f7;
          color: #5c6572;
          font-size: 12px;
        }
        .property-id-inline small { display: block; color: #89919b; font-size: 10px; line-height: 1.3; }
        .property-id-inline strong { display: block; color: #343b45; font-size: 12px; font-weight: 650; }
        .content-panel { margin-top: 16px; padding: 22px 24px; }
        .content-panel h2 { margin-bottom: 12px; }
        .characteristics { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); column-gap: 28px; }
        .characteristic {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: 14px;
          min-width: 0;
          padding: 13px 0;
          border-bottom: 1px solid #edf0f4;
        }
        .characteristic-icon { display: none; }
        .characteristic-copy { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; width: 100%; min-width: 0; }
        .characteristic small { color: #7f8998; font-size: 12px; line-height: 1.45; }
        .characteristic strong { color: #242a33; font-size: 12px; font-weight: 700; text-align: right; overflow-wrap: anywhere; }
        .map-panel { overflow: hidden; }
        .map-panel :global(iframe) { max-width: 100%; border-radius: 16px; }
        .map-panel :global(*) { box-sizing: border-box; }
        .detail-sidebar { display: grid; gap: 14px; }
        .agency-card { padding: 22px; border-radius: 22px; }
        .agency-header { display: flex; align-items: center; gap: 15px; }
        .agency-logo {
          display: grid;
          place-items: center;
          flex: 0 0 86px;
          height: 86px;
          border: 1px solid #ffe1e3;
          border-radius: 17px;
          background: linear-gradient(145deg, #fff3f4 0%, #ffe6e8 100%);
          color: #ef4444;
          font-size: 21px;
          font-weight: 900;
          letter-spacing: -1.2px;
          box-shadow: inset 0 1px 0 rgba(255,255,255,.9);
        }
        .agency-heading-copy { display: flex; flex-direction: column; min-width: 0; gap: 7px; }
        .agency-heading-copy strong { color: #252c37; font-size: 15px; line-height: 1.4; font-weight: 760; }
        .agency-heading-copy span { color: #858e9d; font-size: 12px; line-height: 1.5; }
        .agency-contact-line { display: flex; align-items: center; gap: 9px; margin: 18px 0; color: #697486; font-size: 12px; line-height: 1.5; }
        .agency-contact-icon { width: 26px; height: 26px; display: grid; place-items: center; border-radius: 50%; background: #f2f4f8; color: #5c6571; font-size: 13px; flex: 0 0 26px; }
        .agency-buttons { display: grid; gap: 9px; }
        :global(.agency-application button) {
          width: 100% !important;
          min-height: 52px !important;
          border: 1px solid #d8dfe9 !important;
          border-radius: 999px !important;
          background: #fff !important;
          color: #505b6b !important;
          font-size: 14px !important;
          font-weight: 650 !important;
          box-shadow: none !important;
          transition: border-color .18s ease, background .18s ease !important;
        }
        :global(.agency-application button:hover) { border-color: #ef4444 !important; background: #fff8f8 !important; }
        .agency-contact-button {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 8px;
          width: 100%;
          min-height: 52px;
          box-sizing: border-box;
          padding: 12px 14px;
          border: 0;
          border-radius: 999px;
          background: #08a8ed;
          color: #fff;
          text-decoration: none;
          font-size: 14px;
          font-weight: 750;
          transition: background .18s ease, transform .18s ease;
        }
        .agency-contact-button:hover { background: #0098db; transform: translateY(-1px); }
        .share-card { padding: 22px; border-radius: 22px; text-align: center; }
        .share-card h2 { margin-bottom: 18px; font-size: 17px; }
        .share-options { display: flex; justify-content: space-around; align-items: center; gap: 14px; margin-bottom: 16px; }
        .share-options button {
          width: 54px;
          height: 54px;
          display: grid;
          place-items: center;
          border: 1px solid #dce1e9;
          border-radius: 50%;
          background: #fff;
          color: #566170;
          cursor: pointer;
          transition: .18s ease;
        }
        .share-options button:hover { border-color: #ef4444; color: #ef4444; background: #fff8f8; transform: translateY(-2px); }
        .social-icon { display: block; width: 23px; height: 23px; fill: currentColor; }
        .social-icon-vk { width: 24px; height: 24px; }
        .social-icon-ok { width: 23px; height: 23px; }
        .social-icon-telegram { width: 22px; height: 22px; }
        .copy-link-button {
          width: 100%;
          min-height: 52px;
          padding: 12px 16px;
          border: 1px solid #d9dfe8;
          border-radius: 999px;
          background: #fff;
          color: #566170;
          font-size: 14px;
          font-weight: 650;
          cursor: pointer;
          transition: border-color .18s ease, background .18s ease, color .18s ease;
        }
        .copy-link-button:hover, .copy-link-button.copied { border-color: #b6ddc5; background: #f1fbf4; color: #27764b; }
        .share-message { margin: 10px 0 0; color: #7a8490; font-size: 12px; line-height: 1.5; overflow-wrap: anywhere; }
        .state-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 30px; background: #f1f2f6; }
        .state-box { color: #697483; font-size: 16px; }
        @media (max-width: 950px) {
          .detail-layout { grid-template-columns: minmax(0, 1.65fr) minmax(270px, 1fr); gap: 14px; }
          .agency-card, .share-card { padding: 18px; }
          .agency-logo { flex-basis: 70px; height: 70px; font-size: 18px; }
          .agency-heading-copy strong { font-size: 13px; }
          .share-options button { width: 46px; height: 46px; }
        }
        @media (max-width: 760px) {
          .page { padding: 16px 14px 48px; }
          .detail-layout { grid-template-columns: minmax(0, 1fr); gap: 14px; }
          .detail-sidebar { grid-template-columns: repeat(2, minmax(0, 1fr)); align-items: stretch; }
          .gallery-frame :global(.gallery-card .image-stage) { height: clamp(250px, 52vw, 360px) !important; min-height: 250px !important; }
          .summary-block { padding: 20px 20px 16px; }
          .detail-section { margin-left: 20px; margin-right: 20px; }
          .content-panel { padding: 20px; }
          .agency-card, .share-card { height: 100%; box-sizing: border-box; }
        }
        @media (max-width: 520px) {
          .page { padding: 12px 10px 36px; }
          .detail-sidebar { grid-template-columns: minmax(0, 1fr); }
          .agency-card, .share-card { height: auto; padding: 18px; }
          .gallery-frame :global(.gallery-card .image-stage) { height: clamp(220px, 67vw, 310px) !important; min-height: 220px !important; }
          .gallery-frame :global(.gallery-card .gallery-arrow) { width: 40px; height: 40px; font-size: 26px; }
          .gallery-frame :global(.gallery-card .gallery-arrow.left) { left: 10px; }
          .gallery-frame :global(.gallery-card .gallery-arrow.right) { right: 10px; }
          .summary-block { padding: 18px 16px 14px; }
          .summary-heading-row { gap: 8px; }
          h1 { font-size: 21px; }
          .summary-price { font-size: 24px; }
          .summary-actions { gap: 5px; }
          .summary-action { width: 38px; height: 38px; font-size: 17px; }
          .summary-address { font-size: 13px; }
          .summary-bottom-row { align-items: flex-start; flex-direction: column; }
          .small-share-button { font-size: 12px; }
          .detail-section { margin-left: 16px; margin-right: 16px; padding: 18px 0; }
          .detail-section h2, .content-panel h2 { font-size: 17px; }
          .description { font-size: 13px; }
          .property-id-inline { padding: 8px 16px 16px; }
          .content-panel { padding: 18px 16px; }
          .characteristics { grid-template-columns: minmax(0, 1fr); }
          .characteristic-copy { gap: 8px; }
          .characteristic small, .characteristic strong { font-size: 12px; }
          .agency-logo { flex-basis: 72px; height: 72px; }
          .share-options button { width: 50px; height: 50px; }
        }
      `}</style>
    </main>
  );
}
