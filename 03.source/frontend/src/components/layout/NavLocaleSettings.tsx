"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  Box,
  Chip,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  ListSubheader,
  MenuItem,
  Paper,
  Select,
  Stack,
  Typography,
  useTheme,
  type SelectChangeEvent,
} from "@mui/material";
import LanguageIcon from "@mui/icons-material/Language";
import CloseIcon from "@mui/icons-material/Close";
import { useLocale } from "@/contexts/LocaleContext";
import {
  formatTimeZoneLabel,
  localeLabel,
  PRIMARY_SERVICE_REGION_IDS,
  SERVICE_REGIONS,
  TIMEZONE_OPTIONS,
  timeZonesForRegion,
  timezoneMatchesServiceRegion,
  type AppLanguage,
  type ServiceRegionId,
} from "@/lib/locale";

const POPUP_WIDTH = 320;

function isLocaleFloatingLayer(target: Node | null): boolean {
  if (!(target instanceof Element)) return false;
  return Boolean(
    target.closest(
      "[data-tv-locale-menu], .MuiPopover-root, .MuiMenu-root, .MuiModal-root, .MuiPopper-root, [role='listbox']",
    ),
  );
}

const localeSelectMenuProps = {
  disableScrollLock: true,
  /** 포털 밖 클릭으로 설정 패널이 닫히며 선택이 취소되는 것 방지 */
  disablePortal: true,
  slotProps: {
    paper: {
      "data-tv-locale-menu": "true",
      onMouseDown: (event: React.MouseEvent) => event.stopPropagation(),
    },
  },
} as const;

