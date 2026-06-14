# S3 객체 레이아웃 예시 (dev)

버킷: `tv-ingress-dev-tv-analytics-raw`  
리전: `ap-northeast-2`

## Firehose landing (extended_s3)

Lambda `PutRecordBatch` → Firehose → Parquet → S3:

```
s3://tv-ingress-dev-tv-analytics-raw/
├── cold-stream-events/
│   └── year=2026/
│       └── month=06/
│           └── day=06/
│               ├── tv-ingress-dev-cold-stream-events-1-2026-06-06-05-30-00-abc123.parquet
│               └── tv-ingress-dev-cold-stream-events-1-2026-06-06-05-45-00-def456.parquet
├── errors/
│   └── firehose/
│       └── cold-stream-events/
│           └── year=2026/month=06/day=06/...
├── iceberg/
│   └── warehouse/
│       ├── stream_fact_telemetry/
│       │   └── data/
│       │       └── dt=2026-06-06/
│       │           └── tenant_id=tv/
│       │               └── device_code=HK-2024-00158/
│       │                   └── *.parquet
│       └── yield_daily_rollup/
│           └── data/
│               └── event_day=2026-06-06/
│                   └── site_id=TV-SITE-FACTORY-01/
│                       └── lot_id=LOT-20260606-A/
│                           └── *.parquet
├── media/
│   └── {device_code}/...
├── fota/
│   └── ...
└── ml-artifacts/
    └── tv-tube-multivariate-v3/
```

## 로컬 MinIO (동일 prefix)

```
s3://tv-analytics-raw/   # endpoint http://127.0.0.1:19010
  cold-stream-events/year=2026/month=06/day=06/...
  iceberg/warehouse/stream_fact_telemetry/...
```

초기화: `config/local/minio-init.sh`

## Lifecycle (운영)

| Prefix | 보존 |
|--------|------|
| `cold-stream-events/` | 7일 (Iceberg 커밋 후 삭제) |
| `errors/firehose/` | 30일 |
| `iceberg/warehouse/` | 90일+ (Cold SSOT) |
| `media/` | Intelligent-Tiering |

SSOT: [schema/iceberg/lake-config.yaml](../schema/iceberg/lake-config.yaml)
