"use client";

import { Card, CardContent, CardHeader, type CardHeaderProps } from "@mui/material";
import type { ReactNode } from "react";

/** Devias Kit 섹션 카드 — Card + CardHeader + CardContent */
export function ContentCard({
  title,
  subheader,
  action,
  children,
  sx,
}: {
  title?: ReactNode;
  subheader?: CardHeaderProps["subheader"];
  action?: CardHeaderProps["action"];
  children: ReactNode;
  sx?: object;
}) {
  return (
    <Card variant="outlined" sx={{ mb: 3, borderRadius: 2, ...sx }}>
      {title != null && (
        <CardHeader
          title={title}
          subheader={subheader}
          action={action}
          slotProps={{
            title: { component: "div" },
            subheader: { component: "div" },
          }}
        />
      )}
      <CardContent sx={{ pt: title != null ? 0 : 2.5, "&:last-child": { pb: 2.5 } }}>{children}</CardContent>
    </Card>
  );
}
