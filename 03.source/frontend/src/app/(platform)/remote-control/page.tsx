"use client";

import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  Alert,
  Box,
  Button,
  Grid,
  Slider,
  Stack,
  Typography,
} from "@mui/material";
import { PageToolbar, Card, StatusBadge } from "@/components/ui/PageComponents";
import { PrimaryButton } from "@/components/ui/mui-primitives";
import { QueryToolbar } from "@/components/ui/QueryToolbar";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { useQueryState } from "@/hooks/useQueryState";
import { bindSearchFields } from "@/lib/grid/bind-search-fields";
import { combineAnd, matchesIndexedFields } from "@/lib/grid/query-filter";
import { DataScopeBadge } from "@/components/ui/DataScopeBadge";
import { alarms } from "@/lib/mock-data";
import { realtimeFleetItems, realtimeFleetMeta } from "@/lib/data/realtime";
import { remoteDiagnosisFindings, formatDiagnosisDisplay } from "@/lib/remote-diagnosis";
import { useLocale } from "@/contexts/LocaleContext";
import type { TranslationKey } from "@/lib/locale";
import { localeLabel } from "@/lib/locale/types";
import { SEARCH_FIELD_LABELS } from "@/lib/locale/search-fields";

const INITIAL_SEARCH = { serialNo: "", model: "", customer: "", site: "" };

