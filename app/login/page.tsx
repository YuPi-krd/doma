"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "https://doma-nq4u.onrender.com").replace(/\/+$/, "");

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    if (!requestId) return;

    let cancelled = false;
    let timer: number | undefined;

    async function pollStatus() {
      try {
        const response = await fetch(`${API_URL}/login/status/${encodeURIComponent(requestId!)}`, {
          method: "GET",
          cache: "no-store",
        });
        const data = await response.json().catch(() => ({}));

        if (cancelled) return;

        if (!response.ok) {
          throw new Error(data.detail || "Не удалось проверить подтверждение.");
        }

        if (data.status === "approved" && data.access_token) {
          // Keep both keys during the transition from the older CRM token name.
          localStorage.setItem("access_token", data.access_token);
          localStorage.setItem("token", data.access_token);
          setStatusMessage("Вход подтверждён. Открываем админ-панель…");
          router.replace("/admin");
          return;
        }

        if (data.status === "denied") {
          setRequestId(null);
          setStatusMessage("");
          setError("Вход отклонён в Telegram. Повторите попытку, когда будете готовы.");
          return;
        }

        if (data.status === "expired") {
          setRequestId(null);
          setStatusMessage("");
          setError("Время подтверждения истекло. Войдите снова.");
          return;
        }

        if (data.status === "failed") {
          setRequestId(null);
          setStatusMessage("");
          setError("Не удалось завершить подтверждение. Проверьте настройки Telegram и повторите вход.");
          return;
        }

        if (data.status === "issued") {
          setRequestId(null);
          setStatusMessage("");
          setError("Токен входа уже был выдан. Для безопасности начните вход заново.");
          return;
        }

        setStatusMessage("Запрос отправлен. Подтвердите вход кнопкой в Telegram.");
        timer = window.setTimeout(pollStatus, 2000);
      } catch (caught) {
        if (cancelled) return;
        setStatusMessage("Ожидаем ответ сервера…");
        timer = window.setTimeout(pollStatus, 2500);
      }
    }

    void pollStatus();

    return () => {
      cancelled = true;
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, [requestId, router]);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setStatusMessage("");
    setLoading(true);
    setRequestId(null);
    // Do not leave an earlier admin session active after a new login attempt.
    localStorage.removeItem("access_token");
    localStorage.removeItem("token");

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
        cache: "no-store",
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.detail || "Ошибка входа.");
      }

      if (data.status !== "pending" || typeof data.request_id !== "string") {
        throw new Error("Сервер вернул неожиданный ответ авторизации.");
      }

      setPassword("");
      setStatusMessage("Запрос отправлен. Подтвердите вход кнопкой в Telegram.");
      setRequestId(data.request_id);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Ошибка подключения.");
    } finally {
      setLoading(false);
    }
  }

  function cancelWaiting() {
    setRequestId(null);
    setStatusMessage("");
    setError("Ожидание подтверждения остановлено. Незавершённый запрос автоматически истечёт.");
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f1f5f9",
        padding: 20,
      }}
    >
      <form
        onSubmit={handleLogin}
        style={{
          width: "100%",
          maxWidth: 400,
          boxSizing: "border-box",
          background: "white",
          padding: 40,
          borderRadius: 20,
          boxShadow: "0 10px 30px rgba(0,0,0,.05)",
        }}
      >
        <h1 style={{ margin: "0 0 8px", color: "#172033", fontSize: 26 }}>
          Вход в DOMA
        </h1>
        <p style={{ margin: "0 0 18px", color: "#64748b", fontSize: 14 }}>
          Для входа потребуется подтверждение через Telegram.
        </p>

        <input
          autoComplete="username"
          placeholder="Логин"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          disabled={Boolean(requestId) || loading}
          required
          style={{
            width: "100%",
            boxSizing: "border-box",
            padding: 12,
            marginTop: 8,
            border: "1px solid #cbd5e1",
            borderRadius: 10,
            outlineColor: "#2563eb",
          }}
        />

        <input
          type="password"
          autoComplete="current-password"
          placeholder="Пароль"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          disabled={Boolean(requestId) || loading}
          required
          style={{
            width: "100%",
            boxSizing: "border-box",
            padding: 12,
            marginTop: 12,
            border: "1px solid #cbd5e1",
            borderRadius: 10,
            outlineColor: "#2563eb",
          }}
        />

        {error && (
          <div role="alert" style={{ marginTop: 14, color: "#b91c1c", fontSize: 13, lineHeight: 1.45 }}>
            {error}
          </div>
        )}

        {statusMessage && (
          <div role="status" style={{ marginTop: 14, color: "#1d4ed8", fontSize: 13, lineHeight: 1.45 }}>
            {statusMessage}
          </div>
        )}

        {requestId ? (
          <button
            type="button"
            onClick={cancelWaiting}
            style={{
              width: "100%",
              marginTop: 20,
              padding: 14,
              background: "#e2e8f0",
              color: "#334155",
              border: "none",
              borderRadius: 12,
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Отменить ожидание
          </button>
        ) : (
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              marginTop: 20,
              padding: 14,
              background: loading ? "#94a3b8" : "#2563eb",
              color: "white",
              border: "none",
              borderRadius: 12,
              cursor: loading ? "not-allowed" : "pointer",
              fontWeight: 600,
            }}
          >
            {loading ? "Проверяем…" : "Войти"}
          </button>
        )}
      </form>
    </main>
  );
}
