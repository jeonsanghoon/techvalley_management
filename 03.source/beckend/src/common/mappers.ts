/**
 * @file mappers.ts
 * @description Postgres row / Mongo doc / YAML → API DTO 변환 (SSOT 매핑 계층).
 *
 * **역할**
 * - DAO가 반환한 DB row를 프론트엔드 친화적 DTO로 변환
 * - enum·상태 코드 → 한글 라벨 매핑 (예: ticket_status → ServiceStage)
 * - `batchMeta` + `wrapData` re-export — API envelope `{ data, meta }` 생성
 *
 * **사용 흐름**: Controller → Service → DAO(row) → mapper → DTO → wrapData
 */
import type { AlarmDto, AlarmRuleDto } from '../contexts/alarm/dto/alarm.dto';
import type { CommonCodeDto } from '../contexts/admin/dto/admin.dto';
import type { FirmwareConfigDto, IotThingDto } from '../contexts/catalog/dto/catalog.dto';
import type { EquipmentDto, DeviceRawItemDto } from '../contexts/device/dto/equipment.dto';
import type { EquipmentLogEntryDto } from '../contexts/equipment-log/dto/equipment-log.dto';
import type { InstallationDto } from '../contexts/installation/dto/installation.dto';
import type { AlgorithmConfigDto, YieldRecordDto } from '../contexts/inspection/dto/inspection.dto';
import type { CustomerDto, SiteDto } from '../contexts/organization/dto/organization.dto';
import type { PartOrderDto, PartScheduleDto } from '../contexts/parts/dto/parts.dto';
import type { RemoteDiagnosisDto } from '../contexts/remote/dto/remote.dto';
import type { ReportSummaryDto } from '../contexts/reports/dto/reports.dto';
import type {
  AsRecordDto,
  EngineerDto,
  ServiceTicketDto,
  UserAccountDto,
} from '../contexts/service/dto/service.dto';
import type { NotificationChannelDto } from '../contexts/settings/dto/settings.dto';
import type { MetricLogEntryDto } from '../contexts/telemetry/dto/telemetry.dto';
import { createBatchMeta as buildBatchMeta } from './dto/batch-meta.dto';
import type { BatchMetaDto } from './dto/batch-meta.dto';
import { wrapApiData as wrapEnvelope } from './dto/api-response.dto';
import type { ApiDataEnvelopeDto } from './dto/api-response.dto';
import type { DeviceNotificationDoc, PeriodicTelemetryDoc } from './types/db/mongo-docs';
import type {
  AlgorithmConfigRow,
  AsRecordRow,
  CommonCodeRow,
  CompanyRow,
  DeviceFleetRow,
  DeviceRawRow,
  EngineerProfileRow,
  EquipmentLogRow,
  InstallationRow,
  IotThingRegistryRow,
  NotificationChannelRow,
  PartsOrderRow,
  PartsScheduleRow,
  PgAlarmIncidentRow,
  PortalMetaJson,
  RemoteDiagnosisRow,
  ReportDefinitionRow,
  ServiceTicketRow,
  SiteRow,
  SlaDefinitionRow,
  SlaSnapshotRow,
  UserRow,
  YieldInspectionRow,
} from './types/db/postgres-rows';
import type { YamlRuleFile } from './types/db/yaml-rules';
import type {
  AlarmSeverity,
  EngineerAvailability,
  EquipmentStatus,
  GeoZone,
  IotConnectionStatus,
  InstallationStatus,
  PartOrderStatus,
  ServiceStage,
  SlaTier,
  ServiceabilityLevel,
  UserRole,
} from './types/enums';
import type { SlaDefinitionDto, SlaSnapshotDto } from '../contexts/service/dto/service.dto';

export { buildBatchMeta as batchMeta, wrapEnvelope as wrapData };
export type { BatchMetaDto, ApiDataEnvelopeDto };

/** service_ticket.ticket_status → ServiceStage code_value */
const STATUS_FROM_TICKET: Record<string, ServiceStage> = {
  open: 'open',
  assigned: 'assigned',
  dispatched: 'dispatched',
  in_progress: 'in_progress',
  closed: 'closed',
};

/** parts_order.order_status → PartOrderStatus code_value */
const PART_STATUS_MAP: Record<string, PartOrderStatus> = {
  requested: 'requested',
  confirmed: 'confirmed',
  shipped: 'shipped',
  in_transit: 'in_transit',
  delivered: 'delivered',
  completed: 'completed',
};

