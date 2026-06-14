-- 테크밸리 Athena / Iceberg 조회 예시 (Glue: techvalley_analytics)
-- 로컬: Trino+Iceberg 또는 AWS Athena (workgroup tv-analytics)

-- 1) stream_fact_telemetry — 장비 일별 tube.kv 평균
SELECT
  device_code,
  date_trunc('day', cast(created_at AS timestamp)) AS day,
  avg(tube_kv) AS avg_tube_kv,
  avg(yield_pct) AS avg_yield
FROM techvalley_analytics.stream_fact_telemetry
WHERE dt >= date '2026-06-01'
  AND device_code = 'HK-2024-00158'
GROUP BY 1, 2
ORDER BY 2;

-- 2) yield_daily_rollup — UI inspection 그리드
SELECT event_day, site_id, lot_id, yield_pct_avg, sample_count
FROM techvalley_analytics.yield_daily_rollup
WHERE event_day = date '2026-06-06'
  AND site_id = 'TV-SITE-FACTORY-01'
ORDER BY lot_id;

-- 3) SageMaker 학습 feature export (최근 90일)
SELECT
  device_code,
  device_timestamp,
  tube_kv,
  detector_temp_c,
  yield_pct,
  is_alarm
FROM techvalley_analytics.stream_fact_telemetry
WHERE dt BETWEEN date '2026-03-01' AND date '2026-06-06'
  AND event_domain = 'telemetry';
