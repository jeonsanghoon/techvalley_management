# 테크밸리 MQTT 토픽 예시 (8세그먼트)

## 패턴

```
{tenant}/{env}/{edge}/{device}/{data_kind}/{domain}/{role}/json
```

| 세그먼트 | 테크밸리 예 |
|----------|-------------|
| tenant | `tv` |
| env | `dev` · `stg` · `prd` |
| edge | Greengrass Thing (예: `GG-HW-001`) |
| device | 장비 S/N (예: `HK-2024-00158`) |
| data_kind | `periodic` · `event` |
| domain | `telemetry` · `fota` · `control` · `alarm` · `file` · `ota` |
| role | `report` · `status` · `command` · `chunk` · `cf-url-request` |
| format | `json` |

## 주기 텔레메트리 (metric-stream #periodic)

```
tv/prd/GG-HW-001/HK-2024-00158/periodic/telemetry/report/json
```

페이로드 예 (장비 → Greengrass → IoT Core):

```json
{
  "deviceId": "HK-2024-00158",
  "device_timestamp": 1717654320000,
  "data_index": 0,
  "datas": [
    { "key": "tube.kv", "value": 160.2, "value_type": "number" },
    { "key": "tube.ma", "value": 3.8, "value_type": "number" },
    { "key": "detector.temp_c", "value": 42.1, "value_type": "number" },
    { "key": "yield_pct", "value": 97.4, "value_type": "number" }
  ]
}
```

## 이벤트·알람 (#event)

```
tv/prd/GG-HW-001/HK-2024-00158/event/telemetry/status/json
tv/prd/GG-HW-001/HK-2024-00158/event/alarm/triggered/json
```

## OTA (#firmware)

```
tv/prd/GG-HW-001/HK-2024-00158/event/fota/status/json
tv/prd/GG-HW-001/HK-2024-00158/+/ota/cf-url-request/json
tv/prd/GG-HW-001/HK-2024-00158/+/ota/progress/json
```

## 원격제어 (#control)

```
tv/prd/GG-HW-001/HK-2024-00158/event/control/command/json
tv/prd/GG-HW-001/HK-2024-00158/event/control/result/json
```

## 미디어 업로드 — 이미지·비디오·S3 (#file)

상세: [13-media-upload-pipeline.md](../13-media-upload-pipeline.md)

```
tv/prd/GG-HW-001/HK-2024-00158/event/file/request/json
tv/prd/GG-HW-001/HK-2024-00158/event/file/response/json
tv/prd/GG-HW-001/HK-2024-00158/event/file/chunk/json
tv/prd/GG-HW-001/HK-2024-00158/event/file/stream/json
tv/prd/GG-HW-001/HK-2024-00158/event/file/progress/json
tv/prd/GG-HW-001/HK-2024-00158/event/file/complete/json
tv/prd/GG-HW-001/HK-2024-00158/event/file/abort/json
```

| upload_mode | 용도 |
|-------------|------|
| `single_put` | 5MB 이하 로그·소형 파일 |
| `multipart` | 대용량 단일 객체 |
| `image_chunk` | 검사 프레임 청크 |
| `video_stream` | MJPEG/H.264 세그먼트 |

## IoT Rule PartitionKey

`device_code` = topic(4) = 장비 S/N

## UI hash 매핑

| UI hash | topic 예 |
|---------|----------|
| `#periodic` | `.../periodic/telemetry/report/json` |
| `#event` | `.../event/telemetry/status/json` |
| `#firmware` | `.../event/fota/status/json` |
| `#control` | `.../event/control/result/json` |
