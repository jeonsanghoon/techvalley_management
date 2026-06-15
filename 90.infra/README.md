# 90.infra — 테크밸리 인프라

배포·로컬 인프ra **단일 루트**.

```
90.infra/
├── 10.local/           ← Podman · Compose · bootstrap (로컬 실행 SSOT)
├── config/             ← Lambda YAML · DDL · manifest · rules
├── terraform/          ← AWS IaC
└── README.md
```

## 로컬 개발

```bash
npm run local:up       # 90.infra/10.local/local-up.sh
npm run local:verify
npm run local:down
```

상세: [10.local/README.md](./10.local/README.md)

## 배포 설정

- **작성 SSOT**: `02.arch/config/` → `npm run sync:config` → `90.infra/config/`
- Terraform: [terraform/README.md](./terraform/README.md)

## AWS ↔ 로컬

| AWS | 로컬 (`10.local/`) |
|-----|-------------------|
| Aurora PostgreSQL | Postgres `:35432` |
| DocumentDB | Mongo `:37017` |
| S3 | MinIO `:39100` |

포트·URI: [10.local/local-stack.yaml](./10.local/local-stack.yaml)

## 관련

- [config/README.md](./config/README.md)
- [../02.arch/16-local-e2e-testing.md](../02.arch/16-local-e2e-testing.md)
