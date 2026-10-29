import AuthGuard from "@/components/AuthGuard";

export default function CRMLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div
        style={{
          minHeight: "100vh",
          background: "#f1f5f9",
          padding: "30px",
        }}
      >
        {children}
      </div>
    </AuthGuard>
  );
}
