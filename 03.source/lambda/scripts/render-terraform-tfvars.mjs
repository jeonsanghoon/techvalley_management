#!/usr/bin/env node
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { loadIngressDeploy, loadInfrastructure, appDirName } from "./lib/deploy-config.mjs";
import { infraRoot, lambdaRoot } from "./lib/paths.mjs";

const ingress = loadIngressDeploy();
const infra = loadInfrastructure();
const pkg = ingress.lambda_package ?? {};
const project = ingress.project ?? {};

const lambdas = {};
for (const [key, cfg] of Object.entries(ingress.lambdas ?? {})) {
  const mapKey = cfg.terraform_map_key ?? key;
  const appDir = cfg.app_dir ?? appDirName(mapKey);
  lambdas[mapKey] = {
    deploy_group: cfg.deploy_group,
    role: cfg.role,
    runtime: cfg.runtime ?? pkg.runtime ?? "nodejs24.x",
    architecture: cfg.architecture ?? pkg.architecture ?? "arm64",
    memory_mb: cfg.memory_mb,
    timeout_seconds: cfg.timeout_seconds,
    handler: cfg.handler ?? pkg.handler ?? "lambda.handler",
    source_dir: `03.source/lambda/apps/${appDir}/bundle`,
    environment: { ...(cfg.environment ?? {}) },
  };
}

const streams = {};
for (const [key, cfg] of Object.entries(ingress.streams ?? {})) {
  if (!cfg.enabled) continue;
  streams[key] = {
    manifest_stream_id: cfg.manifest_stream_id ?? key,
    kinesis: cfg.kinesis,
    consumer: cfg.consumer,
    dlq: cfg.dlq,
  };
}

const batch_schedules = (ingress.batch?.schedules ?? [])
  .filter((s) => s.enabled !== false)
  .map((s) => ({
    schedule_key: s.schedule_key,
    cadence_id: s.cadence_id,
    kind: s.kind,
    schedule_expression: s.schedule_expression,
  }));

const ml_triggers = ingress.ml?.eventbridge ?? [];
const namePrefix = `${project.name ?? "tv-ingress"}-${project.environment ?? "dev"}`;
const lake = infra.analytics_lake ?? {};
const firehoseSuffix = lake.firehose?.stream_suffix ?? lake.firehose_stream_suffix ?? "cold-stream-events";

const tfvars = {
  _comment: "npm run tfvars 로 생성 — 수동 편집 금지 (테크밸리 deploy-ssot)",
  project_name: project.name ?? "tv-ingress",
  environment: project.environment ?? "dev",
  aws_region: project.aws_region ?? "ap-northeast-2",
  tags: project.tags ?? { Project: "techvalley" },
  partition_key_field: ingress.partition_key?.field ?? "device_code",
  iot: infra.iot ?? { enabled: true },
  analytics_lake: {
    ...lake,
    enabled: lake.enabled ?? false,
    name_prefix: namePrefix,
    s3_bucket: `${namePrefix}-${lake.s3?.bucket_suffix ?? "tv-analytics-raw"}`,
    firehose_stream_name: `${namePrefix}-${firehoseSuffix}`,
    glue_database_name: lake.glue?.database_name ?? "techvalley_analytics",
  },
  data_plane: infra.data_plane ?? { enabled: false },
  lambda_iam_roles: infra.lambda_iam_roles ?? {},
  lambdas,
  streams,
  batch_schedules,
  ml_triggers,
  batch_runner_lambda: ingress.batch?.runner_lambda_ref ?? "batch_cadence_runner",
};

const outDirs = [
  join(infraRoot, "terraform/environments"),
  join(lambdaRoot, "../../02.arch/config/terraform/environments"),
];
for (const dir of outDirs) {
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "dev.auto.tfvars.json"), JSON.stringify(tfvars, null, 2));
}
console.log("wrote dev.auto.tfvars.json → 90.infra/terraform + 02.arch/config/terraform");
