import type { ColDef } from "ag-grid-community";
import type { GridViewport } from "@/hooks/useViewport";
import { colDefKey } from "@/lib/grid/viewport-columns";
import {
  BoolCellRenderer,
  LifeBarCellRenderer,
  LiveDotCellRenderer,
  LogCategoryCellRenderer,
  LogLevelCellRenderer,
  MetricKindCellRenderer,
  MonoCellRenderer,
  ServiceabilityCellRenderer,
  SeverityCellRenderer,
  SlaBreachedCellRenderer,
  StatusCellRenderer,
  YieldCellRenderer,
} from "@/components/grid/cell-renderers";

export type CardFieldKind =
  | "primaryId"
  | "status"
  | "datetime"
  | "numeric"
  | "progress"
  | "bool"
  | "name"
  | "message"
  | "shortText";

const PRIMARY_ID_KEYS = new Set([
  "serialNo",
  "id",
  "sn",
  "equipmentSn",
  "orderId",
  "ticketId",
  "lotNo",
  "orderRef",
  "traceId",
  "code",
  "partNo",
  "trackingNo",
  "menuId",
  "thing",
  "metric",
]);

const DATETIME_KEYS = new Set([
  "occurredAt",
  "receivedAt",
  "triggeredAt",
  "createdAt",
  "completedAt",
  "inspectedAt",
  "lastTelemetryAt",
  "lastSeenAt",
  "lastCheckAt",
  "lastGenerated",
  "registeredAt",
  "installedAt",
  "requestedAt",
  "plannedInstallDate",
  "actualInstallDate",
  "plannedShipDate",
  "plannedDeliveryDate",
  "slaDeadline",
  "eta",
  "visitPlannedAt",
  "installDate",
]);

const NUMERIC_KEYS = new Set([
  "qty",
  "sort",
  "delayDays",
  "threshold",
  "tubeKv",
  "tubeMa",
  "tubeSec",
  "detectorTemp",
  "bodyTemp",
  "uptimeHours",
  "recordCount",
  "lagMs",
  "siteCount",
  "equipmentCount",
  "appliedEquipmentCount",
  "value",
  "previousValue",
]);

const STATUS_FIELD_KEYS = new Set([
  "status",
  "severity",
  "stage",
  "level",
  "kind",
  "podStatus",
  "serviceability",
  "edgePublished",
]);

const NAME_KEYS = new Set([
  "name",
  "model",
  "customer",
  "customerName",
  "site",
  "partName",
  "ruleName",
  "category",
  "type",
  "role",
  "region",
  "group",
  "groupLabel",
  "menuName",
  "actionLabel",
  "store",
  "tier",
  "engineerName",
  "version",
  "current",
  "target",
  "auto",
  "slaTier",
  "source",
  "carrier",
  "policy",
  "cert",
  "unit",
  "dataScope",
  "storageTier",
  "lifecyclePhase",
  "partsAvail",
  "engineerAvail",
  "remoteOk",
  "remoteResult",
  "satisfaction",
  "contractTier",
  "condition",
  "algorithmVersion",
]);

const MESSAGE_KEYS = new Set([
  "message",
  "symptom",
  "workSummary",
  "description",
  "payload",
  "address",
  "notifyChannels",
  "severityFilter",
  "recipients",
  "replacedParts",
]);

const STATUS_RENDERERS = new Set([
  StatusCellRenderer,
  SeverityCellRenderer,
  LogLevelCellRenderer,
  LogCategoryCellRenderer,
  MetricKindCellRenderer,
  ServiceabilityCellRenderer,
  SlaBreachedCellRenderer,
  LiveDotCellRenderer,
]);

const PROGRESS_RENDERERS = new Set([LifeBarCellRenderer, YieldCellRenderer]);

