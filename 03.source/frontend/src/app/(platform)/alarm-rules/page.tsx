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
import { combineAnd, matchesBoolSelectFilter, matchesIndexedFields, matchesSelectFilter } from "@/lib/grid/query-filter";
import { getListItems, useAlarmRules } from "@/lib/api/hooks";
import { useLocale } from "@/contexts/LocaleContext";
import type { TranslationKey } from "@/lib/locale";
import { localeLabel } from "@/lib/locale/types";
import { SEARCH_FIELD_LABELS } from "@/lib/locale/search-fields";
import { localizeDomainValue } from "@/lib/locale/domain-labels";
import type { AlarmRule } from "@/lib/types";

const INITIAL_SEARCH = { name: "", target: "", condition: "" };

export default function AlarmRulesPage() {
  const { translate, language } = useLocale();
  const { data: ruleData } = useAlarmRules();
  const ruleRows = getListItems(ruleData);
  const query = useQueryState(INITIAL_SEARCH, { severity: "전체", enabled: "전체" });

  const searchDefs = useMemo(
    () => [
      { id: "name", label: localeLabel(SEARCH_FIELD_LABELS.ruleName, language), indexKey: "name" },
      { id: "target", label: localeLabel(SEARCH_FIELD_LABELS.target, language), indexKey: "target" },
      { id: "condition", label: translate("search.condition" as TranslationKey), indexKey: "condition" },
    ],
    [language, translate],
  );

  const severityFilterOptions = useMemo(
    () => [
      { value: "critical", label: localizeDomainValue("critical", language) },
      { value: "warning", label: localizeDomainValue("warning", language) },
    ],
    [language],
  );

  const enabledFilterOptions = useMemo(
    () => [
      { value: "Y", label: translate("filter.active" as TranslationKey) },
      { value: "N", label: translate("filter.inactive" as TranslationKey) },
    ],
    [translate],
  );

  const filterFn = useMemo(
    () => (r: AlarmRule) =>
      combineAnd(
        matchesIndexedFields(query.applied.search, {
          name: r.name,
          target: r.target,
          condition: r.condition,
        }),
        matchesSelectFilter(query.applied.select.severity, r.severity),
        matchesBoolSelectFilter(query.applied.select.enabled, r.enabled),
      ),
    [query.applied],
  );

  const { rowData, resultCount } = useFilteredRows(ruleRows, filterFn);

  return (
    <Box>
      <PageToolbar>
        <PrimaryButton href="/settings/notifications" variant="outlined" menuId="settings-notifications" perm="view">
          {translate("alarmRules.toolbar.notifications" as TranslationKey)}
        </PrimaryButton>
        <PrimaryButton perm="create">{translate("alarmRules.toolbar.create" as TranslationKey)}</PrimaryButton>
      </PageToolbar>

      <QueryToolbar
        searchFields={bindSearchFields(searchDefs, query.search, query.setSearch)}
        filters={[
          {
            id: "severity",
            label: translate("filter.severity" as TranslationKey),
            value: query.selects.severity ?? "전체",
            options: severityFilterOptions,
            onChange: (v) => query.applyFilter("severity", v),
          },
          {
            id: "enabled",
            label: translate("filter.enabled" as TranslationKey),
            value: query.selects.enabled ?? "전체",
            options: enabledFilterOptions,
            onChange: (v) => query.applyFilter("enabled", v),
          },
        ]}
        onSearch={query.apply}
        onReset={query.reset}
        resultCount={resultCount}
      />

      <AgDataGrid
        title={translate("alarmRules.grid.title" as TranslationKey)}
        rowData={rowData}
        columnSet="alarmRule"
        refreshKey={query.refreshKey}
      />
    </Box>
  );
}
