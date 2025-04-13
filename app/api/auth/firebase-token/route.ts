import { NextRequest, NextResponse } from 'next/server';

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


    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/firebase-login`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${kakaoAccessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const errorText = await res.text();
      return NextResponse.json(
        { error: "Server token issue from backend", details: errorText },
        { status: res.status }
      );
    }

    const data = await res.json();

    // 🔥 여기서는 Firebase 커스텀 토큰만 전달하면 됨
    return NextResponse.json({
      firebase_token: data.firebase_token,
      kakao_user: data.kakao_user,
    });

  } catch (err) {
    console.error("🔥 서버 내부 에러:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
