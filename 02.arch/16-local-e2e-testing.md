# 16. 로컬 E2E 테스트 스펙

테크밸리 플랫폼을 **Podman Compose**로 AWS Hot/Warm/S3를 대체하고, 프론트·Lambda·(예정) NestJS를 **로컬에서 일괄 검증**하기 위한 SSOT입니다.

관련: [07-repo-and-deployment.md](./07-repo-and-deployment.md) §7.7 · [config/local/](./config/local/) · [process-deploy.yaml](./config/process-deploy.yaml) · [15-lambda-development.md](./15-lambda-development.md) · [14-backend-frontend-design.md](./14-backend-frontend-design.md)

---

## 16.1 목표

| AWS (운영) | 로컬 대체 | 용도 |
|------------|-----------|------|
| DocumentDB | **MongoDB 7** (mongo:7) | Hot — `iot_service` |
| Aurora PostgreSQL | **Postgres 16** | Warm — `iot_analytics` |
| S3 | **MinIO** | 미디어·Cold landing·FOTA 아티팩트 |
| Kinesis / IoT | **샘플 JSON + handler invoke** | Lambda 단위·파이프라인 스텁 |
| Cognito / API GW | **mock + (next) NestJS 로컬** | UI·REST |

**원칙**: 설정 SSOT는 **`02.arch/config/local/`** — `sync:config` 시 `90.infra/local/` 미러.

---

## 16.2 사전 요구사항

| 도구 | 버전 | 용도 |
|------|------|------|
| **Podman** + compose | 최신 | 컨테이너 (Docker Desktop 대체 가능: `docker compose` 동일 파일) |
| **Node.js** | ≥24 | Lambda·bootstrap |
| **psql** | 16+ | Postgres bootstrap (`bootstrap-postgres.sh`) |
| **mc** (선택) | MinIO Client | 버킷·prefix 초기화 (`minio-init.sh`) |

```bash
# macOS 예
brew install podman psql
brew install minio/stable/mc   # 선택
```

---

## 16.3 Podman Compose — 인프라 SSOT

파일: [`config/local/docker-compose.yml`](./config/local/docker-compose.yml)

| 서비스 | 이미지 | 호스트 포트 | 컨테이너 | 자격 증명 |
|--------|--------|-------------|----------|-----------|
| **documentdb** | mongo:7 | **27000** | 27017 | user `tv` / pass `tv_local_dev` |
| **postgres** | postgres:16 | **25432** | 5432 | user `tv` / pass `tv_local_dev` / DB **`iot_analytics`** |
| **minio** | minio/minio | **19010** (API), **19011** (console) | 9000/9001 | `tv` / `tv_local_dev` |

### 기동·중지

```bash
# repo 루트 (techvalley/)
podman compose -f 02.arch/config/local/docker-compose.yml up -d
podman compose -f 02.arch/config/local/docker-compose.yml ps
podman compose -f 02.arch/config/local/docker-compose.yml down    # 볼륨 유지
podman compose -f 02.arch/config/local/docker-compose.yml down -v  # 데이터 삭제
```

### 원라인 (기동 + bootstrap + MinIO)

```bash
./02.arch/config/local/local-up.sh
```

---

## 16.4 연결 URI · 환경 변수 SSOT

SSOT: [`config/process-deploy.yaml`](./config/process-deploy.yaml) · 예시: [`config/local/env.local.example`](./config/local/env.local.example)

| 변수 | 로컬 값 |
|------|---------|
| `TV_MONGO_URI` | `mongodb://tv:tv_local_dev@127.0.0.1:27000/iot_service?authSource=admin&directConnection=true` |
| `TV_POSTGRES_URI` | `postgresql://tv:tv_local_dev@127.0.0.1:25432/iot_analytics` |
| `PGHOST` / `PGPORT` / `PGUSER` / `PGPASSWORD` / `PGDATABASE` | `127.0.0.1` / `25432` / `tv` / `tv_local_dev` / `iot_analytics` |
| `MONGO_URI` | `TV_MONGO_URI` 와 동일 (bootstrap-documentdb.mjs) |
| `MINIO_ENDPOINT` | `http://127.0.0.1:19010` |
| `MINIO_ROOT_USER` / `MINIO_ROOT_PASSWORD` | `tv` / `tv_local_dev` |
| `MINIO_BUCKET` | `tv-analytics-raw` (Cold landing) |
| `MINIO_MEDIA_BUCKET` | `tv-media-upload` |
| `AWS_ENDPOINT_URL` (Lambda S3 SDK, 예정) | `http://127.0.0.1:19010` |
| `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` | `tv` / `tv_local_dev` |

