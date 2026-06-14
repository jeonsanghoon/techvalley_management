# 15. AWS Lambda 개발 스펙

테크밸리 **데이터 파이프라인 Lambda 9종** 개발·번들·로컬 테스트 SSOT입니다.  
설정 SSOT: **`02.arch/config/`** · 소스: **`03.source/lambda/`** · 배포: [10-yaml-pipeline-deploy-automation.md](./10-yaml-pipeline-deploy-automation.md)

관련: [04-backend-services.md](./04-backend-services.md) · [02-data-pipeline.md](./02-data-pipeline.md) · [13-media-upload-pipeline.md](./13-media-upload-pipeline.md) · [05-yaml-and-rules.md](./05-yaml-and-rules.md)

> **NestJS는 Lambda가 아닙니다.** Lambda는 **Node.js 24 ESM `.mjs`** + `@techvalley/pipeline-core`. NestJS API는 **`03.source/beckend/`** (예정).

---

## 15.1 런타임·패키징

| 항목 | 값 (SSOT: `ingress-deploy.yaml` → `lambda_package`) |
|------|------------------------------------------------------|
| **런타임** | `nodejs24.x` |
| **아키텍처** | `arm64` (Graviton) |
| **핸들러** | `lambda.handler` → `bundle/lambda.mjs` re-export |
| **모듈** | ESM (`"type": "module"`) |
| **Node (로컬)** | `>=24.0.0` (`03.source/lambda/package.json`) |
| **PartitionKey** | `device_code` (장비 S/N) |

### 번들 구조 (predeploy `lambda:assets`)

```
apps/<app-name>/
├── src/handler.mjs          ← 개발 편집 대상
└── bundle/                  ← stage-bundles.mjs 산출 (gitignore 권장)
    ├── handler.mjs
    ├── lambda.mjs             export { handler } from "./handler.mjs"
    ├── package.json
    ├── node_modules/@techvalley/pipeline-core/
    ├── config/                (앱별: normalize · cadence · media-upload)
    └── rules/                 (앱별: rules/*.json 13종)
```

`stage-bundles.mjs`가 `ingress-deploy.yaml`의 `lambdas.*` 목록을 순회하며 bundle을 생성합니다. Terraform ZIP은 `apps/<name>/bundle/` 기준.

---

## 15.2 Lambda 9종

`ingress-deploy.yaml` · `manifest/processes/01-ingress-pipeline.yaml`과 1:1.

| app (kebab) | terraform_map_key | deploy_group | 트리거 | 역할 |
|-------------|-------------------|--------------|--------|------|
| `stream-sync-consumer` | stream_sync_consumer | ingress | KDS ESM | decode → normalize → convert → **DocDB + Firehose** |
| `dlq-shard-processor` | dlq_shard_processor | ingress | SQS (KDS DLQ) | shard 단위 재처리 |
| `file-upload-orchestrator` | file_upload_orchestrator | ingress | IoT `file/*` · KDS fork | S3 Presign · multipart · `file/response` ([13](./13-media-upload-pipeline.md)) |
| `batch-cadence-runner` | batch_cadence_runner | batch | EventBridge cron | `02-batch-cadence.yaml` → Aurora·Doc 롤업 |
| `batch-dlq-replay` | batch_dlq_replay | batch | EventBridge (선택) | `pipeline_dlq_events` 재실행 |
| `payload-converter` | payload_converter | invoke_only | Lambda Invoke | rules JSON 단건 변환(미리보기) |
| `anomaly-scorer` | anomaly_scorer | ml | KDS fork / EventBridge | SageMaker → `anomaly_events` |
| `rule-recommender` | rule_recommender | ml | EventBridge `tv.anomaly.detected` | 룰 초안 → `rule_recommendations` |
| `self-heal-orchestrator` | self_heal_orchestrator | ml | EventBridge + 정책 | IoT Job / OTA self-heal ([09](./09-ai-anomaly-rules-and-edge-self-healing.md)) |

### deploy_group 요약

| deploy_group | 함수 |
|--------------|------|
| `ingress` | stream_sync_consumer, dlq_shard_processor, **file_upload_orchestrator** |
| `batch` | batch_cadence_runner, batch_dlq_replay |
| `invoke_only` | payload_converter |
| `ml` | anomaly_scorer, rule_recommender, self_heal_orchestrator |

