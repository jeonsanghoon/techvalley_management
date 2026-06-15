/**
 * @file postgres-rows.ts
 * @description Postgres raw SQL / TypeORM 조회 결과 row 타입 정의.
 *
 * **사용 계층**: DAO → Service (mapper 입력) 전용. API 응답 DTO와 분리한다.
 *
 * **타입 설계 원칙**
 * - JOIN 쿼리 결과는 flat row (예: `DeviceFleetRow`에 site_name, company_name 포함)
 * - BIGINT snowflake PK는 DB/TypeORM에서 `string`으로 다루지만, legacy row 타입은 `number` 유지 가능
 * - `portal_meta`는 JSONB — 파싱 전 `string | PortalMetaJson | null` 허용
 * - NUMERIC 컬럼은 `number | string` 허용 (pg 드라이버·TypeORM 반환 차이)
 *
 * @see 02.arch/config/schema/postgres/ — DDL SSOT
 */

/** device.portal_meta / service_ticket.portal_meta JSONB 구조 (UI·포털 확장 필드) */
export interface PortalMetaJson {
  status?: string;
  model?: string;
  region?: string;
  geoZone?: string;
  slaTier?: string;
  serviceability?: string;
  lat?: number;
  lng?: number;
  tubeLifePct?: number;
  detectorLifePct?: number;
  installDate?: string;
  alarmId?: string;
  customer?: string;
  site?: string;
  severity?: string;
  stage?: string;
  engineerId?: string;
  engineerName?: string;
  plannedDispatchAt?: string;
  actualDispatchAt?: string;
  plannedCompleteAt?: string;
  slaDeadline?: string;
  slaBreached?: boolean;
}

// ─── Device / Fleet ─────────────────────────────────────────────────────────

/** device + site + company + product JOIN 결과 (device.dao DEVICE_JOIN_SQL) */
export interface DeviceFleetRow {
  id: number;
  device_code: string;
  serial?: string;
  operational_status_type: number;
  firmware_version?: string;
  last_seen_at?: Date | string;
  portal_meta?: PortalMetaJson | string | null;
  site_name: string;
  site_code: string;
  address?: string;
  region_label?: string;
  geo_zone?: string;
  company_name: string;
  company_code: string;
  contract_tier?: string;
  product_name: string;
}

/** 장비 목록 간략 조회 (관리 화면용 projection) */
export interface DeviceRawRow {
  id: number;
  device_code: string;
  serial?: string;
  operational_status_type: number;
  site_code: string;
  site_name: string;
  company_name: string;
  product_name: string;
}

// ─── Alarm ──────────────────────────────────────────────────────────────────

/** communication_alarm_incident 테이블 projection */
export interface PgAlarmIncidentRow {
  id: number;
  alert_code: string;
  device_code: string;
  severity_type: number;
  incident_status: string;
  opened_at: string;
  message?: string;
}

// ─── Service Desk ───────────────────────────────────────────────────────────

/** service_ticket + site + company JOIN */
export interface ServiceTicketRow {
  id: number;
  ticket_no?: string;
  device_code: string;
  title?: string;
  description?: string;
  priority_type?: number;
  ticket_status: string;
  opened_at: string;
  portal_meta?: PortalMetaJson | string | null;
  site_name?: string;
  company_name?: string;
}

/** engineer_profile + assigned ticket COUNT 서브쿼리 */
export interface EngineerProfileRow {
  id: number;
  user_id: number;
  display_name: string;
  region_label: string;
  specialty?: string[] | unknown;
  availability_status?: string;
  assigned?: number;
}

// ─── Organization ───────────────────────────────────────────────────────────

/** company + site_count / device_count 서브쿼리 */
export interface CompanyRow {
  id: number;
  code: string;
  company_name: string;
  company_type?: string;
  region_label?: string;
  contract_tier?: string;
  created_at?: Date;
  site_count?: number;
  device_count?: number;
}

/** site + company JOIN + device_count 서브쿼리 */
export interface SiteRow {
  id: number;
  code: string;
  company_id: number;
  site_name: string;
  address?: string;
  region_label?: string;
  created_at?: Date;
  company_name: string;
  company_code: string;
  device_count?: number;
}

