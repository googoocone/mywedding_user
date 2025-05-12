"use client";
import { useEffect, useContext } from "react";
import { AuthContext } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function KakaoCallback() {
  const router = useRouter();
  const { fetchUser }: any = useContext(AuthContext);
  useEffect(() => {
    const code = new URL(window.location.href).searchParams.get("code");

    if (code) {
      fetch("http://localhost:8000/auth/kakao/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
        credentials: "include",
      })
        .then((res) => res.json())
        .then((data) => {
          console.log("✅ 로그인 성공:", data);
          fetchUser();
          router.push("/");
        })
        .catch((err) => {
          console.error("❌ 로그인 실패:", err);
        });
    }
  }, []);

  return <div>로그인 중입니다...</div>;
}