/** 레거시 한글 stage → 영문 code_value 마이그레이션 (portal_meta 이전 데이터 호환) */
const KO_STAGE_TO_CODE: Record<string, ServiceStage> = {
  '접수': 'open', '배정': 'assigned', '출동': 'dispatched', '작업': 'in_progress', '완료': 'closed',
};
/** 레거시 한글 part status → 영문 code_value (portal_meta 이전 데이터 호환) */
const KO_PART_TO_CODE: Record<string, PartOrderStatus> = {
  '요청': 'requested', '확정': 'confirmed', '출고': 'shipped', '운송중': 'in_transit', '도착': 'delivered', '교체완료': 'completed',
};
/** 레거시 한글 installation status → 영문 code_value */
const KO_INST_TO_CODE: Record<string, InstallationStatus> = {
  '예정': 'planned', '진행중': 'in_progress', '시운전': 'commissioning', '완료': 'done',
};

/** portal_meta JSONB 문자열 → 객체 파싱 (JOIN row 공통 유틸) */
export function parseMeta(row: { portal_meta?: PortalMetaJson | string | null }): PortalMetaJson {
  const raw = row?.portal_meta;
  if (!raw) return {};
  if (typeof raw === 'object') return raw;
  try {
    return JSON.parse(String(raw)) as PortalMetaJson;
  } catch {
    return {};
  }
}

// ─── Device / Equipment ─────────────────────────────────────────────────────

/** DeviceFleetRow → 프론트 Equipment DTO */
export function mapEquipment(row: DeviceFleetRow, index = 0): EquipmentDto {
  const m = parseMeta(row);
  const op: EquipmentStatus = row.operational_status_type === 1 ? 'online' : 'offline';
  return {
    id: `eq-${String(row.id ?? index + 1).padStart(3, '0')}`,
    serialNo: row.device_code,
    model: m.model ?? row.product_name ?? 'Techvalley X-Ray',
    customer: row.company_name ?? '',
    site: row.site_name ?? '',
    region: m.region ?? row.region_label ?? '경기',
    geoZone: (m.geoZone ?? row.geo_zone ?? 'korea') as GeoZone,
    status: (m.status as EquipmentStatus | undefined) ?? op,
    slaTier: (m.slaTier ?? row.contract_tier ?? 'Standard') as SlaTier,
    serviceability: (m.serviceability ?? '즉시 원격가능') as ServiceabilityLevel,
    lat: Number(m.lat ?? 37.2),
    lng: Number(m.lng ?? 127.0),
    tubeLifePct: Number(m.tubeLifePct ?? 70),
    detectorLifePct: Number(m.detectorLifePct ?? 80),
    lastTelemetryAt: String(row.last_seen_at ?? new Date().toISOString()),
    firmwareVersion: row.firmware_version ?? 'v3.0.0',
    installDate: m.installDate,
  };
}

export function mapDeviceRaw(row: DeviceRawRow): DeviceRawItemDto {
  return {
    id: row.id,
    device_code: row.device_code,
    serial: row.serial,
    operational_status_type: row.operational_status_type,
    site_code: row.site_code,
    site_name: row.site_name,
    company_name: row.company_name,
    product_name: row.product_name,
  };
}

// ─── Alarm (Mongo + PG + YAML) ────────────────────────────────────────────────

/** Mongo device_notifications → AlarmDto */
export function mapAlarmFromMongo(doc: DeviceNotificationDoc, index = 0): AlarmDto {
  const iso = new Date(Number(doc.device_timestamp)).toISOString();
  return {
    id: `mongo-${doc.device_code}-${doc.device_timestamp}-${index}`,
    equipmentId: `eq-${doc.device_code}`,
    equipmentSn: doc.device_code,
    ruleName: doc.alarm_code,
    severity: doc.severity === 'critical' ? 'critical' : 'warning',
    message: doc.message ?? doc.alarm_code,
    triggeredAt: iso,
    acknowledged: Boolean(doc.acknowledged),
    remoteAttempted: false,
    source: 'documentdb',
  };
}

