"use client";

import { useEffect, useState } from "react";
import type { TocItem } from "@/lib/docs";
import { cn } from "@/lib/utils";

type Props = { items: TocItem[]; variant?: "sidebar" | "mobile" };

function TocList({ items, compact }: { items: TocItem[]; compact?: boolean }) {
  if (items.length === 0) return null;
  return (
    <ul className={cn("space-y-0.5 text-[13px]", compact ? "" : "border-l border-border pl-2.5")}>
      {items.map((item, idx) => (
        <li key={`${item.id}-${idx}`}>
          <a
            href={`#${item.id}`}
            className={cn(
              "block rounded px-1.5 py-0.5 text-muted hover:bg-accent-light/60 hover:text-accent",
              item.level === 3 && "pl-4 text-[12px]",
            )}
          >
            {item.text}
          </a>
        </li>
      ))}
    </ul>
  );
}

export function TableOfContents({ items, variant = "sidebar" }: Props) {
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    if (variant !== "sidebar" || items.length === 0) return;

    const ids = items.map((i) => i.id);
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]?.target.id) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: 0 },
    );

    for (const id of ids) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [items, variant]);

  if (items.length === 0) return null;

  if (variant === "mobile") {
    return (
      <details className="rounded-lg border border-border bg-white lg:hidden">
        <summary className="cursor-pointer px-3 py-2 text-sm font-medium text-navy">
          이 페이지 섹션 ({items.length})
        </summary>
        <div className="max-h-48 overflow-y-auto border-t border-border px-3 py-2">
          <TocList items={items} compact />
        </div>
      </details>
    );
  }

  return (
    <nav className="sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto overscroll-contain">
      <p className="mb-2 text-[11px] font-semibold text-muted">이 페이지</p>
      <ul className="space-y-0.5 border-l border-border pl-2.5 text-[13px]">
        {items.map((item, idx) => (
          <li key={`${item.id}-${idx}`}>
            <a
              href={`#${item.id}`}
              className={cn(
                "block rounded px-1.5 py-0.5 transition-colors",
                item.level === 3 && "pl-4 text-[12px]",
                activeId === item.id
                  ? "bg-accent-light font-medium text-accent"
                  : "text-muted hover:text-accent",
              )}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
