import { BATCH_SOURCES, type DataSourceMeta } from "../scope";
import {
  BATCH_FLEET_AS_OF,
  batchFleetForRegion,
  batchFleetMeta,
  batchFleetSample,
  batchFleetTotals,
  batchFleetTotalsForRegion,
} from "./fleet-snapshot";
import {
  batchAlarms,
  batchOpenTickets,
  batchServiceTickets,
} from "./operational-snapshot";
import type { ServiceRegionId } from "@/lib/locale/settings";

export const batchDashboardMeta: DataSourceMeta = {
  scope: "batch",
  asOf: BATCH_FLEET_AS_OF,
  source: BATCH_SOURCES.dashboardAggregate,
  refreshInterval: "매시 정각 (dashboard-hourly-rollup)",
};

export interface BatchDashboardKpis {
  totalFleet: number;
  online: number;
  alarm: number;
  maintenance: number;
  openTickets: number;
  slaAtRisk: number;
  avgYield: number;
  partsPending: number;
}

export const batchDashboardKpis: BatchDashboardKpis = {
  totalFleet: batchFleetTotals.totalFleet,
  online: batchFleetTotals.online,
  alarm: batchFleetTotals.alarm,
  maintenance: batchFleetTotals.maintenance,
  openTickets: batchOpenTickets.length,
  slaAtRisk: batchOpenTickets.filter((t) => t.severity === "critical" || t.slaBreached).length,
  avgYield: 94.2,
  partsPending: 3,
};

/** 배치 시점 기준 최근 알람 (대시보드 패널용) */
export const batchRecentAlarms = batchAlarms.slice(0, 8);

/** 일별 알람 집계 — alarm_daily_rollup */
export const batchAlarmTrendDaily = {
  meta: {
    scope: "batch" as const,
    asOf: BATCH_FLEET_AS_OF,
    source: BATCH_SOURCES.alarmTrend,
    refreshInterval: "매일 00:30 (alarm-daily-rollup)",
  },
  categories: ["06/01", "06/02", "06/03", "06/04", "06/05", "06/06"],
  critical: [2, 1, 3, 0, 2, 3],
  warning: [5, 4, 6, 3, 7, 5],
};

/** 티켓 단계 집계 — 서비스 DB 배치 스냅샷 */
export const batchTicketStageCounts = (() => {
  const stages = ["접수", "배정", "출동", "작업", "완료"] as const;
  return stages.map((stage) => ({
    stage,
    count: batchServiceTickets.filter((t) => t.stage === stage).length,
  }));
})();

export const batchDashboardSnapshot = {
  meta: batchDashboardMeta,
  fleetMeta: batchFleetMeta,
  kpis: batchDashboardKpis,
  fleetSample: batchFleetSample,
  fleetTotals: batchFleetTotals,
  recentAlarms: batchRecentAlarms,
  alarmTrend: batchAlarmTrendDaily,
  ticketStages: batchTicketStageCounts,
  openTickets: batchOpenTickets,
  avgYield: batchDashboardKpis.avgYield,
};

/** 헤더 서비스 지역에 맞춘 대시보드 스냅샷 */
export function batchDashboardForRegion(serviceRegion: ServiceRegionId) {
  const fleetSample = batchFleetForRegion(serviceRegion);
  const fleetTotals = batchFleetTotalsForRegion(serviceRegion);
  const equipmentIds = new Set(fleetSample.map((eq) => eq.id));
  const serialNos = new Set(fleetSample.map((eq) => eq.serialNo));

  const recentAlarms = batchRecentAlarms.filter((a) => equipmentIds.has(a.equipmentId));
  const openTickets = batchOpenTickets.filter((t) => serialNos.has(t.equipmentSn));

  const ticketStages = (() => {
    const stages = ["접수", "배정", "출동", "작업", "완료"] as const;
    return stages.map((stage) => ({
      stage,
      count: openTickets.filter((t) => t.stage === stage).length,
    }));
  })();

  const kpis: BatchDashboardKpis = {
    totalFleet: fleetTotals.totalFleet,
    online: fleetTotals.online,
    alarm: fleetTotals.alarm,
    maintenance: fleetTotals.maintenance,
    openTickets: openTickets.length,
    slaAtRisk: openTickets.filter((t) => t.severity === "critical" || t.slaBreached).length,
    avgYield:
      serviceRegion === "europe" ? 93.1 : serviceRegion === "mexico" ? 92.8 : batchDashboardKpis.avgYield,
    partsPending: serviceRegion === "europe" ? 1 : serviceRegion === "mexico" ? 2 : batchDashboardKpis.partsPending,
  };

  return {
    ...batchDashboardSnapshot,
    kpis,
    fleetSample,
    fleetTotals,
    recentAlarms,
    openTickets,
    ticketStages,
  };
}
