"use client";

import type { SvgIconComponent } from "@mui/icons-material";
import { Avatar, Card, CardContent, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";

/** Devias Kit Free overview 카드 패턴 (Budget / TotalCustomers) */
export function SummaryCard({
  label,
  value,
  sub,
  icon: Icon,
  iconColor = "#eef2f6",
  iconFg = "#5c6670",
  action,
}: {
  label: string;
  value: ReactNode;
  sub?: string;
  icon?: SvgIconComponent;
  iconColor?: string;
  iconFg?: string;
  action?: ReactNode;
}) {
  return (
    <Card variant="outlined" sx={{ height: "100%", borderRadius: 2 }}>
      <CardContent sx={{ py: 2, "&:last-child": { pb: 2 } }}>
        <Stack spacing={1.5}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: "flex-start", justifyContent: "space-between" }}>
            <Stack spacing={0.5} sx={{ minWidth: 0 }}>
              <Typography color="text.secondary" variant="caption" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
                {label}
              </Typography>
              <Typography component="div" variant="h5" sx={{ lineHeight: 1.2, fontWeight: 700 }}>
                {value}
              </Typography>
              {sub && (
                <Typography variant="caption" color="text.secondary">
                  {sub}
                </Typography>
              )}
            </Stack>
            {Icon && (
              <Avatar sx={{ bgcolor: iconColor, color: iconFg, width: 40, height: 40, flexShrink: 0 }}>
                <Icon sx={{ fontSize: 20, width: 20, height: 20 }} />
              </Avatar>
            )}
          </Stack>
          {action}
        </Stack>
      </CardContent>
    </Card>
  );
}
