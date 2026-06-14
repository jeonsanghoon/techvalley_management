# 테크밸리 파이프라인 Lambda

**설정 SSOT: [`02.arch/config/`](../../02.arch/config/)**  
**개발 SSOT: [`02.arch/15-lambda-development.md`](../../02.arch/15-lambda-development.md)**

## 명령

```bash
npm install
npm run rules:build    # converter-rules → rules/*.json (13종)
npm run sync:config    # 02.arch/config → 90.infra/config
npm run lambda:assets  # src/handler.mjs → apps/*/bundle/
npm run predeploy      # compose + rules + assets + tfvars + validate
```

## 구조

```
03.source/lambda/
├── apps/                 # Lambda 9종 (src/handler.mjs)
├── packages/pipeline-core/
├── scripts/
└── config/               # sync:config 미러
```

## 로컬 테스트

```bash
npm run lambda:assets
npm run test:local:ingress   # stream-sync-consumer
npm run test:local:batch     # batch-cadence-runner
npm run test:local:media     # file-upload-orchestrator
```

## 문서

- [15-lambda-development.md](../../02.arch/15-lambda-development.md) — **AWS Lambda 개발 스펙**
- [04-backend-services.md](../../02.arch/04-backend-services.md) — MSA·Lambda 개요
- [10-yaml-pipeline-deploy-automation.md](../../02.arch/10-yaml-pipeline-deploy-automation.md) — predeploy → Terraform
- [02.arch/config/README.md](../../02.arch/config/README.md)