---

## 15.3 앱별 bundle 자산

| app | bundle에 복사되는 config |
|-----|-------------------------|
| `stream-sync-consumer` | `normalize-config.default.yaml`, `rules/` (13종) |
| `batch-cadence-runner` | `02-batch-cadence.yaml` |
| `payload-converter` | `rules/` |
| `file-upload-orchestrator` | `media-upload.yaml`, `rules/` |
| `anomaly-scorer` | `rules/` |
| 기타 | handler + pipeline-core only |

---

## 15.4 환경 변수 (Terraform 주입)

공통·앱별 — SSOT: `ingress-deploy.yaml` → `lambdas.*.environment`

| 변수 | 대표 app | 용도 |
|------|----------|------|
| `TV_ENVIRONMENT` | 전체 | dev / stg / prd |
| `PARTITION_KEY_FIELD` | ingress | `device_code` |
| `RULES_DIR` | stream-sync, payload-converter | `/var/task/rules` |
| `NORMALIZE_CONFIG_PATH` | stream-sync | normalize YAML |
| `FIREHOSE_STREAM_NAME` | stream-sync | Cold 적재 |
| `BATCH_CADENCE_CONFIG_PATH` | batch-cadence | cadence YAML |
| `BATCH_DLQ_COLLECTION` | batch-* | `pipeline_dlq_events` |
| `TV_MEDIA_BUCKET` | file-upload | S3 미디어 버킷 |
| `MEDIA_UPLOAD_CONFIG_PATH` | file-upload | presign·multipart 정책 |
| `IOT_RESPONSE_TOPIC_TEMPLATE` | file-upload | `tv/{env}/{edge}/{device_code}/event/file/response/json` |
| `SAGEMAKER_ENDPOINT_NAME` | anomaly-scorer | SageMaker 엔드포인트 |
| `TV_BATCH_SCHEDULER` | batch | `eventbridge` (Nest Cron 아님) |

---

## 15.5 `@techvalley/pipeline-core`

경로: `03.source/lambda/packages/pipeline-core/`

### 현재 구현 (skeleton)

| export | 용도 |
|--------|------|
| `createHandler(appName, { onEvent })` | Kinesis / EventBridge / direct 이벤트 래퍼 |
| `decodeKinesisRecord(record)` | base64 KDS payload → JSON |
| `getEnv(name, fallback)` | `process.env` |
| `partitionKey(payload, field)` | `device_code` 추출 |

### 설계 예정 모듈

| 모듈 | 기능 |
|------|------|
| `normalize/*` | 토픽 필터, 8세그먼트 라우팅 |
| `converter/*` | rules JSON 로드·페이로드 변환 |
| `documentdb-sink` / `firehose-sink` | Hot + Cold 동시 적재 |
| `documentdb-batch` / `postgres-batch` | 배치 롤업 |
| `cadence-executor` | `02-batch-cadence.yaml` 실행 |
| `batch-dlq*` | 배치 DLQ 기록·재생 |

---

## 15.6 handler 작성 규약

1. **`apps/<name>/src/handler.mjs`** 만 수정 (bundle 직접 편집 금지).
2. `createHandler` + 앱별 `onEvent` — 비즈니스 로직은 `onEvent` 또는 추후 pipeline-core 모듈.
3. KDS 이벤트: `decodeKinesisRecord(record)` → `partitionKey(payload, "device_code")`.
4. 실패 시 throw → Lambda retry / DLQ (ingress-deploy `streams.*.dlq` 참고).
5. Idempotent write — `device_code` + event timestamp + rule_code 기준 upsert.

### 최소 handler 예 (stream-sync-consumer)

```javascript
import { createHandler, decodeKinesisRecord, partitionKey, getEnv } from "@techvalley/pipeline-core";

async function onEvent({ record }) {
  const payload = decodeKinesisRecord(record) ?? record;
  return {
    action: "stream_sync",
    device_code: partitionKey(payload, getEnv("PARTITION_KEY_FIELD", "device_code")),
    topic: payload?.topic,
    stored: true,
  };
}

export const handler = createHandler("stream-sync-consumer", { onEvent });
```

