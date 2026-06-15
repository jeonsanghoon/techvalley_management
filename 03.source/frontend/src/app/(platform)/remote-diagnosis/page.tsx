"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useViewport } from "@/hooks/useViewport";
import Link from "next/link";
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import BiotechIcon from "@mui/icons-material/Biotech";
import BuildCircleIcon from "@mui/icons-material/BuildCircle";
import MemoryIcon from "@mui/icons-material/Memory";
import PrecisionManufacturingIcon from "@mui/icons-material/PrecisionManufacturing";
import SettingsInputComponentIcon from "@mui/icons-material/SettingsInputComponent";
import { PageToolbar, Card, StatusBadge } from "@/components/ui/PageComponents";
import { PrimaryButton } from "@/components/ui/mui-primitives";
import { QueryToolbar } from "@/components/ui/QueryToolbar";
import { DataScopeBadge } from "@/components/ui/DataScopeBadge";
import { useQueryState } from "@/hooks/useQueryState";
import { bindSearchFields } from "@/lib/grid/bind-search-fields";
import { combineAnd, matchesIndexedFields, matchesSelectFilter } from "@/lib/grid/query-filter";
import { fallbackMeta, getListItems, useFleetLive, useRemoteDiagnostics } from "@/lib/api/hooks";
import { buildRemoteControlHref } from "@/lib/equipment-remote-nav";
import {
  getFindingsForEquipment,
  runRemoteDiagnosisJob,
  formatDiagnosisDisplay,
  type DiagnosisRunResult,
  type RemoteDiagnosisComponent,
  type RemoteDiagnosisFinding,
} from "@/lib/remote-diagnosis";
import { compareEquipmentOperatingFirst } from "@/lib/fleet-sort";
import type { Equipment } from "@/lib/types";
import { useLocale } from "@/contexts/LocaleContext";
import type { TranslationKey } from "@/lib/locale";
import { localeLabel } from "@/lib/locale/types";
import { SEARCH_FIELD_LABELS } from "@/lib/locale/search-fields";

const INITIAL_SEARCH = { serialNo: "", model: "", customer: "", site: "" };

const COMPONENT_ICON: Record<RemoteDiagnosisComponent, typeof BiotechIcon> = {
  detector: BiotechIcon,
  motor: PrecisionManufacturingIcon,
  tube: SettingsInputComponentIcon,
  body: BuildCircleIcon,
};

const COMPONENT_LABEL_KEY: Record<RemoteDiagnosisComponent, TranslationKey> = {
  detector: "remoteDiagnosis.component.detector" as TranslationKey,
  motor: "remoteDiagnosis.component.motor" as TranslationKey,
  tube: "remoteDiagnosis.component.tube" as TranslationKey,
  body: "remoteDiagnosis.component.body" as TranslationKey,
};

const STATUS_LABEL_KEY: Record<string, TranslationKey> = {
  open: "remoteDiagnosis.status.open" as TranslationKey,
  in_progress: "remoteDiagnosis.status.inProgress" as TranslationKey,
  resolved: "remoteDiagnosis.status.resolved" as TranslationKey,
};

const SEVERITY_ORDER: Record<string, number> = { critical: 0, warning: 1, info: 2 };

/** 모터 좌표 → 디텍터 → 튜브 → 본체 (모터 좌표 보정 결과를 최상단) */
const COMPONENT_ORDER: Record<RemoteDiagnosisComponent, number> = {
  motor: 0,
  detector: 1,
  tube: 2,
  body: 3,
};

type EquipmentDiagnosisGroup = {
  equipment: Equipment;
  findings: RemoteDiagnosisFinding[];
};

