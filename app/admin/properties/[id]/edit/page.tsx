"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

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
  image_url?: string;
}

export default function EditPropertyPage() {
  const router = useRouter();
  const params = useParams();

  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [imageFile, setImageFile] =
    useState<File | null>(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    area: "",
    rooms: "",
    city: "",
    district: "",
    address: "",
    status: "Свободен",
  });

  useEffect(() => {
    if (id) {
      loadProperty();
    }
  }, [id]);

  async function loadProperty() {
    try {
      const res = await fetch(
        `https://doma-nq4u.onrender.com/properties/${id}`
      );

      if (!res.ok) {
        throw new Error("Объект не найден");
      }

      const data: Property =
        await res.json();

      setForm({
        title: data.title || "",
        description:
          data.description || "",
        price: String(data.price || ""),
        area: String(data.area || ""),
        rooms: String(data.rooms || ""),
        city: data.city || "",
        district: data.district || "",
        address: data.address || "",
        status:
          data.status || "Свободен",
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function saveProperty(
    e: React.FormEvent
  ) {
    e.preventDefault();

    try {
      const formData =
        new FormData();

      formData.append(
        "title",
        form.title
      );

      formData.append(
        "description",
        form.description
      );

      formData.append(
        "price",
        form.price
      );

      formData.append(
        "rooms",
        form.rooms
      );

      formData.append(
        "city",
        form.city
      );

      formData.append(
        "district",
        form.district
      );

      formData.append(
        "address",
        form.address
      );

      formData.append(
        "status",
        form.status
      );

      if (imageFile) {
        formData.append(
          "image",
          imageFile
        );
      }

      const res = await fetch(
        `https://doma-nq4u.onrender.com/properties/${id}`,
        {
          method: "PUT",
          body: formData,
        }
      );

      if (!res.ok) {
        throw new Error(
          "Ошибка сохранения"
        );
      }

      router.push(
        `/admin/properties/${id}`
      );
    } catch (error) {
      console.error(error);

      alert(
        "Не удалось сохранить объект"
      );
    }
  }

  if (loading) {
    return (
      <main
        style={{
          padding: "40px",
        }}
      >
        Загрузка...
      </main>
    );
  }

  return (
    <main
      style={{
        padding: "40px",
        background: "#f8fafc",
        minHeight: "100vh",
      }}
    >
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
        }}
      >
        <h1
          style={{
            fontSize: "40px",
            marginBottom: "30px",
          }}
        >
          ✏️ Редактирование объекта
        </h1>

        <form
          onSubmit={saveProperty}
          style={{
            background: "white",
            padding: "30px",
            borderRadius: "24px",
            boxShadow:
              "0 10px 30px rgba(0,0,0,.05)",
          }}
        >
          <div
            style={{
              display: "grid",
              gap: "20px",
            }}
          >
            <input
              placeholder="Название"
              value={form.title}
              onChange={(e) =>
                setForm({
                  ...form,
                  title:
                    e.target.value,
                })
              }
              style={inputStyle}
            />

            <textarea
              placeholder="Описание"
              rows={5}
              value={form.description}
              onChange={(e) =>
                setForm({
                  ...form,
                  description:
                    e.target.value,
                })
              }
              style={inputStyle}
            />

            <input
              type="number"
              placeholder="Цена"
              value={form.price}
              onChange={(e) =>
                setForm({
                  ...form,
                  price:
                    e.target.value,
                })
              }
              style={inputStyle}
            />

            <input
              type="number"
              placeholder="Площадь"
              value={form.area}
              onChange={(e) =>
                setForm({
                  ...form,
                  area:
                    e.target.value,
                })
              }
              style={inputStyle}
            />

            <input
              type="number"
              placeholder="Комнат"
              value={form.rooms}
              onChange={(e) =>
                setForm({
                  ...form,
                  rooms:
                    e.target.value,
                })
              }
              style={inputStyle}
            />

            <input
              placeholder="Город"
              value={form.city}
              onChange={(e) =>
                setForm({
                  ...form,
                  city:
                    e.target.value,
                })
              }
              style={inputStyle}
            />

            <input
              placeholder="Район"
              value={form.district}
              onChange={(e) =>
                setForm({
                  ...form,
                  district:
                    e.target.value,
                })
              }
              style={inputStyle}
            />

            <input
              placeholder="Адрес"
              value={form.address}
              onChange={(e) =>
                setForm({
                  ...form,
                  address:
                    e.target.value,
                })
              }
              style={inputStyle}
            />

            <select
              value={form.status}
              onChange={(e) =>
                setForm({
                  ...form,
                  status:
                    e.target.value,
                })
              }
              style={inputStyle}
            >
              <option>
                Свободен
              </option>
              <option>
                Бронь
              </option>
              <option>
                Продан
              </option>
            </select>

            <div>
              <label
                style={{
                  display:
                    "block",
                  marginBottom:
                    "8px",
                  fontWeight: 600,
                }}
              >
                📷 Новое фото
              </label>

              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setImageFile(
                    e.target
                      .files?.[0] ||
                      null
                  )
                }
              />
            </div>

            <button
              type="submit"
              style={{
                background:
                  "#2563eb",
                color: "white",
                border: "none",
                padding:
                  "16px 24px",
                borderRadius:
                  "14px",
                fontSize: "16px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              💾 Сохранить изменения
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

const inputStyle = {
  width: "100%",
  padding: "14px",
  border:
    "1px solid #cbd5e1",
  borderRadius: "12px",
  fontSize: "15px",
} as const;