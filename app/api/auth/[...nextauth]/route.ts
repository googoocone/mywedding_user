import NextAuth, { NextAuthOptions } from "next-auth";
import KakaoProvider from "next-auth/providers/kakao";



export const authOptions: NextAuthOptions = {
  // Configure one or more authentication providers
  session: {
    strategy: "jwt" as const,
    maxAge: 60 * 60 * 24,
    updateAge: 60 * 60 * 2,
  },
  providers: [
    KakaoProvider({
      clientId: process.env.KAKAO_CLIENT_ID || "",
      clientSecret: process.env.KAKAO_CLIENT_SECRET || "",
    }),
    // ...add more providers here
  ],

  callbacks: {
    async jwt({ token, user, account }) {
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = account.expires_at;

        // 🔗 FastAPI로 access token과 provider 전달
        // try {
        //   const res = await fetch("http://127.0.0.1:8000/auth/oauth/kakao", {
        //     method: "POST",
        //     headers: {
        //       "Content-Type": "application/json",
        //     },
        //     body: JSON.stringify({
        //       access_token: account.access_token,
        //       provider: account.provider,
        //     }),
        //   });

        //   if (!res.ok) throw new Error("FastAPI 응답 실패");

        //   const userInfo = await res.json();
        //   console.log("🐍 FastAPI에서 받은 사용자 정보:", userInfo);

        //   // 🔐 응답 데이터를 token에 저장
        //   token.kakaoId = userInfo.kakao_id;
        //   token.email = userInfo.email;
        //   token.nickname = userInfo.nickname;
        //   token.firebase_token = userInfo.firebase_token;
        // } catch (err) {
        //   console.error("FastAPI 요청 실패:", err);
        // }
      }

      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.picture = user.image;
      }



      return token;
    },

    async session({ session, token }) {
    //   session.user.id = token.id as string;
    //   session.user.name = token.name;
    //   session.user.image = token.picture;

      // 👇 클라이언트에서도 사용할 수 있게 세션에 토큰 추가
      (session as any).accessToken = token.accessToken;
      (session as any).refreshToken = token.refreshToken;
      (session as any).expiresAt = token.expiresAt;

      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };