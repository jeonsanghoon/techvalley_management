"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { Box, CircularProgress, Stack } from "@mui/material";
import type { FleetMapEquipment } from "@/lib/fleet-map-types";

const FleetMapPanel = dynamic(
  () => import("@/components/dashboard/FleetMapPanel").then((m) => ({ default: m.FleetMapPanel })),
  {
    ssr: false,
    loading: () => (
      <Stack
        sx={{
          height: "100%",
          minHeight: 420,
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "action.hover",
          borderRadius: 2,
        }}
      >
        <CircularProgress size={28} />
      </Stack>
    ),
  },
);

export function DashboardFleetMap({ equipments }: { equipments: FleetMapEquipment[] }) {
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (!cancelled) setMapReady(true);
      });
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      setMapReady(false);
    };
  }, []);

  return (
    <Box
      sx={{
        height: { xs: 420, lg: 480 },
        width: "100%",
        position: "relative",
        overflow: "hidden",
        borderRadius: 2,
        contain: "layout style paint",
        isolation: "isolate",
      }}
    >
      {mapReady ? (
        <FleetMapPanel equipments={equipments} />
      ) : (
        <Stack
          sx={{
            height: "100%",
            minHeight: 420,
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "action.hover",
            borderRadius: 2,
          }}
        >
          <CircularProgress size={28} />
        </Stack>
      )}
    </Box>
  );
}
