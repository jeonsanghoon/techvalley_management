export type {
  AppLanguage,
  LocalizableText,
} from "./locale/types";
export {
  isAppLanguage,
  localeLabel,
} from "./locale/types";

export type { TranslationKey } from "./locale/messages";
export { MESSAGES } from "./locale/messages";

export {
  LOCALE_STORAGE_KEY,
  DEFAULT_LOCALE,
  TIMEZONE_OPTIONS,
  SERVICE_REGIONS,
  getServiceRegion,
  getTimeZoneOption,
  formatTimeZoneLabel,
  timeZonesForRegion,
  timezoneMatchesServiceRegion,
  PRIMARY_SERVICE_REGION_IDS,
  isServiceRegionId,
  readLocaleFromStorage,
  writeLocaleToStorage,
  type LocaleSettings,
  type ServiceRegionId,
  type TimeZoneOption,
  type ServiceRegionPreset,
} from "./locale/settings";

export { localizeGridHeader, GRID_HEADER_I18N } from "./locale/grid-headers";
export {
  localizeDomainValue,
  localizeActionLabel,
  localizeAppRole,
  DOMAIN_VALUE_I18N,
} from "./locale/domain-labels";
export { SEARCH_FIELD_LABELS, searchFieldLabel } from "./locale/search-fields";
export {
  formatLocaleAsOf,
  formatLocaleClock,
  formatLocaleDateTime,
  gridDatePreset,
  type DateTimePreset,
  type LocaleDateTimeOptions,
} from "./locale/datetime";

import type { AppLanguage } from "./locale/types";
import { MESSAGES, type TranslationKey } from "./locale/messages";

export function t(key: TranslationKey, language: AppLanguage): string {
  const table = MESSAGES[language] as Record<string, string>;
  const fallback = MESSAGES.ko as Record<string, string>;
  return table[key] ?? fallback[key] ?? key;
}
