"use client";

import { useMemo } from "react";
import { createKeysetFetcher, countFilteredRows } from "@/lib/grid/keyset-fetch";
import type { KeysetFetchFn } from "@/lib/grid/keyset-fetch";

export function useFilteredRows<T extends object>(
  source: T[],
  filterFn: (item: T) => boolean,
  options?: { idField?: string; delayMs?: number },
) {
  const idField = options?.idField ?? "id";
  const delayMs = options?.delayMs;

  const rowData = useMemo(() => source.filter(filterFn), [source, filterFn]);

  const fetchRows = useMemo(
    () => createKeysetFetcher(source, { idField, filterFn, delayMs }) as KeysetFetchFn<T>,
    [source, idField, filterFn, delayMs],
  );

  const resultCount = useMemo(() => countFilteredRows(source, filterFn), [source, filterFn]);

  return { rowData, fetchRows, resultCount };
}
