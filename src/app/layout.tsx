import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SakuraFilm Studio | 감성 사진 원클릭 색감 보정",
  description: "내가 찍은 일상 사진을 따스하고 몽환적인 벚꽃 피크닉 감성 필름 톤으로 원클릭 변환하는 전문 웹 스튜디오",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="dark">
      <body className="antialiased selection:bg-sakura-500 selection:text-white">{children}</body>
    </html>
  );
}