---

## 15.7 converter-rules · rules JSON

| 단계 | 명령 | 입·출력 |
|------|------|---------|
| 빌드 | `npm run rules:build` | `converter-rules/*.yaml` → `rules/*.json` (**13종**) |
| 번들 | `npm run lambda:assets` | `rules/` → ingress·converter·media·anomaly bundle |

**13종**: core 5 (periodic, telemetry, alarm, control, fota) + file 8 (events, request, chunk, progress, complete, abort, response, video_stream).

상세 매핑: [11-config-examples-reference.md](./11-config-examples-reference.md) · [05-yaml-and-rules.md](./05-yaml-and-rules.md)

---

## 15.8 개발 워크플로

```bash
cd 03.source/lambda
npm install

# 1) 규칙·설정 반영
npm run rules:build
npm run sync:config          # 02.arch/config → 90.infra/config

# 2) handler 수정 후 번들
npm run lambda:assets

# 3) 로컬 invoke (bundle 기준)
npm run test:local:ingress   # stream-sync-consumer
npm run test:local:batch     # batch-cadence-runner
npm run test:local:media     # file-upload-orchestrator 시나리오

# 4) 배포 산출물 (AWS 미배포)
npm run predeploy            # compose + rules + assets + tfvars + validate
npm run terraform:plan       # plan only
```

**실패 시 `terraform plan` 금지** — `validate:deploy` 오류 먼저 해결 ([10](./10-yaml-pipeline-deploy-automation.md) §10.8).

### 로컬 데이터 플레인 (DocDB · Postgres · MinIO)

**SSOT**: [16-local-e2e-testing.md](./16-local-e2e-testing.md)

```bash
npm run local:up    # repo 루트 — Podman + bootstrap
# 또는
podman compose -f 02.arch/config/local/docker-compose.yml up -d
set -a && source 02.arch/config/local/env.local.example && set +a
./02.arch/config/local/bootstrap-postgres.sh
./02.arch/config/local/bootstrap-documentdb.sh
./02.arch/config/local/minio-init.sh
```

| 컨테이너 | 포트 | 대체 AWS |
|----------|------|----------|
| Mongo 7 | 27000 | DocumentDB Hot (`iot_service`) |
| PostgreSQL 16 | 25432 | Aurora Warm (`iot_analytics`) |
| MinIO | 19010 / 19011 | S3 |

Lambda → DB 실 write 연동은 **next** (현재 skeleton은 handler 반환값만 검증).

---

## 15.9 Observability

| 대상 | 메트릭·로그 |
|------|-------------|
| KDS → Lambda | IteratorAge, Errors, Duration, ConcurrentExecutions |
| DLQ SQS | ApproximateNumberOfMessagesVisible |
| Firehose | DeliveryToS3, ThrottledRecords |
| batch cadence | Job 성공/실패, `pipeline_dlq_events` 건수 |
| DocumentDB | ReplicaLag, CPUUtilization |

CloudWatch Logs: JSON structured log (`createHandler` catch 블록).

---

## 15.10 구현 상태

| 항목 | 상태 |
|------|------|
| 9종 handler skeleton + bundle stage | **skeleton** |
| pipeline-core (createHandler 등) | **skeleton** |
| rules JSON 13종 + ingress-deploy env | **done** |
| DocDB / Aurora / Firehose 실 write | **next** |
| file-upload S3 Presign · IoT publish 실구현 | **next** |
| SageMaker · self-heal IoT Job | **next** |

---

## 15.11 관련 문서·경로

| 경로 | 용도 |
|------|------|
| `03.source/lambda/README.md` | 빠른 시작 |
| `03.source/lambda/apps/README.md` | app ↔ deploy_group |
| `02.arch/config/ingress-deploy.yaml` | Lambda memory·timeout·env SSOT |
| `02.arch/config/infrastructure.yaml` | IoT Rule · IAM · 레이크 |
| `90.infra/terraform/` | IaC (plan/apply) |
| [14-backend-frontend-design.md](./14-backend-frontend-design.md) | NestJS API (Lambda와 별도) |
| 웹 docs `/reference/lambda/` | Lambda 9종 요약 레퍼런스 |
