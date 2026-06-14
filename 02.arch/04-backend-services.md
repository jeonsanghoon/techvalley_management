# 04. 백엔드 서비스 및 Lambda

## 4.1 서비스 경계 (MSA)

테크밸리 백엔드는 **도메인별 독립 배포**를 목표로 합니다. API Gateway 뒤 Lambda 또는 ECS Fargate.

| 서비스 | 책임 | 주요 API |
|--------|------|----------|
| **Fleet** | company·branch·site·device 마스터, 플릿 스냅샷 | `/customers`, `/installation`, `/equipment` |
| **Pipeline** | 수집 상태, Tier 스냅샷, KDS lag | `/data-pipeline` |
| **Telemetry** | 메트릭 스트림 구독, Hot 조회 | `/metric-stream` |
| **Logs** | Warm Tier 카테고리별 이력 | `/equipment-logs` |
| **Alarm** | 알람·룰·EventBridge | `/alarms`, `/alarm-rules` |
| **Remote** | 진단 Job, Shadow, IoT Jobs, **엣지 자가복구** | `/remote-diagnosis`, `/remote-control` |
| **AI Ops** | SageMaker inference, 룰 추천, self-heal 정책 | `/alarms`, `/alarm-rules`, (admin playbooks) |
| **Service** | 티켓·진행·SLA | `/service-tickets`, `/service-progress`, `/sla` |
| **Inspection** | 수율·알고리즘·LOT | `/inspection` |
| **Parts & AS** | 부품·정비 | `/parts-*`, `/as` |
| **Admin** | 사용자·코드·메뉴 RBAC·IoT 인증 | `/admin/*` |
| **AuthZ** | Cognito 연동, JWT claim, RBAC | 공통 미들웨어 |

현재 **`03.source/beckend/`** 는 구현 예정. **UI·API·NestJS 컨텍스트 설계 SSOT**: [14-backend-frontend-design.md](./14-backend-frontend-design.md) (FOTA Lite 참고 구현). 프론트는 mock + `DataScope` 메타로 계약을 고정.

## 4.2 Lambda 앱 (파이프라인)

테크밸리 파이프라인 Lambda는 **`03.source/lambda/`** 에 구현합니다.

| app | 트리거 | 역할 |
|-----|--------|------|
| `stream-sync-consumer` | KDS ESM | decode → normalize → convert → DocDB + Firehose |
| `dlq-shard-processor` | SQS | 실시간 DLQ shard 재처리 |
| `batch-cadence-runner` | EventBridge | cadence YAML 실행, Aurora·Doc 롤업 |
| `batch-dlq-replay` | EventBridge(선택) | `pipeline_dlq_events` 재실행 |
| `payload-converter` | Invoke | 규칙 JSON 단건 변환(미리보기) |
| **`file-upload-orchestrator`** | IoT `file/request` · KDS | S3 Presigned·멀티파트·`file/response` ([13](./13-media-upload-pipeline.md)) |
| `anomaly-scorer` | KDS (fork) / EventBridge | SageMaker invoke → `anomaly_events` |
| `rule-recommender` | EventBridge `tv.anomaly.detected` | 룰 초안 → `rule_recommendations` |
| `self-heal-orchestrator` | EventBridge + 정책 | edge_client → IoT Job / OTA ([09](./09-ai-anomaly-rules-and-edge-self-healing.md)) |

**런타임**: Node.js **24.x**, ESM `.mjs`, **`@techvalley/pipeline-core`** (NestJS 아님 — API는 `03.source/beckend/`).  
**개발 SSOT**: [15-lambda-development.md](./15-lambda-development.md)

### pipeline-core 모듈

| 모듈 | 기능 |
|------|------|
| `kinesis-decode` | KDS 레코드 디코드 |
| `normalize/*` | 토픽 필터, 8세그먼트 라우팅 |
| `converter/*` | rules JSON 로드·페이로드 변환 |
| `documentdb-sink` / `firehose-sink` | Hot + Cold 동시 적재 |
| `documentdb-batch` / `postgres-batch` | 배치 롤업 |
| `cadence-executor` | `02-batch-cadence.yaml` 실행 |
| `batch-dlq*` | 배치 DLQ 기록·재생 |

## 4.3 API 설계 원칙

- **인증**: Cognito JWT — claim: `role`, `companyId` · `branchId` · `siteId`(조직 스코프), `scope`
- **RBAC**: `menu-catalog.ts` VIEW_ACCESS ↔ API scope 1:1
- **batch API**: 응답에 `asOf`, `source`, `refreshInterval` 포함 (`DataSourceMeta`)
- **realtime API**: WebSocket 또는 SSE (메트릭 스트림); KPI API와 분리
- **멱등**: POST 티켓·원격 Job — `Idempotency-Key`
- **연동 (B↔A)**: EventBridge `order.confirmed`, `shipment.*` — IoT 범위 외, 별도 어댑터

## 4.4 프론트엔드 (`03.source/frontend`)

상세: [14-backend-frontend-design.md](./14-backend-frontend-design.md) — 관리 콘솔 vs 서비스 웹, UI↔API 매핑, FOTA Job.

| 항목 | 값 (package.json) |
|------|-------------------|
| 프레임워크 | Next.js **16.2** App Router · React **19** |
| UI | MUI **9** + AG Grid Enterprise **35** + Tailwind **4** |
| 상태 | TanStack Query **5** · react-hook-form · zod |
| i18n | ko / en, KST 기준 시각 |
| 배포 | Vercel |
| API (예정) | `NEXT_PUBLIC_API_URL` |

백엔드 API 연동 시 `src/lib/data/batch/*`, `src/lib/data/realtime/*` mock을 OpenAPI 클라이언트로 교체.  
웹 레퍼런스: `/reference/ui-api/`

## 4.5 로컬·E2E (계획)

**`90.infra/local/`** Podman compose — [02.arch/config/local/docker-compose.yml](./config/local/docker-compose.yml)

| 서비스 | 포트 | 용도 |
|--------|------|------|
| DocumentDB Local | 27000 | Hot |
| PostgreSQL 16 | 25432 | Aurora Warm |
| MinIO | 19010 | S3 호환 |

E2E: `99.output` 스타일 샘플 YAML + 스크립트 (테크밸리용 별도 구성 예정).

## 4.6 Observability

| 대상 | 메트릭·로그 |
|------|-------------|
| KDS → Lambda | IteratorAge, ErrorRate, Duration |
| Firehose | DeliveryToS3, ThrottledRecords |
| 배치 cadence | Job 성공/실패, `pipeline_dlq_events` 건수 |
| DocumentDB | ReplicaLag, CPU |
| UI | CloudWatch RUM (선택) |

알람: Hot Tier lag, DLQ depth, batch cadence 실패 → SNS → EMG 핫라인 워크플로 (UI nav.emgHotline).
