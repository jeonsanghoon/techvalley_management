import { equipments } from "@/lib/mock-data";
import type { Equipment } from "@/lib/types";
import { REALTIME_SOURCES, type DataSourceMeta } from "../scope";

const REALTIME_AS_OF = "2026-06-06T14:26:00+09:00";

export const realtimeFleetMeta: DataSourceMeta = {
  scope: "realtime",
  asOf: REALTIME_AS_OF,
  source: REALTIME_SOURCES.fleetLive,
  refreshInterval: "DocumentDB Hot Tier / Shadow 동기화",
};

/** 원격제어·실시간 관제용 — Hot Tier 최신 상태 (배치 스냅샷과 분리) */
export const realtimeFleetItems: Equipment[] = equipments.map((eq) => ({
  ...eq,
  lastTelemetryAt: eq.id === equipments[0]?.id ? REALTIME_AS_OF : eq.lastTelemetryAt,
}));
