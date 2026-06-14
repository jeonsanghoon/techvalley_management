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
import { notificationChannels } from "@/lib/mock-data";
import { useLocale } from "@/contexts/LocaleContext";
import type { TranslationKey } from "@/lib/locale";
import { localeLabel } from "@/lib/locale/types";
import { SEARCH_FIELD_LABELS } from "@/lib/locale/search-fields";
import type { NotificationChannel } from "@/lib/types";

const TYPES = ["SNS", "SES", "Dashboard", "Webhook"];

const INITIAL_SEARCH = { name: "", target: "", recipients: "", description: "" };

export default function SettingsNotificationsPage() {
  const { translate, language } = useLocale();
  const query = useQueryState(INITIAL_SEARCH, { type: "전체", enabled: "전체" });

  const searchDefs = useMemo(
    () => [
      { id: "name", label: translate("search.channelName" as TranslationKey), indexKey: "name" },
      { id: "target", label: localeLabel(SEARCH_FIELD_LABELS.target, language), indexKey: "target" },
      { id: "recipients", label: localeLabel(SEARCH_FIELD_LABELS.recipients, language), indexKey: "recipients" },
      { id: "description", label: localeLabel(SEARCH_FIELD_LABELS.description, language), indexKey: "description" },
    ],
    [language, translate],
  );

  const typeFilterOptions = useMemo(
    () => TYPES.map((t) => ({ value: t, label: t })),
    [],
  );

  const enabledFilterOptions = useMemo(
    () => [
      { value: "Y", label: translate("filter.active" as TranslationKey) },
      { value: "N", label: translate("filter.inactive" as TranslationKey) },
    ],
    [translate],
  );

  const filterFn = useMemo(
    () => (c: NotificationChannel) =>
      combineAnd(
        matchesIndexedFields(query.applied.search, {
          name: c.name,
          target: c.target,
          recipients: c.recipients,
          description: c.description,
        }),
        matchesSelectFilter(query.applied.select.type, c.type),
        matchesBoolSelectFilter(query.applied.select.enabled, c.enabled),
      ),
    [query.applied],
  );

  const { rowData, resultCount } = useFilteredRows(notificationChannels, filterFn);

  return (
    <Box>
      <PageToolbar>
        <PrimaryButton perm="create">{translate("settingsNotifications.toolbar.create" as TranslationKey)}</PrimaryButton>
      </PageToolbar>

      <QueryToolbar
        searchFields={bindSearchFields(searchDefs, query.search, query.setSearch)}
        filters={[
          {
            id: "type",
            label: translate("filter.type" as TranslationKey),
            value: query.selects.type ?? "전체",
            options: typeFilterOptions,
            onChange: (v) => query.applyFilter("type", v),
          },
          {
            id: "enabled",
            label: translate("filter.enabled" as TranslationKey),
            value: query.selects.enabled ?? "전체",
            options: enabledFilterOptions,
            onChange: (v) => query.applyFilter("enabled", v),
          },
        ]}
        onSearch={query.apply}
        onReset={query.reset}
        resultCount={resultCount}
      />

      <AgDataGrid
        title={translate("settingsNotifications.grid.title" as TranslationKey)}
        rowData={rowData}
        columnSet="notificationChannel"
        refreshKey={query.refreshKey}
      />
    </Box>
  );
}
