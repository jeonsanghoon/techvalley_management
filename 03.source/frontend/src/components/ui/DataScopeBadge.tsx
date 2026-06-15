"use client";

import { useState } from "react";
import { Box, Chip, Popover, Typography } from "@mui/material";
import ScheduleIcon from "@mui/icons-material/Schedule";
import SensorsIcon from "@mui/icons-material/Sensors";
import { useLocale } from "@/contexts/LocaleContext";
import type { DataSourceMeta } from "@/lib/data/scope";

function ScopeDetail({ meta }: { meta: DataSourceMeta }) {
  const { translate, formatAsOf } = useLocale();
  const isBatch = meta.scope === "batch";
  return (
    <>
      <Typography variant="subtitle2" sx={{ mb: 0.75, fontWeight: 700 }}>
        {isBatch ? translate("scope.batchData") : translate("scope.realtimeData")}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ display: "block" }}>
        {translate("scope.asOf")}: {formatAsOf(meta.asOf)}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ display: "block" }}>
        {translate("scope.source")}: {meta.source}
      </Typography>
      {meta.endpoint && (
        <Typography variant="body2" color="text.secondary" sx={{ display: "block" }}>
          {translate("scope.endpoint")}: {meta.endpoint}
        </Typography>
      )}
      {meta.refreshInterval && (
        <Typography variant="body2" color="text.secondary" sx={{ display: "block" }}>
          {translate("scope.refresh")}: {meta.refreshInterval}
        </Typography>
      )}
    </>
  );
}

export function DataScopeBadge({ meta, compact }: { meta: DataSourceMeta; compact?: boolean }) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const { translate, formatAsOf } = useLocale();
  const open = Boolean(anchor);
  const isBatch = meta.scope === "batch";
  const label = isBatch ? translate("scope.batch") : translate("scope.realtime");
  const icon = isBatch ? (
    <ScheduleIcon sx={{ fontSize: 16, width: 16, height: 16 }} />
  ) : (
    <SensorsIcon sx={{ fontSize: 16, width: 16, height: 16 }} />
  );

  return (
    <>
      <Chip
        icon={icon}
        label={compact ? `${label} · ${formatAsOf(meta.asOf)}` : label}
        size="small"
        color={isBatch ? "default" : "success"}
        variant={compact ? "outlined" : "filled"}
        onClick={(e) => setAnchor(open ? null : e.currentTarget)}
        sx={{ fontWeight: compact ? 600 : 700, cursor: "pointer" }}
        aria-label={translate("scope.detailAria").replace("{label}", label)}
        aria-expanded={open}
      />
      <Popover
        open={open}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{ paper: { sx: { maxWidth: 360, p: 2 } } }}
      >
        <ScopeDetail meta={meta} />
      </Popover>
    </>
  );
}

/** @deprecated DataScopeBadge 클릭으로 상세 확인 */
export function DataScopeCaption(_props: { meta: DataSourceMeta }) {
  return null;
}
