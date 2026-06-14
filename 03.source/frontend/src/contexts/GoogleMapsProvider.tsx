"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useJsApiLoader } from "@react-google-maps/api";
import { getGoogleMapsApiKey, GOOGLE_MAPS_LOADER_LANGUAGE } from "@/lib/google-maps-config";

/** useLoadScript — 매 렌더마다 새 배열 금지 */
const MAP_LIBRARIES: ("maps")[] = ["maps"];

/** Maps JS API region bias — 로더는 1회만 고정 */
const LOADER_REGION = "US";

type GoogleMapsContextValue = {
  isLoaded: boolean;
  loadError: Error | undefined;
  configError: boolean;
  blockedByClient: boolean;
};

const GoogleMapsContext = createContext<GoogleMapsContextValue | null>(null);

const NO_KEY_VALUE: GoogleMapsContextValue = {
  isLoaded: false,
  loadError: undefined,
  configError: true,
  blockedByClient: false,
};

function isLikelyBlockedByClient(error: Error | undefined): boolean {
  if (!error) return false;
  const text = `${error.name} ${error.message}`.toLowerCase();
  return (
    text.includes("blocked") ||
    text.includes("err_blocked_by_client") ||
    text.includes("failed to fetch") ||
    text.includes("networkerror")
  );
}

function GoogleMapsLoader({
  apiKey,
  language,
  children,
}: {
  apiKey: string;
  language: string;
  children: ReactNode;
}) {
  /** @googlemaps/js-api-loader — importLibrary 준비 후 isLoaded (프록시 apiUrl은 서브모듈 kO/bq 오류 유발) */
  const { isLoaded, loadError } = useJsApiLoader({
    id: "techvalley-google-maps",
    googleMapsApiKey: apiKey,
    language,
    region: LOADER_REGION,
    libraries: MAP_LIBRARIES,
    preventGoogleFontsLoading: false,
    version: "quarterly",
  });

  const blockedByClient = isLikelyBlockedByClient(loadError);

  const value = useMemo(
    () => ({
      isLoaded,
      loadError,
      configError: false,
      blockedByClient,
    }),
    [isLoaded, loadError, blockedByClient],
  );

  return <GoogleMapsContext.Provider value={value}>{children}</GoogleMapsContext.Provider>;
}

export function GoogleMapsProvider({ children }: { children: ReactNode }) {
  const apiKey = getGoogleMapsApiKey();

  if (!apiKey) {
    return <GoogleMapsContext.Provider value={NO_KEY_VALUE}>{children}</GoogleMapsContext.Provider>;
  }

  /** Maps JS 로더 언어는 고정 — 앱 locale 변경 시 useLoadScript 재호출 방지 */
  return (
    <GoogleMapsLoader apiKey={apiKey} language={GOOGLE_MAPS_LOADER_LANGUAGE}>
      {children}
    </GoogleMapsLoader>
  );
}

export function useGoogleMapsLoader() {
  const ctx = useContext(GoogleMapsContext);
  if (!ctx) {
    throw new Error("useGoogleMapsLoader must be used within GoogleMapsProvider");
  }
  return ctx;
}
