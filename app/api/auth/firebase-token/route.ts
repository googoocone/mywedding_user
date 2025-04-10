import { NextRequest, NextResponse } from 'next/server';
import { loginWithFirebaseToken } from '@/lib/auth/loginWithFirebaseToken';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const kakaoAccessToken = body.kakaoAccessToken;

    if (!kakaoAccessToken) {
      return NextResponse.json(
        { error: "Missing Kakao Access Token" },
        { status: 400 }
      );
    }

    const res = await fetch("http://127.0.0.1:8000/auth/firebase-login", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${kakaoAccessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("🔥 백엔드 응답 실패:", errorText);
      return NextResponse.json(
        { error: "Server token issue from backend" },
        { status: res.status }
      );
    }

    const data = await res.json();
    const firebase_token = data.firebase_token
    const kakao_user = await data.kakao_user
    const response = await loginWithFirebaseToken(firebase_token,kakao_user)


    return NextResponse.json(response); // ✅ Next.js가 요구하는 응답 형식
  } catch (err) {
    console.error("🔥 서버 내부 에러:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
