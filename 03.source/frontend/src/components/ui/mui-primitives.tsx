"use client";

import Link from "next/link";
import { HintPopover } from "@/components/ui/HintPopover";
import {
  Box,
  Button,
  Chip,
  Grid,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DevicesIcon from "@mui/icons-material/Devices";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ErrorIcon from "@mui/icons-material/Error";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import type { ReactNode } from "react";
import type { SvgIconComponent } from "@mui/icons-material";
import { useAuth } from "@/contexts/AuthContext";
import { useColorMode } from "@/contexts/ColorModeContext";
import type { PermissionAction } from "@/lib/auth/types";
import { SummaryCard } from "@/components/devias/SummaryCard";
import { ContentCard } from "@/components/devias/ContentCard";

export function PrimaryButton({
  children,
  href,
  onClick,
  startIcon,
  fullWidth,
  variant = "contained",
  color = "primary",
  perm,
  menuId,
}: {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  startIcon?: ReactNode;
  fullWidth?: boolean;
  variant?: "contained" | "outlined";
  color?: "primary" | "secondary" | "warning" | "error" | "info";
  perm?: PermissionAction;
  menuId?: string;
}) {
  const { can, currentMenuId, ready } = useAuth();
  const targetMenuId = menuId ?? currentMenuId;

  if (perm && targetMenuId) {
    if (!ready) return null;
    if (!can(targetMenuId, perm)) return null;
  }

  const icon =
    startIcon !== undefined
      ? startIcon
      : typeof children === "string" && children.startsWith("+")
        ? <AddIcon fontSize="small" />
        : undefined;
  if (href) {
    return (
      <Button component={Link} href={href} variant={variant} color={color} startIcon={icon} fullWidth={fullWidth}>
        {children}
      </Button>
    );
  }
  return (
    <Button variant={variant} color={color} startIcon={icon} onClick={onClick} fullWidth={fullWidth}>
      {children}
    </Button>
  );
}

const STAT_ICON_LIGHT: Record<string, { icon: SvgIconComponent; color: string; iconFg?: string }> = {
  default: { icon: DevicesIcon, color: "#eef2f6", iconFg: "#5c6670" },
  info: { icon: InfoOutlinedIcon, color: "#e0f4fd", iconFg: "#0787b3" },
  success: { icon: CheckCircleIcon, color: "#e6f9f3", iconFg: "#118d57" },
  warning: { icon: WarningAmberIcon, color: "#fff4e5", iconFg: "#b76e00" },
  danger: { icon: ErrorIcon, color: "#fdecea", iconFg: "#c62828" },
};

const STAT_ICON_DARK: Record<string, { icon: SvgIconComponent; color: string; iconFg?: string }> = {
  default: { icon: DevicesIcon, color: "#1e242b", iconFg: "#9fa6ad" },
  info: { icon: InfoOutlinedIcon, color: "#0c2d3a", iconFg: "#04aad6" },
  success: { icon: CheckCircleIcon, color: "#0c2e24", iconFg: "#15b79f" },
  warning: { icon: WarningAmberIcon, color: "#3a2808", iconFg: "#fb9c0c" },
  danger: { icon: ErrorIcon, color: "#3a1412", iconFg: "#f04438" },
};

export function StatGrid({
  items,
}: {
  items: {
    label: string;
    value: string | number;
    sub?: string;
    variant?: "default" | "success" | "warning" | "danger" | "info";
  }[];
}) {
  const { mode } = useColorMode();
  const statIcons = mode === "dark" ? STAT_ICON_DARK : STAT_ICON_LIGHT;
  const lg = items.length <= 4 ? 3 : items.length <= 6 ? 2 : 2;
  return (
    <Grid container spacing={2} sx={{ mb: 2.5 }}>
      {items.map((item) => {
        const meta = statIcons[item.variant ?? "default"];
        return (
          <Grid key={item.label} size={{ xs: 12, sm: 6, md: 4, lg }} sx={{ minWidth: 0 }}>
            <SummaryCard
              label={item.label}
              value={item.value}
              sub={item.sub}
              icon={meta.icon}
              iconColor={meta.color}
              iconFg={meta.iconFg}
            />
          </Grid>
        );
      })}
    </Grid>
  );
}

export function InfoBanner({ children, title = "안내" }: { children: ReactNode; title?: string; severity?: "info" | "warning" }) {
  return <HintPopover title={title}>{children}</HintPopover>;
}

export function SimpleTable({
  columns,
  rows,
}: {
  columns: { key: string; label: string; align?: "left" | "center" | "right" }[];
  rows: Record<string, ReactNode>[];
}) {
  return (
    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
      <Table size="small">
        <TableHead>
          <TableRow sx={{ bgcolor: (theme) => (theme.palette.mode === "dark" ? "grey.900" : "#f4f6f8") }}>
            {columns.map((col) => (
              <TableCell key={col.key} align={col.align ?? "left"} sx={{ color: "text.primary", fontWeight: 600, fontSize: "0.8125rem" }}>
                {col.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, i) => (
            <TableRow key={i} hover>
              {columns.map((col) => (
                <TableCell key={col.key} align={col.align ?? "left"}>
                  {row[col.key]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export function KeyValueGrid({ items }: { items: { label: string; value: ReactNode }[] }) {
  return (
    <Grid container spacing={2}>
      {items.map((item) => (
        <Grid key={item.label} size={{ xs: 12, sm: 6, md: 4 }}>
          <Paper variant="outlined" sx={{ p: 2, height: "100%", borderRadius: 2 }}>
            <Typography variant="overline" color="text.secondary">
              {item.label}
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5, fontWeight: 600 }}>
              {item.value}
            </Typography>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
}

export function TagList({ tags }: { tags: string[] }) {
  return (
    <Stack direction="row" sx={{ flexWrap: "wrap", gap: 1 }}>
      {tags.map((tag) => (
        <Chip key={tag} label={tag} size="small" variant="outlined" sx={{ color: "text.secondary", borderColor: "divider" }} />
      ))}
    </Stack>
  );
}

const listScrollSx = {
  overflowY: "auto" as const,
  pr: 0.5,
  scrollbarWidth: "thin",
  "&::-webkit-scrollbar": { width: 6 },
  "&::-webkit-scrollbar-thumb": { borderRadius: 3, bgcolor: "action.disabled" },
};

export function ListPanel({
  items,
  maxHeight,
}: {
  items: { id: string; title: string; subtitle?: string; badge?: ReactNode }[];
  /** 지정 시 영역 높이 고정 + 세로 스크롤 */
  maxHeight?: number | string;
}) {
  return (
    <Stack spacing={1} sx={maxHeight != null ? { maxHeight, ...listScrollSx } : undefined}>
      {items.map((item) => (
        <Paper key={item.id} variant="outlined" sx={{ p: 1.5, borderRadius: 2, bgcolor: "background.paper" }}>
          <Stack direction="row" spacing={1} sx={{ justifyContent: "space-between", alignItems: "flex-start" }}>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {item.title}
              </Typography>
              {item.subtitle && (
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.25 }}>
                  {item.subtitle}
                </Typography>
              )}
            </Box>
            {item.badge}
          </Stack>
        </Paper>
      ))}
    </Stack>
  );
}

/** Devias ContentCard re-export */
export { ContentCard };
