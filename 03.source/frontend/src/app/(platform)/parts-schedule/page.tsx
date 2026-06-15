"use client";

import { useMemo } from "react";
import { Box, Grid } from "@mui/material";
import { AgDataGrid } from "@/components/grid/AgDataGrid";
import { SectionCard } from "@/components/ui/PageComponents";
import { StatGrid, TagList } from "@/components/ui/mui-primitives";
import { getListItems, usePartSchedules, useEnumCodes } from "@/lib/api/hooks";
import { QueryToolbar } from "@/components/ui/QueryToolbar";
import { useQueryState } from "@/hooks/useQueryState";
import { useFilteredRows } from "@/hooks/useFilteredRows";
import { bindSearchFields } from "@/lib/grid/bind-search-fields";
import { combineAnd, matchesDateRange, matchesIndexedFields, matchesSelectFilter } from "@/lib/grid/query-filter";
import { bindQueryToolbarDate } from "@/lib/grid/query-toolbar-date";
import { useLocale } from "@/contexts/LocaleContext";
import type { TranslationKey } from "@/lib/locale";
import { localeLabel } from "@/lib/locale/types";
import { SEARCH_FIELD_LABELS } from "@/lib/locale/search-fields";
import type { PartSchedule } from "@/lib/types";

const INITIAL_SEARCH = { orderId: "", ticketId: "", equipmentSn: "", customer: "", partName: "", engineerName: "", trackingNo: "" };

export default function PartsSchedulePage() {
  const { translate, language } = useLocale();
  const { data: scheduleData } = usePartSchedules();
  const scheduleRows = getListItems(scheduleData);
  const { data: podStatusCodesData } = useEnumCodes("PRST");
  const query = useQueryState(INITIAL_SEARCH, { podStatus: "전체" });

  const searchDefs = useMemo(
    () => [
      { id: "orderId", label: translate("search.orderId" as TranslationKey), indexKey: "order_id" },
      { id: "ticketId", label: translate("search.ticketId" as TranslationKey), indexKey: "ticket_id" },
      { id: "equipmentSn", label: localeLabel(SEARCH_FIELD_LABELS.equipmentSn, language), indexKey: "equipment_sn" },
      { id: "customer", label: localeLabel(SEARCH_FIELD_LABELS.customer, language), indexKey: "customer" },
      { id: "partName", label: translate("search.partName" as TranslationKey), indexKey: "part_name" },
      { id: "engineerName", label: translate("search.engineer" as TranslationKey), indexKey: "engineer_name" },
      { id: "trackingNo", label: localeLabel(SEARCH_FIELD_LABELS.trackingNo, language), indexKey: "tracking_no" },
    ],
    [language, translate],
  );

  const podStatusFilterOptions = useMemo(
    () => [
      { value: "전체", label: translate("common.all" as TranslationKey) },
      ...getListItems(podStatusCodesData).map((c) => ({ value: c.code, label: c.name })),
    ],
    [podStatusCodesData, translate],
  );

  const scheduleStageTags = useMemo(
    () => [
      translate("partsSchedule.stage.orderRequest" as TranslationKey),
      translate("partsSchedule.stage.shipPlan" as TranslationKey),
      translate("partsSchedule.stage.deliveryEta" as TranslationKey),
      translate("partsSchedule.stage.visit" as TranslationKey),
      translate("partsSchedule.stage.replacePod" as TranslationKey),
      translate("partsSchedule.stage.delayAlert" as TranslationKey),
    ],
    [translate],
  );

  const filterFn = useMemo(
    () => {
      const { from, to } = query.applied.dateRange;
      return (s: PartSchedule) =>
        combineAnd(
          matchesIndexedFields(query.applied.search, {
            orderId: s.orderId,
            ticketId: s.ticketId,
            equipmentSn: s.equipmentSn,
            customer: s.customer,
            partName: s.partName,
            engineerName: s.engineerName,
            trackingNo: s.trackingNo,
          }),
          matchesSelectFilter(query.applied.select.podStatus, s.podStatus),
          matchesDateRange(from, to, s.eta),
        );
    },
    [query.applied],
  );

  const { fetchRows, resultCount, rowData } = useFilteredRows(scheduleRows, filterFn);
  const delayed = rowData.filter((s) => s.delayDays > 0);
  const inTransit = rowData.filter((s) => s.podStatus === "in_transit" || s.podStatus === "운송중");

  const statItems = useMemo(
    () => [
      { label: translate("partsSchedule.stat.resultCount" as TranslationKey), value: resultCount, variant: "info" as const },
      { label: translate("partsSchedule.stat.inTransit" as TranslationKey), value: inTransit.length, variant: "warning" as const },
      { label: translate("partsSchedule.stat.delayed" as TranslationKey), value: delayed.length, variant: "danger" as const },
      { label: translate("partsSchedule.stat.replaced" as TranslationKey), value: rowData.filter((s) => s.podStatus === "completed" || s.podStatus === "교체완료").length, variant: "success" as const },
    ],
    [translate, resultCount, inTransit.length, delayed.length, rowData],
  );

  const visitTags = useMemo(
    () =>
      rowData
        .filter((s) => s.visitPlannedAt === new Date().toISOString().split("T")[0])
        .map((s) =>
          translate("partsSchedule.visitTag" as TranslationKey)
            .replace("{engineer}", s.engineerName ?? translate("partsSchedule.unassigned" as TranslationKey))
            .replace("{site}", s.site),
        ),
    [rowData, translate],
  );

  return (
    <Box>
      <StatGrid items={statItems} />

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <SectionCard title={translate("partsSchedule.section.stages" as TranslationKey)}>
            <TagList tags={scheduleStageTags} />
          </SectionCard>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <SectionCard title={translate("partsSchedule.section.todayVisits" as TranslationKey)}>
            <TagList tags={visitTags} />
          </SectionCard>
        </Grid>
      </Grid>

      <QueryToolbar
        searchFields={bindSearchFields(searchDefs, query.search, query.setSearch)}
        {...bindQueryToolbarDate(query, translate)}
        filters={[
          {
            id: "podStatus",
            label: translate("partsSchedule.filter.podStatus" as TranslationKey),
            value: query.selects.podStatus ?? "전체",
            options: podStatusFilterOptions,
            onChange: (v) => query.applyFilter("podStatus", v),
          },
        ]}
        onSearch={query.apply}
        onReset={query.reset}
        resultCount={resultCount}
      />

      <AgDataGrid
        title={translate("partsSchedule.grid.title" as TranslationKey)}
        subtitle={translate("partsSchedule.grid.subtitle" as TranslationKey)}
        fetchRows={fetchRows}
        columnSet="partSchedule"
        refreshKey={query.refreshKey}
      />
    </Box>
  );
}
