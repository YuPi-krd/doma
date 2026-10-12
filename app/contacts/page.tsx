"use client";

import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://doma-nq4u.onrender.com";

type TeamMember = {
  name: string;
  position: string;
  phone: string;
  email: string;
  photo: string;
  visible: boolean;
};

const DEFAULT_TEAM: TeamMember[] = Array.from({ length: 6 }, (_, index) => ({
  name: "Имя Фамилия",
  position: ["Руководитель отдела", "Менеджер по недвижимости", "Специалист по новостройкам", "Юрист по сделкам", "Ипотечный специалист", "Менеджер по работе с клиентами"][index],
  phone: "+7 (900) 000-00-00",
  email: "info@doma.ru",
  photo: "",
  visible: true,
}));

export default function ContactsPage() {
  const [team, setTeam] = useState<TeamMember[]>(DEFAULT_TEAM);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetch(`${API_URL}/site-settings`, { cache: "no-store" })
      .then((response) => {
        if (!response.ok) throw new Error("Не удалось загрузить контакты");
        return response.json();
      })
      .then((data) => {
        if (!active) return;
        const members = Array.isArray(data.team_members) ? data.team_members : DEFAULT_TEAM;
        setTeam(members.slice(0, 6));
      })
      .catch(() => {
        if (active) setTeam(DEFAULT_TEAM);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  const visibleTeam = team.filter((person) => person.visible !== false);

  return (
    <main style={{ minHeight: "100vh", background: "#f3f4f6", color: "#111827" }}>
      <section style={{ background: "linear-gradient(110deg, #2d9ed0 0%, #7b70b5 45%, #f04e49 100%)", color: "#fff", padding: "54px 24px 82px", borderRadius: "0 0 28px 28px" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto" }}>
          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: ".12em", opacity: .9 }}>DOMA · АГЕНТСТВО НЕДВИЖИМОСТИ</div>
          <h1 style={{ fontSize: "clamp(36px, 5vw, 56px)", lineHeight: 1.05, margin: "18px 0 12px", fontWeight: 800 }}>Контакты</h1>
          <p style={{ fontSize: 18, margin: 0, maxWidth: 600 }}>Познакомьтесь с командой DOMA — мы поможем найти, купить или продать недвижимость.</p>
        </div>
      </section>

      <section style={{ maxWidth: 1240, margin: "-34px auto 0", padding: "0 24px 64px", position: "relative" }}>
        <div style={{ background: "#fff", borderRadius: 24, padding: 24, boxShadow: "0 12px 40px rgba(15,23,42,.08)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", gap: 16, flexWrap: "wrap", marginBottom: 24 }}>
            <div>
              <h2 style={{ fontSize: 28, margin: 0, fontWeight: 800 }}>Наша команда</h2>
              <p style={{ color: "#64748b", margin: "8px 0 0" }}>Специалисты, которые сопровождают клиентов на каждом этапе сделки.</p>
            </div>
            <span style={{ color: "#64748b", fontSize: 14 }}>{visibleTeam.length} специалистов</span>
          </div>

          {loading ? (
            <p style={{ color: "#64748b" }}>Загружаем команду…</p>
          ) : (
            <div className="doma-team-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 20 }}>
              {visibleTeam.map((person, index) => (
                <article key={`${person.name}-${index}`} style={{ border: "1px solid #e5e7eb", borderRadius: 20, overflow: "hidden", background: "#fff", boxShadow: "0 5px 18px rgba(15,23,42,.04)" }}>
                  <div style={{ height: 230, background: person.photo ? `center / cover no-repeat url("${person.photo}")` : "linear-gradient(135deg, #e2e8f0, #f8fafc)", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", fontSize: 64, fontWeight: 800 }}>
                    {!person.photo && (person.name?.trim()?.[0] || "D")}
                  </div>
                  <div style={{ padding: 20 }}>
                    <h3 style={{ fontSize: 20, margin: "0 0 6px", fontWeight: 800 }}>{person.name || "Сотрудник DOMA"}</h3>
                    <p style={{ margin: "0 0 18px", color: "#64748b", minHeight: 40 }}>{person.position}</p>
                    {person.phone && <a href={`tel:${person.phone.replace(/[^\d+]/g, "")}`} style={{ display: "block", color: "#111827", textDecoration: "none", fontWeight: 700, marginBottom: 8 }}>{person.phone}</a>}
                    {person.email && <a href={`mailto:${person.email}`} style={{ display: "block", color: "#64748b", textDecoration: "none", fontSize: 14, overflowWrap: "anywhere" }}>{person.email}</a>}
                    {person.phone && <a href={`tel:${person.phone.replace(/[^\d+]/g, "")}`} style={{ display: "block", textAlign: "center", marginTop: 18, borderRadius: 999, padding: "12px 16px", background: "#ef4444", color: "#fff", textDecoration: "none", fontWeight: 700 }}>Связаться</a>}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
      <style jsx>{`
        @media (max-width: 900px) { .doma-team-grid { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; } }
        @media (max-width: 580px) { .doma-team-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </main>
  );
}
