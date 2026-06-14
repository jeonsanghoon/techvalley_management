# 03. 3-Tier Storage 및 데이터 생명주기

## 3.1 Tier 요약 (테크밸리 기준)

기능정의서·운영 UI **기준정보**입니다. 운영 성숙도에 따라 Hot 90일 등으로 확장 가능하나, **UI·제안서 정합**은 아래를 SSOT로 합니다.

| Tier | 저장소 | 대표 데이터 | 표준 보존 | UI 표기 |
|------|--------|-------------|-----------|---------|
| **Hot** | Amazon DocumentDB | 실시간 텔레메트리, 이벤트, Shadow 스냅샷, 단기 롤업 | **7일** (기능정의서) | `DocumentDB` |
| **Warm** | Aurora PostgreSQL | 장비 로그 조회, site·플릿 롤업, 티켓·SLA·알람 팩트 | **7~90일** | `Aurora PostgreSQL` |
| **Cold** | Iceberg on S3 | 수율·장기 분석·감사 아카이브 | **90일+** | `Iceberg / S3` |

프론트 mock (`pipelineStatuses`)와 동일:

```744:768:03.source/frontend/src/lib/mock-data.ts
export const pipelineStatuses: PipelineStatus[] = [
  {
    tier: "Hot",
    store: "DocumentDB",
    retention: "7일",
    ...
  },
  {
    tier: "Warm",
    store: "Aurora PostgreSQL",
    retention: "7~90일",
    ...
  },
  {
    tier: "Cold",
    store: "Iceberg / S3",
    retention: "90일+",
    ...
  },
];
```

### 구현 확장 참고

운영 성숙도에 따라 Hot **90일**, Warm **730일**, Cold 감사 **7년** 등으로 세분화 가능. 변경 시 본 문서·mock·i18n을 함께 갱신.

## 3.2 Tier별 상세

### Hot — DocumentDB

| 항목 | 내용 |
|------|------|
| **Writer** | `stream_sync_consumer`, 장비 등록 API, 알람 Raw 적재 |
| **Reader** | 배치 ETL 입력, 관리 API GET (Writer 부하 분리) |
| **주요 컬렉션** | `periodic_telemetry`, `event_history`, `control_history`, `fota_history`, `telemetry_rollups_device_*` |
| **TTL** | 원천 텔레메트리·롤링 purge (보존 만료 후 삭제 또는 Cold 확인 후 삭제) |
| **UI** | 메트릭 스트림, 데이터 파이프라인 실시간 패널, 원격제어 Hot 상태 |

**REALTIME_SOURCES** (`scope.ts`):

- `documentdb.telemetry_hot` — 플릿 Live
- `kinesis.metric_stream` — 주기·이벤트·펌웨어·제어 스트림

### Warm — Aurora PostgreSQL

| 항목 | 내용 |
|------|------|
| **Writer** | `batch_cadence_runner` INSERT/UPSERT |
| **Reader** | BI·리포트, SLA, 장비 로그 배치 조회 |
| **주요 테이블** | `telemetry_{site,branch,company}_product_time_series`, `communication_quality_rollup_{device,site,branch}`, 티켓·SLA 팩트 |
| **롤업 grain** | device → site → **branch** → company ([org-hierarchy.md](./config/schema/org-hierarchy.md)) |
| **UI** | 장비 로그(카테고리별), SLA, 서비스 티켓/진행, 대시보드 배치 KPI |

**BATCH_SOURCES** (Warm/Aurora·Iceberg 조회):

- `aurora.fleet_hourly_rollup`
- `aurora.equipment_log_query`
- `aurora.alarm_daily_rollup`
- `iceberg.yield_daily_rollup` (Cold이나 UI는 «일별 롤업» 배치 스냅샷으로 표시)

### Cold — S3 + Iceberg

| 항목 | 내용 |
|------|------|
| **유입** | Lambda → Firehose → S3 landing → Glue Spark → Iceberg |
| **용도** | 수율 LOT 트레이서빌리티, 장기 통계, 레거시 검사 SW 이관 |
| **분석** | Athena (읽기 전용) |
| **UI** | 검사·수율, 리포트, 대시보드 수율 차트 (`Iceberg daily rollup`) |

## 3.3 생명주기 단계

```
1. Ingest    MQTT/HTTP → IoT Rule → KDS → Lambda
2. Process   YAML/JSON 규칙 정규화, DLQ 분기
3. Hot       DocumentDB 실시간·단기 롤업
4. Batch     EventBridge → Doc Reader → Aurora + Doc 상위 grain
5. Cold      Firehose → S3 → Iceberg (동일 정규화 계약)
6. Purge     TTL · Lifecycle · 파티션 drop · Legal hold
```

**티어 승격**: Hot DocumentDB → (배치) → Warm Aurora + Doc 롤업; Cold는 실시간 경로에서 **병행 적재** (순차 «승격»이 아닌 이중 기록).

## 3.4 UI 화면별 Tier·Scope

| 화면 | Tier | scope | asOf 의미 |
|------|------|-------|-----------|
| 대시보드 | Warm(롤업) + Cold(수율) | batch | hourly/daily Job 완료 시각 |
| 데이터 파이프라인 상단 | Warm + Hot 스냅샷 | mixed | 배치 + Tier snapshot |
| 데이터 파이프라인 하단 | Hot | realtime | Kinesis·Doc Hot lag |
| 메트릭 스트림 | Hot | realtime | 스트림 수신 시각 |
| 장비 로그 | Warm | batch | 카테고리별 배치 조회 |
| 알람 | Warm (스냅샷) | batch | hourly snapshot |
| 원격제어 | Hot | realtime | Shadow/Job 동기화 |
| SLA | Warm | batch | fleet hourly |

## 3.5 CQRS 엔드포인트

| DB | Writer 연결 | Reader 연결 |
|----|-------------|-------------|
| DocumentDB | Lambda 적재, POST/PUT API | GET API, 배치 ETL, 콘솔 목록 |
| Aurora | 배치 ETL, 트랜잭션 API | BI, SLA, 리포트 Read Replica |

복제 지연(`ReplicaLag`) 모니터링 — «방금 쓴 값 즉시 확인» 화면만 Primary fallback.

## 3.6 레거시·외부 이관 (기능정의서)

| 소스 | 대상 Tier | 방식 |
|------|-----------|------|
| Legacy 검사 SW·수율 DB | Cold (Iceberg) | Glue 배치 표준화 |
| 서비스/AS 이력 | Hot → Warm | 정규화·티켓 연속성 |
| Legacy MES | Aurora (제조 연동, B) | DMS·CDC — IoT 범위 외 |

## 3.7 Tier별 읽기·쓰기 주체

| Tier | 쓰기 (Write) | 읽기 (Read) | 개발 SSOT |
|------|--------------|-------------|-----------|
| **Hot** DocumentDB | Lambda `stream_sync_consumer` · media orchestrator | NestJS `telemetry` (SSE) · 배치 Reader | [15-lambda-development.md](./15-lambda-development.md) |
| **Warm** Aurora | Lambda `batch_cadence_runner` · NestJS 트랜잭션 API | NestJS GET (Reader) · BI | [14-backend-frontend-design.md](./14-backend-frontend-design.md) §14.4 |
| **Cold** Iceberg | Firehose → Glue | Athena · Iceberg proxy API | [06-schema-reference.md](./06-schema-reference.md) |

UI `DataScope`: batch 화면은 Warm/Aurora 스냅샷, realtime은 Hot/KDS — [14-backend-frontend-design.md](./14-backend-frontend-design.md) · [01-platform-overview.md](./01-platform-overview.md) §1.4
