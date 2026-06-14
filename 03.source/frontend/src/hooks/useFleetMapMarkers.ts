"use client";

import { useEffect, useRef } from "react";

export type FleetMarkerSpec = {
  id: string;
  lat: number;
  lng: number;
  icon: google.maps.Icon;
  zIndex: number;
};

/** google.maps.Marker를 imperative로 관리 — MarkerF class componentDidMount 레이스 회피 */
export function useFleetMapMarkers(
  map: google.maps.Map | null,
  markers: FleetMarkerSpec[],
  onMarkerClick: (id: string, domEvent?: MouseEvent | TouchEvent | PointerEvent | Event) => void,
) {
  const markersRef = useRef<Map<string, google.maps.Marker>>(new Map());
  const onClickRef = useRef(onMarkerClick);
  onClickRef.current = onMarkerClick;

  useEffect(() => {
    if (!map || typeof google === "undefined") return;

    const pool = markersRef.current;
    const nextIds = new Set(markers.map((m) => m.id));

    for (const [id, marker] of pool) {
      if (!nextIds.has(id)) {
        google.maps.event.clearInstanceListeners(marker);
        marker.setMap(null);
        pool.delete(id);
      }
    }

    for (const spec of markers) {
      let marker = pool.get(spec.id);
      if (!marker) {
        marker = new google.maps.Marker({
          map,
          position: { lat: spec.lat, lng: spec.lng },
          icon: spec.icon,
          zIndex: spec.zIndex,
        });
        marker.addListener("click", (e: google.maps.MapMouseEvent) => {
          e.stop();
          onClickRef.current(spec.id, e.domEvent);
        });
        pool.set(spec.id, marker);
      } else {
        marker.setPosition({ lat: spec.lat, lng: spec.lng });
        marker.setIcon(spec.icon);
        marker.setZIndex(spec.zIndex);
        if (marker.getMap() !== map) marker.setMap(map);
      }
    }
  }, [map, markers]);

  useEffect(() => {
    const pool = markersRef.current;
    return () => {
      for (const [, marker] of pool) {
        google.maps.event.clearInstanceListeners(marker);
        marker.setMap(null);
      }
      pool.clear();
    };
  }, [map]);
}
