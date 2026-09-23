export default function Advantages() {
  const items = [
    {
      icon: "🏠",
      title: "Подбор недвижимости",
      text: "Квартиры, дома и коммерческие объекты под любые задачи.",
    },
    {
      icon: "⚖️",
      title: "Юридическое сопровождение",
      text: "Проверка документов и сопровождение сделки на каждом этапе.",
    },
    {
      icon: "📈",
      title: "Продажа недвижимости",
      text: "Быстро найдём покупателя и проведём сделку безопасно.",
    },
    {
      icon: "🤝",
      title: "Персональный подход",
      text: "Каждый клиент получает индивидуальное сопровождение.",
    },
  ];

  return (
    <section
      style={{
        padding: "80px 40px",
        background: "#fff",
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
          Почему выбирают DOMA
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(280px,1fr))",
            gap: "24px",
          }}
        >
          {items.map((item) => (
            <div
              key={item.title}
              style={{
                background: "#f8fafc",
                padding: "30px",
                borderRadius: "24px",
              }}
            >
              <div
                style={{
                  fontSize: "42px",
                  marginBottom: "15px",
                }}
              >
                {item.icon}
              </div>

              <h3>{item.title}</h3>

              <p
                style={{
                  color: "#64748b",
                  lineHeight: 1.7,
                }}
              >
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
