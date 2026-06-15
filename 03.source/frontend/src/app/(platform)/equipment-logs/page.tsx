"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import BoltIcon from "@mui/icons-material/Bolt";
import CloseIcon from "@mui/icons-material/Close";
import HistoryIcon from "@mui/icons-material/History";
import { AgDataGrid } from "@/components/grid/AgDataGrid";
import { PageToolbar, StatusBadge } from "@/components/ui/PageComponents";
import { QueryToolbar } from "@/components/ui/QueryToolbar";
import { PrimaryButton } from "@/components/ui/mui-primitives";
import { useQueryState } from "@/hooks/useQueryState";
import { bindSearchFields } from "@/lib/grid/bind-search-fields";
import { createKeysetFetcher, countFilteredRows } from "@/lib/grid/keyset-fetch";
import { combineAnd, matchesDateRange, matchesIndexedFields, matchesSelectFilter } from "@/lib/grid/query-filter";
import { DataScopeBadge } from "@/components/ui/DataScopeBadge";
import {
  buildEquipmentLogsHref,
  EQUIPMENT_LOG_CATEGORIES,
  parseEquipmentLogsSearchParams,
} from "@/lib/equipment-log-nav";
import { fallbackMeta, getListItems, useEquipment, useEquipmentLogs } from "@/lib/api/hooks";
import { useLocale } from "@/contexts/LocaleContext";
import type { TranslationKey } from "@/lib/locale";
import { localeLabel } from "@/lib/locale/types";
import { SEARCH_FIELD_LABELS } from "@/lib/locale/search-fields";
import { localizeDomainValue } from "@/lib/locale/domain-labels";
import type { EquipmentLogEntry, LogCategory } from "@/lib/types";
import { EMPTY_DATE_RANGE, presetToRange, type DateRangePreset } from "@/lib/ui/date-range";

const LEVELS = ["전체", "INFO", "WARN", "ERROR"] as const;

const BACKEND_LOG_CATEGORIES = new Set<LogCategory>(["튜브", "디텍터", "본체", "원격제어", "펌웨어", "감사"]);

const INITIAL_SEARCH = { message: "", source: "", payload: "" };

const DEFAULT_CATEGORY: LogCategory = "튜브";

function countByCategory(logs: EquipmentLogEntry[], equipmentId: string): Record<LogCategory, number> {
  return Object.fromEntries(
    EQUIPMENT_LOG_CATEGORIES.map((cat) => [
      cat,
      logs.filter((l) => l.equipmentId === equipmentId && l.category === cat).length,
    ]),
  ) as Record<LogCategory, number>;
}

function countByLevel(
  logs: EquipmentLogEntry[],
  equipmentId: string,
  category: LogCategory,
  from: string,
  to: string,
): Record<(typeof LEVELS)[number], number> {
  const base = logs.filter(
    (l) =>
      l.equipmentId === equipmentId &&
      l.category === category &&
      matchesDateRange(from, to, l.occurredAt),
  );
  return {
    전체: base.length,
    INFO: base.filter((l) => l.level === "INFO").length,
    WARN: base.filter((l) => l.level === "WARN").length,
    ERROR: base.filter((l) => l.level === "ERROR").length,
  };
}

