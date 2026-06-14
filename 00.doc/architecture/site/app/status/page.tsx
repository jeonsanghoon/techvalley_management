import type { Metadata } from "next";
import Link from "next/link";
import { PageMain } from "@/components/AppShell";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { StatusBadge } from "@/components/StatusBadge";
import { IMPLEMENTATION_STATUS, slugFromRel } from "@/lib/manifest";

export const metadata: Metadata = {
  title: "구현 상태",
  description: "테크밸리 IoT 플랫폼 구현 체크리스트",
};

export default function StatusPage() {
  const deploySlug = slugFromRel("10-yaml-pipeline-deploy-automation.md");
  const lambdaSlug = slugFromRel("15-lambda-development.md");
  const uiSlug = slugFromRel("14-backend-frontend-design.md");

  return (
    <PageMain className="max-w-none">
      <Breadcrumbs items={[{ label: "홈", href: "/" }, { label: "구현 상태" }]} />

      <h1 className="text-2xl font-bold text-navy">구현 상태</h1>
      <p className="mt-2 text-sm text-muted">
        SSOT·골격·다음 단계 —{" "}
        <Link href={`/docs/${deploySlug}/`} className="text-accent hover:underline">
          ⑩ predeploy
        </Link>
        {" · "}
        <Link href={`/docs/${lambdaSlug}/`} className="text-accent hover:underline">
          ⑮ Lambda 개발
        </Link>
        {" · "}
        <Link href={`/docs/${uiSlug}/`} className="text-accent hover:underline">
          ⑭ UI · API
        </Link>
      </p>

      <ul className="mt-8 divide-y divide-border rounded-2xl border border-border bg-white shadow-sm">
        {IMPLEMENTATION_STATUS.map((row) => (
          <li key={row.item} className="flex items-center justify-between gap-4 px-6 py-4">
            <span className="text-sm">{row.item}</span>
            <StatusBadge status={row.status} />
          </li>
        ))}
      </ul>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-accent-light/50 p-5 text-sm">
          <p className="font-semibold text-navy">Lambda (파이프라인)</p>
          <pre className="mt-2 overflow-x-auto rounded-lg bg-[#0e2233] p-4 text-xs text-[#cfe3f2]">
{`cd 03.source/lambda
npm run rules:build
npm run lambda:assets
npm run predeploy
npm run test:local:ingress
npm run test:local:batch
npm run test:local:media`}
          </pre>
          <Link href="/reference/lambda/" className="mt-2 inline-block text-accent hover:underline">
            → Lambda 레퍼런스
          </Link>
        </div>
        <div className="rounded-xl border border-border bg-accent-light/50 p-5 text-sm">
          <p className="font-semibold text-navy">Podman · 로컬 E2E</p>
          <pre className="mt-2 overflow-x-auto rounded-lg bg-[#0e2233] p-4 text-xs text-[#cfe3f2]">
{`npm run local:up      # Podman + bootstrap
npm run local:test    # Lambda invoke
npm run local:down    # compose down`}
          </pre>
          <Link href={`/docs/${slugFromRel("16-local-e2e-testing.md")}/`} className="mt-2 inline-block text-accent hover:underline">
            → ⑯ 로컬 E2E · Podman
          </Link>
        </div>
        <div className="rounded-xl border border-border bg-white p-5 text-sm">
          <p className="font-semibold text-navy">프론트엔드 · 백엔드 (예정)</p>
          <pre className="mt-2 overflow-x-auto rounded-lg bg-[#0e2233] p-4 text-xs text-[#cfe3f2]">
{`npm run dev:frontend          # :3000
# NestJS API (next): :3002
# NEXT_PUBLIC_API_URL → beckend`}
          </pre>
          <Link href="/reference/ui-api/" className="mt-2 inline-block text-accent hover:underline">
            → UI · API 레퍼런스
          </Link>
        </div>
      </div>
    </PageMain>
  );
}
