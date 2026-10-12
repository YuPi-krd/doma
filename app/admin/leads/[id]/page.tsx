"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://doma-nq4u.onrender.com";

type Lead = {
  id: number;
  property_id: number | null;
  name: string;
  phone: string;
  comment: string | null;
  status: string;
  created_at?: string | null;
};

const buttonStyle: React.CSSProperties = {
  border: 0, borderRadius: 10, padding: "12px 18px", color: "white",
  fontWeight: 700, cursor: "pointer", textDecoration: "none", display: "inline-flex",
  alignItems: "center", justifyContent: "center", gap: 8,
};

export default function LeadDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const leadId = params?.id;
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const loadLead = useCallback(async () => {
    if (!leadId) return;
    try {
      setLoading(true);
      setError("");
      const response = await fetch(`${API_URL}/leads/${leadId}`, { cache: "no-store" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.detail || "Не удалось загрузить заявку.");
      setLead(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка загрузки заявки.");
    } finally {
      setLoading(false);
    }
  }, [leadId]);

  useEffect(() => { void loadLead(); }, [loadLead]);

  async function closeLead() {
    if (!lead || busy) return;
    try {
      setBusy(true);
      const response = await fetch(`${API_URL}/leads/${lead.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Закрыта" }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.detail || "Не удалось закрыть заявку.");
      setLead({ ...lead, status: "Закрыта" });
    } catch (err) {
      alert(err instanceof Error ? err.message : "Ошибка закрытия заявки.");
    } finally {
      setBusy(false);
    }
  }

  async function deleteLead() {
    if (!lead || busy) return;
    if (!window.confirm(`Удалить заявку №${lead.id}? Это действие нельзя отменить.`)) return;
    try {
      setBusy(true);
      const response = await fetch(`${API_URL}/leads/${lead.id}`, { method: "DELETE" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.detail || "Не удалось удалить заявку.");
      router.push("/admin/leads");
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Ошибка удаления заявки.");
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <main style={{ padding: 40, background: "#f1f5f9", minHeight: "100vh" }}>Загрузка заявки…</main>;
  if (error || !lead) return (
    <main style={{ padding: 40, background: "#f1f5f9", minHeight: "100vh" }}>
      <div style={{ maxWidth: 900, margin: "0 auto", background: "white", borderRadius: 18, padding: 28 }}>
        <h1 style={{ marginTop: 0 }}>Заявка не найдена</h1>
        <p style={{ color: "#dc2626" }}>{error || "Заявка отсутствует или была удалена."}</p>
        <Link href="/admin/leads" style={{ ...buttonStyle, background: "#64748b" }}>← К списку заявок</Link>
      </div>
    </main>
  );

  return (
    <main style={{ minHeight: "100vh", background: "#f1f5f9", padding: "40px 24px", color: "#111827" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <section style={{ background: "#fff", borderRadius: 22, padding: 28, boxShadow: "0 8px 28px rgba(15,23,42,.06)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
          <div>
            <div style={{ color: "#64748b", fontSize: 14, marginBottom: 8 }}>Заявка №{lead.id}</div>
            <h1 style={{ margin: 0, fontSize: 32, fontWeight: 800 }}>📞 {lead.name || "Без имени"}</h1>
            <a href={`tel:${lead.phone}`} style={{ display: "inline-block", marginTop: 12, color: "#111827", fontWeight: 700, textDecoration: "none" }}>{lead.phone}</a>
          </div>
          <span style={{ background: lead.status === "Закрыта" ? "#dcfce7" : "#dbeafe", color: lead.status === "Закрыта" ? "#166534" : "#1d4ed8", borderRadius: 999, padding: "10px 16px", fontWeight: 700 }}>{lead.status || "Новая"}</span>
        </section>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 16, marginTop: 18 }}>
          <section style={{ background: "#fff", borderRadius: 18, padding: 22, boxShadow: "0 8px 28px rgba(15,23,42,.05)" }}>
            <div style={{ color: "#64748b", fontSize: 14 }}>👤 Клиент</div><strong style={{ display: "block", marginTop: 8, fontSize: 18 }}>{lead.name || "Не указан"}</strong>
          </section>
          <section style={{ background: "#fff", borderRadius: 18, padding: 22, boxShadow: "0 8px 28px rgba(15,23,42,.05)" }}>
            <div style={{ color: "#64748b", fontSize: 14 }}>📞 Телефон</div><strong style={{ display: "block", marginTop: 8, fontSize: 18 }}>{lead.phone || "Не указан"}</strong>
          </section>
          <section style={{ background: "#fff", borderRadius: 18, padding: 22, boxShadow: "0 8px 28px rgba(15,23,42,.05)" }}>
            <div style={{ color: "#64748b", fontSize: 14 }}>🏠 Объект</div>
            {lead.property_id ? <Link href={`/crm/property/${lead.property_id}`} style={{ display: "inline-block", marginTop: 8, color: "#2563eb", fontWeight: 800 }}>ID {lead.property_id}</Link> : <strong style={{ display: "block", marginTop: 8 }}>Не привязан</strong>}
          </section>
        </div>

        <section style={{ background: "#fff", borderRadius: 18, padding: 24, marginTop: 18, boxShadow: "0 8px 28px rgba(15,23,42,.05)" }}>
          <h2 style={{ margin: "0 0 12px", fontSize: 18 }}>📝 Комментарий клиента</h2>
          <p style={{ margin: 0, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{lead.comment || "Комментарий не оставлен."}</p>
        </section>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 18 }}>
          {lead.status !== "Закрыта" && <button type="button" onClick={closeLead} disabled={busy} style={{ ...buttonStyle, background: "#16a34a", opacity: busy ? .65 : 1 }}>✓ Закрыть заявку</button>}
          {lead.property_id && <Link href={`/crm/property/${lead.property_id}`} style={{ ...buttonStyle, background: "#2563eb" }}>🏠 Открыть объект</Link>}
          <Link href="/admin/clients" style={{ ...buttonStyle, background: "#16a34a" }}>👥 Клиенты</Link>
          <button type="button" onClick={deleteLead} disabled={busy} style={{ ...buttonStyle, background: "#dc2626", opacity: busy ? .65 : 1 }}>{busy ? "Выполняется…" : "🗑 Удалить заявку"}</button>
          <Link href="/admin/leads" style={{ ...buttonStyle, background: "#64748b" }}>← Назад</Link>
        </div>
      </div>
    </main>
  );
}
