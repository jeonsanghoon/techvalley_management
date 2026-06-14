"use client";

import { useMemo } from "react";
import { Box } from "@mui/material";
import { AgDataGrid } from "@/components/grid/AgDataGrid";
import { PageToolbar } from "@/components/ui/PageComponents";
import { PrimaryButton, StatGrid } from "@/components/ui/mui-primitives";
import { QueryToolbar } from "@/components/ui/QueryToolbar";
import { useQueryState } from "@/hooks/useQueryState";
import { useFilteredRows } from "@/hooks/useFilteredRows";
import { bindSearchFields } from "@/lib/grid/bind-search-fields";
import { combineAnd, matchesBoolSelectFilter, matchesDateRange, matchesIndexedFields, matchesSelectFilter } from "@/lib/grid/query-filter";
import { bindQueryToolbarDate } from "@/lib/grid/query-toolbar-date";
import { installations } from "@/lib/mock-data";
import { useLocale } from "@/contexts/LocaleContext";
import type { TranslationKey } from "@/lib/locale";
import { localeLabel } from "@/lib/locale/types";
import { SEARCH_FIELD_LABELS } from "@/lib/locale/search-fields";
import { localizeDomainValue } from "@/lib/locale/domain-labels";
import type { Installation } from "@/lib/types";

const STATUSES = ["예정", "진행중", "시운전", "완료"];

const INITIAL_SEARCH = { orderRef: "", equipmentSn: "", model: "", customer: "", site: "" };

export default function InstallationPage() {
  const { translate, language } = useLocale();
  const query = useQueryState(INITIAL_SEARCH, { status: "전체", iot: "전체" });

  const searchDefs = useMemo(
    () => [
      { id: "orderRef", label: translate("search.orderRef" as TranslationKey), indexKey: "order_ref" },
      { id: "equipmentSn", label: localeLabel(SEARCH_FIELD_LABELS.equipmentSn, language), indexKey: "equipment_sn" },
      { id: "model", label: localeLabel(SEARCH_FIELD_LABELS.model, language), indexKey: "model" },
      { id: "customer", label: localeLabel(SEARCH_FIELD_LABELS.customer, language), indexKey: "customer" },
      { id: "site", label: localeLabel(SEARCH_FIELD_LABELS.site, language), indexKey: "site" },
    ],
    [language, translate],
  );

  const statusFilterOptions = useMemo(
    () =>
      STATUSES.map((s) => ({
        value: s,
        label: localizeDomainValue(s, language),
      })),
    [language],
  );

  const iotFilterOptions = useMemo(
    () => [
      { value: "Y", label: translate("installation.filter.iotRegistered" as TranslationKey) },
      { value: "N", label: translate("installation.filter.iotNotRegistered" as TranslationKey) },
    ],
    [translate],
  );

  const filterFn = useMemo(
    () => {
      const { from, to } = query.applied.dateRange;
      return (i: Installation) =>
        combineAnd(
          matchesIndexedFields(query.applied.search, {
            orderRef: i.orderRef,
            equipmentSn: i.equipmentSn,
            model: i.model,
            customer: i.customer,
            site: i.site,
          }),
          matchesSelectFilter(query.applied.select.status, i.status),
          matchesBoolSelectFilter(query.applied.select.iot, i.iotRegistered),
          matchesDateRange(from, to, i.actualInstallDate ?? i.plannedInstallDate),
        );
    },
    [query.applied],
  );

  const { rowData, resultCount } = useFilteredRows(installations, filterFn);

  const statItems = useMemo(
    () => [
      { label: translate("installation.stat.resultCount" as TranslationKey), value: resultCount },
      { label: translate("installation.stat.inProgress" as TranslationKey), value: rowData.filter((i) => i.status !== "완료").length, variant: "warning" as const },
      { label: translate("installation.stat.iotRegistered" as TranslationKey), value: rowData.filter((i) => i.iotRegistered).length, variant: "success" as const },
    ],
    [translate, resultCount, rowData],
  );

  return (
    <Box>
      <PageToolbar>
        <PrimaryButton perm="create">{translate("installation.toolbar.create" as TranslationKey)}</PrimaryButton>
      </PageToolbar>
      <StatGrid items={statItems} />

      <QueryToolbar
        searchFields={bindSearchFields(searchDefs, query.search, query.setSearch)}
        {...bindQueryToolbarDate(query, translate)}
        filters={[
          {
            id: "status",
            label: translate("filter.status" as TranslationKey),
            value: query.selects.status ?? "전체",
            options: statusFilterOptions,
            onChange: (v) => query.applyFilter("status", v),
          },
          {
            id: "iot",
            label: "IoT",
            value: query.selects.iot ?? "전체",
            options: iotFilterOptions,
            onChange: (v) => query.applyFilter("iot", v),
          },
        ]}
        onSearch={query.apply}
        onReset={query.reset}
        resultCount={resultCount}
      />

      <AgDataGrid title={translate("installation.grid.title" as TranslationKey)} rowData={rowData} columnSet="installation" refreshKey={query.refreshKey} />
    </Box>
  );
}
