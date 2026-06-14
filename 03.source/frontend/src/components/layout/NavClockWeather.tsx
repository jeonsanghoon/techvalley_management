"use client";

import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { createPortal } from "react-dom";
import {
  Box,
  CircularProgress,
  Divider,
  IconButton,
  Paper,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useWeather } from "@/hooks/useWeather";
import { useLocale } from "@/contexts/LocaleContext";
import { formatLocaleClock, formatTimeZoneLabel } from "@/lib/locale";

import {
  weatherCodeEmoji,
  weatherCodeLabel,
} from "@/lib/weather/open-meteo";

const POPUP_WIDTH = 320;

function formatDayLabel(isoDate: string, language: "ko" | "en", timeZone: string): string {
  const locale = language === "ko" ? "ko-KR" : "en-US";
  const d = new Date(`${isoDate}T12:00:00`);
  return d.toLocaleDateString(locale, {
    timeZone,
    weekday: "short",
    month: "numeric",
    day: "numeric",
  });
}

function resolveTimeZoneLabel(timeZone: string, language: "ko" | "en"): string {
  return formatTimeZoneLabel(timeZone, language);
}

function WeatherEmoji({ code, size = "sm" }: { code: number; size?: "sm" | "lg" }) {
  return (
    <Box
      component="span"
      className={size === "lg" ? "tv-weather-popup__emoji tv-weather-popup__emoji--lg" : "tv-weather-popup__emoji"}
      aria-hidden
    >
      {weatherCodeEmoji(code)}
    </Box>
  );
}

const WeatherForecastPopup = memo(function WeatherForecastPopup({
  anchorEl,
  open,
  onClose,
  data,
  loading,
  error,
  onRefresh,
  language,
  forecastTitle,
  refreshLabel,
  timeZone,
}: {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  data: ReturnType<typeof useWeather>["data"];
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
  language: "ko" | "en";
  forecastTitle: string;
  refreshLabel: string;
  timeZone: string;
}) {
  const theme = useTheme();
  const [layoutTick, setLayoutTick] = useState(0);

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

  const bumpLayout = useCallback(() => {
    setLayoutTick((tick) => tick + 1);
  }, []);

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
      const popup = document.getElementById("tv-weather-popup-panel");
      if (popup?.contains(target)) return;
      onClose();
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (!active) return;
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleEscape);
    // 열기 클릭과 같은 틱에서 바로 닫히지 않도록, 현재 클릭이 끝난 뒤 등록
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
  }, [open, anchorEl, onClose]);

  if (typeof document === "undefined" || !open || !anchorEl) return null;

  return createPortal(
    <>
      <Box
        id="tv-weather-popup-panel"
        className="tv-weather-popup"
        role="dialog"
        aria-modal="true"
        aria-label={forecastTitle}
        onMouseDown={(e) => e.stopPropagation()}
        sx={{
          position: "fixed",
          top: position.top,
          left: position.left,
          width: POPUP_WIDTH,
          maxWidth: "calc(100vw - 32px)",
          maxHeight: "min(480px, calc(100dvh - 96px))",
          overflowY: "auto",
          overflowX: "hidden",
          zIndex: theme.zIndex.modal + 10,
          bgcolor: "background.paper",
          color: "text.primary",
          border: 1,
          borderColor: "divider",
          borderRadius: 2,
          boxShadow: theme.shadows[8],
          p: 2,
          boxSizing: "border-box",
        }}
      >
        <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "flex-start", mb: 1.5 }}>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              {forecastTitle}
            </Typography>
            <Stack direction="row" spacing={0.5} sx={{ alignItems: "center", mt: 0.25 }}>
              <MyLocationIcon className="tv-weather-popup__icon" />
              <Typography variant="caption" color="text.secondary" noWrap>
                {data?.coords.label ?? "—"}
              </Typography>
            </Stack>
          </Box>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onRefresh();
            }}
            aria-label={refreshLabel}
            sx={{ ml: 1, flexShrink: 0 }}
          >
            <RefreshIcon className="tv-weather-popup__icon" />
          </IconButton>
        </Stack>

        {error && (
          <Typography variant="body2" color="error" sx={{ mb: 1 }}>
            {error}
          </Typography>
        )}

        {data && (
          <Box
            sx={{
              p: 1.5,
              mb: 1.5,
              borderRadius: 1.5,
              bgcolor: "action.hover",
              border: 1,
              borderColor: "divider",
            }}
          >
            <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
              <WeatherEmoji code={data.current.weatherCode} size="lg" />
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="h5" sx={{ fontWeight: 800, lineHeight: 1.1 }}>
                  {Math.round(data.current.temperature)}°C
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.25 }}>
                  {weatherCodeLabel(data.current.weatherCode, language)} ·{" "}
                  {language === "ko" ? "습도" : "Humidity"} {data.current.humidity}% ·{" "}
                  {language === "ko" ? "풍속" : "Wind"}{" "}
                  {Math.round(data.current.windSpeed)}km/h
                </Typography>
              </Box>
            </Stack>
          </Box>
        )}

        <Divider sx={{ mb: 1 }} />

        <Stack spacing={0.25} className="tv-weather-popup__days">
          {data?.daily.map((day) => (
            <Box key={day.date} className="tv-weather-popup__day-row">
              <Typography variant="caption" className="tv-weather-popup__day-label">
                {formatDayLabel(day.date, language, timeZone)}
              </Typography>
              <WeatherEmoji code={day.weatherCode} />
              <Typography variant="caption" className="tv-weather-popup__day-desc" noWrap>
                {weatherCodeLabel(day.weatherCode, language)}
              </Typography>
              <Typography variant="caption" className="tv-weather-popup__day-temp">
                {Math.round(day.tempMin)}° / {Math.round(day.tempMax)}°
              </Typography>
              <Typography variant="caption" className="tv-weather-popup__day-rain">
                {day.precipProb}%
              </Typography>
            </Box>
          ))}
        </Stack>

        {!data && loading && (
          <Stack sx={{ alignItems: "center", py: 3 }}>
            <CircularProgress size={24} />
          </Stack>
        )}
      </Box>
    </>,
    document.body,
  );
});

