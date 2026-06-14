"use client";

import { useMemo } from "react";
import { Box } from "@mui/material";
import { AgDataGrid } from "@/components/grid/AgDataGrid";
import { PageToolbar } from "@/components/ui/PageComponents";
import { PrimaryButton, StatGrid } from "@/components/ui/mui-primitives";
import { QueryToolbar } from "@/components/ui/QueryToolbar";
import { useQueryState } from "@/hooks/useQueryState";
import { bindSearchFields } from "@/lib/grid/bind-search-fields";
import { createKeysetFetcher, countFilteredRows } from "@/lib/grid/keyset-fetch";
import { combineAnd, matchesDateRange, matchesIndexedFields, matchesSelectFilter } from "@/lib/grid/query-filter";
import { bindQueryToolbarDate } from "@/lib/grid/query-toolbar-date";
import { compareEquipmentOperatingFirst } from "@/lib/fleet-sort";
import { DataScopeBadge } from "@/components/ui/DataScopeBadge";
import { batchFleetMeta, batchFleetSample } from "@/lib/data/batch";
import { useLocale } from "@/contexts/LocaleContext";
import type { TranslationKey } from "@/lib/locale";
import { localeLabel } from "@/lib/locale/types";
import { SEARCH_FIELD_LABELS } from "@/lib/locale/search-fields";
import { localizeDomainValue } from "@/lib/locale/domain-labels";
import type { Equipment } from "@/lib/types";

const REGIONS = ["전체", "경기", "경북", "충남", "울산", "충북", "전북"];
const STATUSES = ["전체", "online", "alarm", "maintenance", "safe_mode", "offline"];

const INITIAL_SEARCH = { serialNo: "", customer: "", site: "", model: "" };

export default function EquipmentPage() {
  const { translate, language } = useLocale();
  const query = useQueryState(INITIAL_SEARCH, { region: "전체", status: "전체" });

  const searchDefs = useMemo(
    () => [
      { id: "serialNo", label: localeLabel(SEARCH_FIELD_LABELS.serialNo, language), indexKey: "serial_no" },
      { id: "customer", label: localeLabel(SEARCH_FIELD_LABELS.customer, language), indexKey: "customer" },
      { id: "site", label: localeLabel(SEARCH_FIELD_LABELS.site, language), indexKey: "site" },
      { id: "model", label: localeLabel(SEARCH_FIELD_LABELS.model, language), indexKey: "model" },
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

  const regionFilterOptions = useMemo(
    () =>
      REGIONS.map((r) => ({
        value: r,
        label: r === "전체" ? translate("common.all" as TranslationKey) : r,
      })),
    [translate],
  );

  const statItems = useMemo(
    () => [
      {
        label: translate("equipment.stat.sample" as TranslationKey),
        value: batchFleetSample.length,
        sub: translate("equipment.stat.batchSnapshot" as TranslationKey),
        variant: "info" as const,
      },
      {
        label: translate("equipment.stat.online" as TranslationKey),
        value: batchFleetSample.filter((e) => e.status === "online").length,
        variant: "success" as const,
      },
      {
        label: translate("equipment.stat.alarm" as TranslationKey),
        value: batchFleetSample.filter((e) => e.status === "alarm").length,
        variant: "danger" as const,
      },
      {
        label: translate("equipment.stat.lowLife" as TranslationKey),
        value: batchFleetSample.filter((e) => e.tubeLifePct < 30 || e.detectorLifePct < 30).length,
        variant: "warning" as const,
        sub: translate("equipment.stat.lowLifeSub" as TranslationKey),
      },
    ],
    [translate],
  );

  const filterFn = useMemo(() => {
    const { from, to } = query.applied.dateRange;
    return (eq: Equipment) =>
      combineAnd(
        matchesIndexedFields(query.applied.search, {
          serialNo: eq.serialNo,
          customer: eq.customer,
          site: eq.site,
          model: eq.model,
        }),
        matchesSelectFilter(query.applied.select.region, eq.region),
        matchesSelectFilter(query.applied.select.status, eq.status),
        matchesDateRange(from, to, eq.installDate ?? eq.lastTelemetryAt),
      );
  }, [query.applied]);

  const fetchRows = useMemo(
    () =>
      createKeysetFetcher(batchFleetSample, {
        idField: "id",
        filterFn,
        sortFn: compareEquipmentOperatingFirst,
      }),
    [filterFn],
  );

  const resultCount = countFilteredRows(batchFleetSample, filterFn);

  return (
    <Box>
      <PageToolbar>
        <DataScopeBadge meta={batchFleetMeta} />
        <PrimaryButton href="/equipment-logs" variant="outlined" menuId="equipment-logs" perm="view">
          {translate("equipment.toolbar.logs" as TranslationKey)}
        </PrimaryButton>
        <PrimaryButton perm="create">{translate("equipment.toolbar.create" as TranslationKey)}</PrimaryButton>
      </PageToolbar>

      <StatGrid items={statItems} />

      <QueryToolbar
        searchFields={bindSearchFields(searchDefs, query.search, query.setSearch)}
        {...bindQueryToolbarDate(query, translate)}
        filters={[
          {
            id: "region",
            label: translate("filter.region" as TranslationKey),
            value: query.selects.region ?? "전체",
            options: regionFilterOptions,
            onChange: (v) => query.applyFilter("region", v),
          },
          {
            id: "status",
            label: translate("filter.status" as TranslationKey),
            value: query.selects.status ?? "전체",
            options: statusFilterOptions,
            onChange: (v) => query.applyFilter("status", v),
          },
        ]}
        onSearch={query.apply}
        onReset={query.reset}
        resultCount={resultCount}
      />

      <AgDataGrid
        title={translate("equipment.grid.title" as TranslationKey)}
        fetchRows={fetchRows}
        columnSet="equipment"
        refreshKey={query.refreshKey}
      />
    </Box>
  );
}
