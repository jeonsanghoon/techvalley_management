/**
 * @file mongo-docs.ts
 * @description MongoDB 컬렉션 document 타입 — DAO 계층 전용.
 *
 * **컬렉션 매핑**
 * - `device_notifications` → {@link DeviceNotificationDoc} (실시간 디바이스 알림)
 * - `periodic_telemetry` → {@link PeriodicTelemetryDoc} (주기 텔레메트리)
 *
 * Postgres TypeORM과 별도 — Mongo는 AlarmDao, TelemetryDao, PipelineDao, DashboardDao에서 직접 접근.
 */

/** Mongo `device_notifications` 컬렉션 document */
export interface DeviceNotificationDoc {
  device_code: string;
  device_timestamp: number;
  alarm_code: string;
  severity?: string;
  message?: string;
  acknowledged?: boolean;
}

/** Mongo `periodic_telemetry` 컬렉션 document */
export interface PeriodicTelemetryDoc {
  device_code: string;
  device_timestamp: number;
  metric_values_kv?: Record<string, string | number>;
}

/** SSE/스트림용 텔레메트리 이벤트 envelope */
export interface TelemetryStreamEventDto {
  type: 'telemetry';
  device_code: string;
  metric_values_kv?: Record<string, string | number>;
  device_timestamp: number;
  seq: number;
}

/** SSE/스트림용 에러 envelope */
export interface TelemetryStreamErrorDto {
  type: 'error';
  message: string;
}
