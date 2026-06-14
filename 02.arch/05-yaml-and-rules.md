# 05. YAML·변환 규칙·배치 Cadence

테크밸리 IoT 플랫폼 **YAML 4층** 설계 SSOT입니다.

## 5.1 설정 4층

| 층 | 파일 (가칭) | 역할 |
|----|-------------|------|
| **A. 매니페스트** | `01-data-platform.manifest.yaml` | Doc/RDS 스키마, IoT Rule, KDS, 알람 ruleset |
| **B. 정규화** | `normalize-config.default.yaml` | 8세그먼트 파싱, topic_filter → collection |
| **C. 배치** | `02-batch-cadence.yaml` | cadence, read/write, RDS 매핑, depends_on |
| **D. 규칙 번들** | `rules/*.json` | 배포 시 빌드 산출 — Lambda 런타임 로드 |

**버전**: `spec_version` (문법) · `rule_version` (규칙) · `deploy_version` (운영 릴리스).

## 5.2 MQTT 토픽 (8세그먼트)

```
{tenant}/{env}/{edge}/{device}/{data_kind}/{domain}/{role}/json
```

| 세그먼트 | 허용 예 (테크밸리) |
|----------|-------------------|
| 5 `data_kind` | `periodic`, `event` |
| 6 `domain` | `telemetry`, `fota`, `control`, `alarm`, `file` |
| 7 `role` | `report`, `status`, `command`, `chunk` |

IoT Topic Rule → KDS **PartitionKey = `device_code`** (장비 S/N).

### 조직 필드 해석 (MQTT에 없음)

토픽 8세그먼트에는 company/branch/site가 **없습니다** — `{device}` = `device_code`만 carries합니다.  
`stream_sync_consumer`가 manifest `org_resolution` + `rdbms_time_series_link`로 `device` → `site` → `branch` → `company`를 조인·스냅샷합니다.

상세: [org-hierarchy.md](./config/schema/org-hierarchy.md) · [01-platform-overview.md](./01-platform-overview.md) §1.2

### metric-stream UI ↔ 토픽

| UI hash | data_kind / domain | 예시 필드 |
|---------|-------------------|-----------|
| `#periodic` | periodic / telemetry | tube.kv, temp, yield |
| `#event` | event / telemetry | 상태 전이, 알람 트리거 |
| `#firmware` | periodic / fota | firmware.version, OTA |
| `#control` | event / control | Shadow, IoT Job |

## 5.3 normalize-config (B층)

`mongo.documentDbTopicFilters.include` 화이트리스트 — **첫 매칭 행**의 `collection` + `rule_code`.

| topic 패턴 (예) | DocumentDB collection | rule_code |
|-----------------|----------------------|-----------|
| `+/+/+/+/periodic/telemetry/report/json` | `periodic_telemetry` | `rule_periodic_telemetry_v1` |
| `+/+/+/+/event/telemetry/status/json` | `event_history` | `rule_telemetry_events_v1` |
| `+/+/+/+/event/control/command/json` | `control_history` | `rule_control_v1` |
| `+/+/+/+/event/fota/report/json` | `fota_history` | `rule_fota_v1` |

Firehose 스위치: normalize-config에서 tier별 on/off — **Hot·Cold 동일 변환 출력** 유지.

## 5.4 규칙 JSON (D층)

주요 키:

```yaml
topic_match: ["..."]
payload:
  source_type: json_to_json | delimited_text | binary_* | json_wrapped_*
mappings: [...]
transform:
  steps: [calc, map_field, pivot, ...]
targets: [documentdb, firehose]
alerts_raw: [...]   # 스트림 즉시 알림
aggregations: [...] # 배치 입력 정의
```

### source_type (페이로드 디코드)

| type | 용도 |
|------|------|
| `json_to_json` | 표준 JSON 텔레메트리 |
| `delimited_text` | 레거시 구분자 |
| `binary_layout` / `binary_index` | 바이너리 센서 |
| `json_wrapped_binary` | JSON envelope + binary |

페이로드 디코드: `json_to_json`, `delimited_text`, `binary_layout` 등 — **`pipeline-core` `decodePayload()` (설계 예정)**. 현재 skeleton: [15-lambda-development.md](./15-lambda-development.md) §15.5.

## 5.5 배치 cadence (C층)

### 디바이스 롤업 체인

```
periodic_telemetry
  → telemetry_rollups_device_10min
  → telemetry_rollups_device_hour
  → telemetry_rollups_device_day
  → telemetry_rollups_device_month
  → telemetry_rollups_device_year
```

각 단계는 **직전 grain만** 입력.

### 테크밸리 관제 cadence (Aurora)

