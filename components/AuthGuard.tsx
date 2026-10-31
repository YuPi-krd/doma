"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "https://doma-nq4u.onrender.com").replace(/\/+$/, "");
type AuthStatus = "checking" | "allowed" | "unavailable" | "error";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [status, setStatus] = useState<AuthStatus>("checking");

  useEffect(() => {
    let cancelled = false;

    async function checkAuth() {
      const tokens = Array.from(new Set(
        [localStorage.getItem("access_token"), localStorage.getItem("token")]
          .map((value) => (value || "").trim().replace(/^Bearer\s+/i, ""))
          .filter(Boolean)
      ));
      if (!tokens.length) {
        router.replace("/login");
        return;
      }

      let networkFailure = false;
      let serverError = "";
      for (const token of tokens) {
        try {
          const response = await fetch(`${API_URL}/me`, {
            method: "GET",
            cache: "no-store",
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await response.json().catch(() => ({}));
          if (response.status === 401) continue;
          if (!response.ok) {
            serverError = data.detail || `Ошибка проверки доступа: ${response.status}`;
            continue;
          }
          if (data.role !== "admin" || data.telegram_2fa !== true) {
            localStorage.removeItem("access_token");
            localStorage.removeItem("token");
            router.replace("/login");
            return;
          }
          localStorage.setItem("access_token", token);
          localStorage.setItem("token", token);
          if (!cancelled) setStatus("allowed");
          return;
        } catch {
          networkFailure = true;
        }
      }

      if (cancelled) return;
      if (networkFailure) {
        setStatus("unavailable");
        return;
      }
      localStorage.removeItem("access_token");
      localStorage.removeItem("token");
      if (serverError) {
        setStatus("error");
        return;
      }
      router.replace("/login");
    }

    void checkAuth();
    return () => { cancelled = true; };
  }, [router]);

  if (status === "checking") {
    return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc", color: "#334155", fontWeight: 600 }}>Проверка авторизации...</div>;
  }
  if (status === "unavailable" || status === "error") {
    return (
      <div role="alert" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, padding: 24, textAlign: "center", color: "#334155", background: "#f8fafc" }}>
        <h1 style={{ margin: 0, fontSize: 22 }}>Не удалось проверить авторизацию</h1>
        <p style={{ maxWidth: 620, margin: 0, lineHeight: 1.6 }}>{status === "unavailable" ? `Не удалось связаться с API (${API_URL}). Проверьте доступность backend.` : "Backend отклонил проверку авторизации. Войдите повторно через Telegram."}</p>
        <button type="button" onClick={() => window.location.reload()} style={{ border: 0, borderRadius: 10, padding: "10px 16px", background: "#1d4ed8", color: "#fff", fontWeight: 600, cursor: "pointer" }}>Повторить проверку</button>
      </div>
    );
  }
  return <>{children}</>;
}
