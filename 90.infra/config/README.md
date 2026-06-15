# 90.infra/config — 배포 설정

Lambda·Terraform·DDL·manifest **배포용 미러**.  
**작성 원본**: `02.arch/config/` → `npm run sync:config --prefix 03.source/lambda`

로컬 Podman/Compose: **[`../../10.local/`](../../10.local/)** (이 폴더에 `local/` 없음)

## 주요 파일

| 파일 | 용도 |
|------|------|
| `infrastructure.yaml` | AWS 스위치 · IAM · analytics lake · data plane |
| `ingress-deploy.yaml` | Lambda 9종 · KDS · Firehose |
| `process-deploy.yaml` | 로컬 E2E 시나리오 (`10.local/*.sh` 참조) |
| `manifest/` | composed manifest · processes/*.yaml |
| `schema/postgres/` | Warm DDL + seed (bootstrap: `10.local/bootstrap-postgres.sh`) |
| `schema/iceberg/` | Cold lake · Glue · Firehose |
| `converter-rules/` · `rules/` | payload converter JSON |

## sync 후 검증

```bash
cd 03.source/lambda
npm run rules:build
npm run sync:config
npm run predeploy
```

## 관련

- [../README.md](../README.md)
- [../../10.local/README.md](../../10.local/README.md)
- [../../02.arch/config/README.md](../../02.arch/config/README.md)
