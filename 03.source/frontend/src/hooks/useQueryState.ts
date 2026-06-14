"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { FILTER_ALL_VALUE, normalizeSelectValues } from "@/lib/grid/filter-all";
import { EMPTY_DATE_RANGE, presetToRange, type DateRange, type DateRangePreset } from "@/lib/ui/date-range";

export type QueryApplied<
  S extends Record<string, string>,
  F extends Record<string, string>,
> = {
  search: S;
  select: F;
  dateRange: DateRange;
};

function cloneRecord<T extends Record<string, string>>(value: T): T {
  return { ...value };
}

/** 인덱스 컬럼별 검색 + 선택 필터 + 기간 (조회 버튼으로 일괄 적용) */
export function useQueryState<
  S extends Record<string, string>,
  F extends Record<string, string> = Record<string, never>,
>(initialSearch: S, initialSelects?: F, initialDateRange: DateRange = EMPTY_DATE_RANGE) {
  const initialSearchRef = useRef(initialSearch);
  const initialSelectsRef = useRef((initialSelects ?? {}) as F);
  const initialDateRangeRef = useRef(initialDateRange);

  const buildDefaults = useCallback(
    (): QueryApplied<S, F> => ({
      search: cloneRecord(initialSearchRef.current),
      select: normalizeSelectValues(cloneRecord(initialSelectsRef.current)),
      dateRange: { ...initialDateRangeRef.current },
    }),
    [],
  );

  const [search, setSearchState] = useState<S>(() => cloneRecord(initialSearchRef.current));
  const [selects, setSelects] = useState<F>(() =>
    normalizeSelectValues(cloneRecord(initialSelectsRef.current)),
  );
  const [dateRange, setDateRangeState] = useState<DateRange>(() => ({
    ...initialDateRangeRef.current,
  }));
  const [applied, setApplied] = useState<QueryApplied<S, F>>(() => buildDefaults());

  const setSearch = useCallback((id: keyof S & string, value: string) => {
    setSearchState((prev) => ({ ...prev, [id]: value }));
  }, []);

  const setSelect = useCallback((id: keyof F & string, value: string) => {
    setSelects((prev) => ({
      ...prev,
      [id]: value === "" ? FILTER_ALL_VALUE : value,
    }));
  }, []);

  const setDateRange = useCallback((next: DateRange) => {
    setDateRangeState(next);
  }, []);

  const applyDateRange = useCallback((next: DateRange) => {
    setDateRangeState(next);
    setApplied((prev) => ({ ...prev, dateRange: next }));
  }, []);

  const applyDatePreset = useCallback(
    (preset: DateRangePreset) => {
      const next = preset === "all" ? EMPTY_DATE_RANGE : presetToRange(preset);
      applyDateRange(next);
    },
    [applyDateRange],
  );

  /** 선택 필터 즉시 적용 (드롭다운 · 칩) */
  const applyFilter = useCallback(
    (id: keyof F & string, value: string) => {
      const normalized = value === "" ? FILTER_ALL_VALUE : value;
      setSelects((prev) => normalizeSelectValues({ ...prev, [id]: normalized }));
      setApplied((prev) => ({
        search: { ...search },
        select: normalizeSelectValues({ ...prev.select, [id]: normalized }),
        dateRange: { ...dateRange },
      }));
    },
    [search, dateRange],
  );

  /** 여러 선택 필터를 한 번에 즉시 적용 */
  const applyFilters = useCallback(
    (updates: Partial<F>) => {
      setSelects((prev) => {
        const merged = { ...prev };
        for (const [key, val] of Object.entries(updates)) {
          if (val === undefined) continue;
          merged[key as keyof F] = (val === "" ? FILTER_ALL_VALUE : val) as F[keyof F];
        }
        const next = normalizeSelectValues(merged);
        setApplied((prevApplied) => ({
          search: { ...search },
          select: next,
          dateRange: { ...dateRange },
        }));
        return next;
      });
    },
    [search, dateRange],
  );

  /** @deprecated applyFilter 사용 */
  const applySelect = applyFilter;

  const apply = useCallback(() => {
    setApplied({
      search: { ...search },
      select: normalizeSelectValues({ ...selects }),
      dateRange: { ...dateRange },
    });
  }, [search, selects, dateRange]);

  const reset = useCallback(() => {
    const defaults = buildDefaults();
    setSearchState(defaults.search);
    setSelects(defaults.select);
    setDateRangeState(defaults.dateRange);
    setApplied(defaults);
  }, [buildDefaults]);

  const refreshKey = useMemo(() => JSON.stringify(applied), [applied]);

  return {
    search,
    setSearch,
    selects,
    setSelect,
    dateRange,
    setDateRange,
    applyDatePreset,
    applyDateRange,
    applyFilter,
    applyFilters,
    applySelect,
    applied,
    apply,
    reset,
    refreshKey,
  };
}
