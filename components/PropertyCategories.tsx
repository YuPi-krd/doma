import Link from "next/link";

const categories = [
  {
    title: "Квартиры",
    subtitle: "Новостройки и вторичное жильё",
    image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=85",
    href: "/catalog?property_type=apartment",
  },
  {
    title: "Дома",
    subtitle: "Коттеджи и частные дома",
    image:
      "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1200&q=85",
    href: "/catalog?property_type=house",
  },
  {
    title: "Коммерческая",
    subtitle: "Офисы и помещения",
    image:
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=85",
    href: "/catalog?property_type=commercial",
  },
  {
    title: "Участки",
    subtitle: "Земля под строительство и инвестиции",
    image:
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=85",
    href: "/catalog?property_type=land",
  },
  {
    title: "Парковки",
    subtitle: "Парковочные места и машино-места",
    image:
      "https://images.unsplash.com/photo-1705566549260-687bb6912941?auto=format&fit=crop&w=1200&q=85",
    href: "/catalog?property_type=garage&property_subtype=parking",
  },
  {
    title: "Гаражи",
    subtitle: "Гаражи и гаражные боксы",
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85",
    href: "/catalog?property_type=garage",
  },
];

export default function PropertyCategories() {
  return (
    <section
      style={{
        maxWidth: "1400px",
        margin: "100px auto",
        padding: "0 20px",
      }}
    >
      <div
        style={{
          marginBottom: "40px",
        }}
      >
        <p
          style={{
            color: "#94a3b8",
            textTransform: "uppercase",
            letterSpacing: "2px",
            fontSize: "12px",
          }}
        >
          Каталог
        </p>

        <h2
          style={{
            fontSize: "48px",
            fontWeight: 700,
          }}
        >
          Недвижимость
        </h2>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
          gap: "24px",
        }}
      >
        {categories.map((item) => (
          <Link
            key={item.title}
            href={item.href}
            style={{
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <div
              style={{
                position: "relative",
                height: "420px",
                borderRadius: "28px",
                overflow: "hidden",
                cursor: "pointer",
              }}
            >
              <img
                src={item.image}
                alt={item.title}
                loading="lazy"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />

              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(to top, rgba(0,0,0,.75), transparent)",
                }}
              />

              <div
                style={{
                  position: "absolute",
                  left: "30px",
                  bottom: "30px",
                  color: "white",
                }}
              >
                <h3
                  style={{
                    fontSize: "36px",
                    marginBottom: "10px",
                  }}
                >
                  {item.title}
                </h3>

                <p
                  style={{
                    opacity: 0.9,
                  }}
                >
                  {item.subtitle}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
