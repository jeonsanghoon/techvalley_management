"use client";

import Link from "next/link";
import { Box } from "@mui/material";
import { useColorMode } from "@/contexts/ColorModeContext";
import {
  TechvalleyIcon,
  TechvalleyLogoSvg,
  TechvalleyWordmark,
  type TechvalleyLogoVariant,
} from "@/components/devias/TechvalleyLogoSvg";

/** 어두운 UI 배경용 (밝은 로고) */
export const TECHVALLEY_LOGO_ON_DARK = "/techvalley-logo-on-dark.png";
export const TECHVALLEY_ICON_ON_DARK = "/techvalley-icon-on-dark.png";
export const TECHVALLEY_WORDMARK_ON_DARK = "/techvalley-wordmark-on-dark.png";

/** 밝은 UI 배경용 (어두운 로고) */
export const TECHVALLEY_LOGO_ON_LIGHT = "/techvalley-logo-on-light.png";
export const TECHVALLEY_ICON_ON_LIGHT = "/techvalley-icon-on-light.png";
export const TECHVALLEY_WORDMARK_ON_LIGHT = "/techvalley-wordmark-on-light.png";

/** @deprecated PNG 에셋 사용 — TECHVALLEY_LOGO_ON_DARK 참고 */
export const TECHVALLEY_LOGO_ON_DARK_SVG = "/techvalley-logo-on-dark.svg";
/** @deprecated PNG 에셋 사용 — TECHVALLEY_LOGO_ON_LIGHT 참고 */
export const TECHVALLEY_LOGO_ON_LIGHT_SVG = "/techvalley-logo-on-light.svg";

function resolveVariant(
  color: "dark" | "light" | "auto" | undefined,
  mode: "light" | "dark",
): TechvalleyLogoVariant {
  if (color === "light") return "on-dark";
  if (color === "dark") return "on-light";
  return mode === "dark" ? "on-dark" : "on-light";
}

/** 테크밸리 브랜드 로고 — 아이콘·워드마크 분리 조합 */
export function Logo({
  color = "auto",
  height = 36,
  href = "/dashboard",
  showWordmark = true,
  layout = "inline",
}: {
  /** light: 어두운 배경용 | dark: 밝은 배경용 | auto: 앱 테마 연동 */
  color?: "dark" | "light" | "auto";
  height?: number;
  href?: string;
  /** false면 링크 마크 아이콘만 표시 */
  showWordmark?: boolean;
  layout?: "inline" | "stack";
}) {
  const { mode } = useColorMode();
  const variant = resolveVariant(color, mode);

  return (
    <Box
      component={Link}
      href={href}
      sx={{
        display: "inline-flex",
        alignItems: "center",
        textDecoration: "none",
        lineHeight: 0,
        flexShrink: 0,
      }}
    >
      <TechvalleyLogoSvg
        variant={variant}
        height={height}
        showWordmark={showWordmark}
        layout={layout}
      />
    </Box>
  );
}

export { TechvalleyIcon, TechvalleyWordmark };
