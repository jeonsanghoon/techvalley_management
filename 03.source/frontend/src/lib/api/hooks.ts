"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useLocale } from "@/contexts/LocaleContext";
import { loadAccessToken } from "@/lib/auth/session";
import { api } from "./endpoints";
import { getListItems } from "./scope-meta";

export { getListItems, fallbackMeta } from "./scope-meta";
export type { ApiListResult } from "./scope-meta";

type AuthQueryOptions = {
  staleTime?: number;
  refetchInterval?: number | false;
};

/** JWT 로그인·세션 복원 후에만 보호 API 호출 */
function useAuthenticatedQuery<T>(
  queryKey: unknown[],
  queryFn: () => Promise<T>,
  options: AuthQueryOptions = {},
) {
  const { user, ready } = useAuth();
  const hasToken = Boolean(loadAccessToken());

  return useQuery({
    queryKey,
    queryFn,
    staleTime: options.staleTime ?? 30_000,
    refetchInterval: options.refetchInterval,
    enabled: ready && Boolean(user) && hasToken,
  });
}

const stale = 30_000;

export function useDashboardSummary() {
  const { serviceRegion } = useLocale();
  return useAuthenticatedQuery(
    ["dashboard", "summary", serviceRegion],
    () => api.dashboardSummary(serviceRegion),
    { staleTime: stale },
  );
}

export function useDashboardTrends() {
  return useAuthenticatedQuery(["dashboard", "trends"], async () => {
    const { data, meta } = await api.dashboardTrends();
    return { ...data, meta };
  }, { staleTime: stale });
}

export function useAlarms() {
  return useAuthenticatedQuery(["alarms"], api.alarms, { staleTime: 15_000 });
}

export function useAlarmRules() {
  return useAuthenticatedQuery(["alarm-rules"], api.alarmRules, { staleTime: 60_000 });
}

export function usePipelineLive() {
  return useAuthenticatedQuery(["pipeline", "live"], api.pipelineLive, { refetchInterval: 10_000 });
}

export function usePipelineTiers() {
  return useAuthenticatedQuery(["pipeline", "tiers"], api.pipelineTiers, { staleTime: stale });
}

export function useCollectionStats() {
  return useAuthenticatedQuery(["pipeline", "stats"], api.collectionStats, { staleTime: stale });
}

export function useEquipment() {
  return useAuthenticatedQuery(["equipment"], api.equipment, { staleTime: stale });
}

export function useFleetLive() {
  return useAuthenticatedQuery(["fleet", "live"], api.fleetLive, { staleTime: 10_000 });
}

export function useMetricStreamLatest() {
  return useAuthenticatedQuery(["metric-stream"], api.metricStreamLatest, { refetchInterval: 5_000 });
}

export function useServiceTickets() {
  return useAuthenticatedQuery(["service", "tickets"], api.serviceTickets, { staleTime: stale });
}

export function useEngineers() {
  return useAuthenticatedQuery(["service", "engineers"], api.engineers, { staleTime: stale });
}

export function usePartOrders() {
  return useAuthenticatedQuery(["parts", "orders"], api.partOrders, { staleTime: stale });
}

export function usePartSchedules() {
  return useAuthenticatedQuery(["parts", "schedules"], api.partSchedules, { staleTime: stale });
}

export function useInstallations() {
  return useAuthenticatedQuery(["installation"], api.installations, { staleTime: stale });
}

export function useAsRecords() {
  return useAuthenticatedQuery(["as"], api.asRecords, { staleTime: stale });
}

export function useCustomers() {
  return useAuthenticatedQuery(["customers"], api.customers, { staleTime: stale });
}

export function useSites() {
  return useAuthenticatedQuery(["sites"], api.sites, { staleTime: stale });
}

export function useUsers() {
  return useAuthenticatedQuery(["admin", "users"], api.users, { staleTime: stale });
}

/** 로그인 화면 — Public API (JWT 불필요) */
export function useAuthUsers() {
  return useQuery({ queryKey: ["auth", "users"], queryFn: api.authUsers, staleTime: 60_000 });
}

export function useCommonCodes() {
  return useAuthenticatedQuery(["admin", "codes"], api.commonCodes, { staleTime: stale });
}

/** 특정 공통코드 그룹(main_code)의 항목을 반환한다. 드롭다운 필터 옵션 동적 로딩용. */
export function useEnumCodes(group: string) {
  return useAuthenticatedQuery(
    ["admin", "codes", group],
    () => api.enumCodes(group),
    { staleTime: 300_000 },
  );
}

export function useNotificationChannels() {
  return useAuthenticatedQuery(["settings", "notifications"], api.notificationChannels, { staleTime: stale });
}

export function useFirmwareConfigs() {
  return useAuthenticatedQuery(["firmware", "configs"], api.firmwareConfigs, { staleTime: stale });
}

export function useIotThings() {
  return useAuthenticatedQuery(["iot", "things"], api.iotThings, { staleTime: stale });
}

export function useYieldRecords() {
  return useAuthenticatedQuery(["inspection", "yields"], api.yieldRecords, { staleTime: stale });
}

export function useAlgorithms() {
  return useAuthenticatedQuery(["inspection", "algorithms"], api.algorithms, { staleTime: stale });
}

export function useReports() {
  return useAuthenticatedQuery(["reports"], api.reports, { staleTime: stale });
}

export function useRemoteDiagnostics() {
  return useAuthenticatedQuery(["remote", "diagnostics"], api.remoteDiagnostics, { staleTime: stale });
}

export function useAuthConfig() {
  return useQuery({ queryKey: ["auth", "config"], queryFn: api.authConfig, staleTime: 60_000 });
}

export function useEquipmentLogs(category?: string) {
  const { user, ready } = useAuth();
  const hasToken = Boolean(loadAccessToken());

  return useQuery({
    queryKey: ["equipment-logs", category ?? "all"],
    queryFn: () => api.equipmentLogs(category),
    staleTime: stale,
    enabled: ready && Boolean(user) && hasToken,
  });
}

export function useSlaDefinitions() {
  return useAuthenticatedQuery(["sla", "definitions"], api.slaDefinitions, { staleTime: stale });
}

export function useSlaSnapshots() {
  return useAuthenticatedQuery(["sla", "snapshots"], api.slaSnapshots, { staleTime: stale });
}
