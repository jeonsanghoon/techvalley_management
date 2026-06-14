"use client";

import { Chip, Stack, Typography } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import { useLocale } from "@/contexts/LocaleContext";
import { localeLabel } from "@/lib/locale/types";
import {
  DATE_RANGE_PRESETS,
  EMPTY_DATE_RANGE,
  detectPreset,
  isAllDateRange,
  parseYmd,
  toYmd,
  type DateRange,
  type DateRangePreset,
} from "@/lib/ui/date-range";

export function DateRangeField({
  value,
  onChange,
  onPreset,
  fromLabel,
  toLabel,
}: {
  value: DateRange;
  onChange: (next: DateRange) => void;
  onPreset?: (preset: DateRangePreset) => void;
  fromLabel?: string;
  toLabel?: string;
}) {
  const { translate, language } = useLocale();
  const activePreset = detectPreset(value);
  const resolvedFromLabel = fromLabel ?? translate("query.dateFrom");
  const resolvedToLabel = toLabel ?? translate("query.dateTo");

  return (
    <Stack
      spacing={1}
      sx={{
        p: 1.5,
        borderRadius: 2,
        border: 1,
        borderColor: "divider",
        bgcolor: "action.hover",
      }}
    >
      <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap" }}>
        <CalendarMonthIcon sx={{ fontSize: 18, color: "text.secondary" }} />
        <Typography variant="overline" color="text.secondary">
          {translate("dateRange.title")}
        </Typography>
        <Stack direction="row" spacing={0.75} sx={{ flexWrap: "wrap", gap: 0.75 }}>
          <Chip
            label={translate("dateRange.all")}
            size="small"
            clickable
            color={isAllDateRange(value) ? "primary" : "default"}
            variant={isAllDateRange(value) ? "filled" : "outlined"}
            onClick={() => (onPreset ? onPreset("all") : onChange(EMPTY_DATE_RANGE))}
            sx={{ fontWeight: 700, height: 26 }}
          />
          {DATE_RANGE_PRESETS.map((p) => (
            <Chip
              key={p.id}
              label={localeLabel(p.label, language)}
              size="small"
              clickable
              color={activePreset === p.id ? "primary" : "default"}
              variant={activePreset === p.id ? "filled" : "outlined"}
              onClick={() => onPreset?.(p.id)}
              sx={{ fontWeight: 700, height: 26 }}
            />
          ))}
        </Stack>
      </Stack>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ alignItems: { sm: "center" } }}>
        <DatePicker
          label={resolvedFromLabel}
          value={parseYmd(value.from)}
          onChange={(date) => onChange({ ...value, from: toYmd(date) })}
          maxDate={parseYmd(value.to) ?? undefined}
          slotProps={{
            textField: {
              size: "small",
              sx: { minWidth: { xs: "100%", sm: 168 } },
            },
            field: { clearable: true },
          }}
        />
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700, px: 0.5 }}>
          ~
        </Typography>
        <DatePicker
          label={resolvedToLabel}
          value={parseYmd(value.to)}
          onChange={(date) => onChange({ ...value, to: toYmd(date) })}
          minDate={parseYmd(value.from) ?? undefined}
          slotProps={{
            textField: {
              size: "small",
              sx: { minWidth: { xs: "100%", sm: 168 } },
            },
            field: { clearable: true },
          }}
        />
      </Stack>
    </Stack>
  );
}