// ─── Parts / Installation ───────────────────────────────────────────────────

export interface PartsOrderRow {
  id: number;
  order_no?: string;
  ticket_no?: string;
  device_code?: string;
  part_type_code: string;
  quantity: number;
  order_status: string;
  ordered_at: string;
}

/** parts_schedule + device/site/company/order JOIN */
export interface PartsScheduleRow {
  id: number;
  device_code: string;
  part_type_code: string;
  scheduled_at: string;
  schedule_status?: string;
  site_name?: string;
  company_name?: string;
  order_no?: string;
}

/** installation + device/site/company/product JOIN */
export interface InstallationRow {
  id: number;
  device_code: string;
  installer_note?: string;
  installed_at: string;
  site_name: string;
  company_name: string;
  product_name: string;
  portal_meta?: PortalMetaJson | string | null;
  status?: string | null;
}

/** as_record + company JOIN */
export interface AsRecordRow {
  id: number;
  ticket_no?: string;
  device_code: string;
  performed_at: string;
  summary?: string;
  parts_used_json?: unknown;
  company_name?: string;
}

// ─── Identity / Admin ───────────────────────────────────────────────────────

export interface UserRow {
  id: number;
  code: string;
  user_name?: string;
  email?: string;
  auth_type?: number;
  account_status?: string;
  is_use?: boolean;
}

export interface CommonCodeRow {
  main_code: string;
  sub_code: number;
  code_name: string;
  ref_data1?: string;
  order_seq?: number;
  is_use?: boolean;
}

// ─── Settings / Catalog ─────────────────────────────────────────────────────

export interface NotificationChannelRow {
  channel_code: string;
  channel_name: string;
  channel_type: string;
  target: string;
  severity_filter?: string[];
  recipients: string;
  enabled: boolean;
  description?: string;
}

export interface IotThingRegistryRow {
  id: number;
  device_code: string;
  thing_name: string;
  certificate_id: string;
  policy_name: string;
  connection_status?: string;
  last_seen_at?: string;
}

// ─── Inspection / Reports / Remote ──────────────────────────────────────────

export interface YieldInspectionRow {
  id: number;
  device_code: string;
  lot_no: string;
  serial_no: string;
  yield_pct: number | string;
  inspected_at: string;
  algorithm_version: string;
}

export interface AlgorithmConfigRow {
  config_code: string;
  config_name: string;
  version_label: string;
  threshold: number | string;
  status: string;
  applied_device_count: number;
}

export interface ReportDefinitionRow {
  report_code: string;
  report_name: string;
  category: string;
  last_generated_at?: Date;
  record_count: number | string;
}

export interface RemoteDiagnosisRow {
  id: number;
  device_code: string;
  finding_code: string;
  severity: string;
  title: string;
  detail: string;
  suggested_action?: string;
  detected_at: string;
}

// ─── Equipment Log ──────────────────────────────────────────────────────────

/** equipment_log_* 공통 컬럼 (테이블별 optional 컬럼 포함) */
export interface EquipmentLogRow {
  id: number;
  device_code: string;
  request_code?: string;
  audit_type?: string;
  payload_json?: unknown;
  event_at: string;
}

// ─── SLA / Dashboard / Pipeline ─────────────────────────────────────────────

export interface SlaSnapshotRow {
  snapshot_at: string;
  fleet_size: number;
  uptime_pct: number | string;
  critical_open_count: number;
  metrics_json?: unknown;
}

export interface SlaDefinitionRow {
  tier_code: string;
  tier_name: string;
  response_minutes: number;
  resolve_minutes: number;
  uptime_target_pct: number | string;
  description?: string;
}

export interface DashboardAlarmDailyRow {
  stat_date: Date | string;
  critical_count: number;
  warning_count: number;
}

export interface CollectionDailyStatsRow {
  stat_date: Date | string;
  [key: string]: unknown;
}

// ─── 집계·유틸 row ────────────────────────────────────────────────────────────

/** COUNT(*)::int AS c 패턴 */
export interface CountRow {
  c: number;
}

/** AVG(...) AS avg 패턴 */
export interface AvgRow {
  avg: number | string | null;
}

export interface FirmwareVersionRow {
  firmware_version: string;
}