export function NavLocaleSettings() {
  const theme = useTheme();
  const {
    language,
    timeZone,
    serviceRegion,
    setLanguage,
    setTimeZone,
    setServiceRegion,
    translate,
  } = useLocale();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [layoutTick, setLayoutTick] = useState(0);
  const open = Boolean(anchorEl);

  const position = useMemo(() => {
    if (!open || !anchorEl || typeof window === "undefined") {
      return { top: 0, left: 0 };
    }
    const rect = anchorEl.getBoundingClientRect();
    const margin = 16;
    const left = Math.min(
      Math.max(margin, rect.right - POPUP_WIDTH),
      window.innerWidth - POPUP_WIDTH - margin,
    );
    return { top: rect.bottom + 8, left };
  }, [open, anchorEl, layoutTick]);

  const bumpLayout = useCallback(() => setLayoutTick((n) => n + 1), []);

  useEffect(() => {
    if (!open) return;
    bumpLayout();
  }, [open, anchorEl, bumpLayout]);

  useEffect(() => {
    if (!open) return;
    const handleReposition = () => bumpLayout();
    window.addEventListener("resize", handleReposition);
    window.addEventListener("scroll", handleReposition, true);
    return () => {
      window.removeEventListener("resize", handleReposition);
      window.removeEventListener("scroll", handleReposition, true);
    };
  }, [open, bumpLayout]);

  useEffect(() => {
    if (!open) return;
    let active = true;

    const handleOutsideClick = (event: MouseEvent) => {
      if (!active) return;
      const target = event.target as Node | null;
      if (anchorEl?.contains(target)) return;
      const panel = document.getElementById("tv-locale-settings-panel");
      if (panel?.contains(target)) return;
      if (isLocaleFloatingLayer(target)) return;
      setAnchorEl(null);
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (!active) return;
      if (event.key === "Escape") setAnchorEl(null);
    };

    document.addEventListener("keydown", handleEscape);
    const attachId = window.setTimeout(() => {
      if (!active) return;
      document.addEventListener("click", handleOutsideClick, true);
    }, 0);

    return () => {
      active = false;
      window.clearTimeout(attachId);
      document.removeEventListener("click", handleOutsideClick, true);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open, anchorEl]);

  const regionPreset = SERVICE_REGIONS.find((r) => r.id === serviceRegion) ?? SERVICE_REGIONS[0];
  const regionSummary = localeLabel(regionPreset.label, language);
  const timeZoneSummary = formatTimeZoneLabel(timeZone, language);

  const primaryRegions = useMemo(
    () => SERVICE_REGIONS.filter((r) => PRIMARY_SERVICE_REGION_IDS.includes(r.id)),
    [],
  );

  const timezoneGroups = useMemo(() => {
    const primary = timeZonesForRegion(serviceRegion);
    const primaryIds = new Set(
      primary.filter((tz) => timezoneMatchesServiceRegion(tz, serviceRegion)).map((tz) => tz.id),
    );
    const regionLabel = localeLabel(regionPreset.label, language);
    return {
      regionLabel,
      primary: primary.filter((tz) => primaryIds.has(tz.id)),
      other: TIMEZONE_OPTIONS.filter((tz) => !primaryIds.has(tz.id)),
    };
  }, [serviceRegion, regionPreset.label, language]);

  const handleLanguageChange = (event: SelectChangeEvent) => {
    event.stopPropagation();
    const next = event.target.value;
    if (next === "ko" || next === "en") setLanguage(next);
  };

  const handleTimeZoneChange = (event: SelectChangeEvent) => {
    setTimeZone(event.target.value);
  };

  const handleRegionChange = (event: SelectChangeEvent) => {
    setServiceRegion(event.target.value as ServiceRegionId);
  };

  const handleQuickRegion = (regionId: ServiceRegionId) => {
    setServiceRegion(regionId);
  };

  return (
    <>
      <Paper
        component="button"
        type="button"
        variant="outlined"
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={translate("locale.settings")}
        onClick={(e) => {
          e.stopPropagation();
          setAnchorEl((prev) => (prev ? null : e.currentTarget));
        }}
        onMouseDown={(e) => e.stopPropagation()}
        sx={{
          px: 1.25,
          py: 0.5,
          borderRadius: 1.5,
          display: "flex",
          alignItems: "center",
          gap: 0.75,
          bgcolor: "background.paper",
          cursor: "pointer",
          border: 1,
          borderColor: open ? "primary.main" : "divider",
          textAlign: "left",
          font: "inherit",
          color: "inherit",
          flexShrink: 0,
          maxWidth: { xs: 140, sm: 220 },
          "&:hover": { bgcolor: "action.hover" },
        }}
      >
        <LanguageIcon sx={{ fontSize: 16, color: "text.secondary", flexShrink: 0 }} />
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="caption" sx={{ display: "block", fontWeight: 700, lineHeight: 1.2 }} noWrap>
            {translate(language === "ko" ? "locale.language.ko" : "locale.language.en")}
            {" · "}
            {timeZoneSummary}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.65rem" }} noWrap>
            {regionSummary}
          </Typography>
        </Box>
      </Paper>

      {typeof document !== "undefined" &&
        open &&
        anchorEl &&
        createPortal(
          <Paper
            id="tv-locale-settings-panel"
            role="dialog"
            aria-modal="true"
            aria-label={translate("locale.settings")}
            onMouseDown={(e) => e.stopPropagation()}
            elevation={8}
            sx={{
              position: "fixed",
              top: position.top,
              left: position.left,
              width: POPUP_WIDTH,
              maxWidth: "calc(100vw - 32px)",
              maxHeight: "min(560px, calc(100dvh - 48px))",
              overflowY: "auto",
              zIndex: theme.zIndex.modal + 10,
              p: 2,
              boxSizing: "border-box",
            }}
          >
            <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                {translate("locale.settings")}
              </Typography>
              <IconButton size="small" aria-label={translate("map.close")} onClick={() => setAnchorEl(null)}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Stack>

            <Stack spacing={1.5}>
              <FormControl size="small" fullWidth>
                <InputLabel id="tv-locale-language-label">{translate("locale.language")}</InputLabel>
                <Select
                  labelId="tv-locale-language-label"
                  value={language}
                  label={translate("locale.language")}
                  onChange={handleLanguageChange}
                  MenuProps={localeSelectMenuProps}
                >
                  <MenuItem value="ko">{translate("locale.language.ko")}</MenuItem>
                  <MenuItem value="en">{translate("locale.language.en")}</MenuItem>
                </Select>
              </FormControl>

              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, mb: 0.75, display: "block" }}>
                  {translate("locale.regionQuick")}
                </Typography>
                <Stack direction="row" spacing={0.75} sx={{ flexWrap: "wrap", gap: 0.75 }}>
                  {primaryRegions.map((region) => (
                    <Chip
                      key={region.id}
                      label={localeLabel(region.label, language)}
                      size="small"
                      clickable
                      color={serviceRegion === region.id ? "primary" : "default"}
                      variant={serviceRegion === region.id ? "filled" : "outlined"}
                      onClick={() => handleQuickRegion(region.id)}
                      sx={{ fontWeight: 700 }}
                    />
                  ))}
                </Stack>
              </Box>

              <FormControl size="small" fullWidth>
                <InputLabel id="tv-locale-region-label">{translate("locale.region")}</InputLabel>
                <Select
                  labelId="tv-locale-region-label"
                  value={serviceRegion}
                  label={translate("locale.region")}
                  onChange={handleRegionChange}
                  MenuProps={localeSelectMenuProps}
                >
                  {SERVICE_REGIONS.map((region) => (
                    <MenuItem key={region.id} value={region.id}>
                      {localeLabel(region.label, language)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Divider />

              <FormControl size="small" fullWidth>
                <InputLabel id="tv-locale-timezone-label">{translate("locale.timezone")}</InputLabel>
                <Select
                  labelId="tv-locale-timezone-label"
                  value={timeZone}
                  label={translate("locale.timezone")}
                  onChange={handleTimeZoneChange}
                  MenuProps={localeSelectMenuProps}
                >
                  {timezoneGroups.primary.length > 0 && (
                    <ListSubheader sx={{ fontWeight: 700, lineHeight: 2 }}>
                      {timezoneGroups.regionLabel}
                    </ListSubheader>
                  )}
                  {timezoneGroups.primary.map((tz) => (
                    <MenuItem key={tz.id} value={tz.id}>
                      {localeLabel(tz.label, language)}
                    </MenuItem>
                  ))}
                  {timezoneGroups.other.length > 0 && (
                    <ListSubheader sx={{ fontWeight: 700, lineHeight: 2 }}>
                      {translate("locale.timezoneOther")}
                    </ListSubheader>
                  )}
                  {timezoneGroups.other.map((tz) => (
                    <MenuItem key={tz.id} value={tz.id}>
                      {localeLabel(tz.label, language)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          </Paper>,
          document.body,
        )}
    </>
  );
}
