"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useTheme } from "@mui/material";
import type { FleetMapEquipment } from "@/lib/fleet-map-types";

type FleetMapMarkerPopupProps = {
  map: google.maps.Map | null;
  selected: FleetMapEquipment | null;
  isFullscreen: boolean;
  projectionReady: boolean;
  latLngToScreen: (lat: number, lng: number) => { x: number; y: number } | null;
  onClose: () => void;
  ariaLabel: string;
  closeLabel: string;
  children: React.ReactNode;
};

/** 지도 overflow 클리핑 회피 — body 포털 + 지도 OverlayView 투영 */
export function FleetMapMarkerPopup({
  map,
  selected,
  isFullscreen,
  projectionReady,
  latLngToScreen,
  onClose,
  ariaLabel,
  closeLabel,
  children,
}: FleetMapMarkerPopupProps) {
  const theme = useTheme();
  const [screenPos, setScreenPos] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!map || !selected) {
      setScreenPos(null);
      return;
    }

    let active = true;

    const updatePosition = () => {
      if (!active) return;
      const next = latLngToScreen(selected.lat, selected.lng);
      if (next) setScreenPos(next);
    };

    updatePosition();

    const listeners = ["idle", "bounds_changed", "zoom_changed", "center_changed", "drag", "dragend"].map(
      (event) => map.addListener(event, updatePosition),
    );
    window.addEventListener("resize", updatePosition);
    const raf = requestAnimationFrame(updatePosition);
    const timers = [16, 50, 120, 250, 500].map((ms) => window.setTimeout(updatePosition, ms));

    return () => {
      active = false;
      cancelAnimationFrame(raf);
      timers.forEach((id) => window.clearTimeout(id));
      listeners.forEach((listener) => google.maps.event.removeListener(listener));
      window.removeEventListener("resize", updatePosition);
    };
  }, [map, selected, latLngToScreen, projectionReady]);

  if (!selected || typeof document === "undefined") return null;

  const mapDiv = map?.getDiv();
  const fallbackPos =
    mapDiv && !screenPos
      ? (() => {
          const rect = mapDiv.getBoundingClientRect();
          return { x: rect.left + rect.width / 2, y: rect.top + rect.height * 0.42 };
        })()
      : null;

  const pos = screenPos ?? fallbackPos;
  if (!pos) return null;

  const zIndex = isFullscreen ? theme.zIndex.modal + 8 : theme.zIndex.tooltip + 10;

  return createPortal(
    <div
      className="tv-fleet-map-overlay-popup tv-fleet-map-overlay-popup--portal"
      role="dialog"
      aria-label={ariaLabel}
      style={{
        position: "fixed",
        left: pos.x,
        top: pos.y,
        transform: "translate(-50%, calc(-100% - 48px))",
        zIndex,
        pointerEvents: "auto",
      }}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        className="tv-fleet-map-overlay-popup__close"
        aria-label={closeLabel}
        onClick={onClose}
      >
        ×
      </button>
      {children}
    </div>,
    document.body,
  );
}
