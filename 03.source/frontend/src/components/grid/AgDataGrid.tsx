"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import type { GridApi, GridReadyEvent, IDatasource, IGetRowsParams } from "ag-grid-community";
import { Box, CircularProgress, Paper, Stack, Typography } from "@mui/material";
import type { DataScope } from "@/lib/data/scope";
import type { GridColumnSet } from "@/lib/grid/types";
import type { KeysetFetchFn } from "@/lib/grid/keyset-fetch";
import { keysetFetcherFromRows } from "@/lib/grid/keyset-fetch";
import { getColumnDefs } from "./column-defs";
import { GridCardList } from "./GridCardList";
import { useViewport } from "@/hooks/useViewport";
import { useAuth } from "@/contexts/AuthContext";
import { useColorMode } from "@/contexts/ColorModeContext";
import { useLocale } from "@/contexts/LocaleContext";
import { useRouteNavigation } from "@/contexts/RouteNavigationContext";
import { ROUTE_CHANGE_EVENT } from "@/lib/route-key";

export const GRID_HEADER_HEIGHT = 44;
export const GRID_ROW_HEIGHT = 42;
/** 이 행 수까지는 그리드 높이 자동 확장, 초과 시 스크롤 */
export const GRID_SCROLL_MAX_ROWS = 20;

export function gridViewportHeight(rows: number = GRID_SCROLL_MAX_ROWS): number {
  return GRID_HEADER_HEIGHT + rows * GRID_ROW_HEIGHT + 2;
}

export const DEFAULT_GRID_HEIGHT = gridViewportHeight(GRID_SCROLL_MAX_ROWS);
export const DEFAULT_KEYSET_PAGE_SIZE = 50;
const HEADER_HEIGHT = GRID_HEADER_HEIGHT;
const ROW_HEIGHT = GRID_ROW_HEIGHT;

export interface AgDataGridProps<TData extends object = Record<string, unknown>> {
  columnSet: GridColumnSet;
  title?: string;
  subtitle?: string;
  height?: number;
  gridId?: string;
  idField?: string;
  pageSize?: number;
  rowData?: TData[];
  fetchRows?: KeysetFetchFn<TData>;
  enableRowSelection?: boolean;
  refreshKey?: string | number;
  /** RBAC — 미지정 시 현재 경로 메뉴 ID */
  menuId?: string;
  /** auto: rowData→client, fetchRows→keyset (기본) */
  rowModel?: "client" | "keyset" | "auto";
  /** client 모델: GRID_SCROLL_MAX_ROWS 이하만 높이 자동 확장, 초과 시 스크롤 (대시보드 등은 false) */
  autoHeight?: boolean;
  /** 실시간 스트림은 총 건수 미표시 */
  dataScope?: DataScope;
}

