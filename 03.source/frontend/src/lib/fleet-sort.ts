import type { Equipment, EquipmentStatus } from "./types";

/** 가동(online) → 알람 → 정비 → 안전모드 → 오프라인 순 */
const OPERATING_PRIORITY: Record<EquipmentStatus, number> = {
  online: 0,
  alarm: 1,
  maintenance: 2,
  safe_mode: 3,
  offline: 4,
};

export function compareEquipmentOperatingFirst(a: Equipment, b: Equipment): number {
  const priority = OPERATING_PRIORITY[a.status] - OPERATING_PRIORITY[b.status];
  if (priority !== 0) return priority;
  return a.serialNo.localeCompare(b.serialNo);
}
