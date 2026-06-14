import {
  alarms,
  engineers,
  reports,
  serviceTickets,
  yieldRecords,
} from "@/lib/mock-data";
import type {
  Alarm,
  Engineer,
  FirmwareConfig,
  IotThingAuth,
  ReportSummary,
  ServiceTicket,
  YieldRecord,
} from "@/lib/types";
import { BATCH_SOURCES, type DataSourceMeta } from "../scope";
import { BATCH_FLEET_AS_OF, batchFleetSample } from "./fleet-snapshot";

export const batchOperationalMeta: DataSourceMeta = {
  scope: "batch",
  asOf: BATCH_FLEET_AS_OF,
  source: BATCH_SOURCES.dashboardAggregate,
  refreshInterval: "매시 정각 (operational-hourly-snapshot)",
};

function atOrBeforeBatch(timestamp: string): boolean {
  return timestamp <= BATCH_FLEET_AS_OF;
}

/** 배치 시점까지 발생한 알람 */
export const batchAlarms: Alarm[] = alarms
  .filter((a) => atOrBeforeBatch(a.triggeredAt))
  .sort((a, b) => b.triggeredAt.localeCompare(a.triggeredAt));

/** 배치 시점까지 생성된 티켓 */
export const batchServiceTickets: ServiceTicket[] = serviceTickets.filter((t) =>
  atOrBeforeBatch(t.createdAt),
);

export const batchOpenTickets: ServiceTicket[] = batchServiceTickets.filter((t) => t.stage !== "완료");

export const batchYieldRecords: YieldRecord[] = yieldRecords.filter((y) =>
  atOrBeforeBatch(y.inspectedAt),
);

/** 배치 시점 엔지니어 가용 스냅샷 */
export const batchEngineers: Engineer[] = engineers.map((eng) => ({
  ...eng,
  assignedTickets: batchOpenTickets.filter((t) => t.engineerId === eng.id).length,
}));

export const batchIotThings: IotThingAuth[] = batchFleetSample.slice(0, 10).map((eq) => ({
  id: `thing-${eq.id}`,
  sn: eq.serialNo,
  thing: `tv-${eq.serialNo.toLowerCase().replace(/-/g, "")}`,
  cert: `cert-${eq.id.slice(-6)}…`,
  policy: eq.slaTier === "Critical" ? "tv-critical-policy" : "tv-standard-policy",
  status:
    eq.status === "offline" ? "disconnected" : eq.status === "maintenance" ? "pending" : "connected",
  lastSeenAt: BATCH_FLEET_AS_OF,
}));

export const batchFirmwareConfigs: FirmwareConfig[] = batchFleetSample.slice(0, 12).map((eq, i) => ({
  id: `fw-${eq.id}`,
  serialNo: eq.serialNo,
  model: eq.model,
  customer: eq.customer,
  current: eq.firmwareVersion,
  target: i % 3 === 0 ? "v3.2.2" : eq.firmwareVersion,
  auto: i % 4 === 0 ? "ON" : "OFF",
  lastCheckAt: BATCH_FLEET_AS_OF,
}));

/** 배치 생성 완료 리포트 */
export const batchReports: ReportSummary[] = reports.filter(
  (r) => r.lastGenerated <= BATCH_FLEET_AS_OF.slice(0, 10),
);
