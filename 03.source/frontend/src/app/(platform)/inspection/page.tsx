"use client";

import { useMemo } from "react";
import { Box } from "@mui/material";
import { AgDataGrid } from "@/components/grid/AgDataGrid";
import { PageToolbar, Card, SectionCard } from "@/components/ui/PageComponents";
import { PrimaryButton, StatGrid } from "@/components/ui/mui-primitives";
import { QueryToolbar } from "@/components/ui/QueryToolbar";
import { useQueryState } from "@/hooks/useQueryState";
import { useFilteredRows } from "@/hooks/useFilteredRows";
import { bindSearchFields } from "@/lib/grid/bind-search-fields";
import { combineAnd, matchesDateRange, matchesIndexedFields, matchesSelectFilter } from "@/lib/grid/query-filter";
import { bindQueryToolbarDate } from "@/lib/grid/query-toolbar-date";
import { DataScopeBadge } from "@/components/ui/DataScopeBadge";
import { fallbackMeta, getListItems, useAlgorithms, useYieldRecords, useEnumCodes } from "@/lib/api/hooks";
import { useLocale } from "@/contexts/LocaleContext";
import type { TranslationKey } from "@/lib/locale";
import { localeLabel } from "@/lib/locale/types";
import { SEARCH_FIELD_LABELS } from "@/lib/locale/search-fields";
import type { AlgorithmConfig, YieldRecord } from "@/lib/types";

const INITIAL_SEARCH = { algName: "", algVersion: "", equipmentSn: "", lotNo: "", serialNo: "" };

export default function InspectionPage() {
  const { translate, language, formatAsOf } = useLocale();
  const { data: algorithmData } = useAlgorithms();
  const { data: algStatusCodesData } = useEnumCodes("ALGS");
  const algorithmRows = getListItems(algorithmData);
  const dataMeta = algorithmData?.meta ?? fallbackMeta("/inspection/algorithms");
  const { data: yieldData } = useYieldRecords();
  const yieldRowsSource = getListItems(yieldData);
  const query = useQueryState(INITIAL_SEARCH, { algStatus: "전체" });

  const searchDefs = useMemo(
    () => [
      { id: "algName", label: translate("search.algorithm" as TranslationKey), indexKey: "alg_name" },
      { id: "algVersion", label: translate("search.version" as TranslationKey), indexKey: "alg_version" },
      { id: "equipmentSn", label: localeLabel(SEARCH_FIELD_LABELS.equipmentSn, language), indexKey: "equipment_sn" },
      { id: "lotNo", label: translate("search.lot" as TranslationKey), indexKey: "lot_no" },
      { id: "serialNo", label: localeLabel(SEARCH_FIELD_LABELS.serialNo, language), indexKey: "serial_no" },
    ],
    [language, translate],
  );

  const algStatusFilterOptions = useMemo(
    () => [
      { value: "전체", label: translate("common.all" as TranslationKey) },
      ...getListItems(algStatusCodesData).map((c) => ({ value: c.code, label: c.name })),
    ],
    [algStatusCodesData, translate],
  );

  const algFilter = useMemo(
    () => (a: AlgorithmConfig) =>
      combineAnd(
        matchesIndexedFields(query.applied.search, {
          algName: a.name,
          algVersion: a.version,
        }),
        matchesSelectFilter(query.applied.select.algStatus, a.status),
      ),
    [query.applied],
  );

  const yieldFilter = useMemo(
    () => {
      const { from, to } = query.applied.dateRange;
      return (y: YieldRecord) =>
        combineAnd(
          matchesIndexedFields(query.applied.search, {
            equipmentSn: y.equipmentSn,
            lotNo: y.lotNo,
            serialNo: y.serialNo,
          }),
          matchesDateRange(from, to, y.inspectedAt),
        );
    },
    [query.applied],
  );

  const { rowData: algRows } = useFilteredRows(algorithmRows, algFilter);
  const { rowData: yieldRows, resultCount } = useFilteredRows(yieldRowsSource, yieldFilter);

  const avg = yieldRows.reduce((s, r) => s + r.yieldPct, 0) / (yieldRows.length || 1);
  const activeAlg = algRows.find((a) => a.status === "active") ?? algorithmRows.find((a) => a.status === "active");
  const batchAsOf = formatAsOf(dataMeta.asOf);

  const statItems = useMemo(
    () => [
      { label: translate("inspection.stat.avgYield" as TranslationKey), value: `${avg.toFixed(1)}%`, variant: "success" as const },
      { label: translate("inspection.stat.activeAlg" as TranslationKey), value: activeAlg?.version ?? "—", variant: "info" as const },
      { label: "Threshold", value: `${activeAlg?.threshold ?? "—"}%`, variant: "warning" as const },
      { label: translate("inspection.stat.lotCount" as TranslationKey), value: yieldRows.length },
    ],
    [translate, avg, activeAlg, yieldRows.length],
  );

  return (
    <Box>
      <PageToolbar>
        <DataScopeBadge meta={dataMeta} />
        <PrimaryButton perm="create">{translate("inspection.toolbar.create" as TranslationKey)}</PrimaryButton>
      </PageToolbar>

      <QueryToolbar
        searchFields={bindSearchFields(searchDefs, query.search, query.setSearch)}
        {...bindQueryToolbarDate(query, translate)}
        filters={[
          {
            id: "algStatus",
            label: translate("inspection.filter.algStatus" as TranslationKey),
            value: query.selects.algStatus ?? "전체",
            options: algStatusFilterOptions,
            onChange: (v) => query.applyFilter("algStatus", v),
          },
        ]}
        onSearch={query.apply}
        onReset={query.reset}
        resultCount={resultCount}
      />

      <StatGrid items={statItems} />

      <SectionCard title={translate("inspection.section.algorithm" as TranslationKey)}>
        <AgDataGrid
          title={translate("inspection.grid.algorithmTitle" as TranslationKey)}
          subtitle={translate("inspection.grid.algorithmSub" as TranslationKey)}
          rowData={algRows}
          columnSet="algorithm"
          refreshKey={query.refreshKey}
        />
      </SectionCard>

      <Card title={translate("inspection.card.criteria" as TranslationKey)}>
        {translate("inspection.card.criteriaBody" as TranslationKey)
          .replace("{threshold}", String(activeAlg?.threshold ?? 92))
          .replace("{name}", activeAlg?.name ?? "Yield Standard")
          .replace("{version}", activeAlg?.version ?? "v2.1.0")}
      </Card>

      <AgDataGrid
        title={translate("inspection.grid.yieldTitle" as TranslationKey)}
        subtitle={translate("inspection.grid.yieldSub" as TranslationKey).replace("{asOf}", batchAsOf)}
        rowData={yieldRows}
        columnSet="yield"
        refreshKey={query.refreshKey}
      />
    </Box>
  );
}
