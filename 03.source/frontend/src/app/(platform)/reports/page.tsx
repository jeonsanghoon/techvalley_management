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
import { fallbackMeta, getListItems, useReports, useEnumCodes } from "@/lib/api/hooks";
import { useLocale } from "@/contexts/LocaleContext";
import type { TranslationKey } from "@/lib/locale";
import type { ReportSummary } from "@/lib/types";

const INITIAL_SEARCH = { name: "", category: "", id: "" };

export default function ReportsPage() {
  const { translate } = useLocale();
  const { data: reportData } = useReports();
  const { data: categoryCodesData } = useEnumCodes("RPCT");
  const reportRows = getListItems(reportData);
  const dataMeta = reportData?.meta ?? fallbackMeta("/reports");
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
    () => [
      { value: "전체", label: translate("common.all" as TranslationKey) },
      ...getListItems(categoryCodesData).map((c) => ({ value: c.code, label: c.name })),
    ],
    [categoryCodesData, translate],
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

  const { rowData, resultCount } = useFilteredRows(reportRows, filterFn);

  return (
    <Box>
      <PageToolbar>
        <DataScopeBadge meta={dataMeta} />
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
