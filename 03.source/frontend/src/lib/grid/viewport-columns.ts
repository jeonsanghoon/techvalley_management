import type { ColDef } from "ag-grid-community";
import type { GridViewport } from "@/hooks/useViewport";
import type { GridColumnSet } from "@/lib/grid/types";

export function colDefKey(col: ColDef): string {
  return col.field ?? col.colId ?? "";
}

type ViewportFieldConfig = { minimal: readonly string[]; compact: readonly string[] };

const VIEWPORT_FIELDS: Partial<Record<GridColumnSet, ViewportFieldConfig>> = {
  equipment: {
    minimal: ["serialNo", "model", "status", "remoteActions"],
    compact: ["serialNo", "model", "status", "remoteActions"],
  },
  alarm: {
    minimal: ["id", "severity"],
    compact: ["id", "equipmentSn", "severity", "message"],
  },
  alarmRule: {
    minimal: ["name", "severity"],
    compact: ["name", "target", "severity", "enabled"],
  },
  serviceTicket: {
    minimal: ["id", "stage"],
    compact: ["id", "equipmentSn", "severity", "stage"],
  },
  partOrder: {
    minimal: ["id", "status"],
    compact: ["id", "equipmentSn", "partName", "status"],
  },
  partSchedule: {
    minimal: ["orderId", "podStatus"],
    compact: ["orderId", "equipmentSn", "partName", "podStatus"],
  },
  installation: {
    minimal: ["equipmentSn", "model", "status"],
    compact: ["equipmentSn", "customer", "site", "status"],
  },
  asRecord: {
    minimal: ["id", "completedAt"],
    compact: ["id", "equipmentSn", "workSummary", "completedAt"],
  },
  customer: {
    minimal: ["name", "type"],
    compact: ["name", "type", "region", "equipmentCount"],
  },
  site: {
    minimal: ["name", "region"],
    compact: ["customerName", "name", "region", "equipmentCount"],
  },
  pipeline: {
    minimal: ["tier", "status"],
    compact: ["tier", "store", "recordCount", "status"],
  },
  yield: {
    minimal: ["lotNo", "yieldPct"],
    compact: ["lotNo", "serialNo", "yieldPct", "inspectedAt"],
  },
  report: {
    minimal: ["name", "category"],
    compact: ["name", "category", "recordCount", "lastGenerated"],
  },
  user: {
    minimal: ["name", "role"],
    compact: ["name", "email", "role", "active"],
  },
  menuPerm: {
    minimal: ["menuName", "menuId"],
    compact: ["groupLabel", "menuName", "dataScope", "admin"],
  },
  menuActionPerm: {
    minimal: ["menuName", "actionLabel"],
    compact: ["menuName", "actionLabel", "admin", "engineer"],
  },
  telemetry: {
    minimal: ["serialNo", "status"],
    compact: ["serialNo", "yieldPct", "status", "receivedAt"],
  },
  collection: {
    minimal: ["serialNo", "model", "status"],
    compact: ["serialNo", "model", "status", "lastTelemetryAt"],
  },
  consumable: {
    minimal: ["serialNo", "model", "tubeLifePct"],
    compact: ["serialNo", "model", "tubeLifePct", "detectorLifePct"],
  },
  slaEquipment: {
    minimal: ["serialNo", "slaTier"],
    compact: ["serialNo", "customer", "slaTier", "serviceability"],
  },
  iotThing: {
    minimal: ["sn", "status"],
    compact: ["sn", "thing", "status", "lastSeenAt"],
  },
  code: {
    minimal: ["group", "code"],
    compact: ["group", "code", "name", "sort"],
  },
  algorithm: {
    minimal: ["name", "status"],
    compact: ["name", "version", "threshold", "status"],
  },
  firmware: {
    minimal: ["serialNo", "model", "target"],
    compact: ["serialNo", "current", "target", "lastCheckAt"],
  },
  equipmentLog: {
    minimal: ["occurredAt", "level"],
    compact: ["occurredAt", "category", "level", "message"],
  },
  equipmentLogCategory: {
    minimal: ["occurredAt", "level"],
    compact: ["occurredAt", "level", "source", "message"],
  },
  metricLog: {
    minimal: ["receivedAt", "kind"],
    compact: ["receivedAt", "serialNo", "metric", "value"],
  },
  metricLogPeriodic: {
    minimal: ["receivedAt", "serialNo"],
    compact: ["receivedAt", "serialNo", "metric", "value"],
  },
  metricLogEvent: {
    minimal: ["receivedAt", "serialNo"],
    compact: ["receivedAt", "serialNo", "metric", "value"],
  },
  metricLogFirmware: {
    minimal: ["receivedAt", "serialNo"],
    compact: ["receivedAt", "serialNo", "metric", "value"],
  },
  metricLogControl: {
    minimal: ["receivedAt", "serialNo"],
    compact: ["receivedAt", "serialNo", "metric", "value"],
  },
  notificationChannel: {
    minimal: ["name", "type"],
    compact: ["name", "type", "target", "enabled"],
  },
};

function buildFallbackFields(defs: ColDef[], viewport: GridViewport): Set<string> {
  const keys = defs.map(colDefKey).filter(Boolean);
  const pinnedRight = defs.filter((d) => d.pinned === "right").map(colDefKey);
  const pinnedLeft = defs.filter((d) => d.pinned === "left").map(colDefKey);

  if (viewport === "full") return new Set(keys);

  if (viewport === "minimal") {
    const statusLike = keys.filter((k) =>
      /status|severity|stage|level|kind|enabled|active|podStatus/i.test(k),
    );
    return new Set([
      ...pinnedLeft.slice(0, 1),
      ...statusLike.slice(0, 1),
      ...pinnedRight,
    ]);
  }

  const head = keys.slice(0, 4);
  return new Set([...head, ...pinnedRight.filter((k) => !head.includes(k))]);
}

export function filterColumnsByViewport(
  defs: ColDef[],
  set: GridColumnSet,
  viewport: GridViewport,
): ColDef[] {
  if (viewport === "full") return defs;

  const config = VIEWPORT_FIELDS[set];
  const allowed = new Set(
    config
      ? viewport === "minimal"
        ? config.minimal
        : config.compact
      : buildFallbackFields(defs, viewport),
  );

  return defs.filter((col) => allowed.has(colDefKey(col)));
}

export function splitCardColumns(
  allDefs: ColDef[],
  summaryDefs: ColDef[],
): { summary: ColDef[]; detail: ColDef[] } {
  const summaryKeys = new Set(summaryDefs.map(colDefKey));
  return {
    summary: summaryDefs,
    detail: allDefs.filter((col) => !summaryKeys.has(colDefKey(col))),
  };
}
