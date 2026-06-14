#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { parse as parseYaml } from "yaml";
import {
  loadIngressDeploy,
  loadBatchCadence,
  loadManifest,
  appDirName,
} from "./lib/deploy-config.mjs";
import { appsRoot, configRoot } from "./lib/paths.mjs";

const errors = [];
const warnings = [];

function fail(msg) {
  errors.push(msg);
}
function warn(msg) {
  warnings.push(msg);
}

const ingress = loadIngressDeploy();
const batch = loadBatchCadence();
const manifest = loadManifest();

const cadenceIds = new Set((batch.cadences ?? []).map((c) => c.id));
for (const sched of ingress.batch?.schedules ?? []) {
  if (sched.enabled === false) continue;
  if (!cadenceIds.has(sched.cadence_id)) {
    fail(`batch schedule cadence_id missing in 02-batch-cadence: ${sched.cadence_id}`);
  }
}

const manifestStreams = new Set(
  (manifest.iot_kds_lambda_pipeline?.kinesis_data_streams?.streams ?? [])
    .filter((s) => s.enabled !== false)
    .map((s) => s.stream_id),
);
for (const [key, cfg] of Object.entries(ingress.streams ?? {})) {
  if (!cfg.enabled) continue;
  const id = cfg.manifest_stream_id ?? key;
  if (!manifestStreams.has(id)) {
    fail(`ingress stream ${key} (${id}) not in manifest kinesis_data_streams`);
  }
}

const manifestRules = new Set(
  (manifest.iot_kds_lambda_pipeline?.iot_rules?.rules ?? []).map((r) => r.id),
);
const ruleFiles = readdirSync(join(configRoot, "converter-rules")).filter((f) => f.endsWith(".yaml"));
for (const f of ruleFiles) {
  const rule = parseYaml(readFileSync(join(configRoot, "converter-rules", f), "utf8"));
  const id = rule?.rule?.id ?? rule?.id;
  if (id && !manifestRules.has(id)) {
    warn(`converter rule ${id} not listed in manifest iot_rules`);
  }
}

for (const [key, cfg] of Object.entries(ingress.lambdas ?? {})) {
  const appDir = cfg.app_dir ?? appDirName(cfg.terraform_map_key ?? key);
  const src = join(appsRoot, appDir, "src/handler.mjs");
  if (!existsSync(src)) {
    fail(`missing lambda source: ${src}`);
  }
  const bundle = join(appsRoot, appDir, "bundle/lambda.mjs");
  if (!existsSync(bundle)) {
    warn(`bundle not staged — run npm run lambda:assets: ${bundle}`);
  }
}

const jsonRules = join(configRoot, "rules");
if (!existsSync(jsonRules) || readdirSync(jsonRules).filter((f) => f.endsWith(".json")).length === 0) {
  warn("rules/*.json empty — run npm run rules:build");
}

if (warnings.length) {
  console.warn("validate warnings:");
  for (const w of warnings) console.warn("  -", w);
}
if (errors.length) {
  console.error("validate FAILED:");
  for (const e of errors) console.error("  -", e);
  process.exit(1);
}
console.log("validate:deploy OK");
