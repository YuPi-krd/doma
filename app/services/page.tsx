import PromotionLeadForm from "@/components/PromotionLeadForm";

export default function ServicesPage() {
  return (
    <main
      style={{
        minHeight: "70vh",
        background: "#f8fafc",
        padding: "clamp(28px, 5vw, 64px) 20px 72px",
      }}
    >
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        <div
          style={{
            color: "#ef4444",
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: ".14em",
            textTransform: "uppercase",
            marginBottom: 12,
          }}
        >
          DOMA · УСЛУГИ
        </div>
        <h1
          style={{
            margin: 0,
            color: "#111827",
            fontSize: "clamp(34px, 5vw, 54px)",
            lineHeight: 1.05,
            letterSpacing: "-.04em",
          }}
        >
          Услуги агентства DOMA
        </h1>
        <p
          style={{
            maxWidth: 720,
            margin: "18px 0 0",
            color: "#64748b",
            fontSize: 17,
            lineHeight: 1.7,
          }}
        >
          Поможем с подбором недвижимости, ипотекой, оценкой, продажей объекта,
          юридическим сопровождением и подготовкой интерьера.
        </p>

        <PromotionLeadForm
          section="services"
          heading="Получить консультацию"
          description="Оставьте контакты и расскажите, какая услуга вас интересует. Мы свяжемся с вами."
        />
      </div>
    </main>
  );
}
