import type { BatchMetaDto } from '../../../common/dto/batch-meta.dto';
import type { AlarmDto } from '../../alarm/dto/alarm.dto';
import type { EquipmentDto } from '../../device/dto/equipment.dto';
import type { ServiceTicketDto } from '../../service/dto/service.dto';

export interface DashboardKpisDto {
  totalFleet: number;
  online: number;
  onlinePct: number;
  alarm: number;
  maintenance: number;
  openTickets: number;
  slaAtRisk: number;
  avgYield: number;
  partsPending: number;
}

export interface DashboardFleetStatusChartDto {
  statuses: string[];
  counts: number[];
  totalFleet: number;
}

export interface DashboardTicketStageChartDto {
  stages: string[];
  counts: number[];
}

export interface DashboardChartsDto {
  fleetStatus: DashboardFleetStatusChartDto;
  ticketStages: DashboardTicketStageChartDto;
}

export interface DashboardSummaryDataDto {
  region: string;
  kpis: DashboardKpisDto;
  recentAlarms: AlarmDto[];
  fleet: EquipmentDto[];
  openTickets: ServiceTicketDto[];
  mapAlarms: AlarmDto[];
  mapTickets: ServiceTicketDto[];
  charts: DashboardChartsDto;
}

export interface DashboardSummaryResponseDto extends DashboardSummaryDataDto {
  meta: BatchMetaDto;
}

export interface DashboardTrendsDataDto {
  categories: string[];
  critical: number[];
  warning: number[];
}
