"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Alert,
  Box,
  Chip,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import AssignmentIcon from "@mui/icons-material/Assignment";
import HistoryIcon from "@mui/icons-material/History";
import MemoryIcon from "@mui/icons-material/Memory";
import BiotechIcon from "@mui/icons-material/Biotech";
import { AgDataGrid } from "@/components/grid/AgDataGrid";
import { PageToolbar } from "@/components/ui/PageComponents";
import { DataScopeBadge } from "@/components/ui/DataScopeBadge";
import { PrimaryButton, StatGrid } from "@/components/ui/mui-primitives";
import { QueryToolbar } from "@/components/ui/QueryToolbar";
import { useQueryState } from "@/hooks/useQueryState";
import { bindSearchFields } from "@/lib/grid/bind-search-fields";
import { createKeysetFetcher, countFilteredRows } from "@/lib/grid/keyset-fetch";
import {
  ALARM_QUICK_FILTERS,
  alarmOpsStats,
  matchesAlarmQuickFilter,
  type AlarmQuickFilter,
} from "@/lib/alarm-ops";
import { combineAnd, matchesDateRange, matchesIndexedFields, matchesSelectFilter } from "@/lib/grid/query-filter";
import { batchAlarms, batchOperationalMeta } from "@/lib/data/batch";
import { useLocale } from "@/contexts/LocaleContext";
import type { TranslationKey } from "@/lib/locale";
import { localeLabel } from "@/lib/locale/types";
import { SEARCH_FIELD_LABELS } from "@/lib/locale/search-fields";
import { localizeDomainValue } from "@/lib/locale/domain-labels";
import type { Alarm } from "@/lib/types";

const INITIAL_SEARCH = { equipmentSn: "", message: "", ruleName: "" };

const QUICK_FILTER_KEYS: Record<AlarmQuickFilter, TranslationKey> = {
  all: "alarms.quickFilter.all" as TranslationKey,
  unacked_critical: "alarms.quickFilter.unackedCritical" as TranslationKey,
  unacked: "alarms.quickFilter.unacked" as TranslationKey,
  no_ticket: "alarms.quickFilter.noTicket" as TranslationKey,
  remote_pending: "alarms.quickFilter.remotePending" as TranslationKey,
};

