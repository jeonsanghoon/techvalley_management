import Link from "next/link";
import type { DocManifestEntry } from "@/lib/manifest";

type Props = { prev?: DocManifestEntry; next?: DocManifestEntry };

export function PrevNextNav({ prev, next }: Props) {
  if (!prev && !next) return null;
  return (
    <nav className="mt-10 grid gap-3 border-t border-border pt-6 sm:grid-cols-2">
      {prev ? (
        <Link
          href={`/docs/${prev.slug}/`}
          className="group rounded-xl border border-border bg-white p-4 transition hover:border-accent hover:shadow-sm"
        >
          <span className="text-xs text-muted">← 이전</span>
          <p className="mt-1 font-semibold text-navy group-hover:text-accent">
            {prev.label ?? prev.rel}
          </p>
        </Link>
      ) : (
        <div className="hidden sm:block" />
      )}
      {next ? (
        <Link
          href={`/docs/${next.slug}/`}
          className="group rounded-xl border border-border bg-white p-4 transition hover:border-accent hover:shadow-sm sm:text-right"
        >
          <span className="text-xs text-muted">다음 →</span>
          <p className="mt-1 font-semibold text-navy group-hover:text-accent">
            {next.label ?? next.rel}
          </p>
        </Link>
      ) : null}
    </nav>
  );
}
