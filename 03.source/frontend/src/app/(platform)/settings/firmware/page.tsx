"use client";

import { useMemo } from "react";
import { Box } from "@mui/material";
import { AgDataGrid } from "@/components/grid/AgDataGrid";
import { PageToolbar, SectionCard } from "@/components/ui/PageComponents";
import { PrimaryButton } from "@/components/ui/mui-primitives";
import { QueryToolbar } from "@/components/ui/QueryToolbar";
import { useQueryState } from "@/hooks/useQueryState";
import { useFilteredRows } from "@/hooks/useFilteredRows";
import { bindSearchFields } from "@/lib/grid/bind-search-fields";
import { combineAnd, matchesDateRange, matchesIndexedFields, matchesSelectFilter } from "@/lib/grid/query-filter";
import { bindQueryToolbarDate } from "@/lib/grid/query-toolbar-date";
import { DataScopeBadge } from "@/components/ui/DataScopeBadge";
import { fallbackMeta, getListItems, useFirmwareConfigs } from "@/lib/api/hooks";
import { useLocale } from "@/contexts/LocaleContext";
import type { TranslationKey } from "@/lib/locale";
import { localeLabel } from "@/lib/locale/types";
import { SEARCH_FIELD_LABELS } from "@/lib/locale/search-fields";
import type { FirmwareConfig } from "@/lib/types";

const INITIAL_SEARCH = { serialNo: "", model: "", customer: "", version: "" };

export default function SettingsFirmwarePage() {
  const { translate, language } = useLocale();
  const { data: firmwareData } = useFirmwareConfigs();
  const firmwareRows = getListItems(firmwareData);
  const dataMeta = firmwareData?.meta ?? fallbackMeta("/firmware/configs");
  const query = useQueryState(INITIAL_SEARCH, { auto: "전체" });

  const searchDefs = useMemo(
    () => [
      { id: "serialNo", label: localeLabel(SEARCH_FIELD_LABELS.serialNo, language), indexKey: "serial_no" },
      { id: "model", label: localeLabel(SEARCH_FIELD_LABELS.model, language), indexKey: "model" },
      { id: "customer", label: localeLabel(SEARCH_FIELD_LABELS.customer, language), indexKey: "customer" },
      { id: "version", label: translate("search.version" as TranslationKey), indexKey: "version" },
    ],
    [language, translate],
  );

  const autoFilterOptions = useMemo(
    () => [
      { value: "ON", label: "ON" },
      { value: "OFF", label: "OFF" },
    ],
    [],
  );

  const filterFn = useMemo(
    () => {
      const { from, to } = query.applied.dateRange;
      return (f: FirmwareConfig) =>
        combineAnd(
          matchesIndexedFields(query.applied.search, {
            serialNo: f.serialNo,
            model: f.model,
            customer: f.customer,
            version: `${f.current} ${f.target}`,
          }),
          matchesSelectFilter(query.applied.select.auto, f.auto),
          matchesDateRange(from, to, f.lastCheckAt),
        );
    },
    [query.applied],
  );

  const { rowData, resultCount } = useFilteredRows(firmwareRows, filterFn);

  return (
    <Box>
      <PageToolbar>
        <DataScopeBadge meta={dataMeta} />
        <PrimaryButton perm="execute">{translate("settingsFirmware.toolbar.ota" as TranslationKey)}</PrimaryButton>
      </PageToolbar>

      <QueryToolbar
        searchFields={bindSearchFields(searchDefs, query.search, query.setSearch)}
        {...bindQueryToolbarDate(query, translate)}
        filters={[
          {
            id: "auto",
            label: "Auto Update",
            value: query.selects.auto ?? "전체",
            options: autoFilterOptions,
            onChange: (v) => query.applyFilter("auto", v),
          },
        ]}
        onSearch={query.apply}
        onReset={query.reset}
        resultCount={resultCount}
      />

      <SectionCard title={translate("settingsFirmware.section.otaPolicy" as TranslationKey)}>
        {translate("settingsFirmware.section.otaPolicyBody" as TranslationKey)}
      </SectionCard>

      <AgDataGrid
        title={translate("settingsFirmware.grid.title" as TranslationKey)}
        rowData={rowData}
        columnSet="firmware"
        idField="id"
        refreshKey={query.refreshKey}
      />
    </Box>
  );
}
