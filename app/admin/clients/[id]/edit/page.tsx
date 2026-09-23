"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

interface Client {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  status: string;
  notes: string | null;
}

export default function EditClientPage() {
  const router = useRouter();
  const params = useParams();

  const clientId = params.id as string;

  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("Новый");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (clientId) {
      loadClient();
    }
  }, [clientId]);

  async function loadClient() {
    try {
      const res = await fetch(
        `http://127.0.0.1:8000/clients/${clientId}`,
        {
          cache: "no-store",
        }
      );

      if (!res.ok) {
        throw new Error("Клиент не найден");
      }

      const data: Client = await res.json();

      setName(data.name || "");
      setPhone(data.phone || "");
      setEmail(data.email || "");
      setStatus(data.status || "Новый");
      setNotes(data.notes || "");
    } catch (error) {
      console.error(error);
      alert("Не удалось загрузить клиента");
    } finally {
      setLoading(false);
    }
  }

  async function saveClient(
    e: React.FormEvent
  ) {
    e.preventDefault();

    try {
      const res = await fetch(
        `http://127.0.0.1:8000/clients/${clientId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            name,
            phone,
            email,
            status,
            notes,
          }),
        }
      );

      if (!res.ok) {
        const errorText =
          await res.text();

        console.error(errorText);

        alert(
          "Ошибка сохранения клиента"
        );

        return;
      }

      router.push(
        `/admin/clients/${clientId}`
      );

      router.refresh();
    } catch (error) {
      console.error(error);

      alert(
        "Ошибка соединения с сервером"
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
        minHeight: "100vh",
        background: "#f8fafc",
        padding: "40px",
      }}
    >
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          background: "white",
          padding: "35px",
          borderRadius: "24px",
          boxShadow:
            "0 10px 30px rgba(0,0,0,.05)",
        }}
      >
        <h1
          style={{
            marginTop: 0,
            marginBottom: "30px",
            fontSize: "36px",
          }}
        >
          ✏️ Редактирование клиента
        </h1>

        <form onSubmit={saveClient}>
          <div
            style={{
              marginBottom: "20px",
            }}
          >
            <label>Имя клиента</label>

            <input
              value={name}
              onChange={(e) =>
                setName(
                  e.target.value
                )
              }
              required
              style={{
                width: "100%",
                padding: "14px",
                marginTop: "8px",
                borderRadius: "12px",
                border:
                  "1px solid #cbd5e1",
              }}
            />
          </div>

          <div
            style={{
              marginBottom: "20px",
            }}
          >
            <label>Телефон</label>

            <input
              value={phone}
              onChange={(e) =>
                setPhone(
                  e.target.value
                )
              }
              required
              style={{
                width: "100%",
                padding: "14px",
                marginTop: "8px",
                borderRadius: "12px",
                border:
                  "1px solid #cbd5e1",
              }}
            />
          </div>

          <div
            style={{
              marginBottom: "20px",
            }}
          >
            <label>Email</label>

            <input
              value={email}
              onChange={(e) =>
                setEmail(
                  e.target.value
                )
              }
              style={{
                width: "100%",
                padding: "14px",
                marginTop: "8px",
                borderRadius: "12px",
                border:
                  "1px solid #cbd5e1",
              }}
            />
          </div>

          <div
            style={{
              marginBottom: "20px",
            }}
          >
            <label>Статус</label>

            <select
              value={status}
              onChange={(e) =>
                setStatus(
                  e.target.value
                )
              }
              style={{
                width: "100%",
                padding: "14px",
                marginTop: "8px",
                borderRadius: "12px",
                border:
                  "1px solid #cbd5e1",
              }}
            >
              <option value="Новый">
                Новый
              </option>

              <option value="В работе">
                В работе
              </option>

              <option value="Постоянный">
                Постоянный
              </option>

              <option value="Сделка">
                Сделка
              </option>
            </select>
          </div>

          <div
            style={{
              marginBottom: "30px",
            }}
          >
            <label>Заметки</label>

            <textarea
              value={notes}
              onChange={(e) =>
                setNotes(
                  e.target.value
                )
              }
              rows={6}
              style={{
                width: "100%",
                padding: "14px",
                marginTop: "8px",
                borderRadius: "12px",
                border:
                  "1px solid #cbd5e1",
                resize: "vertical",
              }}
            />
          </div>

          <div
            style={{
              display: "flex",
              gap: "15px",
            }}
          >
            <button
              type="submit"
              style={{
                background:
                  "#2563eb",
                color: "white",
                border: "none",
                padding:
                  "14px 24px",
                borderRadius:
                  "12px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              💾 Сохранить
            </button>

            <button
              type="button"
              onClick={() =>
                router.back()
              }
              style={{
                background:
                  "#e2e8f0",
                border: "none",
                padding:
                  "14px 24px",
                borderRadius:
                  "12px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Отмена
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}