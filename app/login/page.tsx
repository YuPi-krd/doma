"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  async function handleLogin() {
  setLoading(true);

  try {
    console.log("Отправляем запрос");

    const res = await fetch(
      "https://doma-nq4u.onrender.com/login",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      }
    );

    console.log("STATUS:", res.status);

    const data =
      await res.json();

    console.log("DATA:", data);

    if (!res.ok) {
      alert(
        data.detail ||
        "Ошибка входа"
      );
      return;
    }

    localStorage.setItem(
      "token",
      data.access_token
    );

    console.log(
      "TOKEN:",
      localStorage.getItem("token")
    );

    router.push("/admin");

    console.log(
      "Переход на /admin"
    );
  } catch (err) {
    console.error(err);

    alert(
      "Ошибка подключения"
    );
  } finally {
    setLoading(false);
  }
}

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent:
          "center",
        background: "#f1f5f9",
      }}
    >
      <div
        style={{
          width: "400px",
          background: "white",
          padding: "40px",
          borderRadius: "20px",
          boxShadow:
            "0 10px 30px rgba(0,0,0,.05)",
        }}
      >
        <h1>
          Вход в DOMA
        </h1>

        <input
          placeholder="Логин"
          value={username}
          onChange={(e) =>
            setUsername(
              e.target.value
            )
          }
          style={{
            width: "100%",
            padding: "12px",
            marginTop: "20px",
          }}
        />

        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) =>
            setPassword(
              e.target.value
            )
          }
          style={{
            width: "100%",
            padding: "12px",
            marginTop: "12px",
          }}
        />

        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            width: "100%",
            marginTop: "20px",
            padding: "14px",
            background: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: "12px",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          {loading
            ? "Вход..."
            : "Войти"}
        </button>
      </div>
    </main>
  );
}