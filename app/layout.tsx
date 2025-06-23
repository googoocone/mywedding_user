import type { Metadata } from "next";
import Script from "next/script"; // next/script에서 Script를 import 합니다.

import Navigation from "@/components/Navigation";
import "./globals.css";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: "마이웨딩 다이어리",
  description:
    "웨딩홀 견적서 검색 플랫폼, 3천여개의 웨딩홀 견적서를 한눈에! 견적, 주차, 식대, 대관료, 패키지, 옵션 모두 한번에 볼 수 있어요, 강남 웨딩홀, 강북 웨딩홀, 영등포 웨딩홀, 서울 웨딩홀 견적서 공유",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* Google tag (gtag.js) Scripts */}
      <Script
        async
        src="https://www.googletagmanager.com/gtag/js?id=AW-16604927562"
      />
      <Script id="gtag-init">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'AW-16604927562');
        `}
      </Script>
      {/* End Google tag (gtag.js) Scripts */}

      <body>
        <AuthProvider>
          <Navigation></Navigation>
          {children}
          <Footer></Footer>
        </AuthProvider>
      </body>
    </html>
  );
}
