import type { DataScope, DataSourceMeta } from "@/lib/data/scope";

/** 백엔드 batchMeta + 목록 API path → UI DataSourceMeta */
export function attachEndpoint(
  meta: Partial<DataSourceMeta> & { refreshInterval?: string },
  path: string,
): DataSourceMeta {
  const scope: DataScope =
    meta.scope === "realtime" || meta.refreshInterval === "realtime" ? "realtime" : "batch";
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return {
    scope,
    asOf: meta.asOf ?? new Date().toISOString(),
    source: meta.source ?? "techvalley-backend",
    refreshInterval: meta.refreshInterval,
    endpoint: `GET /api${normalized}`,
  };
}

/** API meta 없을 때 페이지 툴바용 fallback */
export function fallbackMeta(path: string, scope: DataScope = "batch"): DataSourceMeta {
  return attachEndpoint({ scope, source: "—" }, path);
}

export type ApiListResult<T> = {
  items: T[];
  meta: DataSourceMeta;
};

export function getListItems<T>(data: ApiListResult<T> | undefined): T[] {
  return data?.items ?? [];
}
