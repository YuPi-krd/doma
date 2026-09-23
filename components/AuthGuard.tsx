"use client";

console.log("AUTH GUARD LOADED");

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    console.log(
      "AUTH GUARD LOADED"
    );

    async function checkAuth() {
      const token =
        localStorage.getItem("token");

      console.log(
        "TOKEN FROM STORAGE:",
        token
      );

      if (!token) {
        console.log(
          "TOKEN NOT FOUND"
        );

        router.push("/login");
        return;
      }

      try {
        console.log(
          "CHECKING AUTH..."
        );

        const res = await fetch(
          "http://127.0.0.1:8000/me",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log(
          "AUTH STATUS:",
          res.status
        );

        const data =
          await res.json();

        console.log(
          "AUTH RESPONSE:",
          data
        );

        if (!res.ok) {
          console.log(
            "TOKEN INVALID"
          );

          localStorage.removeItem(
            "token"
          );

          router.push("/login");

          return;
        }

        console.log(
          "AUTH SUCCESS"
        );

        setLoading(false);
      } catch (error) {
        console.error(
          "AUTH ERROR:",
          error
        );

        localStorage.removeItem(
          "token"
        );

        router.push("/login");
      }
    }

    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent:
            "center",
          fontSize: "20px",
          fontWeight: 600,
        }}
      >
        Проверка авторизации...
      </div>
    );
  }

  return <>{children}</>;
}