# 로컬 개발 — SSOT: `90.infra/10.local/`

Podman/Docker Compose, bootstrap, env.

배포 config·DDL: [`../config/`](../config/)

## 빠른 시작

```bash
# repo 루트
npm run local:up
npm run local:verify
npm run local:down
```

```bash
podman compose -f 90.infra/10.local/docker-compose.yml up -d
```

| 서비스 | 포트 | AWS 대응 |
|--------|------|----------|
| Mongo 7 | 37017 | DocumentDB |
| Postgres 16 | 35432 | Aurora |
| MinIO | 39100 / 39101 | S3 |

```bash
cp 90.infra/10.local/env.local.example 90.infra/10.local/env.local
set -a && source 90.infra/10.local/env.local && set +a
```

Bootstrap 스키마: `../config/schema/postgres/` · `../config/manifest/processes/03-documentdb.yaml`

## 스크립트

| 파일 | 역할 |
|------|------|
| `local-stack.yaml` | 포트·서비스·AWS 대응 |
| `docker-compose.yml` | Podman 3종 |
| `local-up.sh` | 기동 + bootstrap |
| `local-verify.sh` | 인프ra + 백엔드 테스트 |
| `bootstrap-postgres.sh` | Warm DDL + seed |
| `bootstrap-documentdb.mjs` | Hot 컬렉션·인덱스 |

## 하위 호환

`02.arch/config/local/*.sh` → 이 디렉터리 위임 래퍼.
