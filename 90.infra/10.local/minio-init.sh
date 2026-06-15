#!/usr/bin/env bash
# MinIO — S3 prefix 미러 (로컬 Cold 경로 검증)
set -euo pipefail
ENDPOINT="${MINIO_ENDPOINT:-http://127.0.0.1:39100}"
BUCKET="${MINIO_BUCKET:-tv-analytics-raw}"
MEDIA_BUCKET="${MINIO_MEDIA_BUCKET:-tv-media-upload}"
USER="${MINIO_ROOT_USER:-tv}"
PASS="${MINIO_ROOT_PASSWORD:-tv_local_dev}"

if ! command -v mc >/dev/null 2>&1; then
  echo "MinIO Client (mc) not found — install: brew install minio/stable/mc"
  echo "Manual: create bucket $BUCKET and prefixes cold-stream-events/, iceberg/warehouse/"
  exit 0
fi

mc alias set tv-local "$ENDPOINT" "$USER" "$PASS" --api S3v4
mc mb -p "tv-local/$BUCKET" 2>/dev/null || true
mc mb -p "tv-local/$MEDIA_BUCKET" 2>/dev/null || true

for prefix in \
  cold-stream-events/year=2026/month=06/day=06 \
  errors/firehose/cold-stream-events \
  iceberg/warehouse/stream_fact_telemetry/data \
  iceberg/warehouse/yield_daily_rollup/data \
  media \
  media/images \
  media/video-stream \
  media/logs \
  ml-artifacts/tv-tube-multivariate-v3
do
  echo "placeholder" | mc pipe "tv-local/$BUCKET/$prefix/.keep" 2>/dev/null || true
  echo "OK prefix: s3://$BUCKET/$prefix/"
done

for prefix in media/images media/video-stream media/logs; do
  echo "placeholder" | mc pipe "tv-local/$MEDIA_BUCKET/$prefix/.keep" 2>/dev/null || true
  echo "OK prefix: s3://$MEDIA_BUCKET/$prefix/"
done

echo "MinIO initialized: $ENDPOINT buckets $BUCKET, $MEDIA_BUCKET"
