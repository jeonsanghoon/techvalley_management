/** Auto-generated message bundles */
export { KO_MESSAGES } from "./ko";
export { EN_MESSAGES } from "./en";

import { KO_MESSAGES } from "./ko";
import { EN_MESSAGES } from "./en";

export type TranslationKey = keyof typeof KO_MESSAGES;

export const MESSAGES = {
  ko: KO_MESSAGES,
  en: EN_MESSAGES,
} as const;
