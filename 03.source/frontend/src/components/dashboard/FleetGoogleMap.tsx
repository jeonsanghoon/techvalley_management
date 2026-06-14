"use client";

import { useEffect, useRef, type CSSProperties } from "react";

type FleetGoogleMapProps = {
  /** fullscreen/embedded 전환 시에만 변경 — Strict Mode remount 격리 */
  mapKey: string;
  className?: string;
  style?: CSSProperties;
  center: google.maps.LatLngLiteral;
  zoom: number;
  options: google.maps.MapOptions;
  onLoad: (map: google.maps.Map) => void;
  onUnmount?: (map: google.maps.Map) => void;
  onClick?: () => void;
};

/**
 * google.maps.Map을 useEffect + importLibrary 이후에 생성.
 * @react-google-maps/api GoogleMap(class)의 componentDidMount 레이스·Strict Mode kO/bq 오류 회피.
 */
export function FleetGoogleMap({
  mapKey,
  className,
  style,
  center,
  zoom,
  options,
  onLoad,
  onUnmount,
  onClick,
}: FleetGoogleMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const onLoadRef = useRef(onLoad);
  const onUnmountRef = useRef(onUnmount);
  const onClickRef = useRef(onClick);
  const optionsRef = useRef(options);

  onLoadRef.current = onLoad;
  onUnmountRef.current = onUnmount;
  onClickRef.current = onClick;
  optionsRef.current = options;

  useEffect(() => {
    let cancelled = false;
    let clickListener: google.maps.MapsEventListener | null = null;

    const init = async () => {
      if (typeof google === "undefined" || !containerRef.current) return;

      try {
        await google.maps.importLibrary("maps");
      } catch {
        return;
      }

      if (cancelled || !containerRef.current) return;

      try {
        const instance = new google.maps.Map(containerRef.current, {
          ...optionsRef.current,
          center,
          zoom,
        });

        if (cancelled) {
          containerRef.current.replaceChildren();
          return;
        }

        mapRef.current = instance;
        onLoadRef.current(instance);

        if (onClickRef.current) {
          clickListener = instance.addListener("click", () => onClickRef.current?.());
        }
      } catch {
        containerRef.current?.replaceChildren();
      }
    };

    void init();

    return () => {
      cancelled = true;
      if (clickListener) google.maps.event.removeListener(clickListener);

      const instance = mapRef.current;
      mapRef.current = null;
      if (instance) {
        google.maps.event.clearInstanceListeners(instance);
        onUnmountRef.current?.(instance);
        instance.getDiv()?.replaceChildren();
      }
    };
    // mapKey만 — center/zoom/options는 아래 effect에서 갱신
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapKey]);

  useEffect(() => {
    const instance = mapRef.current;
    if (!instance) return;
    instance.setOptions(optionsRef.current);
  }, [options]);

  useEffect(() => {
    const instance = mapRef.current;
    if (!instance) return;
    instance.setCenter(center);
    instance.setZoom(zoom);
  }, [center.lat, center.lng, zoom]);

  return <div ref={containerRef} className={className} style={style} />;
}
