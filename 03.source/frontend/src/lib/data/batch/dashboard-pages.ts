/**
 * 배치 데이터만 사용해야 하는 관제·집계성 화면 (menu id)
 * 실시간 스트림·Hot Tier 화면은 제외
 */
export const BATCH_DASHBOARD_MENU_IDS = [
  "dashboard",
  "equipment-logs",
  "equipment",
  "alarms",
  "service-tickets",
  "service-progress",
  "sla",
  "inspection",
  "reports",
] as const;

export type BatchDashboardMenuId = (typeof BATCH_DASHBOARD_MENU_IDS)[number];
