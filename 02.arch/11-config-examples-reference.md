# 11. 설정 예시·샘플 레퍼런스

테크밸리 X-ray·검사 장비 IoT 플랫폼의 **설정·샘플 SSOT**입니다.  
**모든 파일은 `02.arch/config/`에 실제로 존재합니다.**

> 배포 시: `npm run sync:config --prefix 03.source/lambda` → `90.infra/config/`

## 11.1 파일 위치 요약

| 용도 | SSOT 경로 |
|------|-----------|
| **설정 인덱스** | [config/README.md](./config/README.md) |
| 배포 SSOT | [config/ingress-deploy.yaml](./config/ingress-deploy.yaml) |
| IoT·IAM 스위치 | [config/infrastructure.yaml](./config/infrastructure.yaml) |
| 로컬 E2E | [config/process-deploy.yaml](./config/process-deploy.yaml) |
| normalize | [config/normalize-config.default.yaml](./config/normalize-config.default.yaml) |
| batch cadence | [config/02-batch-cadence.yaml](./config/02-batch-cadence.yaml) |
| manifest (composed) | [config/manifest/01-data-platform.manifest.yaml](./config/manifest/01-data-platform.manifest.yaml) |
| manifest processes | [config/manifest/processes/](./config/manifest/processes/) |
| converter 규칙 YAML | [config/converter-rules/](./config/converter-rules/) (**13종**) |
| rules JSON | [config/rules/](./config/rules/) (**13종**) |
| DocDB 주기 샘플 | [config/samples/periodic_telemetry.samples.json](./config/samples/periodic_telemetry.samples.json) |
| MQTT 예시 | [config/samples/mqtt-topics.md](./config/samples/mqtt-topics.md) |
| 이벤트·알람·OTA·제어 | [config/samples/](./config/samples/) `*_event*.json` |
| AI·자가복구 샘플 | [config/samples/anomaly_event.sample.json](./config/samples/anomaly_event.sample.json) |
| rules 빌드 | [config/scripts/build-rules.mjs](./config/scripts/build-rules.mjs) |
| 로컬 Podman | [10.local/docker-compose.yml](../../10.local/docker-compose.yml) |
| Terraform tfvars | [config/terraform/environments/dev.auto.tfvars.json](./config/terraform/environments/dev.auto.tfvars.json) |
| **PostgreSQL DDL** | [config/schema/postgres/](./config/schema/postgres/) |
| **DocumentDB 계약** | [config/manifest/processes/03-documentdb.yaml](./config/manifest/processes/03-documentdb.yaml) |
| **Postgres manifest** | [config/manifest/processes/06-postgres.yaml](./config/manifest/processes/06-postgres.yaml) |
| **Iceberg lake SSOT** | [config/schema/iceberg/lake-config.yaml](./config/schema/iceberg/lake-config.yaml) |
| Firehose 레코드 샘플 | [config/samples/firehose_stream_fact.sample.json](./config/samples/firehose_stream_fact.sample.json) |
| S3 레이아웃 예시 | [config/samples/s3-object-layout.example.md](./config/samples/s3-object-layout.example.md) |
| Athena SQL 예시 | [config/samples/athena-query-examples.sql](./config/samples/athena-query-examples.sql) |
| **미디어 업로드** | [13-media-upload-pipeline.md](./13-media-upload-pipeline.md) · [config/media-upload.yaml](./config/media-upload.yaml) · `file_*.sample.json` |
| DB 설계 문서 | [12-database-design.md](./12-database-design.md) |

### converter-rules 13종 (core 5 + file 8)

