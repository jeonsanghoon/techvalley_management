import type { AppLanguage, LocalizableText } from "./types";
import { localeLabel } from "./types";

export type ServiceRegionId =
  | "korea"
  | "east-asia"
  | "europe"
  | "mexico"
  | "north-america"
  | "middle-east"
  | "global";

export type LocaleSettings = {
  language: AppLanguage;
  timeZone: string;
  serviceRegion: ServiceRegionId;
};

export const LOCALE_STORAGE_KEY = "tv-locale";

export const DEFAULT_LOCALE: LocaleSettings = {
  language: "ko",
  timeZone: "UTC",
  serviceRegion: "global",
};

export type TimeZoneOption = {
  id: string;
  label: LocalizableText;
  region?: ServiceRegionId;
};

export const TIMEZONE_OPTIONS: TimeZoneOption[] = [
  { id: "Asia/Seoul", label: { ko: "서울 (KST)", en: "Seoul (KST)" }, region: "korea" },
  { id: "Asia/Tokyo", label: { ko: "도쿄 (JST)", en: "Tokyo (JST)" }, region: "east-asia" },
  { id: "Asia/Shanghai", label: { ko: "상하이 (CST)", en: "Shanghai (CST)" }, region: "east-asia" },
  { id: "Asia/Hong_Kong", label: { ko: "홍콩 (HKT)", en: "Hong Kong (HKT)" }, region: "east-asia" },
  { id: "Asia/Singapore", label: { ko: "싱가포르 (SGT)", en: "Singapore (SGT)" }, region: "east-asia" },
  { id: "Europe/London", label: { ko: "런던 (GMT/BST)", en: "London (GMT/BST)" }, region: "europe" },
  { id: "Europe/Berlin", label: { ko: "베를린 (CET)", en: "Berlin (CET)" }, region: "europe" },
  { id: "Europe/Paris", label: { ko: "파리 (CET)", en: "Paris (CET)" }, region: "europe" },
  { id: "Europe/Amsterdam", label: { ko: "암스테르담 (CET)", en: "Amsterdam (CET)" }, region: "europe" },
  { id: "America/New_York", label: { ko: "뉴욕 (ET)", en: "New York (ET)" }, region: "north-america" },
  { id: "America/Chicago", label: { ko: "시카고 (CT)", en: "Chicago (CT)" }, region: "north-america" },
  { id: "America/Los_Angeles", label: { ko: "로스앤젤레스 (PT)", en: "Los Angeles (PT)" }, region: "north-america" },
  { id: "America/Mexico_City", label: { ko: "멕시코시티 (CST)", en: "Mexico City (CST)" }, region: "mexico" },
  { id: "America/Tijuana", label: { ko: "티후아나 (PST)", en: "Tijuana (PST)" }, region: "mexico" },
  { id: "America/Monterrey", label: { ko: "몬테레이 (CST)", en: "Monterrey (CST)" }, region: "mexico" },
  { id: "Asia/Dubai", label: { ko: "두바이 (GST)", en: "Dubai (GST)" }, region: "middle-east" },
  { id: "UTC", label: { ko: "UTC", en: "UTC" }, region: "global" },
];

/** 헤더 빠른 선택 — 한국 · 동아시아 · 유럽 · 멕시코 · 전세계 */
export const PRIMARY_SERVICE_REGION_IDS: ServiceRegionId[] = [
  "korea",
  "east-asia",
  "europe",
  "mexico",
  "global",
];

export type ServiceRegionPreset = {
  id: ServiceRegionId;
  label: LocalizableText;
  center: { lat: number; lng: number };
  zoom: number;
  googleRegion: string;
  defaultTimeZone: string;
};

