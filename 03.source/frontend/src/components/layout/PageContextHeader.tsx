"use client";

import { Box, Stack, Typography } from "@mui/material";
import { usePathname } from "next/navigation";
import { findNavItem, navigation } from "@/lib/navigation";
import { metricTabFromHash } from "@/lib/metric-stream-tabs";
import { useLocationHash } from "@/hooks/useHashTab";
import type { LocalizableText } from "@/lib/locale/types";
import { HintPopover } from "@/components/ui/HintPopover";
import { ServiceFlowDiagram } from "@/components/ui/PageComponents";
import { usePageActions } from "@/contexts/PageActionsContext";
import { useLocale } from "@/contexts/LocaleContext";
import { localeLabel } from "@/lib/locale/types";
import { localizeDomainValue } from "@/lib/locale/domain-labels";

function resolveHintContent(
  pathname: string,
  hash: string,
  description: LocalizableText | undefined,
  wbs: string | undefined,
  language: "ko" | "en",
  metricStreamHint: string,
  serviceFlowTitle: string,
): React.ReactNode | null {
  if (pathname === "/metric-stream") {
    return metricStreamHint;
  }

  const descText = description ? localeLabel(description, language) : undefined;

  if (pathname === "/dashboard" && descText) {
    return (
      <Stack spacing={1.5}>
        <Typography variant="body2" color="text.secondary">
          {descText}
          {wbs ? ` (WBS: ${wbs})` : null}
        </Typography>
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 0.75, fontWeight: 700 }}>
            {serviceFlowTitle}
          </Typography>
          <ServiceFlowDiagram />
        </Box>
      </Stack>
    );
  }

  if (!descText) return null;
  return (
    <>
      {descText}
      {wbs ? ` (WBS: ${wbs})` : null}
    </>
  );
}

/** MainNav 아래 — 메뉴 제목 + 단일 안내 아이콘 */
export function PageContextHeader() {
  const pathname = usePathname();
  const hash = useLocationHash();
  const { actions } = usePageActions();
  const { language, translate } = useLocale();
  const current = findNavItem(pathname, hash);
  const currentGroup = navigation.find((g) => g.items.some((i) => i.id === current?.id));

  if (!current)
    return <Box className="tv-page-context-header" aria-hidden sx={{ display: "none" }} />;

  const tab = pathname === "/metric-stream" ? metricTabFromHash(hash) : null;
  const metricStreamHint = tab
    ? `${localeLabel(tab.hint, language)} URL hash(#${tab.hash}) · LIVE ${localizeDomainValue(tab.kind, language)}`
    : "";
  const hintContent = resolveHintContent(
    pathname,
    hash,
    current.description,
    current.wbs,
    language,
    metricStreamHint,
    translate("nav.serviceFlow"),
  );
  const pageTitle = localeLabel(current.label, language);
  const groupTitle = currentGroup ? localeLabel(currentGroup.label, language) : translate("nav.platform");

  return (
    <Box
      className="tv-page-context-header"
      sx={{
        borderBottom: 1,
        borderColor: "divider",
        bgcolor: "background.paper",
        px: { xs: 2, md: 3 },
        py: { xs: 1, md: 1.125 },
      }}
    >
      <Stack
        direction={{ xs: actions ? "column" : "row", md: "row" }}
        spacing={{ xs: 1, md: 1.5 }}
        sx={{
          alignItems: { xs: "stretch", md: "center" },
          justifyContent: "space-between",
          minWidth: 0,
          gap: 1,
        }}
      >
        <Stack
          direction="row"
          spacing={0.75}
          sx={{ alignItems: "center", minWidth: 0, flex: 1 }}
        >
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontWeight: 600, letterSpacing: 0.02, flexShrink: 0 }}
          >
            {groupTitle}
          </Typography>
          <Typography variant="caption" color="text.disabled" sx={{ flexShrink: 0 }}>
            /
          </Typography>
          <Typography
            variant="h5"
            component="h1"
            className="tv-page-title"
            sx={{
              fontWeight: 700,
              lineHeight: 1.25,
              fontSize: { xs: "1.125rem", sm: "1.25rem" },
              minWidth: 0,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {pageTitle}
          </Typography>
          {hintContent ? <HintPopover title={pageTitle}>{hintContent}</HintPopover> : null}
        </Stack>

        {actions ? (
          <Stack
            direction="row"
            spacing={1}
            sx={{
              alignItems: "center",
              flexShrink: 0,
              flexWrap: "wrap",
              justifyContent: { xs: "flex-start", md: "flex-end" },
              gap: 1,
              width: { xs: "100%", md: "auto" },
              "& .MuiButton-root": {
                flex: { xs: "1 1 auto", md: "0 0 auto" },
                minWidth: { xs: 0, md: "auto" },
              },
            }}
          >
            {actions}
          </Stack>
        ) : null}
      </Stack>
    </Box>
  );
}
