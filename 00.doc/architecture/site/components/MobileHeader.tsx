"use client";

import Link from "next/link";

type Props = { onMenuOpen: () => void };

export function MobileHeader({ onMenuOpen }: Props) {
  return (
    <header className="fixed inset-x-0 top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-white/95 px-4 backdrop-blur-sm lg:hidden">
      <button
        type="button"
        aria-label="목차 열기"
        onClick={onMenuOpen}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border text-navy hover:bg-surface"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <Link href="/" className="min-w-0 flex-1 truncate text-sm font-bold text-navy">
        테크밸리 IoT 아키텍처
      </Link>
      <Link
        href="/search/"
        aria-label="검색"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border text-muted hover:bg-surface hover:text-accent"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-3-3" />
        </svg>
      </Link>
    </header>
  );
}
