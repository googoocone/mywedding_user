// context/AuthContext.tsx
"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
} from "react";
import { useSession } from "next-auth/react";
import { signInWithCustomToken } from "firebase/auth";
import { auth } from "@/lib/firebase/client"; // Firebase 초기화된 객체

interface AuthContextType {
  serverToken: string | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: session, status } = useSession();
  const [serverToken, setServerToken] = useState<string | null>(null);
  const fetchedRef = useRef(false); // 중복 호출 방지

  //   useEffect(() => {
  //     const fetchServerToken = async () => {
  //       console.log("useSeesion", session);

  //       //   if (!session || session.accessToken || fetchedRef.current) {
  //       //     return;
  //       //   }
  //       if (fetchedRef.current) {
  //         return;
  //       }
  //       fetchedRef.current = true;
  //       try {
  //         // Firebase Custom Token 요청을 보냄냄
  //         const firebaseRes = await fetch("/api/auth/firebase-token", {
  //           method: "POST",
  //           headers: { "Content-Type": "application/json" },
  //           body: JSON.stringify({ kakaoAccessToken: session?.accessToken! }),
  //         });

  //         console.log("✅ 서버 토큰 발급 성공:");
  //       } catch (err) {
  //         console.error("❌ 서버 토큰 발급 실패", err);
  //       }
  //     };

  //     fetchServerToken();
  //   }, [session]);

  return (
    <AuthContext.Provider value={{ serverToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
