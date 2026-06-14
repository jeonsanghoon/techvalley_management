"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { PageMain } from "@/components/AppShell";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import searchIndex from "@/data/search-index.json";

export default function SearchPage() {
  const [q, setQ] = useState("");

  const results = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return searchIndex.slice(0, 12);
    return searchIndex.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.rel.toLowerCase().includes(query) ||
        item.excerpt.toLowerCase().includes(query),
    );
  }, [q]);

  return (
    <PageMain>
      <Breadcrumbs items={[{ label: "홈", href: "/" }, { label: "검색" }]} />

      <h1 className="text-2xl font-bold text-navy">문서 검색</h1>
      <input
        type="search"
        autoFocus
        placeholder="YAML, UI API, Postgres, FOTA, Greengrass…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        className="mt-4 w-full rounded-xl border border-border px-4 py-3 text-sm outline-none focus:border-accent"
      />

      <p className="mt-2 text-xs text-muted">{results.length}건</p>

      <ul className="mt-6 space-y-3">
        {results.map((item) => {
          const href = item.rel.startsWith("reference/")
            ? `/${item.rel}/`
            : item.rel.startsWith("__generated/")
              ? `/docs/${item.slug}/`
              : `/docs/${item.slug}/`;
          return (
          <li key={item.slug}>
            <Link
              href={href}
              className="block rounded-xl border border-border bg-white p-4 transition hover:border-accent hover:shadow-sm"
            >
              <p className="font-semibold text-navy">{item.title}</p>
              <p className="mt-0.5 font-mono text-[11px] text-muted">
                {item.rel.startsWith("reference/") ? item.rel : `02.arch/${item.rel}`}
              </p>
              <p className="mt-2 line-clamp-2 text-sm text-muted">{item.excerpt}</p>
            </Link>
          </li>
          );
        })}
      </ul>
    </PageMain>
  );
}
