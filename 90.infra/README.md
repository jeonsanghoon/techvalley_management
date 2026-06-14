# 90.infra — 테크밸리 배포 인프라

> **설정 SSOT: `02.arch/config/`**  
> `config/`는 `npm run sync:config --prefix 03.source/lambda` 미러입니다.

## 동기화

```bash
cd 03.source/lambda && npm run sync:config
```

## Terraform

`terraform/` — 예정. tfvars 예: `02.arch/config/terraform/environments/dev.auto.tfvars.json`

## 문서

- [02.arch/config/README.md](../02.arch/config/README.md)
- [02.arch/11-config-examples-reference.md](../02.arch/11-config-examples-reference.md)
