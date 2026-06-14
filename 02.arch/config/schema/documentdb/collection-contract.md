# DocumentDB 컬렉션 계약 (테크밸리)

`manifest/processes/03-documentdb.yaml` 의 `collections[]` 가 **인덱스·컬렉션 이름 SSOT**입니다.

조직 계층 SSOT: [org-hierarchy.md](../org-hierarchy.md)

## 공통 필드 (Hot 문서)

| 필드 | 타입 | 설명 |
|------|------|------|
| `device_code` | string | 장비 S/N — MQTT `topic(4)`, KDS PartitionKey |
| `site_id` | string/int | 현장 코드 (`site.code` 스냅샷, `device.site_id` 조인) |
| `customer_id` | string | 회사 코드 (`company.code` 스냅샷 — UI customers) |
| `device_timestamp` | int64 | 장비 시각 epoch ms (UTC) |
| `data_index` | int | 동일 ms 내 시퀀스 — 멱등 UK |
| `created_at` | ISO8601 | 서버 적재 시각 |
| `base_time` | int64 | 10분 버킷 `yyyyMMddHHmm` |
| `base_hour` / `base_day` / `base_month` / `base_year` | int | 롤업 grain |

`site_id`·`customer_id`는 MQTT에 없음 — `stream_sync_consumer`가 `device` → `site` → `branch` → `company` 조인으로 denormalize ([manifest `org_resolution`](../manifest/01-data-platform.manifest.yaml)).

## periodic_telemetry (주기)

튜브·디텍터·수율 등 주기 보고. 샘플: `config/samples/periodic_telemetry.samples.json`

| 필드 | 예 |
|------|-----|
| `tube.kv`, `tube.ma` | 120.5, 2.1 |
| `detector.temp_c` | 42.3 |
| `yield_pct` | 98.7 |
| `meta.is_alarm` | false |

## event_history / control_history / fota_history / files_history

이벤트·제어·OTA·파일 — `document_schema_anchor` ↔ `converter-rules/*.yaml` ↔ `rules/*.json` 삼자 정합.

## 롤업 컬렉션

`telemetry_rollups_device_{10min,hour,day,month,year}` — `02-batch-cadence.yaml` cadence가 read/write.

## DocDB ↔ Aurora 링크

`03-documentdb.yaml` 의 `rdbms_time_series_link` — `device_code`로 `device` 마스터 조인, `device_timestamp` → 통신품질 롤업 window.

## TTL (Hot 7일)

운영 정책: 원천 `periodic_telemetry`·이벤트 — 7일 후 purge 또는 Cold 확인 후 삭제 ([03-storage-tiers.md](../../03-storage-tiers.md)).
