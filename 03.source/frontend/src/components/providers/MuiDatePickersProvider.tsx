"use client";

import type { ReactNode } from "react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { enUS as pickersEnUS, koKR as pickersKoKR } from "@mui/x-date-pickers/locales";
import { enUS, ko } from "date-fns/locale";
import { useLocale } from "@/contexts/LocaleContext";

export function MuiDatePickersProvider({ children }: { children: ReactNode }) {
  const { language } = useLocale();
  const isKo = language === "ko";

  return (
    <LocalizationProvider
      dateAdapter={AdapterDateFns}
      adapterLocale={isKo ? ko : enUS}
      localeText={
        isKo
          ? pickersKoKR.components.MuiLocalizationProvider.defaultProps.localeText
          : pickersEnUS.components.MuiLocalizationProvider.defaultProps.localeText
      }
    >
      {children}
    </LocalizationProvider>
  );
}
