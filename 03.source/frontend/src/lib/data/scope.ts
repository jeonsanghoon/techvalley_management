/** 데이터 적재·조회 경로 구분 */
export type DataScope = "batch" | "realtime";

export interface DataSourceMeta {
  scope: DataScope;
  /** 스냅샷 시각 또는 마지막 롤업 완료 시각 (ISO 8601) */
  asOf: string;
  /** 저장소·파이프라인 식별자 */
  source: string;
  /** 갱신 주기 설명 (배치 Job cron 등) */
  refreshInterval?: string;
  /** 조회 REST 경로 (예: GET /api/equipment) */
  endpoint?: string;
}

export const BATCH_SOURCES = {
  fleetRollup: "aurora.fleet_hourly_rollup",
  dashboardAggregate: "aurora.dashboard_daily_aggregate",
  alarmTrend: "aurora.alarm_daily_rollup",
  yieldAggregate: "iceberg.yield_daily_rollup",
  equipmentLogs: "aurora.equipment_log_query",
  collectionRollup: "aurora.collection_daily_stats",
  pipelineTier: "documentdb.pipeline_tier_snapshot",
} as const;

export const REALTIME_SOURCES = {
  metricStream: "kinesis.metric_stream",
  collectionLive: "cloudwatch.collection_live",
  fleetLive: "documentdb.telemetry_hot",
  remoteControl: "iot.jobs + device.shadow",
} as const;