export default function EquipmentLogsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { translate, language } = useLocale();
  const { data: fleetData } = useEquipment();
  const fleetRows = getListItems(fleetData);
  const dataMeta = fleetData?.meta ?? fallbackMeta("/equipment");
  const urlState = useMemo(() => parseEquipmentLogsSearchParams(searchParams), [searchParams]);

  const defaultEquipmentId = fleetRows[0]?.id ?? "";
  const [equipmentId, setEquipmentId] = useState(
    urlState.equipmentId && fleetRows.some((e) => e.id === urlState.equipmentId)
      ? urlState.equipmentId
      : defaultEquipmentId,
  );
  const [category, setCategory] = useState<LogCategory>(urlState.category ?? DEFAULT_CATEGORY);

  const logCategoryParam = BACKEND_LOG_CATEGORIES.has(category) ? category : undefined;
  const { data: logData } = useEquipmentLogs(logCategoryParam);
  const logRows = getListItems(logData);
  const query = useQueryState(INITIAL_SEARCH, { level: "전체" }, urlState.dateRange);

  const searchDefs = useMemo(
    () => [
      { id: "message", label: localeLabel(SEARCH_FIELD_LABELS.message, language), indexKey: "message" },
      { id: "source", label: translate("search.source" as TranslationKey), indexKey: "source" },
      { id: "payload", label: translate("search.payload" as TranslationKey), indexKey: "payload" },
    ],
    [language, translate],
  );

  const infoChips = useMemo(
    () => [
      translate("equipmentLogs.chip.singleEquipment" as TranslationKey),
      translate("equipmentLogs.chip.categoryTabs" as TranslationKey),
      translate("equipmentLogs.chip.alarmAnchor" as TranslationKey),
    ],
    [translate],
  );

  const selectedEq = fleetRows.find((e) => e.id === equipmentId) ?? fleetRows[0];
  const categoryCounts = useMemo(() => countByCategory(logRows, equipmentId), [logRows, equipmentId]);
  const levelCounts = useMemo(
    () =>
      countByLevel(
        logRows,
        equipmentId,
        category,
        query.applied.dateRange.from,
        query.applied.dateRange.to,
      ),
    [logRows, equipmentId, category, query.applied.dateRange],
  );

  const localeTag = language === "en" ? "en-US" : "ko-KR";

  const syncUrl = useCallback(
    (next: { equipmentId: string; category: LogCategory; from?: string; to?: string; anchorAt?: string | null }) => {
      const from = next.from ?? query.applied.dateRange.from;
      const to = next.to ?? query.applied.dateRange.to;
      const anchorAt =
        next.anchorAt === null ? undefined : (next.anchorAt ?? urlState.anchorAt ?? undefined);
      const href = buildEquipmentLogsHref({
        equipmentId: next.equipmentId,
        category: next.category,
        from,
        to,
        anchorAt,
      });
      router.replace(href, { scroll: false });
    },
    [router, query.applied.dateRange, urlState.anchorAt],
  );

  useEffect(() => {
    if (urlState.equipmentId && fleetRows.some((e) => e.id === urlState.equipmentId)) {
      setEquipmentId(urlState.equipmentId);
    }
    if (urlState.category) {
      setCategory(urlState.category);
    }
    if (urlState.dateRange.from || urlState.dateRange.to) {
      query.setDateRange(urlState.dateRange);
      query.apply();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- URL 진입 시 1회 동기화
  }, [urlState.equipmentId, urlState.category, urlState.dateRange.from, urlState.dateRange.to, fleetRows]);

  useEffect(() => {
    if (!equipmentId && fleetRows[0]?.id) {
      setEquipmentId(fleetRows[0].id);
    }
  }, [equipmentId, fleetRows]);

  const filterFn = useMemo(() => {
    const { from, to } = query.applied.dateRange;
    return (log: EquipmentLogEntry) =>
      combineAnd(
        log.equipmentId === equipmentId,
        log.category === category,
        matchesDateRange(from, to, log.occurredAt),
        matchesIndexedFields(query.applied.search, {
          message: log.message,
          source: log.source,
          payload: log.payload,
        }),
        matchesSelectFilter(query.applied.select.level, log.level),
      );
  }, [equipmentId, category, query.applied]);

  const fetchRows = useMemo(
    () => createKeysetFetcher(logRows, { idField: "id", filterFn }),
    [filterFn, logRows],
  );

  const handleEquipmentChange = (nextId: string) => {
    setEquipmentId(nextId);
    query.reset();
    syncUrl({ equipmentId: nextId, category, from: "", to: "", anchorAt: null });
  };

  const handleCategoryChange = (_: React.SyntheticEvent, next: LogCategory) => {
    setCategory(next);
    syncUrl({ equipmentId, category: next });
  };

  const handleDatePreset = (preset: DateRangePreset) => {
    query.applyDatePreset(preset);
    const next = preset === "all" ? EMPTY_DATE_RANGE : presetToRange(preset);
    syncUrl({ equipmentId, category, from: next.from, to: next.to, anchorAt: null });
  };

  const handleSearchApply = () => {
    query.apply();
    syncUrl({
      equipmentId,
      category,
      from: query.dateRange.from,
      to: query.dateRange.to,
      anchorAt: null,
    });
  };

  const handleLevelChip = (level: (typeof LEVELS)[number]) => {
    query.applyFilter("level", level);
  };

  const clearAnchorContext = () => {
    query.applyDateRange({ from: "", to: "" });
    syncUrl({ equipmentId, category, from: "", to: "", anchorAt: null });
  };

  const resultCount = countFilteredRows(logRows, filterFn);
  const categoryLabel = translate(`equipmentLogs.category.${category}` as TranslationKey);

  const gridSubtitle = query.applied.dateRange.from
    ? `${query.applied.dateRange.from} ~ ${query.applied.dateRange.to} · ${resultCount.toLocaleString(localeTag)}${translate("common.countSuffix" as TranslationKey)}`
    : translate("equipmentLogs.grid.allPeriodSub" as TranslationKey)
        .replace("{count}", categoryCounts[category].toLocaleString(localeTag));

  return (
    <Box>
      <PageToolbar>
        <DataScopeBadge meta={dataMeta} />
        <PrimaryButton href="/metric-stream#event" variant="outlined" menuId="metric-stream-event" perm="view" startIcon={<BoltIcon fontSize="small" />}>
          {translate("equipmentLogs.toolbar.metricStream" as TranslationKey)}
        </PrimaryButton>
      </PageToolbar>

      <Paper variant="outlined" sx={{ p: 1.5, mb: 1.5, borderRadius: 2, bgcolor: "background.paper" }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} sx={{ alignItems: { md: "center" } }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexShrink: 0 }}>
            <HistoryIcon fontSize="small" color="action" />
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.35 }}>
                {translate("equipmentLogs.banner.title" as TranslationKey)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {translate("equipmentLogs.banner.caption" as TranslationKey)}
              </Typography>
            </Box>
          </Stack>
          <Divider flexItem orientation="vertical" sx={{ display: { xs: "none", md: "block" } }} />
          <Stack direction="row" spacing={0.75} sx={{ flexWrap: "wrap", gap: 0.75 }}>
            {infoChips.map((label) => (
              <Chip key={label} size="small" label={label} variant="outlined" />
            ))}
          </Stack>
        </Stack>
      </Paper>

      {urlState.anchorAt && (query.applied.dateRange.from || query.applied.dateRange.to) && (
        <Alert
          severity="info"
          sx={{ mb: 1.5, borderRadius: 2 }}
          action={
            <Button color="inherit" size="small" startIcon={<CloseIcon fontSize="small" />} onClick={clearAnchorContext}>
              {translate("equipmentLogs.alert.clearRange" as TranslationKey)}
            </Button>
          }
        >
          {translate("equipmentLogs.alert.anchor" as TranslationKey)}{" "}
          <Typography component="span" variant="body2" sx={{ fontWeight: 700 }}>
            {urlState.anchorAt.replace("T", " ").slice(0, 19)}
          </Typography>
          {" "}
          {translate("equipmentLogs.alert.anchorSuffix" as TranslationKey)
            .replace("{category}", categoryLabel)
            .replace("{from}", query.applied.dateRange.from)
            .replace("{to}", query.applied.dateRange.to)}
        </Alert>
      )}

      <Paper variant="outlined" sx={{ p: 1.5, mb: 1.5, borderRadius: 2 }}>
        <Stack spacing={1.5}>
          <Stack direction={{ xs: "column", lg: "row" }} spacing={1.5} sx={{ alignItems: { lg: "center" } }}>
            <FormControl size="small" sx={{ minWidth: { xs: "100%", lg: 300 }, flexShrink: 0 }}>
              <InputLabel>{translate("equipmentLogs.select.equipment" as TranslationKey)}</InputLabel>
              <Select
                label={translate("equipmentLogs.select.equipment" as TranslationKey)}
                value={equipmentId}
                onChange={(e) => handleEquipmentChange(e.target.value)}
              >
                {fleetRows.map((eq) => (
                  <MenuItem key={eq.id} value={eq.id}>
                    {eq.serialNo} · {eq.customer} / {eq.site}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Stack direction="row" spacing={0.75} sx={{ flexWrap: "wrap", gap: 0.75, alignItems: "center" }}>
              <StatusBadge status={selectedEq?.status ?? "offline"} />
              <Chip label={selectedEq?.model ?? "—"} size="small" variant="outlined" />
              <Chip label={`ID ${equipmentId}`} size="small" variant="outlined" sx={{ fontFamily: "monospace" }} />
              <Chip label={selectedEq?.slaTier ?? "—"} size="small" variant="outlined" />
            </Stack>
          </Stack>
        </Stack>
      </Paper>

      <Paper variant="outlined" sx={{ mb: 1.5, borderRadius: 2, overflow: "hidden" }}>
        <Tabs
          value={category}
          onChange={handleCategoryChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            px: 1,
            minHeight: 42,
            borderBottom: 1,
            borderColor: "divider",
            "& .MuiTab-root": { minHeight: 42, py: 1, textTransform: "none", fontWeight: 600, fontSize: "0.8125rem" },
          }}
        >
          {EQUIPMENT_LOG_CATEGORIES.map((cat) => (
            <Tab
              key={cat}
              value={cat}
              label={
                <Stack direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
                  <span>{translate(`equipmentLogs.category.${cat}` as TranslationKey)}</span>
                  <Chip
                    label={categoryCounts[cat].toLocaleString(localeTag)}
                    size="small"
                    sx={{ height: 18, fontSize: "0.65rem", fontWeight: 700 }}
                  />
                </Stack>
              }
            />
          ))}
        </Tabs>
        <Box sx={{ px: 1.5, py: 1, bgcolor: "action.hover" }}>
          <Typography variant="caption" color="text.secondary">
            {translate(`equipmentLogs.category.${category}.summary` as TranslationKey)}
          </Typography>
        </Box>
      </Paper>

      <Stack direction="row" spacing={0.75} sx={{ mb: 1.5, flexWrap: "wrap", gap: 0.75 }}>
        {LEVELS.map((level) => {
          const active = (query.selects.level ?? "전체") === level;
          const color =
            level === "ERROR" ? "error" : level === "WARN" ? "warning" : level === "INFO" ? "info" : "default";
          const levelLabel =
            level === "전체" ? translate("common.all" as TranslationKey) : localizeDomainValue(level, language);
          return (
            <Chip
              key={level}
              size="small"
              label={`${levelLabel} ${levelCounts[level].toLocaleString(localeTag)}`}
              variant={active ? "filled" : "outlined"}
              color={active && level !== "전체" ? color : "default"}
              onClick={() => handleLevelChip(level)}
            />
          );
        })}
      </Stack>

      <QueryToolbar
        searchFields={bindSearchFields(searchDefs, query.search, query.setSearch)}
        dateRange={query.dateRange}
        onDateRangeChange={query.setDateRange}
        onDatePreset={handleDatePreset}
        dateFromLabel={translate("equipmentLogs.date.from" as TranslationKey)}
        dateToLabel={translate("equipmentLogs.date.to" as TranslationKey)}
        onSearch={handleSearchApply}
        onReset={() => {
          query.reset();
          syncUrl({ equipmentId, category, from: "", to: "", anchorAt: null });
        }}
        resultCount={resultCount}
      />

      <AgDataGrid
        key={`equipment-logs-${equipmentId}-${category}-${query.refreshKey}`}
        gridId={`equipment-logs-${equipmentId}-${category}`}
        title={`${selectedEq?.serialNo ?? "—"} · ${categoryLabel}`}
        subtitle={gridSubtitle}
        fetchRows={fetchRows}
        columnSet="equipmentLogCategory"
        refreshKey={`${equipmentId}-${category}-${query.refreshKey}`}
        autoHeight={false}
      />

      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
        {translate("equipmentLogs.footer.hint" as TranslationKey)}{" "}
        <Typography component={Link} href="/alarms" variant="caption" sx={{ fontWeight: 600 }}>
          {translate("equipmentLogs.footer.alarms" as TranslationKey)}
        </Typography>
      </Typography>
    </Box>
  );
}
