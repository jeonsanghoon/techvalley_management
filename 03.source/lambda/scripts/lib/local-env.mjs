import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { configRoot, repoRoot } from "./paths.mjs";

const ENV_FILE = join(configRoot, "local/env.local");

export function applyLocalEnv() {
  if (existsSync(ENV_FILE)) {
    for (const line of readFileSync(ENV_FILE, "utf8").split("\n")) {
      const t = line.trim();
      if (!t || t.startsWith("#")) continue;
      const i = t.indexOf("=");
      if (i < 1) continue;
      const k = t.slice(0, i).trim();
      const v = t.slice(i + 1).trim();
      if (!process.env[k]) process.env[k] = v;
    }
  }
  process.env.TV_MONGO_URI ??=
    "mongodb://tv:tv_local_dev@127.0.0.1:37017/iot_service?authSource=admin&directConnection=true";
  process.env.TV_POSTGRES_URI ??= "postgresql://tv:tv_local_dev@127.0.0.1:35432/iot_analytics";
}

export function streamSyncPaths(appsRoot) {
  const bundle = join(appsRoot, "stream-sync-consumer/bundle");
  process.env.NORMALIZE_CONFIG_PATH = join(bundle, "config/normalize-config.default.yaml");
  process.env.RULES_DIR = join(bundle, "rules");
}

export function batchCadencePaths(appsRoot) {
  const bundle = join(appsRoot, "batch-cadence-runner/bundle");
  process.env.BATCH_CADENCE_CONFIG_PATH = join(bundle, "config/02-batch-cadence.yaml");
}

export { repoRoot, configRoot };