export function mapAlarmFromPg(row: PgAlarmIncidentRow): AlarmDto {
  return {
    id: `pg-${row.id}`,
    equipmentId: `eq-${row.device_code}`,
    equipmentSn: row.device_code,
    ruleName: row.alert_code,
    severity: row.severity_type >= 3 ? 'critical' : 'warning',
    message: row.message ?? row.alert_code,
    triggeredAt: String(row.opened_at),
    acknowledged: row.incident_status !== 'open',
    remoteAttempted: false,
    source: 'postgres',
  };
}

export function mapAlarm(
  row: PgAlarmIncidentRow | DeviceNotificationDoc,
  prefix = 'alarm',
): AlarmDto {
  if ('alert_code' in row) {
    return mapAlarmFromPg(row);
  }
  const ts = row.device_timestamp;
  const iso = new Date(Number(ts)).toISOString();
  return {
    id: `${prefix}-${row.device_code}-${iso}`,
    equipmentId: `eq-${row.device_code}`,
    equipmentSn: row.device_code,
    ruleName: row.alarm_code,
    severity: row.severity === 'critical' ? 'critical' : 'warning',
    message: row.message ?? row.alarm_code,
    triggeredAt: iso,
    acknowledged: Boolean(row.acknowledged),
    remoteAttempted: false,
  };
}

export function mapYamlRulesToDto(rules: YamlRuleFile[]): AlarmRuleDto[] {
  const items: AlarmRuleDto[] = [];
  for (const rule of rules) {
    for (const alert of rule.alerts_raw ?? []) {
      items.push({
        id: `${rule.rule_code}:${alert.id}`,
        name: alert.id,
        target: 'composite',
        condition: `${alert.when?.path ?? ''} ${alert.when?.op ?? ''} ${alert.when?.value ?? ''}`.trim(),
        severity: (alert.severity === 'critical' ? 'critical' : 'warning') as AlarmSeverity,
        enabled: true,
        notifyChannels: ['Dashboard'],
        triggerRemote: false,
        triggerTicket: alert.severity === 'critical',
        ruleCode: rule.rule_code,
        source: 'yaml:02.arch/config/rules',
      });
    }
  }
  return items;
}

// ─── Service Desk / Organization / Parts ──────────────────────────────────────

export function mapServiceTicket(row: ServiceTicketRow): ServiceTicketDto {
  const m = parseMeta(row);
  return {
    id: row.ticket_no ?? String(row.id),
    alarmId: m.alarmId,
    equipmentSn: row.device_code,
    customer: m.customer ?? row.company_name ?? '',
    site: m.site ?? row.site_name ?? '',
    symptom: row.title ?? row.description ?? '',
    severity: (m.severity as AlarmSeverity | undefined) ?? (row.priority_type === 1 ? 'critical' : 'warning'),
    slaTier: (m.slaTier as SlaTier | undefined) ?? 'Standard',
    serviceability: (m.serviceability ?? '즉시 원격가능') as ServiceabilityLevel,
    createdAt: String(row.opened_at),
    stage: KO_STAGE_TO_CODE[m.stage ?? ''] ?? (m.stage as ServiceStage | undefined) ?? STATUS_FROM_TICKET[row.ticket_status] ?? 'open',
    engineerId: m.engineerId,
    engineerName: m.engineerName,
    plannedDispatchAt: m.plannedDispatchAt,
    actualDispatchAt: m.actualDispatchAt,
    plannedCompleteAt: m.plannedCompleteAt,
    slaDeadline: m.slaDeadline ?? String(row.opened_at),
    slaBreached: Boolean(m.slaBreached),
  };
}

export function mapCustomer(row: CompanyRow): CustomerDto {
  return {
    id: row.code ?? String(row.id),
    name: row.company_name,
    type: row.company_type ?? '고객사',
    region: row.region_label ?? '경기',
    siteCount: Number(row.site_count ?? 0),
    equipmentCount: Number(row.device_count ?? 0),
    contractTier: (row.contract_tier ?? 'Standard') as SlaTier,
    registeredAt: row.created_at instanceof Date ? row.created_at.toISOString().slice(0, 10) : '2024-01-01',
  };
}

export function mapSite(row: SiteRow): SiteDto {
  return {
    id: row.code ?? String(row.id),
    customerId: row.company_code ?? String(row.company_id),
    customerName: row.company_name ?? '',
    name: row.site_name,
    address: row.address ?? '',
    region: row.region_label ?? '경기',
    equipmentCount: Number(row.device_count ?? 0),
    installedAt: row.created_at instanceof Date ? row.created_at.toISOString().slice(0, 10) : '2024-01-01',
  };
}

