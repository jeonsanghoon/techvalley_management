import type { Metadata } from "next";
import Link from "next/link";
import { PageMain } from "@/components/AppShell";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CONFIG_HIGHLIGHTS, loadConfigTree } from "@/lib/config-tree";
import { slugFromRel } from "@/lib/manifest";

export const metadata: Metadata = {
  title: "config SSOT 트리",
  description: "02.arch/config/ 전체 파일 목록",
};

const KIND_COLOR: Record<string, string> = {
  yaml: "bg-violet-100 text-violet-800",
  json: "bg-amber-100 text-amber-900",
  sql: "bg-sky-100 text-sky-900",
  md: "bg-emerald-100 text-emerald-900",
  mjs: "bg-orange-100 text-orange-900",
  sh: "bg-stone-100 text-stone-800",
  py: "bg-yellow-100 text-yellow-900",
  other: "bg-gray-100 text-gray-700",
};

export default function ConfigReferencePage() {
  const files = loadConfigTree();

  return (
    <PageMain>
      <Breadcrumbs items={[{ label: "홈", href: "/" }, { label: "config 트리" }]} />

      <header className="mb-8">
        <h1 className="text-2xl font-bold text-navy">02.arch/config/ SSOT</h1>
        <p className="mt-2 text-sm text-muted">
          {files.length} files · sync:{" "}
          <code className="text-xs">npm run sync:config --prefix 03.source/lambda</code>
        </p>
        <Link
          href={`/docs/${slugFromRel("config/README.md")}/`}
          className="mt-2 inline-block text-sm text-accent hover:underline"
        >
          → config README 문서
        </Link>
      </header>

      <section className="mb-8 rounded-2xl border border-border bg-white p-6">
        <h2 className="font-bold text-navy">주요 파일</h2>
        <ul className="mt-4 space-y-2">
          {CONFIG_HIGHLIGHTS.map((h) => (
            <li key={h.path} className="flex flex-wrap items-baseline gap-2 text-sm">
              <code className="rounded bg-accent-light px-2 py-0.5 font-mono text-xs">{h.path}</code>
              <span className="text-muted">{h.desc}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-border bg-white p-6 shadow-sm">
        <h2 className="mb-4 font-bold text-navy">전체 파일 ({files.length})</h2>
        <ul className="grid w-full gap-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {files.map((f) => (
            <li
              key={f.path}
              className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs hover:bg-surface"
            >
              <span className={`shrink-0 rounded px-1.5 py-0.5 font-medium ${KIND_COLOR[f.kind] ?? KIND_COLOR.other}`}>
                {f.kind}
              </span>
              <code className="truncate font-mono">{f.path}</code>
            </li>
          ))}
        </ul>
      </section>
    </PageMain>
  );
}
