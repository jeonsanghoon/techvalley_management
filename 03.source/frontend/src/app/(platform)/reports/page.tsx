"use client";

import { useMemo } from "react";
import { Box } from "@mui/material";
import { AgDataGrid } from "@/components/grid/AgDataGrid";
import { PageToolbar } from "@/components/ui/PageComponents";
import { PrimaryButton } from "@/components/ui/mui-primitives";
import { QueryToolbar } from "@/components/ui/QueryToolbar";
import { useQueryState } from "@/hooks/useQueryState";
import { useFilteredRows } from "@/hooks/useFilteredRows";
import { bindSearchFields } from "@/lib/grid/bind-search-fields";
import { combineAnd, matchesDateRange, matchesIndexedFields, matchesSelectFilter } from "@/lib/grid/query-filter";
import { bindQueryToolbarDate } from "@/lib/grid/query-toolbar-date";
import { DataScopeBadge } from "@/components/ui/DataScopeBadge";
import { batchOperationalMeta, batchReports } from "@/lib/data/batch";
import { useLocale } from "@/contexts/LocaleContext";
import type { TranslationKey } from "@/lib/locale";
import type { ReportSummary } from "@/lib/types";

const CATEGORIES = ["전체", "운영", "알람", "AS", "검사"];

const INITIAL_SEARCH = { name: "", category: "", id: "" };

export default function ReportsPage() {
  const { translate } = useLocale();
  const query = useQueryState(INITIAL_SEARCH, { category: "전체" });

  const searchDefs = useMemo(
    () => [
      { id: "name", label: translate("search.reportName" as TranslationKey), indexKey: "name" },
      { id: "category", label: translate("filter.category" as TranslationKey), indexKey: "category" },
      { id: "id", label: "ID", indexKey: "id" },
    ],
    [translate],
  );

  const categoryFilterOptions = useMemo(
    () =>
      CATEGORIES.map((c) => ({
        value: c,
        label: c === "전체" ? translate("common.all" as TranslationKey) : translate(`reports.category.${c}` as TranslationKey),
      })),
    [translate],
  );

  const filterFn = useMemo(
    () => {
      const { from, to } = query.applied.dateRange;
      return (r: ReportSummary) =>
        combineAnd(
          matchesIndexedFields(query.applied.search, {
            name: r.name,
            category: r.category,
            id: r.id,
          }),
          matchesSelectFilter(query.applied.select.category, r.category),
          matchesDateRange(from, to, r.lastGenerated),
        );
    },
    [query.applied],
  );

  const { rowData, resultCount } = useFilteredRows(batchReports, filterFn);

  return (
    <Box>
      <PageToolbar>
        <DataScopeBadge meta={batchOperationalMeta} />
        <PrimaryButton perm="create">{translate("reports.toolbar.create" as TranslationKey)}</PrimaryButton>
      </PageToolbar>

      <QueryToolbar
        searchFields={bindSearchFields(searchDefs, query.search, query.setSearch)}
        {...bindQueryToolbarDate(query, translate)}
        filters={[
          {
            id: "category",
            label: translate("filter.category" as TranslationKey),
            value: query.selects.category ?? "전체",
            options: categoryFilterOptions,
            onChange: (v) => query.applyFilter("category", v),
          },
        ]}
        onSearch={query.apply}
        onReset={query.reset}
        resultCount={resultCount}
      />

      <AgDataGrid title={translate("reports.grid.title" as TranslationKey)} rowData={rowData} columnSet="report" refreshKey={query.refreshKey} />
    </Box>
  );
}
