import { equipments } from "@/lib/mock-data";
import type { MetricKind, MetricLogEntry } from "@/lib/types";
import { REALTIME_SOURCES, type DataSourceMeta } from "../scope";

export const realtimeMetricMeta: DataSourceMeta = {
  scope: "realtime",
  asOf: new Date().toISOString(),
  source: REALTIME_SOURCES.metricStream,
  refreshInterval: "Kinesis 스트림 (WebSocket/MQTT)",
};

const METRIC_DEFS: {
  kind: MetricKind;
  metric: string;
  unit: string;
  gen: (eq: (typeof equipments)[0]) => string;
}[] = [
  { kind: "주기", metric: "tube.kv", unit: "kV", gen: (eq) => (eq.status === "alarm" ? "185" : "160") },
  { kind: "주기", metric: "tube.ma", unit: "mA", gen: (eq) => (eq.status === "alarm" ? "4.2" : "3.5") },
  { kind: "주기", metric: "detector.temp", unit: "°C", gen: (eq) => (eq.status === "alarm" ? "48.5" : "38.2") },
  { kind: "주기", metric: "body.temp", unit: "°C", gen: () => "42.1" },
  { kind: "주기", metric: "yield.pct", unit: "%", gen: (eq) => (eq.status === "alarm" ? "87.2" : "96.5") },
  { kind: "이벤트", metric: "connectivity.status", unit: "", gen: (eq) => eq.status },
  { kind: "이벤트", metric: "alarm.triggered", unit: "", gen: () => "tube.kv_threshold" },
  { kind: "펌웨어", metric: "ota.progress", unit: "%", gen: () => String(20 + Math.floor(Math.random() * 60)) },
  { kind: "펌웨어", metric: "firmware.version", unit: "", gen: (eq) => eq.firmwareVersion },
  { kind: "제어", metric: "control.kv_set", unit: "kV", gen: () => "160" },
  { kind: "제어", metric: "control.safe_mode", unit: "", gen: () => "off" },
  { kind: "제어", metric: "shadow.desired", unit: "", gen: () => "synced" },
];

function isoOffset(minutesAgo: number): string {
  const d = new Date("2026-06-06T14:30:00+09:00");
  d.setMinutes(d.getMinutes() - minutesAgo);
  return d.toISOString().replace("Z", "+09:00").replace(".000", "");
}

function buildRealtimeMetricSeed(): MetricLogEntry[] {
  const logs: MetricLogEntry[] = [];
  let seq = 1;

  equipments.slice(0, 8).forEach((eq, eqIdx) => {
    METRIC_DEFS.forEach((def, defIdx) => {
      const value = def.gen(eq);
      logs.push({
        id: `mlog-${String(seq++).padStart(5, "0")}`,
        equipmentId: eq.id,
        serialNo: eq.serialNo,
        kind: def.kind,
        metric: def.metric,
        value,
        unit: def.unit || undefined,
        previousValue: def.kind === "주기" ? String(Number(value) - 1) : undefined,
        receivedAt: isoOffset(eqIdx * 2 + defIdx),
        edgePublished: eq.status !== "offline",
      });
    });
  });

  return logs.sort((a, b) => b.receivedAt.localeCompare(a.receivedAt));
}

/** 스트림 연결 전 버퍼에 남아 있는 Hot Tier 시드 */
export const realtimeMetricSeed = buildRealtimeMetricSeed();

/** Kinesis 수신 시뮬레이션 — 새 메트릭 1건 (kind 지정 시 해당 탭 메트릭만) */
export function generateLiveMetric(equipmentId?: string, kind?: MetricKind): MetricLogEntry {
  const eq = equipmentId
    ? equipments.find((e) => e.id === equipmentId) ?? equipments[0]
    : equipments[Math.floor(Math.random() * Math.min(6, equipments.length))];
  const pool = kind ? METRIC_DEFS.filter((d) => d.kind === kind) : METRIC_DEFS;
  const def = pool[Math.floor(Math.random() * pool.length)] ?? METRIC_DEFS[0];
  const value = def.gen(eq);

  return {
    id: `mlog-live-${Date.now()}`,
    equipmentId: eq.id,
    serialNo: eq.serialNo,
    kind: def.kind,
    metric: def.metric,
    value,
    unit: def.unit || undefined,
    previousValue: def.kind === "주기" ? String(Number(value) - (Math.random() > 0.5 ? 1 : 0)) : undefined,
    receivedAt: new Date().toISOString(),
    edgePublished: eq.status !== "offline",
  };
}
