# 07. 저장소 구조 및 배포

## 7.1 워크스페이스 폴더 (SSOT)

```
techvalley/
├── 00.doc/                 # 제안서·스크린샷·매뉴얼
├── 02.arch/                # ← 아키텍처 문서 (본 폴더)
├── 03.source/
│   ├── frontend/           # Next.js 운영 UI (Git: techvalley_project)
│   ├── beckend/            # NestJS/Express API (예정)
│   └── lambda/             # 파이프라인 Lambda 9종 + pipeline-core (skeleton)
├── 90.infra/               # Terraform, 환경별 tfvars (skeleton)
└── package.json            # dev:frontend 등 루트 스크립트
```

| 번호 | 의미 |
|------|------|
| `00` | 문서·산출물 |
| `02` | 아키텍처·설계 SSOT |
| `03` | 애플리케이션 소스 |
| `90` | 인프라·IaC |

## 7.2 프론트엔드 (`03.source/frontend`)

```bash
cd 03.source/frontend
npm ci && cp .env.local.example .env.local
npm run dev          # http://localhost:3000
```

루트에서:

```bash
npm run dev:frontend
```

| 항목 | 값 |
|------|-----|
| 프레임워크 | Next.js **16.2** · React **19** · MUI **9** · Tailwind **4** |
| 그리드 | AG Grid Enterprise **35** · TanStack Query **5** |
| 배포 | Vercel |
| Root Directory | repo 루트 (frontend 단독 Git) |
| 필수 env | `NEXT_PUBLIC_AG_GRID_LICENSE_KEY` |
| API (예정) | `NEXT_PUBLIC_API_URL` — [14-backend-frontend-design.md](./14-backend-frontend-design.md) |

Git author (Vercel Hobby): `.cursor/rules/git-vercel-author.mdc` 참고.

## 7.3 백엔드 (예정 — `03.source/beckend`)

**설계 SSOT**: [14-backend-frontend-design.md](./14-backend-frontend-design.md)

| 항목 | 계획 |
|------|------|
| 프레임워크 | NestJS (FOTA Lite `contexts/` 패턴) |
| 구조 | `contexts/{identity,organization,catalog,device,fota,…}/` |
| API | REST + SSE(metric-stream) + (선택) WebSocket |
| ORM | TypeORM → Aurora **PostgreSQL** (FOTA는 MySQL) |
| DocDB | Mongo driver, Reader/Writer URI 분리 (CQRS) |
| 인증 | Cognito JWT — `companyId` · `branchId` · `siteId` claim |
| FOTA | `update-jobs` → IoT Jobs / MQTT `ota/*` ([08](./08-greengrass-offline-resilience.md)) |

```
03.source/beckend/          (예정)
├── src/contexts/
│   ├── identity/
│   ├── organization/       # company · branch · site
│   ├── catalog/            # product · firmware
│   ├── device/
│   ├── fota/               # update_jobs · DocDB events
│   └── …
├── src/infrastructure/     # mqtt · s3 · cognito · docdb
└── src/common/contracts/   # CRUD ports · CQRS
```

MSA 분리는 [04-backend-services.md](./04-backend-services.md) 도메인 표 준수 — 초기 모놀리식.

## 7.4 Lambda (`03.source/lambda`)

테크밸리 파이프라인 Lambda **9종** (skeleton). **개발 SSOT**: [15-lambda-development.md](./15-lambda-development.md) · **배포**: [10-yaml-pipeline-deploy-automation.md](./10-yaml-pipeline-deploy-automation.md)

```
03.source/lambda/
├── packages/pipeline-core/     # @techvalley/pipeline-core
├── apps/                       # src/handler.mjs → bundle/ (predeploy)
│   ├── stream-sync-consumer/
│   ├── dlq-shard-processor/
│   ├── file-upload-orchestrator/
│   ├── batch-cadence-runner/
│   ├── batch-dlq-replay/
│   ├── payload-converter/
│   ├── anomaly-scorer/
│   ├── rule-recommender/
│   └── self-heal-orchestrator/
└── scripts/
    ├── stage-bundles.mjs
    ├── render-terraform-tfvars.mjs
    └── validate-deploy-alignment.mjs
```

| script | 역할 |
|--------|------|
| `npm run predeploy` | compose + lambda:assets + tfvars + validate (**AWS 미배포**) |
| `npm run terraform:plan` | predeploy 후 plan only |

빌드: `stage-bundles.mjs`가 normalize-config·batch-cadence·rules JSON을 bundle에 복사 → Terraform ZIP.

## 7.5 인프라 (`90.infra`)

설정 SSOT: **`02.arch/config/`** → `npm run sync:config` → `90.infra/config/` (배포 미러)

```
02.arch/config/          ← SSOT (ingress-deploy, manifest, rules, samples)
90.infra/
├── config/              ← sync 미러
├── terraform/modules/   ← 예정
└── local/               ← sync 미러 (Podman)
```

**배포 순서**:

1. `02.arch/config/*.yaml` 수정
2. `npm run rules:build && npm run sync:config && npm run predeploy`
3. `terraform plan -var-file=...`
4. `terraform apply`
5. Lambda alias 고정 + EventBridge 연결 확인

**리전**: `ap-northeast-2` (ingress-deploy `project.aws_region`).

## 7.6 환경

| env | 용도 | IoT Thing prefix |
|-----|------|------------------|
| `dev` | 개발·E2E | `tv/dev/...` |
| `stg` | 통합 검증 | `tv/stg/...` |
| `prd` | 운영 | `tv/prd/...` |

## 7.7 로컬 데이터 플레인 · E2E

**SSOT**: [16-local-e2e-testing.md](./16-local-e2e-testing.md) · [config/local/](./config/local/)

```bash
npm run local:up      # Podman + bootstrap
npm run local:test    # Lambda invoke 전체
npm run dev:frontend  # UI :3000
```

[config/local/docker-compose.yml](./config/local/docker-compose.yml):

| 컨테이너 | 포트 | 대체 AWS |
|----------|------|----------|
| DocumentDB Local | 27000 | DocumentDB |
| PostgreSQL 16 | 25432 | Aurora |
| MinIO | 19010 | S3 |

부트스트랩 SQL/JS: Hot·Warm 스키마 + 샘플 장비(삼성전자 DS 등 mock과 동일 S/N).

## 7.8 CI/CD (목표)

| 대상 | 파이프라인 |
|------|-----------|
| frontend | Vercel Git 연동 |
| lambda | GitHub Actions → bundle → S3 artifact → Terraform |
| beckend | ECS Fargate 또는 Lambda (API Gateway) |
| infra | Terraform Cloud / GitHub Actions plan on PR |

## 7.9 문서 동기화 체크리스트

아키텍처 변경 시:

- [ ] `02.arch/config/` · `02.arch/*.md`
- [ ] `npm run sync:config`
- [ ] `00.doc` 제안서 HTML (Major 변경 시)

## 7.10 관련 문서

| 경로 | 용도 |
|------|------|
| [14-backend-frontend-design.md](./14-backend-frontend-design.md) | UI·API·NestJS |
| [15-lambda-development.md](./15-lambda-development.md) | AWS Lambda 9종 |
| [16-local-e2e-testing.md](./16-local-e2e-testing.md) | Podman · 로컬 E2E |
| `00.doc/techvalley_proposal/` | 기능정의서 HTML |
| `00.doc/architecture/` | Next.js 웹 아키텍처 docs |
