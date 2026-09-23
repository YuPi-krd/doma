import CreateClientForm from "./CreateClientForm";

export default function NewClientPage() {
  return (
    <main
      style={{
        padding: "40px",
        background: "#f8fafc",
        minHeight: "100vh",
      }}
    >
      <div
        style={{
          maxWidth: "800px",
          margin: "0 auto",
          background: "white",
          padding: "40px",
          borderRadius: "24px",
          boxShadow:
            "0 10px 30px rgba(0,0,0,.05)",
        }}
      >
        <h1
          style={{
            marginTop: 0,
            marginBottom: "30px",
          }}
        >
          ➕ Новый клиент
        </h1>

        <CreateClientForm />
      </div>
    </main>
  );
}