function sortFindings(
  list: RemoteDiagnosisFinding[],
  liveResults: Record<string, DiagnosisRunResult> = {},
): RemoteDiagnosisFinding[] {
  return [...list].sort((a, b) => {
    const aResolved = liveResults[a.id]?.status === "resolved";
    const bResolved = liveResults[b.id]?.status === "resolved";
    if (aResolved !== bResolved) return aResolved ? 1 : -1;

    const componentDelta = (COMPONENT_ORDER[a.component] ?? 9) - (COMPONENT_ORDER[b.component] ?? 9);
    if (componentDelta !== 0) return componentDelta;

    const severityDelta = (SEVERITY_ORDER[a.severity] ?? 9) - (SEVERITY_ORDER[b.severity] ?? 9);
    if (severityDelta !== 0) return severityDelta;
    return new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime();
  });
}

function DiagnosisFindingRow({
  finding,
  translate,
  formatAsOf,
  isRunning,
  liveResult,
  onRunDiagnosis,
}: {
  finding: RemoteDiagnosisFinding;
  translate: (key: TranslationKey) => string;
  formatAsOf: (value: string) => string;
  isRunning: boolean;
  liveResult?: DiagnosisRunResult;
  onRunDiagnosis: (finding: RemoteDiagnosisFinding) => void;
}) {
  const { isCompact } = useViewport();
  const Icon = COMPONENT_ICON[finding.component];
  const hasResult = Boolean(liveResult);
  const displaySeverity = liveResult?.severity ?? "warning";
  const displayStatus = liveResult?.status ?? "open";
  const isResolved = hasResult && liveResult?.status === "resolved";
  const isCritical = hasResult && !isResolved && displaySeverity === "critical";
  const displayText = liveResult
    ? formatDiagnosisDisplay(
        liveResult.component,
        liveResult.metrics,
        (key) => translate(key as TranslationKey),
        liveResult.status,
      )
    : null;

  return (
    <Box
      sx={{
        px: { xs: 1.5, sm: 2 },
        py: 1.75,
        bgcolor: isCritical ? "error.50" : isResolved ? "success.50" : "background.paper",
      }}
    >
      <Stack
        direction={{ xs: "column", lg: "row" }}
        spacing={1.5}
        sx={{ alignItems: { lg: "flex-start" } }}
      >
        <Stack direction="row" spacing={1.5} sx={{ flex: 1, minWidth: 0, alignItems: "flex-start" }}>
          <Box
            sx={{
              p: 1,
              borderRadius: 1.5,
              bgcolor: "action.hover",
              display: "flex",
              color: isCritical ? "error.main" : isResolved ? "success.main" : hasResult ? "warning.main" : "text.secondary",
              flexShrink: 0,
            }}
          >
            <Icon fontSize="small" />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" spacing={0.75} sx={{ alignItems: "center", flexWrap: "wrap", mb: 0.75 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                {translate(COMPONENT_LABEL_KEY[finding.component])}
              </Typography>
              {hasResult && (
                <>
                  <StatusBadge status={isResolved ? "healthy" : displaySeverity} />
                  <Chip
                    label={
                      isResolved
                        ? translate("remoteDiagnosis.status.normal" as TranslationKey)
                        : translate(STATUS_LABEL_KEY[displayStatus])
                    }
                    size="small"
                    color={
                      isResolved
                        ? "success"
                        : displayStatus === "open"
                          ? "warning"
                          : displayStatus === "in_progress"
                            ? "info"
                            : "default"
                    }
                    variant={isResolved || displayStatus === "open" ? "filled" : "outlined"}
                  />
                </>
              )}
            </Stack>

            {isRunning && (
              <Box>
                <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 0.5 }}>
                  <CircularProgress size={14} />
                  <Typography variant="caption" color="primary.main" sx={{ fontWeight: 600 }}>
                    {translate("remoteDiagnosis.action.running" as TranslationKey)}
                  </Typography>
                </Stack>
                <LinearProgress />
              </Box>
            )}

            {!isRunning && liveResult && displayText && (
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.4, mb: 0.5 }}>
                  {displayText.summary}
                </Typography>
                <Typography variant="body2" color="text.primary" sx={{ lineHeight: 1.55 }}>
                  {displayText.detail}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
                  {translate("remoteDiagnosis.result.completedAt" as TranslationKey).replace(
                    "{at}",
                    formatAsOf(liveResult.completedAt),
                  )}
                </Typography>
              </Box>
            )}
          </Box>
        </Stack>

        {hasResult && (
          <Stack
            spacing={0.75}
            sx={{
              flexShrink: 0,
              alignItems: { xs: "stretch", lg: "flex-end" },
              minWidth: { lg: 148 },
              width: { xs: "100%", lg: "auto" },
            }}
          >
            <PrimaryButton
              onClick={() => onRunDiagnosis(finding)}
              menuId="remote-diagnosis"
              perm="view"
              fullWidth={isCompact}
              startIcon={
                isRunning ? <CircularProgress size={14} color="inherit" /> : <BiotechIcon fontSize="small" />
              }
            >
              {isRunning
                ? translate("remoteDiagnosis.action.running" as TranslationKey)
                : translate("remoteDiagnosis.action.rerunDiagnosis" as TranslationKey)}
            </PrimaryButton>
            {liveResult!.status !== "resolved" && (
              <PrimaryButton
                href={buildRemoteControlHref(finding.equipmentSn, finding.id)}
                variant="outlined"
                menuId="remote-control"
                perm="view"
                fullWidth={isCompact}
                startIcon={<MemoryIcon fontSize="small" />}
              >
                {translate("remoteDiagnosis.toolbar.remoteControl" as TranslationKey)}
              </PrimaryButton>
            )}
          </Stack>
        )}
      </Stack>
    </Box>
  );
}

