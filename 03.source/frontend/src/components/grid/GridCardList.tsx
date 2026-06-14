"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ColDef } from "ag-grid-community";
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Collapse,
  Divider,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import type { GridViewport } from "@/hooks/useViewport";
import type { GridColumnSet } from "@/lib/grid/types";
import type { KeysetFetchFn } from "@/lib/grid/keyset-fetch";
import { getColumnDefs } from "./column-defs";
import { GridCellValue } from "./GridCellValue";
import { colDefKey, splitCardColumns } from "@/lib/grid/viewport-columns";
import {
  getCardFieldKind,
  getCardFieldSx,
  getCardFieldLabelWidth,
  getCardSummaryAlign,
  getCardSummaryGridTrack,
} from "@/components/grid/card-field-layout";
import { isCardActionColumn } from "@/lib/grid/card-field-actions";
import { useLocale } from "@/contexts/LocaleContext";

export interface GridCardListProps<TData extends object = Record<string, unknown>> {
  columnSet: GridColumnSet;
  gridViewport: GridViewport;
  idField?: string;
  pageSize?: number;
  rowData?: TData[];
  fetchRows?: KeysetFetchFn<TData> | null;
  enableRowSelection?: boolean;
  refreshKey?: string | number;
  onStatsChange?: (loaded: number, total?: number) => void;
}

function readRowId(row: object, idField: string): string {
  const value = (row as Record<string, unknown>)[idField];
  return value != null ? String(value) : "";
}

function partitionSummaryColumns<TData extends object>(cols: ColDef<TData>[]) {
  const actions: ColDef<TData>[] = [];
  const fields: ColDef<TData>[] = [];
  for (const col of cols) {
    if (isCardActionColumn(col)) actions.push(col);
    else fields.push(col);
  }
  return { fields, actions };
}

const SUMMARY_LABEL_SX = {
  display: "block",
  mb: 0.25,
  lineHeight: 1.2,
  width: "100%",
} as const;

const SUMMARY_VALUE_SX = {
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-start",
  minHeight: 28,
  width: "100%",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
} as const;

function SummaryField<TData extends object>({
  col,
  row,
  index,
  gridViewport,
  hideLabel,
}: {
  col: ColDef<TData>;
  row: TData;
  index: number;
  gridViewport: GridViewport;
  hideLabel?: boolean;
}) {
  const label = col.headerName ?? colDefKey(col);
  const align = hideLabel ? "start" : getCardSummaryAlign(col, index);
  const centered = align === "center";

  return (
    <Box
      className={`tv-grid-card-summary-field${centered ? " tv-grid-card-summary-field--center" : ""}`}
      sx={{
        ...(hideLabel ? {} : getCardFieldSx(col, index, gridViewport)),
        display: "flex",
        flexDirection: "column",
        alignItems: centered ? "center" : "flex-start",
        justifyContent: "flex-start",
        minWidth: 0,
      }}
    >
      {!hideLabel && (
        <Typography
          variant="caption"
          color="text.secondary"
          className="tv-grid-card-summary-label"
          sx={{
            ...SUMMARY_LABEL_SX,
            textAlign: centered ? "center" : "left",
          }}
          noWrap
        >
          {label}
        </Typography>
      )}
      <Box
        className="tv-grid-card-field-value"
        sx={{
          ...SUMMARY_VALUE_SX,
          justifyContent: centered ? "center" : "flex-start",
        }}
      >
        <GridCellValue col={col} row={row} variant="body2" />
      </Box>
    </Box>
  );
}

function DetailField<TData extends object>({
  col,
  row,
  index,
  gridViewport,
}: {
  col: ColDef<TData>;
  row: TData;
  index: number;
  gridViewport: GridViewport;
}) {
  const label = col.headerName ?? colDefKey(col);
  const kind = getCardFieldKind(col, index);
  const labelWidth = getCardFieldLabelWidth(gridViewport);
  const multiline = kind === "message" || kind === "name";

  return (
    <Stack
      direction="row"
      spacing={1}
      sx={{
        py: 0.625,
        alignItems: multiline ? "flex-start" : "center",
        justifyContent: "space-between",
        gap: 1,
      }}
    >
      <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0, width: labelWidth }}>
        {label}
      </Typography>
      <Box
        className="tv-grid-card-field-value"
        sx={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          alignItems: multiline ? "flex-start" : "center",
          justifyContent: "flex-end",
          textAlign: "right",
          ...(multiline ? { whiteSpace: "normal", wordBreak: "break-word" } : undefined),
        }}
      >
        <GridCellValue col={col} row={row} variant="caption" />
      </Box>
    </Stack>
  );
}

