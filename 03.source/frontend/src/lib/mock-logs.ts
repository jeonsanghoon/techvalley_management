/**
 * @deprecated 배치 로그 → @/lib/data/batch, 실시간 메트릭 → @/lib/data/realtime
 */
export { batchEquipmentLogs as equipmentLogs } from "@/lib/data/batch/equipment-logs";
export { generateLiveMetric, realtimeMetricSeed as metricLogs } from "@/lib/data/realtime/metric-stream";
