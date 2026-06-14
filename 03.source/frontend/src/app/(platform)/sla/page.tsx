"use client";

import { useMemo } from "react";
import { Box } from "@mui/material";
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
import { batchFleetMeta, batchFleetSample } from "@/lib/data/batch";
import { slaDefinitions } from "@/lib/mock-data";
import { useLocale } from "@/contexts/LocaleContext";
import type { TranslationKey } from "@/lib/locale";
import { localeLabel } from "@/lib/locale/types";
import { SEARCH_FIELD_LABELS } from "@/lib/locale/search-fields";
import type { SlaEquipmentRow } from "@/lib/grid/types";

const SLA_TIERS = ["전체", "Critical", "High", "Standard"];

const INITIAL_SEARCH = { equipmentSn: "", customer: "", serviceWindow: "" };

export default function SlaPage() {
  const { translate, language, formatAsOf } = useLocale();
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
    () =>
      SLA_TIERS.map((t) => ({
        value: t,
        label: t === "전체" ? translate("common.all" as TranslationKey) : t,
      })),
    [translate],
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
      batchFleetSample.map((eq) => ({
        ...eq,
        partsAvail: eq.serviceability === "부품 대기" ? "부족" : "가용",
        engineerAvail:
          eq.serviceability.includes("방문") || eq.serviceability === "즉시 원격가능" ? "가용" : "대기",
        remoteOk: eq.serviceability === "즉시 원격가능" ? "Y" : "N",
      })),
    [],
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
  const batchAsOf = formatAsOf(batchFleetMeta.asOf);

  return (
    <Box>
      <PageToolbar>
        <DataScopeBadge meta={batchFleetMeta} />
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
          rows={slaDefinitions.map((s) => ({
            tier: s.tier,
            response: s.firstResponse,
            dispatch: s.dispatch,
            recovery: s.recovery,
            uptime: s.uptime,
          }))}
        />
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