| 파일 | collection | UI |
|------|------------|-----|
| `rule_periodic_telemetry_v1.yaml` | periodic_telemetry | metric-stream |
| `rule_telemetry_events_v1.yaml` | event_history | equipment-logs |
| `rule_alarm_events_v1.yaml` | device_notifications | alarms |
| `rule_control_events_v1.yaml` | control_history | remote-control |
| `rule_fota_events_v1.yaml` | fota_history | settings/firmware |
| `rule_file_events_v1.yaml` | files_history | file 업로드 (fallback) |
| `rule_file_request_v1.yaml` | files_history | file/request |
| `rule_file_chunk_v1.yaml` | files_history | image chunk |
| `rule_file_progress_v1.yaml` | files_history | multipart progress |
| `rule_file_complete_v1.yaml` | files_history | multipart complete |
| `rule_file_abort_v1.yaml` | files_history | multipart abort |
| `rule_file_response_v1.yaml` | files_history | orchestrator response |
| `rule_video_stream_v1.yaml` | files_history | video stream |

## 11.2 MQTT 8세그먼트

```
tv/{env}/{edge}/{device}/{data_kind}/{domain}/{role}/json
```

예: `tv/prd/GG-HW-001/HK-2024-00158/periodic/telemetry/report/json`

상세: [config/samples/mqtt-topics.md](./config/samples/mqtt-topics.md)

## 11.3 주기 텔레메트리

장비 MQTT → Lambda `rule_periodic_telemetry_v1` → DocumentDB `periodic_telemetry`

샘플: [config/samples/periodic_telemetry.samples.json](./config/samples/periodic_telemetry.samples.json)

## 11.4 rule_code · collection

| topic | rule_code | collection |
|-------|-----------|------------|
| `.../periodic/telemetry/report/json` | rule_periodic_telemetry_v1 | periodic_telemetry |
| `.../event/telemetry/status/json` | rule_telemetry_events_v1 | event_history |
| `.../event/alarm/+/json` | rule_alarm_events_v1 | device_notifications |
| `.../event/control/+/json` | rule_control_events_v1 | control_history |
| `.../event/fota/+/json` | rule_fota_events_v1 | fota_history |

## 11.5 alerts_raw

| id | 조건 | severity |
|----|------|----------|
| tube_kv_high | tube.kv > 180 | critical |
| detector_temp_high | detector.temp_c > 65 | warning |
| yield_drop | yield_pct < 90 | warning |

## 11.6 EventBridge ↔ batch-cadence

| schedule_key | ingress-deploy cron |
|--------------|---------------------|
| rollup_device_10min | `cron(0/10 * * * ? *)` |
| rollup_hourly | `cron(0 * * * ? *)` |
| fleet_hourly_export | `cron(15 * * * ? *)` |

## 11.7 batch Job ↔ UI

| batch_source_id | UI |
|-----------------|-----|
| aurora.fleet_hourly_rollup | /dashboard |
| aurora.alarm_daily_rollup | /alarms |
| iceberg.yield_daily_rollup | /inspection |

## 11.8 3-Tier

Hot DocumentDB 7일 · Warm Aurora 7~90일 · Cold Iceberg 90일+

## 11.9 명령

```bash
cd 03.source/lambda
npm run rules:build
npm run sync:config
npm run predeploy
```

## 11.10 배포 3종 동시 반영

normalize-config + manifest documentdb + 02-batch-cadence — **세트로 배포**

## 11.11 체크리스트

- [x] 11.1 전체 파일 `02.arch/config/`
- [x] Lambda apps (9개 skeleton + file-upload-orchestrator)
- [x] Terraform modules (ingress / batch / ml / lambda_function)
- [x] predeploy 스크립트 (compose · rules · assets · tfvars · validate)
- [x] 로컬 bootstrap (`10.local/bootstrap-*.sh`)
- [x] DB DDL·DocumentDB 인덱스 SSOT (`config/schema/`, `03-documentdb.yaml`)

## 11.12 관련 문서

- [config/README.md](./config/README.md)
- [10-yaml-pipeline-deploy-automation.md](./10-yaml-pipeline-deploy-automation.md)
- [14-backend-frontend-design.md](./14-backend-frontend-design.md)
- [15-lambda-development.md](./15-lambda-development.md)
- [16-local-e2e-testing.md](./16-local-e2e-testing.md)
- [10.local/README.md](../../10.local/README.md)
