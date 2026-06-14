export interface KeysetPage<T> {
  rows: T[];
  nextCursor: string | null;
  totalCount?: number;
}

export interface KeysetFetchParams {
  cursor: string | null;
  limit: number;
  signal?: AbortSignal;
}

export type KeysetFetchFn<T> = (params: KeysetFetchParams) => Promise<KeysetPage<T>>;

export interface KeysetFetcherOptions<T> {
  pageSize?: number;
  idField?: string;
  delayMs?: number;
  filterFn?: (item: T) => boolean;
  sortFn?: (a: T, b: T) => number;
}

function readId(row: object, idField: string): string {
  const value = (row as Record<string, unknown>)[idField];
  return value != null ? String(value) : "";
}

export function createKeysetFetcher<T extends object>(
  source: T[] | (() => T[]),
  options: KeysetFetcherOptions<T> = {},
): KeysetFetchFn<T> {
  const idField = options.idField ?? "id";
  const delayMs = options.delayMs ?? 80;
  const filterFn = options.filterFn;
  const sortFn = options.sortFn;

  const sortedRows = (): T[] => {
    const items = typeof source === "function" ? source() : source;
    const filtered = filterFn ? items.filter(filterFn) : items;
    return [...filtered].sort(
      sortFn ?? ((a, b) => readId(a, idField).localeCompare(readId(b, idField))),
    );
  };

  return async ({ cursor, limit, signal }) => {
    if (signal?.aborted) {
      throw new DOMException("Aborted", "AbortError");
    }

    if (delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }

    const rows = sortedRows();
    const startIndex = cursor ? rows.findIndex((row) => readId(row, idField) === cursor) + 1 : 0;
    const slice = rows.slice(startIndex, startIndex + limit);
    const last = slice[slice.length - 1];
    const nextCursor = slice.length === limit && last ? readId(last, idField) || null : null;

    return { rows: slice, nextCursor, totalCount: rows.length };
  };
}

export function keysetFetcherFromRows<T extends object>(
  rowData: T[],
  idField = "id",
): KeysetFetchFn<T> {
  return createKeysetFetcher(rowData, { idField, delayMs: 0 });
}

export function countFilteredRows<T>(source: T[], filterFn?: (item: T) => boolean): number {
  if (!filterFn) return source.length;
  return source.filter(filterFn).length;
}
