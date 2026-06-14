import type { DataScope } from "@/lib/data/scope";
import type { PipelineTier } from "@/lib/types";
import { resolveNavMenuId } from "@/lib/navigation";

/**
 * IoT 수집·저장 서비스 라이프사이클 (A1 → A2 → Tier → A3)
 * Greengrass 수집 → Kinesis·Lambda 정규화 → 3-Tier 저장 → 배치 관제 소비
 */
export type CollectionLifecyclePhase = "ingest" | "stream" | "warm" | "rollup";

export const COLLECTION_LIFECYCLE_PHASES: {
  id: CollectionLifecyclePhase;
  order: number;
  label: string;
  domain: string;
  description: string;
}[] = [
  {
    id: "ingest",
    order: 1,
    label: "① 수집·파이프라인",
    domain: "A1 / A2",
    description: "Greengrass · IoT Core · Kinesis · Lambda · Tier 이관",
  },
  {
    id: "stream",
    order: 2,
    label: "② 실시간 Hot",
    domain: "A1 / A2",
    description: "Kinesis 스트림 · DocumentDB Hot Tier 모니터링",
  },
  {
    id: "warm",
    order: 3,
    label: "③ Warm 조회",
    domain: "A2",
    description: "Aurora PG near-line 로그 배치 조회",
  },
  {
    id: "rollup",
    order: 4,
    label: "④ 배치 관제",
    domain: "A3",
    description: "플릿·KPI·알람 스냅샷 (롤업 집계 소비)",
  },
];

export interface CollectionLifecycleMeta {
  phase: CollectionLifecyclePhase;
  phaseLabel: string;
  phaseOrder: number;
  dataScope: DataScope | "mixed";
  storageTier?: PipelineTier;
}

const MENU_LIFECYCLE: Record<string, CollectionLifecycleMeta> = {
  "data-pipeline": {
    phase: "ingest",
    phaseLabel: "① 수집·파이프라인",
    phaseOrder: 1,
    dataScope: "mixed",
  },
  "metric-stream": {
    phase: "stream",
    phaseLabel: "② 실시간 Hot",
    phaseOrder: 2,
    dataScope: "realtime",
    storageTier: "Hot",
  },
  "equipment-logs": {
    phase: "warm",
    phaseLabel: "③ Warm 조회",
    phaseOrder: 3,
    dataScope: "batch",
    storageTier: "Warm",
  },
  dashboard: {
    phase: "rollup",
    phaseLabel: "④ 배치 관제",
    phaseOrder: 4,
    dataScope: "batch",
  },
};

/** 수집 라이프사이클에 속한 앵커 메뉴 ID (사이드바 정렬 기준) */
/** 사이드바 표시 순서 — 통합 관제 대시보드가 관제 그룹 첫 메뉴 */
export const COLLECTION_LIFECYCLE_MENU_ORDER = [
  "dashboard",
  "data-pipeline",
  "metric-stream",
  "equipment-logs",
] as const;

export function getCollectionLifecycleMeta(menuId: string): CollectionLifecycleMeta | undefined {
  const anchorId = resolveNavMenuId(menuId);
  return MENU_LIFECYCLE[anchorId];
}

export function isCollectionLifecycleMenu(menuId: string): boolean {
  return getCollectionLifecycleMeta(menuId) != null;
}
