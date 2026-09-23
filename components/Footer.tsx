export default function Footer() {
  return (
    <footer
      style={{
        background: "#0f172a",
        color: "white",
        padding: "60px 40px",
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
            fontSize: "34px",
            marginBottom: "20px",
          }}
        >
          DOMA
        </h2>

        <p>Агентство недвижимости</p>

        <p style={{ marginTop: "10px" }}>
          Краснодар
        </p>

        <p>+7 (900) 123-45-67</p>

        <p>info@doma.ru</p>

        <p
          style={{
            marginTop: "25px",
            opacity: 0.7,
          }}
        >
          © 2026 DOMA. Все права защищены.
        </p>
      </div>
    </footer>
  );
}