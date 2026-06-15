import type { AlarmSeverity } from "./types";
import { api } from "./api/endpoints";

export type RemoteDiagnosisComponent = "detector" | "motor" | "tube" | "body";
export type RemoteDiagnosisStatus = "open" | "in_progress" | "resolved";

export interface RemoteDiagnosisFinding {
  id: string;
  equipmentSn: string;
  component: RemoteDiagnosisComponent;
  severity: AlarmSeverity;
  /** i18n message key */
  messageKey: string;
  /** i18n recommended action key */
  actionKey: string;
  detectedAt: string;
  status: RemoteDiagnosisStatus;
  metrics?: Record<string, string | number>;
}

export type ApiRemoteFinding = {
  id: string;
  equipmentSn: string;
  code: string;
  severity: string;
  title: string;
  detail: string;
  suggestedAction?: string;
  detectedAt: string;
};

function inferComponent(code: string): RemoteDiagnosisComponent {
  const c = code.toUpperCase();
  if (c.includes("DET") || c.includes("TEMP")) return "detector";
  if (c.includes("TUBE") || c.includes("KV")) return "tube";
  if (c.includes("MOTOR")) return "motor";
  return "body";
}

export function mapApiRemoteFinding(row: ApiRemoteFinding): RemoteDiagnosisFinding {
  let metrics: Record<string, string | number> = {};
  try {
    if (row.detail?.startsWith("{")) {
      metrics = JSON.parse(row.detail) as Record<string, string | number>;
    }
  } catch {
    metrics = {};
  }

  return {
    id: row.id,
    equipmentSn: row.equipmentSn,
    component: inferComponent(row.code),
    severity: row.severity === "critical" ? "critical" : "warning",
    messageKey: "remoteDiagnosis.finding.generic.message",
    actionKey: "remoteDiagnosis.finding.generic.action",
    detectedAt: row.detectedAt,
    status: "open",
    metrics,
  };
}

/** 장비별 진단 항목 — API(DB) findings 만 사용 */
export function getFindingsForEquipment(
  equipmentSn: string,
  apiRows: ApiRemoteFinding[] = [],
): RemoteDiagnosisFinding[] {
  return apiRows.filter((f) => f.equipmentSn === equipmentSn).map(mapApiRemoteFinding);
}

/** 실시간 원격 진단 Job 응답 */
export type DiagnosisRunResult = {
  findingId: string;
  equipmentSn: string;
  component: RemoteDiagnosisComponent;
  severity: AlarmSeverity;
  messageKey: string;
  actionKey: string;
  metrics: Record<string, string | number>;
  status: RemoteDiagnosisStatus;
  completedAt: string;
};

export type DiagnosisDisplayText = {
  summary: string;
  detail: string;
};

function roundMetric(value: string | number | undefined): number {
  return Math.round(Number(value ?? 0));
}

function formatMotorCoords(metrics: Record<string, string | number>): string {
  const x = roundMetric(metrics.offsetX);
  const y = roundMetric(metrics.offsetY);
  const z = roundMetric(metrics.offsetZ);
  return `${x},${y},${z}`;
}

function motorDisplayDetail(
  metrics: Record<string, string | number>,
  translate: (key: string) => string,
  normal: boolean,
): string {
  const key = normal
    ? "remoteDiagnosis.finding.motorCoord.normalDetail"
    : "remoteDiagnosis.finding.motorCoord.detail";
  return translate(key).replace("{coords}", formatMotorCoords(metrics));
}

/** 진단 Job 결과 — 티켓/화면용 간결 문구 (요약 + 측정값 포함 상세) */
export function formatDiagnosisDisplay(
  component: RemoteDiagnosisComponent,
  metrics: Record<string, string | number>,
  translate: (key: string) => string,
  status?: RemoteDiagnosisStatus,
): DiagnosisDisplayText {
  if (status === "resolved") {
    switch (component) {
      case "motor": {
        return {
          summary: translate("remoteDiagnosis.finding.motorCoord.normalSummary"),
          detail: motorDisplayDetail(metrics, translate, true),
        };
      }
      case "detector": {
        const count = roundMetric(metrics.deadPixelCount);
        const threshold = roundMetric(metrics.threshold);
        return {
          summary: translate("remoteDiagnosis.finding.deadPixel.normalSummary"),
          detail: translate("remoteDiagnosis.finding.deadPixel.normalDetail")
            .replace("{count}", String(count))
            .replace("{threshold}", String(threshold)),
        };
      }
      case "tube": {
        const drift = Number(metrics.kvDrift ?? 0);
        const driftText = Number.isInteger(drift) ? String(drift) : drift.toFixed(1);
        return {
          summary: translate("remoteDiagnosis.finding.tubeDrift.normalSummary"),
          detail: translate("remoteDiagnosis.finding.tubeDrift.normalDetail").replace("{drift}", driftText),
        };
      }
      default:
        return {
          summary: translate("remoteDiagnosis.finding.resolved.summary"),
          detail: translate("remoteDiagnosis.finding.resolved.detail"),
        };
    }
  }

  switch (component) {
    case "motor":
      return {
        summary: translate("remoteDiagnosis.finding.motorCoord.summary"),
        detail: motorDisplayDetail(metrics, translate, false),
      };
    case "detector": {
      const count = roundMetric(metrics.deadPixelCount);
      const threshold = roundMetric(metrics.threshold);
      return {
        summary: translate("remoteDiagnosis.finding.deadPixel.summary"),
        detail: translate("remoteDiagnosis.finding.deadPixel.detail")
          .replace("{count}", String(count))
          .replace("{threshold}", String(threshold)),
      };
    }
    case "tube": {
      const drift = Number(metrics.kvDrift ?? 0);
      const driftText = Number.isInteger(drift) ? String(drift) : drift.toFixed(1);
      return {
        summary: translate("remoteDiagnosis.finding.tubeDrift.summary"),
        detail: translate("remoteDiagnosis.finding.tubeDrift.detail").replace("{drift}", driftText),
      };
    }
    default:
      return {
        summary: translate("remoteDiagnosis.finding.generic.summary"),
        detail: translate("remoteDiagnosis.finding.generic.detail"),
      };
  }
}

/** Edge 진단 Job — POST /api/remote/diagnostics/:id/run */
export async function runRemoteDiagnosisJob(finding: RemoteDiagnosisFinding): Promise<DiagnosisRunResult> {
  const { data } = await api.runRemoteDiagnosis(finding.id);
  return {
    findingId: data.findingId,
    equipmentSn: data.equipmentSn,
    component: data.component as RemoteDiagnosisComponent,
    severity: data.severity === "critical" ? "critical" : "warning",
    messageKey: data.messageKey,
    actionKey: data.actionKey,
    metrics: data.metrics,
    status: data.status as RemoteDiagnosisStatus,
    completedAt: data.completedAt,
  };
}
