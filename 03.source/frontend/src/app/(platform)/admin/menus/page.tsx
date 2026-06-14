"use client";

import { useMemo } from "react";
import { Box } from "@mui/material";
import { AgDataGrid } from "@/components/grid/AgDataGrid";
import { SectionCard } from "@/components/ui/PageComponents";
import { QueryToolbar } from "@/components/ui/QueryToolbar";
import { useQueryState } from "@/hooks/useQueryState";
import { useFilteredRows } from "@/hooks/useFilteredRows";
import { bindSearchFields } from "@/lib/grid/bind-search-fields";
import { menuActionPermRows } from "@/lib/auth/permissions";
import type { MenuActionPermRow } from "@/lib/auth/types";
import { combineAnd, matchesIndexedFields, matchesSelectFilter } from "@/lib/grid/query-filter";
import { menuPermissions } from "@/lib/menu-catalog";
import type { MenuPermission } from "@/lib/types";
import { useLocale } from "@/contexts/LocaleContext";
import type { TranslationKey } from "@/lib/locale";
import { localizeActionLabel } from "@/lib/locale/domain-labels";
import { localeLabel } from "@/lib/locale/types";

const ACTIONS = ["전체", "조회", "등록", "수정", "삭제", "보내기", "실행"];

const ACTION_TO_KEY: Record<string, string> = {
  조회: "view",
  등록: "create",
  수정: "update",
  삭제: "delete",
  보내기: "export",
  실행: "execute",
};

const INITIAL_SEARCH = { menuName: "", menuId: "" };

export default function AdminMenusPage() {
  const { translate, language } = useLocale();
  const query = useQueryState(INITIAL_SEARCH, { action: "전체" });

  const searchDefs = useMemo(
    () => [
      { id: "menuName", label: translate("search.menuName" as TranslationKey), indexKey: "menu_name" },
      { id: "menuId", label: translate("search.menuId" as TranslationKey), indexKey: "menu_id" },
    ],
    [translate],
  );

  const actionFilterOptions = useMemo(
    () =>
      ACTIONS.map((a) => ({
        value: a,
        label:
          a === "전체"
            ? translate("common.all" as TranslationKey)
            : localizeActionLabel(ACTION_TO_KEY[a] ?? a, language),
      })),
    [language, translate],
  );

  const menuFilter = useMemo(
    () => (m: MenuPermission) =>
      matchesIndexedFields(query.applied.search, {
        menuName: localeLabel(m.menuName, language),
        menuId: m.menuId,
      }),
    [query.applied, language],
  );

  const actionFilter = useMemo(
    () => (row: MenuActionPermRow) =>
      combineAnd(
        matchesIndexedFields(query.applied.search, {
          menuName: localeLabel(row.menuName, language),
          menuId: row.menuId,
        }),
        matchesSelectFilter(query.applied.select.action, row.actionLabel),
      ),
    [query.applied, language],
  );

  const { rowData: menuRows, resultCount: menuCount } = useFilteredRows(menuPermissions, menuFilter, {
    idField: "menuId",
  });
  const { rowData: actionRows, resultCount: actionCount } = useFilteredRows(menuActionPermRows, actionFilter);

  return (
    <Box>
      <QueryToolbar
        searchFields={bindSearchFields(searchDefs, query.search, query.setSearch)}
        filters={[
          {
            id: "action",
            label: translate("adminMenus.filter.action" as TranslationKey),
            value: query.selects.action ?? "전체",
            options: actionFilterOptions,
            onChange: (v) => query.applyFilter("action", v),
          },
        ]}
        onSearch={query.apply}
        onReset={query.reset}
        resultCount={menuCount + actionCount}
      />

      <SectionCard title={translate("adminMenus.section.menuAccess" as TranslationKey)}>
        <AgDataGrid
          title={translate("adminMenus.grid.menuMatrix" as TranslationKey)}
          rowData={menuRows}
          columnSet="menuPerm"
          idField="menuId"
          menuId="admin-menus"
          refreshKey={query.refreshKey}
        />
      </SectionCard>

      <SectionCard title={translate("adminMenus.section.actionPerm" as TranslationKey)}>
        <AgDataGrid
          title={translate("adminMenus.grid.actionMatrix" as TranslationKey)}
          subtitle={translate("adminMenus.grid.actionMatrixSub" as TranslationKey)}
          rowData={actionRows}
          columnSet="menuActionPerm"
          idField="id"
          menuId="admin-menus"
          refreshKey={query.refreshKey}
        />
      </SectionCard>
    </Box>
  );
}
