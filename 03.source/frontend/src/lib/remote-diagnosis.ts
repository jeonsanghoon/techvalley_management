import type { AlarmSeverity } from "./types";

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

/** 원격 진단 결과 — Hot Tier / edge 진단 Job 스냅샷 */
export const remoteDiagnosisFindings: RemoteDiagnosisFinding[] = [
  {
    id: "rd-000",
    equipmentSn: "HK-2024-00158",
    component: "motor",
    severity: "warning",
    messageKey: "remoteDiagnosis.finding.motorCoord.message",
    actionKey: "remoteDiagnosis.finding.motorCoord.action",
    detectedAt: "2026-06-06T14:14:00+09:00",
    status: "open",
    metrics: { offsetX: 20, offsetY: -30, offsetZ: 40, unit: "deg" },
  },
  {
    id: "rd-001",
    equipmentSn: "RP-2023-00892",
    component: "detector",
    severity: "critical",
    messageKey: "remoteDiagnosis.finding.deadPixel.message",
    actionKey: "remoteDiagnosis.finding.deadPixel.action",
    detectedAt: "2026-06-06T14:12:00+09:00",
    status: "open",
    metrics: { deadPixelCount: 847, threshold: 120 },
  },
  {
    id: "rd-002",
    equipmentSn: "RP-2023-00892",
    component: "motor",
    severity: "warning",
    messageKey: "remoteDiagnosis.finding.motorCoord.message",
    actionKey: "remoteDiagnosis.finding.motorCoord.action",
    detectedAt: "2026-06-06T14:10:00+09:00",
    status: "open",
    metrics: { offsetX: 20, offsetY: -30, offsetZ: 40, unit: "deg" },
  },
  {
    id: "rd-003",
    equipmentSn: "HK-2024-00158",
    component: "tube",
    severity: "warning",
    messageKey: "remoteDiagnosis.finding.tubeDrift.message",
    actionKey: "remoteDiagnosis.finding.tubeDrift.action",
    detectedAt: "2026-06-06T13:45:00+09:00",
    status: "in_progress",
    metrics: { kvDrift: 4.2 },
  },
  {
    id: "rd-004",
    equipmentSn: "RP-2023-EU0892",
    component: "detector",
    severity: "warning",
    messageKey: "remoteDiagnosis.finding.deadPixel.message",
    actionKey: "remoteDiagnosis.finding.deadPixel.action",
    detectedAt: "2026-06-06T07:05:00+02:00",
    status: "open",
    metrics: { deadPixelCount: 312, threshold: 120 },
  },
  {
    id: "rd-005",
    equipmentSn: "RP-2023-MX0892",
    component: "motor",
    severity: "warning",
    messageKey: "remoteDiagnosis.finding.motorCoord.message",
    actionKey: "remoteDiagnosis.finding.motorCoord.action",
    detectedAt: "2026-06-05T21:40:00-06:00",
    status: "open",
    metrics: { offsetX: 1.9, offsetY: 2.7, offsetZ: -2.2, unit: "deg" },
  },
];

const STANDARD_CHECK_COMPONENTS: RemoteDiagnosisComponent[] = ["motor", "detector", "tube"];

function healthyBaselineFinding(
  equipmentSn: string,
  component: RemoteDiagnosisComponent,
): RemoteDiagnosisFinding {
  const base = {
    equipmentSn,
    component,
    severity: "warning" as AlarmSeverity,
    detectedAt: new Date().toISOString(),
    status: "open" as RemoteDiagnosisStatus,
  };

  switch (component) {
    case "detector":
      return {
        ...base,
        id: `rd-health-${equipmentSn}-detector`,
        messageKey: "remoteDiagnosis.finding.deadPixel.message",
        actionKey: "remoteDiagnosis.finding.deadPixel.action",
        metrics: { deadPixelCount: 42, threshold: 120 },
      };
    case "motor":
      return {
        ...base,
        id: `rd-health-${equipmentSn}-motor`,
        messageKey: "remoteDiagnosis.finding.motorCoord.message",
        actionKey: "remoteDiagnosis.finding.motorCoord.action",
        metrics: { offsetX: 0.3, offsetY: -0.2, offsetZ: 0.4, unit: "deg" },
      };
    case "tube":
      return {
        ...base,
        id: `rd-health-${equipmentSn}-tube`,
        messageKey: "remoteDiagnosis.finding.tubeDrift.message",
        actionKey: "remoteDiagnosis.finding.tubeDrift.action",
        metrics: { kvDrift: 0.8 },
      };
    default:
      return {
        ...base,
        id: `rd-health-${equipmentSn}-body`,
        messageKey: "remoteDiagnosis.finding.generic.detail",
        actionKey: "remoteDiagnosis.finding.generic.summary",
        metrics: {},
      };
  }
}

