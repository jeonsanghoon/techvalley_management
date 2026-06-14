import { addDays, format, subDays } from "date-fns";
import type { Alarm, LogCategory } from "@/lib/types";
import type { DateRange } from "@/lib/ui/date-range";

/** 구분 탭 — Warm Tier 적재 단위 */
export const EQUIPMENT_LOG_CATEGORY_META: Record<
  LogCategory,
  { summary: string }
> = {
  튜브: { summary: "kV/mA/s·튜브 수명·캘리브레이션" },
  디텍터: { summary: "온도·캘리브레이션·상태" },
  본체: { summary: "본체 온도·Greengrass·가동시간" },
  알람: { summary: "알람 발생·해제·룰 매칭 이력" },
  원격제어: { summary: "Shadow·IoT Job·파라미터 제어" },
  펌웨어: { summary: "OTA·버전·검증" },
  주기: { summary: "헬스체크·수율 등 주기 보고" },
  이벤트: { summary: "상태 전이·연결 이벤트" },
  감사: { summary: "API·권한·감사 추적" },
};

/** Warm Tier 배치 조회 — 카테고리별 분리 (통합 시간순 뷰 없음) */
export const EQUIPMENT_LOG_CATEGORIES: LogCategory[] = [
  "튜브",
  "디텍터",
  "본체",
  "알람",
  "원격제어",
  "펌웨어",
  "주기",
  "이벤트",
  "감사",
];

const LOG_CATEGORY_SET = new Set<string>(EQUIPMENT_LOG_CATEGORIES);

export function isLogCategory(value: string | null | undefined): value is LogCategory {
  return value != null && LOG_CATEGORY_SET.has(value);
}

export function formatDateYmd(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

/** 기준 시각 전후 N일 (기본 ±1일) */
export function logRangeAround(anchorIso: string, daysAround = 1): DateRange {
  const anchor = new Date(anchorIso);
  if (Number.isNaN(anchor.getTime())) {
    return { from: "", to: "" };
  }
  return {
    from: formatDateYmd(subDays(anchor, daysAround)),
    to: formatDateYmd(addDays(anchor, daysAround)),
  };
}

export type EquipmentLogsNavParams = {
  equipmentId: string;
  category: LogCategory;
  anchorAt?: string;
  daysAround?: number;
  from?: string;
  to?: string;
};

export function buildEquipmentLogsHref({
  equipmentId,
  category,
  anchorAt,
  daysAround = 1,
  from,
  to,
}: EquipmentLogsNavParams): string {
  const range =
    from && to ? { from, to } : anchorAt ? logRangeAround(anchorAt, daysAround) : { from: "", to: "" };

  const params = new URLSearchParams();
  params.set("equipmentId", equipmentId);
  params.set("category", category);
  if (range.from) params.set("from", range.from);
  if (range.to) params.set("to", range.to);
  if (anchorAt) params.set("anchorAt", anchorAt);
  return `/equipment-logs?${params.toString()}`;
}

/** 알람 문맥에서 연관 로그 카테고리 추천 */
export function relatedLogCategoriesForAlarm(alarm: Alarm): LogCategory[] {
  const text = `${alarm.ruleName} ${alarm.message}`.toLowerCase();
  if (text.includes("튜브") || text.includes("kv")) {
    return ["튜브", "주기", "이벤트"];
  }
  if (text.includes("디텍터") || text.includes("detector") || text.includes("온도")) {
    return ["디텍터", "주기", "이벤트"];
  }
  if (text.includes("본체") || text.includes("greengrass") || text.includes("spool")) {
    return ["본체", "주기", "이벤트"];
  }
  if (text.includes("펌웨어") || text.includes("ota")) {
    return ["펌웨어", "이벤트"];
  }
  return ["주기", "이벤트", "알람"];
}

export function parseEquipmentLogsSearchParams(searchParams: URLSearchParams): {
  equipmentId: string | null;
  category: LogCategory | null;
  dateRange: DateRange;
  anchorAt: string | null;
} {
  const equipmentId = searchParams.get("equipmentId");
  const categoryParam = searchParams.get("category");
  const category = isLogCategory(categoryParam) ? categoryParam : null;
  const from = searchParams.get("from") ?? "";
  const to = searchParams.get("to") ?? "";
  const anchorAt = searchParams.get("anchorAt");
  return {
    equipmentId,
    category,
    dateRange: from || to ? { from, to } : anchorAt ? logRangeAround(anchorAt) : { from: "", to: "" },
    anchorAt,
  };
}
