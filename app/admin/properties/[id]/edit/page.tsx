"use client";

import { useEffect, useMemo, useState, type FormEvent, type ChangeEvent, type ReactNode } from "react";
import { useParams, useRouter } from "next/navigation";

const API_URL = "https://doma-nq4u.onrender.com";

type PropertyType = "apartment" | "house" | "land" | "commercial" | "garage";
type DealType = "sale" | "rent" | "lease";
type PropertySubtype =
  | "secondary" | "new_building" | "studio" | "1_room" | "2_room" | "3_room" | "4_room" | "5_room" | "penthouse"
  | "house" | "part_of_house" | "townhouse" | "duplex" | "cottage" | "dacha"
  | "izhs" | "gardening" | "commercial_land" | "lph" | "dnp"
  | "office" | "business" | "separate_building" | "production" | "warehouse" | "retail"
  | "garage_box" | "residential_complex" | "covered_parking" | "separate_garage" | "parking";

interface PropertyResponse {
  id: number;
  title?: string | null;
  description?: string | null;
  price?: number | string | null;
  area?: number | string | null;
  rooms?: number | string | null;
  city?: string | null;
  district?: string | null;
  address?: string | null;
  public_address?: string | null;
  real_address?: string | null;
  owner_name?: string | null;
  owner_phone?: string | null;
  agent_comment?: string | null;
  is_draft?: boolean | number | string | null;
  status?: string | null;
  image_url?: string | null;
  property_type?: string | null;
  property_subtype?: string | null;
  deal_type?: string | null;
}

const propertyTypes: { value: PropertyType; label: string }[] = [
  { value: "apartment", label: "Квартира" },
  { value: "house", label: "Дом" },
  { value: "land", label: "Земельный участок" },
  { value: "commercial", label: "Коммерческая недвижимость" },
  { value: "garage", label: "Гараж / парковка" },
];

const subtypesByType: Record<PropertyType, { value: PropertySubtype; label: string }[]> = {
  apartment: [
    { value: "secondary", label: "Вторичное жильё" }, { value: "new_building", label: "Новостройка" },
    { value: "studio", label: "Студия" }, { value: "1_room", label: "1-комнатная" },
    { value: "2_room", label: "2-комнатная" }, { value: "3_room", label: "3-комнатная" },
    { value: "4_room", label: "4-комнатная" }, { value: "5_room", label: "5-комнатная" },
    { value: "penthouse", label: "Пентхаус" },
  ],
  house: [
    { value: "house", label: "Частный дом" }, { value: "part_of_house", label: "Часть дома" },
    { value: "townhouse", label: "Таунхаус" }, { value: "duplex", label: "Дуплекс" },
    { value: "cottage", label: "Коттедж" }, { value: "dacha", label: "Дача" },
  ],
  land: [
    { value: "izhs", label: "ИЖС" }, { value: "gardening", label: "Садовый участок" },
    { value: "commercial_land", label: "Земля под коммерцию" }, { value: "lph", label: "ЛПХ" },
    { value: "dnp", label: "ДНП" },
  ],
  commercial: [
    { value: "office", label: "Офис" }, { value: "business", label: "Бизнес" },
    { value: "separate_building", label: "Отдельное здание" }, { value: "production", label: "Производство" },
    { value: "warehouse", label: "Склад" }, { value: "retail", label: "Торговое помещение" },
  ],
  garage: [
    { value: "garage_box", label: "Гаражный бокс" }, { value: "residential_complex", label: "Гараж в ГСК" },
    { value: "covered_parking", label: "Крытая парковка" }, { value: "separate_garage", label: "Отдельный гараж" },
    { value: "parking", label: "Парковочное место" },
  ],
};

const dealTypes: { value: DealType; label: string }[] = [
  { value: "sale", label: "Продажа" }, { value: "rent", label: "Аренда" }, { value: "lease", label: "Сдача в аренду" },
];
const categorySlugs: Record<PropertyType, string> = {
  apartment: "apartments", house: "houses", land: "land", commercial: "commercial", garage: "garages",
};

