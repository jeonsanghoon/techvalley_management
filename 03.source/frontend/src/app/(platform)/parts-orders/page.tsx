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
import { combineAnd, matchesDateRange, matchesIndexedFields, matchesSelectFilter } from "@/lib/grid/query-filter";
import { bindQueryToolbarDate } from "@/lib/grid/query-toolbar-date";
import { getListItems, usePartOrders, useEnumCodes } from "@/lib/api/hooks";
import { useLocale } from "@/contexts/LocaleContext";
import type { TranslationKey } from "@/lib/locale";
import { localeLabel } from "@/lib/locale/types";
import { SEARCH_FIELD_LABELS } from "@/lib/locale/search-fields";
import type { PartOrder } from "@/lib/types";

const INITIAL_SEARCH = { id: "", ticketId: "", equipmentSn: "", partNo: "", partName: "" };

export default function PartsOrdersPage() {
  const { translate, language } = useLocale();
  const { data: partOrderData } = usePartOrders();
  const partOrderRows = getListItems(partOrderData);
  const { data: statusCodesData } = useEnumCodes("PRST");
  const query = useQueryState(INITIAL_SEARCH, { status: "전체" });

  const searchDefs = useMemo(
    () => [
      { id: "id", label: translate("search.orderId" as TranslationKey), indexKey: "id" },
      { id: "ticketId", label: translate("search.ticketId" as TranslationKey), indexKey: "ticket_id" },
      { id: "equipmentSn", label: localeLabel(SEARCH_FIELD_LABELS.equipmentSn, language), indexKey: "equipment_sn" },
      { id: "partNo", label: localeLabel(SEARCH_FIELD_LABELS.partNo, language), indexKey: "part_no" },
      { id: "partName", label: translate("search.partName" as TranslationKey), indexKey: "part_name" },
    ],
    [language, translate],
  );

  const statusFilterOptions = useMemo(
    () => [
      { value: "전체", label: translate("common.all" as TranslationKey) },
      ...getListItems(statusCodesData).map((c) => ({ value: c.code, label: c.name })),
    ],
    [statusCodesData, translate],
  );

  const filterFn = useMemo(
    () => {
      const { from, to } = query.applied.dateRange;
      return (p: PartOrder) =>
        combineAnd(
          matchesIndexedFields(query.applied.search, {
            id: p.id,
            ticketId: p.ticketId,
            equipmentSn: p.equipmentSn,
            partNo: p.partNo,
            partName: p.partName,
          }),
          matchesSelectFilter(query.applied.select.status, p.status),
          matchesDateRange(from, to, p.requestedAt),
        );
    },
    [query.applied],
  );

  const { rowData, resultCount } = useFilteredRows(partOrderRows, filterFn);

  const statItems = useMemo(
    () => [
      { label: translate("partsOrders.stat.resultCount" as TranslationKey), value: resultCount, variant: "info" as const },
      { label: translate("partsOrders.stat.inTransit" as TranslationKey), value: rowData.filter((p) => p.status === "운송중").length, variant: "warning" as const },
      { label: translate("partsOrders.stat.done" as TranslationKey), value: rowData.filter((p) => p.status === "교체완료").length, variant: "success" as const },
    ],
    [translate, resultCount, rowData],
  );

  return (
    <Box>
      <PageToolbar>
        <PrimaryButton perm="create">{translate("partsOrders.toolbar.create" as TranslationKey)}</PrimaryButton>
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
        ]}
        onSearch={query.apply}
        onReset={query.reset}
        resultCount={resultCount}
      />

      <AgDataGrid title={translate("partsOrders.grid.title" as TranslationKey)} rowData={rowData} columnSet="partOrder" refreshKey={query.refreshKey} />
    </Box>
  );
}
