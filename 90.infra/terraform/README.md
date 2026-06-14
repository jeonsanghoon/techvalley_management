# Terraform (테크밸리)

YAML SSOT → `npm run tfvars` → `environments/dev.auto.tfvars.json`

## 모듈

| 모듈 | 역할 |
|------|------|
| `modules/lambda_function` | zip 번들 → Lambda |
| `modules/ingress_stack` | Kinesis + ingress Lambda + ESM |
| `modules/batch_stack` | batch Lambda + EventBridge 스케줄 |
| `modules/ml_stack` | ML Lambda + EventBridge rate |
| `modules/eventbridge_lambda_schedule` | cron/rate → Lambda |

## 사용

```bash
cd 03.source/lambda
npm run predeploy          # bundle + tfvars 생성
npm run terraform:plan     # plan (AWS 자격 필요)
```

```bash
cd 90.infra/terraform
terraform init
terraform plan -var-file=environments/dev.auto.tfvars.json
```

`.build/` — Lambda zip 산출 (gitignore)
