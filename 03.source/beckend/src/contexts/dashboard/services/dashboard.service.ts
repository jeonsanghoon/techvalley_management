/**
 * @file dashboard.service.ts
 * @description 대시보드 집계 도메인 비즈니스 로직.
 *              KPI·차트·플릿·알람·티켓 — 읽기 전용, region 필터·집계는 서버에서 수행.
 */
import { Injectable } from '@nestjs/common';
import {
  batchMeta,
  mapAlarmFromMongo,
  mapAlarmFromPg,
  mapEquipment,
  mapServiceTicket,
  wrapData,
} from '../../../common/mappers';
import type { ApiDataEnvelopeDto } from '../../../common/dto/api-response.dto';
import { DashboardDao } from '../dao/dashboard.dao';
import type {
  DashboardSummaryDataDto,
  DashboardTrendsDataDto,
} from '../dto/dashboard.dto';
import {
  buildFleetStatusChart,
  buildTicketStageChart,
  filterByFleetSerials,
  filterEquipmentByRegion,
  fleetStatusCounts,
} from '../utils/region-filter';

@Injectable()
export class DashboardService {
  constructor(private readonly dao: DashboardDao) {}

  /**
   * 대시보드 요약 — region 필터·KPI·차트·맵 컨텍스트 일괄 집계.
   * GET /api/dashboard/summary?region=korea
   */
  async getSummary(region = 'global'): Promise<ApiDataEnvelopeDto<DashboardSummaryDataDto>> {
    const fleetResult = await this.dao.findFleetDevices();
    const allFleet = fleetResult.rows.map((row, i) => mapEquipment(row, i));
    const fleet = filterEquipmentByRegion(allFleet, region);
    const statusCounts = fleetStatusCounts(fleet);

    const mongoAlarms = await this.dao.findRecentMongoAlarms(50);
    const pgAlarms = await this.dao.findRecentPgAlarms(50);
    const allAlarms = [
      ...mongoAlarms.map((a, i) => mapAlarmFromMongo(a, i)),
      ...pgAlarms.rows.map((a) => mapAlarmFromPg(a)),
    ]
      .sort((a, b) => b.triggeredAt.localeCompare(a.triggeredAt));

    const ticketsResult = await this.dao.findOpenTickets(100);
    const allOpenTickets = ticketsResult.rows.map(mapServiceTicket);

    const fleetAlarms = filterByFleetSerials(allAlarms, fleet);
    const openTickets = filterByFleetSerials(allOpenTickets, fleet);
    const recentAlarms = fleetAlarms.slice(0, 8);
    const mapAlarms = fleetAlarms.filter((a) => !a.acknowledged).slice(0, 50);
    const mapTickets = openTickets.slice(0, 50);

    const yieldAvg = await this.dao.avgYield();
    const partsPending = await this.dao.countPendingParts();

    const totalFleet = fleet.length;
    const online = statusCounts.online;
    const onlinePct = totalFleet > 0 ? Math.round((online / totalFleet) * 100) : 0;

    const data: DashboardSummaryDataDto = {
      region: region || 'global',
      kpis: {
        totalFleet,
        online,
        onlinePct,
        alarm: statusCounts.alarm,
        maintenance: statusCounts.maintenance,
        openTickets: openTickets.length,
        slaAtRisk: openTickets.filter((t) => t.severity === 'critical' || t.slaBreached).length,
        avgYield: yieldAvg.rows[0]?.avg != null ? Number(yieldAvg.rows[0].avg) : 0,
        partsPending: partsPending.rows[0]?.c ?? 0,
      },
      recentAlarms,
      fleet,
      openTickets,
      mapAlarms,
      mapTickets,
      charts: {
        fleetStatus: buildFleetStatusChart(fleet),
        ticketStages: buildTicketStageChart(openTickets),
      },
    };

    return wrapData(data, batchMeta('dashboard.summary'));
  }

  /**
   * 알람 일별 트렌드 (최근 30일).
   * GET /api/dashboard/trends
   */
  async getTrends(): Promise<ApiDataEnvelopeDto<DashboardTrendsDataDto>> {
    const { rows } = await this.dao.findAlarmDailyTrends(30);
    return wrapData(
      {
        categories: rows.map((r) =>
          new Date(r.stat_date).toISOString().slice(5, 10).replace('-', '/'),
        ),
        critical: rows.map((r) => r.critical_count),
        warning: rows.map((r) => r.warning_count),
      },
      batchMeta('postgres.dashboard_alarm_daily'),
    );
  }
}
