"use client";

import { useState } from "react";

export default function LeadModal({
  propertyId,
}: {
  propertyId: number;
}) {
  const [open, setOpen] = useState(false);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [comment, setComment] = useState("");

  async function sendLead() {
    const res = await fetch(
      "https://doma-nq4u.onrender.com/leads",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          property_id: propertyId,
          name,
          phone,
          comment,
        }),
      }
    );

    if (res.ok) {
      alert("Заявка отправлена!");
      setOpen(false);
      setName("");
      setPhone("");
      setComment("");
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          background: "#e53935",
          color: "white",
          border: "none",
          padding: "15px 30px",
          borderRadius: "12px",
          cursor: "pointer",
          fontSize: "18px",
        }}
      >
        Оставить заявку
      </button>

      {open && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.6)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 999,
          }}
        >
          <div
            style={{
              background: "white",
              width: "500px",
              padding: "30px",
              borderRadius: "20px",
            }}
          >
            <h2>Оставить заявку</h2>

            <input
              placeholder="Ваше имя"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              style={{
                width: "100%",
                padding: "12px",
                marginTop: "15px",
              }}
            />

            <input
              placeholder="Телефон"
              value={phone}
              onChange={(e) =>
                setPhone(e.target.value)
              }
              style={{
                width: "100%",
                padding: "12px",
                marginTop: "15px",
              }}
            />

            <textarea
              placeholder="Комментарий"
              value={comment}
              onChange={(e) =>
                setComment(e.target.value)
              }
              style={{
                width: "100%",
                padding: "12px",
                marginTop: "15px",
                minHeight: "120px",
              }}
            />

            <div
              style={{
                display: "flex",
                gap: "10px",
                marginTop: "20px",
              }}
            >
              <button
                onClick={sendLead}
                style={{
                  flex: 1,
                  background: "#e53935",
                  color: "white",
                  border: "none",
                  padding: "12px",
                  borderRadius: "10px",
                }}
              >
                Отправить
              </button>

              <button
                onClick={() => setOpen(false)}
                style={{
                  flex: 1,
                  padding: "12px",
                }}
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}