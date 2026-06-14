import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadAllKeys() {
  const tvKeys = JSON.parse(fs.readFileSync("/tmp/tv-keys.json", "utf8"));
  const extraFiles = ["i18n-ko-partial.json", "i18n-ko-overrides.json"];
  const extras = extraFiles.flatMap((file) => {
    const filePath = path.join(__dirname, file);
    if (!fs.existsSync(filePath)) return [];
    return Object.keys(JSON.parse(fs.readFileSync(filePath, "utf8")));
  });
  return [...new Set([...tvKeys, ...extras])].sort();
}

const keys = loadAllKeys();

const ko = {};

const partialPath = path.join(__dirname, "i18n-ko-partial.json");
const overridesPath = path.join(__dirname, "i18n-ko-overrides.json");
if (fs.existsSync(partialPath)) {
  Object.assign(ko, JSON.parse(fs.readFileSync(partialPath, "utf8")));
}
if (fs.existsSync(overridesPath)) {
  Object.assign(ko, JSON.parse(fs.readFileSync(overridesPath, "utf8")));
}

const manual = {
  "dashboard.kpi.online": "가동",
  "dashboard.kpi.uptimeRate": "가동률",
  "dashboard.kpi.alarm": "알람",
  "dashboard.kpi.maintenance": "정비",
  "dashboard.kpi.ticket": "티켓",
  "dashboard.kpi.yield": "수율",
  "dashboard.quickLink.equipment": "장비 마스터",
  "dashboard.quickLink.equipmentDesc": "배치 플릿 스냅샷",
  "dashboard.quickLink.equipmentLogs": "장비 로그",
  "dashboard.quickLink.equipmentLogsDesc": "구분별 Warm Tier 조회",
  "dashboard.quickLink.alarms": "이상 알람",
  "dashboard.quickLink.alarmsDesc": "배치 알람 스냅샷",
  "dashboard.quickLink.serviceTickets": "서비스 티켓",
  "dashboard.quickLink.serviceTicketsDesc": "배치 티켓 현황",
  "dashboard.section.fleetMap": "플릿 지도",
  "dashboard.section.recentAlarms": "최근 알람",
  "dashboard.section.quickLinks": "빠른 이동 (배치 화면)",
  "dashboard.toolbar.alarms": "알람",
  "dashboard.chart.fleetStatus": "플릿 상태",
  "dashboard.chart.fleetStatusSub": "배치 롤업 · 전체 156대",
  "dashboard.chart.ticketStages": "티켓 단계",
  "dashboard.chart.batchSnapshot": "배치 스냅샷",
  "dashboard.chart.alarmTrend": "알람 추이",
  "dashboard.chart.alarmTrendSub": "일별 배치 집계 · 7일",
  "dashboard.chart.yield": "검사 수율",
  "dashboard.chart.yieldSub": "Iceberg 일별 롤업",
  "dashboard.grid.equipment": "장비 현황",
  "dashboard.grid.openTickets": "진행 중 티켓",
  "alarms.quickFilter.all": "전체",
  "alarms.quickFilter.unackedCritical": "미확인 Critical",
  "alarms.quickFilter.unacked": "미확인",
  "alarms.quickFilter.noTicket": "티켓 없음",
  "alarms.quickFilter.remotePending": "원격 대기",
  "alarms.quickFilter.all.desc": "배치 스냅샷 전체 알람",
  "alarms.quickFilter.unacked_critical.desc": "SLA 15분 내 1차 대응 대상",
  "alarms.quickFilter.unacked.desc": "확인 처리 필요",
  "alarms.quickFilter.no_ticket.desc": "서비스 호출 미연계",
  "alarms.quickFilter.remote_pending.desc": "원격 시도 후 결과 대기",
  "metricStream.tab.periodic.label": "주기",
  "metricStream.tab.event.label": "이벤트",
  "metricStream.tab.firmware.label": "펌웨어",
  "metricStream.tab.control.label": "제어",
  "metricStream.tab.periodic.gridTitle": "주기 메트릭 스트림",
  "metricStream.tab.event.gridTitle": "이벤트 메트릭 스트림",
  "metricStream.tab.firmware.gridTitle": "펌웨어 메트릭 스트림",
  "metricStream.tab.control.gridTitle": "제어 메트릭 스트림",
  "metricStream.tab.periodic.gridSubtitle": "수치형 주기 메트릭 · 이전값 비교",
  "metricStream.tab.event.gridSubtitle": "상태 전이 · 알람 트리거 이벤트",
  "metricStream.tab.firmware.gridSubtitle": "OTA 진행률 · 펌웨어 버전 보고",
  "metricStream.tab.control.gridSubtitle": "Shadow · IoT Job · 파라미터 제어",
  "equipmentLogs.category.튜브": "튜브",
  "equipmentLogs.category.디텍터": "디텍터",
  "equipmentLogs.category.본체": "본체",
  "equipmentLogs.category.알람": "알람",
  "equipmentLogs.category.원격제어": "원격제어",
  "equipmentLogs.category.펌웨어": "펌웨어",
  "equipmentLogs.category.주기": "주기",
  "equipmentLogs.category.이벤트": "이벤트",
  "equipmentLogs.category.감사": "감사",
  "equipmentLogs.category.튜브.summary": "kV/mA/s·튜브 수명·캘리브레이션",
  "equipmentLogs.category.디텍터.summary": "온도·캘리브레이션·상태",
  "equipmentLogs.category.본체.summary": "본체 온도·Greengrass·가동시간",
  "equipmentLogs.category.알람.summary": "알람 발생·해제·룰 매칭 이력",
  "equipmentLogs.category.원격제어.summary": "Shadow·IoT Job·파라미터 제어",
  "equipmentLogs.category.펌웨어.summary": "OTA·버전·검증",
  "equipmentLogs.category.주기.summary": "헬스체크·수율 등 주기 보고",
  "equipmentLogs.category.이벤트.summary": "상태 전이·연결 이벤트",
  "equipmentLogs.category.감사.summary": "API·권한·감사 추적",
  "reports.category.운영": "운영",
  "reports.category.알람": "알람",
  "reports.category.AS": "AS",
  "reports.category.검사": "검사",
};
Object.assign(ko, manual);

