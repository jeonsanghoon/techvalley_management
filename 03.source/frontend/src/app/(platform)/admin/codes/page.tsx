"use client";

import { useMemo } from "react";
import { Box } from "@mui/material";
import { AgDataGrid } from "@/components/grid/AgDataGrid";
import { QueryToolbar } from "@/components/ui/QueryToolbar";
import { useQueryState } from "@/hooks/useQueryState";
import { useFilteredRows } from "@/hooks/useFilteredRows";
import { bindSearchFields } from "@/lib/grid/bind-search-fields";
import { combineAnd, matchesBoolSelectFilter, matchesIndexedFields, matchesSelectFilter } from "@/lib/grid/query-filter";
import { getListItems, useCommonCodes } from "@/lib/api/hooks";
import { useLocale } from "@/contexts/LocaleContext";
import type { TranslationKey } from "@/lib/locale";
import type { CommonCode } from "@/lib/types";

const INITIAL_SEARCH = { group: "", code: "", name: "" };

export default function AdminCodesPage() {
  const { translate } = useLocale();
  const { data: codeData } = useCommonCodes();
  const codeRows = getListItems(codeData);
  const query = useQueryState(INITIAL_SEARCH, { group: "전체", active: "전체" });

  const searchDefs = useMemo(
    () => [
      { id: "group", label: translate("search.codeGroup" as TranslationKey), indexKey: "group" },
      { id: "code", label: translate("search.code" as TranslationKey), indexKey: "code" },
      { id: "name", label: translate("search.codeName" as TranslationKey), indexKey: "name" },
    ],
    [translate],
  );

  const groups = useMemo(
    () => Array.from(new Set(codeRows.map((c) => c.group))),
    [codeRows],
  );

  const groupFilterOptions = useMemo(
    () => groups.map((g) => ({ value: g, label: g })),
    [groups],
  );

  const activeFilterOptions = useMemo(
    () => [
      { value: "Y", label: translate("filter.inUse" as TranslationKey) },
      { value: "N", label: translate("filter.notInUse" as TranslationKey) },
    ],
    [translate],
  );

  const filterFn = useMemo(
    () => (c: CommonCode) =>
      combineAnd(
        matchesIndexedFields(query.applied.search, {
          group: c.group,
          code: c.code,
          name: c.name,
        }),
        matchesSelectFilter(query.applied.select.group, c.group),
        matchesBoolSelectFilter(query.applied.select.active, c.active),
      ),
    [query.applied],
  );

  const { rowData, resultCount } = useFilteredRows(codeRows, filterFn);

  return (
    <Box>
      <QueryToolbar
        searchFields={bindSearchFields(searchDefs, query.search, query.setSearch)}
        filters={[
          {
            id: "group",
            label: translate("search.codeGroup" as TranslationKey),
            value: query.selects.group ?? "전체",
            options: groupFilterOptions,
            onChange: (v) => query.applyFilter("group", v),
          },
          {
            id: "active",
            label: translate("filter.inUse" as TranslationKey),
            value: query.selects.active ?? "전체",
            options: activeFilterOptions,
            onChange: (v) => query.applyFilter("active", v),
          },
        ]}
        onSearch={query.apply}
        onReset={query.reset}
        resultCount={resultCount}
      />

      <AgDataGrid title={translate("adminCodes.grid.title" as TranslationKey)} rowData={rowData} columnSet="code" refreshKey={query.refreshKey} />
    </Box>
  );
}
