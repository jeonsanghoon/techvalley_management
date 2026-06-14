"use client";

import { useMemo } from "react";
import { Box } from "@mui/material";
import { AgDataGrid } from "@/components/grid/AgDataGrid";
import { PageToolbar, SectionCard } from "@/components/ui/PageComponents";
import { KeyValueGrid } from "@/components/ui/mui-primitives";
import { QueryToolbar } from "@/components/ui/QueryToolbar";
import { useQueryState } from "@/hooks/useQueryState";
import { useFilteredRows } from "@/hooks/useFilteredRows";
import { bindSearchFields } from "@/lib/grid/bind-search-fields";
import { combineAnd, matchesDateRange, matchesIndexedFields, matchesSelectFilter } from "@/lib/grid/query-filter";
import { bindQueryToolbarDate } from "@/lib/grid/query-toolbar-date";
import { DataScopeBadge } from "@/components/ui/DataScopeBadge";
import { batchIotThings, batchOperationalMeta } from "@/lib/data/batch";
import { useLocale } from "@/contexts/LocaleContext";
import type { TranslationKey } from "@/lib/locale";
import { localeLabel } from "@/lib/locale/types";
import { SEARCH_FIELD_LABELS } from "@/lib/locale/search-fields";
import { localizeDomainValue } from "@/lib/locale/domain-labels";
import type { IotThingAuth } from "@/lib/types";

const STATUSES = ["전체", "connected", "disconnected", "pending"];

const INITIAL_SEARCH = { sn: "", thing: "", cert: "", policy: "" };

export default function AdminIotAuthPage() {
  const { translate, language } = useLocale();
  const query = useQueryState(INITIAL_SEARCH, { status: "전체" });

  const searchDefs = useMemo(
    () => [
      { id: "sn", label: localeLabel(SEARCH_FIELD_LABELS.serialNo, language), indexKey: "sn" },
      { id: "thing", label: translate("search.thing" as TranslationKey), indexKey: "thing" },
      { id: "cert", label: translate("search.certificate" as TranslationKey), indexKey: "cert" },
      { id: "policy", label: translate("search.policy" as TranslationKey), indexKey: "policy" },
    ],
    [language, translate],
  );

  const statusFilterOptions = useMemo(
    () =>
      STATUSES.map((s) => ({
        value: s,
        label: s === "전체" ? translate("common.all" as TranslationKey) : localizeDomainValue(s, language),
      })),
    [language, translate],
  );

  const authConfigItems = useMemo(
    () => [
      { label: translate("adminIotAuth.config.provisioning" as TranslationKey), value: "JITP (Just-In-Time Provisioning)" },
      { label: translate("adminIotAuth.config.transport" as TranslationKey), value: "MQTT over TLS 1.3" },
      { label: translate("adminIotAuth.config.credentials" as TranslationKey), value: "Secrets Manager · KMS CMK" },
      { label: translate("adminIotAuth.config.policyTemplate" as TranslationKey), value: "tv-critical-policy / tv-standard-policy" },
    ],
    [translate],
  );

  const filterFn = useMemo(
    () => {
      const { from, to } = query.applied.dateRange;
      return (t: IotThingAuth) =>
        combineAnd(
          matchesIndexedFields(query.applied.search, {
            sn: t.sn,
            thing: t.thing,
            cert: t.cert,
            policy: t.policy,
          }),
          matchesSelectFilter(query.applied.select.status, t.status),
          matchesDateRange(from, to, t.lastSeenAt),
        );
    },
    [query.applied],
  );

  const { rowData, resultCount } = useFilteredRows(batchIotThings, filterFn);

  return (
    <Box>
      <PageToolbar>
        <DataScopeBadge meta={batchOperationalMeta} />
      </PageToolbar>

      <QueryToolbar
        searchFields={bindSearchFields(searchDefs, query.search, query.setSearch)}
        {...bindQueryToolbarDate(query, translate)}
        filters={[
          {
            id: "status",
            label: translate("filter.connection" as TranslationKey),
            value: query.selects.status ?? "전체",
            options: statusFilterOptions,
            onChange: (v) => query.applyFilter("status", v),
          },
        ]}
        onSearch={query.apply}
        onReset={query.reset}
        resultCount={resultCount}
      />

      <SectionCard title={translate("adminIotAuth.section.config" as TranslationKey)}>
        <KeyValueGrid items={authConfigItems} />
      </SectionCard>

      <AgDataGrid
        title={translate("adminIotAuth.grid.title" as TranslationKey)}
        rowData={rowData}
        columnSet="iotThing"
        idField="id"
        refreshKey={query.refreshKey}
      />
    </Box>
  );
}
