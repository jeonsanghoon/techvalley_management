import type { Metadata } from "next";
import Link from "next/link";
import { PageMain } from "@/components/AppShell";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { slugFromRel } from "@/lib/manifest";
import {
  APP_LAYERS,
  LAMBDA_APPS,
  LAMBDA_COMMANDS,
  LAMBDA_RUNTIME,
} from "@/lib/lambda-reference";

export const metadata: Metadata = {
  title: "AWS Lambda 개발 레퍼런스",
  description: "파이프라인 Lambda 9종 · Node.js 24 · bundle · predeploy · 로컬 테스트",
};

const docSlug = slugFromRel("15-lambda-development.md");
const pipelineSlug = slugFromRel("02-data-pipeline.md");
const deploySlug = slugFromRel("10-yaml-pipeline-deploy-automation.md");

const GROUP_LABEL: Record<string, string> = {
  ingress: "ingress (수집)",
  batch: "batch (배치)",
  invoke_only: "invoke_only",
  ml: "ml (AI·self-heal)",
};

export default function LambdaReferencePage() {
  return (
    <PageMain>
      <Breadcrumbs
        items={[
          { label: "홈", href: "/" },
          { label: "AWS Lambda 개발", href: `/docs/${docSlug}/` },
          { label: "레퍼런스" },
        ]}
      />

      <header className="mb-8">
        <h1 className="text-2xl font-bold text-navy">AWS Lambda 개발 레퍼런스</h1>
        <p className="mt-2 text-sm text-muted">
          IoT 파이프라인 Lambda <b>9종</b> — NestJS가 아닌 <code>Node.js 24 ESM</code> +{" "}
          <code>@techvalley/pipeline-core</code>. 운영 API는{" "}
          <Link href="/reference/ui-api/" className="text-accent hover:underline">
            NestJS (beckend)
          </Link>
          와 분리됩니다.
        </p>
        <div className="mt-3 flex flex-wrap gap-3 text-sm">
          <Link href={`/docs/${docSlug}/`} className="text-accent hover:underline">
            → ⑮ Lambda 개발 SSOT (전체)
          </Link>
          <Link href={`/docs/${pipelineSlug}/`} className="text-accent hover:underline">
            → ② AWS 파이프라인
          </Link>
          <Link href={`/docs/${deploySlug}/`} className="text-accent hover:underline">
            → ⑩ predeploy · Terraform
          </Link>
        </div>
      </header>

      <section className="mb-8 grid gap-4 sm:grid-cols-3">
        {APP_LAYERS.map((l) => (
          <div key={l.layer} className="rounded-2xl border border-border bg-white p-5 shadow-sm">
            <h2 className="font-bold text-navy">{l.layer}</h2>
            <p className="mt-1 font-mono text-xs text-muted">{l.path}</p>
            <p className="mt-2 text-sm">{l.stack}</p>
            <p className="mt-2 text-xs text-muted">상태: {l.status}</p>
            <Link href={`/docs/${slugFromRel(`${l.doc}.md`)}/`} className="mt-2 inline-block text-xs text-accent hover:underline">
              → {l.doc}.md
            </Link>
          </div>
        ))}
      </section>

      <section className="mb-8 rounded-2xl border border-border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-navy">런타임 · 패키징</h2>
        <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
          {Object.entries(LAMBDA_RUNTIME).map(([k, v]) => (
            <div key={k} className="flex gap-2">
              <dt className="w-28 shrink-0 text-muted">{k}</dt>
              <dd className="font-mono text-xs">{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mb-8 rounded-2xl border border-border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-navy">Lambda 9종</h2>
        <p className="mt-1 text-sm text-muted">
          SSOT: <code>02.arch/config/ingress-deploy.yaml</code> · 편집:{" "}
          <code>apps/&lt;name&gt;/src/handler.mjs</code>
        </p>
        <div className="mt-4 table-scroll overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-sm">
            <thead>
              <tr className="bg-navy text-white">
                <th className="border border-border px-3 py-2 text-left">app</th>
                <th className="border border-border px-3 py-2">deploy_group</th>
                <th className="border border-border px-3 py-2 text-left">트리거</th>
                <th className="border border-border px-3 py-2 text-left">역할</th>
              </tr>
            </thead>
            <tbody>
              {LAMBDA_APPS.map((r) => (
                <tr key={r.app} className="even:bg-surface/50">
                  <td className="border border-border px-3 py-1.5 font-mono text-xs">{r.app}</td>
                  <td className="border border-border px-3 py-1.5 text-center text-xs">
                    {GROUP_LABEL[r.deployGroup] ?? r.deployGroup}
                  </td>
                  <td className="border border-border px-3 py-1.5 text-xs">{r.trigger}</td>
                  <td className="border border-border px-3 py-1.5 text-xs text-muted">{r.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl border border-accent/30 bg-accent-light/20 p-6 shadow-sm">
        <h2 className="text-lg font-bold text-navy">개발 명령</h2>
        <pre className="mt-4 overflow-x-auto rounded-lg bg-[#0e2233] p-4 text-xs text-[#cfe3f2]">
          {`cd 03.source/lambda
npm install
npm run rules:build && npm run lambda:assets
npm run test:local:ingress`}
        </pre>
        <dl className="mt-4 space-y-2 text-sm">
          {LAMBDA_COMMANDS.map((c) => (
            <div key={c.cmd} className="flex flex-col gap-0.5 sm:flex-row sm:gap-3">
              <dt className="shrink-0 font-mono text-xs text-navy">{c.cmd}</dt>
              <dd className="text-xs text-muted">{c.desc}</dd>
            </div>
          ))}
        </dl>
      </section>
    </PageMain>
  );
}
