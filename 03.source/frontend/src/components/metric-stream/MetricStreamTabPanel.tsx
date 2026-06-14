"use client";

import { useMemo } from "react";
import {
  Alert,
  Box,
  Chip,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";
import { MetricStreamChart } from "@/components/charts/MetricStreamChart";
import { SectionCard } from "@/components/ui/PageComponents";
import type { MetricStreamTabId } from "@/lib/metric-stream-tabs";
import type { MetricLogEntry } from "@/lib/types";

function formatTime(iso: string): string {
  return iso.replace("T", " ").slice(11, 19);
}

function eventSeverity(metric: string, value: string): "error" | "warning" | "info" {
  if (metric.includes("alarm") || value === "alarm" || value.includes("threshold")) return "error";
  if (value === "offline" || value === "safe_mode") return "warning";
  return "info";
}

function PeriodicPanel({ rows }: { rows: MetricLogEntry[] }) {
  const kvAvg = useMemo(() => {
    const vals = rows.filter((r) => r.metric === "tube.kv").map((r) => Number(r.value));
    if (!vals.length) return null;
    return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1);
  }, [rows]);

  const maxTemp = useMemo(() => {
    const vals = rows.filter((r) => r.metric === "detector.temp").map((r) => Number(r.value));
    return vals.length ? Math.max(...vals).toFixed(1) : null;
  }, [rows]);

  return (
    <Stack spacing={2} sx={{ mb: 2.5 }}>
      <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
        {kvAvg != null && <Chip label={`tube.kv 평균 ${kvAvg} kV`} size="small" color="info" variant="outlined" />}
        {maxTemp != null && <Chip label={`detector.temp 최고 ${maxTemp} °C`} size="small" color="warning" variant="outlined" />}
        <Chip label={`주기 메트릭 ${rows.length}건`} size="small" variant="outlined" />
      </Stack>
      <SectionCard title="실시간 추이">
        <MetricStreamChart entries={rows} />
      </SectionCard>
    </Stack>
  );
}

function EventPanel({ rows }: { rows: MetricLogEntry[] }) {
  const recent = rows.slice(0, 8);

  if (!recent.length) {
    return (
      <Alert severity="info" sx={{ mb: 2.5, borderRadius: 2 }}>
        수신된 이벤트가 없습니다.
      </Alert>
    );
  }

  return (
    <SectionCard title="최근 이벤트" sx={{ mb: 2.5 }}>
      <Stack spacing={1}>
        {recent.map((row) => (
          <Alert
            key={row.id}
            severity={eventSeverity(row.metric, row.value)}
            variant="outlined"
            sx={{ py: 0.25, "& .MuiAlert-message": { width: "100%" } }}
          >
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1}
              sx={{ justifyContent: "space-between", alignItems: { sm: "center" } }}
            >
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {row.serialNo} · {row.metric}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {row.value}
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontFamily: "monospace" }}>
                {formatTime(row.receivedAt)}
              </Typography>
            </Stack>
          </Alert>
        ))}
      </Stack>
    </SectionCard>
  );
}

