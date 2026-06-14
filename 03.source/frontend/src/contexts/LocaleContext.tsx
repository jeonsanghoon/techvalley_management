"use client";

import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  DEFAULT_LOCALE,
  formatLocaleAsOf,
  formatLocaleDateTime,
  getServiceRegion,
  readLocaleFromStorage,
  t,
  writeLocaleToStorage,
  type AppLanguage,
  type LocaleSettings,
  type ServiceRegionId,
  type TranslationKey,
} from "@/lib/locale";
import type { DateTimePreset } from "@/lib/locale/datetime";

type LocaleContextValue = LocaleSettings & {
  setLanguage: (language: AppLanguage) => void;
  setTimeZone: (timeZone: string) => void;
  setServiceRegion: (region: ServiceRegionId) => void;
  translate: (key: TranslationKey) => string;
  formatDateTime: (value: string | null | undefined, preset?: DateTimePreset) => string;
  formatAsOf: (asOf: string) => string;
  hydrated: boolean;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

function applyLocaleToDocument(settings: LocaleSettings) {
  if (typeof document === "undefined") return;
  document.documentElement.lang = settings.language;
  document.documentElement.setAttribute("data-locale", settings.language);
  document.documentElement.setAttribute("data-language", settings.language);
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<LocaleSettings>(DEFAULT_LOCALE);
  const [hydrated, setHydrated] = useState(false);

  useLayoutEffect(() => {
    const resolved = readLocaleFromStorage();
    setSettings(resolved);
    applyLocaleToDocument(resolved);
    setHydrated(true);
  }, []);

  useLayoutEffect(() => {
    if (!hydrated) return;
    applyLocaleToDocument(settings);
    writeLocaleToStorage(settings);
  }, [settings, hydrated]);

  const persist = useCallback((patch: Partial<LocaleSettings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  }, []);

  const setLanguage = useCallback(
    (language: AppLanguage) => {
      if (language !== "ko" && language !== "en") return;
      persist({ language });
    },
    [persist],
  );
  const setTimeZone = useCallback((timeZone: string) => persist({ timeZone }), [persist]);
  /** 서비스 지역 변경 시 해당 지역 기본 타임존으로 함께 전환 */
  const setServiceRegion = useCallback((serviceRegion: ServiceRegionId) => {
    const preset = getServiceRegion(serviceRegion);
    persist({ serviceRegion, timeZone: preset.defaultTimeZone });
  }, [persist]);

  const translate = useCallback(
    (key: TranslationKey) => t(key, settings.language),
    [settings.language],
  );

  const formatDateTime = useCallback(
    (value: string | null | undefined, preset?: DateTimePreset) =>
      formatLocaleDateTime(value, {
        language: settings.language,
        timeZone: settings.timeZone,
        preset,
      }),
    [settings.language, settings.timeZone],
  );

  const formatAsOf = useCallback(
    (asOf: string) => {
      if (asOf === "streaming") return t("scope.streaming", settings.language);
      return formatLocaleAsOf(asOf, {
        language: settings.language,
        timeZone: settings.timeZone,
      });
    },
    [settings.language, settings.timeZone],
  );

  const value = useMemo(
    () => ({
      ...settings,
      setLanguage,
      setTimeZone,
      setServiceRegion,
      translate,
      formatDateTime,
      formatAsOf,
      hydrated,
    }),
    [settings, setLanguage, setTimeZone, setServiceRegion, translate, formatDateTime, formatAsOf, hydrated],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error("useLocale must be used within LocaleProvider");
  }
  return ctx;
}
