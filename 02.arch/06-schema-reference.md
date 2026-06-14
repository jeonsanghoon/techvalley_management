# 06. 스키마 및 UI 매핑

> **DB 설계 전체(DDL·bootstrap·ERD): [12-database-design.md](./12-database-design.md)**  
> **조직 계층 SSOT: [config/schema/org-hierarchy.md](./config/schema/org-hierarchy.md)**  
> **물리 SSOT: [`config/schema/`](./config/schema/)**

## 6.1 DocumentDB (Hot) — `iot_service`

| 컬렉션 | 용도 | Warm UI 카테고리 |
|--------|------|-----------------|
| `periodic_telemetry` | tube.kv, temp, yield 주기 | 주기 |
| `event_history` | 상태 전이·연결 | 이벤트 |
| `control_history` | Shadow·Job | 원격제어 |
| `fota_history` | OTA·버전 | 펌웨어 |
| `files_history` | 이미지·청크 업로드 | (파일) |
| `device_notifications` | 디바이스 알림 | 알람 |
| `stream_events_default` | 미분류 fallback | — |
| `device_meta` | Shadow·메타 스냅샷 | — |
| `telemetry_rollups_device_10min` | 10분 롤업 | — |
| `telemetry_rollups_device_hour` | 시간 롤업 | — |
| `telemetry_rollups_device_day` | 일 롤업 | — |
| `telemetry_rollups_device_{month,year}` | 월·연 | — |
| `rollup_cursor_periodic_telemetry` | 배치 체크포인트 | — |
| `pipeline_dlq_events` | 배치 DLQ | — |

### periodic_telemetry 주요 필드 (예)

| 필드 | 설명 |
|------|------|
| `device_code` | 장비 S/N |
| `site_id`, `customer_id` | 조직 (device→site→branch→company 스냅샷) |
| `tube.kv`, `tube.ma` | 튜브 출력 |
| `detector.temp_c` | 디텍터 온도 |
| `yield_pct` | 수율 (주기) |
| `reported_at` | ISO 8601 |

## 6.2 Aurora PostgreSQL (Warm)

| 테이블 | grain | UI |
|--------|-------|-----|
| `telemetry_site_product_time_series` | site × product × day/month/year | 대시보드·SLA |
| `telemetry_branch_product_time_series` | branch × product × day/month/year | 리포트·지점 KPI |
| `telemetry_company_product_time_series` | company × product | 리포트 |
| `communication_quality_rollups` | device 10min/hour | 데이터 파이프라인 |
| `communication_quality_rollups_site` | site | SLA |
| `communication_quality_rollup_branch` | branch | 지점 SLA·플릿 |
| `communication_alarm_incident` | 알람 인시던트 | 알람·티켓 |
| `communication_alarm_incident_actions` | 조치 이력 | 서비스 진행 |
| `notification` | 알림 수신함 | 설정·알람 |
| `notification_ruleset_mirror` | EventBridge 룰 미러 | alarm-rules |
| `device` (RDS) / `device_code` (Doc·MQTT) | 장비 마스터·S/N | equipment |
| `company` (RDS) | 회사 마스터 | customers |
| `branch` (RDS) | 지점·지사 (company 하위) | customers · 조직 |
| `site` (RDS) | 본사·지사·현장 (`org_level_type`) | installation · site 필터 |
| `service_ticket` | 티켓 | service-tickets |
| `service_ticket_progress` | 진행 | service-progress |
| `sla_fleet_snapshot` | SLA 스냅샷 | sla |
| `equipment_log_tube` … `equipment_log_audit` | 카테고리별 로그 | equipment-logs |
| `equipment_log_media` | 검사 이미지·비디오 | inspection, equipment-logs |
| `media_upload_session` · `media_upload_part` | S3 업로드 세션 | data-pipeline, inspection |
| `parts_order`, `parts_schedule` | 부품 | parts-* |
| `as_record` | AS 이력 | as |
| `installation` | 설치 | installation |
| `anomaly_events` | SageMaker 이상 탐지 결과 | alarms, metric-stream overlay |
| `rule_recommendations` | AI 룰셋 추천 draft/approved | alarm-rules |
| `self_heal_playbooks` | 엣지 자가복구 시나리오 | admin (예정) |
| `self_heal_executions` | Job 실행·성공률 | remote-diagnosis, equipment-logs |
| `model_registry_mirror` | 배포 모델 버전 | data-pipeline (health) |

## 6.3 Iceberg (Cold)

