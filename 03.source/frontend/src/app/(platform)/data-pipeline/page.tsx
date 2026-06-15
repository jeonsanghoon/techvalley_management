"use client";

import { useMemo } from "react";
import { Box, Stack, Typography } from "@mui/material";
import { AgDataGrid } from "@/components/grid/AgDataGrid";
import { PageToolbar, SectionCard } from "@/components/ui/PageComponents";
import { DataScopeBadge } from "@/components/ui/DataScopeBadge";
import { StatGrid } from "@/components/ui/mui-primitives";
import { QueryToolbar } from "@/components/ui/QueryToolbar";
import { useQueryState } from "@/hooks/useQueryState";
import { useFilteredRows } from "@/hooks/useFilteredRows";
import { bindSearchFields } from "@/lib/grid/bind-search-fields";
import { combineAnd, matchesDateRange, matchesIndexedFields, matchesSelectFilter } from "@/lib/grid/query-filter";
import { bindQueryToolbarDate } from "@/lib/grid/query-toolbar-date";
import { fallbackMeta, getListItems, useCollectionStats, useEquipment, usePipelineLive, usePipelineTiers, useEnumCodes } from "@/lib/api/hooks";
import { useLocale } from "@/contexts/LocaleContext";
import type { TranslationKey } from "@/lib/locale";
import { localeLabel } from "@/lib/locale/types";
import { SEARCH_FIELD_LABELS } from "@/lib/locale/search-fields";
import type { CollectionRow } from "@/lib/grid/types";
import type { PipelineStatus } from "@/lib/types";

const INITIAL_SEARCH = { serialNo: "", customer: "", site: "" };

