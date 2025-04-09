// middleware.js 또는 middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server"; // 타입스크립트 사용하는 경우

export function middleware(request:any) {
  const { cookies, nextUrl } = request;
  const url = nextUrl.clone();

  const whitelist = ["/", "/public", "/signup"];

  if (whitelist.some((path) => url.pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const refreshToken = cookies.get("refresh_token")?.value;
  if (!refreshToken) {
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// 이건 꼭 필요함!
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
