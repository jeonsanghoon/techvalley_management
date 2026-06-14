import { format, isValid, parse, subDays, subMonths, subWeeks } from "date-fns";

import type { LocalizableText } from "@/lib/locale/types";

export type DateRangePreset = "all" | "1d" | "1w" | "1m" | "3m";

export interface DateRange {
  from: string;
  to: string;
}

export const EMPTY_DATE_RANGE: DateRange = { from: "", to: "" };

export function isAllDateRange(range: DateRange): boolean {
  return !range.from && !range.to;
}

/** yyyy-MM-dd ↔ Date (MUI DatePicker) */
export function parseYmd(value: string): Date | null {
  if (!value) return null;
  const parsed = parse(value, "yyyy-MM-dd", new Date());
  return isValid(parsed) ? parsed : null;
}

export function toYmd(date: Date | null): string {
  if (!date || !isValid(date)) return "";
  return format(date, "yyyy-MM-dd");
}

export const DATE_RANGE_PRESETS: { id: Exclude<DateRangePreset, "all">; label: LocalizableText }[] = [
  { id: "1d", label: { ko: "1일", en: "1 day" } },
  { id: "1w", label: { ko: "1주", en: "1 week" } },
  { id: "1m", label: { ko: "1달", en: "1 month" } },
  { id: "3m", label: { ko: "3달", en: "3 months" } },
];

export function formatDateYmd(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

/** 종료일(기본 오늘) 기준 프리셋 구간 ("all" 제외) */
export function presetToRange(
  preset: Exclude<DateRangePreset, "all">,
  endDate = new Date(),
): DateRange {
  const to = formatDateYmd(endDate);
  const fromDate = (() => {
    switch (preset) {
      case "1d":
        return subDays(endDate, 1);
      case "1w":
        return subWeeks(endDate, 1);
      case "1m":
        return subMonths(endDate, 1);
      case "3m":
        return subMonths(endDate, 3);
    }
  })();
  return { from: formatDateYmd(fromDate), to };
}

/** 현재 from/to가 어떤 프리셋과 일치하는지 */
export function detectPreset(range: DateRange, endDate = new Date()): DateRangePreset | null {
  if (isAllDateRange(range)) return "all";
  if (!range.from || !range.to) return null;
  for (const { id } of DATE_RANGE_PRESETS) {
    const p = presetToRange(id, endDate);
    if (p.from === range.from && p.to === range.to) return id;
  }
  return null;
}
