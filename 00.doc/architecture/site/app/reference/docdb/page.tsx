import type { Metadata } from "next";
import Link from "next/link";
import { PageMain } from "@/components/AppShell";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { loadDocDbCollections, loadRdbmsLinks } from "@/lib/docdb";
import { slugFromRel } from "@/lib/manifest";

export const metadata: Metadata = {
  title: "DocumentDB 레퍼런스",
  description: "03-documentdb.yaml — 컬렉션·인덱스·RDS 링크",
};

export default function DocDbReferencePage() {
  const collections = loadDocDbCollections();
  const links = loadRdbmsLinks();

  return (
    <PageMain>
      <Breadcrumbs items={[{ label: "홈", href: "/" }, { label: "DocumentDB" }]} />

      <header className="mb-8">
        <h1 className="text-2xl font-bold text-navy">DocumentDB Hot Tier</h1>
        <p className="mt-2 text-sm text-muted">
          database <code className="text-xs">iot_service</code> · manifest{" "}
          <code className="text-xs">03-documentdb.yaml</code> · {collections.length} collections
        </p>
        <div className="mt-3 flex flex-wrap gap-3 text-sm">
          <Link href={`/docs/${slugFromRel("config/schema/documentdb/collection-contract.md")}/`} className="text-accent hover:underline">
            컬렉션 계약 문서
          </Link>
          <Link href={`/docs/${slugFromRel("06-schema-reference.md")}/`} className="text-accent hover:underline">
            UI 매핑 (06)
          </Link>
        </div>
      </header>

      <section className="mb-10 rounded-2xl border border-border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-navy">rdbms_time_series_link</h2>
        <p className="mt-1 text-sm text-muted">DocDB 필드 ↔ Postgres 테이블 조인 계약</p>
        <div className="table-scroll overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-sm">
            <thead>
              <tr className="bg-navy text-white">
                <th className="border border-border px-3 py-2">link id</th>
                <th className="border border-border px-3 py-2">DocDB field</th>
                <th className="border border-border px-3 py-2">Postgres tables</th>
              </tr>
            </thead>
            <tbody>
              {links.map((l) => (
                <tr key={l.id} className="even:bg-surface/50">
                  <td className="border border-border px-3 py-2 font-mono text-xs">{l.id}</td>
                  <td className="border border-border px-3 py-2 font-mono text-xs">{l.documentdbField}</td>
                  <td className="border border-border px-3 py-2 text-xs">
                    {l.postgresTables.map((t) => (
                      <code key={t} className="mr-1 rounded bg-accent-light px-1">
                        {t}
                      </code>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="grid w-full gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {collections.map((c) => (
          <article
            key={c.name}
            id={c.name}
            className="scroll-mt-20 rounded-xl border border-border bg-white p-5 shadow-sm"
          >
            <h3 className="font-mono font-bold text-navy">{c.name}</h3>
            {c.description && <p className="mt-1 text-sm text-muted">{c.description}</p>}
            {c.ttl && (
              <p className="mt-2 text-xs text-amber-800">
                TTL: <code>{c.ttl}</code>
              </p>
            )}
            <p className="mt-3 text-xs font-semibold uppercase text-muted">Indexes ({c.indexes.length})</p>
            {c.indexes.length === 0 ? (
              <p className="text-xs text-muted">—</p>
            ) : (
              <ul className="mt-1 max-h-40 space-y-1 overflow-y-auto text-xs font-mono">
                {c.indexes.map((idx, i) => (
                  <li key={i} className="rounded bg-surface px-2 py-1">
                    {idx.name ?? Object.keys(idx.keys ?? {}).join(", ")}
                    {idx.unique ? " · unique" : ""}
                  </li>
                ))}
              </ul>
            )}
          </article>
        ))}
      </div>
    </PageMain>
  );
}