export default function AlarmsPage() {
  const { translate, language, formatAsOf } = useLocale();
  const [quickFilter, setQuickFilter] = useState<AlarmQuickFilter>("all");
  const query = useQueryState(INITIAL_SEARCH, { severity: "전체", ack: "전체" });

  const searchDefs = useMemo(
    () => [
      { id: "equipmentSn", label: localeLabel(SEARCH_FIELD_LABELS.equipmentSn, language), indexKey: "equipment_sn" },
      { id: "message", label: localeLabel(SEARCH_FIELD_LABELS.message, language), indexKey: "message" },
      { id: "ruleName", label: localeLabel(SEARCH_FIELD_LABELS.ruleName, language), indexKey: "rule_name" },
    ],
    [language],
  );

  const severityFilterOptions = useMemo(
    () => [
      { value: "critical", label: localizeDomainValue("critical", language) },
      { value: "warning", label: localizeDomainValue("warning", language) },
    ],
    [language],
  );

  const ackFilterOptions = useMemo(
    () => [
      { value: "미확인", label: translate("alarms.filter.unacked" as TranslationKey) },
      { value: "확인", label: translate("alarms.filter.acked" as TranslationKey) },
    ],
    [translate],
  );

  const opsStats = useMemo(() => alarmOpsStats(batchAlarms), []);

  const statItems = useMemo(
    () => [
      { label: translate("alarms.stat.total" as TranslationKey), value: opsStats.total, variant: "info" as const },
      {
        label: "Critical",
        value: opsStats.critical,
        variant: "danger" as const,
        sub: translate("alarms.stat.criticalSub" as TranslationKey),
      },
      {
        label: translate("alarms.stat.unacked" as TranslationKey),
        value: opsStats.unacked,
        variant: "warning" as const,
        sub: translate("alarms.stat.unackedSub" as TranslationKey),
      },
      {
        label: translate("alarms.stat.withTicket" as TranslationKey),
        value: opsStats.withTicket,
        variant: "default" as const,
        sub: translate("alarms.stat.withTicketSub" as TranslationKey),
      },
    ],
    [translate, opsStats],
  );

  const filterFn = useMemo(() => {
    const { from, to } = query.applied.dateRange;
    return (a: Alarm) => {
      const matchAck =
        query.applied.select.ack === "전체" ||
        (query.applied.select.ack === "미확인" ? !a.acknowledged : a.acknowledged);
      return combineAnd(
        matchesAlarmQuickFilter(a, quickFilter),
        matchesDateRange(from, to, a.triggeredAt),
        matchesIndexedFields(query.applied.search, {
          equipmentSn: a.equipmentSn,
          message: a.message,
          ruleName: a.ruleName,
        }),
        matchesSelectFilter(query.applied.select.severity, a.severity),
        matchAck,
      );
    };
  }, [query.applied, quickFilter]);

  const fetchRows = useMemo(
    () => createKeysetFetcher(batchAlarms, { idField: "id", filterFn }),
    [filterFn],
  );

  const resultCount = countFilteredRows(batchAlarms, filterFn);
  const activeQuickMeta = ALARM_QUICK_FILTERS.find((f) => f.id === quickFilter);
  const localeTag = language === "en" ? "en-US" : "ko-KR";
  const batchAsOf = formatAsOf(batchOperationalMeta.asOf);

  const applyQuickFilter = (next: AlarmQuickFilter) => {
    setQuickFilter(next);
    if (next === "all") {
      query.applyFilters({ severity: "전체", ack: "전체" });
      return;
    }
    if (next === "unacked_critical") {
      query.applyFilters({ severity: "critical", ack: "미확인" });
      return;
    }
    if (next === "unacked") {
      query.applyFilters({ severity: "전체", ack: "미확인" });
      return;
    }
    query.applyFilters({ severity: "전체", ack: "전체" });
  };

  const gridSubtitle =
    activeQuickMeta && quickFilter !== "all"
      ? `${translate(`alarms.quickFilter.${quickFilter}.desc` as TranslationKey)} · ${resultCount.toLocaleString(localeTag)}${translate("common.countSuffix" as TranslationKey)}`
      : `${translate("alarms.grid.batchSub" as TranslationKey).replace("{asOf}", batchAsOf)} · ${resultCount.toLocaleString(localeTag)}${translate("common.countSuffix" as TranslationKey)}`;

  return (
    <Box>
      <PageToolbar>
        <DataScopeBadge meta={batchOperationalMeta} />
        <PrimaryButton href="/remote-diagnosis" variant="outlined" menuId="remote-diagnosis" perm="view" startIcon={<BiotechIcon fontSize="small" />}>
          {translate("remoteDiagnosis.nav.label" as TranslationKey)}
        </PrimaryButton>
        <PrimaryButton href="/remote-control" variant="outlined" menuId="remote-control" perm="view" startIcon={<MemoryIcon fontSize="small" />}>
          {translate("alarms.toolbar.remoteControl" as TranslationKey)}
        </PrimaryButton>
        <PrimaryButton href="/service-tickets" variant="outlined" menuId="service-tickets" perm="view" startIcon={<AssignmentIcon fontSize="small" />}>
          {translate("alarms.toolbar.serviceTickets" as TranslationKey)}
        </PrimaryButton>
        <PrimaryButton href="/alarm-rules" menuId="alarm-rules" perm="view">
          {translate("alarms.toolbar.rules" as TranslationKey)}
        </PrimaryButton>
      </PageToolbar>

      {opsStats.unackedCritical > 0 && (
        <Alert severity="error" sx={{ mb: 1.5, borderRadius: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            {translate("alarms.alert.unackedCritical" as TranslationKey).replace(
              "{count}",
              String(opsStats.unackedCritical),
            )}
          </Typography>
          {opsStats.oldestUnackedCriticalAt && (
            <Typography variant="caption" component="div" sx={{ mt: 0.25 }}>
              {translate("alarms.alert.oldestUnacked" as TranslationKey)}{" "}
              {opsStats.oldestUnackedCriticalAt.replace("T", " ").slice(0, 19)}
            </Typography>
          )}
        </Alert>
      )}

      <Paper variant="outlined" sx={{ p: 1.5, mb: 1.5, borderRadius: 2 }}>
        <Stack spacing={1.25}>
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <HistoryIcon fontSize="small" color="action" />
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.35 }}>
                {translate("alarms.workflow.title" as TranslationKey)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {translate("alarms.workflow.caption" as TranslationKey)}
              </Typography>
            </Box>
          </Stack>
          <Stack direction="row" spacing={0.75} sx={{ flexWrap: "wrap", gap: 0.75 }}>
            {ALARM_QUICK_FILTERS.map((item) => {
              const active = quickFilter === item.id;
              const count =
                item.id === "all"
                  ? opsStats.total
                  : batchAlarms.filter((a) => matchesAlarmQuickFilter(a, item.id)).length;
              const color =
                item.id === "unacked_critical"
                  ? "error"
                  : item.id === "unacked"
                    ? "warning"
                    : "default";
              return (
                <Chip
                  key={item.id}
                  size="small"
                  label={`${translate(QUICK_FILTER_KEYS[item.id])} (${count})`}
                  variant={active ? "filled" : "outlined"}
                  color={active && item.id !== "all" ? color : "default"}
                  onClick={() => applyQuickFilter(item.id)}
                />
              );
            })}
          </Stack>
        </Stack>
      </Paper>

      <StatGrid items={statItems} />

      <QueryToolbar
        searchFields={bindSearchFields(searchDefs, query.search, query.setSearch)}
        filters={[
          {
            id: "severity",
            label: translate("filter.severity" as TranslationKey),
            value: query.selects.severity ?? "전체",
            options: severityFilterOptions,
            includeAll: false,
            onChange: (v) => query.applyFilter("severity", v),
          },
          {
            id: "ack",
            label: translate("filter.ack" as TranslationKey),
            value: query.selects.ack ?? "전체",
            options: ackFilterOptions,
            includeAll: false,
            onChange: (v) => query.applyFilter("ack", v),
          },
        ]}
        dateRange={query.dateRange}
        onDateRangeChange={query.setDateRange}
        onDatePreset={query.applyDatePreset}
        dateFromLabel={translate("alarms.date.from" as TranslationKey)}
        dateToLabel={translate("alarms.date.to" as TranslationKey)}
        onSearch={query.apply}
        onReset={() => {
          setQuickFilter("all");
          query.reset();
        }}
        resultCount={resultCount}
      />

      <AgDataGrid
        key={`alarms-${quickFilter}-${query.refreshKey}`}
        gridId="alarms-list"
        title={translate("alarms.grid.title" as TranslationKey)}
        subtitle={gridSubtitle}
        fetchRows={fetchRows}
        columnSet="alarm"
        refreshKey={`${query.refreshKey}-${quickFilter}`}
      />

      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
        {translate("alarms.footer.hint" as TranslationKey)}{" "}
        <Typography component={Link} href="/equipment-logs" variant="caption" sx={{ fontWeight: 600 }}>
          {translate("alarms.footer.equipmentLogs" as TranslationKey)}
        </Typography>
        {" · "}
        {translate("alarms.footer.metricStream" as TranslationKey)}{" "}
        <Typography component={Link} href="/metric-stream#event" variant="caption" sx={{ fontWeight: 600 }}>
          {translate("alarms.footer.eventMetrics" as TranslationKey)}
        </Typography>
      </Typography>
    </Box>
  );
}
