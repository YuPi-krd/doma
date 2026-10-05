"use client";

import { useEffect, useState } from "react";
import type { ChangeEvent, CSSProperties } from "react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://doma-nq4u.onrender.com";

type SiteSettings = {
  hero_eyebrow: string;
  hero_title_line1: string;
  hero_title_line2: string;
  hero_title_line3: string;
  hero_description: string;
  hero_image: string | null;
  stat1_value: string;
  stat1_label: string;
  stat2_value: string;
  stat2_label: string;
  stat3_value: string;
  stat3_label: string;
};

const DEFAULT_SETTINGS: SiteSettings = {
  hero_eyebrow: "НЕДВИЖИМОСТЬ • КРАСНОДАР",
  hero_title_line1: "Найдём место,",
  hero_title_line2: "которое станет",
  hero_title_line3: "домом",
  hero_description:
    "Покупка, продажа и аренда недвижимости в Краснодаре. Полное сопровождение сделки и персональный подход к каждому клиенту.",
  hero_image: null,
  stat1_value: "500+",
  stat1_label: "Объектов",
  stat2_value: "150+",
  stat2_label: "Сделок",
  stat3_value: "98%",
  stat3_label: "Довольных клиентов",
};

async function imageToDataUrl(file: File): Promise<string> {
  const reader = new FileReader();

  const source = await new Promise<string>((resolve, reject) => {
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Не удалось прочитать изображение."));
    reader.readAsDataURL(file);
  });

  const image = new Image();

  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error("Не удалось обработать изображение."));
    image.src = source;
  });

  const maxWidth = 2200;
  const maxHeight = 1200;
  const ratio = Math.min(
    1,
    maxWidth / image.naturalWidth,
    maxHeight / image.naturalHeight,
  );

  const width = Math.max(1, Math.round(image.naturalWidth * ratio));
  const height = Math.max(1, Math.round(image.naturalHeight * ratio));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Браузер не поддерживает обработку изображения.");
  }

  context.drawImage(image, 0, 0, width, height);

  return canvas.toDataURL("image/jpeg", 0.84);
}

