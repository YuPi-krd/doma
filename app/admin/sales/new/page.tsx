"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Client {
  id: number;
  name: string;
}

interface Property {
  id: number;
  title: string;
}

export default function NewSalePage() {
  const router = useRouter();

  const [clients, setClients] = useState<Client[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);

  const [clientId, setClientId] = useState("");
  const [propertyId, setPropertyId] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] =
    useState("Подготовка");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const clientsRes = await fetch(
        "https://doma-nq4u.onrender.com/clients"
      );

      const propertiesRes = await fetch(
        "https://doma-nq4u.onrender.com/properties"
      );

      const clientsData =
        await clientsRes.json();

      const propertiesData =
        await propertiesRes.json();

      setClients(clientsData);
      setProperties(propertiesData);
    } catch (error) {
      console.error(error);
    }
  }

  async function createSale(
    e: React.FormEvent
  ) {
    e.preventDefault();

    try {
      const res = await fetch(
        "https://doma-nq4u.onrender.com/sales",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            client_id: Number(clientId),
            property_id:
              Number(propertyId),
            amount: Number(amount),
            status,
          }),
        }
      );

      if (!res.ok) {
        throw new Error();
      }

      router.push("/admin/sales");
    } catch {
      alert("Ошибка создания сделки");
    }
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
          maxWidth: "800px",
          margin: "0 auto",
        }}
      >
        <h1
          style={{
            fontSize: "40px",
            marginBottom: "30px",
          }}
        >
          ➕ Новая сделка
        </h1>

        <form
          onSubmit={createSale}
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
            <select
              value={clientId}
              onChange={(e) =>
                setClientId(
                  e.target.value
                )
              }
              style={inputStyle}
              required
            >
              <option value="">
                Выберите клиента
              </option>

              {clients.map((client) => (
                <option
                  key={client.id}
                  value={client.id}
                >
                  {client.name}
                </option>
              ))}
            </select>

            <select
              value={propertyId}
              onChange={(e) =>
                setPropertyId(
                  e.target.value
                )
              }
              style={inputStyle}
              required
            >
              <option value="">
                Выберите объект
              </option>

              {properties.map(
                (property) => (
                  <option
                    key={property.id}
                    value={property.id}
                  >
                    {property.title}
                  </option>
                )
              )}
            </select>

            <input
              type="number"
              placeholder="Сумма сделки"
              value={amount}
              onChange={(e) =>
                setAmount(
                  e.target.value
                )
              }
              style={inputStyle}
              required
            />

            <select
              value={status}
              onChange={(e) =>
                setStatus(
                  e.target.value
                )
              }
              style={inputStyle}
            >
              <option>
                Подготовка
              </option>

              <option>
                В работе
              </option>

              <option>
                Завершена
              </option>

              <option>
                Отменена
              </option>
            </select>

            <button
              type="submit"
              style={{
                background:
                  "#22c55e",
                color: "white",
                border: "none",
                padding:
                  "16px 24px",
                borderRadius:
                  "14px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Создать сделку
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