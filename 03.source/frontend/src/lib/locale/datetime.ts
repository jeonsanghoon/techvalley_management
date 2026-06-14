import type { AppLanguage } from "./types";

export type DateTimePreset = "datetime" | "date" | "time" | "short";

export type LocaleDateTimeOptions = {
  language: AppLanguage;
  timeZone: string;
  preset?: DateTimePreset;
};

function localeTag(language: AppLanguage): string {
  return language === "en" ? "en-US" : "ko-KR";
}

function parseInstant(value: string): Date | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const normalized = trimmed.includes("T") ? trimmed : `${trimmed}T12:00:00`;
  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** ISO/날짜 문자열을 선택 타임존·언어로 표시 */
export function formatLocaleDateTime(
  value: string | null | undefined,
  options: LocaleDateTimeOptions,
): string {
  if (!value) return "—";

  const { language, timeZone, preset = "datetime" } = options;
  const date = parseInstant(value);
  if (!date) return value;

  const locale = localeTag(language);
  const base: Intl.DateTimeFormatOptions = { timeZone };

  switch (preset) {
    case "date":
      return date.toLocaleDateString(locale, {
        ...base,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    case "time":
      return date.toLocaleTimeString(locale, {
        ...base,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });
    case "short":
      return date.toLocaleString(locale, {
        ...base,
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    default:
      return date.toLocaleString(locale, {
        ...base,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
  }
}

/** 배치/실시간 메타 asOf — streaming은 호출 측에서 처리 */
export function formatLocaleAsOf(
  asOf: string,
  options: LocaleDateTimeOptions,
): string {
  return formatLocaleDateTime(asOf, { ...options, preset: "short" });
}

/** 헤더 시계용 — 요일 포함 */
export function formatLocaleClock(
  date: Date,
  language: AppLanguage,
  timeZone: string,
): string {
  return date.toLocaleString(localeTag(language), {
    timeZone,
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

/** 그리드 컬럼 field → 표시 프리셋 */
export function gridDatePreset(field: string): DateTimePreset | null {
  if (field.endsWith("Date")) return "date";
  if (field.endsWith("At")) return "datetime";
  return null;
}
