import { readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { ARCH_ROOT } from "./docs";

export type ConfigFileEntry = {
  path: string;
  kind: "yaml" | "json" | "sql" | "md" | "mjs" | "py" | "sh" | "yml" | "other";
};

function kindFromExt(name: string): ConfigFileEntry["kind"] {
  if (name.endsWith(".yaml") || name.endsWith(".yml")) return "yaml";
  if (name.endsWith(".json")) return "json";
  if (name.endsWith(".sql")) return "sql";
  if (name.endsWith(".md")) return "md";
  if (name.endsWith(".mjs")) return "mjs";
  if (name.endsWith(".py")) return "py";
  if (name.endsWith(".sh")) return "sh";
  return "other";
}

function walk(dir: string, base: string, acc: ConfigFileEntry[] = []): ConfigFileEntry[] {
  for (const name of readdirSync(dir).sort()) {
    if (name.startsWith(".") || name === "node_modules") continue;
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) {
      walk(full, base, acc);
    } else {
      acc.push({ path: relative(base, full), kind: kindFromExt(name) });
    }
  }
  return acc;
}

export function loadConfigTree(): ConfigFileEntry[] {
  const configRoot = join(ARCH_ROOT, "config");
  return walk(configRoot, configRoot);
}

export const CONFIG_HIGHLIGHTS = [
  { path: "media-upload.yaml", doc: "13-media-upload-pipeline", desc: "S3 single/multipart · image_chunk · video_stream" },
  { path: "ingress-deploy.yaml", doc: "10-yaml-pipeline-deploy-automation", desc: "Lambda·KDS·EventBridge SSOT" },
  { path: "infrastructure.yaml", doc: "10-yaml-pipeline-deploy-automation", desc: "IoT·IAM·레이크 스위치" },
  { path: "normalize-config.default.yaml", doc: "05-yaml-and-rules", desc: "토픽 → collection·rule_code" },
  { path: "02-batch-cadence.yaml", doc: "05-yaml-and-rules", desc: "배치 cadence·depends_on" },
  { path: "manifest/01-data-platform.manifest.yaml", doc: "10-yaml-pipeline-deploy-automation", desc: "composed manifest" },
  { path: "converter-rules/", doc: "11-config-examples-reference", desc: "규칙 YAML 13종 (file 8 + core 5)" },
  { path: "samples/file_*.sample.json", doc: "13-media-upload-pipeline", desc: "미디어 업로드 MQTT 샘플 7종" },
  { path: "schema/postgres/02-pipeline-alarm-notification.sql", doc: "06-schema-reference", desc: "알람·롤업 DDL" },
  { path: "schema/iceberg/lake-config.yaml", doc: "12-database-design", desc: "S3·Firehose·Glue" },
];