function GridCardRow<TData extends object>({
  row,
  summaryCols,
  detailCols,
  gridViewport,
  expanded,
  onToggle,
  selected,
  onSelect,
  enableRowSelection,
}: {
  row: TData;
  summaryCols: ColDef<TData>[];
  detailCols: ColDef<TData>[];
  gridViewport: GridViewport;
  expanded: boolean;
  onToggle: () => void;
  selected: boolean;
  onSelect: (checked: boolean) => void;
  enableRowSelection: boolean;
}) {
  const { translate } = useLocale();
  const hasDetail = detailCols.length > 0;
  const { fields: summaryFields, actions: summaryActions } = partitionSummaryColumns(summaryCols);
  const summaryGridColumns = summaryFields
    .map((col, index) => getCardSummaryGridTrack(col, index, gridViewport))
    .join(" ");

  return (
    <Box
      sx={{
        borderBottom: 1,
        borderColor: "divider",
        bgcolor: expanded ? "action.hover" : "background.paper",
      }}
    >
      <Stack direction="row" spacing={0.5} sx={{ alignItems: "flex-start", px: 1.25, py: 0.875 }}>
        {enableRowSelection && (
          <Checkbox
            size="small"
            checked={selected}
            onChange={(e) => onSelect(e.target.checked)}
            sx={{ p: 0.5, mt: 0.25 }}
          />
        )}
        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            alignItems: "flex-start",
            gap: 0.75,
          }}
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: summaryGridColumns,
              columnGap: 0.75,
              alignItems: "start",
              flex: "0 1 auto",
              maxWidth: "100%",
              cursor: hasDetail ? "pointer" : "default",
            }}
            onClick={hasDetail ? onToggle : undefined}
            role={hasDetail ? "button" : undefined}
            tabIndex={hasDetail ? 0 : undefined}
            onKeyDown={
              hasDetail
                ? (e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onToggle();
                    }
                  }
                : undefined
            }
          >
            {summaryFields.map((col, index) => (
              <SummaryField
                key={colDefKey(col)}
                col={col}
                row={row}
                index={index}
                gridViewport={gridViewport}
              />
            ))}
          </Box>
          {summaryActions.length > 0 && (
            <Box
              className="tv-grid-card-actions"
              sx={{ flexShrink: 0, display: "flex", alignItems: "center", pt: 0.25 }}
              onClick={(e) => e.stopPropagation()}
            >
              {summaryActions.map((col) => (
                <SummaryField
                  key={colDefKey(col)}
                  col={col}
                  row={row}
                  index={0}
                  gridViewport={gridViewport}
                  hideLabel
                />
              ))}
            </Box>
          )}
          {hasDetail && (
            <IconButton
              size="small"
              aria-label={expanded ? translate("grid.collapse") : translate("grid.expand")}
              aria-expanded={expanded}
              onClick={onToggle}
              sx={{
                flexShrink: 0,
                ml: "auto",
                mt: 0.25,
                transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.2s",
              }}
            >
              <ExpandMoreIcon fontSize="small" />
            </IconButton>
          )}
        </Box>
      </Stack>

      {hasDetail && (
        <Collapse in={expanded}>
          <Box sx={{ px: 2, pb: 1.5, pt: 0.5 }}>
            <Divider sx={{ mb: 1 }} />
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
              {translate("grid.detailFields")}
            </Typography>
            {detailCols.map((col, index) => (
              <DetailField
                key={colDefKey(col)}
                col={col}
                row={row}
                index={index}
                gridViewport={gridViewport}
              />
            ))}
          </Box>
        </Collapse>
      )}
    </Box>
  );
}

