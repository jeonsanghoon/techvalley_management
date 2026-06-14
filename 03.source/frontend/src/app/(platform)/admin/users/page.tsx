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
import { useLocale } from "@/contexts/LocaleContext";
import type { TranslationKey } from "@/lib/locale";
import { localizeAppRole } from "@/lib/locale/domain-labels";
import { users } from "@/lib/mock-data";
import type { UserAccount } from "@/lib/types";

const ROLES = ["시스템 관리자", "서비스 엔지니어", "상담·CS", "고객사·대리점"];

const INITIAL_SEARCH = { name: "", email: "", role: "", region: "" };

const ROLE_TO_APP: Record<string, string> = {
  "시스템 관리자": "admin",
  "서비스 엔지니어": "engineer",
  "상담·CS": "cs",
  "고객사·대리점": "customer",
};

export default function AdminUsersPage() {
  const { translate, language } = useLocale();
  const query = useQueryState(INITIAL_SEARCH, { role: "전체", active: "전체" });

  const searchDefs = useMemo(
    () => [
      { id: "name", label: translate("search.name" as TranslationKey), indexKey: "name" },
      { id: "email", label: translate("search.email" as TranslationKey), indexKey: "email" },
      { id: "role", label: translate("filter.role" as TranslationKey), indexKey: "role" },
      { id: "region", label: translate("filter.region" as TranslationKey), indexKey: "region" },
    ],
    [language, translate],
  );

  const roleFilterOptions = useMemo(
    () =>
      ROLES.map((r) => ({
        value: r,
        label: localizeAppRole(ROLE_TO_APP[r] ?? r, language),
      })),
    [language],
  );

  const activeFilterOptions = useMemo(
    () => [
      { value: "Y", label: translate("filter.active" as TranslationKey) },
      { value: "N", label: translate("filter.inactive" as TranslationKey) },
    ],
    [translate],
  );

  const filterFn = useMemo(
    () => (u: UserAccount) =>
      combineAnd(
        matchesIndexedFields(query.applied.search, {
          name: u.name,
          email: u.email,
          role: u.role,
          region: u.region,
        }),
        matchesSelectFilter(query.applied.select.role, u.role),
        matchesBoolSelectFilter(query.applied.select.active, u.active),
      ),
    [query.applied],
  );

  const { rowData, resultCount } = useFilteredRows(users, filterFn);

  return (
    <Box>
      <PageToolbar>
        <PrimaryButton perm="create">{translate("adminUsers.toolbar.create" as TranslationKey)}</PrimaryButton>
      </PageToolbar>

      <QueryToolbar
        searchFields={bindSearchFields(searchDefs, query.search, query.setSearch)}
        filters={[
          {
            id: "role",
            label: translate("filter.role" as TranslationKey),
            value: query.selects.role ?? "전체",
            options: roleFilterOptions,
            onChange: (v) => query.applyFilter("role", v),
          },
          {
            id: "active",
            label: translate("filter.status" as TranslationKey),
            value: query.selects.active ?? "전체",
            options: activeFilterOptions,
            onChange: (v) => query.applyFilter("active", v),
          },
        ]}
        onSearch={query.apply}
        onReset={query.reset}
        resultCount={resultCount}
      />

      <AgDataGrid
        title={translate("adminUsers.grid.title" as TranslationKey)}
        rowData={rowData}
        columnSet="user"
        refreshKey={query.refreshKey}
      />
    </Box>
  );
}
