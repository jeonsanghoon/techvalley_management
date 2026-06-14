# 로컬 개발 — SSOT: `02.arch/config/local/`

**전체 스펙**: [../../16-local-e2e-testing.md](../../16-local-e2e-testing.md)

## 빠른 시작

```bash
# repo 루트 (techvalley/)
chmod +x 02.arch/config/local/*.sh
./02.arch/config/local/local-up.sh          # Podman + bootstrap
./02.arch/config/local/local-test-all.sh    # Lambda invoke 전체
npm run dev:frontend                        # UI :3000
```

## Podman Compose

```bash
podman compose -f 02.arch/config/local/docker-compose.yml up -d
# Docker Desktop 사용 시: docker compose -f ... 동일
```

| 서비스 | 포트 | AWS 대응 | DB/버킷 |
|--------|------|----------|---------|
| Mongo 7 | **27000** | DocumentDB Hot | `iot_service` |
| Postgres 16 | **25432** | Aurora Warm | `iot_analytics` |
| MinIO | **19010** / **19011** | S3 | `tv-analytics-raw`, `tv-media-upload` |

자격 증명: user/pass **`tv`** / **`tv_local_dev`**

## 환경 변수

```bash
cp 02.arch/config/local/env.local.example 02.arch/config/local/env.local
set -a && source 02.arch/config/local/env.local && set +a
```

SSOT: [../process-deploy.yaml](../process-deploy.yaml)

## Bootstrap (수동)

```bash
cd 03.source/lambda && npm install

export PGUSER=tv PGPASSWORD=tv_local_dev PGDATABASE=iot_analytics
./02.arch/config/local/bootstrap-postgres.sh
./02.arch/config/local/bootstrap-documentdb.sh
./02.arch/config/local/minio-init.sh    # mc 필요 (brew install minio/stable/mc)
```

## 스크립트

| 파일 | 역할 |
|------|------|
| `docker-compose.yml` | Podman 3종 (mongo, postgres, minio) |
| `local-up.sh` | compose up + wait + bootstrap |
| `local-test-all.sh` | rules + lambda assets + test:local:* |
| `bootstrap-postgres.sh` | Warm DDL + seed |
| `bootstrap-documentdb.mjs` | Hot 컬렉션·인덱스 |
| `minio-init.sh` | S3 버킷·prefix |
| `env.local.example` | URI·MinIO·AWS SDK env |

## 애플리케이션 포트

| 앱 | 포트 | 명령 |
|----|------|------|
| Frontend | 3000 | `npm run dev:frontend` |
| NestJS (예정) | 3002 | `03.source/beckend` |
| Architecture docs | 3001 | `npm run dev:architecture-docs` |

## 미러

`npm run sync:config --prefix 03.source/lambda` → `90.infra/local/` 복사

## 관련

- [../../16-local-e2e-testing.md](../../16-local-e2e-testing.md)
- [../../15-lambda-development.md](../../15-lambda-development.md)
- [../../14-backend-frontend-design.md](../../14-backend-frontend-design.md) §14.9
