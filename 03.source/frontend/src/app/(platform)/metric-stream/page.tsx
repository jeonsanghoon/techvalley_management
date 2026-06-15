"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { HASH_SYNC_EVENT } from "@/lib/route-key";
import {
  Box,
  Button,
  Chip,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import PauseIcon from "@mui/icons-material/Pause";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import { AgDataGrid } from "@/components/grid/AgDataGrid";
import {
  MetricStreamTabPanel,
  metricStreamTabStats,
} from "@/components/metric-stream/MetricStreamTabPanel";
import { PageToolbar } from "@/components/ui/PageComponents";
import { StatGrid } from "@/components/ui/mui-primitives";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { QueryToolbar } from "@/components/ui/QueryToolbar";
import { useQueryState } from "@/hooks/useQueryState";
import { useHashTab } from "@/hooks/useHashTab";
import { bindSearchFields } from "@/lib/grid/bind-search-fields";
import { combineAnd, matchesDateRange, matchesIndexedFields } from "@/lib/grid/query-filter";
import { bindQueryToolbarDate } from "@/lib/grid/query-toolbar-date";
import { DataScopeBadge } from "@/components/ui/DataScopeBadge";
import { fallbackMeta, getListItems, useFleetLive, useMetricStreamLatest } from "@/lib/api/hooks";
import {
  METRIC_STREAM_DEFAULT_TAB,
  METRIC_STREAM_TABS,
  type MetricStreamTabId,
} from "@/lib/metric-stream-tabs";
import { useLocale } from "@/contexts/LocaleContext";
import type { TranslationKey } from "@/lib/locale";
import { localeLabel } from "@/lib/locale/types";
import { SEARCH_FIELD_LABELS } from "@/lib/locale/search-fields";
import type { MetricLogEntry } from "@/lib/types";

const INITIAL_SEARCH = { serialNo: "", metric: "", unit: "" };
const METRIC_STREAM_PATH = "/metric-stream";

export default function MetricStreamPage() {
  const pathname = usePathname();
  const { translate, language } = useLocale();
  const { data: fleetData } = useFleetLive();
  const fleetRows = getListItems(fleetData);
  const dataMeta = fleetData?.meta ?? fallbackMeta("/fleet/live");
  const { data: metricsData } = useMetricStreamLatest();
  const latestMetrics = getListItems(metricsData);
  const query = useQueryState(INITIAL_SEARCH, { equipmentId: "전체" });
  const { tab, setTab } = useHashTab(
    METRIC_STREAM_PATH,
    METRIC_STREAM_TABS.map((item) => ({ id: item.id, hash: item.hash })),
    METRIC_STREAM_DEFAULT_TAB,
  );
  const activeTab = METRIC_STREAM_TABS.find((item) => item.id === tab) ?? METRIC_STREAM_TABS[0];

  useLayoutEffect(() => {
    if (pathname !== METRIC_STREAM_PATH) return;
    if (window.location.hash) return;
    const url = `${METRIC_STREAM_PATH}#${METRIC_STREAM_DEFAULT_TAB}`;
    window.history.replaceState(null, "", url);
    window.dispatchEvent(new Event(HASH_SYNC_EVENT));
  }, [pathname]);

  const [live, setLive] = useState(true);
  const [stream, setStream] = useState<MetricLogEntry[]>([]);

  useEffect(() => {
    if (!latestMetrics.length) return;
    setStream((prev) => {
      const ids = new Set(prev.map((entry) => entry.id));
      const merged = [...latestMetrics.filter((entry) => !ids.has(entry.id)), ...prev];
      return merged.slice(0, 120);
    });
  }, [latestMetrics]);

  const searchDefs = useMemo(
    () => [
      { id: "serialNo", label: localeLabel(SEARCH_FIELD_LABELS.serialNo, language), indexKey: "serial_no" },
      { id: "metric", label: localeLabel(SEARCH_FIELD_LABELS.metric, language), indexKey: "metric" },
      { id: "unit", label: localeLabel(SEARCH_FIELD_LABELS.unit, language), indexKey: "unit" },
    ],
    [language],
  );

  const equipmentFilterOptions = useMemo(
    () => [
      ...fleetRows.slice(0, 12).map((eq) => ({ value: eq.id, label: eq.serialNo })),
    ],
    [fleetRows],
  );

  const equipmentId = query.applied.select.equipmentId ?? "전체";
  const localeTag = language === "en" ? "en-US" : "ko-KR";

  useEffect(() => {
    if (!live || !latestMetrics.length) return;
    const timer = setInterval(() => {
      setStream((prev) => {
        const next = latestMetrics[0];
        if (!next) return prev;
        return [next, ...prev.filter((entry) => entry.id !== next.id)].slice(0, 120);
      });
    }, 2500);
    return () => clearInterval(timer);
  }, [live, latestMetrics]);

  const filterFn = useCallback(
    (m: MetricLogEntry) => {
      const { from, to } = query.applied.dateRange;
      return combineAnd(
        matchesIndexedFields(query.applied.search, {
          serialNo: m.serialNo,
          metric: m.metric,
          unit: m.unit,
        }),
        equipmentId === "전체" || m.equipmentId === equipmentId,
        m.kind === activeTab.kind,
        matchesDateRange(from, to, m.receivedAt),
      );
    },
    [query.applied, equipmentId, activeTab.kind],
  );

  const tabRows = useMemo(() => {
    const ids = new Set(stream.map((s) => s.id));
    const merged = [...stream, ...latestMetrics.filter((m) => !ids.has(m.id))];
    return merged.filter(filterFn).sort((a, b) => b.receivedAt.localeCompare(a.receivedAt));
  }, [stream, latestMetrics, filterFn]);

  const tabCounts = useMemo(() => {
    const { from, to } = query.applied.dateRange;
    const ids = new Set(stream.map((s) => s.id));
    const merged = [...stream, ...latestMetrics.filter((m) => !ids.has(m.id))];
    const base = merged.filter((m) =>
      combineAnd(
        matchesIndexedFields(query.applied.search, {
          serialNo: m.serialNo,
          metric: m.metric,
          unit: m.unit,
        }),
        equipmentId === "전체" || m.equipmentId === equipmentId,
        matchesDateRange(from, to, m.receivedAt),
      ),
    );
    return Object.fromEntries(
      METRIC_STREAM_TABS.map((item) => [item.id, base.filter((m) => m.kind === item.kind).length]),
    ) as Record<MetricStreamTabId, number>;
  }, [stream, latestMetrics, query.applied, equipmentId]);

  const tabStats = useMemo(() => metricStreamTabStats(tab, tabRows), [tab, tabRows]);

  const handleTabChange = (_: React.SyntheticEvent, next: MetricStreamTabId) => {
    setTab(next);
  };

  const gridTitle = translate(`metricStream.tab.${tab}.gridTitle` as TranslationKey);
  const gridSubtitle = translate(`metricStream.tab.${tab}.gridSubtitle` as TranslationKey);

  return (
    <Box>
      <PageToolbar>
        <DataScopeBadge meta={dataMeta} />
        <Chip
          icon={
            <FiberManualRecordIcon
              fontSize="small"
              sx={{ color: live ? "error.main" : "grey.400" }}
            />
          }
          label={live ? "LIVE" : "PAUSED"}
          size="small"
          color={live ? "error" : "default"}
          variant="outlined"
        />
        <PermissionGate menuId="metric-stream" action="execute">
          <Button
            size="small"
            variant="outlined"
            startIcon={live ? <PauseIcon fontSize="small" /> : <PlayArrowIcon fontSize="small" />}
            onClick={() => setLive((v) => !v)}
          >
            {live ? translate("metricStream.action.pause" as TranslationKey) : translate("metricStream.action.resume" as TranslationKey)}
          </Button>
        </PermissionGate>
      </PageToolbar>

      <PaperLikeTabs tab={tab} onChange={handleTabChange} counts={tabCounts} translate={translate} localeTag={localeTag} />

      <QueryToolbar
        searchFields={bindSearchFields(searchDefs, query.search, query.setSearch)}
        {...bindQueryToolbarDate(query, translate)}
        filters={[
          {
            id: "equipmentId",
            label: translate("filter.equipment" as TranslationKey),
            value: query.selects.equipmentId ?? "전체",
            options: equipmentFilterOptions,
            onChange: (v) => query.applyFilter("equipmentId", v),
          },
        ]}
        onSearch={query.apply}
        onReset={query.reset}
        dataScope="realtime"
      />

      <StatGrid items={tabStats} />

      <MetricStreamTabPanel tab={tab} rows={tabRows} />

      <AgDataGrid
        key={`metric-${tab}-${query.refreshKey}`}
        title={gridTitle}
        subtitle={gridSubtitle}
        rowData={tabRows}
        rowModel="client"
        columnSet={activeTab.columnSet}
        refreshKey={`${tab}-${query.refreshKey}`}
        autoHeight={false}
        enableRowSelection={false}
        menuId="metric-stream"
        dataScope="realtime"
      />
    </Box>
  );
}

function PaperLikeTabs({
  tab,
  onChange,
  counts,
  translate,
  localeTag,
}: {
  tab: MetricStreamTabId;
  onChange: (event: React.SyntheticEvent, value: MetricStreamTabId) => void;
  counts: Record<MetricStreamTabId, number>;
  translate: (key: TranslationKey) => string;
  localeTag: string;
}) {
  return (
    <Box
      sx={{
        mb: 2,
        borderBottom: 1,
        borderColor: "divider",
        bgcolor: "background.paper",
        borderRadius: "8px 8px 0 0",
        px: 1,
      }}
    >
      <Tabs
        value={tab}
        onChange={onChange}
        variant="scrollable"
        scrollButtons="auto"
        aria-label={translate("metricStream.tabs.aria" as TranslationKey)}
        sx={{
          minHeight: 44,
          "& .MuiTab-root": { minHeight: 44, py: 1.25, textTransform: "none", fontWeight: 600 },
        }}
      >
        {METRIC_STREAM_TABS.map((item) => (
          <Tab
            key={item.id}
            value={item.id}
            label={
              <Stack direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
                <span>{translate(`metricStream.tab.${item.id}.label` as TranslationKey)}</span>
                <Typography component="span" variant="caption" color="text.secondary">
                  ({counts[item.id].toLocaleString(localeTag)})
                </Typography>
              </Stack>
            }
          />
        ))}
      </Tabs>
    </Box>
  );
}
