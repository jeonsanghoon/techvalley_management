# Document schema anchors (테크밸리)

`normalize-config.default.yaml` 의 `document_schema_anchor` ↔ 컬렉션 ↔ `rules/*.json` 레지스트리.

| 앵커 | 컬렉션 | rule_code | batch_read |
|------|--------|-----------|------------|
| `periodic-telemetry-stream-v1` | `periodic_telemetry` | `rule_periodic_telemetry_v1` | `rollup_device_10min` |
| `telemetry-event-docs-v1` | `event_history` | `rule_telemetry_events_v1` | — |
| `alarm-event-docs-v1` | `event_history` (alarm) | `rule_alarm_events_v1` | — |
| `control-command-docs-v1` | `control_history` | `rule_control_events_v1` | — |
| `fota-event-docs-v1` | `fota_history` | `rule_fota_events_v1` | — |
| `file-transfer-docs-v1` | `files_history` | `rule_file_events_v1` | — |
| `file-request-v1` | `files_history` | `rule_file_request_v1` | `media_upload_export` |
| `file-chunk-v1` | `files_history` | `rule_file_chunk_v1` | `media_upload_export` |
| `video-stream-v1` | `files_history` | `rule_video_stream_v1` | `media_upload_export` |
| `file-complete-v1` | `files_history` | `rule_file_complete_v1` | `media_upload_export` |

MQTT file upload (tenant `tv`):

```
tv/{env}/{edge}/{device_code}/event/file/request/json
tv/{env}/{edge}/{device_code}/event/file/chunk/json
tv/{env}/{edge}/{device_code}/event/file/stream/json
```

미디어 파이프라인: [13-media-upload-pipeline.md](../../13-media-upload-pipeline.md)

MQTT 토픽 (tenant `tv`):

```
tv/{env}/{edge}/{device_code}/periodic/telemetry/report/json
tv/{env}/{edge}/{device_code}/event/alarm/{code}/json
```

KDS PartitionKey = **`device_code`** (= `topic(4)`).

상세: [05-yaml-and-rules.md](../../05-yaml-and-rules.md), [collection-contract.md](./collection-contract.md)
