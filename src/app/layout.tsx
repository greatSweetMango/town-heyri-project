import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import "./globals.css";

const notoSansKr = Noto_Sans_KR({
  variable: "--font-noto-sans-kr",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "헤이리 예술마을 | 방문 안내",
  description:
    "파주 헤이리 예술마을의 카페, 갤러리, 공방, 맛집을 한눈에 탐색하세요. 당신만의 예술 여행을 시작하세요.",
  keywords: ["헤이리", "예술마을", "파주", "카페", "갤러리", "공방"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${notoSansKr.variable} antialiased`}>{children}</body>
    </html>
  );
}
