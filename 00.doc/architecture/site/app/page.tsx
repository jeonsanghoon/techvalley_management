import Link from "next/link";
import { PageMain } from "@/components/AppShell";
import { Callout } from "@/components/Callout";
import { StatusBadge } from "@/components/StatusBadge";
import {
  DOC_GROUPS,
  IMPLEMENTATION_STATUS,
  LEARNING_PATH,
  getAllDocEntries,
  slugFromRel,
} from "@/lib/manifest";
import { countDocDbCollections } from "@/lib/docdb";
import { countPostgresTables } from "@/lib/postgres";
import { UI_API_ROWS } from "@/lib/ui-api-reference";

export default function HomePage() {
  const docCount = getAllDocEntries().length;
  const pgTables = countPostgresTables();
  const docdbCols = countDocDbCollections();

  return (
    <PageMain>
      <header className="w-full rounded-2xl bg-gradient-to-br from-navy to-navy-dark px-5 py-8 text-white shadow-lg sm:px-8 sm:py-10">
        <p className="text-xs uppercase tracking-[0.2em] opacity-80">Techvalley IoT · Architecture Docs</p>
        <h1 className="mt-2 text-2xl font-bold sm:text-3xl">아키텍처 · YAML · DB 설계 가이드</h1>
        <p className="mt-3 text-sm opacity-90 sm:text-base">
          <code className="rounded bg-white/10 px-1">02.arch/</code> Markdown과 config SSOT를 Next.js SSG로
          페이지별 탐색합니다. MOBI yaml-design 패턴의 사이드바·학습 경로·레퍼런스를 확장했습니다.
        </p>
        <div className="mt-5 flex flex-wrap gap-2 text-xs">
          {["tenant tv", "company→branch→site→device", "Next.js · NestJS · Lambda", "Hot · Warm · Iceberg"].map((b) => (
            <span key={b} className="rounded-full border border-white/25 bg-white/10 px-3 py-1">
              {b}
            </span>
          ))}
        </div>
      </header>

      <section className="mt-8 grid w-full gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {[
          { n: String(docCount), label: "아키텍처 문서", href: "/docs/01-platform-overview/" },
          { n: String(UI_API_ROWS.length), label: "UI ↔ API 매핑", href: "/reference/ui-api/" },
          { n: String(pgTables), label: "Postgres 테이블", href: "/reference/postgres/" },
          { n: String(docdbCols), label: "DocDB 컬렉션", href: "/reference/docdb/" },
          { n: "9", label: "Lambda 앱", href: "/reference/lambda/" },
          { n: "4", label: "업로드 모드", href: `/docs/${slugFromRel("13-media-upload-pipeline.md")}/` },
        ].map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="rounded-xl border border-border bg-white p-5 shadow-sm transition hover:border-accent hover:shadow-md"
          >
            <p className="text-3xl font-bold text-navy">{s.n}</p>
            <p className="mt-1 text-sm text-muted">{s.label}</p>
          </Link>
        ))}
      </section>

      <Callout variant="info">
        <b>권장 학습 순서</b> — 아래 단계를 따라가면 플랫폼 전체 그림을 한 번에 잡을 수 있습니다.
      </Callout>

      <section className="rounded-xl border border-border bg-white p-6">
        <h2 className="text-lg font-bold text-navy">학습 경로</h2>
        <ol className="mt-4 space-y-2">
          {LEARNING_PATH.map((step) => (
            <li key={step.slug} className="flex items-center gap-3 text-sm">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-accent text-xs font-bold text-white">
                {step.step}
              </span>
              <Link href={`/docs/${step.slug}/`} className="font-medium text-navy hover:text-accent">
                {step.title}
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-8">
        <h2 className="mb-4 text-lg font-bold text-navy">도메인별 문서</h2>
        <div className="grid w-full gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {DOC_GROUPS.map((g) => (
            <div key={g.id} className="rounded-xl border border-border bg-white p-5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-2xl">{g.icon}</p>
                  <h3 className="mt-1 font-semibold text-navy">{g.title}</h3>
                  <p className="mt-1 text-sm text-muted">{g.description}</p>
                </div>
                <span className="rounded-full bg-accent-light px-2 py-0.5 text-xs font-medium text-accent">
                  {g.files.length}편
                </span>
              </div>
              <ul className="mt-4 space-y-1 border-t border-border pt-3">
                {g.files.map((f) => (
                  <li key={f.slug}>
                    <Link href={`/docs/${f.slug}/`} className="text-sm text-accent hover:underline">
                      {f.label ?? f.rel}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8 rounded-xl border border-border bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-bold text-navy">구현 상태</h2>
          <Link href="/status/" className="text-sm text-accent hover:underline">
            전체 보기 →
          </Link>
        </div>
        <ul className="mt-4 divide-y divide-border">
          {IMPLEMENTATION_STATUS.slice(0, 5).map((row) => (
            <li key={row.item} className="flex flex-col gap-2 py-3 text-sm sm:flex-row sm:items-center sm:justify-between sm:py-2">
              <span>{row.item}</span>
              <StatusBadge status={row.status} />
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8 grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-6">
        <Link
          href="/reference/lambda/"
          className="rounded-xl border border-border bg-white p-5 hover:border-accent hover:shadow-md"
        >
          <h3 className="font-semibold text-navy">AWS Lambda 9종</h3>
          <p className="mt-1 text-sm text-muted">Node.js 24 · bundle · predeploy · 로컬 테스트</p>
        </Link>
        <Link
          href="/reference/ui-api/"
          className="rounded-xl border border-accent/30 bg-accent-light/30 p-5 hover:border-accent hover:shadow-md sm:col-span-2 lg:col-span-1"
        >
          <h3 className="font-semibold text-navy">UI · API · NestJS</h3>
          <p className="mt-1 text-sm text-muted">화면 ↔ REST · contexts · FOTA · JWT</p>
        </Link>
        <Link
          href="/reference/media-upload/"
          className="rounded-xl border border-border bg-white p-5 hover:border-accent hover:shadow-md"
        >
          <h3 className="font-semibold text-navy">미디어 · S3 업로드</h3>
          <p className="mt-1 text-sm text-muted">이미지 청크 · 비디오 · multipart · samples</p>
        </Link>
        <Link href="/reference/postgres/" className="rounded-xl border border-border bg-white p-5 hover:border-accent">
          <h3 className="font-semibold text-navy">Postgres DDL 상세</h3>
          <p className="mt-1 text-sm text-muted">SQL 파일별 테이블·컬럼 정의</p>
        </Link>
        <Link href="/reference/docdb/" className="rounded-xl border border-border bg-white p-5 hover:border-accent">
          <h3 className="font-semibold text-navy">DocumentDB</h3>
          <p className="mt-1 text-sm text-muted">컬렉션·인덱스·RDS 링크</p>
        </Link>
        <Link href="/reference/config/" className="rounded-xl border border-border bg-white p-5 hover:border-accent">
          <h3 className="font-semibold text-navy">config 트리</h3>
          <p className="mt-1 text-sm text-muted">02.arch/config 전체 파일</p>
        </Link>
      </section>

      <footer className="mt-12 text-center text-xs text-muted">
        SSOT <code>02.arch/</code> · 빌드 <code>npm run build:architecture-docs</code>
      </footer>
    </PageMain>
  );
}