export function mapPartOrder(row: PartsOrderRow): PartOrderDto {
  return {
    id: row.order_no ?? String(row.id),
    ticketId: row.ticket_no ?? '',
    equipmentSn: row.device_code ?? '',
    partNo: row.part_type_code,
    partName: row.part_type_code,
    qty: row.quantity,
    status: KO_PART_TO_CODE[row.order_status] ?? PART_STATUS_MAP[row.order_status] ?? (row.order_status as PartOrderStatus) ?? 'requested',
    requestedAt: String(row.ordered_at),
  };
}

export function mapPartSchedule(row: PartsScheduleRow): PartScheduleDto {
  return {
    id: String(row.id),
    orderId: row.order_no ?? '',
    ticketId: '',
    equipmentSn: row.device_code,
    customer: row.company_name ?? '',
    site: row.site_name ?? '',
    partName: row.part_type_code,
    eta: String(row.scheduled_at),
    delayDays: 0,
    podStatus: KO_PART_TO_CODE[row.schedule_status ?? ''] ?? PART_STATUS_MAP[row.schedule_status ?? ''] ?? 'requested',
  };
}

export function mapInstallation(row: InstallationRow): InstallationDto {
  const m = parseMeta(row);
  const installDate = row.installed_at ? new Date(String(row.installed_at)) : null;
  const now = new Date();
  const derivedStatus: InstallationStatus = installDate && installDate > now ? 'planned' : 'done';
  const rawStatus = row.status as string | undefined;
  return {
    id: String(row.id),
    orderRef: row.installer_note ?? `IO-${row.id}`,
    equipmentSn: row.device_code,
    model: m.model ?? row.product_name ?? '',
    customer: row.company_name ?? '',
    site: row.site_name ?? '',
    plannedInstallDate: String(row.installed_at),
    actualInstallDate: String(row.installed_at),
    iotRegistered: true,
    status: (KO_INST_TO_CODE[rawStatus ?? ''] ?? rawStatus as InstallationStatus | undefined) ?? derivedStatus,
  };
}

export function mapSlaDefinition(row: SlaDefinitionRow): SlaDefinitionDto {
  return {
    tier_code: row.tier_code,
    tier_name: row.tier_name,
    response_minutes: Number(row.response_minutes),
    resolve_minutes: Number(row.resolve_minutes),
    uptime_target_pct: Number(row.uptime_target_pct),
    description: row.description,
  };
}

export function mapSlaSnapshot(row: SlaSnapshotRow): SlaSnapshotDto {
  return {
    snapshot_at: String(row.snapshot_at),
    fleet_size: Number(row.fleet_size),
    uptime_pct: Number(row.uptime_pct),
    critical_open_count: Number(row.critical_open_count),
    metrics_json: row.metrics_json,
  };
}

export function mapAsRecord(row: AsRecordRow): AsRecordDto {
  const parts = Array.isArray(row.parts_used_json) ? (row.parts_used_json as string[]) : [];
  return {
    id: String(row.id),
    ticketId: row.ticket_no ?? '',
    equipmentSn: row.device_code,
    customer: row.company_name ?? '',
    completedAt: String(row.performed_at),
    workSummary: row.summary ?? '',
    replacedParts: parts,
    satisfaction: 5,
    recurrence: false,
    normalRestored: true,
  };
}

// ─── Identity / Admin / Catalog / Settings ────────────────────────────────────

export function mapUser(row: UserRow): UserAccountDto {
  const role: UserRole =
    row.auth_type === 10 ? '시스템 관리자' : row.auth_type === 9 ? '서비스 엔지니어' : '상담·CS';
  return {
    id: row.code ?? String(row.id),
    name: row.user_name ?? row.email ?? '',
    email: row.email ?? '',
    role,
    region: '경기',
    active: row.account_status === 'active',
    mfaEnabled: false,
  };
}

export function mapCommonCode(row: CommonCodeRow): CommonCodeDto {
  return {
    id: `${row.main_code}-${row.sub_code}`,
    group: row.main_code,
    code: (row.ref_data1 && row.ref_data1 !== '') ? row.ref_data1 : row.code_name,
    name: row.code_name,
    sort: row.order_seq ?? 0,
    active: row.is_use !== false,
  };
}

