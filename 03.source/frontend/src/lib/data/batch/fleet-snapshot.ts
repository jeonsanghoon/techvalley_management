import { equipments } from "@/lib/mock-data";
import { equipmentMatchesServiceRegion } from "@/lib/mock-data-regions";
import type { ServiceRegionId } from "@/lib/locale/settings";
import type { Equipment, EquipmentStatus } from "@/lib/types";
import { BATCH_SOURCES, type DataSourceMeta } from "../scope";

/** 배치 Job 완료 시각 — 플릿 상태·KPI 스냅샷 기준 */
export const BATCH_FLEET_AS_OF = "2026-06-06T14:00:00+09:00";

export const batchFleetMeta: DataSourceMeta = {
  scope: "batch",
  asOf: BATCH_FLEET_AS_OF,
  source: BATCH_SOURCES.fleetRollup,
  refreshInterval: "매시 정각 (fleet-hourly-rollup)",
};

/** 배치 스냅샷에 포함된 샘플 플릿 (UI 그리드·지도용) */
export interface BatchFleetItem extends Equipment {
  statusAsOf: string;
}

export const batchFleetSample: BatchFleetItem[] = equipments.map((eq) => ({
  ...eq,
  statusAsOf: BATCH_FLEET_AS_OF,
  lastTelemetryAt: BATCH_FLEET_AS_OF,
}));

export type BatchFleetTotals = {
  totalFleet: number;
  online: number;
  alarm: number;
  maintenance: number;
  offline: number;
  safe_mode: number;
};

/** 전체 플릿 집계 (배치 롤업 테이블 — 샘플 외 장비 포함) */
export const batchFleetTotals: BatchFleetTotals = {
  totalFleet: 156,
  online: 148,
  alarm: 3,
  maintenance: 2,
  offline: 2,
  safe_mode: 1,
};

const REGION_FLEET_TOTALS: Partial<Record<ServiceRegionId, BatchFleetTotals>> = {
  korea: batchFleetTotals,
  "east-asia": {
    totalFleet: 48,
    online: 40,
    alarm: 3,
    maintenance: 3,
    offline: 1,
    safe_mode: 1,
  },
  europe: {
    totalFleet: 42,
    online: 35,
    alarm: 2,
    maintenance: 3,
    offline: 1,
    safe_mode: 1,
  },
  mexico: {
    totalFleet: 36,
    online: 30,
    alarm: 2,
    maintenance: 2,
    offline: 1,
    safe_mode: 1,
  },
  global: {
    totalFleet: 294,
    online: 268,
    alarm: 12,
    maintenance: 13,
    offline: 6,
    safe_mode: 5,
  },
};

export const batchFleetStatusCounts: Record<EquipmentStatus, number> = {
  online: 142,
  alarm: 3,
  maintenance: 5,
  offline: 4,
  safe_mode: 2,
};

export function batchFleetForRegion(serviceRegion: ServiceRegionId): BatchFleetItem[] {
  return batchFleetSample.filter((eq) => equipmentMatchesServiceRegion(eq, serviceRegion));
}

export function batchFleetTotalsForRegion(serviceRegion: ServiceRegionId): BatchFleetTotals {
  return REGION_FLEET_TOTALS[serviceRegion] ?? batchFleetTotals;
}

/** 샘플 플릿 기준 상태별 집계 (지역 차트용) */
export function batchFleetStatusCountsFromSample(
  sample: BatchFleetItem[],
): Record<EquipmentStatus, number> {
  const counts: Record<EquipmentStatus, number> = {
    online: 0,
    alarm: 0,
    maintenance: 0,
    offline: 0,
    safe_mode: 0,
  };
  for (const eq of sample) {
    counts[eq.status] += 1;
  }
  return counts;
}

export function batchFleetStatusCountsForRegion(
  serviceRegion: ServiceRegionId,
): Record<EquipmentStatus, number> {
  const sample = batchFleetForRegion(serviceRegion);
  if (sample.length === 0) {
    const totals = batchFleetTotalsForRegion(serviceRegion);
    return {
      online: totals.online,
      alarm: totals.alarm,
      maintenance: totals.maintenance,
      offline: totals.offline,
      safe_mode: totals.safe_mode,
    };
  }
  return batchFleetStatusCountsFromSample(sample);
}
