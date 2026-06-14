# Iceberg / S3 / Firehose (테크밸리 Cold Tier)

| 파일 | 역할 |
|------|------|
| [lake-config.yaml](./lake-config.yaml) | 버킷·Firehose·Glue·prefix·lifecycle SSOT |
| [tables.yaml](./tables.yaml) | Iceberg 테이블·파티션·컬럼 |
| [firehose-record.schema.json](./firehose-record.schema.json) | Lambda → Firehose JSON 스키마 |
| [glue/iceberg-commit-stream-fact.py](./glue/iceberg-commit-stream-fact.py) | Glue Job 스텁 |

## dev 실제 이름 (확인됨)

| 리소스 | 값 |
|--------|-----|
| S3 버킷 | `tv-ingress-dev-tv-analytics-raw` |
| Firehose | `tv-ingress-dev-cold-stream-events` |
| S3 landing prefix | `cold-stream-events/year=YYYY/month=MM/day=DD/` |
| Glue DB | `techvalley_analytics` |
| Iceberg warehouse | `s3://tv-ingress-dev-tv-analytics-raw/iceberg/warehouse/` |

## 예시

- [samples/firehose_stream_fact.sample.json](../../samples/firehose_stream_fact.sample.json)
- [samples/iceberg_yield_daily.sample.json](../../samples/iceberg_yield_daily.sample.json)
- [samples/s3-object-layout.example.md](../../samples/s3-object-layout.example.md)
- [samples/athena-query-examples.sql](../../samples/athena-query-examples.sql)

로컬 MinIO: `config/local/minio-init.sh`
