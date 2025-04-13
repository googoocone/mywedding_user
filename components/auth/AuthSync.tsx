"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { loginWithFirebaseToken } from "@/lib/auth/loginWithFirebaseToken";

const AuthSync = () => {
  const { data: session, status } = useSession();
  const [lastSyncedToken, setLastSyncedToken] = useState<string | null>(null);

  useEffect(() => {
    // 컴포넌트 마운트 시 sessionStorage에서 마지막 동기화된 토큰 가져오기
    const storedToken = sessionStorage.getItem("lastSyncedAccessToken");
    if (storedToken) {
      setLastSyncedToken(storedToken);
    }
  }, []);

  useEffect(() => {
    const sync = async () => {
      // 인증되지 않았거나 토큰이 없는 경우 무시
      if (status !== "authenticated" || !session?.accessToken) {
        return;
      }

      // 이전에 동기화된 토큰과 현재 토큰이 같으면 동기화 건너뛰기
      if (lastSyncedToken === session.accessToken) {
        return;
      }

      try {
        const firebaseTokenRes = await fetch("/api/auth/firebase-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ kakaoAccessToken: session.accessToken }),
          credentials: "include",
        });

        if (!firebaseTokenRes.ok) {
          throw new Error("Firebase 토큰 가져오기 실패");
        }

        const { firebase_token, kakao_user } = await firebaseTokenRes.json();

        await loginWithFirebaseToken(firebase_token, kakao_user);
        
        // 동기화 성공 후 현재 토큰 저장
        sessionStorage.setItem("lastSyncedAccessToken", session.accessToken);
        setLastSyncedToken(session.accessToken);
      } catch (error) {
        console.error("Firebase 동기화 오류:", error);
      }
    };

    sync();
  }, [status, session, lastSyncedToken]);

  return null;
};

export default AuthSync;
