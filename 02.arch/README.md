# 테크밸리 아키텍처 문서 (02.arch)

테크밸리 IoT 서비스 플랫폼의 **백엔드·AWS 데이터 파이프라인·저장·배포** SSOT입니다.  
기능정의서(A1~A12)·프론트엔드(`03.source/frontend`) 관례·**`02.arch/config/`** 예시 설정을 기준으로 합니다.

## 읽는 순서

| 순서 | 문서 | 내용 |
|------|------|------|
| 1 | [01-platform-overview.md](./01-platform-overview.md) | 플랫폼 범위, WBS, 조직·장비 계층 |
| — | [config/schema/org-hierarchy.md](./config/schema/org-hierarchy.md) | **조직 SSOT** — company → branch → site → device |
| 2 | [02-data-pipeline.md](./02-data-pipeline.md) | AWS 수집·처리·배치·DLQ |
| 3 | [08-greengrass-offline-resilience.md](./08-greengrass-offline-resilience.md) | Greengrass 오프라인·Spooler·OTA |
| 4 | [09-ai-anomaly-rules-and-edge-self-healing.md](./09-ai-anomaly-rules-and-edge-self-healing.md) | SageMaker·룰 추천·엣지 자가복구 |
| 5 | [03-storage-tiers.md](./03-storage-tiers.md) | Hot / Warm / Cold |
| 6 | [04-backend-services.md](./04-backend-services.md) | API·Lambda·MSA |
| — | [14-backend-frontend-design.md](./14-backend-frontend-design.md) | **UI·API·NestJS 컨텍스트** (FOTA Lite 참고) |
| — | [15-lambda-development.md](./15-lambda-development.md) | **AWS Lambda 9종 개발 스펙** |
| 7 | [05-yaml-and-rules.md](./05-yaml-and-rules.md) | 토픽·YAML 4층·배치 cadence |
| 8 | [06-schema-reference.md](./06-schema-reference.md) | DocumentDB / Aurora / Iceberg |
| 9 | [12-database-design.md](./12-database-design.md) | **DB 설계 SSOT** — DDL·ERD·bootstrap |
| 11 | [07-repo-and-deployment.md](./07-repo-and-deployment.md) | 저장소·배포·로컬 |
| — | [16-local-e2e-testing.md](./16-local-e2e-testing.md) | **Podman · 로컬 E2E** |
| 12 | [10-yaml-pipeline-deploy-automation.md](./10-yaml-pipeline-deploy-automation.md) | YAML → predeploy → Terraform |
| 12 | [11-config-examples-reference.md](./11-config-examples-reference.md) | 예시·교차표 — [config/](./config/) |

## 설정 SSOT (`02.arch/config/`)

Markdown과 **동일 폴더**에 YAML·JSON·manifest·samples가 있습니다.

```bash
npm run rules:build --prefix 03.source/lambda
npm run sync:config --prefix 03.source/lambda
```

## 관련 폴더

| 경로 | 역할 |
|------|------|
| `00.doc/techvalley_proposal/` | 종합 기능정의서 |
| `00.doc/architecture/index.html` | **웹 아키텍처 가이드** (MOBI yaml-design 패턴) |
| `03.source/frontend/` | 운영 UI (Next.js) — [14-backend-frontend-design.md](./14-backend-frontend-design.md) |
| `03.source/lambda/` | 파이프라인 Lambda 9종 — [15-lambda-development.md](./15-lambda-development.md) |
| `03.source/beckend/` | NestJS API (예정) — [14-backend-frontend-design.md](./14-backend-frontend-design.md) |
| `90.infra/` | Terraform (config는 sync 미러) |

## 외부 참고 (Greengrass 오프라인)

[hiCAMS 시스템 아키텍처](https://hd-ksoe.vercel.app/) — Disk Spooler·IoT Jobs QUEUED 패턴 → [08-greengrass-offline-resilience.md](./08-greengrass-offline-resilience.md)

## 변경 원칙

- **`02.arch/` 먼저** 갱신 → `03.source` · `90.infra` 구현 반영
- UI mock(`pipelineStatuses`)과 불일치 시 **03-storage-tiers.md** 기준
- 테크밸리는 **단일 운영 플랫폼**(tenant `tv`, 조직 `company→branch→site→device`, 장비 키 `device_code`)
