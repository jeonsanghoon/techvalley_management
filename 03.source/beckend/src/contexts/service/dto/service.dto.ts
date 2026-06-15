import type {
  AlarmSeverity,
  ServiceabilityLevel,
  ServiceStage,
  SlaTier,
  UserRole,
  EngineerAvailability,
} from '../../../common/types/enums';

export interface ServiceTicketDto {
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

export interface EngineerDto {
  id: string;
  name: string;
  region: string;
  specialty: string[];
  status: EngineerAvailability;
  assignedTickets: number;
}

export interface AsRecordDto {
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

export interface SlaSnapshotDto {
  snapshot_at: string;
  fleet_size: number;
  uptime_pct: number | string;
  critical_open_count: number;
  metrics_json?: unknown;
}

export interface SlaDefinitionDto {
  tier_code: string;
  tier_name: string;
  response_minutes: number;
  resolve_minutes: number;
  uptime_target_pct: number | string;
  description?: string;
}

export interface UserAccountDto {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  region: string;
  active: boolean;
  mfaEnabled: boolean;
}
