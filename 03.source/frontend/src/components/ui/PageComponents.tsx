"use client";

import { useId, useLayoutEffect } from "react";
import {
  Box,
  Breadcrumbs,
  Chip,
  Link,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from "@mui/material";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import type { ChipProps } from "@mui/material";
import { ContentCard } from "@/components/devias/ContentCard";
import { SummaryCard } from "@/components/devias/SummaryCard";
import type { SvgIconComponent } from "@mui/icons-material";
import { HintPopover } from "@/components/ui/HintPopover";
import { usePageActions } from "@/contexts/PageActionsContext";
import { useLocale } from "@/contexts/LocaleContext";
import { localizeDomainValue } from "@/lib/locale/domain-labels";
import { localeLabel, type LocalizableText } from "@/lib/locale/types";

/** 페이지 제목 행 우측 액션 — PageContextHeader와 같은 줄에 표시 */
export function PageToolbar({ children }: { children?: React.ReactNode }) {
  const { registerActions, unregisterActions } = usePageActions();
  const ownerId = useId();

  useLayoutEffect(() => {
    registerActions(ownerId, children ?? null);
    return () => unregisterActions(ownerId);
  }, [ownerId, children, registerActions, unregisterActions]);

  return null;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  wbs?: string;
  actions?: React.ReactNode;
  breadcrumbs?: { label: string; href?: string }[];
}

/** @deprecated 본문 메뉴 제목 중복 — PageToolbar 사용 권장 */
export function PageHeader({ title, description, wbs, actions, breadcrumbs }: PageHeaderProps) {
  return (
    <Box sx={{ mb: 2 }}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" />}
          sx={{ mb: 1, "& .MuiBreadcrumbs-li": { fontSize: "0.75rem" } }}
        >
          {breadcrumbs.map((crumb, i) =>
            crumb.href && i < breadcrumbs.length - 1 ? (
              <Link key={crumb.label} href={crumb.href} underline="hover" color="text.secondary" variant="caption">
                {crumb.label}
              </Link>
            ) : (
              <Typography key={crumb.label} variant="caption" color="text.secondary">
                {crumb.label}
              </Typography>
            ),
          )}
        </Breadcrumbs>
      )}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        sx={{ justifyContent: "space-between", alignItems: { sm: "flex-start" } }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap", gap: 0.5 }}>
            <Typography component="div" variant="h5" className="tv-page-title" sx={{ fontWeight: 700, lineHeight: 1.25 }}>
              {title}
            </Typography>
            {wbs && <Chip label={wbs} size="small" variant="outlined" sx={{ color: "text.secondary", borderColor: "divider" }} />}
          </Stack>
          {description && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75, maxWidth: 720 }}>
              {description}
            </Typography>
          )}
        </Box>
        {actions && (
          <Stack direction="row" spacing={1} sx={{ flexShrink: 0, flexWrap: "wrap" }}>
            {actions}
          </Stack>
        )}
      </Stack>
    </Box>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  variant?: "default" | "success" | "warning" | "danger" | "info";
  icon?: SvgIconComponent;
}

const STAT_STYLE: Record<NonNullable<StatCardProps["variant"]>, { bg: string; fg: string }> = {
  default: { bg: "#eef2f6", fg: "#5c6670" },
  success: { bg: "#e6f9f3", fg: "#118d57" },
  warning: { bg: "#fff4e5", fg: "#b76e00" },
  danger: { bg: "#fdecea", fg: "#c62828" },
  info: { bg: "#e0f4fd", fg: "#0787b3" },
};

/** Devias SummaryCard 래퍼 */
export function StatCard({ label, value, sub, variant = "default", icon }: StatCardProps) {
  const style = STAT_STYLE[variant];
  return (
    <SummaryCard
      label={label}
      value={value}
      sub={sub}
      icon={icon}
      iconColor={style.bg}
      iconFg={style.fg}
    />
  );
}

const statusChipColor: Record<string, ChipProps["color"]> = {
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
  접수: "default",
  배정: "info",
  출동: "primary",
  작업: "warning",
  완료: "success",
};

