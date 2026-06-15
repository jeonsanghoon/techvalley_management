# 02.arch/config — 테크밸리 아키텍처 설정 SSOT

**모든 YAML·JSON·manifest·samples는 이 폴더가 원본입니다.**  
`02.arch/*.md` Markdown과 한곳에서 관리합니다.

배포: `npm run sync:config --prefix 03.source/lambda` → `90.infra/config/`

## 디렉터리 트리

```
02.arch/config/
├── README.md
├── ingress-deploy.yaml      # Lambda 9종 · KDS · EventBridge SSOT
├── infrastructure.yaml
├── process-deploy.yaml
├── normalize-config.default.yaml
├── 02-batch-cadence.yaml
├── media-upload.yaml
├── manifest/
│   ├── 01-data-platform.manifest.yaml
│   └── processes/
├── converter-rules/           (13 YAML)
├── rules/                     (13 JSON — rules:build)
├── samples/
├── scripts/build-rules.mjs
└── terraform/environments/dev.auto.tfvars.json

로컬 Podman·Compose: **[../../10.local/](../../10.local/)** (config/local 아님)
```

## 명령

```bash
cd 03.source/lambda
npm run rules:build      # converter-rules → rules/*.json (13종)
npm run sync:config      # → 90.infra/config
npm run lambda:assets    # handler → apps/*/bundle/
npm run predeploy        # manifest + bundle + tfvars + validate
```

## 테크밸리 규약

| 항목 | 값 |
|------|-----|
| MQTT tenant | `tv` |
| 조직 계층 | `company` → `branch` → `site` → `device` ([schema/org-hierarchy.md](./schema/org-hierarchy.md)) |
| PartitionKey | `device_code` (장비 S/N) |
| Lambda | 9종 · nodejs24.x · arm64 ([../15-lambda-development.md](../15-lambda-development.md)) |
| 예시 S/N | `HK-2024-00158` |
| 리전 | `ap-northeast-2` |
| project | `tv-ingress` |

## 관련 문서

- [../11-config-examples-reference.md](../11-config-examples-reference.md)
- [../10-yaml-pipeline-deploy-automation.md](../10-yaml-pipeline-deploy-automation.md)
- [../15-lambda-development.md](../15-lambda-development.md)
- [../14-backend-frontend-design.md](../14-backend-frontend-design.md)
- [../../00.doc/architecture/site/](../../00.doc/architecture/site/) — Next.js 웹 아키텍처 docs
