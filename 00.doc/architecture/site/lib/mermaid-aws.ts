type AwsIconDef = { body: string; width?: number; height?: number };

export type AwsIconPack = {
  prefix?: string;
  icons: Record<string, AwsIconDef>;
};

/** Node id hints (02-data-pipeline shorthand ids). */
const ID_ICON: Record<string, string> = {
  gg: "iot-greengrass",
  iot: "iot-core",
  rule: "iot-rule",
  kds: "kinesis",
  fh: "data-firehose",
  eb: "eventbridge",
  eb2: "eventbridge",
  sm: "sagemaker",
  docw: "documentdb",
  docr: "documentdb",
  rdsw: "aurora",
  l1: "lambda",
  l2: "lambda",
  l3: "lambda",
  l4: "lambda",
  orch: "lambda",
  sync: "lambda",
  batch: "lambda",
  s3m: "simple-storage-service",
  rdsm: "aurora",
  glue: "glue",
  ice: "simple-storage-service-glacier",
  sqs: "simple-queue-service",
  s3: "simple-storage-service",
};

const RULES: { keywords: string[]; icon: string }[] = [
  { keywords: ["greengrass", "gg", "검사 장비", "검사 카메라", "엣지"], icon: "iot-greengrass" },
  { keywords: ["iot core", "iot-core"], icon: "iot-core" },
  { keywords: ["topic rule", "iot rule"], icon: "iot-rule" },
  { keywords: ["kinesis", "kds"], icon: "kinesis" },
  { keywords: ["firehose"], icon: "data-firehose" },
  { keywords: ["documentdb", "docdb", "files_history"], icon: "documentdb" },
  { keywords: ["aurora", "postgres", "rds", "media_upload", "media_stream", "equipment_log"], icon: "aurora" },
  {
    keywords: [
      "lambda",
      "stream_sync",
      "batch_cadence",
      "dlq_shard",
      "anomaly_scorer",
      "rule_recommender",
      "self_heal",
      "payload_converter",
      "file_upload",
      "file-upload",
      "upload_orchestrator",
    ],
    icon: "lambda",
  },
  {
    keywords: ["presign", "multipart", "media upload", "image_chunk", "video_stream", "file/request", "media/images", "media/video"],
    icon: "simple-storage-service",
  },
  { keywords: ["s3", "parquet landing", "landing"], icon: "simple-storage-service" },
  { keywords: ["glue", "spark"], icon: "glue" },
  { keywords: ["iceberg", "cold"], icon: "simple-storage-service-glacier" },
  { keywords: ["eventbridge", "schedule"], icon: "eventbridge" },
  { keywords: ["sqs", "dlq"], icon: "simple-queue-service" },
  { keywords: ["sns", "ses"], icon: "simple-notification-service" },
  { keywords: ["sagemaker"], icon: "sagemaker" },
  { keywords: ["cloudwatch"], icon: "cloudwatch" },
  { keywords: ["cognito"], icon: "cognito" },
  { keywords: ["terraform", "plan/apply"], icon: "cloudformation" },
  { keywords: ["athena"], icon: "athena" },
  { keywords: ["bedrock"], icon: "bedrock" },
  { keywords: ["iot jobs", "shadow"], icon: "iot-device-management" },
];

let iconPack: AwsIconPack | null = null;

export async function loadAwsIconPack(): Promise<AwsIconPack> {
  if (iconPack) return iconPack;
  const res = await fetch("/data/aws-icons-mermaid.json");
  if (!res.ok) throw new Error(`AWS icon pack fetch failed: ${res.status}`);
  iconPack = (await res.json()) as AwsIconPack;
  return iconPack;
}

function resolveIconName(id: string, label: string): string | null {
  const idKey = id.toLowerCase();
  if (ID_ICON[idKey]) return ID_ICON[idKey];

  const hay = `${id} ${label}`.toLowerCase();
  for (const rule of RULES) {
    if (rule.keywords.some((k) => hay.includes(k))) return rule.icon;
  }
  return null;
}

function escapeLabel(label: string): string {
  return label.replace(/"/g, "'").replace(/\n/g, " ").trim();
}

/** Mermaid 11 native icon node — uses registerIconPacks("aws"). */
function toIconNode(id: string, label: string, iconName: string): string {
  const safe = escapeLabel(label);
  return `${id}@{ icon: "aws:${iconName}", form: "square", label: "${safe}", pos: "b", h: 52, w: 52, constraint: "off" }`;
}

function enrichNode(match: string, id: string, label: string, pack: AwsIconPack): string {
  if (match.includes("@{")) return match;
  const iconName = resolveIconName(id, label);
  if (!iconName) return match;
  if (!pack.icons[iconName]?.body?.trim()) return match;
  return toIconNode(id, label, iconName);
}

export function shouldEnrichWithAwsIcons(chart: string): boolean {
  const head = chart.trim().split("\n")[0]?.toLowerCase() ?? "";
  return head.startsWith("flowchart") || head.startsWith("graph ");
}

export function enrichFlowchartWithAwsIcons(chart: string, pack: AwsIconPack): string {
  if (!shouldEnrichWithAwsIcons(chart)) return chart;

  let out = chart;

  out = out.replace(/(\b[A-Za-z_][\w]*)\[\(([^)]+)\)\]/g, (m, id, label) => enrichNode(m, id, label, pack));

  out = out.replace(/(\b[A-Za-z_][\w]*)\[\[([^\]]+)\]\]/g, (m, id, label) => enrichNode(m, id, label, pack));

  out = out.replace(/(\b[A-Za-z_][\w]*)\[([^\]@{]+)\]/g, (m, id, label) => enrichNode(m, id, label, pack));

  return out;
}
