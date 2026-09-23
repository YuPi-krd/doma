"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewPropertyPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [rooms, setRooms] = useState("");
  const [area, setArea] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [address, setAddress] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    const res = await fetch(
      "http://127.0.0.1:8000/properties",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          price: Number(price),
          area: Number(area),
          rooms: Number(rooms),
          city,
          district,
          address,
          image_url: imageUrl,
        }),
      }
    );

    if (res.ok) {
      router.push("/admin/properties");
    } else {
      alert("Ошибка при создании объекта");
    }
  }

  const inputStyle = {
    width: "100%",
    padding: "14px 16px",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    fontSize: "16px",
    outline: "none",
    background: "#fff",
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        padding: "40px",
      }}
    >
      <div
        style={{
          maxWidth: "1000px",
          margin: "0 auto",
        }}
      >
        <h1
          style={{
            fontSize: "42px",
            marginBottom: "30px",
          }}
        >
          🏠 Новый объект
        </h1>

        <form
          onSubmit={handleSubmit}
          style={{
            background: "white",
            padding: "35px",
            borderRadius: "24px",
            boxShadow:
              "0 10px 30px rgba(0,0,0,.05)",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit,minmax(300px,1fr))",
              gap: "20px",
            }}
          >
            <div>
              <label>Название объекта</label>

              <input
                style={inputStyle}
                value={title}
                onChange={(e) =>
                  setTitle(e.target.value)
                }
                placeholder="ЖК Самолёт"
                required
              />
            </div>

            <div>
              <label>Цена</label>

              <input
                type="number"
                style={inputStyle}
                value={price}
                onChange={(e) =>
                  setPrice(e.target.value)
                }
                placeholder="6000000"
                required
              />
            </div>

            <div>
              <label>Площадь (м²)</label>

              <input
                type="number"
                style={inputStyle}
                value={area}
                onChange={(e) =>
                  setArea(e.target.value)
                }
                placeholder="75"
              />
            </div>

            <div>
              <label>Количество комнат</label>

              <input
                type="number"
                style={inputStyle}
                value={rooms}
                onChange={(e) =>
                  setRooms(e.target.value)
                }
                placeholder="3"
                required
              />
            </div>

            <div>
              <label>Город</label>

              <input
                style={inputStyle}
                value={city}
                onChange={(e) =>
                  setCity(e.target.value)
                }
                placeholder="Краснодар"
                required
              />
            </div>

            <div>
              <label>Район</label>

              <input
                style={inputStyle}
                value={district}
                onChange={(e) =>
                  setDistrict(e.target.value)
                }
                placeholder="Центральный"
              />
            </div>

            <div
              style={{
                gridColumn: "1 / -1",
              }}
            >
              <label>Адрес</label>

              <input
                style={inputStyle}
                value={address}
                onChange={(e) =>
                  setAddress(e.target.value)
                }
                placeholder="ул. Красная 1"
              />
            </div>

            <div
              style={{
                gridColumn: "1 / -1",
              }}
            >
              <label>Путь к фото</label>

              <input
                style={inputStyle}
                value={imageUrl}
                onChange={(e) =>
                  setImageUrl(e.target.value)
                }
                placeholder="/images/test-flat.jpg"
              />
            </div>

            {imageUrl && (
              <div
                style={{
                  gridColumn: "1 / -1",
                }}
              >
                <label>
                  Предпросмотр фото
                </label>

                <div
                  style={{
                    marginTop: "10px",
                  }}
                >
                  <img
                    src={`http://127.0.0.1:8000${imageUrl}`}
                    alt="preview"
                    style={{
                      width: "100%",
                      maxHeight: "400px",
                      objectFit: "cover",
                      borderRadius: "16px",
                    }}
                  />
                </div>
              </div>
            )}

            <div
              style={{
                gridColumn: "1 / -1",
              }}
            >
              <label>Описание</label>

              <textarea
                style={{
                  ...inputStyle,
                  minHeight: "140px",
                  resize: "vertical",
                }}
                value={description}
                onChange={(e) =>
                  setDescription(
                    e.target.value
                  )
                }
                placeholder="Описание объекта..."
              />
            </div>
          </div>

          <button
            type="submit"
            style={{
              marginTop: "30px",
              width: "100%",
              background: "#ef4444",
              color: "white",
              border: "none",
              padding: "18px",
              borderRadius: "14px",
              fontSize: "18px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            💾 Сохранить объект
          </button>
        </form>
      </div>
    </main>
  );
}