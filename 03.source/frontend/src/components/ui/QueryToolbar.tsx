"use client";

import {
  Box,
  Button,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Card,
  CardContent,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import type { ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLocale } from "@/contexts/LocaleContext";
import type { DataScope } from "@/lib/data/scope";
import type { DateRange, DateRangePreset } from "@/lib/ui/date-range";
import { DateRangeField } from "./DateRangeField";
import {
  ensureAllFilterOption,
  FILTER_ALL_VALUE,
  resolveFilterSelectValue,
} from "@/lib/grid/filter-all";

export interface QuerySearchField {
  id: string;
  label: string;
  indexKey?: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
}

export interface QueryFilter {
  id: string;
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  /** false — 드롭다운에 "전체" 미표시 (칩·고정 목록 등 다른 UI로 초기화) */
  includeAll?: boolean;
}

const DEFAULT_SEARCH_HINT_KEY = "query.searchHint";

export function QueryToolbar({
  searchFields = [],
  dateRange,
  onDateRangeChange,
  onDatePreset,
  dateFromLabel,
  dateToLabel,
  searchHint,
  filters = [],
  onSearch,
  onReset,
  resultCount,
  dataScope = "batch",
  actions,
  menuId,
}: {
  searchFields?: QuerySearchField[];
  dateRange?: DateRange;
  onDateRangeChange?: (range: DateRange) => void;
  onDatePreset?: (preset: DateRangePreset) => void;
  dateFromLabel?: string;
  dateToLabel?: string;
  searchHint?: string | null;
  filters?: QueryFilter[];
  onSearch?: () => void;
  onReset?: () => void;
  resultCount?: number;
  /** 실시간 스트림은 조회 결과 건수 미표시 */
  dataScope?: DataScope;
  actions?: ReactNode;
  menuId?: string;
}) {
  const { can, currentMenuId, ready } = useAuth();
  const { translate, language } = useLocale();
  const resolvedSearchHint = searchHint ?? translate(DEFAULT_SEARCH_HINT_KEY);
  const localeTag = language === "ko" ? "ko-KR" : "en-US";
  const resolvedMenuId = menuId ?? currentMenuId ?? "";
  const canSearch = !ready || !resolvedMenuId || can(resolvedMenuId, "view");
  if (!canSearch) {
    return (
      <Card sx={{ mb: 2 }}>
        <CardContent sx={{ p: 2 }}>
        <Typography variant="body2" color="text.secondary">
          {translate("query.noPermission")}
        </Typography>
        </CardContent>
      </Card>
    );
  }

  const showDateRange = dateRange && onDateRangeChange;

  return (
    <Card sx={{ mb: 1.5 }}>
      <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
      <Stack spacing={1.25}>
        {searchFields.length > 0 && (
          <Stack spacing={0.75}>
            <Typography variant="overline" color="text.secondary">
              {translate("query.indexSearch")}
            </Typography>
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={1}
              sx={{ flexWrap: "wrap", alignItems: { md: "flex-start" } }}
            >
              {searchFields.map((field, index) => (
                <TextField
                  key={field.id}
                  label={field.label}
                  placeholder={field.placeholder ?? `${field.label} ${translate("query.inputSuffix")}`}
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && onSearch?.()}
                  size="small"
                  sx={{ minWidth: { xs: "100%", md: 160 }, flex: { md: "1 1 160px" }, maxWidth: { md: 220 } }}
                  helperText={undefined}
                  slotProps={{
                    input: {
                      startAdornment: index === 0 ? (
                        <InputAdornment position="start">
                          <SearchIcon fontSize="small" color="action" />
                        </InputAdornment>
                      ) : undefined,
                    },
                    formHelperText: { sx: { mx: 0, mt: 0.25, fontSize: "0.65rem" } },
                  }}
                />
              ))}
            </Stack>
          </Stack>
        )}

        {showDateRange && (
          <DateRangeField
            value={dateRange}
            onChange={onDateRangeChange}
            onPreset={onDatePreset}
            fromLabel={dateFromLabel}
            toLabel={dateToLabel}
          />
        )}

        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={1.5}
          sx={{ alignItems: { md: "center" }, flexWrap: "wrap" }}
        >
          {filters.map((f) => {
            const allLabel = translate("common.all");
            const includeAll = f.includeAll !== false;
            const options = includeAll
              ? ensureAllFilterOption(f.options, allLabel)
              : f.options.filter((o) => o.value !== FILTER_ALL_VALUE && o.value !== "");
            const value = resolveFilterSelectValue(f.value, options, includeAll);
            return (
            <FormControl key={f.id} size="small" sx={{ minWidth: 140 }}>
              <InputLabel>{f.label}</InputLabel>
              <Select
                label={f.label}
                value={value}
                displayEmpty={!includeAll}
                renderValue={(selected) => {
                  if (!includeAll && !selected) {
                    return (
                      <Typography component="span" variant="body2" color="text.secondary">
                        {f.label}
                      </Typography>
                    );
                  }
                  return options.find((o) => o.value === selected)?.label ?? String(selected);
                }}
                onChange={(e) => {
                  const next = String(e.target.value);
                  f.onChange(next === "" ? FILTER_ALL_VALUE : next);
                }}
              >
                {options.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            );
          })}
          <Stack direction="row" spacing={1}>
            {onSearch && (
              <Button variant="contained" onClick={onSearch}>
                {translate("query.search")}
              </Button>
            )}
            {onReset && (
              <Button variant="outlined" startIcon={<RefreshIcon />} onClick={onReset}>
                {translate("query.reset")}
              </Button>
            )}
          </Stack>
          {actions && <Box sx={{ ml: { md: "auto" } }}>{actions}</Box>}
        </Stack>

        <Stack spacing={0.5}>
          {resolvedSearchHint && (
            <Typography variant="caption" color="text.secondary">
              {resolvedSearchHint}
            </Typography>
          )}
          {dataScope === "batch" && resultCount != null && (
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
              {translate("query.results")} {resultCount.toLocaleString(localeTag)}
              {translate("common.countSuffix")}
            </Typography>
          )}
        </Stack>
      </Stack>
      </CardContent>
    </Card>
  );
}
