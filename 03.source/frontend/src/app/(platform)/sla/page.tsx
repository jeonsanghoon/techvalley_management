"use client";

import { useMemo } from "react";
import { Box, Typography } from "@mui/material";
import { AgDataGrid } from "@/components/grid/AgDataGrid";
import { PageToolbar, Card } from "@/components/ui/PageComponents";
import { DataScopeBadge } from "@/components/ui/DataScopeBadge";
import { SimpleTable } from "@/components/ui/mui-primitives";
import { QueryToolbar } from "@/components/ui/QueryToolbar";
import { useQueryState } from "@/hooks/useQueryState";
import { useFilteredRows } from "@/hooks/useFilteredRows";
import { bindSearchFields } from "@/lib/grid/bind-search-fields";
import { combineAnd, matchesDateRange, matchesIndexedFields, matchesSelectFilter } from "@/lib/grid/query-filter";
import { bindQueryToolbarDate } from "@/lib/grid/query-toolbar-date";
import { fallbackMeta, getListItems, useEquipment, useSlaDefinitions, useSlaSnapshots, useEnumCodes } from "@/lib/api/hooks";
import { useLocale } from "@/contexts/LocaleContext";
import type { TranslationKey } from "@/lib/locale";
import { localeLabel } from "@/lib/locale/types";
import { SEARCH_FIELD_LABELS } from "@/lib/locale/search-fields";
import type { SlaEquipmentRow } from "@/lib/grid/types";

const INITIAL_SEARCH = { equipmentSn: "", customer: "", serviceWindow: "" };

export default function SlaPage() {
  const { translate, language, formatAsOf } = useLocale();
  const { data: equipmentData } = useEquipment();
  const { data: slaTierCodesData } = useEnumCodes("SLAT");
  const equipmentRows = getListItems(equipmentData);
  const dataMeta = equipmentData?.meta ?? fallbackMeta("/equipment");
  const { data: slaDefData } = useSlaDefinitions();
  const slaDefinitionRows = getListItems(slaDefData);
  const { data: slaSnapshotData } = useSlaSnapshots();
  const slaSnapshots = getListItems(slaSnapshotData);
  const snapshotMeta = slaSnapshotData?.meta ?? fallbackMeta("/sla/snapshots");
  const query = useQueryState(INITIAL_SEARCH, { slaTier: "전체" });

  const searchDefs = useMemo(
    () => [
      { id: "equipmentSn", label: localeLabel(SEARCH_FIELD_LABELS.equipmentSn, language), indexKey: "equipment_sn" },
      { id: "customer", label: localeLabel(SEARCH_FIELD_LABELS.customer, language), indexKey: "customer" },
      { id: "serviceWindow", label: translate("search.serviceWindow" as TranslationKey), indexKey: "service_window" },
    ],
    [language, translate],
  );

  const slaTierFilterOptions = useMemo(
    () => [
      { value: "전체", label: translate("common.all" as TranslationKey) },
      ...getListItems(slaTierCodesData).map((c) => ({ value: c.code, label: c.name })),
    ],
    [slaTierCodesData, translate],
  );

  const slaTableColumns = useMemo(
    () => [
      { key: "tier", label: translate("sla.table.tier" as TranslationKey) },
      { key: "response", label: translate("sla.table.response" as TranslationKey) },
      { key: "dispatch", label: translate("sla.table.dispatch" as TranslationKey) },
      { key: "recovery", label: translate("sla.table.recovery" as TranslationKey) },
      { key: "uptime", label: translate("sla.table.uptime" as TranslationKey) },
    ],
    [translate],
  );

  const baseRows: SlaEquipmentRow[] = useMemo(
    () =>
      equipmentRows.map((eq) => ({
        ...eq,
        partsAvail: eq.serviceability === "부품 대기" ? "부족" : "가용",
        engineerAvail:
          eq.serviceability.includes("방문") || eq.serviceability === "즉시 원격가능" ? "가용" : "대기",
        remoteOk: eq.serviceability === "즉시 원격가능" ? "Y" : "N",
      })),
    [equipmentRows],
  );

  const filterFn = useMemo(
    () => {
      const { from, to } = query.applied.dateRange;
      return (eq: SlaEquipmentRow) =>
        combineAnd(
          matchesIndexedFields(query.applied.search, {
            equipmentSn: eq.serialNo,
            customer: eq.customer,
            serviceWindow: eq.serviceability,
          }),
          matchesSelectFilter(query.applied.select.slaTier, eq.slaTier),
          matchesDateRange(from, to, eq.installDate ?? eq.lastTelemetryAt),
        );
    },
    [query.applied],
  );

  const { rowData, resultCount } = useFilteredRows(baseRows, filterFn);
  const batchAsOf = formatAsOf(dataMeta.asOf);

  const slaTableRows = useMemo(
    () =>
      slaDefinitionRows.map((s) => ({
        tier: s.tier_name,
        response: `≤ ${s.response_minutes}분`,
        dispatch: `≤ ${Math.round(s.resolve_minutes / 60)}시간`,
        recovery: `≤ ${s.resolve_minutes}분`,
        uptime: `${s.uptime_target_pct}%+`,
      })),
    [slaDefinitionRows],
  );

  const snapshotTableColumns = useMemo(
    () => [
      { key: "snapshot_at", label: translate("sla.snapshot.at" as TranslationKey) },
      { key: "fleet_size", label: translate("sla.snapshot.fleet" as TranslationKey) },
      { key: "uptime_pct", label: translate("sla.snapshot.uptime" as TranslationKey) },
      { key: "critical_open_count", label: translate("sla.snapshot.critical" as TranslationKey) },
    ],
    [translate],
  );

  const snapshotTableRows = useMemo(
    () =>
      slaSnapshots.map((s) => ({
        snapshot_at: formatAsOf(String(s.snapshot_at ?? "")),
        fleet_size: String(s.fleet_size ?? "—"),
        uptime_pct: `${s.uptime_pct ?? "—"}%`,
        critical_open_count: String(s.critical_open_count ?? "—"),
      })),
    [slaSnapshots, formatAsOf],
  );

  return (
    <Box>
      <PageToolbar>
        <DataScopeBadge meta={dataMeta} />
      </PageToolbar>

      <QueryToolbar
        searchFields={bindSearchFields(searchDefs, query.search, query.setSearch)}
        {...bindQueryToolbarDate(query, translate)}
        filters={[
          {
            id: "slaTier",
            label: translate("filter.slaTier" as TranslationKey),
            value: query.selects.slaTier ?? "전체",
            options: slaTierFilterOptions,
            onChange: (v) => query.applyFilter("slaTier", v),
          },
        ]}
        onSearch={query.apply}
        onReset={query.reset}
        resultCount={resultCount}
      />

      <Card title={translate("sla.card.targets" as TranslationKey)}>
        <SimpleTable
          columns={slaTableColumns}
          rows={slaTableRows}
        />
      </Card>

      <Card title={translate("sla.card.snapshots" as TranslationKey)} sx={{ mt: 2 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
          {translate("sla.card.snapshotsSub" as TranslationKey).replace(
            "{asOf}",
            formatAsOf(snapshotMeta.asOf),
          )}
        </Typography>
        <SimpleTable columns={snapshotTableColumns} rows={snapshotTableRows} />
      </Card>

      <AgDataGrid
        title={translate("sla.grid.title" as TranslationKey)}
        subtitle={translate("sla.grid.subtitle" as TranslationKey).replace("{asOf}", batchAsOf)}
        rowData={rowData}
        columnSet="slaEquipment"
        refreshKey={query.refreshKey}
      />
    </Box>
  );
}