function normalizePropertyType(value?: string | null): PropertyType {
  if (value === "house" || value === "land" || value === "commercial" || value === "garage") return value;
  return "apartment";
}
function normalizeDealType(value?: string | null): DealType {
  if (value === "rent" || value === "lease") return value;
  return "sale";
}
function normalizeSubtype(type: PropertyType, value?: string | null): PropertySubtype {
  return subtypesByType[type].find((item) => item.value === value)?.value ?? subtypesByType[type][0].value;
}
function isTruthy(value: PropertyResponse["is_draft"]): boolean {
  return value === true || value === 1 || value === "1" || value === "true";
}
function imageSrc(value?: string | null): string {
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) return value;
  return `${API_URL}${value.startsWith("/") ? "" : "/"}${value}`;
}
function rubles(value: string): string {
  const number = Number(value);
  if (!Number.isFinite(number) || !value) return "Цена не указана";
  return new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(number) + " ₽";
}

const initialForm = {
  title: "", description: "", price: "", area: "", rooms: "", city: "Краснодар", district: "",
  realAddress: "", publicAddress: "", ownerName: "", ownerPhone: "", agentComment: "", status: "Свободен",
};
type FormState = typeof initialForm;

export default function EditPropertyPage() {
  const router = useRouter();
  const params = useParams<{ id: string | string[] }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [form, setForm] = useState<FormState>(initialForm);
  const [propertyType, setPropertyType] = useState<PropertyType>("apartment");
  const [propertySubtype, setPropertySubtype] = useState<PropertySubtype>("secondary");
  const [dealType, setDealType] = useState<DealType>("sale");
  const [isDraft, setIsDraft] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");

  const availableSubtypes = subtypesByType[propertyType];
  const catalogPath = useMemo(
    () => `/catalog/${dealType}/${categorySlugs[propertyType]}/${propertySubtype}`,
    [dealType, propertyType, propertySubtype],
  );

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    async function loadProperty() {
      try {
        setLoading(true);
        setError("");
        const response = await fetch(`${API_URL}/properties/${id}`, { cache: "no-store" });
        if (!response.ok) throw new Error(response.status === 404 ? "Объект не найден" : "Не удалось загрузить объект");
        const data: PropertyResponse = await response.json();
        if (cancelled) return;

        let normalizedType = normalizePropertyType(data.property_type);
        let normalizedSubtype = normalizeSubtype(normalizedType, data.property_subtype);
        // Совместимость со старыми объектами, где тип новостройки хранился в property_type.
        if (data.property_type === "new_building") {
          normalizedType = "apartment";
          normalizedSubtype = "new_building";
        }
        setPropertyType(normalizedType);
        setPropertySubtype(normalizedSubtype);
        setDealType(normalizeDealType(data.deal_type));
        setIsDraft(isTruthy(data.is_draft));
        setImageUrl(imageSrc(data.image_url));
        setForm({
          title: data.title ?? "",
          description: data.description ?? "",
          price: data.price != null ? String(data.price) : "",
          area: data.area != null ? String(data.area) : "",
          rooms: data.rooms != null ? String(data.rooms) : "",
          city: data.city || "Краснодар",
          district: data.district ?? "",
          realAddress: data.real_address ?? data.address ?? "",
          publicAddress: data.public_address ?? data.address ?? "",
          ownerName: data.owner_name ?? "",
          ownerPhone: data.owner_phone ?? "",
          agentComment: data.agent_comment ?? "",
          status: data.status || "Свободен",
        });
      } catch (cause) {
        if (!cancelled) setError(cause instanceof Error ? cause.message : "Не удалось загрузить объект");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void loadProperty();
    return () => { cancelled = true; };
  }, [id]);

  useEffect(() => {
    if (!imageFile) {
      setImagePreview("");
      return;
    }
    const url = URL.createObjectURL(imageFile);
    setImagePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  function updateField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((previous) => ({ ...previous, [field]: value }));
  }

  function changePropertyType(value: PropertyType) {
    setPropertyType(value);
    setPropertySubtype(subtypesByType[value][0].value);
    if (value === "land" || value === "commercial" || value === "garage") {
      updateField("rooms", "0");
    } else if (form.rooms === "0") {
      updateField("rooms", "1");
    }
  }

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    setImageFile(event.target.files?.[0] ?? null);
  }

  async function saveProperty(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const body = new FormData();
      const payload: Record<string, string> = {
        title: form.title.trim(), description: form.description,
        price: form.price || "0", area: form.area || "0", rooms: form.rooms || "0",
        city: form.city.trim(), district: form.district.trim(),
        // address оставляем совместимым с публичным каталогом.
        address: form.publicAddress.trim(), public_address: form.publicAddress.trim(),
        real_address: form.realAddress.trim(), owner_name: form.ownerName.trim(),
        owner_phone: form.ownerPhone.trim(), agent_comment: form.agentComment,
        status: form.status, property_type: propertyType, property_subtype: propertySubtype,
        deal_type: dealType, is_draft: String(isDraft),
      };
      Object.entries(payload).forEach(([key, value]) => body.append(key, value));
      if (imageFile) body.append("image", imageFile);

      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const headers: Record<string, string> = {};
      if (token) headers.Authorization = `Bearer ${token}`;

      const response = await fetch(`${API_URL}/properties/${id}`, {
        method: "PUT", headers, body,
      });
      const text = await response.text();
      let data: { detail?: unknown; message?: string } | null = null;
      try { data = text ? JSON.parse(text) : null; } catch { /* response may be plain text */ }
      if (!response.ok) {
        const detail = data?.detail;
        const message = typeof detail === "string"
          ? detail
          : Array.isArray(detail)
            ? detail.map((item) => typeof item === "object" && item && "msg" in item ? String(item.msg) : "Ошибка в данных").join("; ")
            : text || "Не удалось сохранить изменения";
        throw new Error(message);
      }
      setNotice("Изменения сохранены");
      router.push(`/admin/properties/${id}`);
      router.refresh();
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "Не удалось сохранить объект";
      setError(message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <main className="state-page"><div className="state-card"><span className="spinner" /><p>Загружаем карточку объекта…</p></div><style jsx>{styles}</style></main>;
  }

  if (error && !form.title) {
    return <main className="state-page"><div className="state-card"><div className="error-icon">!</div><h1>Не удалось открыть объект</h1><p className="muted">{error}</p><button className="button button-primary" onClick={() => router.back()}>Вернуться назад</button></div><style jsx>{styles}</style></main>;
  }

  return (
    <main className="page-shell">
      <div className="page-content">
        <header className="topbar">
          <div className="heading-block">
            <button type="button" className="back-link" onClick={() => router.push(`/admin/properties/${id}`)}>← К объекту</button>
            <div className="eyebrow">DOMA · CRM НЕДВИЖИМОСТИ</div>
            <h1>Редактирование объекта</h1>
            <p>Карточка объекта, публикация и внутренняя информация агентства.</p>
          </div>
          <div className="header-actions">
            <span className={`state-pill ${isDraft ? "pill-draft" : "pill-live"}`}><span className="state-dot" />{isDraft ? "Черновик" : "В публикации"}</span>
            <button type="button" className="button button-light" onClick={() => router.push(`/admin/properties/${id}`)}>Отмена</button>
          </div>
        </header>

        {error && <div className="alert alert-error" role="alert"><strong>Не удалось сохранить.</strong> {error}</div>}
        {notice && <div className="alert alert-success" role="status">{notice}</div>}

        <form onSubmit={saveProperty} className="editor-layout">
          <div className="main-column">
            <section className="panel">
              <div className="panel-heading"><div><span className="step">01</span><div><h2>Основная информация</h2><p>Данные, которые описывают объект в каталоге.</p></div></div></div>
              <div className="fields-grid">
                <Field label="Название объекта" wide required><input required value={form.title} onChange={(e) => updateField("title", e.target.value)} placeholder="Например, 2-комнатная квартира в центре" /></Field>
                <Field label="Тип сделки" required><select value={dealType} onChange={(e) => setDealType(e.target.value as DealType)}>{dealTypes.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></Field>
                <Field label="Тип недвижимости" required><select value={propertyType} onChange={(e) => changePropertyType(e.target.value as PropertyType)}>{propertyTypes.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></Field>
                <Field label="Категория / подтип" required><select value={propertySubtype} onChange={(e) => setPropertySubtype(e.target.value as PropertySubtype)}>{availableSubtypes.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></Field>
                <Field label="Цена, ₽" required><input type="number" min="0" step="1" required value={form.price} onChange={(e) => updateField("price", e.target.value)} placeholder="8500000" /></Field>
                <Field label="Площадь, м²"><input type="number" min="0" step="0.1" value={form.area} onChange={(e) => updateField("area", e.target.value)} placeholder="74.5" /></Field>
                {(propertyType === "apartment" || propertyType === "house") && <Field label="Количество комнат"><input type="number" min="0" step="1" value={form.rooms} onChange={(e) => updateField("rooms", e.target.value)} placeholder="2" /></Field>}
                <Field label="Статус объекта"><select value={form.status} onChange={(e) => updateField("status", e.target.value)}><option value="Свободен">Свободен</option><option value="Забронирован">Забронирован</option><option value="Продан">Продан</option><option value="Скрыт">Скрыт</option></select></Field>
              </div>
              <div className="catalog-route"><div className="route-icon">⌁</div><div className="route-copy"><span>Раздел каталога</span><strong>{dealTypes.find((x) => x.value === dealType)?.label} <b>›</b> {propertyTypes.find((x) => x.value === propertyType)?.label} <b>›</b> {availableSubtypes.find((x) => x.value === propertySubtype)?.label}</strong><code>{catalogPath}</code></div></div>
            </section>

            <section className="panel">
              <div className="panel-heading"><div><span className="step">02</span><div><h2>Расположение</h2><p>Разделите точный адрес для CRM и адрес для публикации.</p></div></div></div>
              <div className="fields-grid">
                <Field label="Город" required><input required value={form.city} onChange={(e) => updateField("city", e.target.value)} placeholder="Краснодар" /></Field>
                <Field label="Район"><input value={form.district} onChange={(e) => updateField("district", e.target.value)} placeholder="Центральный" /></Field>
                <Field label="Точный адрес (внутренний)" wide><input value={form.realAddress} onChange={(e) => updateField("realAddress", e.target.value)} placeholder="Улица, дом, корпус, квартира" /><small>Для работы агентства. Не показывайте клиенту, если адрес нужно скрыть.</small></Field>
                <Field label="Адрес для публикации" wide><input value={form.publicAddress} onChange={(e) => updateField("publicAddress", e.target.value)} placeholder="Например, Центр, рядом с парком" /><small>Именно это поле используется как публичный адрес объекта.</small></Field>
              </div>
            </section>

            <section className="panel">
              <div className="panel-heading"><div><span className="step">03</span><div><h2>Описание и фото</h2><p>Подготовьте объявление для клиента.</p></div></div></div>
              <Field label="Описание объекта" wide><textarea rows={7} value={form.description} onChange={(e) => updateField("description", e.target.value)} placeholder="Опишите состояние, планировку, преимущества и инфраструктуру…" /></Field>
              <div className="image-editor">
                <div className="image-preview">{imagePreview || imageUrl ? <img src={imagePreview || imageUrl} alt="Фото объекта" /> : <div className="image-empty"><span>▧</span><strong>Фото пока не добавлено</strong><small>Загрузите главное фото объекта</small></div>}</div>
                <div className="image-controls"><strong>Главное фото</strong><p>Загрузите изображение JPG, PNG или WebP. Текущее фото останется, если новый файл не выбран.</p><label className="upload-button">Выбрать изображение<input type="file" accept="image/*" onChange={handleImageChange} /></label>{imageFile && <div className="file-selected">✓ {imageFile.name}<button type="button" onClick={() => setImageFile(null)}>Убрать</button></div>}</div>
              </div>
            </section>

            <section className="panel">
              <div className="panel-heading"><div><span className="step">04</span><div><h2>Внутренняя информация</h2><p>Контакты собственника и заметки для команды.</p></div></div><span className="internal-badge">Только для CRM</span></div>
              <div className="fields-grid">
                <Field label="Имя собственника"><input value={form.ownerName} onChange={(e) => updateField("ownerName", e.target.value)} placeholder="Имя и фамилия" /></Field>
                <Field label="Телефон собственника"><input type="tel" value={form.ownerPhone} onChange={(e) => updateField("ownerPhone", e.target.value)} placeholder="+7 (___) ___-__-__" /></Field>
                <Field label="Комментарий агента" wide><textarea rows={4} value={form.agentComment} onChange={(e) => updateField("agentComment", e.target.value)} placeholder="Договорённости, особенности общения, комиссия и другие заметки…" /></Field>
              </div>
            </section>
          </div>

          <aside className="side-column">
            <section className="panel publish-panel">
              <div className="publish-top"><div><span className="side-label">ПУБЛИКАЦИЯ</span><h2>Статус объявления</h2></div><span className={`state-pill ${isDraft ? "pill-draft" : "pill-live"}`}>{isDraft ? "Черновик" : "Опубликовано"}</span></div>
              <label className="draft-switch"><span className="switch-copy"><strong>Сохранить как черновик</strong><small>Объект не должен отображаться в публичном каталоге.</small></span><input type="checkbox" checked={isDraft} onChange={(e) => setIsDraft(e.target.checked)} /><span className="switch-track" /></label>
              <div className="summary-card"><div className="summary-image">{imagePreview || imageUrl ? <img src={imagePreview || imageUrl} alt="Превью" /> : <span>DOMA</span>}</div><div className="summary-content"><span>{dealTypes.find((x) => x.value === dealType)?.label} · {propertyTypes.find((x) => x.value === propertyType)?.label}</span><strong>{form.title || "Название объекта"}</strong><b>{rubles(form.price)}</b><small>{form.city || "Город"}{form.district ? `, ${form.district} район` : ""}</small></div></div>
              <div className="check-row"><span className="check-icon">✓</span><span>Основные данные будут обновлены после сохранения.</span></div>
              <button className="button button-primary save-button" type="submit" disabled={saving}>{saving ? <><span className="button-spinner" />Сохраняем…</> : "Сохранить изменения"}</button>
              <button className="button button-light cancel-button" type="button" disabled={saving} onClick={() => router.push(`/admin/properties/${id}`)}>Отменить изменения</button>
            </section>
            <section className="tip-card"><div className="tip-icon">i</div><div><strong>Перед сохранением</strong><p>Проверьте цену, тип сделки и публичный адрес. Точный адрес, контакты собственника и заметки предназначены для внутренней работы.</p></div></section>
          </aside>
        </form>
      </div>
      <style jsx>{styles}</style>
    </main>
  );
}

function Field({ label, children, wide = false, required = false }: { label: string; children: ReactNode; wide?: boolean; required?: boolean }) {
  return <div className={`field ${wide ? "field-wide" : ""}`}><label>{label}{required && <span className="required"> *</span>}</label>{children}</div>;
}

const styles = `
  :global(*) { box-sizing: border-box; }
  .page-shell { min-height: 100vh; background: #f5f6f8; color: #20252d; padding: 34px 26px 70px; }
  .page-content { max-width: 1440px; margin: 0 auto; }
  .topbar { display:flex; justify-content:space-between; align-items:flex-end; gap:24px; margin-bottom:28px; }
  .heading-block { min-width:0; }
  .back-link { border:0; background:transparent; padding:0; margin-bottom:22px; color:#667085; font-size:13px; font-weight:650; cursor:pointer; }
  .back-link:hover { color:#b12d35; }
  .eyebrow { color:#b12d35; font-size:10px; font-weight:800; letter-spacing:1.8px; margin-bottom:9px; }
  h1 { margin:0; color:#20252d; font-size:clamp(28px,3vw,38px); line-height:1.12; letter-spacing:-1.2px; font-weight:760; }
  .heading-block p { margin:10px 0 0; color:#818895; font-size:14px; }
  .header-actions { display:flex; align-items:center; gap:12px; flex-shrink:0; }
  .state-pill { display:inline-flex; align-items:center; gap:7px; border-radius:100px; padding:8px 11px; font-size:11px; font-weight:750; white-space:nowrap; }
  .pill-live { color:#237653; background:#e6f5ed; }.pill-draft { color:#8a6118; background:#fff3d9; }
  .state-dot { width:6px; height:6px; background:currentColor; border-radius:50%; }
  .button { display:inline-flex; align-items:center; justify-content:center; gap:9px; border:0; border-radius:10px; min-height:42px; padding:0 16px; font-size:12px; font-weight:750; cursor:pointer; transition:transform .15s,background .15s; }
  .button:disabled { opacity:.65; cursor:not-allowed; }.button:not(:disabled):active { transform:translateY(1px); }
  .button-light { background:#fff; border:1px solid #e3e6eb; color:#4d5561; }.button-light:hover { background:#f9fafb; }
  .button-primary { background:#b12d35; color:white; box-shadow:0 5px 12px #b12d3520; }.button-primary:hover:not(:disabled) { background:#98242c; }
  .editor-layout { display:grid; grid-template-columns:minmax(0,1fr) 330px; align-items:start; gap:22px; }
  .main-column,.side-column { display:flex; flex-direction:column; gap:18px; min-width:0; }
  .panel { background:#fff; border:1px solid #e9ebef; border-radius:15px; padding:25px; box-shadow:0 3px 14px #22283105; }
  .panel-heading { display:flex; align-items:flex-start; justify-content:space-between; gap:15px; margin-bottom:23px; }
  .panel-heading > div { display:flex; align-items:flex-start; gap:13px; }
  .step { display:flex; align-items:center; justify-content:center; width:32px; height:32px; flex:0 0 32px; border-radius:9px; background:#fbebec; color:#b12d35; font-size:11px; font-weight:850; }
  h2 { margin:0; color:#252a33; font-size:16px; font-weight:780; letter-spacing:-.2px; }
  .panel-heading p { margin:6px 0 0; color:#9298a3; font-size:12px; line-height:1.5; }
  .fields-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:19px 16px; }
  .field { display:flex; flex-direction:column; min-width:0; }.field-wide { grid-column:1 / -1; }
  .field > label { margin-bottom:8px; color:#525a66; font-size:11px; font-weight:750; }
  .required { color:#b12d35; }
  .field :global(input:not([type=file])),.field :global(select),.field :global(textarea) { display:block; width:100%; min-width:0; border:1px solid #e1e4e9; background:#fff; color:#292e37; border-radius:8px; outline:none; padding:12px 13px; font:inherit; font-size:12px; transition:border-color .15s,box-shadow .15s; }
  .field :global(input),.field :global(select) { min-height:42px; }.field :global(textarea) { resize:vertical; line-height:1.55; min-height:110px; }
  .field :global(input:focus),.field :global(select:focus),.field :global(textarea:focus) { border-color:#bf555b; box-shadow:0 0 0 3px #b12d3510; }
  .field :global(input::placeholder),.field :global(textarea::placeholder) { color:#b0b5be; }
  .field small { margin-top:7px; color:#969ca7; font-size:10px; line-height:1.5; }
  .catalog-route { display:flex; gap:13px; align-items:center; margin-top:23px; padding:14px; border:1px solid #f0d9da; background:#fff9f9; border-radius:10px; }
  .route-icon { width:34px; height:34px; display:flex; align-items:center; justify-content:center; border-radius:9px; background:#f9e6e7; color:#b12d35; font-size:23px; }
  .route-copy { min-width:0; display:flex; flex-direction:column; gap:5px; }.route-copy > span { font-size:10px; color:#9298a3; font-weight:650; }.route-copy strong { font-size:12px; line-height:1.5; color:#454b55; }.route-copy strong b { color:#c5a0a2; padding:0 4px; }.route-copy code { color:#a5aab3; font-size:10px; overflow-wrap:anywhere; }
  .image-editor { display:grid; grid-template-columns:minmax(180px,230px) minmax(0,1fr); gap:20px; align-items:center; margin-top:20px; padding-top:20px; border-top:1px solid #f0f1f3; }
  .image-preview { overflow:hidden; width:100%; aspect-ratio:4/3; display:flex; align-items:center; justify-content:center; border:1px solid #e8eaf0; border-radius:10px; background:#f7f8fa; }
  .image-preview img,.summary-image img { width:100%; height:100%; object-fit:cover; display:block; }
  .image-empty { display:flex; flex-direction:column; align-items:center; gap:7px; padding:15px; text-align:center; color:#a1a6b0; }.image-empty span { font-size:30px; }.image-empty strong { font-size:11px; color:#6d7480; }.image-empty small { font-size:10px; }
  .image-controls > strong { font-size:12px; }.image-controls p { margin:7px 0 13px; color:#9298a3; font-size:11px; line-height:1.6; }
  .upload-button { display:inline-flex; align-items:center; justify-content:center; min-height:38px; border:1px solid #e3e5ea; border-radius:8px; padding:0 12px; color:#505762; font-size:11px; font-weight:750; cursor:pointer; }.upload-button:hover { border-color:#c5a0a2; background:#fffafa; }.upload-button :global(input) { display:none; }
  .file-selected { display:flex; align-items:center; flex-wrap:wrap; gap:10px; margin-top:10px; color:#2b7a56; font-size:10px; overflow-wrap:anywhere; }.file-selected button { border:0; background:transparent; color:#b12d35; cursor:pointer; font-weight:700; }
  .internal-badge { flex-shrink:0; border-radius:6px; padding:6px 8px; background:#f1f2f5; color:#747b87; font-size:9px; font-weight:800; text-transform:uppercase; letter-spacing:.4px; }
  .side-column { position:sticky; top:20px; }.publish-panel { padding:21px; }.publish-top { display:flex; flex-direction:column; align-items:flex-start; gap:10px; padding-bottom:18px; border-bottom:1px solid #f0f1f3; }.side-label { display:block; margin-bottom:7px; color:#a1a6b0; font-size:9px; letter-spacing:1.2px; font-weight:850; }.publish-top h2 { font-size:17px; }
  .draft-switch { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:18px 0; cursor:pointer; }.switch-copy { display:flex; flex-direction:column; gap:5px; }.switch-copy strong { font-size:11px; color:#454b55; }.switch-copy small { color:#969ca7; font-size:10px; line-height:1.5; }.draft-switch :global(input) { position:absolute; opacity:0; width:1px; height:1px; }.switch-track { position:relative; flex:0 0 35px; height:20px; border-radius:20px; background:#d9dde3; transition:background .18s; }.switch-track:after { content:""; position:absolute; top:3px; left:3px; width:14px; height:14px; border-radius:50%; background:#fff; box-shadow:0 1px 3px #0002; transition:transform .18s; }.draft-switch :global(input:checked) + .switch-track { background:#b12d35; }.draft-switch :global(input:checked) + .switch-track:after { transform:translateX(15px); }.draft-switch :global(input:focus-visible) + .switch-track { outline:3px solid #b12d3525; }
  .summary-card { overflow:hidden; border:1px solid #e9ebef; border-radius:10px; }.summary-image { display:flex; align-items:center; justify-content:center; aspect-ratio:16/9; overflow:hidden; background:#f4f5f7; color:#c0c4cc; font-size:18px; font-weight:900; letter-spacing:3px; }.summary-content { display:flex; flex-direction:column; gap:7px; padding:13px; }.summary-content span { color:#9298a3; font-size:9px; }.summary-content strong { color:#343a44; font-size:12px; line-height:1.45; }.summary-content b { color:#b12d35; font-size:17px; }.summary-content small { color:#8c929d; font-size:10px; }
  .check-row { display:flex; align-items:flex-start; gap:9px; margin:17px 0; color:#8a909a; font-size:10px; line-height:1.6; }.check-icon { display:flex; align-items:center; justify-content:center; flex:0 0 17px; width:17px; height:17px; border-radius:50%; background:#e5f5ec; color:#2b8a60; font-size:10px; font-weight:900; }
  .save-button,.cancel-button { width:100%; min-height:45px; }.cancel-button { margin-top:9px; }.button-spinner,.spinner { width:14px; height:14px; border:2px solid #ffffff80; border-top-color:#fff; border-radius:50%; animation:spin .8s linear infinite; }.spinner { width:26px; height:26px; border-color:#e8c5c7; border-top-color:#b12d35; }.tip-card { display:flex; gap:11px; padding:16px; border:1px solid #f0e4cb; background:#fffbf2; border-radius:12px; }.tip-icon { display:flex; align-items:center; justify-content:center; flex:0 0 21px; height:21px; border-radius:50%; background:#f8e9c7; color:#9b7629; font-size:12px; font-weight:900; }.tip-card strong { color:#6e5b31; font-size:11px; }.tip-card p { margin:6px 0 0; color:#95835e; font-size:10px; line-height:1.65; }
  .alert { margin-bottom:18px; padding:13px 15px; border-radius:9px; font-size:12px; line-height:1.5; }.alert-error { border:1px solid #f3d0d2; background:#fff5f5; color:#a52b33; }.alert-success { border:1px solid #c9ead8; background:#f0fbf4; color:#27734e; }
  .state-page { min-height:100vh; display:grid; place-items:center; padding:24px; background:#f5f6f8; }.state-card { display:flex; flex-direction:column; align-items:center; gap:12px; width:min(100%,420px); padding:36px 28px; background:#fff; border:1px solid #e9ebef; border-radius:16px; text-align:center; box-shadow:0 8px 30px #20252d08; }.state-card p { margin:0; color:#818895; font-size:13px; }.state-card h1 { font-size:23px; letter-spacing:-.5px; }.state-card .muted { overflow-wrap:anywhere; }.error-icon { display:grid; place-items:center; width:38px; height:38px; border-radius:50%; background:#fff0f0; color:#b12d35; font-weight:900; }
  @keyframes spin { to { transform:rotate(360deg); } }
  @media(max-width:1050px) { .editor-layout { grid-template-columns:minmax(0,1fr) 290px; gap:16px; }.panel { padding:20px; }.publish-panel { padding:18px; } }
  @media(max-width:800px) { .page-shell { padding:24px 16px 45px; }.editor-layout { grid-template-columns:1fr; }.side-column { position:static; grid-row:1; }.publish-panel { display:grid; grid-template-columns:1fr 1fr; column-gap:16px; }.publish-top,.draft-switch { grid-column:1/-1; }.summary-card { align-self:start; }.check-row { align-self:center; }.save-button,.cancel-button { grid-column:1/-1; }.tip-card { grid-column:1/-1; } }
  @media(max-width:560px) { .topbar { align-items:flex-start; flex-direction:column; }.header-actions { width:100%; justify-content:space-between; }.fields-grid { grid-template-columns:1fr; }.field-wide { grid-column:auto; }.panel { padding:17px; }.image-editor { grid-template-columns:1fr; }.image-preview { max-width:360px; }.publish-panel { display:flex; flex-direction:column; }.publish-top { width:100%; }.summary-card { width:100%; }.header-actions .button { flex:1; }.route-copy strong { font-size:11px; } }
`;