export default function DataPipelinePage() {
  const { translate, language, formatAsOf } = useLocale();
  const { data: pipelineLive } = usePipelineLive();
  const { data: statusCodesData } = useEnumCodes("EQST");
  const { data: collectionStatsResult } = useCollectionStats();
  const collectionStats = collectionStatsResult?.data;
  const batchMeta = collectionStatsResult?.meta ?? fallbackMeta("/pipeline/collection-stats");
  const { data: equipmentData } = useEquipment();
  const equipmentRows = getListItems(equipmentData);
  const realtimeMeta = pipelineLive?.meta ?? fallbackMeta("/pipeline/live", "realtime");
  const { data: tiersPayload } = usePipelineTiers();
  const query = useQueryState(INITIAL_SEARCH, { status: "전체" });

  const searchDefs = useMemo(
    () => [
      { id: "serialNo", label: localeLabel(SEARCH_FIELD_LABELS.serialNo, language), indexKey: "serial_no" },
      { id: "customer", label: localeLabel(SEARCH_FIELD_LABELS.customer, language), indexKey: "customer" },
      { id: "site", label: localeLabel(SEARCH_FIELD_LABELS.site, language), indexKey: "site" },
    ],
    [language],
  );

  const statusFilterOptions = useMemo(
    () => [
      { value: "전체", label: translate("common.all" as TranslationKey) },
      ...getListItems(statusCodesData).map((c) => ({ value: c.code, label: c.name })),
    ],
    [statusCodesData, translate],
  );

  const statItems = useMemo(
    () => [
      { label: translate("dataPipeline.stat.registered" as TranslationKey), value: collectionStats?.totalDevices ?? 0, variant: "info" as const },
      { label: translate("dataPipeline.stat.online" as TranslationKey), value: collectionStats?.onlineDevices ?? 0, variant: "success" as const },
      {
        label: translate("dataPipeline.stat.normalized" as TranslationKey),
        value: (pipelineLive?.collections?.periodic_telemetry ?? collectionStats?.normalizedToday ?? 0).toLocaleString(),
        sub: translate("common.countUnit" as TranslationKey),
      },
      { label: translate("dataPipeline.stat.greengrass" as TranslationKey), value: collectionStats?.greengrassComponents ?? 0, variant: "default" as const },
    ],
    [translate, collectionStats, pipelineLive],
  );

  const liveCollectionRows: CollectionRow[] = useMemo(
    () =>
      equipmentRows.map((eq) => ({
        ...eq,
        tubeRx: eq.status !== "offline" ? translate("dataPipeline.rx.active" as TranslationKey) : "—",
        detectorRx: eq.status !== "offline" ? translate("dataPipeline.rx.active" as TranslationKey) : "—",
        bodyRx: eq.status !== "offline" ? translate("dataPipeline.rx.active" as TranslationKey) : "—",
      })),
    [translate, equipmentRows],
  );

  const collectionFilter = useMemo(
    () => {
      const { from, to } = query.applied.dateRange;
      return (eq: CollectionRow) =>
        combineAnd(
          matchesIndexedFields(query.applied.search, {
            serialNo: eq.serialNo,
            customer: eq.customer,
            site: eq.site,
          }),
          matchesSelectFilter(query.applied.select.status, eq.status),
          matchesDateRange(from, to, eq.lastTelemetryAt),
        );
    },
    [query.applied],
  );

  const tierRows = useMemo((): PipelineStatus[] => {
    if (Array.isArray(tiersPayload)) return tiersPayload as PipelineStatus[];
    if (tiersPayload && Array.isArray((tiersPayload as { items?: PipelineStatus[] }).items)) {
      return (tiersPayload as { items: PipelineStatus[] }).items;
    }
    return [];
  }, [tiersPayload]);

  const { rowData: equipRows, resultCount: equipCount } = useFilteredRows(liveCollectionRows, collectionFilter);

  const batchAsOf = formatAsOf(batchMeta.asOf);
  const realtimeAsOf = formatAsOf(pipelineLive?.asOf ?? realtimeMeta.asOf);

  const realtimeStatItems = useMemo(
    () => [
      {
        label: translate("dataPipeline.realtime.messagesPerMin" as TranslationKey),
        value: (pipelineLive?.collections?.messages_per_min ?? 0).toLocaleString(),
        variant: "info" as const,
      },
      {
        label: translate("dataPipeline.realtime.spoolBuffer" as TranslationKey),
        value: `${pipelineLive?.collections?.spool_buffer_mb ?? 0} MB`,
        variant: "warning" as const,
      },
      {
        label: translate("dataPipeline.realtime.hotTierLag" as TranslationKey),
        value: `${pipelineLive?.collections?.hot_tier_lag_ms ?? 0} ms`,
        variant: "success" as const,
      },
    ],
    [translate, pipelineLive],
  );

  return (
    <Box>
      <PageToolbar>
        <DataScopeBadge meta={batchMeta} />
      </PageToolbar>

      <StatGrid items={statItems} />

      <SectionCard title={translate("dataPipeline.section.tierConfig" as TranslationKey)} sx={{ mb: 2 }}>
        <Stack spacing={2}>
          <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap" }}>
            <DataScopeBadge meta={batchMeta} />
            <Typography variant="body2" color="text.secondary">
              {translate("dataPipeline.section.tierConfigDesc" as TranslationKey)
                .replace("{tierTitle}", translate("dataPipeline.grid.tierTitle" as TranslationKey))
                .replace("{batchSnapshot}", translate("dataPipeline.grid.batchSnapshot" as TranslationKey))
                .replace("{asOf}", batchAsOf)}
            </Typography>
          </Stack>
          <AgDataGrid
            rowData={tierRows}
            columnSet="pipeline"
            idField="tier"
            refreshKey={query.refreshKey}
            dataScope="realtime"
            autoHeight
          />
        </Stack>
      </SectionCard>

      <QueryToolbar
        searchFields={bindSearchFields(searchDefs, query.search, query.setSearch)}
        {...bindQueryToolbarDate(query, translate)}
        filters={[
          {
            id: "status",
            label: translate("dataPipeline.filter.equipmentStatus" as TranslationKey),
            value: query.selects.status ?? "전체",
            options: statusFilterOptions,
            onChange: (v) => query.applyFilter("status", v),
          },
        ]}
        onSearch={query.apply}
        onReset={query.reset}
        resultCount={equipCount}
      />

      <SectionCard title={translate("dataPipeline.section.realtime" as TranslationKey)}>
        <Stack spacing={2}>
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <DataScopeBadge meta={realtimeMeta} />
            <Typography variant="body2" color="text.secondary">
              {translate("dataPipeline.realtime.note" as TranslationKey)}
            </Typography>
          </Stack>
          <StatGrid items={realtimeStatItems} />
          <AgDataGrid
            title={translate("dataPipeline.grid.realtimeTitle" as TranslationKey)}
            subtitle={translate("dataPipeline.grid.realtimeSub" as TranslationKey).replace("{asOf}", realtimeAsOf)}
            rowData={equipRows}
            columnSet="collection"
            refreshKey={query.refreshKey}
            dataScope="realtime"
          />
        </Stack>
      </SectionCard>
    </Box>
  );
}
