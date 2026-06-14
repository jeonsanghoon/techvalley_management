"use client";

import { useMemo } from "react";
import { Box } from "@mui/material";
import { AgDataGrid } from "@/components/grid/AgDataGrid";
import { StatGrid } from "@/components/ui/mui-primitives";
import { QueryToolbar } from "@/components/ui/QueryToolbar";
import { useQueryState } from "@/hooks/useQueryState";
import { useFilteredRows } from "@/hooks/useFilteredRows";
import { bindSearchFields } from "@/lib/grid/bind-search-fields";
import { combineAnd, fieldStr, matchesBoolSelectFilter, matchesDateRange, matchesIndexedFields } from "@/lib/grid/query-filter";
import { bindQueryToolbarDate } from "@/lib/grid/query-toolbar-date";
import { asRecords } from "@/lib/mock-data";
import { useLocale } from "@/contexts/LocaleContext";
import type { TranslationKey } from "@/lib/locale";
import { localeLabel } from "@/lib/locale/types";
import { SEARCH_FIELD_LABELS } from "@/lib/locale/search-fields";
import type { AsRecord } from "@/lib/types";

const INITIAL_SEARCH = { ticketId: "", equipmentSn: "", customer: "", workSummary: "", replacedParts: "" };

export default function AsPage() {
  const { translate, language } = useLocale();
  const query = useQueryState(INITIAL_SEARCH, { recurrence: "전체" });

  const searchDefs = useMemo(
    () => [
      { id: "ticketId", label: translate("search.ticketId" as TranslationKey), indexKey: "ticket_id" },
      { id: "equipmentSn", label: localeLabel(SEARCH_FIELD_LABELS.equipmentSn, language), indexKey: "equipment_sn" },
      { id: "customer", label: localeLabel(SEARCH_FIELD_LABELS.customer, language), indexKey: "customer" },
      { id: "workSummary", label: translate("search.workSummary" as TranslationKey), indexKey: "work_summary" },
      { id: "replacedParts", label: translate("search.replacedParts" as TranslationKey), indexKey: "replaced_parts" },
    ],
    [language, translate],
  );

  const recurrenceFilterOptions = useMemo(
    () => [
      { value: "Y", label: translate("as.filter.recurrence" as TranslationKey) },
      { value: "N", label: translate("as.filter.normal" as TranslationKey) },
    ],
    [translate],
  );

  const filterFn = useMemo(
    () => {
      const { from, to } = query.applied.dateRange;
      return (r: AsRecord) =>
        combineAnd(
          matchesIndexedFields(query.applied.search, {
            ticketId: r.ticketId,
            equipmentSn: r.equipmentSn,
            customer: r.customer,
            workSummary: r.workSummary,
            replacedParts: fieldStr(r.replacedParts),
          }),
          matchesBoolSelectFilter(query.applied.select.recurrence, r.recurrence),
          matchesDateRange(from, to, r.completedAt),
        );
    },
    [query.applied],
  );

  const { rowData, resultCount } = useFilteredRows(asRecords, filterFn);
  const avg = rowData.reduce((s, r) => s + (r.satisfaction ?? 0), 0) / (rowData.length || 1);

  const statItems = useMemo(
    () => [
      { label: translate("as.stat.resultCount" as TranslationKey), value: resultCount, variant: "success" as const },
      { label: translate("as.stat.avgSatisfaction" as TranslationKey), value: avg.toFixed(1) },
      { label: translate("as.stat.recurrence" as TranslationKey), value: rowData.filter((r) => r.recurrence).length, variant: "warning" as const },
    ],
    [translate, resultCount, avg, rowData],
  );

  return (
    <Box>
      <StatGrid items={statItems} />

      <QueryToolbar
        searchFields={bindSearchFields(searchDefs, query.search, query.setSearch)}
        {...bindQueryToolbarDate(query, translate)}
        filters={[
          {
            id: "recurrence",
            label: translate("as.filter.recurrence" as TranslationKey),
            value: query.selects.recurrence ?? "전체",
            options: recurrenceFilterOptions,
            onChange: (v) => query.applyFilter("recurrence", v),
          },
        ]}
        onSearch={query.apply}
        onReset={query.reset}
        resultCount={resultCount}
      />

      <AgDataGrid title={translate("as.grid.title" as TranslationKey)} rowData={rowData} columnSet="asRecord" refreshKey={query.refreshKey} />
    </Box>
  );
}
