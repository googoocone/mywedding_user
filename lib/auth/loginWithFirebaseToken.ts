'use client'

import { signInWithCustomToken } from "firebase/auth";
import { auth } from "@/lib/firebase/client"; // 초기화된 Firebase Auth 객체

export const loginWithFirebaseToken = async (firebaseToken: string, kakao_user: object) => {
  try {
    // 🔹 1. Firebase 로그인
    const userCredential = await signInWithCustomToken(auth, firebaseToken);
    const idToken = await userCredential.user.getIdToken();

    // 🔹 2. 백엔드로 ID Token 전송
    console.log('process', process.env.BACKEND_URL)
    const serverRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/server-login`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${idToken}`,
        "Content-Type": "application/json"
      },
      body : JSON.stringify({
        kakao_user : kakao_user
      }),
      credentials: "include",
    });

    if (!serverRes.ok) {
      const errorText = await serverRes.text();
      throw new Error("서버 로그인 실패: " + errorText);
    }

    const data = await serverRes.json();

    // ✅ 서버 accessToken / refreshToken 저장 (localStorage, 쿠키 등)
    console.log('data는?', data)
    
    // 액세스 토큰을 반환하여 호출하는 컴포넌트에서 처리할 수 있게 함
    return {
      accessToken: data.access_token,
      user: data.user
    };
  } catch (err) {
    console.error("❌ Firebase 로그인 또는 서버 인증 실패:", err);
    throw err;
  }
};
