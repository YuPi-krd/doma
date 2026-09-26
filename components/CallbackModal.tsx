"use client";

import { FormEvent, useState } from "react";

const API_URL =
  "https://doma-nq4u.onrender.com";

export default function CallbackModal() {
  const [open, setOpen] = useState(false);

  const [name, setName] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [comment, setComment] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [success, setSuccess] =
    useState(false);

  const [error, setError] =
    useState("");

  function resetForm() {
    setName("");
    setPhone("");
    setComment("");
    setSuccess(false);
    setError("");
  }

  function closeModal() {
    if (loading) return;

    setOpen(false);
    resetForm();
  }

  async function handleSubmit(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const response = await fetch(
        `${API_URL}/leads`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            property_id: null,
            name: name.trim(),
            phone: phone.trim(),
            comment:
              comment.trim() ||
              "Заявка на обратный звонок",
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            "Не удалось отправить заявку"
        );
      }

      setSuccess(true);

      setName("");
      setPhone("");
      setComment("");
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Произошла ошибка"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* ================================================= */}
      {/* КНОПКА В HEADER */}
      {/* ================================================= */}

      <button
        type="button"
        onClick={() => {
          setOpen(true);
          setSuccess(false);
          setError("");
        }}
        style={{
          border: "none",
          borderRadius: "16px",
          background:
            "#ef4444",
          color: "#ffffff",
          padding:
            "14px 18px",
          minHeight: "48px",
          fontSize: "15px",
          fontWeight: 700,
          cursor: "pointer",
          whiteSpace:
            "nowrap",
        }}
      >
        Перезвоните мне
      </button>

      {/* ================================================= */}
      {/* MODAL */}
      {/* ================================================= */}

      {open && (
        <div
          onClick={closeModal}
          style={{
            position: "fixed",
            inset: 0,
            background:
              "rgba(15, 23, 42, 0.55)",
            display: "flex",
            alignItems:
              "center",
            justifyContent:
              "center",
            padding: "20px",
            zIndex: 2000,
          }}
        >
          <div
            onClick={(e) =>
              e.stopPropagation()
            }
            style={{
              width:
                "min(520px, 100%)",
              background:
                "#ffffff",
              borderRadius:
                "26px",
              padding:
                "30px",
              boxShadow:
                "0 30px 80px rgba(0,0,0,.25)",
              position:
                "relative",
            }}
          >
            {/* Закрыть */}

            <button
              type="button"
              onClick={closeModal}
              disabled={loading}
              aria-label="Закрыть"
              style={{
                position:
                  "absolute",
                top: "16px",
                right: "16px",
                width: "40px",
                height: "40px",
                borderRadius:
                  "50%",
                border:
                  "1px solid #e5e7eb",
                background:
                  "#ffffff",
                fontSize:
                  "22px",
                cursor:
                  loading
                    ? "not-allowed"
                    : "pointer",
              }}
            >
              ×
            </button>

            {/* Заголовок */}

            <h2
              style={{
                margin:
                  "0 50px 10px 0",
                fontSize:
                  "30px",
                color:
                  "#111827",
              }}
            >
              Заказать звонок
            </h2>

            <p
              style={{
                margin:
                  "0 0 24px",
                color:
                  "#64748b",
                lineHeight:
                  1.6,
              }}
            >
              Оставьте свои
              контакты, и менеджер
              свяжется с вами.
            </p>

            {/* Успех */}

            {success ? (
              <div
                style={{
                  background:
                    "#dcfce7",
                  color:
                    "#166534",
                  padding:
                    "20px",
                  borderRadius:
                    "16px",
                  lineHeight:
                    1.6,
                }}
              >
                <strong>
                  Заявка отправлена.
                </strong>
                <br />
                Менеджер свяжется
                с вами в ближайшее
                время.
              </div>
            ) : (
              <form
                onSubmit={
                  handleSubmit
                }
              >
                {/* Ошибка */}

                {error && (
                  <div
                    style={{
                      background:
                        "#fee2e2",
                      color:
                        "#991b1b",
                      padding:
                        "14px 16px",
                      borderRadius:
                        "12px",
                      marginBottom:
                        "18px",
                    }}
                  >
                    {error}
                  </div>
                )}

                {/* Имя */}

                <div
                  style={{
                    marginBottom:
                      "16px",
                  }}
                >
                  <label
                    style={
                      labelStyle
                    }
                  >
                    Ваше имя
                  </label>

                  <input
                    required
                    value={name}
                    onChange={(e) =>
                      setName(
                        e.target.value
                      )
                    }
                    placeholder="Иван"
                    style={
                      inputStyle
                    }
                  />
                </div>

                {/* Телефон */}

                <div
                  style={{
                    marginBottom:
                      "16px",
                  }}
                >
                  <label
                    style={
                      labelStyle
                    }
                  >
                    Телефон
                  </label>

                  <input
                    required
                    value={phone}
                    onChange={(e) =>
                      setPhone(
                        e.target.value
                      )
                    }
                    placeholder="+7 (999) 123-45-67"
                    type="tel"
                    style={
                      inputStyle
                    }
                  />
                </div>

                {/* Комментарий */}

                <div
                  style={{
                    marginBottom:
                      "20px",
                  }}
                >
                  <label
                    style={
                      labelStyle
                    }
                  >
                    Комментарий
                  </label>

                  <textarea
                    value={comment}
                    onChange={(e) =>
                      setComment(
                        e.target.value
                      )
                    }
                    placeholder="Когда удобно позвонить?"
                    rows={4}
                    style={{
                      ...inputStyle,
                      resize:
                        "vertical",
                      minHeight:
                        "110px",
                    }}
                  />
                </div>

                {/* Отправить */}

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width:
                      "100%",
                    border: "none",
                    borderRadius:
                      "14px",
                    padding:
                      "16px 20px",
                    background:
                      loading
                        ? "#fca5a5"
                        : "#ef4444",
                    color:
                      "#ffffff",
                    fontSize:
                      "16px",
                    fontWeight:
                      700,
                    cursor:
                      loading
                        ? "not-allowed"
                        : "pointer",
                  }}
                >
                  {loading
                    ? "Отправляем..."
                    : "Отправить заявку"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  marginBottom: "7px",
  color: "#111827",
  fontSize: "14px",
  fontWeight: 600,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: "14px 15px",
  border:
    "1px solid #dbe3ec",
  borderRadius: "12px",
  background: "#ffffff",
  color: "#111827",
  fontSize: "15px",
  outline: "none",
};