function EquipmentDiagnosisCard({
  group,
  translate,
  formatAsOf,
  runningFindingIds,
  liveResults,
  isEquipmentRunning,
  isDiagnosed,
  onRunDiagnosis,
  onRunEquipmentDiagnosis,
}: {
  group: EquipmentDiagnosisGroup;
  translate: (key: TranslationKey) => string;
  formatAsOf: (value: string) => string;
  runningFindingIds: Set<string>;
  liveResults: Record<string, DiagnosisRunResult>;
  isEquipmentRunning: boolean;
  isDiagnosed: boolean;
  onRunDiagnosis: (finding: RemoteDiagnosisFinding) => void;
  onRunEquipmentDiagnosis: (findings: RemoteDiagnosisFinding[]) => void;
}) {
  const { isCompact } = useViewport();
  const { equipment, findings } = group;
  const openCount = findings.filter((f) => liveResults[f.id]?.status === "open").length;
  const normalCount = findings.filter((f) => liveResults[f.id]?.status === "resolved").length;
  const criticalCount = findings.filter(
    (f) => liveResults[f.id]?.severity === "critical" && liveResults[f.id]?.status !== "resolved",
  ).length;
  const hasCritical = isDiagnosed && criticalCount > 0;
  const completedCount = findings.filter((f) => liveResults[f.id]).length;

  return (
    <Paper
      variant="outlined"
      sx={{
        borderRadius: 2,
        overflow: "hidden",
        borderColor: hasCritical ? "error.light" : "divider",
      }}
    >
      <Box
        sx={{
          px: { xs: 1.5, sm: 2 },
          py: 1.5,
          bgcolor: hasCritical ? "error.50" : "action.hover",
          borderBottom: isDiagnosed ? 1 : 0,
          borderColor: "divider",
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={1.5}
          sx={{ alignItems: { md: "center" } }}
        >
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap", mb: 0.5 }}>
              <StatusBadge status={equipment.status} />
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                {equipment.serialNo}
              </Typography>
              <Chip label={equipment.model} size="small" variant="outlined" />
              <Chip label={equipment.region} size="small" variant="outlined" />
              {isDiagnosed && completedCount > 0 && (
                <Chip
                  label={translate("remoteDiagnosis.equipment.findingsCount" as TranslationKey).replace(
                    "{count}",
                    String(completedCount),
                  )}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              )}
              {isDiagnosed && normalCount > 0 && (
                <Chip
                  label={translate("remoteDiagnosis.summary.normal" as TranslationKey).replace(
                    "{count}",
                    String(normalCount),
                  )}
                  size="small"
                  color="success"
                  variant="filled"
                />
              )}
              {isDiagnosed && openCount > 0 && (
                <Chip
                  label={translate("remoteDiagnosis.summary.open" as TranslationKey).replace(
                    "{count}",
                    String(openCount),
                  )}
                  size="small"
                  color="warning"
                  variant="filled"
                />
              )}
              {isDiagnosed && criticalCount > 0 && (
                <Chip
                  label={translate("remoteDiagnosis.summary.critical" as TranslationKey).replace(
                    "{count}",
                    String(criticalCount),
                  )}
                  size="small"
                  color="error"
                  variant="filled"
                />
              )}
            </Stack>
            <Typography variant="body2" color="text.secondary">
              {equipment.customer} · {equipment.site}
            </Typography>
            {!isDiagnosed && (
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.75 }}>
                {translate("remoteDiagnosis.equipment.runHint" as TranslationKey)}
              </Typography>
            )}
          </Box>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={0.75}
            sx={{
              alignSelf: { xs: "stretch", md: "center" },
              flexShrink: 0,
              width: { xs: "100%", md: "auto" },
            }}
          >
            <PrimaryButton
              onClick={() => onRunEquipmentDiagnosis(findings)}
              menuId="remote-diagnosis"
              perm="view"
              fullWidth={isCompact}
              startIcon={
                isEquipmentRunning ? (
                  <CircularProgress size={14} color="inherit" />
                ) : (
                  <BiotechIcon fontSize="small" />
                )
              }
            >
              {isEquipmentRunning
                ? translate("remoteDiagnosis.action.running" as TranslationKey)
                : isDiagnosed
                  ? translate("remoteDiagnosis.action.rerunDiagnosis" as TranslationKey)
                  : translate("remoteDiagnosis.action.runDiagnosis" as TranslationKey)}
            </PrimaryButton>
            <PrimaryButton
              href={buildRemoteControlHref(equipment.serialNo)}
              variant="outlined"
              menuId="remote-control"
              fullWidth={isCompact}
              perm="view"
              startIcon={<MemoryIcon fontSize="small" />}
            >
              {translate("remoteDiagnosis.toolbar.remoteControl" as TranslationKey)}
            </PrimaryButton>
          </Stack>
        </Stack>
      </Box>

      {isDiagnosed && (
        <Stack divider={<Divider />}>
          {sortFindings(findings, liveResults).map((finding) => (
            <DiagnosisFindingRow
              key={finding.id}
              finding={finding}
              translate={translate}
              formatAsOf={formatAsOf}
              isRunning={runningFindingIds.has(finding.id)}
              liveResult={liveResults[finding.id]}
              onRunDiagnosis={onRunDiagnosis}
            />
          ))}
        </Stack>
      )}
    </Paper>
  );
}

