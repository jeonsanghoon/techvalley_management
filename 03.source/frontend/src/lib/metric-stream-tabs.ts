import type { GridColumnSet } from "@/lib/grid/types";
import type { MetricKind } from "@/lib/types";
import type { LocalizableText } from "@/lib/locale/types";

export type MetricStreamTabId = "periodic" | "event" | "firmware" | "control";

export type MetricStreamTab = {
  id: MetricStreamTabId;
  hash: string;
  label: LocalizableText;
  kind: MetricKind;
  description: LocalizableText;
  menuId: string;
  columnSet: GridColumnSet;
  gridSubtitle: LocalizableText;
  hint: LocalizableText;
};

export const METRIC_STREAM_TABS: MetricStreamTab[] = [
  {
    id: "periodic",
    hash: "periodic",
    label: { ko: "주기", en: "Periodic" },
    kind: "주기",
    description: { ko: "tube.kv · temp · yield 등 주기 보고", en: "Periodic tube.kv · temp · yield reports" },
    menuId: "metric-stream-periodic",
    columnSet: "metricLogPeriodic",
    gridSubtitle: { ko: "수치형 주기 메트릭 · 이전값 비교", en: "Numeric periodic metrics · previous value compare" },
    hint: {
      ko: "tube.kv, detector.temp, yield.pct 등 주기 보고 메트릭입니다. 실시간 추이 차트와 이전값 비교로 이상 징후를 확인하세요.",
      en: "Periodic metrics such as tube.kv, detector.temp, yield.pct. Use live charts and previous-value compare for anomalies.",
    },
  },
  {
    id: "event",
    hash: "event",
    label: { ko: "이벤트", en: "Event" },
    kind: "이벤트",
    description: { ko: "상태 전이 · 알람 트리거", en: "State transitions · alarm triggers" },
    menuId: "metric-stream-event",
    columnSet: "metricLogEvent",
    gridSubtitle: { ko: "상태 전이 · 알람 트리거 이벤트", en: "State transition · alarm trigger events" },
    hint: {
      ko: "connectivity.status, alarm.triggered 등 이산 이벤트입니다. 장비 상태 전이와 알람 발생 시점을 시간순으로 추적합니다.",
      en: "Discrete events like connectivity.status and alarm.triggered. Track state changes and alarm times.",
    },
  },
  {
    id: "firmware",
    hash: "firmware",
    label: { ko: "펌웨어", en: "Firmware" },
    kind: "펌웨어",
    description: { ko: "OTA 진행 · 버전 보고", en: "OTA progress · version reports" },
    menuId: "metric-stream-firmware",
    columnSet: "metricLogFirmware",
    gridSubtitle: { ko: "OTA 진행률 · 펌웨어 버전 보고", en: "OTA progress · firmware version reports" },
    hint: {
      ko: "ota.progress, firmware.version 등 OTA·버전 보고 메트릭입니다. 진행 중 OTA와 버전 분포를 모니터링합니다.",
      en: "OTA and version metrics such as ota.progress and firmware.version. Monitor in-progress OTA and version distribution.",
    },
  },
  {
    id: "control",
    hash: "control",
    label: { ko: "제어", en: "Control" },
    kind: "제어",
    description: { ko: "Shadow · IoT Job · 파라미터", en: "Shadow · IoT Job · parameters" },
    menuId: "metric-stream-control",
    columnSet: "metricLogControl",
    gridSubtitle: { ko: "Shadow · IoT Job · 파라미터 제어", en: "Shadow · IoT Job · parameter control" },
    hint: {
      ko: "shadow.desired, control.kv_set, control.safe_mode 등 원격 제어·Shadow 동기화 메트릭입니다. 명령 반영 상태를 확인합니다.",
      en: "Remote control and shadow sync metrics. Verify command application status.",
    },
  },
];

export const METRIC_STREAM_DEFAULT_TAB: MetricStreamTabId = "periodic";

export function normalizeMetricHash(hash: string): string {
  return hash.replace(/^#/, "").trim().toLowerCase();
}

export function metricTabFromHash(hash: string): MetricStreamTab {
  const normalized = normalizeMetricHash(hash);
  return (
    METRIC_STREAM_TABS.find((tab) => tab.hash === normalized) ??
    METRIC_STREAM_TABS.find((tab) => tab.id === METRIC_STREAM_DEFAULT_TAB)!
  );
}

export function metricTabHref(tab: MetricStreamTab): string {
  return `/metric-stream#${tab.hash}`;
}

export function resolveMetricMenuId(menuId: string): string {
  if (menuId.startsWith("metric-stream-")) return "metric-stream";
  return menuId;
}
