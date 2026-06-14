"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { usePathname } from "next/navigation";
import { createPortal } from "react-dom";
import {
  Box,
  Chip,
  CircularProgress,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import PlaceIcon from "@mui/icons-material/Place";
import { FleetGoogleMap } from "@/components/dashboard/FleetGoogleMap";
import { useFleetMapMarkers } from "@/hooks/useFleetMapMarkers";
import { applyFleetMapTheme, getFleetMapInitOptions } from "@/lib/google-maps-fleet-options";
import { fleetPinIcon } from "@/lib/fleet-map-markers";
import type { FleetMapEquipment } from "@/lib/fleet-map-types";
import { FleetMapMarkerInfo } from "@/components/dashboard/FleetMapMarkerInfo";
import { FleetMapMarkerPopup } from "@/components/dashboard/FleetMapMarkerPopup";
import { useMapProjectionOverlay } from "@/hooks/useMapProjectionOverlay";
import { useColorMode } from "@/contexts/ColorModeContext";
import { useLocale } from "@/contexts/LocaleContext";
import { getServiceRegion, localeLabel, type TranslationKey } from "@/lib/locale";
import { GoogleMapsProvider, useGoogleMapsLoader } from "@/contexts/GoogleMapsProvider";
import { cleanupGoogleMapsArtifacts } from "@/lib/google-maps-cleanup";

const STATUS_META: Record<
  string,
  {
    labelKey: TranslationKey;
    color: string;
    chipColor: "success" | "error" | "warning" | "default" | "secondary";
  }
> = {
  online: { labelKey: "map.status.online", color: "#15b79f", chipColor: "success" },
  alarm: { labelKey: "map.status.alarm", color: "#f04438", chipColor: "error" },
  maintenance: { labelKey: "map.status.maintenance", color: "#fb9c0c", chipColor: "warning" },
  offline: { labelKey: "map.status.offline", color: "#9fa6ad", chipColor: "default" },
  safe_mode: { labelKey: "map.status.safe_mode", color: "#635bff", chipColor: "secondary" },
};

export type { FleetMapEquipment } from "@/lib/fleet-map-types";

type FleetMapContentProps = {
  variant: "embedded" | "fullscreen";
  equipments: FleetMapEquipment[];
  statusFilter: string | null;
  setStatusFilter: Dispatch<SetStateAction<string | null>>;
  selectedId: string | null;
  setSelectedId: Dispatch<SetStateAction<string | null>>;
  isLoaded: boolean;
  loadError: Error | undefined;
  configError: boolean;
  blockedByClient: boolean;
  markerIcons: Record<string, { normal: google.maps.Icon; selected: google.maps.Icon }> | null;
  onRequestFullscreen?: () => void;
  resizeSignal?: number;
  /** false면 설명 팝업 미표시 (풀스크린·임베디드 중복 방지) */
  infoPopupActive?: boolean;
};


function fitMapToMarkers(
  map: google.maps.Map,
  visible: FleetMapEquipment[],
  isFullscreen: boolean,
) {
  if (visible.length === 0) return;

  const bounds = new google.maps.LatLngBounds();
  visible.forEach((eq) => bounds.extend({ lat: eq.lat, lng: eq.lng }));

  const padding = isFullscreen
    ? { top: 72, right: 24, bottom: 72, left: 24 }
    : { top: 56, right: 32, bottom: 32, left: 32 };

  map.fitBounds(bounds, padding);

  google.maps.event.addListenerOnce(map, "idle", () => {
    const zoom = map.getZoom();
    if (zoom != null && visible.length > 1 && zoom > 12) {
      map.setZoom(12);
    }
    if (zoom != null && visible.length === 1) {
      map.setZoom(Math.min(zoom, 10));
    }
  });
}

function flyToServiceRegion(map: google.maps.Map, serviceRegion: ReturnType<typeof getServiceRegion>) {
  map.panTo(serviceRegion.center);
  map.setZoom(serviceRegion.zoom);
}

function FleetMapContent({
  variant,
  equipments,
  statusFilter,
  setStatusFilter,
  selectedId,
  setSelectedId,
  isLoaded,
  loadError,
  configError,
  blockedByClient,
  markerIcons,
  onRequestFullscreen,
  resizeSignal,
  infoPopupActive = true,
}: FleetMapContentProps) {
  const isFullscreen = variant === "fullscreen";
  const theme = useTheme();
  const { mode } = useColorMode();
  const { serviceRegion, language, translate } = useLocale();
  const regionPreset = getServiceRegion(serviceRegion);
  const isDark = mode === "dark";
  /** 플릿 지도 — Styling Wizard Night 프리셋 고정 */
  const mapNightTheme = true;
  const overlaySurface = alpha(theme.palette.background.paper, 0.94);
  const mapSurfaceBg = "#242f3e";
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const { ready: projectionReady, latLngToScreen } = useMapProjectionOverlay(map);
  const [paintReady, setPaintReady] = useState(false);
  const mapSurfaceRef = useRef<HTMLDivElement>(null);
  /** 마커 클릭 직후 map onClick이 선택 해제하는 것 방지 */
  const suppressMapClickRef = useRef(false);

  const counts = useMemo(
    () =>
      equipments.reduce<Record<string, number>>((acc, eq) => {
        acc[eq.status] = (acc[eq.status] ?? 0) + 1;
        return acc;
      }, {}),
    [equipments],
  );

  const visible = useMemo(
    () => (statusFilter ? equipments.filter((eq) => eq.status === statusFilter) : equipments),
    [equipments, statusFilter],
  );

  const selected = useMemo(
    () => visible.find((eq) => eq.id === selectedId) ?? null,
    [visible, selectedId],
  );

  useLayoutEffect(() => {
    const node = mapSurfaceRef.current;
    if (!node) return;

    let cancelled = false;
    const arm = () => {
      if (cancelled) return;
      const { width, height } = node.getBoundingClientRect();
      const minHeight = isFullscreen ? 120 : 80;
      if (width > 48 && height > minHeight) setPaintReady(true);
    };

    setPaintReady(false);
    arm();
    const raf1 = requestAnimationFrame(() => {
      requestAnimationFrame(arm);
    });
    const timers = [200, 400, 800].map((ms) => window.setTimeout(arm, ms));

    const observer = new ResizeObserver(arm);
    observer.observe(node);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf1);
      timers.forEach((id) => window.clearTimeout(id));
      observer.disconnect();
    };
  }, [isFullscreen, resizeSignal]);

  useEffect(() => {
    const node = mapSurfaceRef.current;
    if (!map || !node || typeof google === "undefined") return;

    const observer = new ResizeObserver(() => {
      google.maps.event.trigger(map, "resize");
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [map]);

  const triggerMapResize = useCallback((instance: google.maps.Map) => {
    if (typeof google === "undefined") return;
    google.maps.event.trigger(instance, "resize");
  }, []);

  const fitMapViewport = useCallback(
    (instance: google.maps.Map) => {
      if (visible.length > 0) {
        fitMapToMarkers(instance, visible, isFullscreen);
        return;
      }
      flyToServiceRegion(instance, regionPreset);
    },
    [visible, isFullscreen, regionPreset],
  );

  const fitBounds = useCallback(() => {
    if (!map) return;
    fitMapViewport(map);
  }, [map, fitMapViewport]);

  useEffect(() => {
    if (!map || !isLoaded) return;
    flyToServiceRegion(map, regionPreset);
    setSelectedId(null);
  }, [map, isLoaded, serviceRegion, regionPreset, setSelectedId]);

  useEffect(() => {
    if (!map || !isLoaded || !paintReady) return;

    triggerMapResize(map);
    fitMapViewport(map);
    const timers = [50, 200, 500, 1000, 1500].map((ms) =>
      window.setTimeout(() => {
        triggerMapResize(map);
        if (ms <= 500) fitMapViewport(map);
      }, ms),
    );
    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [map, isLoaded, paintReady, isFullscreen, isDark, resizeSignal, triggerMapResize, fitMapViewport]);

  useEffect(() => {
    if (!map || visible.length === 0) return;
    fitMapViewport(map);
  }, [map, visible, fitMapViewport]);

  useEffect(() => {
    if (selectedId && !visible.some((eq) => eq.id === selectedId)) {
      setSelectedId(null);
    }
  }, [visible, selectedId, setSelectedId]);

  /** 팝업이 뷰포트 안에 들어오도록 살짝 이동 */
  useEffect(() => {
    if (!map || !selected || typeof google === "undefined") return;

    map.panTo({ lat: selected.lat, lng: selected.lng });
    const timer = window.setTimeout(() => map.panBy(0, -80), 80);
    return () => window.clearTimeout(timer);
  }, [map, selected?.id, selected]);

  /** Google Styling Wizard Night JSON */
  useEffect(() => {
    if (!map || typeof google === "undefined") return;
    applyFleetMapTheme(map, mapNightTheme);
    const raf = requestAnimationFrame(() => {
      google.maps.event.trigger(map, "resize");
    });
    const timer = window.setTimeout(() => google.maps.event.trigger(map, "resize"), 200);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(timer);
    };
  }, [map, mapNightTheme]);

  const mapOptions = useMemo(() => {
    if (!isLoaded || typeof google === "undefined") return undefined;
    return getFleetMapInitOptions(google.maps, mapNightTheme, isFullscreen);
  }, [isLoaded, isFullscreen, mapNightTheme]);

  const onLoad = useCallback(
    (instance: google.maps.Map) => {
      setMap(instance);
      google.maps.event.addListenerOnce(instance, "idle", () => {
        triggerMapResize(instance);
        fitMapViewport(instance);
      });
    },
    [triggerMapResize, fitMapViewport],
  );

  const onUnmount = useCallback((instance?: google.maps.Map) => {
    setMap(null);
    try {
      instance?.getDiv()?.replaceChildren();
    } catch {
      /* Strict Mode remount — Google Map 내부 노드 정리 */
    }
  }, []);

  const handleMarkerClick = useCallback(
    (eq: FleetMapEquipment, domEvent?: MouseEvent | TouchEvent | PointerEvent | Event) => {
      suppressMapClickRef.current = true;
      domEvent?.stopPropagation?.();
      setSelectedId((prev) => (prev === eq.id ? null : eq.id));
      window.setTimeout(() => {
        suppressMapClickRef.current = false;
      }, 350);
    },
    [setSelectedId],
  );

  const handleMarkerClickById = useCallback(
    (id: string, domEvent?: MouseEvent | TouchEvent | PointerEvent | Event) => {
      const eq = visible.find((item) => item.id === id);
      if (eq) handleMarkerClick(eq, domEvent);
    },
    [visible, handleMarkerClick],
  );

  const markerSpecs = useMemo(() => {
    if (!markerIcons) return [];
    return visible.map((eq) => {
      const meta = STATUS_META[eq.status] ?? STATUS_META.offline;
      const icons = markerIcons[eq.status] ?? markerIcons.fallback;
      const isSelected = selectedId === eq.id;
      return {
        id: eq.id,
        lat: eq.lat,
        lng: eq.lng,
        icon: isSelected ? icons.selected : icons.normal,
        zIndex: isSelected ? 1000 : meta.chipColor === "error" ? 500 : 100,
      };
    });
  }, [visible, markerIcons, selectedId]);

  useFleetMapMarkers(map, markerSpecs, handleMarkerClickById);

  const handleMapClick = useCallback(() => {
    if (suppressMapClickRef.current) return;
    setSelectedId(null);
  }, [setSelectedId]);

  const mapContainerStyle = useMemo(
    () => ({
      position: "absolute" as const,
      inset: 0,
      width: "100%",
      height: "100%",
    }),
    [],
  );

  const canRenderMap =
    !configError && !loadError && isLoaded && markerIcons && mapOptions && paintReady;

  const statusChips = (
    <Stack
      direction="row"
      spacing={1}
      role="radiogroup"
      aria-label={translate("map.statusFilter.aria" as TranslationKey)}
      sx={{
        flexWrap: "wrap",
        gap: 1,
        ...(isFullscreen
          ? {
              position: "absolute",
              bottom: 12,
              left: 12,
              right: 12,
              zIndex: 2,
              pointerEvents: "none",
              "& .MuiChip-root": { pointerEvents: "auto", bgcolor: overlaySurface },
            }
          : {
              mt: 1.5,
              flexShrink: 0,
            }),
      }}
    >
      <Chip
        key="all"
        size="small"
        variant={statusFilter === null ? "filled" : "outlined"}
        color={statusFilter === null ? "primary" : "default"}
        onClick={() => {
          setStatusFilter(null);
          setSelectedId(null);
        }}
        label={`${translate("common.all" as TranslationKey)} ${equipments.length}`}
        sx={{ fontWeight: 600, cursor: "pointer" }}
      />
      {Object.entries(STATUS_META).map(([key, meta]) => {
        const count = counts[key] ?? 0;
        if (!count) return null;
        return (
          <Chip
            key={key}
            size="small"
            variant={statusFilter === key ? "filled" : "outlined"}
            color={meta.chipColor}
            onClick={() => {
              setStatusFilter(key);
              setSelectedId(null);
            }}
            label={`${translate(meta.labelKey)} ${count}`}
            sx={{ fontWeight: 600, cursor: "pointer" }}
          />
        );
      })}
    </Stack>
  );

  return (
    <Box
      sx={
        isFullscreen
          ? {
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              overflow: "hidden",
            }
          : {
              height: "100%",
              width: "100%",
              minHeight: 0,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }
      }
    >
      <Paper
        variant="outlined"
        className={isFullscreen ? "tv-fleet-map tv-fleet-map--fullscreen" : "tv-fleet-map"}
        sx={
          isFullscreen
            ? {
                position: "absolute",
                inset: 0,
                overflow: "hidden",
                borderRadius: 0,
                border: 0,
                bgcolor: mapSurfaceBg,
              }
            : {
                flex: 1,
                minHeight: 0,
                height: "100%",
                position: "relative",
                overflow: "hidden",
                borderRadius: 2,
                bgcolor: mapSurfaceBg,
              }
        }
      >
        <Box
          ref={mapSurfaceRef}
          sx={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            overflow: "hidden",
          }}
        >
        <Stack
          direction="row"
          spacing={1}
          sx={{
            position: "absolute",
            top: 12,
            left: 12,
            right: 12,
            zIndex: 2,
            alignItems: "center",
            justifyContent: "space-between",
            pointerEvents: "none",
            "& > *": { pointerEvents: "auto" },
          }}
        >
          <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap" }}>
            <Chip
              icon={<PlaceIcon fontSize="small" />}
              label={`${localeLabel(regionPreset.label, language)} ${translate("map.fleet")} · ${visible.length}${language === "ko" ? translate("map.units") : ` ${translate("map.units")}`}`}
              size="small"
              sx={{ fontWeight: 700, bgcolor: overlaySurface }}
            />
            {isLoaded && (
              <Chip
                label={translate("map.viewAll")}
                size="small"
                variant="outlined"
                onClick={fitBounds}
                sx={{ fontWeight: 600, bgcolor: overlaySurface, cursor: "pointer" }}
              />
            )}
          </Stack>
          <Stack direction="row" spacing={0.5}>
            {!isFullscreen && onRequestFullscreen && (
              <Tooltip title={translate("map.fullscreen")}>
                <IconButton
                  size="small"
                  onClick={onRequestFullscreen}
                  aria-label={translate("map.fullscreen")}
                  sx={{
                    bgcolor: overlaySurface,
                    border: "1px solid",
                    borderColor: "divider",
                    "&:hover": { bgcolor: "background.paper" },
                  }}
                >
                  <FullscreenIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        </Stack>

        {(configError || loadError) && (
          <Stack
            sx={{
              position: "absolute",
              inset: 0,
              alignItems: "center",
              justifyContent: "center",
              p: 2,
              bgcolor: mapSurfaceBg,
              zIndex: 1,
            }}
          >
            <Typography variant="body2" color="error" align="center">
              {configError
                ? "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY가 설정되지 않았습니다. .env.local을 확인하세요."
                : blockedByClient
                  ? language === "en"
                    ? "Google Maps was blocked by a browser extension (ad/privacy blocker). Allow this site or disable the extension."
                    : "브라우저 확장(광고·개인정보 차단)이 Google Maps 스크립트를 차단했습니다. 이 사이트 허용 또는 확장 프로그램을 비활성화해 주세요."
                  : language === "en"
                    ? "Failed to load Google Maps. Check the API key and Maps JavaScript API activation."
                    : "Google Maps를 불러오지 못했습니다. API 키와 Maps JavaScript API 활성화를 확인하세요."}
            </Typography>
          </Stack>
        )}

        {!configError && !loadError && !isLoaded && (
          <Stack
            sx={{
              position: "absolute",
              inset: 0,
              alignItems: "center",
              justifyContent: "center",
              bgcolor: mapSurfaceBg,
              zIndex: 1,
            }}
          >
            <CircularProgress size={28} />
          </Stack>
        )}

        {!canRenderMap && !configError && !loadError && isLoaded && (
          <Stack
            sx={{
              position: "absolute",
              inset: 0,
              alignItems: "center",
              justifyContent: "center",
              bgcolor: mapSurfaceBg,
              zIndex: 1,
            }}
          >
            <CircularProgress size={28} />
          </Stack>
        )}

        {canRenderMap && mapOptions && (
          <FleetGoogleMap
            mapKey={isFullscreen ? "fleet-map-fullscreen" : "fleet-map-embedded"}
            className="tv-fleet-map__canvas"
            style={mapContainerStyle}
            center={regionPreset.center}
            zoom={regionPreset.zoom}
            onLoad={onLoad}
            onUnmount={onUnmount}
            onClick={handleMapClick}
            options={mapOptions}
          />
        )}

        {infoPopupActive && selected && (
          <FleetMapMarkerPopup
            map={map}
            selected={selected}
            isFullscreen={isFullscreen}
            projectionReady={projectionReady}
            latLngToScreen={latLngToScreen}
            onClose={() => setSelectedId(null)}
            ariaLabel={`${selected.serialNo}`}
            closeLabel={translate("map.info.close")}
          >
            <FleetMapMarkerInfo
              equipment={selected}
              statusLabel={translate(STATUS_META[selected.status]?.labelKey ?? "map.status.offline")}
              statusColor={STATUS_META[selected.status]?.color ?? STATUS_META.offline.color}
            />
          </FleetMapMarkerPopup>
        )}

          {isFullscreen && statusChips}
        </Box>
      </Paper>

      {!isFullscreen && statusChips}
    </Box>
  );
}

function FleetMapPanelRoot({ equipments }: { equipments: FleetMapEquipment[] }) {
  const pathname = usePathname();
  const { translate } = useLocale();
  const mapSurfaceBg = "#242f3e";
  const { isLoaded, loadError, configError, blockedByClient } = useGoogleMapsLoader();
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [fullscreenOpen, setFullscreenOpen] = useState(false);
  const [fullscreenResizeSignal, setFullscreenResizeSignal] = useState(0);
  const theme = useTheme();

  useEffect(() => {
    return () => {
      cleanupGoogleMapsArtifacts();
    };
  }, []);

  useEffect(() => {
    if (!fullscreenOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const bump = () => setFullscreenResizeSignal((n) => n + 1);
    bump();
    const raf = requestAnimationFrame(bump);
    const timers = [80, 250, 600].map((ms) => window.setTimeout(bump, ms));

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFullscreenOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      cancelAnimationFrame(raf);
      timers.forEach((id) => window.clearTimeout(id));
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [fullscreenOpen]);

  const markerIcons = useMemo(() => {
    if (!isLoaded || typeof google === "undefined") return null;
    const icons: Record<string, { normal: google.maps.Icon; selected: google.maps.Icon }> = {};
    for (const [status, meta] of Object.entries(STATUS_META)) {
      icons[status] = {
        normal: fleetPinIcon(google.maps, meta.color, false),
        selected: fleetPinIcon(google.maps, meta.color, true),
      };
    }
    icons.fallback = {
      normal: fleetPinIcon(google.maps, STATUS_META.offline.color, false),
      selected: fleetPinIcon(google.maps, STATUS_META.offline.color, true),
    };
    return icons;
  }, [isLoaded]);

  const sharedProps = {
    equipments,
    statusFilter,
    setStatusFilter,
    selectedId,
    setSelectedId,
    isLoaded,
    loadError,
    configError,
    blockedByClient,
    markerIcons,
  };

  return (
    <>
      {!fullscreenOpen && (
        <Box sx={{ height: "100%", width: "100%", minHeight: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <FleetMapContent
            key={pathname}
            variant="embedded"
            {...sharedProps}
            infoPopupActive
            onRequestFullscreen={() => setFullscreenOpen(true)}
          />
        </Box>
      )}

      {fullscreenOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <Box
            role="dialog"
            aria-modal
            aria-label={translate("map.fullscreen")}
            sx={{
              position: "fixed",
              inset: 0,
              zIndex: theme.zIndex.modal + 2,
              width: "100vw",
              height: "100dvh",
              overflow: "hidden",
              bgcolor: mapSurfaceBg,
            }}
          >
            <Tooltip title={translate("map.close")}>
              <IconButton
                size="small"
                onClick={() => setFullscreenOpen(false)}
                aria-label={translate("map.closeFullscreen")}
                sx={{
                  position: "absolute",
                  top: 12,
                  right: 12,
                  zIndex: 6,
                  bgcolor: (t) => alpha(t.palette.background.paper, 0.94),
                  border: "1px solid",
                  borderColor: "divider",
                  boxShadow: 2,
                  "&:hover": { bgcolor: "background.paper" },
                }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            <Box sx={{ position: "absolute", inset: 0 }}>
              <FleetMapContent
                key={`fullscreen-${fullscreenResizeSignal}`}
                variant="fullscreen"
                {...sharedProps}
                infoPopupActive
                resizeSignal={fullscreenResizeSignal}
              />
            </Box>
          </Box>,
          document.body,
        )}
    </>
  );
}

export function FleetMapPanel({ equipments }: { equipments: FleetMapEquipment[] }) {
  const pathname = usePathname();
  return (
    <GoogleMapsProvider>
      <FleetMapPanelRoot key={pathname} equipments={equipments} />
    </GoogleMapsProvider>
  );
}
