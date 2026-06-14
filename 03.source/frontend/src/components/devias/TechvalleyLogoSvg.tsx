"use client";

import { Box } from "@mui/material";
import type { CSSProperties } from "react";

/** 다크 배경용(밝은 로고) | 라이트 배경용(어두운 로고) */
export type TechvalleyLogoVariant = "on-dark" | "on-light";

type BrandAssetProps = {
  variant: TechvalleyLogoVariant;
  className?: string;
  style?: CSSProperties;
};

type TechvalleyIconProps = BrandAssetProps & {
  height?: number;
};

type TechvalleyWordmarkProps = BrandAssetProps & {
  height?: number;
};

type TechvalleyLogoSvgProps = TechvalleyIconProps & {
  showWordmark?: boolean;
  /** inline: 가로 배치 | stack: 아이콘 위·워드마크 아래 (사이드바) */
  layout?: "inline" | "stack";
};

const BRAND_ASSETS = {
  "on-dark": {
    icon: "/techvalley-icon-on-dark.png",
    wordmark: "/techvalley-wordmark-on-dark.png",
    full: "/techvalley-logo-on-dark.png",
  },
  "on-light": {
    icon: "/techvalley-icon-on-light.png",
    wordmark: "/techvalley-wordmark-on-light.png",
    full: "/techvalley-logo-on-light.png",
  },
} as const;

/** 가로형 풀 로고 231×78 — 좌측 아이콘 72px · 우측 워드마크 분리 */
const FULL_ASPECT = 231 / 78;
const ICON_ASPECT = 72 / 78;
const WORDMARK_ASPECT = (231 - 72) / 78;

function BrandImage({
  src,
  alt,
  height,
  aspect,
  className,
  style,
}: {
  src: string;
  alt: string;
  height: number;
  aspect: number;
  className?: string;
  style?: CSSProperties;
}) {
  const width = Math.round(height * aspect);

  return (
    <Box
      component="img"
      src={src}
      alt={alt}
      className={className}
      draggable={false}
      sx={{
        display: "block",
        width,
        height,
        maxWidth: "100%",
        objectFit: "contain",
        objectPosition: "left center",
        ...style,
      }}
    />
  );
}

/** 링크 마크 아이콘 (텍스트 없음) */
export function TechvalleyIcon({
  variant,
  height = 36,
  className,
  style,
}: TechvalleyIconProps) {
  return (
    <BrandImage
      src={BRAND_ASSETS[variant].icon}
      alt=""
      height={height}
      aspect={ICON_ASPECT}
      className={className}
      style={style}
    />
  );
}

/** TECHVALLEY 워드마크 (아이콘과 분리) */
export function TechvalleyWordmark({
  variant,
  height = 16,
  className,
  style,
}: TechvalleyWordmarkProps) {
  return (
    <BrandImage
      src={BRAND_ASSETS[variant].wordmark}
      alt="TECHVALLEY"
      height={height}
      aspect={WORDMARK_ASPECT}
      className={className}
      style={style}
    />
  );
}

/** 아이콘 + 워드마크 조합 */
export function TechvalleyLogoSvg({
  variant,
  height = 36,
  showWordmark = true,
  layout = "inline",
  className,
  style,
}: TechvalleyLogoSvgProps) {
  const stacked = layout === "stack";

  if (!showWordmark) {
    return <TechvalleyIcon variant={variant} height={height} className={className} style={style} />;
  }

  if (stacked) {
    return (
      <Box
        className={className}
        sx={{
          display: "inline-flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: 0.5,
          lineHeight: 0,
          flexShrink: 0,
          maxWidth: "100%",
          minWidth: 0,
          ...style,
        }}
        role="img"
        aria-label="테크밸리"
      >
        <TechvalleyIcon variant={variant} height={Math.round(height * 0.95)} />
        <Box sx={{ maxWidth: "100%", lineHeight: 0 }}>
          <TechvalleyWordmark variant={variant} height={Math.max(12, Math.round(height * 0.45))} />
        </Box>
      </Box>
    );
  }

  const logoHeight = height;
  return (
    <BrandImage
      src={BRAND_ASSETS[variant].full}
      alt="테크밸리"
      height={logoHeight}
      aspect={FULL_ASPECT}
      className={className}
      style={style}
    />
  );
}

/** 파비콘·아이콘 전용 마크 */
export function TechvalleyMarkSvg({
  size = 32,
  variant = "on-dark",
}: {
  size?: number;
  variant?: TechvalleyLogoVariant;
}) {
  return <TechvalleyIcon variant={variant} height={size} />;
}

export { BRAND_ASSETS };