/** 장비별 진단 항목 — 등록된 이슈가 없으면 표준 3종(디텍터·모터·튜브) 건강 점검 */
export function getFindingsForEquipment(equipmentSn: string): RemoteDiagnosisFinding[] {
  const known = remoteDiagnosisFindings.filter((f) => f.equipmentSn === equipmentSn);
  if (known.length > 0) return known;
  return STANDARD_CHECK_COMPONENTS.map((component) => healthyBaselineFinding(equipmentSn, component));
}

export const remoteDiagnosisMeta = {
  scope: "realtime" as const,
  asOf: "2026-06-06T14:15:00+09:00",
  source: "edge.diagnosis.job",
  refreshInterval: "15분 (edge-diagnosis-rollup)",
};

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

const DIAGNOSIS_JOB_MS = 1400;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function jitter(n: number, pct = 0.08): number {
  const delta = n * pct * (Math.random() * 2 - 1);
  return Math.round((n + delta) * 10) / 10;
}

function evaluateSeverity(
  component: RemoteDiagnosisComponent,
  metrics: Record<string, string | number>,
): AlarmSeverity {
  if (component === "detector") {
    const count = Number(metrics.deadPixelCount ?? 0);
    const threshold = Number(metrics.threshold ?? 120);
    if (count > threshold * 5) return "critical";
    return "warning";
  }
  if (component === "motor") {
    const max = Math.max(
      Math.abs(Number(metrics.offsetX ?? 0)),
      Math.abs(Number(metrics.offsetY ?? 0)),
      Math.abs(Number(metrics.offsetZ ?? 0)),
    );
    if (max >= 3) return "critical";
    return "warning";
  }
  if (component === "tube") {
    const drift = Math.abs(Number(metrics.kvDrift ?? 0));
    if (drift >= 5) return "critical";
    return "warning";
  }
  return "warning";
}

function isWithinNormalRange(component: RemoteDiagnosisComponent, metrics: Record<string, string | number>): boolean {
  if (component === "detector") {
    return Number(metrics.deadPixelCount ?? 0) <= Number(metrics.threshold ?? 120);
  }
  if (component === "motor") {
    const max = Math.max(
      Math.abs(Number(metrics.offsetX ?? 0)),
      Math.abs(Number(metrics.offsetY ?? 0)),
      Math.abs(Number(metrics.offsetZ ?? 0)),
    );
    return max < 1.5;
  }
  if (component === "tube") {
    return Math.abs(Number(metrics.kvDrift ?? 0)) < 2.5;
  }
  return false;
}

function buildLiveMetrics(finding: RemoteDiagnosisFinding): Record<string, string | number> {
  const base = { ...(finding.metrics ?? {}) };
  if (finding.component === "detector") {
    return {
      deadPixelCount: Math.round(jitter(Number(base.deadPixelCount ?? 400), 0.05)),
      threshold: base.threshold ?? 120,
      scanLines: Math.round(jitter(2048, 0.001)),
      badPixelRate: `${jitter(Number(base.deadPixelCount ?? 400) / 20480, 0.06).toFixed(2)}%`,
    };
  }
  if (finding.component === "motor") {
    return {
      offsetX: Number(base.offsetX ?? 0),
      offsetY: Number(base.offsetY ?? 0),
      offsetZ: Number(base.offsetZ ?? 0),
      unit: base.unit ?? "deg",
      homingOk: "Y",
    };
  }
  if (finding.component === "tube") {
    return {
      kvDrift: jitter(Number(base.kvDrift ?? 0), 0.1),
      kvTarget: 160,
      kvMeasured: jitter(160 + Number(base.kvDrift ?? 0), 0.02),
      maMeasured: jitter(3.5, 0.05),
    };
  }
  return base;
}

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

/** Edge 진단 Job — 프로토타입: MQTT/Job 응답을 시뮬레이션 */
export async function runRemoteDiagnosisJob(finding: RemoteDiagnosisFinding): Promise<DiagnosisRunResult> {
  await delay(DIAGNOSIS_JOB_MS);
  const metrics = buildLiveMetrics(finding);
  const severity = evaluateSeverity(finding.component, metrics);
  return {
    findingId: finding.id,
    equipmentSn: finding.equipmentSn,
    component: finding.component,
    severity,
    messageKey: finding.messageKey,
    actionKey: finding.actionKey,
    metrics,
    status: isWithinNormalRange(finding.component, metrics)
      ? "resolved"
      : finding.status === "resolved"
        ? "resolved"
        : "in_progress",
    completedAt: new Date().toISOString(),
  };
}
