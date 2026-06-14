import type { useQueryState } from "@/hooks/useQueryState";
import type { TranslationKey } from "@/lib/locale";

type QueryDateSlice = Pick<
  ReturnType<typeof useQueryState<Record<string, string>, Record<string, string>>>,
  "dateRange" | "setDateRange" | "applyDatePreset"
>;

/** QueryToolbar 조회 기간 필드 공통 props */
export function bindQueryToolbarDate(
  query: QueryDateSlice,
  translate: (key: TranslationKey) => string,
) {
  return {
    dateRange: query.dateRange,
    onDateRangeChange: query.setDateRange,
    onDatePreset: query.applyDatePreset,
    dateFromLabel: translate("query.dateFrom" as TranslationKey),
    dateToLabel: translate("query.dateTo" as TranslationKey),
  };
}
