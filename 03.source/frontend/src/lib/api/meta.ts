import type { DataSourceMeta } from "@/lib/data/scope";
import { fallbackMeta } from "./scope-meta";

/** @deprecated API 응답 meta 사용 — fallback 전용 */
export const API_DATA_META: DataSourceMeta = fallbackMeta("/…", "batch");

/** @deprecated API 응답 meta 사용 — fallback 전용 */
export const API_REALTIME_META: DataSourceMeta = fallbackMeta("/…", "realtime");

export { fallbackMeta, getListItems, attachEndpoint } from "./scope-meta";
export type { ApiListResult } from "./scope-meta";
