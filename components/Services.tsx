export default function Services() {
  const services = [
    "Покупка недвижимости",
    "Продажа недвижимости",
    "Юридическое сопровождение",
    "Коммерческая недвижимость",
    "Подбор новостроек",
    "Подбор домов и земельных участков",
  ];

  return (
    <section
      style={{
        padding: "80px 40px",
        background: "#f8fafc",
      }}
    >
      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
        }}
      >
        <h2
          style={{
            fontSize: "42px",
            marginBottom: "40px",
          }}
        >
          Наши услуги
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(300px,1fr))",
            gap: "24px",
          }}
        >
          {services.map((service) => (
            <div
              key={service}
              style={{
                background: "white",
                padding: "30px",
                borderRadius: "24px",
                boxShadow:
                  "0 10px 30px rgba(0,0,0,.05)",
              }}
            >
              <h3>{service}</h3>

              <p
                style={{
                  color: "#64748b",
                  lineHeight: 1.7,
                }}
              >
                Полное сопровождение сделки и помощь в подборе подходящего объекта.
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}