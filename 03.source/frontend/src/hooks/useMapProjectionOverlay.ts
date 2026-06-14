"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** 지도 수명 동안 유지되는 OverlayView — 마커 팝업 좌표 투영용 */
export function useMapProjectionOverlay(map: google.maps.Map | null) {
  const overlayRef = useRef<google.maps.OverlayView | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    mapRef.current = map;

    if (!map || typeof google === "undefined") {
      overlayRef.current?.setMap(null);
      overlayRef.current = null;
      setReady(false);
      return;
    }

    let cancelled = false;
    let attached = false;
    let idleListener: google.maps.MapsEventListener | null = null;
    let attachTimer: number | null = null;

    const overlay = new google.maps.OverlayView();
    const markReady = () => {
      if (!cancelled && overlay.getProjection()) setReady(true);
    };
    overlay.onAdd = markReady;
    overlay.draw = markReady;

    const detachOverlay = () => {
      attached = false;
      overlay.setMap(null);
      overlayRef.current = null;
      setReady(false);
    };

    const attachOverlay = () => {
      if (cancelled || attached || mapRef.current !== map) return;
      if (!map.getDiv()?.isConnected) return;
      try {
        overlay.setMap(map);
        overlayRef.current = overlay;
        attached = true;
      } catch {
        detachOverlay();
      }
    };

    idleListener = google.maps.event.addListenerOnce(map, "idle", attachOverlay);
    attachTimer = window.setTimeout(attachOverlay, 150);

    return () => {
      cancelled = true;
      if (idleListener) google.maps.event.removeListener(idleListener);
      if (attachTimer != null) window.clearTimeout(attachTimer);
      detachOverlay();
    };
  }, [map]);

  const latLngToScreen = useCallback(
    (lat: number, lng: number): { x: number; y: number } | null => {
      const overlay = overlayRef.current;
      const activeMap = mapRef.current;
      const projection = overlay?.getProjection();
      const mapDiv = activeMap?.getDiv();
      if (!projection || !mapDiv) return null;

      const point = projection.fromLatLngToContainerPixel(new google.maps.LatLng(lat, lng));
      if (!point) return null;

      const rect = mapDiv.getBoundingClientRect();
      return {
        x: rect.left + point.x,
        y: rect.top + point.y,
      };
    },
    [map, ready],
  );

  return { ready, latLngToScreen };
}
