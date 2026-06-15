# techvalley_management

테크밸리 IoT 플랫폼 **관리·아키텍처·소스** 모노레포입니다.

**Git repo 루트**: `techvalley/techvalley_management/`

| 경로 | 내용 |
|------|------|
| `00.doc/` | 제안서·아키텍처 웹 docs |
| `02.arch/` | 아키텍처·YAML **작성** SSOT |
| `03.source/` | frontend · beckend · lambda |
| **`90.infra/`** | **인프라 전체** — config · terraform · **10.local** |

## 인프라 구조 (`90.infra/`)

| 하위 | 역할 |
|------|------|
| **`90.infra/10.local/`** | Podman · Compose · bootstrap · env (로컬 실행 SSOT) |
| **`90.infra/config/`** | 배포 YAML · DDL · manifest (sync 미러) |
| **`90.infra/terraform/`** | AWS IaC |

## 빠른 시작

```bash
npm run local:up          # 90.infra/10.local — Podman + DB bootstrap
npm run local:verify      # 인프라 + 백엔드 테스트
npm run local:down
```

- 로컬: [90.infra/10.local/README.md](90.infra/10.local/README.md)
- 배포: [90.infra/README.md](90.infra/README.md)

## 애플리케이션

```bash
npm run dev:frontend
npm run dev:backend
npm run local:test
```