export default function RemoteControlPage() {
  const { translate, language } = useLocale();
  const searchParams = useSearchParams();
  const query = useQueryState(INITIAL_SEARCH, { equipmentSn: "전체" });
  const [kv, setKv] = useState(160);
  const [ma, setMa] = useState(3.5);
  const [result, setResult] = useState<string | null>(null);

  const findingId = searchParams.get("findingId");
  const linkedFinding = useMemo(
    () => (findingId ? remoteDiagnosisFindings.find((f) => f.id === findingId) : undefined),
    [findingId],
  );

  const linkedDiagnosisText = useMemo(() => {
    if (!linkedFinding) return null;
    return formatDiagnosisDisplay(
      linkedFinding.component,
      linkedFinding.metrics ?? {},
      (key) => translate(key as TranslationKey),
      linkedFinding.status,
    );
  }, [linkedFinding, translate]);

  useEffect(() => {
    const sn = searchParams.get("equipmentSn");
    if (sn && realtimeFleetItems.some((e) => e.serialNo === sn)) {
      query.applyFilter("equipmentSn", sn);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- URL deep-link only on mount
  }, [searchParams]);

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
      ...realtimeFleetItems.map((item) => ({
        value: item.serialNo,
        label: `${item.serialNo} — ${item.model}`,
      })),
    ],
    [translate],
  );

  const filteredEquipments = useMemo(
    () =>
      realtimeFleetItems.filter((item) =>
        combineAnd(
          matchesIndexedFields(query.applied.search, {
            serialNo: item.serialNo,
            model: item.model,
            customer: item.customer,
            site: item.site,
          }),
          query.applied.select.equipmentSn === "전체" || item.serialNo === query.applied.select.equipmentSn,
        ),
      ),
    [query.applied],
  );

  const selectedSn =
    query.applied.select.equipmentSn !== "전체"
      ? query.applied.select.equipmentSn
      : filteredEquipments[0]?.serialNo ?? realtimeFleetItems[0]?.serialNo ?? "";

  const eq = realtimeFleetItems.find((e) => e.serialNo === selectedSn);
  const linkedAlarm = alarms.find((a) => a.equipmentSn === selectedSn && a.remoteResult === "unresolved");

  return (
    <Box>
      <PageToolbar>
        <DataScopeBadge meta={realtimeFleetMeta} />
      </PageToolbar>

      <QueryToolbar
        searchFields={bindSearchFields(searchDefs, query.search, query.setSearch)}
        filters={[
          {
            id: "equipmentSn",
            label: translate("remoteControl.filter.targetEquipment" as TranslationKey),
            value: query.selects.equipmentSn ?? "전체",
            options: equipmentOptions,
            onChange: (v) => {
              query.applyFilter("equipmentSn", v);
              setResult(null);
            },
          },
        ]}
        onSearch={query.apply}
        onReset={() => {
          query.reset();
          setResult(null);
        }}
        dataScope="realtime"
      />

      {eq && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {translate("remoteControl.target" as TranslationKey)
            .replace("{sn}", eq.serialNo)
            .replace("{model}", eq.model)
            .replace("{customer}", eq.customer)
            .replace("{site}", eq.site)}
        </Typography>
      )}

      {linkedAlarm && (
        <Card title={translate("remoteControl.card.linkedAlarm" as TranslationKey)} sx={{ mb: 2 }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <StatusBadge status={linkedAlarm.severity} />
            <Typography variant="body2">{linkedAlarm.message}</Typography>
          </Stack>
        </Card>
      )}

      {linkedFinding && linkedDiagnosisText && linkedFinding.equipmentSn === selectedSn && (
        <Card title={translate("remoteControl.card.linkedDiagnosis" as TranslationKey)} sx={{ mb: 2 }}>
          <Stack spacing={1.5}>
            <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap" }}>
              <StatusBadge status={linkedFinding.severity} />
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                {linkedDiagnosisText.summary}
              </Typography>
            </Stack>
            <Typography variant="body2" sx={{ lineHeight: 1.55 }}>
              {linkedDiagnosisText.detail}
            </Typography>
          </Stack>
        </Card>
      )}

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <Card title={translate("remoteControl.card.parameters" as TranslationKey)}>
            <Stack spacing={3}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  kV: {kv}
                </Typography>
                <Slider min={100} max={200} value={kv} onChange={(_, v) => setKv(v as number)} valueLabelDisplay="auto" />
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  mA: {ma}
                </Typography>
                <Slider min={1} max={6} step={0.1} value={ma} onChange={(_, v) => setMa(v as number)} valueLabelDisplay="auto" />
              </Box>
              <PermissionGate menuId="remote-control" action="execute">
                <Button variant="contained" color="secondary" fullWidth onClick={() => setResult("unresolved")}>
                  {translate("remoteControl.action.applyParameters" as TranslationKey)}
                </Button>
              </PermissionGate>
            </Stack>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, lg: 6 }}>
          <Card title={translate("remoteControl.card.safeMode" as TranslationKey)}>
            <Stack spacing={2}>
              <PermissionGate menuId="remote-control" action="execute">
                <Button variant="outlined" color="warning" fullWidth onClick={() => setResult("pending")}>
                  {translate("remoteControl.action.safeMode" as TranslationKey)}
                </Button>
              </PermissionGate>
              <Button variant="outlined" color="error" fullWidth>
                {translate("remoteControl.action.emgHotline" as TranslationKey)}
              </Button>
              <Alert severity="info" variant="outlined">
                {translate("remoteControl.alert.failsafe" as TranslationKey)}
              </Alert>
            </Stack>
          </Card>
        </Grid>
      </Grid>

      <Card title={translate("remoteControl.card.resolution" as TranslationKey)}>
        <Stack direction="row" spacing={1.5} sx={{ flexWrap: "wrap", alignItems: "center" }}>
          <Typography variant="body2" color="text.secondary">
            {translate("remoteControl.result.label" as TranslationKey)}
          </Typography>
          {result === "unresolved" && (
            <>
              <StatusBadge status="warning" />
              <Typography variant="body2">{translate("remoteControl.result.unresolved" as TranslationKey)}</Typography>
              <PrimaryButton href="/service-tickets" menuId="service-tickets" perm="create">
                {translate("remoteControl.result.createTicket" as TranslationKey)}
              </PrimaryButton>
            </>
          )}
          {result === "pending" && (
            <Typography variant="body2" color="warning.main">
              {translate("remoteControl.result.safeModePending" as TranslationKey)}
            </Typography>
          )}
          {!result && (
            <Typography variant="body2" color="text.disabled">
              {translate("remoteControl.result.placeholder" as TranslationKey)}
            </Typography>
          )}
          {eq && (
            <Typography variant="caption" color="text.secondary" sx={{ ml: "auto" }}>
              {translate("remoteControl.result.shadow" as TranslationKey).replace("{version}", eq.firmwareVersion)}
            </Typography>
          )}
        </Stack>
      </Card>
    </Box>
  );
}
