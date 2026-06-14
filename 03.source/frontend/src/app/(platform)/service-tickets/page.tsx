"use client";

import { useMemo } from "react";
import { Box } from "@mui/material";
import { AgDataGrid } from "@/components/grid/AgDataGrid";
import { PageToolbar } from "@/components/ui/PageComponents";
import { DataScopeBadge } from "@/components/ui/DataScopeBadge";
import { PrimaryButton, StatGrid } from "@/components/ui/mui-primitives";
import { QueryToolbar } from "@/components/ui/QueryToolbar";
import { useQueryState } from "@/hooks/useQueryState";
import { bindSearchFields } from "@/lib/grid/bind-search-fields";
import { createKeysetFetcher, countFilteredRows } from "@/lib/grid/keyset-fetch";
import { combineAnd, matchesDateRange, matchesIndexedFields, matchesSelectFilter } from "@/lib/grid/query-filter";
import { bindQueryToolbarDate } from "@/lib/grid/query-toolbar-date";
import { batchOperationalMeta, batchServiceTickets } from "@/lib/data/batch";
import { useLocale } from "@/contexts/LocaleContext";
import type { TranslationKey } from "@/lib/locale";
import { localeLabel } from "@/lib/locale/types";
import { SEARCH_FIELD_LABELS } from "@/lib/locale/search-fields";
import { localizeDomainValue } from "@/lib/locale/domain-labels";
import type { ServiceTicket } from "@/lib/types";

const STAGES = ["전체", "접수", "배정", "출동", "작업", "완료"];

const INITIAL_SEARCH = { id: "", equipmentSn: "", customer: "", symptom: "" };

export default function ServiceTicketsPage() {
  const { translate, language, formatAsOf } = useLocale();
  const query = useQueryState(INITIAL_SEARCH, { stage: "전체" });

  const searchDefs = useMemo(
    () => [
      { id: "id", label: translate("search.ticketId" as TranslationKey), indexKey: "ticket_id" },
      { id: "equipmentSn", label: localeLabel(SEARCH_FIELD_LABELS.equipmentSn, language), indexKey: "equipment_sn" },
      { id: "customer", label: localeLabel(SEARCH_FIELD_LABELS.customer, language), indexKey: "customer" },
      { id: "symptom", label: translate("search.symptom" as TranslationKey), indexKey: "symptom" },
    ],
    [language, translate],
  );

  const stageFilterOptions = useMemo(
    () =>
      STAGES.map((s) => ({
        value: s,
        label: s === "전체" ? translate("common.all" as TranslationKey) : localizeDomainValue(s, language),
      })),
    [language, translate],
  );

  const statItems = useMemo(() => {
    const open = batchServiceTickets.filter((t) => t.stage !== "완료");
    const slaRisk = batchServiceTickets.filter((t) => t.slaBreached || t.severity === "critical");
    return [
      { label: translate("serviceTickets.stat.open" as TranslationKey), value: open.length, variant: "warning" as const },
      {
        label: "Critical",
        value: batchServiceTickets.filter((t) => t.severity === "critical").length,
        variant: "danger" as const,
      },
      {
        label: translate("serviceTickets.stat.slaRisk" as TranslationKey),
        value: slaRisk.length,
        variant: "danger" as const,
        sub: translate("serviceTickets.stat.slaRiskSub" as TranslationKey),
      },
      {
        label: translate("serviceTickets.stat.done" as TranslationKey),
        value: batchServiceTickets.filter((t) => t.stage === "완료").length,
        variant: "success" as const,
      },
    ];
  }, [translate]);

  const filterFn = useMemo(() => {
    const { from, to } = query.applied.dateRange;
    return (t: ServiceTicket) =>
      combineAnd(
        matchesIndexedFields(query.applied.search, {
          id: t.id,
          equipmentSn: t.equipmentSn,
          customer: t.customer,
          symptom: t.symptom,
        }),
        matchesSelectFilter(query.applied.select.stage, t.stage),
        matchesDateRange(from, to, t.createdAt),
      );
  }, [query.applied]);

  const fetchRows = useMemo(
    () => createKeysetFetcher(batchServiceTickets, { idField: "id", filterFn }),
    [filterFn],
  );

  const batchAsOf = formatAsOf(batchOperationalMeta.asOf);

  return (
    <Box>
      <PageToolbar>
        <DataScopeBadge meta={batchOperationalMeta} />
        <PrimaryButton href="/service-progress" variant="outlined" menuId="service-progress" perm="view">
          {translate("serviceTickets.toolbar.progress" as TranslationKey)}
        </PrimaryButton>
        <PrimaryButton perm="create">{translate("serviceTickets.toolbar.create" as TranslationKey)}</PrimaryButton>
      </PageToolbar>

      <StatGrid items={statItems} />

      <QueryToolbar
        searchFields={bindSearchFields(searchDefs, query.search, query.setSearch)}
        {...bindQueryToolbarDate(query, translate)}
        filters={[
          {
            id: "stage",
            label: translate("filter.stage" as TranslationKey),
            value: query.selects.stage ?? "전체",
            options: stageFilterOptions,
            onChange: (v) => query.applyFilter("stage", v),
          },
        ]}
        onSearch={query.apply}
        onReset={query.reset}
        resultCount={countFilteredRows(batchServiceTickets, filterFn)}
      />

      <AgDataGrid
        title={translate("serviceTickets.grid.title" as TranslationKey)}
        subtitle={translate("serviceTickets.grid.subtitle" as TranslationKey).replace("{asOf}", batchAsOf)}
        fetchRows={fetchRows}
        columnSet="serviceTicket"
        refreshKey={query.refreshKey}
      />
    </Box>
  );
}
