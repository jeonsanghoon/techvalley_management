import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { AppProviders } from "@/components/providers/AppProviders";
import { COLOR_MODE_INIT_INLINE_SCRIPT } from "@/lib/color-mode";
import { DEV_CONSOLE_FILTER_INLINE_SCRIPT } from "@/lib/dev-console-filter";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "테크밸리 IoT 서비스 플랫폼",
  description: "장비 운영·모니터링·정비 사이클 — 프로젝트 A",
  icons: {
    icon: [{ url: "/techvalley-icon-on-dark.png", type: "image/png" }],
    apple: "/techvalley-icon-on-dark.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // SSG 호환: 정적 기본값 "light" 사용.
  // beforeInteractive 인라인 스크립트 + useLayoutEffect가 클라이언트에서 실제 모드로 즉시 수정.
  const initialColorMode = "light" as const;

  return (
    <html
      lang="ko"
      className={`${inter.variable} h-full`}
      data-color-mode={initialColorMode}
      suppressHydrationWarning
    >
      <body className="min-h-full antialiased">
        <Script id="tv-console-filter" strategy="beforeInteractive">
          {DEV_CONSOLE_FILTER_INLINE_SCRIPT}
        </Script>
        <Script id="tv-color-mode-init" strategy="beforeInteractive">
          {COLOR_MODE_INIT_INLINE_SCRIPT}
        </Script>
        <AppProviders initialColorMode={initialColorMode}>{children}</AppProviders>
      </body>
    </html>
  );
}
