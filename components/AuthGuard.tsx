"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "https://doma-nq4u.onrender.com"
).replace(/\/+$/, "");

type AuthStatus = "checking" | "allowed" | "unavailable" | "error";

export default function AuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<AuthStatus>("checking");

  useEffect(() => {
    let cancelled = false;

    async function checkAuth() {
      // The API /login endpoint returns { access_token }, but older CRM code
      // may still store the value under "token". Read both for compatibility.
      const tokens = Array.from(
        new Set(
          [localStorage.getItem("access_token"), localStorage.getItem("token")]
            .map((value) => (value || "").trim().replace(/^Bearer\s+/i, ""))
            .filter(Boolean)
        )
      );

      if (tokens.length === 0) {
        router.replace("/login");
        return;
      }

      let networkFailure = false;
      let lastServerError: string | null = null;

      for (const token of tokens) {
        try {
          const response = await fetch(`${API_URL}/me`, {
            method: "GET",
            cache: "no-store",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          const data: { role?: string; detail?: string } = await response
            .json()
            .catch(() => ({}));

          if (response.status === 401) {
            // Try the other stored token if this one is stale.
            continue;
          }

          if (!response.ok) {
            lastServerError =
              data.detail || `Сервер проверки авторизации вернул ${response.status}.`;
            continue;
          }

          // /me decodes the JWT and returns its claims, including role.
          if (data.role !== "admin") {
            localStorage.removeItem("token");
            localStorage.removeItem("access_token");
            router.replace("/login");
            return;
          }

          // Keep both storage keys in sync for legacy CRM requests.
          localStorage.setItem("access_token", token);
          localStorage.setItem("token", token);

          if (!cancelled) setStatus("allowed");
          return;
        } catch {
          networkFailure = true;
        }
      }

      if (cancelled) return;

      // Don't delete possibly-valid credentials just because the API is offline.
      if (networkFailure) {
        setStatus("unavailable");
        return;
      }

      localStorage.removeItem("token");
      localStorage.removeItem("access_token");

      if (lastServerError) {
        setStatus("error");
        return;
      }

      router.replace("/login");
    }

    void checkAuth();

    return () => {
      cancelled = true;
    };
  }, [router]);

  if (status === "checking") {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "16px",
          fontWeight: 600,
          color: "#334155",
          background: "#f8fafc",
        }}
      >
        Проверка авторизации...
      </div>
    );
  }

  if (status === "unavailable" || status === "error") {
    return (
      <div
        role="alert"
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "12px",
          padding: "24px",
          textAlign: "center",
          color: "#334155",
          background: "#f8fafc",
        }}
      >
        <h1 style={{ margin: 0, fontSize: "22px" }}>
          Не удалось проверить авторизацию
        </h1>
        <p style={{ maxWidth: "620px", margin: 0, lineHeight: 1.6 }}>
          {status === "unavailable"
            ? `Не удалось связаться с API (${API_URL}). Проверьте, что сервер запущен и NEXT_PUBLIC_API_URL указывает на тот же backend, где вы авторизовались.`
            : "Backend вернул ошибку при проверке доступа. Проверьте адрес API и логи сервера."}
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          style={{
            border: 0,
            borderRadius: "10px",
            padding: "10px 16px",
            background: "#1d4ed8",
            color: "#fff",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Повторить проверку
        </button>
      </div>
    );
  }

  return <>{children}</>;
}