for (const k of keys) {
  if (!ko[k]) ko[k] = k.split(".").pop()?.replace(/_/g, " ") ?? k;
}

const en = {};
const EN_MANUAL = {
  "common.all": "All",
  "common.viewAll": "View all",
  "common.countSuffix": " items",
  "common.countUnit": " items",
  "query.search": "Search",
  "query.reset": "Reset",
  "dashboard.kpi.online": "Online",
  "dashboard.kpi.uptimeRate": "Uptime rate",
  "dashboard.kpi.alarm": "Alarms",
  "dashboard.kpi.maintenance": "Maintenance",
  "dashboard.kpi.ticket": "Tickets",
  "dashboard.kpi.yield": "Yield",
  "login.title": "TechValley IoT",
  "login.submit": "Sign in",
  "forbidden.title": "Access denied",
  "nav.tagline": "IoT service platform",
  "theme.toggle": "Toggle theme",
};
for (const k of keys) {
  en[k] =
    EN_MANUAL[k] ??
    k
      .split(".")
      .pop()
      ?.replace(/([A-Z])/g, " $1")
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase())
      .trim() ??
    k;
}

fs.writeFileSync(path.join(__dirname, "i18n-ko-seed.json"), JSON.stringify(ko, null, 2));
fs.writeFileSync(path.join(__dirname, "i18n-en-seed.json"), JSON.stringify(en, null, 2));
console.log(`Seeds written: ${Object.keys(ko).length} keys (${Object.keys(manual).length} manual KO)`);