export function StatusBadge({ status, size = "sm" }: { status: string; size?: "sm" | "md" }) {
  const { language } = useLocale();
  return (
    <Chip
      label={localizeDomainValue(status, language)}
      size={size === "sm" ? "small" : "medium"}
      color={statusChipColor[status] ?? "default"}
      variant="filled"
      sx={{ fontWeight: 600 }}
    />
  );
}

const STAGES = ["접수", "배정", "출동", "작업", "완료"];

export function StageTracker({ currentStage }: { currentStage: string }) {
  const { language } = useLocale();
  const activeStep = STAGES.indexOf(currentStage);
  return (
    <Stepper activeStep={activeStep >= 0 ? activeStep : 0} alternativeLabel sx={{ mt: 1 }}>
      {STAGES.map((label) => (
        <Step key={label}>
          <StepLabel>{localizeDomainValue(label, language)}</StepLabel>
        </Step>
      ))}
    </Stepper>
  );
}

/** Devias ContentCard — tone prop은 하위 호환용(무시) */
export function SectionCard({
  title,
  children,
  sx,
  action,
}: {
  title?: string;
  children: React.ReactNode;
  sx?: object;
  action?: React.ReactNode;
  /** @deprecated 시각 톤 — 추후 테마 연동 예정 */
  tone?: string;
}) {
  return (
    <ContentCard title={title} action={action} sx={sx}>
      {children}
    </ContentCard>
  );
}

export const Card = SectionCard;

export function ServiceFlowDiagram() {
  const { language } = useLocale();
  const steps: { n: number; label: LocalizableText; sub: string }[] = [
    { n: 1, label: { ko: "이상 알람", en: "Abnormal alarm" }, sub: "A4" },
    { n: 2, label: { ko: "원격제어", en: "Remote control" }, sub: "A5" },
    { n: 3, label: { ko: "해결 판정", en: "Resolution check" }, sub: "A5·A7" },
    { n: 4, label: { ko: "서비스 호출", en: "Service dispatch" }, sub: "A6" },
    { n: 5, label: { ko: "처리 진행", en: "In progress" }, sub: "A7" },
    { n: 6, label: { ko: "부품 주문", en: "Parts order" }, sub: "A10" },
    { n: 7, label: { ko: "AS 완료", en: "Service complete" }, sub: "A11" },
  ];
  return (
    <Box sx={{ overflowX: "auto", pb: 0.5 }}>
      <Stack direction="row" sx={{ flexWrap: "nowrap", alignItems: "center", gap: 1, minWidth: "max-content" }}>
        {steps.map((s, i) => (
          <Stack key={s.n} direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <Box
              sx={{
                px: 1.5,
                py: 1,
                minWidth: 88,
                textAlign: "center",
                borderRadius: 2,
                border: 1,
                borderColor: "divider",
                bgcolor: "background.paper",
              }}
            >
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                {s.n}
              </Typography>
              <Typography variant="caption" sx={{ display: "block", fontWeight: 600 }}>
                {localeLabel(s.label, language)}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>
                {s.sub}
              </Typography>
            </Box>
            {i < steps.length - 1 && (
              <Typography color="text.disabled" sx={{ px: 0.25 }}>
                →
              </Typography>
            )}
          </Stack>
        ))}
      </Stack>
    </Box>
  );
}

/** @deprecated PageContextHeader 안내 아이콘 사용 */
export function WorkHint({
  children,
  title,
}: {
  children: React.ReactNode;
  title?: string;
}) {
  const { translate } = useLocale();
  return <HintPopover title={title ?? translate("hint.guide")}>{children}</HintPopover>;
}

/** @deprecated PageContextHeader 안내 아이콘 사용 */
export function PageHints({ children }: { children: React.ReactNode }) {
  return null;
}

export function ToneCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  /** @deprecated 시각 톤 — 추후 테마 연동 예정 */
  tone?: string;
  children?: React.ReactNode;
}) {
  return (
    <ContentCard title={title} subheader={subtitle}>
      {children}
    </ContentCard>
  );
}
