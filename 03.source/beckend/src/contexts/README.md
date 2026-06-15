# 바운디드 컨텍스트 (`src/contexts`)

FOTA Lite와 동일하게 **기능(도메인) 단위**로 소스를 묶는다. 각 컨텍스트 폴더는 아래 **다섯 개의 하위 폴더**를 둔다.

| 폴더 | 내용 |
|------|------|
| **`dto/`** | API 요청·응답 TypeScript 타입 · `class-validator` request DTO |
| **`controllers/`** | HTTP 라우트 (`*.controller.ts`) |
| **`services/`** | 애플리케이션 서비스 — 매핑·조합·비즈니스 규칙 |
| **`entities/`** | TypeORM 엔티티 — DDL SSOT: `02.arch/config/schema/postgres/` |
| **`dao/`** | DB 접근 — **Repository**(단순) + **raw SQL**(JOIN/집계) |
| **`modules/`** | Nest `*.module.ts` — 컨트롤러·서비스·DAO 등록 |

공유 타입은 `src/common/`에 둔다.

| 경로 | 내용 |
|------|------|
| `common/types/enums.ts` | `EquipmentStatus`, `AlarmSeverity` 등 리터럴 union |
| `common/types/db/postgres-rows.ts` | DAO용 Postgres row 인터페이스 |
| `common/types/db/mongo-docs.ts` | Mongo document 인터페이스 |
| `common/dto/batch-meta.dto.ts` | `BatchMetaDto`, `createBatchMeta()` |
| `common/dto/api-response.dto.ts` | `ApiDataEnvelopeDto<T>`, `ItemsDto<T>` |
| `common/mappers.ts` | row/doc → context `dto/*` 매퍼 (타입 안전) |

## 컨텍스트 목록

| 컨텍스트 | dao | API prefix |
|----------|-----|------------|
| **platform** | — | `GET /health` |
| **dashboard** | `dashboard.dao.ts` | `/api/dashboard/*` |
| **device** | `device.dao.ts` | `/api/equipment`, `/api/fleet/live`, `/api/devices` |
| **alarm** | `alarm.dao.ts` | `/api/alarms`, `/api/alarm-rules` |
| **pipeline** | `pipeline.dao.ts` | `/api/pipeline/*` |
| **telemetry** | `telemetry.dao.ts` | `/api/metric-stream/*` |
| **service** | `service.dao.ts` (ticket + sla) | `/api/service/*`, `/api/sla/*` |
| **parts** | `parts.dao.ts` | `/api/parts/*` |
| **installation** | `installation.dao.ts` | `/api/installation` |
| **organization** | `organization.dao.ts` | `/api/companies`, `/api/sites` |
| **identity** | `identity.dao.ts` | `/api/auth/*` |
| **admin** | `admin.dao.ts` | `/api/admin/*` |
| **settings** | `settings.dao.ts` | `/api/settings/*` |
| **catalog** | `catalog.dao.ts` | `/api/firmware/*`, `/api/iot/*` |
| **inspection** | `inspection.dao.ts` | `/api/inspection/*` |
| **reports** | `reports.dao.ts` | `/api/reports` |
| **remote** | `remote.dao.ts` | `/api/remote/*` |
| **equipment-log** | `equipment-log.dao.ts` | `/api/equipment-logs` |

## 레이어 흐름

```
HTTP → Controller (dto) → Service (mapper) → Dao
                                              ├─ TypeORM Repository (단순 CRUD/count)
                                              └─ RawQueryService / PostgresService (직접 SQL)
```

상세: `src/infrastructure/database/README.md`

## 로컬 실행

```bash
cd 03.source/beckend
npm run dev   # http://localhost:3002
```

SSOT: `02.arch/14-backend-frontend-design.md`
