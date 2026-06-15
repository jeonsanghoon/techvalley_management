import type { Metadata } from "next";
import Link from "next/link";
import { PageMain } from "@/components/AppShell";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { loadPostgresSchema } from "@/lib/postgres";
import { slugFromRel } from "@/lib/manifest";

export const metadata: Metadata = {
  title: "Postgres DDL 레퍼런스",
  description: "02.arch/config/schema/postgres — 테이블·컬럼 상세",
};

export default function PostgresReferencePage() {
  const schema = loadPostgresSchema();
  const total = schema.reduce((n, f) => n + f.tables.length, 0);

  return (
    <PageMain>
      <Breadcrumbs items={[{ label: "홈", href: "/" }, { label: "Postgres DDL" }]} />

      <header className="mb-8">
        <h1 className="text-2xl font-bold text-navy">Aurora PostgreSQL DDL 레퍼런스</h1>
        <p className="mt-2 text-sm text-muted">
          Warm Tier SSOT · 총 <b>{total}</b> 테이블 · bootstrap:{" "}
          <code className="text-xs">10.local/bootstrap-postgres.sh</code>
        </p>
        <Link
          href={`/docs/${slugFromRel("config/schema/org-hierarchy.md")}/`}
          className="mt-2 inline-block text-sm text-accent hover:underline"
        >
          → 조직 · 자산 계층 (company → branch → site → device)
        </Link>
        <Link
          href={`/docs/${slugFromRel("12-database-design.md")}/`}
          className="mt-1 block text-sm text-accent hover:underline"
        >
          → ⑫ DB 설계 SSOT 문서
        </Link>
        <Link
          href="/reference/media-upload/"
          className="mt-1 block text-sm text-accent hover:underline"
        >
          → 미디어 업로드 테이블 (media_upload_session · part · stream_segment)
        </Link>
      </header>

      <div className="space-y-8">
        {schema.map((file) => (
          <section key={file.file} className="rounded-2xl border border-border bg-white p-6 shadow-sm">
            <h2 className="font-mono text-lg font-bold text-navy">{file.file}</h2>
            <p className="text-sm text-muted">{file.tables.length} tables</p>

            <div className="mt-4 space-y-6">
              {file.tables.map((table) => (
                <div key={table.name} id={table.name} className="scroll-mt-20">
                  <h3 className="border-l-4 border-accent pl-3 font-semibold text-navy">
                    <code>{table.name}</code>
                    <span className="ml-2 text-xs font-normal text-muted">
                      {table.columns.length} columns
                    </span>
                  </h3>
                  {table.columns.length > 0 ? (
                    <div className="table-scroll -mx-2 overflow-x-auto sm:mx-0">
                      <table className="w-full min-w-[480px] border-collapse text-sm">
                        <thead>
                          <tr className="bg-navy text-white">
                            <th className="border border-border px-3 py-2 text-left">컬럼</th>
                            <th className="border border-border px-3 py-2 text-left">정의</th>
                          </tr>
                        </thead>
                        <tbody>
                          {table.columns.map((col, colIdx) => (
                            <tr key={`${table.name}-${colIdx}-${col.name}`} className="even:bg-surface/50">
                              <td className="border border-border px-3 py-1.5 font-mono text-xs font-semibold">
                                {col.name}
                              </td>
                              <td className="border border-border px-3 py-1.5 font-mono text-xs text-muted">
                                {col.definition}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-muted">컬럼 파싱 없음 — SQL 파일 직접 참조</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </PageMain>
  );
}
