import AdminSidebar from "./AdminSidebar";
import AuthGuard from "@/components/AuthGuard";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div
        style={{
          display: "flex",
          minHeight: "100vh",
          background: "#f1f5f9",
        }}
      >
        <AdminSidebar />

        <main
          style={{
            flex: 1,
            padding: "40px",
            overflowY: "auto",
          }}
        >
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}