export default function RemoteDiagnosisPage() {
  const { translate, language, formatAsOf } = useLocale();
  const { data: fleetData } = useFleetLive();
  const fleetRows = getListItems(fleetData);
  const dataMeta = fleetData?.meta ?? fallbackMeta("/fleet/live");
  const { data: remoteData } = useRemoteDiagnostics();
  const remoteDiagnostics = getListItems(remoteData);
  const searchParams = useSearchParams();
  const query = useQueryState(INITIAL_SEARCH, { equipmentSn: "전체", status: "전체" });

  useEffect(() => {
    const sn = searchParams.get("equipmentSn");
    if (sn && fleetRows.some((e) => e.serialNo === sn)) {
      query.applyFilter("equipmentSn", sn);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- URL deep-link only on mount
  }, [searchParams]);
  const [runningFindingIds, setRunningFindingIds] = useState<Set<string>>(() => new Set());
  const [runningEquipmentSns, setRunningEquipmentSns] = useState<Set<string>>(() => new Set());
  const [diagnosedEquipmentSns, setDiagnosedEquipmentSns] = useState<Set<string>>(() => new Set());
  const [liveResults, setLiveResults] = useState<Record<string, DiagnosisRunResult>>({});
  const runningRef = useRef(new Set<string>());

  const syncRunningState = useCallback(() => {
    setRunningFindingIds(new Set(runningRef.current));
  }, []);

  const executeDiagnosis = useCallback(
    async (finding: RemoteDiagnosisFinding) => {
      if (runningRef.current.has(finding.id)) return;
      runningRef.current.add(finding.id);
      syncRunningState();
      try {
        const result = await runRemoteDiagnosisJob(finding);
        setLiveResults((prev) => ({ ...prev, [finding.id]: result }));
      } finally {
        runningRef.current.delete(finding.id);
        syncRunningState();
      }
    },
    [syncRunningState],
  );

  const handleRunDiagnosis = useCallback(
    (finding: RemoteDiagnosisFinding) => {
      void executeDiagnosis(finding);
    },
    [executeDiagnosis],
  );

  const revealEquipment = useCallback((serialNo: string) => {
    setDiagnosedEquipmentSns((prev) => new Set(prev).add(serialNo));
  }, []);

  const handleRunEquipmentDiagnosis = useCallback(
    async (serialNo: string, findings: RemoteDiagnosisFinding[]) => {
      if (!serialNo || runningEquipmentSns.has(serialNo)) return;
      revealEquipment(serialNo);
      setRunningEquipmentSns((prev) => new Set(prev).add(serialNo));
      try {
        await Promise.all(findings.map((f) => executeDiagnosis(f)));
      } finally {
        setRunningEquipmentSns((prev) => {
          const next = new Set(prev);
          next.delete(serialNo);
          return next;
        });
      }
    },
    [executeDiagnosis, revealEquipment, runningEquipmentSns],
  );

  const handleRunAllDiagnosis = useCallback(
    async (groups: EquipmentDiagnosisGroup[]) => {
      for (const group of groups) {
        revealEquipment(group.equipment.serialNo);
      }
      const targets = groups.flatMap((g) => g.findings);
      await Promise.all(targets.map((f) => executeDiagnosis(f)));
    },
    [executeDiagnosis, revealEquipment],
  );

  const searchDefs = useMemo(
    () => [
      { id: "serialNo", label: localeLabel(SEARCH_FIELD_LABELS.serialNo, language), indexKey: "serial_no" },
      { id: "model", label: localeLabel(SEARCH_FIELD_LABELS.model, language), indexKey: "model" },
      { id: "customer", label: localeLabel(SEARCH_FIELD_LABELS.customer, language), indexKey: "customer" },
      { id: "site", label: localeLabel(SEARCH_FIELD_LABELS.site, language), indexKey: "site" },
    ],
    [language],
  );

  const equipmentOptions = useMemo(
    () => [
      ...[...fleetRows]
        .sort(compareEquipmentOperatingFirst)
        .map((item) => ({
          value: item.serialNo,
          label: `${item.serialNo} — ${item.model}`,
        })),
    ],
    [fleetRows],
  );

  const statusOptions = useMemo(
    () => [
      { value: "open", label: translate("remoteDiagnosis.status.open" as TranslationKey) },
      { value: "in_progress", label: translate("remoteDiagnosis.status.inProgress" as TranslationKey) },
      { value: "resolved", label: translate("remoteDiagnosis.status.resolved" as TranslationKey) },
    ],
    [translate],
  );

  const equipmentGroups = useMemo((): EquipmentDiagnosisGroup[] => {
    const statusFilter = query.applied.select.status ?? "전체";

    return fleetRows
      .filter((equipment) => {
        const eqFindings = getFindingsForEquipment(equipment.serialNo, remoteDiagnostics);
        const apiFindings = remoteDiagnostics.filter((f) => f.equipmentSn === equipment.serialNo);
        const matchStatus =
          statusFilter === "전체" ||
          eqFindings.some((f) => f.status === statusFilter) ||
          apiFindings.some((f) => f.severity === statusFilter);
        return combineAnd(
          matchesIndexedFields(query.applied.search, {
            serialNo: equipment.serialNo,
            model: equipment.model,
            customer: equipment.customer,
            site: equipment.site,
          }),
          matchesSelectFilter(query.applied.select.equipmentSn ?? "전체", equipment.serialNo),
          matchStatus,
        );
      })
      .map((equipment) => ({
        equipment,
        findings: sortFindings(getFindingsForEquipment(equipment.serialNo, remoteDiagnostics)),
      }))
      .sort((a, b) => compareEquipmentOperatingFirst(a.equipment, b.equipment));
  }, [query.applied, fleetRows, remoteDiagnostics]);

  useEffect(() => {
    const visible = new Set(equipmentGroups.map((g) => g.equipment.serialNo));
    setDiagnosedEquipmentSns((prev) => new Set([...prev].filter((sn) => visible.has(sn))));
    setLiveResults((prev) => {
      const next: Record<string, DiagnosisRunResult> = {};
      for (const [id, result] of Object.entries(prev)) {
        if (visible.has(result.equipmentSn)) next[id] = result;
      }
      return next;
    });
  }, [equipmentGroups]);

  const revealedFindings = useMemo(() => {
    return equipmentGroups
      .filter((g) => diagnosedEquipmentSns.has(g.equipment.serialNo))
      .flatMap((g) => g.findings);
  }, [diagnosedEquipmentSns, equipmentGroups]);

  const openCount = revealedFindings.filter((f) => liveResults[f.id]?.status === "open").length;
  const normalCount = revealedFindings.filter((f) => liveResults[f.id]?.status === "resolved").length;
  const criticalCount = revealedFindings.filter(
    (f) => liveResults[f.id]?.severity === "critical" && liveResults[f.id]?.status !== "resolved",
  ).length;
  const findingsCount = revealedFindings.filter((f) => liveResults[f.id]).length;
  const anyRunning = runningFindingIds.size > 0;
  const hasDiagnosedAny = diagnosedEquipmentSns.size > 0;

  return (
    <Box>
      <PageToolbar>
        <DataScopeBadge meta={dataMeta} />
        <PrimaryButton
          onClick={() => {
            if (equipmentGroups.length > 0) void handleRunAllDiagnosis(equipmentGroups);
          }}
          menuId="remote-diagnosis"
          perm="view"
          startIcon={
            anyRunning ? <CircularProgress size={14} color="inherit" /> : <BiotechIcon fontSize="small" />
          }
        >
          {anyRunning
            ? translate("remoteDiagnosis.action.running" as TranslationKey)
            : hasDiagnosedAny
              ? translate("remoteDiagnosis.action.rerunDiagnosis" as TranslationKey)
              : translate("remoteDiagnosis.action.runDiagnosis" as TranslationKey)}
        </PrimaryButton>
        <PrimaryButton
          href="/remote-control"
          variant="outlined"
          menuId="remote-control"
          perm="view"
          startIcon={<MemoryIcon fontSize="small" />}
        >
          {translate("remoteDiagnosis.toolbar.remoteControl" as TranslationKey)}
        </PrimaryButton>
      </PageToolbar>

      <QueryToolbar
        searchFields={bindSearchFields(searchDefs, query.search, query.setSearch)}
        filters={[
          {
            id: "equipmentSn",
            label: translate("remoteDiagnosis.filter.targetEquipment" as TranslationKey),
            value: query.selects.equipmentSn ?? "전체",
            options: equipmentOptions,
            onChange: (v) => query.applyFilter("equipmentSn", v),
          },
          {
            id: "status",
            label: translate("remoteDiagnosis.filter.status" as TranslationKey),
            value: query.selects.status ?? "전체",
            options: statusOptions,
            onChange: (v) => query.applyFilter("status", v),
          },
        ]}
        onSearch={query.apply}
        onReset={query.reset}
        dataScope="realtime"
      />

      <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: "wrap" }}>
        <Chip
          label={
            hasDiagnosedAny
              ? translate("remoteDiagnosis.summary.findings" as TranslationKey).replace(
                  "{count}",
                  String(findingsCount),
                )
              : translate("remoteDiagnosis.summary.equipment" as TranslationKey).replace(
                  "{count}",
                  String(equipmentGroups.length),
                )
          }
          size="small"
          variant="outlined"
        />
        {hasDiagnosedAny && normalCount > 0 && (
          <Chip
            label={translate("remoteDiagnosis.summary.normal" as TranslationKey).replace(
              "{count}",
              String(normalCount),
            )}
            size="small"
            color="success"
            variant="filled"
          />
        )}
        {hasDiagnosedAny && (
          <Chip
            label={translate("remoteDiagnosis.summary.open" as TranslationKey).replace(
              "{count}",
              String(openCount),
            )}
            size="small"
            color={openCount > 0 ? "warning" : "default"}
            variant={openCount > 0 ? "filled" : "outlined"}
          />
        )}
        {hasDiagnosedAny && criticalCount > 0 && (
          <Chip
            label={translate("remoteDiagnosis.summary.critical" as TranslationKey).replace(
              "{count}",
              String(criticalCount),
            )}
            size="small"
            color="error"
            variant="filled"
          />
        )}
        <Typography variant="caption" color="text.secondary" sx={{ alignSelf: "center", ml: "auto" }}>
          {translate("remoteDiagnosis.summary.asOf" as TranslationKey).replace(
            "{asOf}",
            formatAsOf(dataMeta.asOf),
          )}
        </Typography>
      </Stack>

      {equipmentGroups.length === 0 ? (
        <Alert severity="info" variant="outlined">
          {translate("remoteDiagnosis.emptyEquipment" as TranslationKey)}
        </Alert>
      ) : (
        <Grid container spacing={2}>
          {equipmentGroups.map((group) => (
            <Grid key={group.equipment.serialNo} size={{ xs: 12 }}>
              <EquipmentDiagnosisCard
                group={group}
                translate={translate}
                formatAsOf={formatAsOf}
                runningFindingIds={runningFindingIds}
                liveResults={liveResults}
                isEquipmentRunning={runningEquipmentSns.has(group.equipment.serialNo)}
                isDiagnosed={diagnosedEquipmentSns.has(group.equipment.serialNo)}
                onRunDiagnosis={handleRunDiagnosis}
                onRunEquipmentDiagnosis={(items) =>
                  void handleRunEquipmentDiagnosis(group.equipment.serialNo, items)
                }
              />
            </Grid>
          ))}
        </Grid>
      )}

      <Card title={translate("remoteDiagnosis.card.workflow" as TranslationKey)} sx={{ mt: 2 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
          {translate("remoteDiagnosis.workflow.desc" as TranslationKey)}
        </Typography>
        <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
          <Chip component={Link} href="/alarms" clickable label="1. Alarms" size="small" />
          <Chip
            component={Link}
            href="/remote-diagnosis"
            clickable
            label={`2. ${translate("remoteDiagnosis.nav.label" as TranslationKey)}`}
            size="small"
            color="primary"
          />
          <Chip
            component={Link}
            href="/remote-control"
            clickable
            label={`3. ${translate("remoteDiagnosis.toolbar.remoteControl" as TranslationKey)}`}
            size="small"
          />
          <Chip component={Link} href="/service-tickets" clickable label="4. Tickets" size="small" />
        </Stack>
      </Card>
    </Box>
  );
}
