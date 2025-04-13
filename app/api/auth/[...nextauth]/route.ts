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
      // authorization: {
      //   params: {
      //     redirect_uri: "https://2954-xxxx.ngrok-free.app/api/auth/callback/kakao",
      //   },
      // },
    }),
    // ...add more providers here
  ],

  callbacks: {
    async jwt({ token, user, account }) {
      if (account) {
        token.accessToken = account.access_token;
      }
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.picture = user.image;
      }
      
      return token;
    },

    async session({ session, token }) {

      // 👇 클라이언트에서도 사용할 수 있게 세션에 토큰 추가
      (session as any).accessToken = token.accessToken;


      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };