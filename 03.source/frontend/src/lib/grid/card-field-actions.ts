import type { ColDef } from "ag-grid-community";
import { colDefKey } from "@/lib/grid/viewport-columns";

export const CARD_ACTION_COL_IDS = new Set(["remoteActions", "relatedLogs"]);

export function isCardActionColumn(col: ColDef): boolean {
  const key = colDefKey(col);
  return CARD_ACTION_COL_IDS.has(key) || col.pinned === "right";
}