| cadence_id | 입력 | 출력 |
|------------|------|------|
| `rollup_hourly` | Doc hour 롤업 | `aurora.fleet_hourly_rollup` |
| `rollup_daily` | Doc day + alarm raw | `dashboard_daily_aggregate`, `alarm_daily_rollup` |
| `rollup_daily_yield` | Cold/Iceberg staging | `iceberg.yield_daily_rollup` |
| `equipment_log_export` | Doc 이벤트·제어·FOTA | Warm 카테고리별 log 테이블 |

### depends_on 예

```yaml
rollup_hourly:
  depends_on: [rollup_device_10min]
rollup_daily:
  depends_on: [rollup_device_day]
```

## 5.6 알람 규칙 분리

| 유형 | 실행 시점 | 설정 위치 |
|------|-----------|-----------|
| Raw (`alerts_raw`) | stream Lambda | rules JSON |
| 임계·복합 | EventBridge | alarm-rules UI ↔ ruleset mirror |
| 집계 (통신품질 등) | batch cadence | `02-batch-cadence.yaml` + RDS |

## 5.7 배포 워크플로 (YAML → predeploy → Terraform)

테크밸리 **`02.arch/config/` + `03.source/lambda/` + `90.infra/`** 배포 패턴.  
**상세 SSOT**: [10-yaml-pipeline-deploy-automation.md](./10-yaml-pipeline-deploy-automation.md)

### 한 줄 요약

```
processes/*.yaml → compose:manifest → ingress-deploy.yaml + infrastructure.yaml
  → npm run predeploy (번들·tfvars·validate) → terraform plan/apply (별도 승인)
```

### predeploy (AWS 배포 아님)

| 단계 | script | 산출 |
|------|--------|------|
| manifest 합성 | `compose:manifest` | `01-data-platform.manifest.yaml` |
| Lambda 빌드 | `lambda:assets` | `apps/*/bundle/` ZIP |
| Terraform 입력 | `tfvars` | `environments/*.auto.tfvars.json` |
| 정합 검증 | `validate:deploy` | manifest ↔ ingress-deploy ↔ IoT rules |

### 배포 SSOT 파일

```
02.arch/config/                    ← SSOT (11.1 전체)
  ingress-deploy.yaml
  infrastructure.yaml
  process-deploy.yaml
  normalize-config.default.yaml
  02-batch-cadence.yaml
  manifest/ · converter-rules/ · rules/ · samples/
90.infra/config/                   ← sync:config 미러
03.source/lambda/apps/*/bundle/
```

### EventBridge ↔ batch-cadence 이중 SSOT

| 계층 | 파일 | 내용 |
|------|------|------|
| cadence **의미** | `02-batch-cadence.yaml` | id, kind, storage, depends_on |
| AWS **cron** | `ingress-deploy.yaml#batch.schedules[]` | `schedule_expression` |
| 런타임 | `batch_cadence_runner` | EventBridge input `{ cadence_id, schedule_key }` |

### Terraform apply (수동 승인)

1. YAML/JSON 규칙 수정 (Git)
2. `npm run predeploy`
3. `terraform plan -var-file=environments/dev.auto.tfvars.json`
4. 승인 후 `terraform apply`
5. Lambda alias·버전 고정 (트리거별)

> `*.auto.tfvars.json`은 `npm run tfvars`로만 갱신 — **수동 편집 금지**

## 5.8 금지·예외

- KDS → Firehose **직접** (Lambda 우회) — 표준 금지
- RDS site 팩트에 **원시 periodic 로우** 직접 집계 — 금지 (Doc «일» 롤업 합산만)
- 배치 cadence **단일 EventBridge**에 전부 묶기 — cadence별 규칙 분리 권장

## 5.9 오프라인·복구 토픽 (ota · file)

Greengrass Disk Spooler 경유 가능한 도메인·역할. 상세 시퀀스: [08-greengrass-offline-resilience.md](./08-greengrass-offline-resilience.md).

| domain | role | Retained | 용도 |
|--------|------|----------|------|
| `ota` | `cf-url-request` | — | CF Signed URL 재발급 요청 |
| `ota` | `cf-url-response` | ✓ | 재발급 URL (만료 시 덮어쓰기) |
| `ota` | `progress` / `status` | — | OTA 진행·완료 |
| `file` | `request` / `response` / `chunk` / `stream` / `progress` / `complete` / `abort` | — | S3 단일·멀티파트·이미지청크·비디오스트림 ([13-media-upload-pipeline.md](./13-media-upload-pipeline.md)) |

Lambda `file_upload_orchestrator` 개발: [15-lambda-development.md](./15-lambda-development.md) · converter-rules **file 8종** — [11-config-examples-reference.md](./11-config-examples-reference.md)
