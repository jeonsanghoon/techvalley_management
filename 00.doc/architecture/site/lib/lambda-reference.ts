/** AWS Lambda 9종 — 15-lambda-development.md SSOT 미러 */

export type LambdaAppRow = {
  app: string;
  deployGroup: "ingress" | "batch" | "invoke_only" | "ml";
  trigger: string;
  role: string;
  bundleConfig?: string;
};

export const LAMBDA_RUNTIME = {
  runtime: "nodejs24.x",
  architecture: "arm64",
  handler: "lambda.handler",
  localNode: ">=24.0.0",
  module: "ESM (.mjs)",
  corePackage: "@techvalley/pipeline-core",
};

export const LAMBDA_APPS: LambdaAppRow[] = [
  {
    app: "stream-sync-consumer",
    deployGroup: "ingress",
    trigger: "KDS ESM",
    role: "decode → normalize → convert → DocDB + Firehose",
    bundleConfig: "normalize-config.default.yaml, rules/ (13종)",
  },
  {
    app: "dlq-shard-processor",
    deployGroup: "ingress",
    trigger: "SQS (KDS DLQ)",
    role: "shard 단위 실시간 DLQ 재처리",
  },
  {
    app: "file-upload-orchestrator",
    deployGroup: "ingress",
    trigger: "IoT file/* · KDS fork",
    role: "S3 Presign · multipart · file/response",
    bundleConfig: "media-upload.yaml, rules/",
  },
  {
    app: "batch-cadence-runner",
    deployGroup: "batch",
    trigger: "EventBridge cron",
    role: "02-batch-cadence.yaml → Aurora·Doc 롤업",
    bundleConfig: "02-batch-cadence.yaml",
  },
  {
    app: "batch-dlq-replay",
    deployGroup: "batch",
    trigger: "EventBridge (선택)",
    role: "pipeline_dlq_events 재실행",
  },
  {
    app: "payload-converter",
    deployGroup: "invoke_only",
    trigger: "Lambda Invoke",
    role: "rules JSON 단건 변환(미리보기)",
    bundleConfig: "rules/",
  },
  {
    app: "anomaly-scorer",
    deployGroup: "ml",
    trigger: "KDS fork / EventBridge",
    role: "SageMaker → anomaly_events",
    bundleConfig: "rules/",
  },
  {
    app: "rule-recommender",
    deployGroup: "ml",
    trigger: "EventBridge tv.anomaly.detected",
    role: "룰 초안 → rule_recommendations",
  },
  {
    app: "self-heal-orchestrator",
    deployGroup: "ml",
    trigger: "EventBridge + 정책",
    role: "IoT Job / OTA self-heal",
  },
];

export const LAMBDA_COMMANDS = [
  { cmd: "npm run rules:build", desc: "converter-rules → rules/*.json (13종)" },
  { cmd: "npm run sync:config", desc: "02.arch/config → 90.infra/config" },
  { cmd: "npm run lambda:assets", desc: "src/handler.mjs → apps/*/bundle/" },
  { cmd: "npm run predeploy", desc: "compose + rules + assets + tfvars + validate" },
  { cmd: "npm run test:local:ingress", desc: "stream-sync-consumer 로컬 invoke" },
  { cmd: "npm run test:local:batch", desc: "batch-cadence-runner 로컬 invoke" },
  { cmd: "npm run test:local:media", desc: "file-upload-orchestrator 시나리오" },
];

export const APP_LAYERS = [
  {
    layer: "프론트엔드",
    path: "03.source/frontend",
    stack: "Next.js 16 · React 19 · MUI 9 · AG Grid 35",
    doc: "14-backend-frontend-design",
    status: "done (mock + DataScope)",
  },
  {
    layer: "백엔드 API",
    path: "03.source/beckend",
    stack: "NestJS · TypeORM · Aurora + DocumentDB CQRS",
    doc: "14-backend-frontend-design",
    status: "next",
  },
  {
    layer: "파이프라인 Lambda",
    path: "03.source/lambda",
    stack: "Node.js 24 ESM · pipeline-core · 9종",
    doc: "15-lambda-development",
    status: "skeleton",
  },
];
