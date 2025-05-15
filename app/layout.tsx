import type { Metadata } from "next";

import Navigation from "@/components/Navigation";
import "./globals.css";

import Footer from "@/components/Footer";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: "마이웨딩 다이어리",
  description:
    "웨딩홀 견적서 검색 플랫폼, 3천여개의 웨딩홀 견적서를 한눈에! 견적, 주차, 식대, 대관료, 패키지, 옵션 모두 한번에 볼 수 있어요",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
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
