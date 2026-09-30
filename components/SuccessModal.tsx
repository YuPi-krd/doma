"use client";

interface SuccessModalProps {
  open: boolean;
  title?: string;
  message?: string;
  onClose: () => void;
}

export default function SuccessModal({
  open,
  title = "Заявка отправлена",
  message = "Менеджер свяжется с вами в ближайшее время.",
  onClose,
}: SuccessModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div
      onMouseDown={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(15, 23, 42, 0.62)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        backdropFilter: "blur(3px)",
      }}
    >
      <div
        onMouseDown={(e) => e.stopPropagation()}
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "520px",
          background: "#ffffff",
          borderRadius: "26px",
          padding: "34px 30px 30px",
          boxShadow:
            "0 25px 70px rgba(0,0,0,.22)",
        }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Закрыть"
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            border: "1px solid #e5e7eb",
            background: "#ffffff",
            color: "#111827",
            fontSize: "24px",
            lineHeight: 1,
            cursor: "pointer",
          }}
        >
          ×
        </button>

        <h2
          style={{
            margin: "0 50px 12px 0",
            color: "#0f172a",
            fontSize: "32px",
            fontWeight: 500,
            lineHeight: 1.2,
          }}
        >
          {title}
        </h2>

        <p
          style={{
            margin: "0 0 26px",
            color: "#64748b",
            fontSize: "16px",
            lineHeight: 1.6,
          }}
        >
          Оставьте свои контакты, и менеджер свяжется с вами.
        </p>

        <div
          style={{
            borderRadius: "18px",
            background: "#dcfce7",
            padding: "22px 20px",
            color: "#166534",
          }}
        >
          <div
            style={{
              fontSize: "16px",
              fontWeight: 700,
              marginBottom: "5px",
            }}
          >
            Заявка отправлена.
          </div>

          <div
            style={{
              fontSize: "16px",
              lineHeight: 1.5,
            }}
          >
            {message}
          </div>
        </div>
      </div>
    </div>
  );
}