로컬 env 로드:

```bash
set -a && source 02.arch/config/local/env.local.example && set +a
# 또는 export 개별 변수
```

---

## 16.5 Bootstrap (스키마·시드)

| 순서 | 스크립트 | 대상 |
|------|----------|------|
| 1 | [`bootstrap-postgres.sh`](./config/local/bootstrap-postgres.sh) | DDL `01-core-schema.sql`, `02-pipeline-alarm-notification.sql`, `04-tv-domain-extensions.sql`, seed `05-seed-dev.sql` |
| 2 | [`bootstrap-documentdb.mjs`](./config/local/bootstrap-documentdb.mjs) | `manifest/processes/03-documentdb.yaml` 컬렉션·인덱스 |
| 3 | [`minio-init.sh`](./config/local/minio-init.sh) | 버킷 `tv-analytics-raw`, `tv-media-upload` + S3 prefix |

```bash
cd 03.source/lambda && npm install   # mongodb driver (bootstrap-documentdb)

./02.arch/config/local/bootstrap-postgres.sh
./02.arch/config/local/bootstrap-documentdb.sh
./02.arch/config/local/minio-init.sh
```

| DB | 데이터베이스명 | SSOT |
|----|--------------|------|
| Postgres | `iot_analytics` | [12-database-design.md](./12-database-design.md) §12.4 |
| Mongo | `iot_service` | `03-documentdb.yaml` |

시드 장비 S/N 예: `HK-2024-00158` — 프론트 mock·`periodic_telemetry.samples.json`과 동일.

---

## 16.6 애플리케이션 계층 — 로컬 실행

### 16.6.1 프론트엔드 (mock → 로컬 API 전환 전)

```bash
cd 03.source/frontend
cp .env.local.example .env.local   # AG Grid · Maps 키
npm ci && npm run dev              # http://localhost:3000
```

| env | 로컬 |
|-----|------|
| `NEXT_PUBLIC_AG_GRID_LICENSE_KEY` | 필수 |
| `NEXT_PUBLIC_API_URL` | (예정) `http://localhost:3002/api` |

데이터: `src/lib/data/batch/*`, `realtime/*` mock — NestJS 연동 후 교체 ([14](./14-backend-frontend-design.md) §14.6).

### 16.6.2 Lambda (handler invoke — DB write는 next)

```bash
cd 03.source/lambda
npm install
npm run rules:build
npm run sync:config
npm run lambda:assets
npm run test:local:ingress    # stream-sync-consumer + KDS 샘플
npm run test:local:batch      # batch-cadence-runner + cadence 이벤트
npm run test:local:media      # file-upload-orchestrator 스텁
```

| script | handler | 입력 |
|--------|---------|------|
| `test:local:ingress` | stream-sync-consumer | `samples/periodic_telemetry.samples.json` → 가짜 KDS Records |
| `test:local:batch` | batch-cadence-runner | `{ cadence_id: rollup_device_10min }` |
| `test:local:media` | file-upload-orchestrator | multipart 시나리오 스텁 |

**현재**: handler JSON 반환 검증(skeleton). **next**: `TV_MONGO_URI` / `TV_POSTGRES_URI` 로 DocDB·Aurora 실 write.

### 16.6.3 NestJS API (예정)

| 항목 | 로컬 계획 |
|------|-----------|
| 포트 | **3002** |
| Postgres | `POSTGRES_WRITE_URL` = `TV_POSTGRES_URI` |
| Mongo | `MONGO_WRITE_URI` = `TV_MONGO_URI` |
| S3 | MinIO endpoint + path-style |