export function GridCardList<TData extends object = Record<string, unknown>>({
  columnSet,
  gridViewport,
  idField = "id",
  pageSize = 50,
  rowData,
  fetchRows,
  enableRowSelection = false,
  refreshKey,
  onStatsChange,
}: GridCardListProps<TData>) {
  const { language, translate, timeZone } = useLocale();
  const useClientModel = !fetchRows && !!rowData;

  const summaryCols = useMemo(
    () => getColumnDefs(columnSet, language, timeZone, gridViewport) as ColDef<TData>[],
    [columnSet, language, timeZone, gridViewport],
  );
  const allCols = useMemo(
    () => getColumnDefs(columnSet, language, timeZone, "full") as ColDef<TData>[],
    [columnSet, language, timeZone],
  );
  const { detail: detailCols } = useMemo(
    () => splitCardColumns(allCols, summaryCols),
    [allCols, summaryCols],
  );

  const [rows, setRows] = useState<TData[]>(rowData ?? []);
  const [totalCount, setTotalCount] = useState<number | undefined>();
  const [loading, setLoading] = useState(!useClientModel);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const cursorRef = useRef<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set());
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());

  const loadInitial = useCallback(async () => {
    if (!fetchRows) return;
    setLoading(true);
    cursorRef.current = null;
    try {
      const page = await fetchRows({ cursor: null, limit: pageSize });
      setRows(page.rows);
      setTotalCount(page.totalCount);
      cursorRef.current = page.nextCursor;
      setHasMore(!!page.nextCursor);
    } finally {
      setLoading(false);
    }
  }, [fetchRows, pageSize]);

  useEffect(() => {
    if (useClientModel) {
      setRows(rowData ?? []);
      setHasMore(false);
      setLoading(false);
      setTotalCount(undefined);
      return;
    }
    void loadInitial();
  }, [useClientModel, rowData, loadInitial, refreshKey]);

  useEffect(() => {
    onStatsChange?.(rows.length, useClientModel ? rowData?.length : totalCount);
  }, [rows.length, totalCount, useClientModel, rowData?.length, onStatsChange]);

  const loadMore = useCallback(async () => {
    if (!fetchRows || !hasMore || loadingMore) return;
    setLoadingMore(true);
    try {
      const page = await fetchRows({ cursor: cursorRef.current, limit: pageSize });
      setRows((prev) => [...prev, ...page.rows]);
      cursorRef.current = page.nextCursor;
      setHasMore(!!page.nextCursor);
    } finally {
      setLoadingMore(false);
    }
  }, [fetchRows, hasMore, loadingMore, pageSize]);

  const toggleExpanded = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleSelected = useCallback((id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);

  if (loading) {
    return (
      <Stack spacing={1} sx={{ alignItems: "center", py: 4 }}>
        <CircularProgress size={28} />
        <Typography variant="caption" color="text.secondary">
          {translate("grid.loading")}
        </Typography>
      </Stack>
    );
  }

  if (rows.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: "center" }}>
        {translate("grid.noRows")}
      </Typography>
    );
  }

  return (
    <Box className="tv-grid-card-list">
      {rows.map((row) => {
        const id = readRowId(row, idField) || JSON.stringify(row);
        return (
          <GridCardRow
            key={id}
            row={row}
            summaryCols={summaryCols}
            detailCols={detailCols}
            gridViewport={gridViewport}
            expanded={expandedIds.has(id)}
            onToggle={() => toggleExpanded(id)}
            selected={selectedIds.has(id)}
            onSelect={(checked) => toggleSelected(id, checked)}
            enableRowSelection={enableRowSelection}
          />
        );
      })}

      {!useClientModel && hasMore && (
        <Stack sx={{ py: 2, alignItems: "center" }}>
          <Button variant="outlined" size="small" disabled={loadingMore} onClick={() => void loadMore()}>
            {loadingMore ? translate("grid.loading") : translate("grid.loadMore")}
          </Button>
        </Stack>
      )}
    </Box>
  );
}
