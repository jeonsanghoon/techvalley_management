import { BATCH_SOURCES, type DataSourceMeta } from "../scope";
import { BATCH_FLEET_AS_OF, batchFleetTotals } from "./fleet-snapshot";

export const batchCollectionMeta: DataSourceMeta = {
  scope: "batch",
  asOf: BATCH_FLEET_AS_OF,
  source: BATCH_SOURCES.collectionRollup,
  refreshInterval: "매시 정각 (collection-hourly-stats)",
};

/** 배치 집계 — 등록·온라인·일일 정규화 건수 */
export const batchCollectionStats = {
  totalDevices: batchFleetTotals.totalFleet,
  onlineDevices: batchFleetTotals.online,
  lastSyncAt: BATCH_FLEET_AS_OF,
  normalizedToday: 1_210_000,
  greengrassComponents: 312,
};
