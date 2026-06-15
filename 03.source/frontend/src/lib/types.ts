export type EquipmentStatus = "online" | "offline" | "alarm" | "maintenance" | "safe_mode";
export type AlarmSeverity = "warning" | "critical";
export type SlaTier = "Critical" | "High" | "Standard";
export type ServiceabilityLevel =
  | "즉시 원격가능"
  | "당일 방문"
  | "익일 방문"
  | "부품 대기";
/** TKST common_code ref_data1 값 (open|assigned|dispatched|in_progress|closed) */
export type ServiceStage = string;
export type RemoteResult = "resolved" | "unresolved" | "pending";
/** PRST common_code ref_data1 값 */
export type PartOrderStatus = string;
export type PipelineTier = "Hot" | "Warm" | "Cold";
export type UserRole =
  | "시스템 관리자"
  | "서비스 엔지니어"
  | "상담·CS"
  | "고객사·대리점";

export type MetricKind = "주기" | "이벤트" | "펌웨어" | "제어";

export type LogCategory =
  | "튜브"
  | "디텍터"
  | "본체"
  | "알람"
  | "원격제어"
  | "펌웨어"
  | "주기"
  | "이벤트"
  | "감사";

export type LogLevel = "INFO" | "WARN" | "ERROR" | "DEBUG";

export interface EquipmentLogEntry {
  id: string;
  equipmentId: string;
  serialNo: string;
  category: LogCategory;
  source: string;
  level: LogLevel;
  message: string;
  payload?: string;
  occurredAt: string;
  traceId?: string;
}

export interface MetricLogEntry {
  id: string;
  equipmentId: string;
  serialNo: string;
  kind: MetricKind;
  metric: string;
  value: string;
  unit?: string;
  previousValue?: string;
  receivedAt: string;
  edgePublished: boolean;
}

export interface Equipment {
  id: string;
  serialNo: string;
  model: string;
  customer: string;
  site: string;
  region: string;
  /** 서비스 지역 필터 — fleet 지도·배치 샘플 */
  geoZone?: "korea" | "east-asia" | "europe" | "mexico" | "north-america" | "middle-east" | "global";
  status: EquipmentStatus;
  slaTier: SlaTier;
  serviceability: ServiceabilityLevel;
  lat: number;
  lng: number;
  tubeLifePct: number;
  detectorLifePct: number;
  lastTelemetryAt: string;
  firmwareVersion: string;
  installDate?: string;
}

export interface TelemetrySnapshot {
  equipmentId: string;
  tubeKv: number;
  tubeMa: number;
  tubeSec: number;
  detectorTemp: number;
  bodyTemp: number;
  uptimeHours: number;
  yieldPct: number;
  receivedAt: string;
}

export interface Alarm {
  id: string;
  equipmentId: string;
  equipmentSn: string;
  ruleName: string;
  severity: AlarmSeverity;
  message: string;
  triggeredAt: string;
  acknowledged: boolean;
  remoteAttempted: boolean;
  remoteResult?: RemoteResult;
  ticketId?: string;
}

export interface AlarmRule {
  id: string;
  name: string;
  target: "tube" | "detector" | "body" | "composite";
  condition: string;
  severity: AlarmSeverity;
  enabled: boolean;
  notifyChannels: string[];
  triggerRemote: boolean;
  triggerTicket: boolean;
}

export type NotificationChannelType = "SNS" | "SES" | "Dashboard" | "Webhook";

export interface NotificationChannel {
  id: string;
  name: string;
  type: NotificationChannelType;
  target: string;
  severityFilter: AlarmSeverity[];
  recipients: string;
  enabled: boolean;
  description: string;
}

export interface ServiceTicket {
  id: string;
  alarmId?: string;
  equipmentSn: string;
  customer: string;
  site: string;
  symptom: string;
  severity: AlarmSeverity;
  slaTier: SlaTier;
  serviceability: ServiceabilityLevel;
  createdAt: string;
  stage: ServiceStage;
  engineerId?: string;
  engineerName?: string;
  plannedDispatchAt?: string;
  actualDispatchAt?: string;
  plannedCompleteAt?: string;
  slaDeadline: string;
  slaBreached: boolean;
}

export interface ServiceProgress {
  ticketId: string;
  stage: ServiceStage;
  plannedAt?: string;
  actualAt?: string;
  engineerId?: string;
  workResult?: string;
  replacedParts?: string[];
}

