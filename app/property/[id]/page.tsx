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

                {property.rooms >
                  0 && (
                  <div className="characteristic">
                    <span>
                      🏠
                    </span>

                    <div>
                      <small>
                        Комнаты
                      </small>

                      <strong>
                        {
                          property.rooms
                        }
                      </strong>
                    </div>
                  </div>
                )}

                {property.area >
                  0 && (
                  <div className="characteristic">
                    <span>
                      📐
                    </span>

                    <div>
                      <small>
                        Площадь
                      </small>

                      <strong>
                        {
                          property.area
                        }{" "}
                        м²
                      </strong>
                    </div>
                  </div>
                )}

                {property.city && (
                  <div className="characteristic">
                    <span>
                      🏙️
                    </span>

                    <div>
                      <small>
                        Город
                      </small>

                      <strong>
                        {
                          property.city
                        }
                      </strong>
                    </div>
                  </div>
                )}

                {property.district && (
                  <div className="characteristic">
                    <span>
                      📍
                    </span>

                    <div>
                      <small>
                        Район
                      </small>

                      <strong>
                        {
                          property.district
                        }
                      </strong>
                    </div>
                  </div>
                )}

                {property.status && (
                  <div className="characteristic">
                    <span>
                      ●
                    </span>

                    <div>
                      <small>
                        Статус
                      </small>

                      <strong>
                        {
                          property.status
                        }
                      </strong>
                    </div>
                  </div>
                )}

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
          padding: 22px 20px 70px;
          background: #f5f6f8;
        }

        .container {
          max-width: 1400px;
          margin: 0 auto;
        }

        /* ======================================================
           BREADCRUMBS
        ====================================================== */

        .breadcrumbs {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 7px;
          margin-bottom: 16px;
          color: #9aa2ad;
          font-size: 13px;
        }

        .breadcrumbs a {
          color: #566170;
          text-decoration: none;
        }

        /* ======================================================
           CONTENT
        ====================================================== */

        .content-grid {
          display: grid;
          grid-template-columns:
            minmax(0, 1fr)
            360px;
          gap: 28px;
          margin-top: 28px;
        }

        .title-section {
          margin-bottom: 22px;
        }

        .labels {
          display: flex;
          flex-wrap: wrap;
          gap: 7px;
          margin-bottom: 10px;
        }

        .deal-label,
        .type-label,
        .subtype-label {
          display: inline-flex;
          align-items: center;
          padding:
            6px
            10px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 700;
        }

        .deal-label {
          background: #ef4444;
          color: #ffffff;
        }

        .type-label {
          background: #e8ebef;
          color: #4f5966;
        }

        .subtype-label {
          background: #252c34;
          color: #ffffff;
        }

        h1 {
          margin: 0;
          color: #171d24;
          font-size: clamp(
            34px,
            4vw,
            52px
          );
          line-height: 1.08;
          letter-spacing: -1.5px;
        }

        .address {
          margin:
            12px
            0
            0;
          color: #697483;
          font-size: 16px;
          line-height: 1.5;
        }

        /* ======================================================
           PRICE
        ====================================================== */

        .mobile-price-box {
          display: none;
        }

        /* ======================================================
           SECTION
        ====================================================== */

        .section {
          margin-top: 24px;
        }

        .section h2 {
          margin:
            0
            0
            14px;
          color: #222a33;
          font-size: 23px;
        }

        .white-section {
          padding: 26px;
          border-radius: 22px;
          background: #ffffff;
          box-shadow:
            0 5px 20px
              rgba(
                15,
                23,
                42,
                0.04
              );
        }

        /* ======================================================
           CHARACTERISTICS
        ====================================================== */

        .characteristics {
          display: grid;
          grid-template-columns:
            repeat(
              3,
              minmax(
                0,
                1fr
              )
            );
          gap: 12px;
        }

        .characteristic {
          display: flex;
          align-items: center;
          gap: 12px;
          min-height: 82px;
          padding: 16px;
          border:
            1px solid
            #e7eaf0;
          border-radius: 16px;
          background: #ffffff;
        }

        .characteristic
          > span {
          font-size: 22px;
        }

        .characteristic
          small {
          display: block;
          margin-bottom: 4px;
          color: #919aa6;
          font-size: 11px;
        }

        .characteristic
          strong {
          display: block;
          color: #29313b;
          font-size: 15px;
        }

        /* ======================================================
           DESCRIPTION
        ====================================================== */

        .description {
          margin: 0;
          color: #566170;
          font-size: 15px;
          line-height: 1.8;
          white-space: pre-line;
        }

        /* ======================================================
           LOCATION
        ====================================================== */

        .location-box {
          display: flex;
          align-items: flex-start;
          gap: 15px;
          padding: 16px;
          border-radius: 16px;
          background: #f7f8fa;
        }

        .location-icon {
          width: 42px;
          height: 42px;
          display: grid;
          place-items: center;
          flex: 0 0 42px;
          border-radius: 50%;
          background: #ef4444;
          color: #ffffff;
        }

        .location-box strong {
          color: #252d36;
          font-size: 16px;
        }

        .location-box p {
          margin:
            4px
            0
            0;
          color: #697483;
          font-size: 14px;
        }

        /* ======================================================
           SIDE
        ====================================================== */

        aside {
          min-width: 0;
        }

        .side-card {
          position: sticky;
          top: 25px;
          padding: 28px;
          border-radius: 24px;
          background: #ffffff;
          box-shadow:
            0 10px 35px
              rgba(
                17,
                24,
                39,
                0.07
              );
        }

        .side-price {
          color: #171d24;
          font-size: 38px;
          line-height: 1.1;
          font-weight: 750;
        }

        .side-meter {
          margin-top: 6px;
          color: #7c8693;
          font-size: 13px;
        }

        .side-status {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 18px;
          color: #596473;
          font-size: 13px;
        }

        .status-dot {
          width: 9px;
          height: 9px;
          border-radius: 50%;
          background: #f59e0b;
        }

        .status-dot.green {
          background: #22c55e;
        }

        .lead-wrapper {
          margin-top: 22px;
        }

        .consultation {
          margin-top: 24px;
          padding-top: 22px;
          border-top:
            1px solid
            #eceff3;
        }

        .consultation-title {
          color: #29323c;
          font-size: 14px;
          font-weight: 700;
        }

        .consultation p {
          margin:
            9px
            0
            0;
          color: #737e8c;
          font-size: 13px;
          line-height: 1.7;
        }

        .property-id {
          margin-top: 20px;
          color: #a0a7b1;
          font-size: 11px;
        }

        /* ======================================================
           STATES
        ====================================================== */

        .state-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 30px;
          background: #f5f6f8;
        }

        .state-box {
          color: #697483;
          font-size: 17px;
        }

        /* ======================================================
           RESPONSIVE
        ====================================================== */

        @media (max-width: 1000px) {
          .content-grid {
            grid-template-columns: 1fr;
          }

          aside {
            order: -1;
          }

          .side-card {
            position: static;
          }

          .mobile-price-box {
            display: block;
            margin:
              0
              0
              20px;
          }

          .mobile-price {
            color: #171d24;
            font-size: 34px;
            font-weight: 750;
          }

          .mobile-meter {
            margin-top: 5px;
            color: #7c8693;
            font-size: 13px;
          }
        }

        @media (max-width: 700px) {
          .page {
            padding:
              12px
              12px
              50px;
          }

          .content-grid {
            gap: 15px;
            margin-top: 20px;
          }

          .characteristics {
            grid-template-columns:
              1fr
              1fr;
          }

          .white-section {
            padding: 20px;
          }

          h1 {
            font-size: 34px;
          }

          .side-card {
            padding: 22px;
          }
        }

        @media (max-width: 480px) {
          .characteristics {
            grid-template-columns: 1fr;
          }

          .breadcrumbs {
            font-size: 11px;
          }

          h1 {
            font-size: 30px;
          }

          .address {
            font-size: 14px;
          }

          .side-price {
            font-size: 32px;
          }
        }
      `}</style>
    </main>
  );
}