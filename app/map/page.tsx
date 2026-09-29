"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import YandexMap from "@/components/YandexMap";

const API_URL =
  "https://doma-nq4u.onrender.com";

interface Property {
  id: number;
  title: string;
  price: number;
  city?: string | null;
  district?: string | null;
  address?: string | null;
  image_url?: string | null;
}

export default function MapPage() {
  const [properties, setProperties] =
    useState<Property[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function loadProperties() {
      try {
        setLoading(true);
        setError("");

        const response =
          await fetch(
            `${API_URL}/properties`,
            {
              cache: "no-store",
            }
          );

        if (!response.ok) {
          throw new Error(
            "Не удалось загрузить объекты"
          );
        }

        const data =
          await response.json();

        setProperties(
          Array.isArray(data)
            ? data
            : []
        );
      } catch (err) {
        console.error(err);

        setError(
          "Не удалось загрузить объекты."
        );
      } finally {
        setLoading(false);
      }
    }

    loadProperties();
  }, []);

  /*
   * Пока в properties нет latitude/longitude,
   * поэтому реальные маркеры ещё не создаём.
   *
   * Следующим этапом добавим координаты
   * в PostgreSQL.
   */
  const markers: {
    id: number;
    title: string;
    price: number;
    coordinates: [
      number,
      number
    ];
  }[] = [];

  return (
    <main className="page">
      <div className="container">

        {/* HEADER */}

        <div className="top">

          <div>
            <div className="breadcrumbs">
              <Link href="/">
                DOMA
              </Link>

              <span>/</span>

              <span>
                Карта объектов
              </span>
            </div>

            <h1>
              Объекты недвижимости
              на карте
            </h1>

            <p>
              Краснодар ·{" "}
              {properties.length}{" "}
              объявлений
            </p>
          </div>

          <Link
            href="/catalog"
            className="catalog-button"
          >
            ☷ Каталог
          </Link>

        </div>

        {/* ERROR */}

        {error && (
          <div className="error">
            {error}
          </div>
        )}

        {/* MAP */}

        <div className="map-card">
          <YandexMap
            height="calc(100vh - 230px)"
            markers={markers}
          />
        </div>

        {/* INFO */}

        <div className="info">

          <div className="info-title">
            Всего объектов:{" "}
            {properties.length}
          </div>

          <div className="info-text">
            Карта уже подключена.
            Следующим этапом мы добавим
            координаты каждого объявления,
            после чего объекты появятся
            на карте отдельными метками.
          </div>

        </div>

      </div>

      <style jsx>{`
        .page {
          min-height: 100vh;
          padding:
            22px
            20px
            50px;
          background: #f3f4f7;
        }

        .container {
          max-width: 1500px;
          margin: 0 auto;
        }

        .top {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 25px;
          margin-bottom: 18px;
        }

        .breadcrumbs {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 7px;
          margin-bottom: 10px;
          color: #9aa2ad;
          font-size: 12px;
        }

        .breadcrumbs a {
          color: #46515e;
          text-decoration: none;
          font-weight: 600;
        }

        h1 {
          margin: 0;
          color: #202731;
          font-size:
            clamp(
              30px,
              4vw,
              48px
            );
          line-height: 1.05;
          letter-spacing: -1.2px;
        }

        .top p {
          margin:
            9px
            0
            0;
          color: #7a8491;
          font-size: 14px;
        }

        .catalog-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding:
            12px
            18px;
          border:
            1px solid
            #dce2e8;
          border-radius: 13px;
          background: #ffffff;
          color: #343d48;
          text-decoration: none;
          font-size: 13px;
          font-weight: 600;
          white-space: nowrap;
        }

        .map-card {
          overflow: hidden;
          padding: 0;
          border-radius: 26px;
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

        .error {
          margin-bottom: 15px;
          padding:
            14px
            18px;
          border-radius: 14px;
          background: #fee2e2;
          color: #991b1b;
          font-size: 14px;
        }

        .info {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          margin-top: 14px;
          padding:
            18px
            20px;
          border-radius: 18px;
          background: #ffffff;
        }

        .info-title {
          color: #28313b;
          font-size: 14px;
          font-weight: 700;
          white-space: nowrap;
        }

        .info-text {
          color: #7b8591;
          font-size: 13px;
          line-height: 1.6;
          text-align: right;
        }

        @media (max-width: 700px) {
          .page {
            padding:
              14px
              12px
              35px;
          }

          .top {
            align-items:
              flex-start;
            flex-direction:
              column;
          }

          .catalog-button {
            width: 100%;
          }

          .map-card {
            border-radius: 18px;
          }

          .info {
            align-items:
              flex-start;
            flex-direction:
              column;
          }

          .info-text {
            text-align: left;
          }
        }
      `}</style>
    </main>
  );
}