FOTA Lite `start-local.sh` 패턴 참고 — `03.source/beckend/` 구현 시 본 문서 §16.9 체크리스트 갱신.

### 16.6.4 아키텍처 웹 docs

```bash
npm run dev:architecture-docs   # http://localhost:3001
```

---

## 16.7 로컬 E2E 시나리오 (process-deploy)

SSOT: [`config/process-deploy.yaml`](./config/process-deploy.yaml) → `scenarios.full_local_service`

| step | 명령 | cwd |
|------|------|-----|
| 1 | `podman compose … up -d` | repo 루트 |
| 2 | bootstrap postgres · docdb · minio | `02.arch/config/local/` |
| 3 | `npm run compose:manifest` | `03.source/lambda` |
| 4 | `npm run rules:build` | `03.source/lambda` |
| 5 | `npm run predeploy` | `03.source/lambda` |
| 6 | `npm run test:local:ingress` | `03.source/lambda` |
| 7 | `npm run test:local:batch` | `03.source/lambda` |
| 8 | `npm run test:local:media` | `03.source/lambda` |
| 9 | (수동) 프론트 `npm run dev` | `03.source/frontend` |

원라인 테스트:

```bash
./02.arch/config/local/local-test-all.sh
```

---

## 16.8 검증 체크리스트

### 인프라

- [ ] `podman compose ps` — 3 서비스 Up
- [ ] `psql "$TV_POSTGRES_URI" -c '\dt'` — 테이블 존재
- [ ] `mongosh "$TV_MONGO_URI" --eval 'db.getCollectionNames()'` — Hot 컬렉션
- [ ] MinIO console http://127.0.0.1:19011 — 버킷 2개

### Lambda (skeleton)

- [ ] `test:local:ingress` → `stored: true`, `device_code` 출력
- [ ] `test:local:batch` → cadence_id 처리 JSON
- [ ] `predeploy` → validate-deploy 성공

### 프론트

- [ ] http://localhost:3000 — 대시보드·파이프라인·metric-stream mock
- [ ] `DataScope` batch/realtime 메타 표시

### next (실 연동)

- [ ] stream-sync → Mongo `periodic_telemetry` upsert
- [ ] batch-cadence → Postgres rollup 테이블 INSERT
- [ ] file-upload-orchestrator → MinIO Presign + `media_upload_session`
- [ ] NestJS + `NEXT_PUBLIC_API_URL` E2E

---

## 16.9 포트·프로세스 요약

| 프로세스 | 포트 | SSOT 경로 |
|----------|------|-----------|
| Postgres | 25432 | compose |
| Mongo | 27000 | compose |
| MinIO API / Console | 19010 / 19011 | compose |
| Frontend | 3000 | `03.source/frontend` |
| NestJS API | 3002 (예정) | `03.source/beckend` |
| Architecture docs | 3001 | `00.doc/architecture/site` |

---

## 16.10 트러블슈팅

| 증상 | 조치 |
|------|------|
| Postgres `role "tv_admin" does not exist` | `PGUSER=tv` 사용 — bootstrap SSOT 수정됨 |
| Mongo auth failed | URI에 `authSource=admin` 포함 |
| `mongodb driver missing` | `cd 03.source/lambda && npm install` |
| MinIO bucket 없음 | `./minio-init.sh` 또는 console에서 수동 생성 |
| Lambda bundle 없음 | `npm run lambda:assets` 선행 |
| `validate:deploy` 실패 | `npm run rules:build && npm run compose:manifest` 후 재시도 |

---

## 16.11 관련 문서

| 문서 | 내용 |
|------|------|
| [config/local/README.md](./config/local/README.md) | 빠른 시작 |
| [12-database-design.md](./12-database-design.md) §12.7 | bootstrap |
| [15-lambda-development.md](./15-lambda-development.md) | Lambda 로컬 invoke |
| [13-media-upload-pipeline.md](./13-media-upload-pipeline.md) | MinIO·미디어 |
| [10-yaml-pipeline-deploy-automation.md](./10-yaml-pipeline-deploy-automation.md) §10.10 | predeploy |