function FirmwarePanel({ rows }: { rows: MetricLogEntry[] }) {
  const otaRows = useMemo(
    () => rows.filter((r) => r.metric === "ota.progress").slice(0, 6),
    [rows],
  );
  const versions = useMemo(() => {
    const map = new Map<string, string>();
    rows
      .filter((r) => r.metric === "firmware.version")
      .forEach((r) => map.set(r.serialNo, r.value));
    return [...map.entries()];
  }, [rows]);

  return (
    <SectionCard title="OTA · 펌웨어 현황" sx={{ mb: 2.5 }}>
      <Stack spacing={2}>
        {otaRows.length > 0 ? (
          <Stack spacing={1.5}>
            <Typography variant="overline" color="text.secondary">
              OTA 진행 중
            </Typography>
            {otaRows.map((row) => {
              const pct = Math.min(100, Math.max(0, Number(row.value) || 0));
              return (
                <Box key={row.id}>
                  <Stack direction="row" spacing={1} sx={{ justifyContent: "space-between", mb: 0.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {row.serialNo}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {pct}%
                    </Typography>
                  </Stack>
                  <LinearProgress variant="determinate" value={pct} sx={{ height: 8, borderRadius: 1 }} />
                </Box>
              );
            })}
          </Stack>
        ) : (
          <Typography variant="body2" color="text.secondary">
            진행 중인 OTA가 없습니다.
          </Typography>
        )}

        {versions.length > 0 && (
          <Stack spacing={1}>
            <Typography variant="overline" color="text.secondary">
              보고된 펌웨어 버전
            </Typography>
            <Stack direction="row" spacing={0.75} sx={{ flexWrap: "wrap", gap: 0.75 }}>
              {versions.map(([sn, ver]) => (
                <Chip key={sn} label={`${sn} · ${ver}`} size="small" variant="outlined" sx={{ fontFamily: "monospace" }} />
              ))}
            </Stack>
          </Stack>
        )}
      </Stack>
    </SectionCard>
  );
}

function ControlPanel({ rows }: { rows: MetricLogEntry[] }) {
  const byMetric = useMemo(() => {
    const groups: Record<string, MetricLogEntry[]> = {};
    rows.forEach((row) => {
      groups[row.metric] = groups[row.metric] ?? [];
      groups[row.metric].push(row);
    });
    return groups;
  }, [rows]);

  const metrics = ["shadow.desired", "control.kv_set", "control.safe_mode"];

  return (
    <SectionCard title="Shadow · 제어 상태" sx={{ mb: 2.5 }}>
      <Stack spacing={1.5}>
        {metrics.map((metric) => {
          const items = (byMetric[metric] ?? []).slice(0, 4);
          return (
            <Box
              key={metric}
              sx={{
                p: 1.5,
                borderRadius: 2,
                border: 1,
                borderColor: "divider",
                bgcolor: "background.default",
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, fontFamily: "monospace" }}>
                {metric}
              </Typography>
              {items.length === 0 ? (
                <Typography variant="caption" color="text.secondary">
                  최근 수신 없음
                </Typography>
              ) : (
                <Stack spacing={0.75}>
                  {items.map((row) => (
                    <Stack
                      key={row.id}
                      direction="row"
                      spacing={1}
                      sx={{ justifyContent: "space-between", alignItems: "center" }}
                    >
                      <Typography variant="body2">{row.serialNo}</Typography>
                      <Chip
                        label={row.value}
                        size="small"
                        color={row.value === "synced" || row.value === "off" ? "success" : "primary"}
                        variant="outlined"
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ fontFamily: "monospace" }}>
                        {formatTime(row.receivedAt)}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
              )}
            </Box>
          );
        })}
      </Stack>
    </SectionCard>
  );
}

export function MetricStreamTabPanel({ tab, rows }: { tab: MetricStreamTabId; rows: MetricLogEntry[] }) {
  switch (tab) {
    case "periodic":
      return <PeriodicPanel rows={rows} />;
    case "event":
      return <EventPanel rows={rows} />;
    case "firmware":
      return <FirmwarePanel rows={rows} />;
    case "control":
      return <ControlPanel rows={rows} />;
    default:
      return null;
  }
}

export function metricStreamTabStats(tab: MetricStreamTabId, rows: MetricLogEntry[]) {
  const edgeDelayed = rows.filter((r) => !r.edgePublished).length;

  switch (tab) {
    case "periodic": {
      const kv = rows.filter((r) => r.metric === "tube.kv");
      const avg = kv.length
        ? (kv.reduce((s, r) => s + Number(r.value), 0) / kv.length).toFixed(1)
        : "—";
      return [
        { label: "수신 건수", value: rows.length, variant: "info" as const },
        { label: "tube.kv 평균", value: avg, sub: "kV" },
        { label: "Edge 지연", value: edgeDelayed, variant: edgeDelayed > 0 ? ("warning" as const) : ("default" as const) },
      ];
    }
    case "event":
      return [
        { label: "이벤트 건수", value: rows.length, variant: "warning" as const },
        {
          label: "알람 트리거",
          value: rows.filter((r) => r.metric.includes("alarm")).length,
          variant: "danger" as const,
        },
        {
          label: "연결 상태 변경",
          value: rows.filter((r) => r.metric.includes("connectivity")).length,
          variant: "info" as const,
        },
      ];
    case "firmware":
      return [
        { label: "보고 건수", value: rows.length, variant: "success" as const },
        {
          label: "OTA 진행",
          value: rows.filter((r) => r.metric === "ota.progress").length,
          sub: "건",
        },
        {
          label: "버전 보고",
          value: rows.filter((r) => r.metric === "firmware.version").length,
          sub: "건",
        },
      ];
    case "control":
      return [
        { label: "제어 메트릭", value: rows.length, variant: "default" as const },
        {
          label: "Shadow 동기화",
          value: rows.filter((r) => r.metric === "shadow.desired" && r.value === "synced").length,
          variant: "success" as const,
        },
        {
          label: "safe_mode",
          value: rows.filter((r) => r.metric === "control.safe_mode" && r.value !== "off").length,
          variant: "warning" as const,
        },
      ];
  }
}
