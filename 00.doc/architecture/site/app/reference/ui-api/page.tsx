import type { Metadata } from "next";
import Link from "next/link";
import { PageMain } from "@/components/AppShell";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { slugFromRel } from "@/lib/manifest";
import {
  BACKEND_STACK,
  FOTA_API,
  FRONTEND_STACK,
  JWT_CLAIMS,
  NESTJS_CONTEXTS,
  ORG_QUERY_PARAMS,
  UI_API_ROWS,
} from "@/lib/ui-api-reference";

export const metadata: Metadata = {
  title: "UI · API · NestJS 레퍼런스",
  description: "운영 포털 화면 ↔ REST API · 바운디드 컨텍스트 · FOTA · Cognito claim",
};

const docSlug = slugFromRel("14-backend-frontend-design.md");
const orgSlug = slugFromRel("config/schema/org-hierarchy.md");
const backendSlug = slugFromRel("04-backend-services.md");
const lambdaSlug = slugFromRel("15-lambda-development.md");

export default function UiApiReferencePage() {
  const serviceRows = UI_API_ROWS.filter((r) => r.channel === "service");
  const adminRows = UI_API_ROWS.filter((r) => r.channel === "admin");

  return (
    <PageMain>
      <Breadcrumbs
        items={[
          { label: "홈", href: "/" },
          { label: "UI · API · NestJS", href: `/docs/${docSlug}/` },
          { label: "레퍼런스" },
        ]}
      />

      <header className="mb-8">
        <h1 className="text-2xl font-bold text-navy">UI · API · NestJS 레퍼런스</h1>
        <p className="mt-2 text-sm text-muted">
          운영 포털(<code>03.source/frontend</code>) 화면과 NestJS API 계약 — 파이프라인 Lambda는{" "}
          <Link href="/reference/lambda/" className="text-accent hover:underline">
            별도 레퍼런스
          </Link>
          .
        </p>
        <div className="mt-3 flex flex-wrap gap-3 text-sm">
          <Link href={`/docs/${docSlug}/`} className="text-accent hover:underline">
            → ⑭ 백엔드·프론트엔드 설계 (전체)
          </Link>
          <Link href={`/docs/${backendSlug}/`} className="text-accent hover:underline">
            → ④ 백엔드 MSA
          </Link>
          <Link href={`/docs/${lambdaSlug}/`} className="text-accent hover:underline">
            → ⑮ AWS Lambda 개발
          </Link>
          <Link href={`/docs/${orgSlug}/`} className="text-accent hover:underline">
            → 조직 · 자산 계층
          </Link>
        </div>
      </header>

      <section className="mb-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
          <h2 className="font-bold text-navy">프론트엔드</h2>
          <dl className="mt-3 space-y-2 text-sm">
            {FRONTEND_STACK.map((r) => (
              <div key={r.item} className="flex gap-2">
                <dt className="w-24 shrink-0 text-muted">{r.item}</dt>
                <dd className="font-mono text-xs">{r.value}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
          <h2 className="font-bold text-navy">백엔드 (예정)</h2>
          <dl className="mt-3 space-y-2 text-sm">
            {BACKEND_STACK.map((r) => (
              <div key={r.item} className="flex gap-2">
                <dt className="w-24 shrink-0 text-muted">{r.item}</dt>
                <dd className="font-mono text-xs">{r.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="mb-8 rounded-2xl border border-border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-navy">서비스 웹 — UI ↔ API</h2>
        <p className="mt-1 text-sm text-muted">
          JWT <code>companyId</code> · <code>branchId</code> · <code>siteId</code> 조직 스코프 · 목록 query:{" "}
          {ORG_QUERY_PARAMS.map((p) => (
            <code key={p} className="mr-1">
              {p}
            </code>
          ))}
        </p>
        <Table rows={serviceRows} />
      </section>

      <section className="mb-8 rounded-2xl border border-border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-navy">관리 콘솔 — UI ↔ API</h2>
        <p className="mt-1 text-sm text-muted">플랫폼·테넌트·인증서·YAML·펌웨어 카탈로그</p>
        <Table rows={adminRows} />
      </section>

      <section className="mb-8 rounded-2xl border border-border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-navy">NestJS 바운디드 컨텍스트</h2>
        <p className="mt-1 text-sm text-muted">
          FOTA Lite <code>contexts/</code> 패턴 — <code>entities · controllers · services · modules · doc/</code>
        </p>
        <div className="mt-4 table-scroll overflow-x-auto">
          <table className="w-full min-w-[480px] border-collapse text-sm">
            <thead>
              <tr className="bg-navy text-white">
                <th className="border border-border px-3 py-2 text-left">context</th>
                <th className="border border-border px-3 py-2 text-left">역할</th>
              </tr>
            </thead>
            <tbody>
              {NESTJS_CONTEXTS.map((c) => (
                <tr key={c.id} className="even:bg-surface/50">
                  <td className="border border-border px-3 py-1.5 font-mono text-xs font-semibold">{c.id}</td>
                  <td className="border border-border px-3 py-1.5 text-xs text-muted">{c.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-8 rounded-2xl border border-accent/30 bg-accent-light/20 p-6 shadow-sm">
        <h2 className="text-lg font-bold text-navy">FOTA · OTA API</h2>
        <p className="mt-1 text-sm text-muted">
          <Link href={`/docs/${slugFromRel("08-greengrass-offline-resilience.md")}/`} className="text-accent hover:underline">
            Greengrass OTA
          </Link>
          · Hot <code>fota_history</code> · Job → IoT Core
        </p>
        <div className="mt-4 table-scroll overflow-x-auto">
          <table className="w-full min-w-[400px] border-collapse text-sm">
            <thead>
              <tr className="bg-navy text-white">
                <th className="border border-border px-3 py-2">Method</th>
                <th className="border border-border px-3 py-2">Path</th>
                <th className="border border-border px-3 py-2">설명</th>
              </tr>
            </thead>
            <tbody>
              {FOTA_API.map((r) => (
                <tr key={r.path} className="even:bg-surface/50">
                  <td className="border border-border px-3 py-1.5 font-mono text-xs">{r.method}</td>
                  <td className="border border-border px-3 py-1.5 font-mono text-xs">{r.path}</td>
                  <td className="border border-border px-3 py-1.5 text-xs">{r.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-navy">Cognito JWT claim</h2>
        <div className="mt-4 table-scroll overflow-x-auto">
          <table className="w-full min-w-[360px] border-collapse text-sm">
            <thead>
              <tr className="bg-navy text-white">
                <th className="border border-border px-3 py-2">claim</th>
                <th className="border border-border px-3 py-2">용도</th>
              </tr>
            </thead>
            <tbody>
              {JWT_CLAIMS.map((c) => (
                <tr key={c.claim} className="even:bg-surface/50">
                  <td className="border border-border px-3 py-1.5 font-mono text-xs">{c.claim}</td>
                  <td className="border border-border px-3 py-1.5 text-xs">{c.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </PageMain>
  );
}

function Table({ rows }: { rows: typeof UI_API_ROWS }) {
  return (
    <div className="mt-4 table-scroll overflow-x-auto">
      <table className="w-full min-w-[720px] border-collapse text-sm">
        <thead>
          <tr className="bg-navy text-white">
            <th className="border border-border px-3 py-2 text-left">UI route</th>
            <th className="border border-border px-3 py-2 text-left">menuId</th>
            <th className="border border-border px-3 py-2">scope</th>
            <th className="border border-border px-3 py-2 text-left">API</th>
            <th className="border border-border px-3 py-2">WBS</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.menuId} className="even:bg-surface/50">
              <td className="border border-border px-3 py-1.5 font-mono text-xs">{r.uiRoute}</td>
              <td className="border border-border px-3 py-1.5 font-mono text-xs">{r.menuId}</td>
              <td className="border border-border px-3 py-1.5 text-center text-xs">{r.dataScope}</td>
              <td className="border border-border px-3 py-1.5 font-mono text-xs text-muted">{r.api}</td>
              <td className="border border-border px-3 py-1.5 text-xs">{r.wbs ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