export interface PartOrder {
  id: string;
  ticketId: string;
  equipmentSn: string;
  partNo: string;
  partName: string;
  qty: number;
  status: PartOrderStatus;
  requestedAt: string;
  plannedShipDate?: string;
  actualShipDate?: string;
  plannedDeliveryDate?: string;
  actualDeliveryDate?: string;
  carrier?: string;
  trackingNo?: string;
}

export interface PartSchedule {
  id: string;
  orderId: string;
  ticketId: string;
  equipmentSn: string;
  customer: string;
  site: string;
  partName: string;
  eta: string;
  visitPlannedAt?: string;
  visitActualAt?: string;
  engineerName?: string;
  delayDays: number;
  podStatus: PartOrderStatus;
  carrier?: string;
  trackingNo?: string;
}

export interface CommonCode {
  id: string;
  group: string;
  code: string;
  name: string;
  sort: number;
  active: boolean;
}

export interface AlgorithmConfig {
  id: string;
  name: string;
  version: string;
  threshold: number;
  status: "active" | "staging" | "disabled";
  appliedEquipmentCount: number;
}

export interface FirmwareConfig {
  id: string;
  serialNo: string;
  model: string;
  customer: string;
  current: string;
  target: string;
  auto: "ON" | "OFF";
  lastCheckAt: string;
}

export interface IotThingAuth {
  id: string;
  sn: string;
  thing: string;
  cert: string;
  policy: string;
  status: "connected" | "disconnected" | "pending";
  lastSeenAt: string;
}

export interface Installation {
  id: string;
  orderRef: string;
  equipmentSn: string;
  model: string;
  customer: string;
  site: string;
  plannedInstallDate: string;
  actualInstallDate?: string;
  iotRegistered: boolean;
  /** INST common_code ref_data1 값 (planned|in_progress|commissioning|done) */
  status: string;
}

export interface AsRecord {
  id: string;
  ticketId: string;
  equipmentSn: string;
  customer: string;
  completedAt: string;
  workSummary: string;
  replacedParts: string[];
  satisfaction?: number;
  recurrence: boolean;
  normalRestored: boolean;
}

export interface Customer {
  id: string;
  name: string;
  type: "고객사" | "대리점";
  region: string;
  siteCount: number;
  equipmentCount: number;
  contractTier: SlaTier;
  /** 계약 등록일 (YYYY-MM-DD) */
  registeredAt: string;
}

export interface Site {
  id: string;
  customerId: string;
  customerName: string;
  name: string;
  address: string;
  region: string;
  equipmentCount: number;
  /** 현장 설치일 (YYYY-MM-DD) */
  installedAt: string;
}

export interface Engineer {
  id: string;
  name: string;
  region: string;
  specialty: string[];
  status: "출동가능" | "작업중" | "휴무";
  assignedTickets: number;
}

export interface PipelineStatus {
  tier: PipelineTier;
  store: string;
  retention: string;
  recordCount: number;
  lagMs: number;
  status: "healthy" | "warning" | "error";
}

export interface YieldRecord {
  id: string;
  equipmentSn: string;
  lotNo: string;
  serialNo: string;
  yieldPct: number;
  inspectedAt: string;
  algorithmVersion: string;
}

export interface ReportSummary {
  id: string;
  name: string;
  category: string;
  lastGenerated: string;
  recordCount: number;
}

export interface BatchDashboardKpis {
  totalFleet: number;
  online: number;
  onlinePct?: number;
  alarm: number;
  maintenance: number;
  openTickets: number;
  slaAtRisk: number;
  avgYield: number;
  partsPending: number;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  region: string;
  active: boolean;
  mfaEnabled: boolean;
}

import type { LocalizableText } from "@/lib/locale/types";

export interface MenuPermission {
  menuId: string;
  menuName: LocalizableText;
  /** 사이드바 그룹명 — navigation과 동기화 */
  groupLabel?: LocalizableText;
  href?: string;
  /** 서브 메뉴일 때 권한 상속 앵커 ID */
  parentMenuId?: string;
  /** 수집 서비스 라이프사이클 단계 (관제·모니터링 그룹) */
  lifecyclePhase?: string;
  lifecycleOrder?: number;
  dataScope?: string;
  storageTier?: string;
  admin: boolean;
  engineer: boolean;
  cs: boolean;
  customer: boolean;
}
