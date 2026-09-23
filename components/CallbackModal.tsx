"use client";

import { useState } from "react";

export default function CallbackModal() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="btn btn-red"
      >
        Перезвоните мне
      </button>

      {open && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              background: "white",
              width: "500px",
              padding: "30px",
              borderRadius: "24px",
            }}
          >
            <h2>Заказать звонок</h2>

            <p
              style={{
                color: "#64748b",
                marginBottom: "20px",
              }}
            >
              Оставьте контакты и мы свяжемся с вами.
            </p>

            <input
              placeholder="Ваше имя"
              style={{
                width: "100%",
                padding: "14px",
                marginBottom: "12px",
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
              }}
            />

            <input
              placeholder="Телефон"
              style={{
                width: "100%",
                padding: "14px",
                marginBottom: "20px",
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
              }}
            />

            <div
              style={{
                display: "flex",
                gap: "10px",
              }}
            >
              <button
                style={{
                  flex: 1,
                  background: "#ef4444",
                  color: "white",
                  border: "none",
                  padding: "14px",
                  borderRadius: "12px",
                  cursor: "pointer",
                }}
              >
                Отправить
              </button>

              <button
                onClick={() => setOpen(false)}
                style={{
                  flex: 1,
                  background: "#e2e8f0",
                  border: "none",
                  padding: "14px",
                  borderRadius: "12px",
                  cursor: "pointer",
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