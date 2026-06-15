"use client";

import { useMemo } from "react";
import { Box, Grid, Stack, Typography } from "@mui/material";
import { AgDataGrid } from "@/components/grid/AgDataGrid";
import { PageToolbar, Card, StageTracker, ToneCard } from "@/components/ui/PageComponents";
import { DataScopeBadge } from "@/components/ui/DataScopeBadge";
import { statusToTone } from "@/lib/ui/card-tones";
import { QueryToolbar } from "@/components/ui/QueryToolbar";
import { useQueryState } from "@/hooks/useQueryState";
import { useFilteredRows } from "@/hooks/useFilteredRows";
import { bindSearchFields } from "@/lib/grid/bind-search-fields";
import { combineAnd, matchesDateRange, matchesIndexedFields, matchesSelectFilter } from "@/lib/grid/query-filter";
import { bindQueryToolbarDate } from "@/lib/grid/query-toolbar-date";
import { fallbackMeta, getListItems, useEngineers, useServiceTickets, useEnumCodes } from "@/lib/api/hooks";
import { useLocale } from "@/contexts/LocaleContext";
import type { TranslationKey } from "@/lib/locale";
import { localeLabel } from "@/lib/locale/types";
import { SEARCH_FIELD_LABELS } from "@/lib/locale/search-fields";
import type { ServiceTicket } from "@/lib/types";

const INITIAL_SEARCH = { id: "", equipmentSn: "", customer: "", engineerName: "" };

export default function ServiceProgressPage() {
  const { translate, language, formatAsOf } = useLocale();
  const { data: ticketData } = useServiceTickets();
  const { data: stageCodesData } = useEnumCodes("TKST");
  const ticketRows = getListItems(ticketData);
  const dataMeta = ticketData?.meta ?? fallbackMeta("/service/tickets");
  const { data: engineerData } = useEngineers();
  const engineerRows = getListItems(engineerData);
  const query = useQueryState(INITIAL_SEARCH, { stage: "전체" });

  const searchDefs = useMemo(
    () => [
      { id: "id", label: translate("search.ticketId" as TranslationKey), indexKey: "ticket_id" },
      { id: "equipmentSn", label: localeLabel(SEARCH_FIELD_LABELS.equipmentSn, language), indexKey: "equipment_sn" },
      { id: "customer", label: localeLabel(SEARCH_FIELD_LABELS.customer, language), indexKey: "customer" },
      { id: "engineerName", label: translate("search.engineer" as TranslationKey), indexKey: "engineer_name" },
    ],
    [language, translate],
  );

  const stageFilterOptions = useMemo(
    () => [
      { value: "전체", label: translate("common.all" as TranslationKey) },
      ...getListItems(stageCodesData).map((c) => ({ value: c.code, label: c.name })),
    ],
    [stageCodesData, translate],
  );

  const filterFn = useMemo(
    () => {
      const { from, to } = query.applied.dateRange;
      return (t: ServiceTicket) =>
        combineAnd(
          matchesIndexedFields(query.applied.search, {
            id: t.id,
            equipmentSn: t.equipmentSn,
            customer: t.customer,
            engineerName: t.engineerName,
          }),
          matchesSelectFilter(query.applied.select.stage, t.stage),
          matchesDateRange(from, to, t.createdAt),
        );
    },
    [query.applied],
  );

  const { rowData, resultCount } = useFilteredRows(ticketRows, filterFn);
  const active = rowData.filter((t) => t.stage !== "closed" && t.stage !== "완료");
  const batchAsOf = formatAsOf(dataMeta.asOf);

  const engineerFilter = useMemo(
    () =>
      engineerRows.filter((e) =>
        matchesIndexedFields(query.applied.search, { engineerName: e.name }),
      ),
    [query.applied, engineerRows],
  );

  return (
    <Box>
      <PageToolbar>
        <DataScopeBadge meta={dataMeta} />
      </PageToolbar>

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
        resultCount={resultCount}
      />

      <Card title={translate("serviceProgress.card.engineers" as TranslationKey)} tone="success">
        <Grid container spacing={2}>
          {engineerFilter.map((e) => (
            <Grid key={e.id} size={{ xs: 12, sm: 6, lg: 3 }}>
              <ToneCard
                title={e.name}
                subtitle={translate("serviceProgress.engineer.subtitle" as TranslationKey)
                  .replace("{region}", e.region)
                  .replace("{status}", e.status)
                  .replace("{count}", String(e.assignedTickets))}
                tone={statusToTone(e.status)}
              />
            </Grid>
          ))}
        </Grid>
      </Card>

      {active.map((t) => (
        <Card key={t.id} tone="warning">
          <Stack spacing={1}>
            <Typography variant="subtitle2" color="text.primary">
              {t.id} — {t.equipmentSn}
            </Typography>
            <StageTracker currentStage={t.stage} />
          </Stack>
        </Card>
      ))}

      <AgDataGrid
        title={translate("serviceProgress.grid.title" as TranslationKey)}
        subtitle={translate("serviceProgress.grid.subtitle" as TranslationKey).replace("{asOf}", batchAsOf)}
        rowData={rowData}
        columnSet="serviceTicket"
        refreshKey={query.refreshKey}
      />
    </Box>
  );
}
