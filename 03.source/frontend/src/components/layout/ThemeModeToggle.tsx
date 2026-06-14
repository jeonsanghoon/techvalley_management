"use client";

import { useEffect, useState } from "react";
import { IconButton, Tooltip } from "@mui/material";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import { useColorMode } from "@/contexts/ColorModeContext";
import { useLocale } from "@/contexts/LocaleContext";

export function ThemeModeToggle() {
  const { mode, ssrMode, toggleMode } = useColorMode();
  const { translate } = useLocale();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const displayMode = mounted ? mode : ssrMode;
  const isDark = displayMode === "dark";

  return (
    <Tooltip title={isDark ? translate("theme.light") : translate("theme.dark")}>
      <IconButton size="small" onClick={toggleMode} aria-label={translate("theme.toggle")}>
        {isDark ? (
          <LightModeOutlinedIcon fontSize="small" />
        ) : (
          <DarkModeOutlinedIcon fontSize="small" />
        )}
      </IconButton>
    </Tooltip>
  );
}
