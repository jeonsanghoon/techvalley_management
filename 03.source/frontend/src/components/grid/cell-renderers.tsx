import type { ICellRendererParams } from "ag-grid-community";
import Link from "next/link";
import {
  Box,
  Button,
  Chip,
  IconButton,
  LinearProgress,
  Link as MuiLink,
  Stack,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import BiotechIcon from "@mui/icons-material/Biotech";
import MemoryIcon from "@mui/icons-material/Memory";
import {
  buildEquipmentLogsHref,
  relatedLogCategoriesForAlarm,
} from "@/lib/equipment-log-nav";
import { buildRemoteControlHref, buildRemoteDiagnosisHref } from "@/lib/equipment-remote-nav";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { useLocale } from "@/contexts/LocaleContext";
import type { TranslationKey } from "@/lib/locale";
import { localizeDomainValue } from "@/lib/locale/domain-labels";
import type { Alarm, Equipment } from "@/lib/types";
import CheckIcon from "@mui/icons-material/Check";
import MinimizeIcon from "@mui/icons-material/Minimize";

const STATUS_COLORS: Record<string, "success" | "error" | "warning" | "default" | "info" | "secondary" | "primary"> = {
  online: "success",
  offline: "default",
  alarm: "error",
  maintenance: "warning",
  safe_mode: "secondary",
  critical: "error",
  warning: "warning",
  healthy: "success",
  error: "error",
  connected: "success",
  disconnected: "error",
  active: "success",
  staging: "info",
  tube: "default",
  detector: "secondary",
  body: "info",
  composite: "warning",
  SNS: "default",
  SES: "info",
  Dashboard: "success",
  Webhook: "secondary",
  접수: "default",
  배정: "info",
  출동: "info",
  작업: "warning",
  완료: "success",
  요청: "default",
  확정: "info",
  출고: "info",
  운송중: "warning",
  도착: "success",
  교체완료: "success",
  예정: "default",
  진행중: "info",
  시운전: "warning",
};

const FILLED_STATUSES = new Set(["critical", "warning", "alarm", "error"]);

export function BadgeCell({ value }: { value?: string | null }) {
  const { language } = useLocale();
  if (!value) {
    return (
      <Typography variant="caption" color="text.disabled">
        —
      </Typography>
    );
  }
  const label = localizeDomainValue(value, language);
  const filled = FILLED_STATUSES.has(value);
  return (
    <Chip
      label={label}
      size="small"
      color={STATUS_COLORS[value] ?? "default"}
      variant={filled ? "filled" : "outlined"}
      sx={{ height: 24, fontWeight: 600, fontSize: "0.75rem" }}
    />
  );
}

export function StatusCellRenderer(params: ICellRendererParams) {
  return <BadgeCell value={params.value} />;
}

export function SeverityCellRenderer(params: ICellRendererParams) {
  return <BadgeCell value={params.value} />;
}

export function LifeBarCellRenderer(params: ICellRendererParams) {
  const pct = Number(params.value ?? 0);
  const color = pct < 30 ? "error" : pct < 50 ? "warning" : "success";
  return (
    <Stack direction="row" spacing={1} sx={{ alignItems: "center", width: "100%", py: 0.5 }}>
      <LinearProgress variant="determinate" value={pct} color={color} sx={{ flex: 1, height: 8, borderRadius: 1 }} />
      <Typography variant="caption" sx={{ minWidth: 36, fontWeight: 700, color: pct < 30 ? "error.main" : "text.primary" }}>
        {pct}%
      </Typography>
    </Stack>
  );
}

export function YieldCellRenderer(params: ICellRendererParams) {
  const pct = Number(params.value ?? 0);
  return (
    <Typography variant="body2" sx={{ fontWeight: 700, color: pct < 90 ? "error.main" : "success.main" }}>
      {pct}%
    </Typography>
  );
}

export function BoolCellRenderer(params: ICellRendererParams) {
  const v = params.value;
  return (
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%" }}>
      {v === true || v === "Y" || v === "✓" ? (
        <CheckIcon sx={{ fontSize: 20, color: "success.main" }} />
      ) : (
        <MinimizeIcon sx={{ fontSize: 18, color: "text.disabled" }} />
      )}
    </Box>
  );
}

export function SlaBreachedCellRenderer(params: ICellRendererParams) {
  const { translate } = useLocale();
  if (params.data?.slaBreached) {
    return (
      <Typography variant="body2" color="error" sx={{ fontWeight: 700 }}>
        {translate("grid.slaBreached")}
      </Typography>
    );
  }
  return <Typography variant="body2">{params.data?.slaTier ?? params.value}</Typography>;
}

export function MonoCellRenderer(params: ICellRendererParams) {
  return (
    <Typography variant="caption" sx={{ fontFamily: "monospace", fontWeight: 600, color: "text.primary" }}>
      {params.value}
    </Typography>
  );
}

export function LinkCellRenderer(params: ICellRendererParams) {
  const href = params.colDef?.cellRendererParams?.hrefPrefix as string | undefined;
  if (!params.value || !href) return <Typography variant="body2">{params.value ?? "—"}</Typography>;
  return (
    <MuiLink href={href} underline="hover" variant="body2" color="text.primary">
      {params.value}
    </MuiLink>
  );
}

export function ServiceabilityCellRenderer(params: ICellRendererParams) {
  const { language } = useLocale();
  const v = String(params.value ?? "");
  const label = localizeDomainValue(v, language);
  const color = v.includes("즉시") ? "success.main" : v.includes("대기") ? "error.main" : "info.main";
  return (
    <Typography variant="body2" sx={{ fontWeight: 700, color }}>
      {label}
    </Typography>
  );
}

const LOG_LEVEL_COLOR: Record<string, "default" | "success" | "warning" | "error" | "info"> = {
  INFO: "info",
  WARN: "warning",
  ERROR: "error",
  DEBUG: "default",
};

const LOG_CATEGORY_COLOR: Record<string, "default" | "primary" | "secondary" | "success" | "warning" | "error" | "info"> = {
  튜브: "default",
  디텍터: "secondary",
  본체: "info",
  알람: "error",
  원격제어: "warning",
  펌웨어: "success",
  주기: "default",
  이벤트: "info",
  감사: "default",
};

const METRIC_KIND_COLOR: Record<string, "default" | "primary" | "secondary" | "success" | "warning"> = {
  주기: "default",
  이벤트: "warning",
  펌웨어: "success",
  제어: "secondary",
};

export function LogLevelCellRenderer(params: ICellRendererParams) {
  const { language } = useLocale();
  const label = localizeDomainValue(String(params.value ?? ""), language);
  return <Chip label={label} size="small" color={LOG_LEVEL_COLOR[String(params.value)] ?? "default"} variant="outlined" />;
}

export function LogCategoryCellRenderer(params: ICellRendererParams) {
  const { language } = useLocale();
  const label = localizeDomainValue(String(params.value ?? ""), language);
  return <Chip label={label} size="small" color={LOG_CATEGORY_COLOR[String(params.value)] ?? "default"} variant="outlined" />;
}

export function MetricKindCellRenderer(params: ICellRendererParams) {
  const { language } = useLocale();
  const label = localizeDomainValue(String(params.value ?? ""), language);
  return <Chip label={label} size="small" color={METRIC_KIND_COLOR[String(params.value)] ?? "default"} variant="outlined" />;
}

export function PayloadCellRenderer(params: ICellRendererParams) {
  const v = String(params.value ?? "");
  if (!v) return <Typography variant="caption" color="text.disabled">—</Typography>;
  return (
    <Typography variant="caption" sx={{ fontFamily: "monospace", fontSize: 11, color: "text.secondary" }} noWrap title={v}>
      {v.length > 48 ? `${v.slice(0, 48)}…` : v}
    </Typography>
  );
}

export function LiveDotCellRenderer(params: ICellRendererParams) {
  const { translate } = useLocale();
  const live = params.value === true || params.value === "Y";
  return live ? (
    <Chip label={translate("grid.edge")} size="small" color="success" variant="outlined" />
  ) : (
    <Chip label={translate("grid.delayed")} size="small" color="default" variant="outlined" />
  );
}

const GRID_ACTION_BTN_SX = {
  minWidth: 0,
  px: 1,
  py: 0.25,
  fontSize: "0.7rem",
  lineHeight: 1.4,
  whiteSpace: "nowrap",
} as const;

/** 장비 마스터 행 → 원격진단 · 원격제어 화면 이동 */
export function EquipmentRemoteActionsCellRenderer(params: ICellRendererParams<Equipment>) {
  const theme = useTheme();
  const isCompact = useMediaQuery(theme.breakpoints.down("lg"));
  const { translate } = useLocale();
  const equipment = params.data;
  if (!equipment?.serialNo) return null;

  const sn = equipment.serialNo;
  const diagnosisLabel = translate("remoteDiagnosis.nav.label" as TranslationKey);
  const controlLabel = translate("remoteDiagnosis.toolbar.remoteControl" as TranslationKey);

  if (isCompact) {
    return (
      <Stack
        direction="row"
        spacing={0.25}
        className="tv-equipment-remote-actions"
        sx={{ alignItems: "center", justifyContent: "flex-start", py: 0.25 }}
      >
        <PermissionGate menuId="remote-diagnosis" action="view">
          <Tooltip title={diagnosisLabel}>
            <IconButton
              component={Link}
              href={buildRemoteDiagnosisHref(sn)}
              size="small"
              color="primary"
              aria-label={diagnosisLabel}
              sx={{ p: 0.5 }}
            >
              <BiotechIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        </PermissionGate>
        <PermissionGate menuId="remote-control" action="view">
          <Tooltip title={controlLabel}>
            <IconButton
              component={Link}
              href={buildRemoteControlHref(sn)}
              size="small"
              color="primary"
              aria-label={controlLabel}
              sx={{ p: 0.5 }}
            >
              <MemoryIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        </PermissionGate>
      </Stack>
    );
  }

  return (
    <Stack
      direction="row"
      spacing={0.5}
      className="tv-equipment-remote-actions"
      sx={{ flexWrap: "nowrap", py: 0.25 }}
    >
      <PermissionGate menuId="remote-diagnosis" action="view">
        <Button
          component={Link}
          href={buildRemoteDiagnosisHref(sn)}
          size="small"
          variant="outlined"
          sx={GRID_ACTION_BTN_SX}
        >
          {diagnosisLabel}
        </Button>
      </PermissionGate>
      <PermissionGate menuId="remote-control" action="view">
        <Button
          component={Link}
          href={buildRemoteControlHref(sn)}
          size="small"
          variant="outlined"
          sx={GRID_ACTION_BTN_SX}
        >
          {controlLabel}
        </Button>
      </PermissionGate>
    </Stack>
  );
}

/** 알람 행 → 구분별 장비 로그 (발생 시각 ±1일) */
export function AlarmRelatedLogsCellRenderer(params: ICellRendererParams<Alarm>) {
  const { language } = useLocale();
  const alarm = params.data;
  if (!alarm) return null;

  const categories = relatedLogCategoriesForAlarm(alarm);

  return (
    <Stack direction="row" spacing={0.5} sx={{ flexWrap: "wrap", gap: 0.25, py: 0.25 }}>
      {categories.map((category) => (
        <MuiLink
          key={category}
          component={Link}
          href={buildEquipmentLogsHref({
            equipmentId: alarm.equipmentId,
            category,
            anchorAt: alarm.triggeredAt,
            daysAround: 1,
          })}
          variant="caption"
          underline="hover"
          sx={{ whiteSpace: "nowrap", fontWeight: 600 }}
        >
          {localizeDomainValue(category, language)}
        </MuiLink>
      ))}
    </Stack>
  );
}
