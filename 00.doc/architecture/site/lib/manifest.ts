export type DocGroupId =
  | "overview"
  | "pipeline"
  | "media"
  | "edge"
  | "ai"
  | "storage"
  | "backend"
  | "yaml"
  | "database"
  | "deploy";

export type DocManifestEntry = {
  rel: string;
  label?: string;
  slug: string;
  generated?: boolean;
};

export type DocGroup = {
  id: DocGroupId;
  title: string;
  description: string;
  icon: string;
  files: DocManifestEntry[];
};

export const GROUP_ORDER: DocGroupId[] = [
  "overview",
  "pipeline",
  "media",
  "edge",
  "ai",
  "storage",
  "backend",
  "yaml",
  "database",
  "deploy",
];

export function slugFromRel(rel: string): string {
  return rel
    .replace(/^__generated\//, "gen-")
    .replace(/\.md$/i, "")
    .replace(/\//g, "-")
    .replace(/[^a-z0-9-]/gi, "-")
    .toLowerCase()
    .replace(/-+/g, "-");
}

export const DOC_GROUPS: DocGroup[] = [
  {
    id: "overview",
    title: "개요",
    description: "WBS A1~A12, batch vs realtime, 조직·자산 계층",
    icon: "◎",
    files: [{ rel: "01-platform-overview.md", label: "① 플랫폼 개요", slug: slugFromRel("01-platform-overview.md") }],
  },
  {
    id: "pipeline",
    title: "데이터 파이프라인",
    description: "IoT → KDS → Lambda → Hot/Cold, 배치·DLQ·알람",
    icon: "⇄",
    files: [{ rel: "02-data-pipeline.md", label: "② AWS 파이프라인", slug: slugFromRel("02-data-pipeline.md") }],
  },
  {
    id: "media",
    title: "미디어 · S3 업로드",
    description: "이미지 청크 · 비디오 스트림 · single/multipart",
    icon: "▣",
    files: [
      { rel: "13-media-upload-pipeline.md", label: "⑬ 미디어 업로드", slug: slugFromRel("13-media-upload-pipeline.md") },
      {
        rel: "config/samples/mqtt-topics.md",
        label: "MQTT 토픽 예시 (file 포함)",
        slug: slugFromRel("config/samples/mqtt-topics.md"),
      },
    ],
  },
  {
    id: "edge",
    title: "Greengrass · 엣지",
    description: "Disk Spooler 50MB, OTA, 오프라인 복구 시퀀스",
    icon: "⬡",
    files: [
      {
        rel: "08-greengrass-offline-resilience.md",
        label: "⑦ 오프라인 · 복구",
        slug: slugFromRel("08-greengrass-offline-resilience.md"),
      },
    ],
  },
  {
    id: "ai",
    title: "알람 · AI",
    description: "SageMaker 이상탐지, 룰 추천, 엣지 self-heal",
    icon: "◈",
    files: [
      {
        rel: "09-ai-anomaly-rules-and-edge-self-healing.md",
        label: "⑧ AI · 룰 · self-heal",
        slug: slugFromRel("09-ai-anomaly-rules-and-edge-self-healing.md"),
      },
    ],
  },
  {
    id: "storage",
    title: "3-Tier Storage",
    description: "Hot 7d · Warm 7~90d · Cold 90d+, CQRS, UI scope",
    icon: "▤",
    files: [{ rel: "03-storage-tiers.md", label: "③ 저장 Tier", slug: slugFromRel("03-storage-tiers.md") }],
  },
  {
    id: "backend",
    title: "백엔드 · Lambda",
    description: "MSA · Lambda 9종 · Next.js/NestJS UI·API · Node.js 24 개발",
    icon: "⬢",
    files: [
      { rel: "04-backend-services.md", label: "④ 백엔드 MSA", slug: slugFromRel("04-backend-services.md") },
      {
        rel: "14-backend-frontend-design.md",
        label: "⑭ UI · API · NestJS",
        slug: slugFromRel("14-backend-frontend-design.md"),
      },
      {
        rel: "15-lambda-development.md",
        label: "⑮ AWS Lambda 개발",
        slug: slugFromRel("15-lambda-development.md"),
      },
      {
        rel: "16-local-e2e-testing.md",
        label: "⑯ 로컬 E2E · Podman",
        slug: slugFromRel("16-local-e2e-testing.md"),
      },
    ],
  },
  {
    id: "yaml",
    title: "YAML · 배포",
    description: "4층 YAML, MQTT 8세그, predeploy → Terraform",
    icon: "⎇",
    files: [
      { rel: "05-yaml-and-rules.md", label: "⑤ YAML 4층 · MQTT", slug: slugFromRel("05-yaml-and-rules.md") },
      {
        rel: "10-yaml-pipeline-deploy-automation.md",
        label: "⑩ predeploy · Terraform",
        slug: slugFromRel("10-yaml-pipeline-deploy-automation.md"),
      },
    ],
  },
  {
    id: "database",
    title: "DB 설계",
    description: "DocumentDB · Postgres · Iceberg, UI 매핑, DDL",
    icon: "▦",
    files: [
      { rel: "06-schema-reference.md", label: "⑥ 스키마 · UI 매핑", slug: slugFromRel("06-schema-reference.md") },
      { rel: "12-database-design.md", label: "⑫ DB 설계 SSOT", slug: slugFromRel("12-database-design.md") },
      {
        rel: "config/schema/org-hierarchy.md",
        label: "조직 · 자산 계층",
        slug: slugFromRel("config/schema/org-hierarchy.md"),
      },
      {
        rel: "config/schema/documentdb/collection-contract.md",
        label: "DocDB 컬렉션 계약",
        slug: slugFromRel("config/schema/documentdb/collection-contract.md"),
      },
      {
        rel: "config/schema/documentdb/document-schema-anchors.md",
        label: "DocDB schema anchors",
        slug: slugFromRel("config/schema/documentdb/document-schema-anchors.md"),
      },
      {
        rel: "config/schema/postgres/README.md",
        label: "Postgres DDL README",
        slug: slugFromRel("config/schema/postgres/README.md"),
      },
      {
        rel: "__generated/postgres-table-inventory.md",
        label: "Postgres 테이블 인벤토리",
        slug: slugFromRel("__generated/postgres-table-inventory.md"),
        generated: true,
      },
      {
        rel: "config/schema/iceberg/README.md",
        label: "Iceberg · S3 · Firehose",
        slug: slugFromRel("config/schema/iceberg/README.md"),
      },
    ],
  },
  {
    id: "deploy",
    title: "저장소 · config",
    description: "Repo · Podman 로컬 E2E · config SSOT",
    icon: "⌘",
    files: [
      { rel: "07-repo-and-deployment.md", label: "⑦ Repo · CI/CD", slug: slugFromRel("07-repo-and-deployment.md") },
      {
        rel: "16-local-e2e-testing.md",
        label: "⑯ 로컬 E2E · Podman",
        slug: slugFromRel("16-local-e2e-testing.md"),
      },
      {
        rel: "11-config-examples-reference.md",
        label: "⑪ config 샘플 레퍼런스",
        slug: slugFromRel("11-config-examples-reference.md"),
      },
      { rel: "config/README.md", label: "config/ SSOT 인덱스", slug: slugFromRel("config/README.md") },
      {
        rel: "config/local/README.md",
        label: "로컬 Podman compose",
        slug: slugFromRel("config/local/README.md"),
      },
      {
        rel: "config/samples/s3-object-layout.example.md",
        label: "S3 객체 레이아웃 예시",
        slug: slugFromRel("config/samples/s3-object-layout.example.md"),
      },
    ],
  },
];

export const LEARNING_PATH = [
  { step: 1, slug: slugFromRel("01-platform-overview.md"), title: "플랫폼 개요" },
  { step: 2, slug: slugFromRel("config/schema/org-hierarchy.md"), title: "조직 · 자산 계층" },
  { step: 3, slug: slugFromRel("02-data-pipeline.md"), title: "AWS 파이프라인" },
  { step: 4, slug: slugFromRel("13-media-upload-pipeline.md"), title: "미디어 · S3 업로드" },
  { step: 5, slug: slugFromRel("03-storage-tiers.md"), title: "3-Tier Storage" },
  { step: 6, slug: slugFromRel("05-yaml-and-rules.md"), title: "YAML 4층" },
  { step: 7, slug: slugFromRel("14-backend-frontend-design.md"), title: "UI · API · NestJS" },
  { step: 8, slug: slugFromRel("15-lambda-development.md"), title: "AWS Lambda 개발" },
  { step: 9, slug: slugFromRel("06-schema-reference.md"), title: "스키마 · UI" },
  { step: 10, slug: slugFromRel("12-database-design.md"), title: "DB 설계" },
  { step: 11, slug: slugFromRel("10-yaml-pipeline-deploy-automation.md"), title: "predeploy" },
  { step: 12, slug: slugFromRel("08-greengrass-offline-resilience.md"), title: "Greengrass" },
  { step: 13, slug: slugFromRel("09-ai-anomaly-rules-and-edge-self-healing.md"), title: "AI · self-heal" },
  { step: 14, slug: slugFromRel("16-local-e2e-testing.md"), title: "로컬 E2E · Podman" },
];

export const IMPLEMENTATION_STATUS = [
  { item: "02.arch 문서 19개 + config SSOT", status: "done" as const },
  { item: "로컬 E2E 스펙 (16-local-e2e-testing · Podman)", status: "done" as const },
  { item: "UI·API·NestJS 설계 (14-backend-frontend-design)", status: "done" as const },
  { item: "AWS Lambda 개발 스펙 (15-lambda-development)", status: "done" as const },
  { item: "프론트 UI + mock + DataScope (03.source/frontend)", status: "done" as const },
  { item: "converter-rules + rules JSON 13종 (file 8 + core 5)", status: "done" as const },
  { item: "미디어 업로드 (image_chunk · video_stream · S3)", status: "done" as const },
  { item: "Postgres/DocDB DDL + bootstrap", status: "done" as const },
  { item: "Lambda 9종 skeleton + pipeline-core", status: "skeleton" as const },
  { item: "file-upload-orchestrator S3 Presign 실구현", status: "next" as const },
  { item: "Terraform 6모듈 (validate)", status: "skeleton" as const },
  { item: "Lambda DocDB/Aurora/Firehose 실 write", status: "next" as const },
  { item: "NestJS API (03.source/beckend/)", status: "next" as const },
];

export function getAllDocEntries(): DocManifestEntry[] {
  return DOC_GROUPS.flatMap((g) => g.files);
}

/** Sidebar: section title only when a group has 2+ docs (avoids double labels). */
export type SidebarSection = {
  id: DocGroupId;
  title?: string;
  links: DocManifestEntry[];
};

export function getSidebarSections(): SidebarSection[] {
  return DOC_GROUPS.map((g) => ({
    id: g.id,
    title: g.files.length > 1 ? g.title : undefined,
    links: g.files,
  }));
}

export function getDocBySlug(slug: string): (DocManifestEntry & { group: DocGroup }) | undefined {
  for (const group of DOC_GROUPS) {
    const file = group.files.find((f) => f.slug === slug);
    if (file) return { ...file, group };
  }
  return undefined;
}

export function getAdjacentDocs(slug: string): { prev?: DocManifestEntry; next?: DocManifestEntry } {
  const all = getAllDocEntries();
  const idx = all.findIndex((d) => d.slug === slug);
  if (idx < 0) return {};
  return { prev: all[idx - 1], next: all[idx + 1] };
}
