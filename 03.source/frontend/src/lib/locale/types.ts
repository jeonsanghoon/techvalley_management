export type AppLanguage = "ko" | "en";

export type LocalizableText = { ko: string; en: string };

export function localeLabel(text: LocalizableText, language: AppLanguage): string {
  return text[language];
}

export function isAppLanguage(value: string | null | undefined): value is AppLanguage {
  return value === "ko" || value === "en";
}