export function AgDataGrid<TData extends object = Record<string, unknown>>({
  columnSet,
  title,
  subtitle,
  height = DEFAULT_GRID_HEIGHT,
  gridId,
  idField = "id",
  pageSize = DEFAULT_KEYSET_PAGE_SIZE,
  rowData,
  fetchRows,
  enableRowSelection = false,
  refreshKey,
  menuId,
  rowModel = "auto",
  autoHeight = true,
  dataScope = "batch",
}: AgDataGridProps<TData>) {
  const { can, currentMenuId, ready: authReady } = useAuth();
  const { mode: colorMode } = useColorMode();
  const { language, translate, timeZone } = useLocale();
  const { gridViewport, isCompact } = useViewport();
  const { routeMountKey } = useRouteNavigation();
  const resolvedMenuId = menuId ?? currentMenuId ?? "";
  const canViewData = authReady && resolvedMenuId ? can(resolvedMenuId, "view") : true;

  const gridRef = useRef<AgGridReact<TData>>(null);
  const apiRef = useRef<GridApi<TData> | null>(null);
  const gridShellRef = useRef<HTMLDivElement>(null);
  const [gridShellNode, setGridShellNode] = useState<HTMLDivElement | null>(null);
  const cursorByStartRow = useRef(new Map<number, string | null>());
  const [loadedCount, setLoadedCount] = useState(0);
  const [totalCount, setTotalCount] = useState<number | undefined>();
  const [layoutReady, setLayoutReady] = useState(false);

  const useClientModel = useMemo(() => {
    if (fetchRows) return false;
    if (rowModel === "client") return !!rowData;
    if (rowModel === "keyset") return false;
    return !!rowData;
  }, [fetchRows, rowModel, rowData]);

  const resolvedFetchRows = useMemo(() => {
    if (useClientModel) return null;
    if (fetchRows) return fetchRows;
    if (rowData) return keysetFetcherFromRows(rowData, idField) as KeysetFetchFn<TData>;
    return null;
  }, [fetchRows, rowData, idField, useClientModel]);

  const rowCount = rowData?.length ?? 0;
  const useAutoHeight =
    autoHeight && useClientModel && rowCount > 0 && rowCount <= GRID_SCROLL_MAX_ROWS;
  const computedHeight = useAutoHeight
    ? gridViewportHeight(rowCount)
    : autoHeight && useClientModel && rowCount > GRID_SCROLL_MAX_ROWS
      ? gridViewportHeight(GRID_SCROLL_MAX_ROWS)
      : height;

  const columnDefs = useMemo(
    () => getColumnDefs(columnSet, language, timeZone, gridViewport),
    [columnSet, language, timeZone, gridViewport],
  );

  const getRowId = useCallback(
    (params: { data: TData }) => {
      const key = (params.data as Record<string, unknown>)[idField];
      return key != null ? String(key) : String(Math.random());
    },
    [idField],
  );

  const defaultColDef = useMemo(
    () => ({
      sortable: false,
      filter: false,
      floatingFilter: false,
      resizable: true,
      suppressHeaderMenuButton: true,
      minWidth: 96,
      suppressMovable: false,
    }),
    [],
  );

  const buildDatasource = useCallback((): IDatasource | null => {
    if (!resolvedFetchRows) return null;

    return {
      rowCount: undefined,
      getRows: async (params: IGetRowsParams) => {
        try {
          const limit = params.endRow - params.startRow;
          const cursor = cursorByStartRow.current.get(params.startRow) ?? null;
          const page = await resolvedFetchRows({ cursor, limit });

          setLoadedCount(params.startRow + page.rows.length);
          if (page.totalCount != null) setTotalCount(page.totalCount);

          if (page.nextCursor) {
            cursorByStartRow.current.set(params.endRow, page.nextCursor);
            params.successCallback(page.rows, -1);
          } else {
            params.successCallback(page.rows, params.startRow + page.rows.length);
          }
        } catch {
          params.failCallback();
        }
      },
    };
  }, [resolvedFetchRows]);

  const attachDatasource = useCallback(
    (api: GridApi<TData>) => {
      cursorByStartRow.current.clear();
      setLoadedCount(0);
      setTotalCount(undefined);
      const datasource = buildDatasource();
      if (datasource) {
        api.setGridOption("datasource", datasource);
        if (typeof api.purgeInfiniteCache === "function") {
          api.purgeInfiniteCache();
        } else {
          api.refreshInfiniteCache();
        }
      }
    },
    [buildDatasource],
  );

  const onGridReady = useCallback(
    (e: GridReadyEvent<TData>) => {
      apiRef.current = e.api;
      if (useClientModel) return;
      attachDatasource(e.api);
    },
    [attachDatasource, useClientModel],
  );

  useEffect(() => {
    if (useClientModel) {
      apiRef.current?.setGridOption("rowData", rowData ?? []);
      return;
    }
    if (apiRef.current) {
      attachDatasource(apiRef.current);
    }
  }, [attachDatasource, refreshKey, useClientModel, rowData]);

  const refreshGridLayout = useCallback(() => {
    const api = apiRef.current;
    if (!api) return;
    api.redrawRows();
    api.refreshHeader();
    if (!useClientModel) {
      api.refreshInfiniteCache();
    }
  }, [useClientModel]);

  useEffect(() => {
    if (!apiRef.current) return;
    apiRef.current.setGridOption("columnDefs", columnDefs);
    apiRef.current.resetRowHeights();
    refreshGridLayout();
  }, [columnDefs, language, timeZone, gridViewport, refreshGridLayout]);

  useLayoutEffect(() => {
    setLayoutReady(false);
    cursorByStartRow.current.clear();
    if (!useClientModel) {
      setLoadedCount(0);
      setTotalCount(undefined);
    }
  }, [columnSet, refreshKey, gridId, colorMode, useClientModel, routeMountKey, language, timeZone]);

  useLayoutEffect(() => {
    const node = gridShellNode ?? gridShellRef.current;
    if (!node) return;

    const updateLayout = () => {
      const { width, height } = node.getBoundingClientRect();
      const hasFixedHeight = !useAutoHeight && computedHeight > 0;
      setLayoutReady(width > 0 && (height > 8 || hasFixedHeight));
    };

    updateLayout();
    const raf = requestAnimationFrame(() => {
      updateLayout();
      requestAnimationFrame(updateLayout);
    });
    const fallback = window.setTimeout(updateLayout, 120);

    const observer = new ResizeObserver(() => {
      updateLayout();
      refreshGridLayout();
    });
    observer.observe(node);
    window.addEventListener("resize", updateLayout);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(fallback);
      observer.disconnect();
      window.removeEventListener("resize", updateLayout);
    };
  }, [gridShellNode, computedHeight, useAutoHeight, refreshGridLayout, refreshKey, columnSet, gridId, routeMountKey]);

  useEffect(() => {
    const onRouteChange = () => {
      cursorByStartRow.current.clear();
      setLoadedCount(0);
      setTotalCount(undefined);
      setLayoutReady(false);
      window.requestAnimationFrame(() => {
        const node = gridShellRef.current;
        if (!node) return;
        const { width, height } = node.getBoundingClientRect();
        const hasFixedHeight = !useAutoHeight && computedHeight > 0;
        setLayoutReady(width > 0 && (height > 8 || hasFixedHeight));
        refreshGridLayout();
      });
    };

    window.addEventListener(ROUTE_CHANGE_EVENT, onRouteChange);
    return () => window.removeEventListener(ROUTE_CHANGE_EVENT, onRouteChange);
  }, [computedHeight, refreshGridLayout, useAutoHeight]);

  useEffect(() => {
    if (layoutReady) return;
    const timer = window.setTimeout(() => setLayoutReady(true), 400);
    return () => window.clearTimeout(timer);
  }, [layoutReady, routeMountKey, refreshKey]);

  useEffect(() => {
    if (!layoutReady || !apiRef.current) return;
    refreshGridLayout();
    const timers = [150, 400].map((ms) => window.setTimeout(refreshGridLayout, ms));
    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [layoutReady, refreshGridLayout, colorMode, routeMountKey]);

  if (!canViewData) {
    return (
      <Paper variant="outlined" sx={{ p: 3, mb: 2, textAlign: "center", borderRadius: 2 }}>
        <Typography variant="body2" color="text.secondary">
          {translate("grid.noPermission")}
        </Typography>
      </Paper>
    );
  }

  if (!useClientModel && !resolvedFetchRows) {
    return (
      <Paper variant="outlined" sx={{ p: 3, mb: 2, textAlign: "center", borderRadius: 2 }}>
        <Typography variant="body2" color="text.secondary">
          {translate("grid.missingData")}
        </Typography>
      </Paper>
    );
  }

  const displayLoadedCount = useClientModel ? (rowData?.length ?? 0) : loadedCount;
  const displayTotalCount = useClientModel ? rowData?.length : totalCount;

  const showCount = dataScope === "batch";
  const localeTag = language === "ko" ? "ko-KR" : "en-US";
  const countLabel = showCount
    ? displayTotalCount != null
      ? `${displayLoadedCount.toLocaleString(localeTag)} / ${displayTotalCount.toLocaleString(localeTag)}${translate("common.countSuffix")}`
      : `${displayLoadedCount.toLocaleString(localeTag)}${translate("common.countSuffix")}`
    : null;

  const gridHeader = (title || subtitle || countLabel) ? (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={1}
      sx={{
        justifyContent: "space-between",
        alignItems: { sm: "center" },
        px: 2,
        py: 1.5,
        borderBottom: 1,
        borderColor: "divider",
        bgcolor: "background.paper",
      }}
    >
      <Box>
        {title && (
          <Typography variant="subtitle2" color="text.primary" sx={{ fontWeight: 700 }}>
            {title}
          </Typography>
        )}
        {subtitle && (
          <Typography variant="caption" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </Box>
      {countLabel && (
        <Typography variant="caption" color="text.secondary">
          {countLabel}
        </Typography>
      )}
    </Stack>
  ) : null;

  if (isCompact) {
    return (
      <Paper variant="outlined" sx={{ overflow: "hidden", mb: 2, width: "100%", bgcolor: "background.paper" }} className="tv-grid-shell tv-grid-card-mode">
        {gridHeader}
        <GridCardList
          columnSet={columnSet}
          gridViewport={gridViewport}
          idField={idField}
          pageSize={pageSize}
          rowData={useClientModel ? rowData : undefined}
          fetchRows={useClientModel ? null : resolvedFetchRows}
          enableRowSelection={enableRowSelection}
          refreshKey={refreshKey}
          onStatsChange={(loaded, total) => {
            if (!useClientModel) {
              setLoadedCount(loaded);
              if (total != null) setTotalCount(total);
            }
          }}
        />
      </Paper>
    );
  }

  const rowSelectionConfig = enableRowSelection
    ? {
        mode: "multiRow" as const,
        checkboxes: true,
        headerCheckbox: true,
        enableClickSelection: false,
      }
    : undefined;

  const infiniteGridProps = useClientModel
    ? {}
    : {
        rowModelType: "infinite" as const,
        cacheBlockSize: pageSize,
        maxBlocksInCache: 8,
        infiniteInitialRowCount: Math.min(pageSize, 20),
        maxConcurrentDatasourceRequests: 2,
        blockLoadDebounceMillis: 50,
      };

  return (
    <Paper variant="outlined" sx={{ overflow: "hidden", mb: 2, width: "100%", bgcolor: "background.paper" }} className="tv-grid-shell">
      {gridHeader}

      <Box
        ref={(node: HTMLDivElement | null) => {
          gridShellRef.current = node;
          setGridShellNode(node);
        }}
        id={gridId}
        className={`ag-theme-quartz tv-ag-grid${useAutoHeight ? " tv-ag-grid-auto" : ""}`}
        sx={{
          position: "relative",
          height: useAutoHeight ? "auto" : computedHeight,
          minHeight: useAutoHeight ? computedHeight : computedHeight,
          width: "100%",
          minWidth: 0,
        }}
      >
        <AgGridReact<TData>
          key={`${gridId ?? columnSet}-${colorMode}-${routeMountKey}-${refreshKey ?? "init"}-${language}-${timeZone}`}
          ref={gridRef}
          onGridPreDestroyed={() => {
            apiRef.current = null;
          }}
          theme="legacy"
          rowData={useClientModel ? rowData : undefined}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          headerHeight={HEADER_HEIGHT}
          rowHeight={ROW_HEIGHT}
          domLayout={useAutoHeight ? "autoHeight" : "normal"}
          {...infiniteGridProps}
          animateRows={!useAutoHeight}
          suppressPaginationPanel
          suppressCellFocus
          suppressRowHoverHighlight={false}
          enableCellTextSelection
          rowSelection={rowSelectionConfig}
          getRowId={getRowId}
          onGridReady={onGridReady}
          loadingOverlayComponent={() => (
            <Stack spacing={1} sx={{ alignItems: "center", py: 4 }}>
              <CircularProgress size={28} />
              <Typography variant="caption" color="text.secondary">
                {translate("grid.loading")}
              </Typography>
            </Stack>
          )}
          localeText={{
            loadingOoo: translate("grid.loading"),
            noRowsToShow: translate("grid.noRows"),
          }}
        />
        {!layoutReady && (
          <Stack
            spacing={1}
            sx={{
              position: "absolute",
              inset: 0,
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "background.paper",
              zIndex: 1,
              pointerEvents: "none",
            }}
          >
            <CircularProgress size={28} />
          </Stack>
        )}
      </Box>
    </Paper>
  );
}
