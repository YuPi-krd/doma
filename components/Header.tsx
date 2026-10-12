"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import CallbackModal from "@/components/CallbackModal";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://doma-nq4u.onrender.com";

type MenuCard = { title: string; description?: string; image: string; href: string };
type SiteContent = { menu_services: MenuCard[]; menu_about: MenuCard[] };

const DEFAULT_SERVICES: MenuCard[] = [
  { title: "Подбор недвижимости", description: "Подберём подходящие объекты", image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=900&q=80", href: "/services" },
  { title: "Ипотека", description: "Помощь с ипотекой", image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=900&q=80", href: "/services" },
  { title: "Оценка", description: "Оценим рыночную стоимость", image: "https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?auto=format&fit=crop&w=900&q=80", href: "/services" },
  { title: "Продать объект", description: "Сопровождение продажи", image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=900&q=80", href: "/services" },
  { title: "Юридические услуги", description: "Безопасность сделки", image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=900&q=80", href: "/services" },
  { title: "Дизайн и ремонт недвижимости", description: "Подготовка пространства", image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=900&q=80", href: "/services" },
];
const DEFAULT_ABOUT: MenuCard[] = [
  { title: "История компании", description: "Знакомство с DOMA", image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=900&q=80", href: "/about" },
  { title: "Специалисты по недвижимости", description: "Наша команда", image: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=900&q=80", href: "/about" },
  { title: "Блог", description: "Новости и советы", image: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=900&q=80", href: "/about" },
  { title: "Карьера", description: "Работа в DOMA", image: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=80", href: "/about" },
  { title: "Региональное партнёрство", description: "Развиваемся вместе", image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=900&q=80", href: "/about" },
  { title: "Служба заботы", description: "Помогаем клиентам", image: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=900&q=80", href: "/contacts" },
];

export default function Header() {
  const pathname = usePathname();
  const [openMenu, setOpenMenu] = useState<"property" | "services" | "about" | null>(null);
  const [content, setContent] = useState<SiteContent>({
    menu_services: DEFAULT_SERVICES,
    menu_about: DEFAULT_ABOUT,
  });

  useEffect(() => {
    let active = true;
    fetch(`${API_URL}/site-settings`, { cache: "no-store" })
      .then((response) => {
        if (!response.ok) throw new Error("Не удалось загрузить меню");
        return response.json();
      })
      .then((data) => {
        if (!active) return;
        setContent({
          menu_services: Array.isArray(data.menu_services) ? data.menu_services : DEFAULT_SERVICES,
          menu_about: Array.isArray(data.menu_about) ? data.menu_about : DEFAULT_ABOUT,
        });
      })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  const hideHeader = pathname === "/login" || pathname === "/admin" || pathname.startsWith("/admin/");
  if (hideHeader) return null;

  const propertyCategories: MenuCard[] = [
    { title: "Квартиры", description: "", image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1000&q=85", href: "/catalog?type=apartment" },
    { title: "Квартиры в новостройке", description: "", image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1000&q=85", href: "/catalog?type=new_building" },
    { title: "Дома", description: "", image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=85", href: "/catalog?type=house" },
    { title: "Земельные участки", description: "", image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1000&q=85", href: "/catalog?type=land" },
    { title: "Коммерческая", description: "", image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1000&q=85", href: "/catalog?type=commercial" },
    { title: "Гаражи", description: "", image: "https://images.unsplash.com/photo-1625047509248-ec889cbff17f?auto=format&fit=crop&w=1000&q=85", href: "/catalog?type=garage" },
  ];
  const menuItems = openMenu === "property" ? propertyCategories : openMenu === "services" ? content.menu_services : content.menu_about;
  const menuTitle = openMenu === "property" ? "Недвижимость" : openMenu === "services" ? "Услуги" : "О компании";
  const columns = openMenu === "about" ? 4 : 3;

  return (
    <>
      <header style={{ height: 80, background: "#fff", borderBottom: "1px solid #e5e7eb", position: "sticky", top: 0, zIndex: 1000 }}>
        <div className="doma-header-inner" style={{ maxWidth: 1400, margin: "0 auto", height: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 30px", gap: 30 }}>
          <Link href="/" onClick={() => setOpenMenu(null)} style={{ fontSize: 40, fontWeight: 800, textDecoration: "none", color: "#111827", letterSpacing: "-2px", flexShrink: 0 }}>
            DO<span style={{ color: "#ef4444" }}>MA</span>
          </Link>
          <nav className="doma-nav" style={{ display: "flex", gap: 32, alignItems: "center", height: "100%", flex: 1 }}>
            {([
              ["property", "Недвижимость"],
              ["services", "Услуги"],
              ["about", "О компании"],
            ] as const).map(([key, label]) => (
              <div key={key} style={{ height: "100%", display: "flex", alignItems: "center" }} onMouseEnter={() => setOpenMenu(key)}>
                <button type="button" onClick={() => setOpenMenu(openMenu === key ? null : key)} style={{ border: 0, background: "transparent", color: "#111827", fontWeight: 500, fontSize: 16, cursor: "pointer", padding: "15px 0", whiteSpace: "nowrap" }}>
                  {label}
                </button>
              </div>
            ))}
            <Link href="/contacts" onMouseEnter={() => setOpenMenu(null)} onClick={() => setOpenMenu(null)} style={{ textDecoration: "none", color: "#111827", fontWeight: 500, fontSize: 16, whiteSpace: "nowrap" }}>Контакты</Link>
          </nav>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
            <button type="button" aria-label="Избранное" style={{ width: 48, height: 48, borderRadius: 12, border: "1px solid #e5e7eb", background: "#fff", cursor: "pointer", fontSize: 20 }}>♡</button>
            <CallbackModal />
          </div>
        </div>
      </header>

      {openMenu && (
        <>
          <button aria-label="Закрыть меню" onClick={() => setOpenMenu(null)} style={{ position: "fixed", inset: "80px 0 0", background: "rgba(20,22,26,.55)", border: 0, zIndex: 999, width: "100%", height: "calc(100vh - 80px)" }} />
          <section onMouseLeave={() => setOpenMenu(null)} style={{ position: "fixed", top: 92, left: "50%", transform: "translateX(-50%)", width: "calc(100vw - 40px)", maxWidth: 1240, maxHeight: "calc(100vh - 115px)", overflowY: "auto", background: "#fff", borderRadius: 26, padding: 24, boxShadow: "0 25px 70px rgba(0,0,0,.18)", zIndex: 1002 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <strong style={{ fontSize: 18, color: "#5f6671" }}>{menuTitle}</strong>
              <span style={{ fontSize: 14, color: "#7a818c" }}>{openMenu === "property" ? "Категории" : "Разделы"}</span>
              <button onClick={() => setOpenMenu(null)} aria-label="Закрыть" style={{ marginLeft: "auto", border: 0, background: "#f1f5f9", borderRadius: 99, width: 34, height: 34, cursor: "pointer" }}>×</button>
            </div>
            <div className="doma-mega-grid" style={{ display: "grid", gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`, gap: 14 }}>
              {menuItems.map((item, index) => (
                <Link key={`${item.title}-${index}`} href={item.href || (openMenu === "services" ? "/services" : "/about")} onClick={() => setOpenMenu(null)} style={{ position: "relative", height: 160, borderRadius: 16, overflow: "hidden", textDecoration: "none", color: "#202328", background: "#eef0f4", display: "block" }}>
                  <div style={{ position: "absolute", inset: 0, backgroundImage: `url("${item.image}")`, backgroundSize: "cover", backgroundPosition: "center", filter: "grayscale(100%)", opacity: .72 }} />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(239,241,245,.97) 0%, rgba(239,241,245,.82) 35%, rgba(239,241,245,.18) 100%)" }} />
                  <div style={{ position: "absolute", top: 24, left: 24, right: 18, fontSize: 15, fontWeight: 700, zIndex: 2 }}>{item.title}</div>
                  <div style={{ position: "absolute", left: 24, bottom: 22, width: 34, height: 34, borderRadius: "50%", border: "1px solid #d5dbe2", display: "flex", alignItems: "center", justifyContent: "center", color: "#66707c", fontSize: 18, zIndex: 2, background: "rgba(255,255,255,.3)" }}>→</div>
                </Link>
              ))}
            </div>
          </section>
        </>
      )}
      <style jsx>{`
        @media (max-width: 1050px) { .doma-nav { gap: 18px !important; } .doma-nav a, .doma-nav button { font-size: 14px !important; } }
        @media (max-width: 850px) { .doma-nav { display: none !important; } .doma-header-inner { padding: 0 18px !important; } }
        @media (max-width: 650px) { .doma-mega-grid { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; } }
        @media (max-width: 450px) { .doma-mega-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </>
  );
}
