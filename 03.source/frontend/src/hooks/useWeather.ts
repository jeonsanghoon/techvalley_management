"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLocale } from "@/contexts/LocaleContext";
import {
  defaultWeatherCoords,
  fetchWeatherForecast,
  reverseGeocodeLabel,
  type WeatherCoords,
  type WeatherSnapshot,
} from "@/lib/weather/open-meteo";

type WeatherState = {
  data: WeatherSnapshot | null;
  loading: boolean;
  error: string | null;
  usingDeviceLocation: boolean;
};

const GEO_OPTIONS: PositionOptions = {
  enableHighAccuracy: false,
  timeout: 8000,
  maximumAge: 600_000,
};

export function useWeather() {
  const { timeZone, language } = useLocale();
  const [state, setState] = useState<WeatherState>({
    data: null,
    loading: true,
    error: null,
    usingDeviceLocation: false,
  });
  const mountedRef = useRef(true);
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const loadForCoords = useCallback(
    async (coords: WeatherCoords, usingDeviceLocation: boolean) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const data = await fetchWeatherForecast(coords, timeZone);
        if (!mountedRef.current) return;
        setState({ data, loading: false, error: null, usingDeviceLocation });
      } catch (e) {
        if (!mountedRef.current) return;
        setState({
          data: null,
          loading: false,
          error: e instanceof Error ? e.message : "날씨 조회 실패",
          usingDeviceLocation,
        });
      }
    },
    [timeZone],
  );

  const resolveCoordsFromGeolocation = useCallback(async (): Promise<{
    coords: WeatherCoords;
    usingDeviceLocation: boolean;
  }> => {
    const fallback = defaultWeatherCoords(language);

    if (typeof navigator === "undefined" || !navigator.geolocation) {
      return { coords: fallback, usingDeviceLocation: false };
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          const label = await reverseGeocodeLabel(latitude, longitude, language);
          resolve({ coords: { latitude, longitude, label }, usingDeviceLocation: true });
        },
        () => resolve({ coords: fallback, usingDeviceLocation: false }),
        GEO_OPTIONS,
      );
    });
  }, [language]);

  const refresh = useCallback(() => {
    if (state.data) {
      void loadForCoords(state.data.coords, state.usingDeviceLocation);
      return;
    }
    void resolveCoordsFromGeolocation().then(({ coords, usingDeviceLocation }) =>
      loadForCoords(coords, usingDeviceLocation),
    );
  }, [loadForCoords, resolveCoordsFromGeolocation, state.data, state.usingDeviceLocation]);

  useEffect(() => {
    void resolveCoordsFromGeolocation().then(({ coords, usingDeviceLocation }) =>
      loadForCoords(coords, usingDeviceLocation),
    );
  }, [loadForCoords, resolveCoordsFromGeolocation, timeZone]);

  /** UI 언어 변경 시 위치 라벨만 해당 locale로 재조회 */
  useEffect(() => {
    const snapshot = stateRef.current.data;
    const usingGps = stateRef.current.usingDeviceLocation;
    if (!snapshot) return;

    let cancelled = false;

    void (async () => {
      const { latitude, longitude } = snapshot.coords;
      const label = usingGps
        ? await reverseGeocodeLabel(latitude, longitude, language)
        : defaultWeatherCoords(language).label;

      if (cancelled || !mountedRef.current) return;

      setState((prev) => {
        if (!prev.data) return prev;
        if (
          prev.data.coords.latitude !== latitude ||
          prev.data.coords.longitude !== longitude
        ) {
          return prev;
        }
        if (prev.data.coords.label === label) return prev;
        return {
          ...prev,
          data: {
            ...prev.data,
            coords: { latitude, longitude, label },
          },
        };
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [language]);

  return { ...state, refresh };
}
