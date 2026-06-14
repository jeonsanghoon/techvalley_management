"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { getSidebarSections } from "@/lib/manifest";
import { cn } from "@/lib/utils";

const REF_LINKS = [
  { href: "/reference/ui-api/", label: "UI · API · NestJS" },
  { href: "/reference/lambda/", label: "AWS Lambda 9종" },
  { href: "/reference/media-upload/", label: "미디어 · S3" },
  { href: "/reference/postgres/", label: "Postgres DDL" },
  { href: "/reference/docdb/", label: "DocumentDB" },
  { href: "/reference/config/", label: "config 트리" },
  { href: "/status/", label: "구현 상태" },
  { href: "/search/", label: "검색" },
];

type Props = {
  open: boolean;
  onClose: () => void;
};

export function Sidebar({ open, onClose }: Props) {
  const pathname = usePathname();
  const [q, setQ] = useState("");

  const sections = useMemo(() => {
    const query = q.trim().toLowerCase();
    const all = getSidebarSections();
    if (!query) return all;

    return all
      .map((section) => ({
        ...section,
        links: section.links.filter(
          (f) =>
            f.label?.toLowerCase().includes(query) ||
            f.rel.toLowerCase().includes(query) ||
            section.title?.toLowerCase().includes(query),
        ),
      }))
      .filter((s) => s.links.length > 0);
  }, [q]);

  return (
    <aside
      className={cn(
        "fixed top-0 left-0 z-50 flex h-full w-[min(88vw,17.5rem)] flex-col border-r border-border bg-white shadow-xl transition-transform duration-200 ease-out",
        "lg:static lg:z-auto lg:h-screen lg:w-56 lg:shrink-0 lg:translate-x-0 lg:shadow-none xl:w-60",
        open ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
      )}
    >
      <div className="border-b border-border p-3">
        <div className="flex items-center justify-between gap-2">
          <Link href="/" onClick={onClose} className="min-w-0 text-sm font-bold text-navy hover:text-accent">
            테크밸리 IoT
          </Link>
          <button
            type="button"
            aria-label="메뉴 닫기"
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted hover:bg-surface lg:hidden"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
        <input
          type="search"
          placeholder="문서 검색…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="mt-2.5 w-full rounded-lg border border-border px-2.5 py-1.5 text-sm outline-none focus:border-accent"
        />
      </div>

      <nav className="flex-1 overflow-y-auto overscroll-contain py-2 pb-8">
        {sections.map((section) => (
          <div key={section.id}>
            {section.title && (
              <p className="px-3 pb-0.5 pt-2 text-[11px] font-semibold text-muted">{section.title}</p>
            )}
            {section.links.map((f) => {
              const href = `/docs/${f.slug}/`;
              const active = pathname === href || pathname === `/docs/${f.slug}`;
              return (
                <Link
                  key={f.slug}
                  href={href}
                  onClick={onClose}
                  className={cn(
                    "block rounded-r-md py-1.5 pr-3 text-[13px] leading-snug transition-colors",
                    section.title ? "pl-5" : "pl-3",
                    active
                      ? "border-l-[3px] border-accent bg-accent-light font-semibold text-navy"
                      : "border-l-[3px] border-transparent text-[#1c2b33] hover:bg-surface",
                  )}
                >
                  {f.label ?? f.rel}
                </Link>
              );
            })}
          </div>
        ))}

        <div className="mx-3 my-2 border-t border-border" />
        <p className="px-3 pb-0.5 text-[11px] font-semibold text-muted">레퍼런스</p>
        {REF_LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            onClick={onClose}
            className={cn(
              "block rounded-r-md border-l-[3px] py-1.5 pr-3 pl-3 text-[13px] transition-colors",
              pathname.startsWith(l.href.replace(/\/$/, ""))
                ? "border-accent bg-accent-light font-semibold text-navy"
                : "border-transparent hover:bg-surface",
            )}
          >
            {l.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