function NavClockDisplay() {
  const { timeZone, language } = useLocale();
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    setNow(new Date());
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, [timeZone]);

  return (
    <Paper
      variant="outlined"
      sx={{
        px: 1.25,
        py: 0.5,
        borderRadius: 1.5,
        display: "flex",
        alignItems: "center",
        gap: 0.75,
        bgcolor: "background.paper",
      }}
    >
      <AccessTimeIcon sx={{ fontSize: 16, width: 16, height: 16, flexShrink: 0, color: "text.secondary" }} />
      <Box>
        <Typography
          variant="caption"
          suppressHydrationWarning
          sx={{ display: "block", fontWeight: 700, lineHeight: 1.2, fontVariantNumeric: "tabular-nums" }}
        >
          {formatLocaleClock(now, language, timeZone)}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.65rem" }}>
          {resolveTimeZoneLabel(timeZone, language)}
        </Typography>
      </Box>
    </Paper>
  );
}

export function NavClockWeather() {
  const pathname = usePathname();
  const { language, translate, timeZone } = useLocale();
  const { data, loading, error, refresh, usingDeviceLocation } = useWeather();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const open = Boolean(anchorEl);

  useEffect(() => {
    setAnchorEl(null);
  }, [pathname]);

  const handleWeatherClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setAnchorEl((prev) => (prev ? null : event.currentTarget));
  };

  const handleWeatherMouseDown = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
  };

  return (
    <>
      <Stack
        direction="row"
        spacing={{ xs: 1, md: 1.5 }}
        sx={{
          alignItems: "center",
          display: { xs: "none", sm: "flex" },
          flexShrink: 0,
        }}
      >
        <NavClockDisplay />

        <Paper
          component="button"
          type="button"
          variant="outlined"
          aria-expanded={open}
          aria-haspopup="dialog"
          onClick={handleWeatherClick}
          onMouseDown={handleWeatherMouseDown}
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
            "&:hover": { bgcolor: "action.hover" },
          }}
        >
          {loading && !data ? (
            <CircularProgress size={16} />
          ) : (
            <>
              <Box
                component="span"
                sx={{ fontSize: 18, lineHeight: 1, width: 22, textAlign: "center", flexShrink: 0 }}
              >
                {data ? weatherCodeEmoji(data.current.weatherCode) : "🌡️"}
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="caption" sx={{ display: "block", fontWeight: 700, lineHeight: 1.2 }}>
                  {data ? `${Math.round(data.current.temperature)}°C` : "--°C"}
                  {data && (
                    <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
                      {weatherCodeLabel(data.current.weatherCode, language)}
                    </Typography>
                  )}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.65rem" }} noWrap>
                  {data?.coords.label ?? translate("weather.locating")}
                  {usingDeviceLocation ? " · GPS" : ""}
                </Typography>
              </Box>
            </>
          )}
        </Paper>
      </Stack>

      <WeatherForecastPopup
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        data={data}
        loading={loading}
        error={error}
        onRefresh={refresh}
        language={language}
        forecastTitle={translate("weather.forecast")}
        refreshLabel={translate("weather.refresh")}
        timeZone={timeZone}
      />
    </>
  );
}
