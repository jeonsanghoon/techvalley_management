/** UI ↔ API · NestJS 컨텍스트 — 14-backend-frontend-design.md SSOT 미러 */

export type UiApiRow = {
  uiRoute: string;
  menuId: string;
  channel: "admin" | "service";
  dataScope: "batch" | "realtime" | "mixed" | "—";
  api: string;
  wbs?: string;
  note?: string;
};

export const NESTJS_CONTEXTS = [
  { id: "identity", desc: "Cognito JWT · users · RBAC · 조직 스코프 claim" },
  { id: "organization", desc: "company · branch · site" },
  { id: "catalog", desc: "product · firmware (S3 multipart)" },
  { id: "device", desc: "device 마스터 · device_phase · history" },
  { id: "device-group", desc: "플릿 그룹 · 일괄 OTA 대상" },
  { id: "fota", desc: "update_jobs · IoT Job/MQTT · DocDB fota_history" },
  { id: "pipeline", desc: "Tier snapshot · KDS lag · cadence (read-only)" },
  { id: "telemetry", desc: "Hot 조회 · metric-stream SSE" },
  { id: "alarm", desc: "알람 · ruleset mirror · EventBridge" },
  { id: "service", desc: "ticket · progress · SLA snapshot" },
  { id: "inspection", desc: "수율 · Iceberg proxy" },
  { id: "parts", desc: "부품 · AS" },
  { id: "admin", desc: "IoT cert · YAML deploy · system-config" },
  { id: "platform", desc: "DLQ mirror · health" },
];

export const JWT_CLAIMS = [
  { claim: "role", desc: "admin · engineer · cs · customer" },
  { claim: "companyId", desc: "company.id — customers 스코프" },
  { claim: "branchId", desc: "branch.id — 지점 KPI" },
  { claim: "siteId", desc: "site.id — 현장·installation" },
  { claim: "scope", desc: "API 세부 권한 (menu-catalog 1:1)" },
];

export const FOTA_API = [
  { method: "GET", path: "/api/products", desc: "제품 목록" },
  { method: "GET/POST", path: "/api/firmwares", desc: "펌웨어 버전 · S3 업로드" },
  { method: "POST", path: "/api/firmwares/upload", desc: "멀티파트 업로드 완료 webhook" },
  { method: "GET/POST", path: "/api/update-jobs", desc: "OTA Job 생성·목록" },
  { method: "GET", path: "/api/devices/:id/history", desc: "펌웨어 업데이트 이력" },
  { method: "POST", path: "/api/update-jobs/:id/simulate", desc: "E2E 시나리오 시뮬 (로컬)" },
];

