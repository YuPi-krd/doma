"use client";
import Link from "next/link";

import { useState } from "react";

export default function Hero() {
  const [activeTab, setActiveTab] = useState("Купить");

  return (
    <section className="hero">
      <div className="container hero-content">

        <div
          style={{
            color: "white",
            fontWeight: 700,
            letterSpacing: "2px",
            marginBottom: "20px",
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
          Покупка, продажа и аренда недвижимости в Краснодаре.
          Полное сопровождение сделки и персональный подход к каждому клиенту.
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
              500+
            </div>
            <div>Объектов</div>
          </div>

          <div>
            <div
              style={{
                fontSize: "36px",
                fontWeight: 700,
              }}
            >
              150+
            </div>
            <div>Сделок</div>
          </div>

          <div>
            <div
              style={{
                fontSize: "36px",
                fontWeight: 700,
              }}
            >
              98%
            </div>
            <div>Довольных клиентов</div>
          </div>
        </div>

        <div className="search-box">

          <div className="search-tabs">
            {[
              "Купить",
              "Продать",
              "Снять",
              "Сдать",
              "Новостройки",
              "Коммерция",
            ].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={
                  activeTab === tab
                    ? "search-tab active"
                    : "search-tab"
                }
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="search-grid">
            <input
              className="search-input"
              placeholder="Тип недвижимости"
            />

            <input
              className="search-input"
              placeholder="Количество комнат"
            />

            <input
              className="search-input"
              placeholder="Цена от"
            />

            <input
              className="search-input"
              placeholder="Цена до"
            />

            <input
              className="search-input"
              placeholder="Город, район, улица"
            />
          </div>

          <div className="search-buttons">
            <button
              type="button"
              className="btn"
            >
              Все фильтры
            </button>

            <button
              type="button"
              className="btn"
            >
              На карте
            </button>

            <Link
  href="/catalog"
  className="btn btn-red"
  style={{
    textDecoration: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  }}
>
  Поиск объявлений
</Link>
          </div>

        </div>

      </div>
    </section>
  );
}