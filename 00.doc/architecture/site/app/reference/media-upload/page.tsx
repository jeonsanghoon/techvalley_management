import type { Metadata } from "next";
import Link from "next/link";
import { PageMain } from "@/components/AppShell";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import {
  FILE_CONVERTER_RULES,
  MEDIA_POSTGRES_TABLES,
  MQTT_FILE_TOPICS,
  UPLOAD_MODES,
  formatBytes,
  loadFileSamples,
  loadMediaUploadConfig,
} from "@/lib/media-upload-reference";
import { slugFromRel } from "@/lib/manifest";

export const metadata: Metadata = {
  title: "미디어 · S3 업로드 레퍼런스",
  description: "이미지 청크 · 비디오 스트림 · single/multipart · MQTT · samples",
};

export default function MediaUploadReferencePage() {
  const config = loadMediaUploadConfig();
  const samples = loadFileSamples();
  const docSlug = slugFromRel("13-media-upload-pipeline.md");

  return (
    <PageMain>
      <Breadcrumbs
        items={[
          { label: "홈", href: "/" },
          { label: "미디어 업로드", href: `/docs/${docSlug}/` },
          { label: "레퍼런스" },
        ]}
      />

      <header className="mb-8">
        <h1 className="text-2xl font-bold text-navy">미디어 · S3 업로드 레퍼런스</h1>
        <p className="mt-2 text-sm text-muted">
          이미지 청크 · 비디오 스트림 · 단일 PUT · 멀티파트 — MQTT 메타 + S3 Presigned
        </p>
        <div className="mt-2 flex flex-wrap gap-3 text-sm">
          <Link href={`/docs/${docSlug}/`} className="text-accent hover:underline">
            → ⑬ 미디어 업로드 파이프라인 (전체)
          </Link>
          <Link href="/reference/lambda/" className="text-accent hover:underline">
            → file-upload-orchestrator (Lambda)
          </Link>
        </div>
      </header>

      <section className="mb-8 rounded-2xl border border-border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-navy">업로드 모드</h2>
        <div className="mt-4 table-scroll overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr className="bg-navy text-white">
                <th className="border border-border px-3 py-2">upload_mode</th>
                <th className="border border-border px-3 py-2">설명</th>
                <th className="border border-border px-3 py-2">조건</th>
                <th className="border border-border px-3 py-2">S3 API</th>
                <th className="border border-border px-3 py-2">샘플</th>
              </tr>
            </thead>
            <tbody>
              {UPLOAD_MODES.map((m) => (
                <tr key={m.mode} className="even:bg-surface/50">
                  <td className="border border-border px-3 py-2 font-mono text-xs">{m.mode}</td>
                  <td className="border border-border px-3 py-2">{m.label}</td>
                  <td className="border border-border px-3 py-2 text-muted">{m.condition}</td>
                  <td className="border border-border px-3 py-2 text-xs">{m.s3}</td>
                  <td className="border border-border px-3 py-2 font-mono text-[11px]">{m.sample}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-8 rounded-2xl border border-border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-navy">media-upload.yaml (임계값)</h2>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg bg-surface p-3">
            <dt className="text-xs text-muted">single_put_max</dt>
            <dd className="font-semibold text-navy">
              {formatBytes(config.thresholds?.single_put_max_bytes)}
            </dd>
          </div>
          <div className="rounded-lg bg-surface p-3">
            <dt className="text-xs text-muted">multipart_part_size</dt>
            <dd className="font-semibold text-navy">
              {formatBytes(config.thresholds?.multipart_part_size_bytes)}
            </dd>
          </div>
          <div className="rounded-lg bg-surface p-3">
            <dt className="text-xs text-muted">image_chunk_size</dt>
            <dd className="font-semibold text-navy">
              {formatBytes(config.thresholds?.image_chunk_size_bytes)}
            </dd>
          </div>
          <div className="rounded-lg bg-surface p-3">
            <dt className="text-xs text-muted">Presigned TTL (single)</dt>
            <dd className="font-semibold text-navy">
              {config.presigned?.single_put_expires_seconds ?? "—"}s
            </dd>
          </div>
          <div className="rounded-lg bg-surface p-3">
            <dt className="text-xs text-muted">Presigned TTL (part)</dt>
            <dd className="font-semibold text-navy">
              {config.presigned?.part_url_expires_seconds ?? "—"}s
            </dd>
          </div>
          <div className="rounded-lg bg-surface p-3">
            <dt className="text-xs text-muted">video segment</dt>
            <dd className="font-semibold text-navy">
              {config.thresholds?.video_stream_segment_duration_sec ?? "—"}s
            </dd>
          </div>
        </dl>
        <p className="mt-3 text-xs text-muted">
          SSOT: <code className="rounded bg-accent-light px-1">02.arch/config/media-upload.yaml</code>
        </p>
      </section>

      <section className="mb-8 rounded-2xl border border-border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-navy">MQTT 토픽 (domain file)</h2>
        <div className="mt-4 table-scroll overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-sm">
            <thead>
              <tr className="bg-navy text-white">
                <th className="border border-border px-3 py-2">role</th>
                <th className="border border-border px-3 py-2">토픽</th>
                <th className="border border-border px-3 py-2">방향</th>
              </tr>
            </thead>
            <tbody>
              {MQTT_FILE_TOPICS.map((t) => (
                <tr key={t.role} className="even:bg-surface/50">
                  <td className="border border-border px-3 py-2 font-mono text-xs">{t.role}</td>
                  <td className="border border-border px-3 py-2 font-mono text-[11px]">{t.topic}</td>
                  <td className="border border-border px-3 py-2 text-xs">{t.dir}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-8 rounded-2xl border border-border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-navy">converter-rules (file 8종)</h2>
        <ul className="mt-4 space-y-2">
          {FILE_CONVERTER_RULES.map((r) => (
            <li key={r.file} className="flex flex-wrap items-baseline gap-2 text-sm">
              <code className="rounded bg-accent-light px-2 py-0.5 font-mono text-xs">{r.file}</code>
              <span className="text-muted">role={r.role}</span>
              <span>— {r.desc}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-muted">
          Lambda: <code className="rounded bg-accent-light px-1">file-upload-orchestrator</code> (request·complete·abort)
          · Hot: <code className="rounded bg-accent-light px-1">files_history</code>
        </p>
      </section>

      <section className="mb-8 rounded-2xl border border-border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-navy">Aurora 테이블 (Warm)</h2>
        <ul className="mt-4 divide-y divide-border">
          {MEDIA_POSTGRES_TABLES.map((t) => (
            <li key={t.name} className="flex flex-wrap items-baseline justify-between gap-2 py-2">
              <code className="font-mono text-sm text-navy">{t.name}</code>
              <span className="text-sm text-muted">{t.desc}</span>
            </li>
          ))}
        </ul>
        <Link href="/reference/postgres/" className="mt-3 inline-block text-sm text-accent hover:underline">
          → Postgres DDL 상세
        </Link>
      </section>

      <section className="rounded-2xl border border-border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-navy">샘플 JSON ({samples.length}개)</h2>
        <div className="mt-4 space-y-4">
          {samples.map((s) => (
            <details key={s.filename} className="rounded-xl border border-border bg-surface/30">
              <summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-navy">
                {s.title}
                {s.uploadMode && (
                  <span className="ml-2 font-normal text-muted">({s.uploadMode})</span>
                )}
                <span className="ml-2 font-mono text-[11px] font-normal text-muted">{s.rel}</span>
              </summary>
              <pre className="overflow-x-auto border-t border-border bg-[#0e2233] p-4 text-xs text-[#cfe3f2]">
                {JSON.stringify(s.content, null, 2)}
              </pre>
            </details>
          ))}
        </div>
      </section>
    </PageMain>
  );
}
