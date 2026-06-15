import type {
  Alarm,
  AlarmRule,
  AlgorithmConfig,
  AsRecord,
  CommonCode,
  Customer,
  Engineer,
  Equipment,
  EquipmentLogEntry,
  FirmwareConfig,
  Installation,
  IotThingAuth,
  MetricLogEntry,
  NotificationChannel,
  PartOrder,
  PartSchedule,
  ReportSummary,
  ServiceTicket,
  Site,
  UserAccount,
  YieldRecord,
} from "@/lib/types";
import type { BatchDashboardKpis } from "@/lib/types";
import type { DataSourceMeta } from "@/lib/data/scope";
import { fetchApiEnvelope, fetchJson } from "./client";
import { attachEndpoint, type ApiListResult } from "./scope-meta";

export type ApiDashboardSummary = {
  meta: DataSourceMeta;
  region: string;
  kpis: BatchDashboardKpis;
  recentAlarms: Alarm[];
  fleet: Equipment[];
  openTickets: ServiceTicket[];
  mapAlarms: Alarm[];
  mapTickets: ServiceTicket[];
  charts: {
    fleetStatus: { statuses: string[]; counts: number[]; totalFleet: number };
    ticketStages: { stages: string[]; counts: number[] };
  };
};

export type ApiAlarmTrend = {
  categories: string[];
  critical: number[];
  warning: number[];
};

export type ApiCollectionStats = {
  totalDevices: number;
  onlineDevices: number;
  normalizedToday: number;
  greengrassComponents: number;
};

export type ApiPipelineLive = {
  collections: Record<string, number>;
  cadences: { id: string; enabled: boolean }[];
  asOf: string;
};

export type RemoteDiagnosisFinding = {
  id: string;
  equipmentSn: string;
  code: string;
  severity: string;
  title: string;
  detail: string;
  suggestedAction?: string;
  detectedAt: string;
};

export type SlaDefinition = {
  tier_code: string;
  tier_name: string;
  response_minutes: number;
  resolve_minutes: number;
  uptime_target_pct: number;
  description?: string;
};

async function listWithMeta<T>(path: string): Promise<ApiListResult<T>> {
  const { data, meta } = await fetchApiEnvelope<{ items?: T[] }>(path);
  return { items: data.items ?? [], meta };
}

async function fetchWithMeta<T>(path: string): Promise<{ data: T; meta: DataSourceMeta }> {
  const envelope = await fetchApiEnvelope<T>(path);
  return { data: envelope.data, meta: envelope.meta };
}

export const api = {
  dashboardSummary: async (region = "global") => {
    const qs = region && region !== "global" ? `?region=${encodeURIComponent(region)}` : "";
    const { data: summary, meta } = await fetchApiEnvelope<ApiDashboardSummary>(`/dashboard/summary${qs}`);
    return {
      ...summary,
      meta: attachEndpoint(meta, `/dashboard/summary${qs}`),
    };
  },
  dashboardTrends: () => fetchWithMeta<ApiAlarmTrend>("/dashboard/trends"),
  alarms: () => listWithMeta<Alarm>("/alarms"),
  alarmRules: () => listWithMeta<AlarmRule>("/alarm-rules"),
  pipelineLive: async () => {
    const live = await fetchJson<ApiPipelineLive>("/pipeline/live");
    return {
      ...live,
      meta: attachEndpoint(
        {
          scope: "realtime",
          asOf: live.asOf,
          source: "mongo.collection_counts+yaml:batch-cadence",
          refreshInterval: "10s polling",
        },
        "/pipeline/live",
      ),
    };
  },
  pipelineTiers: () => fetchJson<Record<string, unknown>>("/pipeline/tiers"),
  collectionStats: () => fetchWithMeta<ApiCollectionStats>("/pipeline/collection-stats"),
  equipment: () => listWithMeta<Equipment>("/equipment"),
  fleetLive: () => listWithMeta<Equipment>("/fleet/live"),
  metricStreamLatest: () => listWithMeta<MetricLogEntry>("/metric-stream/latest"),
  serviceTickets: () => listWithMeta<ServiceTicket>("/service/tickets"),
  engineers: () => listWithMeta<Engineer>("/service/engineers"),
  partOrders: () => listWithMeta<PartOrder>("/parts/orders"),
  partSchedules: () => listWithMeta<PartSchedule>("/parts/schedules"),
  installations: () => listWithMeta<Installation>("/installation"),
  asRecords: () => listWithMeta<AsRecord>("/service/as-records"),
  customers: () => listWithMeta<Customer>("/companies"),
  sites: () => listWithMeta<Site>("/sites"),
  users: () => listWithMeta<UserAccount>("/admin/users"),
  authUsers: () => listWithMeta<UserAccount>("/auth/users"),
  authConfig: () =>
    fetchJson<{ provider: "local" | "aws"; cognito?: { region: string; userPoolId: string; clientId: string; enabled: boolean } }>(
      "/auth/config",
    ),
  me: () =>
    fetchJson<{
      user: UserAccount;
      claims: { sub: string; role: string; companyId?: number; branchId?: number; siteId?: number };
    }>("/auth/me"),
  login: (params: { userId?: string; email?: string; password?: string }) =>
    fetchJson<{
      user: UserAccount;
      tokens: {
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
        tokenType: "Bearer";
        idToken?: string;
      };
      provider: "local" | "aws";
    }>("/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    }),
  commonCodes: () => listWithMeta<CommonCode>("/admin/codes"),
  enumCodes: (group: string) => listWithMeta<CommonCode>(`/admin/codes?group=${encodeURIComponent(group)}`),
  notificationChannels: () => listWithMeta<NotificationChannel>("/settings/notification-channels"),
  firmwareConfigs: () => listWithMeta<FirmwareConfig>("/firmware/configs"),
  iotThings: () => listWithMeta<IotThingAuth>("/iot/things"),
  yieldRecords: () => listWithMeta<YieldRecord>("/inspection/yields"),
  algorithms: () => listWithMeta<AlgorithmConfig>("/inspection/algorithms"),
  reports: () => listWithMeta<ReportSummary>("/reports"),
  remoteDiagnostics: () => listWithMeta<RemoteDiagnosisFinding>("/remote/diagnostics"),
  equipmentLogs: (category?: string) =>
    listWithMeta<EquipmentLogEntry>(
      `/equipment-logs${category ? `?category=${encodeURIComponent(category)}` : ""}`,
    ),
  slaSnapshots: () => listWithMeta<Record<string, unknown>>("/sla/snapshots"),
  slaDefinitions: () => listWithMeta<SlaDefinition>("/sla/definitions"),
  remoteControlCommand: (body: {
    equipmentSn: string;
    command: "apply_params" | "safe_mode" | "emg";
    params?: { kv?: number; ma?: number };
  }) =>
    fetchApiEnvelope<{
      requestCode: string;
      equipmentSn: string;
      command: string;
      status: "unresolved" | "pending" | "ack";
    }>("/remote/control/commands", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  runRemoteDiagnosis: (findingId: string) =>
    fetchApiEnvelope<{
      findingId: string;
      equipmentSn: string;
      component: string;
      severity: string;
      messageKey: string;
      actionKey: string;
      metrics: Record<string, string | number>;
      status: string;
      completedAt: string;
    }>(`/remote/diagnostics/${encodeURIComponent(findingId)}/run`, {
      method: "POST",
    }),
};