function isPrimaryIdColumn(col: ColDef, index: number): boolean {
  const key = colDefKey(col);
  if (col.cellRenderer === MonoCellRenderer) return true;
  if (col.pinned === "left" && index === 0) return true;
  if (PRIMARY_ID_KEYS.has(key)) return true;
  return key.endsWith("Id") || key.endsWith("No") || key.endsWith("Ref");
}

export function getCardFieldKind(col: ColDef, index: number): CardFieldKind {
  const key = colDefKey(col);
  const renderer = col.cellRenderer;

  if (PROGRESS_RENDERERS.has(renderer as typeof LifeBarCellRenderer) || key.endsWith("Pct") || key.endsWith("LifePct")) {
    return "progress";
  }
  if (renderer === BoolCellRenderer || key === "enabled" || key === "active" || key === "mfaEnabled") {
    return "bool";
  }
  if (STATUS_RENDERERS.has(renderer as typeof StatusCellRenderer) || STATUS_FIELD_KEYS.has(key)) {
    return "status";
  }
  if (isPrimaryIdColumn(col, index)) return "primaryId";
  if (DATETIME_KEYS.has(key) || /At$|Date$/.test(key)) return "datetime";
  if (NUMERIC_KEYS.has(key)) return "numeric";
  if (MESSAGE_KEYS.has(key) || col.flex != null) return "message";
  if (NAME_KEYS.has(key)) return "name";
  return "shortText";
}

const FIELD_WIDTH: Record<CardFieldKind, { minimal: number; compact: number }> = {
  primaryId: { minimal: 102, compact: 112 },
  status: { minimal: 56, compact: 64 },
  datetime: { minimal: 88, compact: 100 },
  numeric: { minimal: 52, compact: 64 },
  progress: { minimal: 92, compact: 108 },
  bool: { minimal: 44, compact: 52 },
  name: { minimal: 84, compact: 100 },
  message: { minimal: 108, compact: 148 },
  shortText: { minimal: 68, compact: 84 },
};

export type CardSummaryAlign = "start" | "center";

export function getCardSummaryAlign(col: ColDef, index: number): CardSummaryAlign {
  const kind = getCardFieldKind(col, index);
  return kind === "status" || kind === "bool" ? "center" : "start";
}

export function getCardSummaryGridTrack(col: ColDef, index: number, viewport: GridViewport): string {
  const kind = getCardFieldKind(col, index);
  const key = colDefKey(col);
  const sizeKey = viewport === "compact" ? "compact" : "minimal";
  const maxW = FIELD_WIDTH[kind][sizeKey];

  if (kind === "primaryId") return `minmax(0, ${maxW}px)`;
  if (key === "model") {
    const modelW = viewport === "compact" ? 96 : 88;
    return `minmax(0, ${modelW}px)`;
  }
  if (kind === "status" || kind === "bool") return `minmax(${maxW}px, auto)`;
  if (kind === "message") return "minmax(0, 1fr)";
  return `minmax(0, ${maxW}px)`;
}

export function getCardFieldSx(
  col: ColDef,
  index: number,
  viewport: GridViewport,
): Record<string, string | number> {
  const kind = getCardFieldKind(col, index);
  const sizeKey = viewport === "compact" ? "compact" : "minimal";
  const maxW = FIELD_WIDTH[kind][sizeKey];

  if (kind === "message") {
    return { flex: "1 1 0", minWidth: 0, maxWidth: maxW };
  }

  if (kind === "status" || kind === "bool") {
    return { flex: "0 0 auto", minWidth: 0, maxWidth: maxW };
  }

  if (kind === "progress") {
    return { flex: "0 0 auto", minWidth: 0, maxWidth: maxW, width: maxW };
  }

  if (colDefKey(col) === "model") {
    const modelW = viewport === "compact" ? 96 : 88;
    return { flex: "0 0 auto", minWidth: 0, maxWidth: modelW, width: modelW };
  }

  return { flex: "0 0 auto", minWidth: 0, maxWidth: maxW };
}

export function getCardFieldLabelWidth(viewport: GridViewport): string {
  return viewport === "compact" ? "32%" : "30%";
}
