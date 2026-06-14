"use client";

import { useMemo } from "react";
import type { ApexOptions } from "apexcharts";
import { Box, Typography } from "@mui/material";
import { ThemedApexChart } from "@/components/charts/ThemedApexChart";
import type { MetricLogEntry } from "@/lib/types";

export function MetricStreamChart({ entries }: { entries: MetricLogEntry[] }) {
  const kvSeries = useMemo(() => {
    const points = entries
      .filter((e) => e.metric === "tube.kv")
      .slice(0, 20)
      .reverse()
      .map((e) => ({
        x: new Date(e.receivedAt).getTime(),
        y: Number(e.value) || 0,
      }));
    return [{ name: "tube.kv", data: points }];
  }, [entries]);

  const tempSeries = useMemo(() => {
    const points = entries
      .filter((e) => e.metric === "detector.temp")
      .slice(0, 20)
      .reverse()
      .map((e) => ({
        x: new Date(e.receivedAt).getTime(),
        y: Number(e.value) || 0,
      }));
    return [{ name: "detector.temp", data: points }];
  }, [entries]);

  const options: ApexOptions = useMemo(
    () => ({
      chart: {
        type: "line",
        fontFamily: '"Malgun Gothic", "맑은 고딕", sans-serif',
        animations: { enabled: true, dynamicAnimation: { speed: 400 } },
        zoom: { enabled: false },
      },
      stroke: { curve: "smooth", width: 2 },
      colors: ["#0284c7", "#d97706"],
      xaxis: { type: "datetime", labels: { datetimeUTC: false } },
      yaxis: [
        {
          title: { text: "kV" },
          min: 100,
          max: 200,
        },
        {
          opposite: true,
          title: { text: "°C" },
          min: 30,
          max: 55,
        },
      ],
      legend: { position: "top", fontSize: "12px" },
      tooltip: { x: { format: "HH:mm:ss" } },
    }),
    [],
  );

  const series = [
    ...(kvSeries[0].data.length ? [{ name: "tube.kv (kV)", type: "line" as const, data: kvSeries[0].data }] : []),
    ...(tempSeries[0].data.length
      ? [{ name: "detector.temp (°C)", type: "line" as const, data: tempSeries[0].data, yAxisIndex: 1 }]
      : []),
  ];

  if (series.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: "center" }}>
        수신된 주기 메트릭이 없습니다
      </Typography>
    );
  }

  return (
    <Box>
      <Typography variant="subtitle2" color="text.primary" sx={{ fontWeight: 700, mb: 1 }}>
        실시간 추이 (kV · 디텍터 온도)
      </Typography>
      <ThemedApexChart options={options} series={series} type="line" height={260} />
    </Box>
  );
}