export const SERVICE_REGIONS: ServiceRegionPreset[] = [
  {
    id: "korea",
    label: { ko: "한국", en: "Korea" },
    center: { lat: 36.4, lng: 127.8 },
    zoom: 7,
    googleRegion: "KR",
    defaultTimeZone: "Asia/Seoul",
  },
  {
    id: "europe",
    label: { ko: "유럽", en: "Europe" },
    center: { lat: 50.0, lng: 10.0 },
    zoom: 5,
    googleRegion: "DE",
    defaultTimeZone: "Europe/Berlin",
  },
  {
    id: "mexico",
    label: { ko: "멕시코", en: "Mexico" },
    center: { lat: 23.6, lng: -102.5 },
    zoom: 5,
    googleRegion: "MX",
    defaultTimeZone: "America/Mexico_City",
  },
  {
    id: "north-america",
    label: { ko: "북미", en: "North America" },
    center: { lat: 39.8, lng: -98.5 },
    zoom: 4,
    googleRegion: "US",
    defaultTimeZone: "America/New_York",
  },
  {
    id: "east-asia",
    label: { ko: "동아시아 (일본·중국)", en: "East Asia (Japan · China)" },
    center: { lat: 34.0, lng: 130.0 },
    zoom: 4,
    googleRegion: "JP",
    defaultTimeZone: "Asia/Seoul",
  },
  {
    id: "middle-east",
    label: { ko: "중동·아프리카", en: "Middle East & Africa" },
    center: { lat: 25.0, lng: 45.0 },
    zoom: 4,
    googleRegion: "AE",
    defaultTimeZone: "Asia/Dubai",
  },
  {
    id: "global",
    label: { ko: "전세계", en: "Worldwide" },
    center: { lat: 20.0, lng: 0.0 },
    zoom: 2,
    googleRegion: "US",
    defaultTimeZone: "UTC",
  },
];

export function getServiceRegion(id: ServiceRegionId): ServiceRegionPreset {
  return SERVICE_REGIONS.find((r) => r.id === id) ?? SERVICE_REGIONS[0];
}

export function getTimeZoneOption(id: string): TimeZoneOption | undefined {
  return TIMEZONE_OPTIONS.find((tz) => tz.id === id);
}

export function formatTimeZoneLabel(id: string, language: AppLanguage): string {
  const opt = getTimeZoneOption(id);
  if (opt) return localeLabel(opt.label, language);
  return id.replace(/_/g, " ").replace("/", " / ");
}

/** 동아시아 운영 기준 시각은 한국(KST) — 서울을 동아시아 권역 타임존에 포함 */
export function timezoneMatchesServiceRegion(
  tz: TimeZoneOption,
  regionId: ServiceRegionId,
): boolean {
  if (tz.region === regionId) return true;
  if (regionId === "east-asia" && tz.id === "Asia/Seoul") return true;
  return false;
}

export function timeZonesForRegion(regionId: ServiceRegionId): TimeZoneOption[] {
  const inRegion = TIMEZONE_OPTIONS.filter((tz) => timezoneMatchesServiceRegion(tz, regionId));
  const rest = TIMEZONE_OPTIONS.filter((tz) => !timezoneMatchesServiceRegion(tz, regionId));
  return [...inRegion, ...rest];
}

function normalizeServiceRegion(value: string | null | undefined): ServiceRegionId {
  if (value === "asia-pacific") return "east-asia";
  if (isServiceRegionId(value)) return value;
  return DEFAULT_LOCALE.serviceRegion;
}

export function isServiceRegionId(value: string | null | undefined): value is ServiceRegionId {
  return SERVICE_REGIONS.some((r) => r.id === value);
}

export function readLocaleFromStorage(): LocaleSettings {
  if (typeof window === "undefined") return DEFAULT_LOCALE;
  try {
    const raw = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (!raw) return DEFAULT_LOCALE;
    const parsed = JSON.parse(raw) as Partial<LocaleSettings>;
    return {
      language: parsed.language === "en" ? "en" : "ko",
      timeZone:
        TIMEZONE_OPTIONS.some((tz) => tz.id === parsed.timeZone)
          ? parsed.timeZone!
          : DEFAULT_LOCALE.timeZone,
      serviceRegion: normalizeServiceRegion(parsed.serviceRegion),
    };
  } catch {
    return DEFAULT_LOCALE;
  }
}

export function writeLocaleToStorage(settings: LocaleSettings) {
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, JSON.stringify(settings));
  } catch {
    /* ignore */
  }
}
