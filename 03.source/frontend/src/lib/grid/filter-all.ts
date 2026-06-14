/** 선택 필터 · 기간 필터 공통 "전체" 값 (내부 저장값 — UI 라벨은 i18n) */
export const FILTER_ALL_VALUE = "전체";

export type FilterOption = { value: string; label: string };

export function isAllFilterValue(value: string | null | undefined): boolean {
  return value == null || value === "" || value === FILTER_ALL_VALUE;
}

/** 드롭다운에 "전체" 옵션이 항상 포함되도록 보정 */
export function ensureAllFilterOption(
  options: FilterOption[],
  allLabel: string,
): FilterOption[] {
  const rest = options.filter((o) => o.value !== FILTER_ALL_VALUE && o.value !== "");
  return [{ value: FILTER_ALL_VALUE, label: allLabel }, ...rest];
}

/** Select value가 options에 없으면 "전체"로 복귀 (includeAll=false면 빈 값) */
export function resolveFilterSelectValue(
  value: string | undefined,
  options: FilterOption[],
  includeAll = true,
): string {
  const resolved = value ?? FILTER_ALL_VALUE;
  if (options.some((o) => o.value === resolved)) return resolved;
  if (includeAll) return FILTER_ALL_VALUE;
  return isAllFilterValue(resolved) ? "" : resolved;
}

export function buildSelectFilterOptions(
  values: readonly string[],
  allLabel: string,
  labelFor: (value: string) => string,
): FilterOption[] {
  const uniq = Array.from(
    new Set(values.filter((v) => v === FILTER_ALL_VALUE || Boolean(v))),
  );
  const ordered = [
    FILTER_ALL_VALUE,
    ...uniq.filter((v) => v !== FILTER_ALL_VALUE),
  ];
  return ordered.map((value) => ({
    value,
    label: isAllFilterValue(value) ? allLabel : labelFor(value),
  }));
}

export function normalizeSelectValues<F extends Record<string, string>>(
  selects: F,
  allKeys?: (keyof F)[],
): F {
  const next = { ...selects };
  for (const key of Object.keys(next) as (keyof F)[]) {
    if (allKeys && !allKeys.includes(key)) continue;
    if (isAllFilterValue(next[key])) {
      next[key] = FILTER_ALL_VALUE as F[keyof F];
    }
  }
  return next;
}
