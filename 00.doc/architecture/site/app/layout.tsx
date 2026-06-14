import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "테크밸리 IoT — 아키텍처 가이드",
    template: "%s · 테크밸리 아키텍처",
  },
  description: "02.arch SSOT 기반 YAML·DB·파이프라인 설계 문서 (Next.js SSG)",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
