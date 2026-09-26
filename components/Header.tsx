"use client";

import Link from "next/link";
import { useState } from "react";
import CallbackModal from "@/components/CallbackModal";

const propertyCategories = [
  {
    title: "Квартиры",
    type: "apartment",
    image:
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1000&q=85",
  },
  {
    title: "Квартиры в новостройке",
    type: "new_building",
    image:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1000&q=85",
  },
  {
    title: "Дома",
    type: "house",
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=85",
  },
  {
    title: "Земельные участки",
    type: "land",
    image:
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1000&q=85",
  },
  {
    title: "Коммерческая",
    type: "commercial",
    image:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1000&q=85",
  },
  {
    title: "Гаражи",
    type: "garage",
    image:
      "https://images.unsplash.com/photo-1625047509248-ec889cbff17f?auto=format&fit=crop&w=1000&q=85",
  },
];

export default function Header() {
  const [propertyMenuOpen, setPropertyMenuOpen] =
    useState(false);

  return (
    <>
      <header
        style={{
          height: "80px",
          background: "#ffffff",
          borderBottom: "1px solid #e5e7eb",
          position: "sticky",
          top: 0,
          zIndex: 1000,
        }}
      >
        <div
          style={{
            maxWidth: "1400px",
            margin: "0 auto",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 30px",
          }}
        >
          {/* ЛОГО */}
          <Link
            href="/"
            style={{
              fontSize: "40px",
              fontWeight: 800,
              textDecoration: "none",
              color: "#111827",
              letterSpacing: "-2px",
            }}
          >
            DO<span style={{ color: "#ef4444" }}>MA</span>
          </Link>

          {/* НАВИГАЦИЯ */}
          <nav
            style={{
              display: "flex",
              gap: "40px",
              alignItems: "center",
              height: "100%",
            }}
          >
            {/* НЕДВИЖИМОСТЬ */}
            <div
              style={{
                height: "100%",
                display: "flex",
                alignItems: "center",
              }}
              onMouseEnter={() =>
                setPropertyMenuOpen(true)
              }
              onMouseLeave={() =>
                setPropertyMenuOpen(false)
              }
            >
              <button
                type="button"
                onClick={() =>
                  setPropertyMenuOpen(
                    !propertyMenuOpen
                  )
                }
                style={{
                  border: "none",
                  background: "transparent",
                  color: "#111827",
                  fontWeight: 500,
                  fontSize: "16px",
                  cursor: "pointer",
                  padding: "15px 0",
                }}
              >
                Недвижимость
              </button>

              {/* МЕГА-МЕНЮ */}
              {propertyMenuOpen && (
                <div
                  style={{
                    position: "absolute",
                    top: "92px",
                    left: "50%",
                    transform:
                      "translateX(-50%)",
                    width: "calc(100% - 40px)",
                    maxWidth: "1240px",
                    background: "#ffffff",
                    borderRadius: "30px",
                    padding: "28px",
                    boxShadow:
                      "0 25px 70px rgba(0,0,0,.18)",
                    zIndex: 1002,
                  }}
                >
                  {/* Верхняя строка */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      marginBottom: "28px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "18px",
                        fontWeight: 700,
                        color: "#5f6671",
                      }}
                    >
                      Недвижимость
                    </div>

                    <div
                      style={{
                        fontSize: "15px",
                        color: "#7a818c",
                      }}
                    >
                      36 062 объявления
                    </div>
                  </div>

                  {/* КАРТОЧКИ */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(3, 1fr)",
                      gap: "16px",
                    }}
                  >
                    {propertyCategories.map(
                      (category) => (
                        <Link
                          key={category.type}
                          href={`/catalog?type=${category.type}`}
                          onClick={() =>
                            setPropertyMenuOpen(
                              false
                            )
                          }
                          style={{
                            position:
                              "relative",
                            height: "184px",
                            borderRadius: "20px",
                            overflow: "hidden",
                            textDecoration:
                              "none",
                            color: "#202328",
                            background:
                              "#eef0f4",
                            display: "block",
                          }}
                        >
                          {/* ФОТО */}
                          <div
                            style={{
                              position:
                                "absolute",
                              inset: 0,
                              backgroundImage:
                                `url("${category.image}")`,
                              backgroundSize:
                                "cover",
                              backgroundPosition:
                                "center",
                              filter:
                                "grayscale(100%)",
                              opacity: 0.72,
                            }}
                          />

                          {/* ГРАДИЕНТ */}
                          <div
                            style={{
                              position:
                                "absolute",
                              inset: 0,
                              background:
                                "linear-gradient(90deg, rgba(239,241,245,.97) 0%, rgba(239,241,245,.82) 35%, rgba(239,241,245,.18) 75%, rgba(239,241,245,.03) 100%)",
                            }}
                          />

                          {/* НАЗВАНИЕ */}
                          <div
                            style={{
                              position:
                                "absolute",
                              top: "32px",
                              left: "32px",
                              right: "20px",
                              fontSize: "17px",
                              fontWeight: 700,
                              zIndex: 2,
                            }}
                          >
                            {category.title}
                          </div>

                          {/* СТРЕЛКА */}
                          <div
                            style={{
                              position:
                                "absolute",
                              left: "32px",
                              bottom: "32px",
                              width: "40px",
                              height: "40px",
                              borderRadius:
                                "50%",
                              border:
                                "1px solid #d5dbe2",
                              display: "flex",
                              alignItems:
                                "center",
                              justifyContent:
                                "center",
                              color: "#66707c",
                              fontSize: "18px",
                              zIndex: 2,
                              background:
                                "rgba(255,255,255,.2)",
                              backdropFilter:
                                "blur(4px)",
                            }}
                          >
                            →
                          </div>
                        </Link>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* УСЛУГИ */}
            <Link
              href="/services"
              style={{
                textDecoration: "none",
                color: "#111827",
                fontWeight: 500,
                fontSize: "16px",
              }}
            >
              Услуги
            </Link>

            {/* О КОМПАНИИ */}
            <Link
              href="/about"
              style={{
                textDecoration: "none",
                color: "#111827",
                fontWeight: 500,
                fontSize: "16px",
              }}
            >
              О компании
            </Link>

            {/* КОНТАКТЫ */}
            <Link
              href="/contacts"
              style={{
                textDecoration: "none",
                color: "#111827",
                fontWeight: 500,
                fontSize: "16px",
              }}
            >
              Контакты
            </Link>
          </nav>

          {/* ПРАВАЯ ЧАСТЬ */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <button
              type="button"
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                border:
                  "1px solid #e5e7eb",
                background: "#ffffff",
                cursor: "pointer",
                fontSize: "20px",
              }}
            >
              ♡
            </button>

            <CallbackModal />
          </div>
        </div>
      </header>

      {/* ЗАТЕМНЕНИЕ ФОНА */}
      {propertyMenuOpen && (
        <div
          onMouseEnter={() =>
            setPropertyMenuOpen(true)
          }
          onClick={() =>
            setPropertyMenuOpen(false)
          }
          style={{
            position: "fixed",
            inset: "80px 0 0 0",
            background:
              "rgba(20, 22, 26, 0.48)",
            zIndex: 999,
          }}
        />
      )}
    </>
  );
}