export const UI_API_ROWS: UiApiRow[] = [
  { uiRoute: "/dashboard", menuId: "dashboard", channel: "service", dataScope: "batch", api: "GET /api/dashboard/summary", wbs: "A3" },
  { uiRoute: "/data-pipeline", menuId: "data-pipeline", channel: "service", dataScope: "mixed", api: "GET /api/pipeline/tiers, /pipeline/live", wbs: "A2" },
  { uiRoute: "/metric-stream", menuId: "metric-stream", channel: "service", dataScope: "realtime", api: "GET /api/metric-stream (SSE)", wbs: "A1/A2" },
  { uiRoute: "/equipment-logs", menuId: "equipment-logs", channel: "service", dataScope: "batch", api: "GET /api/equipment-logs?category=", wbs: "A2" },
  { uiRoute: "/alarms", menuId: "alarms", channel: "service", dataScope: "batch", api: "GET /api/alarms", wbs: "A4" },
  { uiRoute: "/alarm-rules", menuId: "alarm-rules", channel: "service", dataScope: "batch", api: "GET /api/alarm-rules", wbs: "A4" },
  { uiRoute: "/remote-diagnosis", menuId: "remote-diagnosis", channel: "service", dataScope: "mixed", api: "GET /api/remote/diagnostics", wbs: "A5" },
  { uiRoute: "/remote-control", menuId: "remote-control", channel: "service", dataScope: "realtime", api: "POST /api/remote/shadow, /remote/jobs", wbs: "A5" },
  { uiRoute: "/service-tickets", menuId: "service-tickets", channel: "service", dataScope: "batch", api: "CRUD /api/service/tickets", wbs: "A6" },
  { uiRoute: "/service-progress", menuId: "service-progress", channel: "service", dataScope: "batch", api: "GET /api/service/progress", wbs: "A7" },
  { uiRoute: "/sla", menuId: "sla", channel: "service", dataScope: "batch", api: "GET /api/sla/snapshots", wbs: "A6/A7" },
  { uiRoute: "/equipment", menuId: "equipment", channel: "service", dataScope: "batch", api: "GET /api/devices", wbs: "A9", note: "device_code = S/N" },
  { uiRoute: "/installation", menuId: "installation", channel: "service", dataScope: "batch", api: "GET /api/sites, /installation", wbs: "A9" },
  { uiRoute: "/customers", menuId: "customers", channel: "admin", dataScope: "batch", api: "CRUD /api/companies, /branches", wbs: "A9" },
  { uiRoute: "/parts-orders", menuId: "parts-orders", channel: "service", dataScope: "batch", api: "CRUD /api/parts/orders", wbs: "A10" },
  { uiRoute: "/parts-schedule", menuId: "parts-schedule", channel: "service", dataScope: "batch", api: "GET /api/parts/schedule", wbs: "A10" },
  { uiRoute: "/as", menuId: "as", channel: "service", dataScope: "batch", api: "CRUD /api/as", wbs: "A11" },
  { uiRoute: "/inspection", menuId: "inspection", channel: "service", dataScope: "batch", api: "GET /api/inspection/yield", wbs: "A8" },
  { uiRoute: "/reports", menuId: "reports", channel: "service", dataScope: "batch", api: "GET /api/reports/*", wbs: "M8" },
  { uiRoute: "/settings/notifications", menuId: "settings-notifications", channel: "service", dataScope: "batch", api: "GET/PUT /api/notifications/settings", wbs: "M6" },
  { uiRoute: "/settings/firmware", menuId: "settings-firmware", channel: "admin", dataScope: "batch", api: "CRUD /api/firmwares, POST /api/update-jobs", wbs: "A5/M6", note: "OTA Job → IoT Jobs" },
  { uiRoute: "/admin/users", menuId: "admin-users", channel: "admin", dataScope: "—", api: "CRUD /api/admin/users", wbs: "A12" },
  { uiRoute: "/admin/codes", menuId: "admin-codes", channel: "admin", dataScope: "—", api: "CRUD /api/common-codes", wbs: "M10" },
  { uiRoute: "/admin/menus", menuId: "admin-menus", channel: "admin", dataScope: "—", api: "GET/PUT /api/admin/menus", wbs: "A12" },
  { uiRoute: "/admin/iot-auth", menuId: "admin-iot-auth", channel: "admin", dataScope: "—", api: "CRUD /api/admin/iot/*", wbs: "A12" },
];

export const ORG_QUERY_PARAMS = ["companyId", "branchId", "siteId", "productId", "devicePhaseSubCode"];

export const FRONTEND_STACK = [
  { item: "프레임워크", value: "Next.js 16.2 App Router · React 19" },
  { item: "UI", value: "MUI 9 + AG Grid Enterprise 35 + Tailwind 4" },
  { item: "상태", value: "TanStack Query 5 · react-hook-form · zod" },
  { item: "i18n", value: "ko/en · KST (locale/)" },
  { item: "배포", value: "Vercel (03.source/frontend)" },
  { item: "API URL", value: "NEXT_PUBLIC_API_URL (예정)" },
  { item: "mock → API", value: "src/lib/data/batch/* · realtime/*" },
];

export const BACKEND_STACK = [
  { item: "프레임워크", value: "NestJS · TypeORM" },
  { item: "RDBMS", value: "Aurora PostgreSQL (CQRS read/write)" },
  { item: "Hot", value: "DocumentDB (Mongo driver)" },
  { item: "인증", value: "Cognito JWT Authorizer" },
  { item: "FOTA", value: "contexts/fota → IoT Jobs + MQTT ota/*" },
  { item: "경로", value: "03.source/beckend/ (예정)" },
];
