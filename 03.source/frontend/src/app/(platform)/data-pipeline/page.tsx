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
import { batchCollectionMeta, batchCollectionStats } from "@/lib/data/batch";
import { realtimeCollectionMeta, realtimeCollectionMetrics, realtimeFleetItems } from "@/lib/data/realtime";
import { pipelineStatuses } from "@/lib/mock-data";
import { useLocale } from "@/contexts/LocaleContext";
import type { TranslationKey } from "@/lib/locale";
import { localeLabel } from "@/lib/locale/types";
import { SEARCH_FIELD_LABELS } from "@/lib/locale/search-fields";
import { localizeDomainValue } from "@/lib/locale/domain-labels";
import type { CollectionRow } from "@/lib/grid/types";

const STATUSES = ["전체", "online", "alarm", "maintenance", "safe_mode", "offline"];

const INITIAL_SEARCH = { serialNo: "", customer: "", site: "" };

export default function DataPipelinePage() {
  const { translate, language, formatAsOf } = useLocale();
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
    () =>
      STATUSES.map((s) => ({
        value: s,
        label: s === "전체" ? translate("common.all" as TranslationKey) : localizeDomainValue(s, language),
      })),
    [language, translate],
  );

  const statItems = useMemo(
    () => [
      { label: translate("dataPipeline.stat.registered" as TranslationKey), value: batchCollectionStats.totalDevices, variant: "info" as const },
      { label: translate("dataPipeline.stat.online" as TranslationKey), value: batchCollectionStats.onlineDevices, variant: "success" as const },
      {
        label: translate("dataPipeline.stat.normalized" as TranslationKey),
        value: batchCollectionStats.normalizedToday.toLocaleString(),
        sub: translate("common.countUnit" as TranslationKey),
      },
      { label: translate("dataPipeline.stat.greengrass" as TranslationKey), value: batchCollectionStats.greengrassComponents, variant: "default" as const },
    ],
    [translate],
  );

  const liveCollectionRows: CollectionRow[] = useMemo(
    () =>
      realtimeFleetItems.map((eq) => ({
        ...eq,
        tubeRx: eq.status !== "offline" ? translate("dataPipeline.rx.active" as TranslationKey) : "—",
        detectorRx: eq.status !== "offline" ? translate("dataPipeline.rx.active" as TranslationKey) : "—",
        bodyRx: eq.status !== "offline" ? translate("dataPipeline.rx.active" as TranslationKey) : "—",
      })),
    [translate],
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

  const tierRows = pipelineStatuses;

  const { rowData: equipRows, resultCount: equipCount } = useFilteredRows(liveCollectionRows, collectionFilter);

  const batchAsOf = formatAsOf(batchCollectionMeta.asOf);
  const realtimeAsOf = formatAsOf(realtimeCollectionMeta.asOf);

  const realtimeStatItems = useMemo(
    () => [
      { label: translate("dataPipeline.realtime.messagesPerMin" as TranslationKey), value: realtimeCollectionMetrics.messagesPerMin.toLocaleString(), variant: "info" as const },
      { label: translate("dataPipeline.realtime.spoolBuffer" as TranslationKey), value: `${realtimeCollectionMetrics.spoolBufferMb} MB`, variant: "warning" as const },
      { label: translate("dataPipeline.realtime.hotTierLag" as TranslationKey), value: `${realtimeCollectionMetrics.hotTierLagMs} ms`, variant: "success" as const },
    ],
    [translate],
  );

  return (
    <Box>
      <PageToolbar>
        <DataScopeBadge meta={batchCollectionMeta} />
      </PageToolbar>

      <StatGrid items={statItems} />

      <SectionCard title={translate("dataPipeline.section.tierConfig" as TranslationKey)} sx={{ mb: 2 }}>
        <Stack spacing={2}>
          <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap" }}>
            <DataScopeBadge meta={batchCollectionMeta} />
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
            <DataScopeBadge meta={realtimeCollectionMeta} />
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