export function mapEngineer(row: EngineerProfileRow, assigned = 0): EngineerDto {
  return {
    id: `eng-${row.user_id ?? row.id}`,
    name: row.display_name,
    region: row.region_label,
    specialty: Array.isArray(row.specialty) ? row.specialty : [],
    status: (row.availability_status ?? '출동가능') as EngineerAvailability,
    assignedTickets: assigned,
  };
}

export function mapFirmwareConfig(row: DeviceFleetRow, targetVersion?: string): FirmwareConfigDto {
  const m = parseMeta(row);
  return {
    id: `fw-${row.id}`,
    serialNo: row.device_code,
    model: m.model ?? row.product_name ?? '',
    customer: row.company_name ?? '',
    current: row.firmware_version ?? 'v3.0.0',
    target: targetVersion ?? row.firmware_version ?? 'v3.0.0',
    auto: 'OFF',
    lastCheckAt: String(row.last_seen_at ?? new Date().toISOString()),
  };
}

export function mapIotThing(row: IotThingRegistryRow): IotThingDto {
  let status: IotConnectionStatus = 'pending';
  if (row.connection_status === 'connected') status = 'connected';
  else if (row.connection_status === 'disconnected') status = 'disconnected';
  return {
    id: String(row.id),
    sn: row.device_code,
    thing: row.thing_name,
    cert: row.certificate_id,
    policy: row.policy_name,
    status,
    lastSeenAt: String(row.last_seen_at ?? new Date().toISOString()),
  };
}

export function mapNotificationChannel(row: NotificationChannelRow): NotificationChannelDto {
  const sev = (row.severity_filter ?? ['warning', 'critical']) as AlarmSeverity[];
  return {
    id: row.channel_code,
    name: row.channel_name,
    type: row.channel_type,
    target: row.target,
    severityFilter: sev,
    recipients: row.recipients,
    enabled: row.enabled,
    description: row.description ?? '',
  };
}

// ─── Inspection / Reports / Remote / Logs / Telemetry ─────────────────────────

export function mapYieldRecord(row: YieldInspectionRow): YieldRecordDto {
  return {
    id: String(row.id),
    equipmentSn: row.device_code,
    lotNo: row.lot_no,
    serialNo: row.serial_no,
    yieldPct: Number(row.yield_pct),
    inspectedAt: String(row.inspected_at),
    algorithmVersion: row.algorithm_version,
  };
}

export function mapAlgorithm(row: AlgorithmConfigRow): AlgorithmConfigDto {
  return {
    id: row.config_code,
    name: row.config_name,
    version: row.version_label,
    threshold: Number(row.threshold),
    status: row.status,
    appliedEquipmentCount: row.applied_device_count,
  };
}

export function mapReport(row: ReportDefinitionRow): ReportSummaryDto {
  return {
    id: row.report_code,
    name: row.report_name,
    category: row.category,
    lastGenerated:
      row.last_generated_at instanceof Date
        ? row.last_generated_at.toISOString().slice(0, 10)
        : '',
    recordCount: Number(row.record_count),
  };
}

export function mapRemoteFinding(row: RemoteDiagnosisRow): RemoteDiagnosisDto {
  return {
    id: String(row.id),
    equipmentSn: row.device_code,
    code: row.finding_code,
    severity: row.severity,
    title: row.title,
    detail: row.detail,
    suggestedAction: row.suggested_action,
    detectedAt: String(row.detected_at),
  };
}

export function mapEquipmentLog(row: EquipmentLogRow, category: string): EquipmentLogEntryDto {
  return {
    id: String(row.id),
    equipmentId: `eq-${row.device_code}`,
    serialNo: row.device_code,
    category,
    source: 'postgres',
    level: 'INFO',
    message: row.request_code ?? row.audit_type ?? `${category} event`,
    payload: JSON.stringify(row.payload_json ?? {}),
    occurredAt: String(row.event_at),
  };
}

export function mapMetricFromTelemetry(doc: PeriodicTelemetryDoc): MetricLogEntryDto[] {
  const kv = doc.metric_values_kv ?? {};
  return Object.entries(kv)
    .slice(0, 20)
    .map(([metric, value], i) => ({
      id: `metric-${doc.device_code}-${doc.device_timestamp}-${i}`,
      equipmentId: `eq-${doc.device_code}`,
      serialNo: doc.device_code,
      kind: '주기' as const,
      metric,
      value: String(value),
      receivedAt: new Date(Number(doc.device_timestamp)).toISOString(),
      edgePublished: true,
    }));
}