function getToken() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("token") ?? "";
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label style={fieldWrapStyle}>
      <span style={labelStyle}>{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        style={inputStyle}
      />
    </label>
  );
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadSettings() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_URL}/site-settings`, {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Не удалось загрузить настройки сайта.");
        }

        const data = await response.json();

        if (!cancelled) {
          setSettings({
            ...DEFAULT_SETTINGS,
            ...data,
          });
        }
      } catch (requestError) {
        if (!cancelled) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Ошибка загрузки настроек.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadSettings();

    return () => {
      cancelled = true;
    };
  }, []);

  function updateField<K extends keyof SiteSettings>(
    field: K,
    value: SiteSettings[K],
  ) {
    setSettings((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleImageChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Можно загружать только изображения.");
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setError("Исходное изображение слишком большое. Максимум — 8 МБ.");
      return;
    }

    try {
      setError("");
      const dataUrl = await imageToDataUrl(file);
      updateField("hero_image", dataUrl);
      setMessage("Новое изображение добавлено. Нажмите «Сохранить изменения».");
    } catch (imageError) {
      setError(
        imageError instanceof Error
          ? imageError.message
          : "Не удалось обработать изображение.",
      );
    }
  }

  async function saveSettings() {
    try {
      setSaving(true);
      setError("");
      setMessage("");

      const token = getToken();
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`${API_URL}/site-settings`, {
        method: "PUT",
        headers,
        body: JSON.stringify(settings),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.detail || "Не удалось сохранить настройки.",
        );
      }

      if (data?.settings) {
        setSettings({
          ...DEFAULT_SETTINGS,
          ...data.settings,
        });
      }

      setMessage("Изменения сохранены. Обновите главную страницу, чтобы увидеть результат.");
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Ошибка сохранения.",
      );
    } finally {
      setSaving(false);
    }
  }

  function resetSettings() {
    setSettings(DEFAULT_SETTINGS);
    setMessage("Поля сброшены до стандартных значений. Нажмите «Сохранить изменения», чтобы применить их.");
    setError("");
  }

  const previewBackground = settings.hero_image
    ? `linear-gradient(rgba(0,0,0,.38), rgba(0,0,0,.38)), url(${settings.hero_image})`
    : "linear-gradient(120deg, #7d574b, #d99053)";

  return (
    <main style={pageStyle}>
      <div style={containerStyle}>
        <div style={topbarStyle}>
          <div>
            <div style={eyebrowStyle}>DOMA · АДМИН-ПАНЕЛЬ</div>
            <h1 style={pageTitleStyle}>Настройки главной страницы</h1>
            <p style={subtitleStyle}>
              Управляйте фотографией, заголовком, описанием и статистикой первого экрана.
            </p>
          </div>

          <div style={actionsStyle}>
            <button type="button" onClick={resetSettings} style={secondaryButtonStyle}>
              Сбросить
            </button>
            <button
              type="button"
              onClick={saveSettings}
              disabled={saving || loading}
              style={{
                ...primaryButtonStyle,
                opacity: saving || loading ? 0.65 : 1,
              }}
            >
              {saving ? "Сохранение…" : "Сохранить изменения"}
            </button>
          </div>
        </div>

        {error && <div style={errorStyle}>{error}</div>}
        {message && <div style={successStyle}>{message}</div>}

        {loading ? (
          <div style={loadingCardStyle}>Загрузка настроек…</div>
        ) : (
          <div style={gridStyle}>
            <section style={cardStyle}>
              <div style={sectionHeaderStyle}>
                <div>
                  <div style={sectionNumberStyle}>01</div>
                  <h2 style={sectionTitleStyle}>Текст Hero-блока</h2>
                </div>
                <div style={sectionHintStyle}>Видно на главной странице</div>
              </div>

              <div style={fieldsGridStyle}>
                <InputField
                  label="Надпись над заголовком"
                  value={settings.hero_eyebrow}
                  onChange={(value) => updateField("hero_eyebrow", value)}
                />
                <InputField
                  label="Заголовок · строка 1"
                  value={settings.hero_title_line1}
                  onChange={(value) => updateField("hero_title_line1", value)}
                />
                <InputField
                  label="Заголовок · строка 2"
                  value={settings.hero_title_line2}
                  onChange={(value) => updateField("hero_title_line2", value)}
                />
                <InputField
                  label="Заголовок · строка 3"
                  value={settings.hero_title_line3}
                  onChange={(value) => updateField("hero_title_line3", value)}
                />
              </div>

              <label style={{ ...fieldWrapStyle, marginTop: 18 }}>
                <span style={labelStyle}>Описание</span>
                <textarea
                  value={settings.hero_description}
                  onChange={(event) => updateField("hero_description", event.target.value)}
                  rows={5}
                  style={textareaStyle}
                  placeholder="Короткое описание агентства"
                />
              </label>
            </section>

            <section style={cardStyle}>
              <div style={sectionHeaderStyle}>
                <div>
                  <div style={sectionNumberStyle}>02</div>
                  <h2 style={sectionTitleStyle}>Статистика</h2>
                </div>
                <div style={sectionHintStyle}>Три показателя под текстом</div>
              </div>

              <div style={statsGridStyle}>
                <div style={statEditorStyle}>
                  <InputField
                    label="Значение"
                    value={settings.stat1_value}
                    onChange={(value) => updateField("stat1_value", value)}
                  />
                  <InputField
                    label="Подпись"
                    value={settings.stat1_label}
                    onChange={(value) => updateField("stat1_label", value)}
                  />
                </div>

                <div style={statEditorStyle}>
                  <InputField
                    label="Значение"
                    value={settings.stat2_value}
                    onChange={(value) => updateField("stat2_value", value)}
                  />
                  <InputField
                    label="Подпись"
                    value={settings.stat2_label}
                    onChange={(value) => updateField("stat2_label", value)}
                  />
                </div>

                <div style={statEditorStyle}>
                  <InputField
                    label="Значение"
                    value={settings.stat3_value}
                    onChange={(value) => updateField("stat3_value", value)}
                  />
                  <InputField
                    label="Подпись"
                    value={settings.stat3_label}
                    onChange={(value) => updateField("stat3_label", value)}
                  />
                </div>
              </div>
            </section>

            <section style={{ ...cardStyle, gridColumn: "1 / -1" }}>
              <div style={sectionHeaderStyle}>
                <div>
                  <div style={sectionNumberStyle}>03</div>
                  <h2 style={sectionTitleStyle}>Фоновая фотография</h2>
                </div>
                <div style={sectionHintStyle}>Один фон на весь Hero</div>
              </div>

              <div style={imageEditorGridStyle}>
                <div>
                  <label style={uploadZoneStyle}>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleImageChange}
                      style={{ display: "none" }}
                    />
                    <div style={uploadIconStyle}>＋</div>
                    <div style={uploadTitleStyle}>Выбрать новую фотографию</div>
                    <div style={uploadHintStyle}>
                      JPG, PNG или WEBP · исходный файл до 8 МБ
                    </div>
                  </label>

                  <div style={imageMetaStyle}>
                    Изображение автоматически уменьшается перед сохранением, поэтому база не будет получать огромный исходный файл.
                  </div>
                </div>

                <div
                  style={{
                    ...previewStyle,
                    backgroundImage: previewBackground,
                  }}
                >
                  <div style={previewContentStyle}>
                    <div style={previewEyebrowStyle}>{settings.hero_eyebrow}</div>
                    <div style={previewTitleStyle}>
                      {settings.hero_title_line1}
                      <br />
                      {settings.hero_title_line2}
                      <br />
                      {settings.hero_title_line3}
                    </div>
                    <div style={previewDescriptionStyle}>{settings.hero_description}</div>

                    <div style={previewStatsStyle}>
                      <div>
                        <div style={previewStatValueStyle}>{settings.stat1_value}</div>
                        <div style={previewStatLabelStyle}>{settings.stat1_label}</div>
                      </div>
                      <div>
                        <div style={previewStatValueStyle}>{settings.stat2_value}</div>
                        <div style={previewStatLabelStyle}>{settings.stat2_label}</div>
                      </div>
                      <div>
                        <div style={previewStatValueStyle}>{settings.stat3_value}</div>
                        <div style={previewStatLabelStyle}>{settings.stat3_label}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section style={{ ...cardStyle, gridColumn: "1 / -1" }}>
              <div style={sectionHeaderStyle}>
                <div>
                  <div style={sectionNumberStyle}>04</div>
                  <h2 style={sectionTitleStyle}>Как это работает</h2>
                </div>
              </div>

              <div style={infoRowStyle}>
                <div style={infoItemStyle}>
                  <strong>1. Меняете данные здесь</strong>
                  <span>Фото и текст сохраняются в базе сайта.</span>
                </div>
                <div style={infoItemStyle}>
                  <strong>2. Главная получает настройки</strong>
                  <span>Hero-блок загружает актуальные значения с API.</span>
                </div>
                <div style={infoItemStyle}>
                  <strong>3. Старое содержимое не теряется</strong>
                  <span>До первого сохранения используются текущие тексты и текущий CSS-фон.</span>
                </div>
              </div>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}

const pageStyle: CSSProperties = {
  minHeight: "100vh",
  background: "#f1f5f9",
  padding: "36px",
  color: "#111827",
};

const containerStyle: CSSProperties = {
  maxWidth: "1500px",
  margin: "0 auto",
};

const topbarStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 24,
  alignItems: "flex-end",
  marginBottom: 24,
  flexWrap: "wrap",
};

const eyebrowStyle: CSSProperties = {
  fontSize: 12,
  fontWeight: 800,
  letterSpacing: "0.14em",
  color: "#ef4444",
  textTransform: "uppercase",
  marginBottom: 8,
};

const pageTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: "clamp(34px, 4vw, 52px)",
  lineHeight: 1,
  letterSpacing: "-0.04em",
  fontWeight: 800,
};

const subtitleStyle: CSSProperties = {
  margin: "12px 0 0",
  maxWidth: 760,
  color: "#64748b",
  fontSize: 15,
  lineHeight: 1.6,
};

const actionsStyle: CSSProperties = {
  display: "flex",
  gap: 10,
  alignItems: "center",
};

const secondaryButtonStyle: CSSProperties = {
  border: "1px solid #d8dee8",
  background: "#ffffff",
  color: "#334155",
  borderRadius: 13,
  padding: "13px 18px",
  fontWeight: 700,
  cursor: "pointer",
};

const primaryButtonStyle: CSSProperties = {
  border: "none",
  background: "#e5484d",
  color: "#ffffff",
  borderRadius: 13,
  padding: "13px 22px",
  fontWeight: 800,
  cursor: "pointer",
  boxShadow: "0 10px 24px rgba(229,72,77,.22)",
};

const cardStyle: CSSProperties = {
  background: "#ffffff",
  borderRadius: 24,
  border: "1px solid #e3e8ef",
  padding: 26,
  boxShadow: "0 16px 38px rgba(15,23,42,.055)",
};

const gridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 20,
};

const sectionHeaderStyle: CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: 18,
  marginBottom: 20,
};

const sectionNumberStyle: CSSProperties = {
  fontSize: 12,
  fontWeight: 800,
  letterSpacing: "0.14em",
  color: "#ef4444",
  marginBottom: 6,
};

const sectionTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: 24,
  lineHeight: 1.1,
  letterSpacing: "-0.025em",
};

const sectionHintStyle: CSSProperties = {
  color: "#94a3b8",
  fontSize: 13,
  paddingTop: 3,
  textAlign: "right",
};

const fieldsGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 16,
};

const statsGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: 14,
};

const statEditorStyle: CSSProperties = {
  display: "grid",
  gap: 12,
  padding: 14,
  background: "#f8fafc",
  border: "1px solid #e6ebf1",
  borderRadius: 18,
};

const fieldWrapStyle: CSSProperties = {
  display: "grid",
  gap: 7,
};

const labelStyle: CSSProperties = {
  fontSize: 12,
  fontWeight: 800,
  color: "#475569",
  letterSpacing: "0.02em",
};

const inputStyle: CSSProperties = {
  width: "100%",
  border: "1px solid #d9e0e8",
  borderRadius: 13,
  padding: "12px 14px",
  fontSize: 14,
  outline: "none",
  background: "#ffffff",
  color: "#111827",
  boxSizing: "border-box",
};

const textareaStyle: CSSProperties = {
  ...inputStyle,
  resize: "vertical",
  minHeight: 140,
  lineHeight: 1.55,
};

const imageEditorGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "0.72fr 1.28fr",
  gap: 18,
  alignItems: "stretch",
};

const uploadZoneStyle: CSSProperties = {
  minHeight: 260,
  border: "1.5px dashed #cbd5e1",
  borderRadius: 20,
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  textAlign: "center",
  background: "#f8fafc",
  cursor: "pointer",
  padding: 22,
};

const uploadIconStyle: CSSProperties = {
  width: 54,
  height: 54,
  borderRadius: 16,
  display: "grid",
  placeItems: "center",
  background: "#ffffff",
  border: "1px solid #e2e8f0",
  fontSize: 28,
  color: "#ef4444",
  marginBottom: 14,
};

const uploadTitleStyle: CSSProperties = {
  fontSize: 16,
  fontWeight: 800,
  marginBottom: 6,
};

const uploadHintStyle: CSSProperties = {
  fontSize: 12,
  color: "#64748b",
  lineHeight: 1.5,
};

const imageMetaStyle: CSSProperties = {
  marginTop: 10,
  fontSize: 12,
  color: "#64748b",
  lineHeight: 1.5,
};

const previewStyle: CSSProperties = {
  minHeight: 420,
  borderRadius: 22,
  overflow: "hidden",
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
  position: "relative",
  display: "flex",
  alignItems: "flex-end",
};

const previewContentStyle: CSSProperties = {
  padding: "38px",
  color: "#ffffff",
  width: "100%",
  textShadow: "0 2px 10px rgba(0,0,0,.28)",
};

const previewEyebrowStyle: CSSProperties = {
  fontSize: 11,
  fontWeight: 800,
  letterSpacing: "0.14em",
  marginBottom: 14,
};

const previewTitleStyle: CSSProperties = {
  fontSize: "clamp(30px, 4vw, 62px)",
  lineHeight: 0.95,
  letterSpacing: "-0.045em",
  fontWeight: 800,
  marginBottom: 18,
};

const previewDescriptionStyle: CSSProperties = {
  maxWidth: 620,
  fontSize: 14,
  lineHeight: 1.55,
  marginBottom: 22,
};

const previewStatsStyle: CSSProperties = {
  display: "flex",
  gap: 34,
  flexWrap: "wrap",
};

const previewStatValueStyle: CSSProperties = {
  fontSize: 26,
  fontWeight: 800,
  lineHeight: 1,
};

const previewStatLabelStyle: CSSProperties = {
  marginTop: 4,
  fontSize: 11,
  opacity: 0.92,
};

const infoRowStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: 12,
};

const infoItemStyle: CSSProperties = {
  display: "grid",
  gap: 7,
  padding: "14px 16px",
  borderRadius: 16,
  background: "#f8fafc",
  border: "1px solid #e8edf2",
  fontSize: 13,
  color: "#64748b",
  lineHeight: 1.5,
};

const errorStyle: CSSProperties = {
  marginBottom: 16,
  padding: "13px 16px",
  borderRadius: 14,
  background: "#fef2f2",
  border: "1px solid #fecaca",
  color: "#991b1b",
  fontSize: 14,
  fontWeight: 600,
};

const successStyle: CSSProperties = {
  marginBottom: 16,
  padding: "13px 16px",
  borderRadius: 14,
  background: "#ecfdf5",
  border: "1px solid #bbf7d0",
  color: "#166534",
  fontSize: 14,
  fontWeight: 600,
};

const loadingCardStyle: CSSProperties = {
  ...cardStyle,
  padding: 50,
  textAlign: "center",
  color: "#64748b",
};
