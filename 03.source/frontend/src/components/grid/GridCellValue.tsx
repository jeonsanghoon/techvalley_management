"use client";

import type { ColDef, ICellRendererParams, ValueFormatterParams } from "ag-grid-community";
import { Typography } from "@mui/material";

function buildCellParams<TData extends object>(
  col: ColDef<TData>,
  row: TData,
): ICellRendererParams<TData> {
  const field = col.field as keyof TData & string | undefined;
  const value = field ? (row as Record<string, unknown>)[field] : undefined;

  return {
    value,
    valueFormatted: undefined,
    data: row,
    node: null!,
    colDef: col,
    column: null!,
    api: null!,
    context: undefined,
    eGridCell: null!,
    eParentOfValue: null!,
    registerRowDragger: () => {},
    setTooltip: () => {},
    refreshCell: () => false,
  };
}

export function GridCellValue<TData extends object>({
  col,
  row,
  variant = "body2",
}: {
  col: ColDef<TData>;
  row: TData;
  variant?: "body2" | "caption";
}) {
  const params = buildCellParams(col, row);
  const Renderer = col.cellRenderer;

  if (Renderer) {
    if (typeof Renderer === "function") {
      return <Renderer {...params} />;
    }
  }

  let text: string;
  if (col.valueFormatter && typeof col.valueFormatter === "function") {
    text = col.valueFormatter(params as ValueFormatterParams<TData>);
  } else if (params.value == null || params.value === "") {
    text = "—";
  } else {
    text = String(params.value);
  }

  return (
    <Typography variant={variant} color="text.primary" sx={{ wordBreak: "break-word" }}>
      {text}
    </Typography>
  );
}
