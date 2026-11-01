"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ||
  "https://doma-nq4u.onrender.com"
).replace(/\/+$/, "");

type SectionKind = "services" | "about";

type PromotionLeadFormProps = {
  section: SectionKind;
  heading?: string;
  description?: string;
};

export default function PromotionLeadForm({
  section,
  heading = "Оставить заявку",
  description = "Оставьте контакты — специалист DOMA свяжется с вами.",
}: PromotionLeadFormProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [promotion, setPromotion] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const sectionLabel = section === "services" ? "Услуги" : "О компании";

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requestedSource = params.get("source");
    const requestedPromotion = params.get("promo");

    if (requestedSource === section && requestedPromotion?.trim()) {
      setPromotion(requestedPromotion.trim().slice(0, 180));
    } else {
      setPromotion(section === "services" ? "Общая заявка со страницы услуг" : "Общая заявка со страницы «О компании»");
    }
  }, [section]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    const cleanName = name.trim();
    const cleanPhone = phone.trim();

    if (cleanName.length < 2) {
      setError("Укажите имя (не менее 2 символов).");
      setSubmitting(false);
      return;
    }
    if (cleanPhone.length < 6) {
      setError("Укажите корректный номер телефона.");
      setSubmitting(false);
      return;
    }

    const sourceComment =
      `Источник заявки: раздел «${sectionLabel}». Акция/карточка: «${promotion || "Общая заявка"}».`;
    const fullComment = message.trim()
      ? `${sourceComment}\nКомментарий клиента: ${message.trim()}`
      : sourceComment;

    try {
      const response = await fetch(`${API_URL}/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          property_id: null,
          name: cleanName,
          phone: cleanPhone,
          comment: fullComment,
        }),
        cache: "no-store",
      });

      const raw = await response.text();
      let data: { detail?: string; id?: number; status?: string } = {};
      if (raw) {
        try {
          data = JSON.parse(raw);
        } catch {
          data = { detail: raw };
        }
      }

      if (!response.ok) {
        throw new Error(data.detail || `Не удалось отправить заявку (HTTP ${response.status}).`);
      }

      setSuccess(
        data.id
          ? `Заявка №${data.id} отправлена. Мы скоро свяжемся с вами.`
          : "Заявка отправлена. Мы скоро свяжемся с вами.",
      );
      setName("");
      setPhone("");
      setMessage("");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Не удалось отправить заявку. Попробуйте ещё раз.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section
      aria-labelledby={`doma-lead-${section}-title`}
      style={{
        width: "100%",
        maxWidth: 760,
        margin: "48px auto",
        padding: "clamp(22px, 4vw, 38px)",
        boxSizing: "border-box",
        borderRadius: 24,
        border: "1px solid #e5eaf0",
        background: "#fff",
        boxShadow: "0 16px 40px rgba(15,23,42,.06)",
      }}
    >
      <div style={{ color: "#ef4444", fontSize: 12, fontWeight: 800, letterSpacing: ".12em", textTransform: "uppercase", marginBottom: 9 }}>
        DOMA · {sectionLabel}
      </div>
      <h2 id={`doma-lead-${section}-title`} style={{ margin: "0 0 10px", color: "#111827", fontSize: "clamp(24px, 3vw, 32px)", lineHeight: 1.1 }}>
        {heading}
      </h2>
      <p style={{ color: "#64748b", lineHeight: 1.6, margin: "0 0 22px" }}>
        {description}
      </p>

      {promotion && (
        <div style={{ padding: "10px 13px", marginBottom: 18, borderRadius: 12, background: "#fff5f5", color: "#9f3035", fontSize: 13 }}>
          Заявка по теме: <strong>{promotion}</strong>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 14 }}>
        <label style={{ display: "grid", gap: 7, color: "#334155", fontSize: 13, fontWeight: 700 }}>
          Ваше имя
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            autoComplete="name"
            minLength={2}
            maxLength={120}
            required
            placeholder="Как к вам обращаться?"
            style={{ width: "100%", boxSizing: "border-box", border: "1px solid #d9e0e8", borderRadius: 12, padding: "13px 15px", fontSize: 15, color: "#111827", outlineColor: "#ef4444" }}
          />
        </label>

        <label style={{ display: "grid", gap: 7, color: "#334155", fontSize: 13, fontWeight: 700 }}>
          Телефон
          <input
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            type="tel"
            autoComplete="tel"
            minLength={6}
            maxLength={32}
            required
            placeholder="+7 (___) ___-__-__"
            style={{ width: "100%", boxSizing: "border-box", border: "1px solid #d9e0e8", borderRadius: 12, padding: "13px 15px", fontSize: 15, color: "#111827", outlineColor: "#ef4444" }}
          />
        </label>

        <label style={{ display: "grid", gap: 7, color: "#334155", fontSize: 13, fontWeight: 700 }}>
          Комментарий
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            maxLength={1500}
            rows={3}
            placeholder="Что вас интересует? (необязательно)"
            style={{ width: "100%", boxSizing: "border-box", border: "1px solid #d9e0e8", borderRadius: 12, padding: "13px 15px", fontSize: 15, color: "#111827", resize: "vertical", outlineColor: "#ef4444" }}
          />
        </label>

        {error && <div role="alert" style={{ color: "#b42318", background: "#fff1f0", borderRadius: 10, padding: 12, fontSize: 13 }}>{error}</div>}
        {success && <div role="status" style={{ color: "#166534", background: "#f0fdf4", borderRadius: 10, padding: 12, fontSize: 13 }}>{success}</div>}

        <button
          type="submit"
          disabled={submitting}
          style={{ border: 0, borderRadius: 12, padding: "14px 20px", background: submitting ? "#f18b8e" : "#ef4444", color: "#fff", fontWeight: 800, fontSize: 15, cursor: submitting ? "wait" : "pointer" }}
        >
          {submitting ? "Отправляем…" : "Отправить заявку"}
        </button>
        <p style={{ margin: 0, color: "#94a3b8", fontSize: 11, lineHeight: 1.5 }}>
          Нажимая кнопку, вы соглашаетесь на обработку указанных контактных данных для связи по заявке.
        </p>
      </form>
    </section>
  );
}
