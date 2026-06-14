# techvalley_management

테크밸리 IoT 플랫폼 **관리·아키텍처·소스** 모노레포입니다.

| 경로 | 내용 |
|------|------|
| `02.arch/` | 아키텍처·YAML·DDL SSOT |
| `03.source/frontend/` | Next.js 운영 UI |
| `03.source/lambda/` | 파이프라인 Lambda 9종 |
| `90.infra/` | Terraform · 로컬 Podman 미러 |
| `00.doc/architecture/` | 웹 아키텍처 docs (Next.js SSG) |

## 빠른 시작

```bash
npm run local:up          # Podman + DB bootstrap
npm run local:test        # Lambda 로컬 테스트
npm run dev:frontend      # UI http://localhost:3000
npm run dev:architecture-docs  # docs http://localhost:3001
```

상세: [02.arch/16-local-e2e-testing.md](02.arch/16-local-e2e-testing.md)
