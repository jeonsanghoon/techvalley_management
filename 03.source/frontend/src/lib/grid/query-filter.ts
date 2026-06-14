/** 단일 인덱스 컬럼 부분 일치 — 빈 query면 통과 */
export function matchesFieldQuery(query: string, value: string | null | undefined): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (value ?? "").toLowerCase().includes(q);
}

/**
 * 인덱스 컬럼별 AND 검색.
 * search 키 = API/DB 인덱스 파라미터명, rowFields 키와 1:1 매핑.
 * 빈 입력란은 해당 인덱스 조건을 생략합니다.
 */
export function matchesIndexedFields(
  search: Record<string, string>,
  rowFields: Record<string, string | null | undefined>,
): boolean {
  for (const [key, query] of Object.entries(search)) {
    if (!matchesFieldQuery(query, rowFields[key])) return false;
  }
  return true;
}

import { FILTER_ALL_VALUE, isAllFilterValue } from "@/lib/grid/filter-all";

/** 선택 필터 — "전체"이면 통과 */
export function matchesSelectFilter(applied: string, value: string, allLabel = FILTER_ALL_VALUE): boolean {
  if (isAllFilterValue(applied) || applied === allLabel) return true;
  return applied === value;
}

/** 불리언 선택 필터 — "전체" | "Y" | "N" */
export function matchesBoolSelectFilter(
  applied: string,
  value: boolean,
  allLabel = FILTER_ALL_VALUE,
): boolean {
  if (isAllFilterValue(applied) || applied === allLabel) return true;
  if (applied === "Y") return value === true;
  if (applied === "N") return value === false;
  return true;
}

/** 조건 AND 결합 */
export function combineAnd(...conditions: boolean[]): boolean {
  return conditions.every(Boolean);
}

/** 일자 범위 — from/to 빈 값이면 해당 경계 무시 (YYYY-MM-DD) */
export function matchesDateRange(
  from: string,
  to: string,
  value: string | null | undefined,
): boolean {
  if (!from && !to) return true;
  if (!value) return false;
  const d = value.slice(0, 10);
  if (from && d < from) return false;
  if (to && d > to) return false;
  return true;
}

/** 객체 필드를 검색 문자열로 */
export function fieldStr(value: unknown): string {
  if (value == null) return "";
  if (Array.isArray(value)) return value.join(" ");
  return String(value);
}
