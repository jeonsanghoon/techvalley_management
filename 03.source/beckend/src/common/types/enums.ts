/**
 * @file enums.ts
 * @description 프론트엔드 `types.ts`와 공유하는 도메인 enum/union 타입.
 *              DB 코드값 → 한글 라벨 변환은 {@link ../mappers.ts}에서 수행.
 */

/** device.operational_status_type 및 UI 표시 상태 */
export type EquipmentStatus = 'online' | 'offline' | 'alarm' | 'maintenance' | 'safe_mode';
export type AlarmSeverity = 'warning' | 'critical';
export type SlaTier = 'Critical' | 'High' | 'Standard';
export type ServiceabilityLevel =
  | '즉시 원격가능'
  | '당일 방문'
  | '익일 방문'
  | '부품 대기';
/** service_ticket stage — TKST common_code ref_data1 값 ('open'|'assigned'|'dispatched'|'in_progress'|'closed') */
export type ServiceStage = string;
export type RemoteResult = 'resolved' | 'unresolved' | 'pending';
/** parts order status — PRST common_code ref_data1 값 */
export type PartOrderStatus = string;
/** user.auth_type → 역할 라벨 (mappers mapUser) */
export type UserRole = '시스템 관리자' | '서비스 엔지니어' | '상담·CS' | '고객사·대리점';
export type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
/** equipment_log 카테고리 — equipment-log.dao LOG_TABLES 키와 대응 */
export type LogCategory =
  | '튜브'
  | '디텍터'
  | '본체'
  | '알람'
  | '원격제어'
  | '펌웨어'
  | '주기'
  | '이벤트'
  | '감사';
export type MetricKind = '주기' | '이벤트' | '펌웨어' | '제어';
export type GeoZone =
  | 'korea'
  | 'east-asia'
  | 'europe'
  | 'mexico'
  | 'north-america'
  | 'middle-east'
  | 'global';
export type AlarmRuleTarget = 'tube' | 'detector' | 'body' | 'composite';
export type NotificationChannelType = 'SNS' | 'SES' | 'Dashboard' | 'Webhook';
/** engineer_profile.availability_status */
export type EngineerAvailability = '출동가능' | '작업중' | '휴무';
/** iot_thing_registry.connection_status → UI 상태 */
export type IotConnectionStatus = 'connected' | 'disconnected' | 'pending';
/** firmware 자동 업데이트 모드 */
export type FirmwareAutoMode = 'ON' | 'OFF';
/** algorithm_config.status */
export type AlgorithmStatus = 'active' | 'staging' | 'disabled';
/** installation 진행 상태 — INST common_code ref_data1 값 */
export type InstallationStatus = string;
