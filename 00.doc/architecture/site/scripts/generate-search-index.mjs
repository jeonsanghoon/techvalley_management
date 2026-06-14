#!/usr/bin/env node
/** Generates search-index.json before next build (SSG). Keep in sync with lib/manifest.ts DOC_GROUPS. */
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SITE = join(__dirname, "..");
const ARCH = join(SITE, "../../../02.arch");
const OUT = join(SITE, "data/search-index.json");

/** All doc rel paths — mirror lib/manifest.ts getAllDocEntries() */
const DOC_RELS = [
  "01-platform-overview.md",
  "02-data-pipeline.md",
  "13-media-upload-pipeline.md",
  "config/samples/mqtt-topics.md",
  "08-greengrass-offline-resilience.md",
  "09-ai-anomaly-rules-and-edge-self-healing.md",
  "03-storage-tiers.md",
  "04-backend-services.md",
  "14-backend-frontend-design.md",
  "15-lambda-development.md",
  "16-local-e2e-testing.md",
  "05-yaml-and-rules.md",
  "10-yaml-pipeline-deploy-automation.md",
  "06-schema-reference.md",
  "12-database-design.md",
  "config/schema/org-hierarchy.md",
  "config/schema/documentdb/collection-contract.md",
  "config/schema/documentdb/document-schema-anchors.md",
  "config/schema/postgres/README.md",
  "config/schema/iceberg/README.md",
  "07-repo-and-deployment.md",
  "11-config-examples-reference.md",
  "config/README.md",
  "config/local/README.md",
  "config/samples/s3-object-layout.example.md",
];

function slugFromRel(rel) {
  return rel
    .replace(/^__generated\//, "gen-")
    .replace(/\.md$/i, "")
    .replace(/\//g, "-")
    .replace(/[^a-z0-9-]/gi, "-")
    .toLowerCase()
    .replace(/-+/g, "-");
}

function readMd(rel) {
  const p = join(ARCH, rel);
  if (!existsSync(p)) return "";
  return readFileSync(p, "utf8");
}

function titleFrom(md, rel) {
  const m = md.match(/^#\s+(.+)$/m);
  return m?.[1]?.trim() ?? rel;
}

function excerptFrom(md) {
  for (const line of md.split("\n")) {
    const t = line.trim();
    if (t && !t.startsWith("#")) return t.slice(0, 240);
  }
  return "";
}

function postgresInventoryExcerpt() {
  const dir = join(ARCH, "config/schema/postgres");
  const files = readdirSync(dir).filter((f) => f.endsWith(".sql"));
  return `Postgres DDL ${files.length} files — alert, notification, telemetry rollups, device, company…`;
}

const index = DOC_RELS.filter((rel) => existsSync(join(ARCH, rel))).map((rel) => {
  const md = readMd(rel);
  return {
    slug: slugFromRel(rel),
    title: titleFrom(md, rel),
    rel,
    excerpt: excerptFrom(md),
  };
});

index.push({
  slug: "gen-postgres-table-inventory",
  title: "Postgres 테이블 인벤토리",
  rel: "__generated/postgres-table-inventory.md",
  excerpt: postgresInventoryExcerpt(),
});

const REFERENCE_PAGES = [
  {
    slug: "reference-media-upload",
    title: "미디어 · S3 업로드 레퍼런스",
    rel: "reference/media-upload",
    excerpt: "이미지 청크 · 비디오 스트림 · single PUT · multipart · MQTT file/* · samples JSON",
  },
  {
    slug: "reference-lambda",
    title: "AWS Lambda 9종 개발 레퍼런스",
    rel: "reference/lambda",
    excerpt: "Node.js 24 ESM · pipeline-core · 9종 handler · bundle · predeploy · test:local:ingress batch media",
  },
  {
    slug: "reference-ui-api",
    title: "UI · API · NestJS 레퍼런스",
    rel: "reference/ui-api",
    excerpt:
      "운영 포털 화면 ↔ REST API · NestJS contexts · FOTA update-jobs · Cognito JWT companyId branchId siteId",
  },
  {
    slug: "reference-postgres",
    title: "Postgres DDL 레퍼런스",
    rel: "reference/postgres",
    excerpt: "Aurora PostgreSQL Warm Tier — SQL 파일별 테이블·컬럼 정의",
  },
  {
    slug: "reference-docdb",
    title: "DocumentDB 레퍼런스",
    rel: "reference/docdb",
    excerpt: "Hot Tier 컬렉션 · 인덱스 · manifest processes",
  },
];

index.push(...REFERENCE_PAGES);

writeFileSync(OUT, JSON.stringify(index, null, 2), "utf8");
console.log(`Wrote ${OUT} (${index.length} entries)`);