| 테이블 (논리) | 파티션 | UI |
|---------------|--------|-----|
| `yield_daily_rollup` | day, site, lot | inspection, dashboard |
| `anomaly_daily_rollup` | day, equipment | reports |
| `service_replacement_rollup` | month | reports |
| `stream_fact_telemetry` | day, device | Athena 분석·SageMaker 학습 |
| `fix_effectiveness_daily` | day, site | reports — OTA·self-heal KPI |

소스 식별자: `iceberg.yield_daily_rollup` (`BATCH_SOURCES`).

## 6.4 scope.ts ↔ 저장소 매핑

```typescript
// batch
fleetRollup:        "aurora.fleet_hourly_rollup"
dashboardAggregate: "aurora.dashboard_daily_aggregate"
alarmTrend:         "aurora.alarm_daily_rollup"
yieldAggregate:     "iceberg.yield_daily_rollup"
equipmentLogs:      "aurora.equipment_log_query"
collectionRollup:   "aurora.collection_daily_stats"
pipelineTier:       "documentdb.pipeline_tier_snapshot"

// realtime
metricStream:       "kinesis.metric_stream"
collectionLive:     "cloudwatch.collection_live"
fleetLive:          "documentdb.telemetry_hot"
remoteControl:      "iot.jobs + device.shadow"
```

## 6.5 UI 화면 ↔ API·소스

> **UI·API·NestJS 설계 전체**: [14-backend-frontend-design.md](./14-backend-frontend-design.md) §14.6

| route | menuId | scope | source (주) |
|-------|--------|-------|-------------|
| `/dashboard` | dashboard | batch | fleetRollup, dashboardAggregate |
| `/data-pipeline` | data-pipeline | mixed | collectionRollup, pipelineTier, collectionLive |
| `/metric-stream` | metric-stream | realtime | metricStream |
| `/equipment-logs` | equipment-logs | batch | equipmentLogs |
| `/alarms` | alarms | batch | alarmTrend, **anomaly_events** |
| `/alarm-rules` | alarm-rules | batch | notification_ruleset_mirror, **rule_recommendations** |
| `/remote-control` | remote-control | realtime | remoteControl, fleetLive |
| `/remote-diagnosis` | remote-diagnosis | batch+Hot | fleetLive |
| `/service-tickets` | service-tickets | batch | aurora.service_ticket |
| `/sla` | sla | batch | fleetRollup, sla_fleet_snapshot |
| `/equipment` | equipment | batch | fleetRollup |
| `/inspection` | inspection | batch | yieldAggregate |
| `/admin/iot-auth` | admin-iot-auth | — | IoT Core API |

## 6.6 공통코드 (admin/codes)

| group | code 예 | 용도 |
|-------|---------|------|
| `SLA_TIER` | Critical, High, Standard | SLA·계약 |
| `REGION` | KR-GG, KR-GB | 지역 |
| `PART_TYPE` | TUBE, DET | 부품 |
| `ALARM_SEV` | critical, warning | 알람 |

## 6.7 IoT 인증 (admin/iot-auth)

| 항목 | AWS |
|------|-----|
| 인증서 | X.509 |
| 프로비저닝 | JITP / JITR |
| 정책 | Thing Policy, Topic ACL |
| CA | Secrets Manager |

UI: `adminIotAuth` — Certificate store, Thing registry (mock).

## 6.8 ERP·외부 연동 (참고, IoT SSOT 외)

| 이벤트 | 방향 | 트리거 |
|--------|------|--------|
| `order.confirmed` | B→A | EventBridge |
| `shipment.updated` | B→A | EventBridge |
| `shipment.delivered` | B→A | 설치/교체 |

REST: OAuth2 + mTLS, Idempotency-Key, DLQ.

## 6.9 애플리케이션 ↔ 스키마

| 소비 주체 | Hot DocDB | Warm Aurora | 설계 SSOT |
|-----------|-----------|-------------|-----------|
| **Lambda** (적재·롤업) | `stream_sync_consumer`, `batch_cadence_runner` | cadence Job 산출 | [15-lambda-development.md](./15-lambda-development.md) |
| **NestJS API** (조회·트랜잭션) | `telemetry`, `fota` contexts | organization, service, alarm… | [14-backend-frontend-design.md](./14-backend-frontend-design.md) |
| **프론트** (mock→API) | metric-stream, equipment-logs | dashboard, alarms, SLA | `/reference/ui-api/` (웹 docs) |
