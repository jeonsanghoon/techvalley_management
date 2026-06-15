"use client";

import { useMemo } from "react";
import { Box } from "@mui/material";
import { AgDataGrid } from "@/components/grid/AgDataGrid";
import { SectionCard } from "@/components/ui/PageComponents";
import { StatGrid } from "@/components/ui/mui-primitives";
import { QueryToolbar } from "@/components/ui/QueryToolbar";
import { useQueryState } from "@/hooks/useQueryState";
import { useFilteredRows } from "@/hooks/useFilteredRows";
import { bindSearchFields } from "@/lib/grid/bind-search-fields";
import { combineAnd, matchesDateRange, matchesIndexedFields, matchesSelectFilter } from "@/lib/grid/query-filter";
import { bindQueryToolbarDate } from "@/lib/grid/query-toolbar-date";
import { getListItems, useCustomers, useSites } from "@/lib/api/hooks";
import { useLocale } from "@/contexts/LocaleContext";
import type { TranslationKey } from "@/lib/locale";
import { localeLabel } from "@/lib/locale/types";
import { SEARCH_FIELD_LABELS } from "@/lib/locale/search-fields";
import { localizeDomainValue } from "@/lib/locale/domain-labels";
import type { Customer, Site } from "@/lib/types";

const INITIAL_SEARCH = { customerName: "", siteName: "", address: "" };

export default function CustomersPage() {
  const { translate, language } = useLocale();
  const { data: customerData } = useCustomers();
  const customers = getListItems(customerData);
  const { data: siteData } = useSites();
  const sites = getListItems(siteData);
  const query = useQueryState(INITIAL_SEARCH, { type: "전체", region: "전체" });

  const searchDefs = useMemo(
    () => [
      { id: "customerName", label: localeLabel(SEARCH_FIELD_LABELS.customerName, language), indexKey: "customer_name" },
      { id: "siteName", label: localeLabel(SEARCH_FIELD_LABELS.siteName, language), indexKey: "site_name" },
      { id: "address", label: localeLabel(SEARCH_FIELD_LABELS.address, language), indexKey: "address" },
    ],
    [language],
  );

  const typeFilterOptions = useMemo(
    () => [
      { value: "고객사", label: localizeDomainValue("고객사", language) },
      { value: "대리점", label: localizeDomainValue("대리점", language) },
    ],
    [language, translate],
  );

  const { from, to } = query.applied.dateRange;

  const customerFilter = useMemo(
    () => (c: Customer) =>
      combineAnd(
        matchesIndexedFields(query.applied.search, {
          customerName: c.name,
        }),
        matchesSelectFilter(query.applied.select.type, c.type),
        matchesSelectFilter(query.applied.select.region, c.region),
        matchesDateRange(from, to, c.registeredAt),
      ),
    [query.applied, from, to],
  );

  const siteFilter = useMemo(
    () => (s: Site) =>
      combineAnd(
        matchesIndexedFields(query.applied.search, {
          customerName: s.customerName,
          siteName: s.name,
          address: s.address,
        }),
        matchesSelectFilter(query.applied.select.region, s.region),
        matchesDateRange(from, to, s.installedAt),
      ),
    [query.applied, from, to],
  );

  const { rowData: customerRows, resultCount: customerCount } = useFilteredRows(customers, customerFilter);
  const { rowData: siteRows, resultCount: siteCount } = useFilteredRows(sites, siteFilter, { idField: "id" });

  const regions = useMemo(
    () =>
      [
        "전체",
        ...Array.from(
          new Set(
            [...customers, ...sites]
              .map((r) => ("region" in r ? r.region : ""))
              .filter(Boolean),
          ),
        ),
      ],
    [customers, sites],
  );

  const regionFilterOptions = useMemo(
    () =>
      regions.map((r) => ({
        value: r,
        label: r === "전체" ? translate("common.all" as TranslationKey) : r,
      })),
    [regions, translate],
  );

  const statItems = useMemo(
    () => [
      { label: translate("customers.stat.accounts" as TranslationKey), value: customerCount, variant: "info" as const },
      { label: translate("customers.stat.sites" as TranslationKey), value: siteCount, variant: "success" as const },
      { label: translate("customers.stat.totalAccounts" as TranslationKey), value: customers.length, variant: "default" as const },
      { label: translate("customers.stat.totalSites" as TranslationKey), value: sites.length, variant: "default" as const },
    ],
    [translate, customerCount, siteCount, customers.length, sites.length],
  );

  return (
    <Box>
      <StatGrid items={statItems} />

      <QueryToolbar
        searchFields={bindSearchFields(searchDefs, query.search, query.setSearch)}
        {...bindQueryToolbarDate(query, translate)}
        filters={[
          {
            id: "type",
            label: translate("filter.type" as TranslationKey),
            value: query.selects.type ?? "전체",
            options: typeFilterOptions,
            onChange: (v) => query.applyFilter("type", v),
          },
          {
            id: "region",
            label: translate("filter.region" as TranslationKey),
            value: query.selects.region ?? "전체",
            options: regionFilterOptions,
            onChange: (v) => query.applyFilter("region", v),
          },
        ]}
        onSearch={query.apply}
        onReset={query.reset}
        resultCount={customerCount + siteCount}
      />

      <SectionCard title={translate("customers.section.accounts" as TranslationKey)} tone="primary">
        <AgDataGrid
          title={translate("customers.section.accounts" as TranslationKey)}
          rowData={customerRows}
          columnSet="customer"
          refreshKey={query.refreshKey}
          enableRowSelection={false}
        />
      </SectionCard>

      <SectionCard title={translate("customers.section.sites" as TranslationKey)} tone="info">
        <AgDataGrid
          title={translate("customers.section.sites" as TranslationKey)}
          rowData={siteRows}
          columnSet="site"
          refreshKey={query.refreshKey}
          enableRowSelection={false}
        />
      </SectionCard>
    </Box>
  );
}
