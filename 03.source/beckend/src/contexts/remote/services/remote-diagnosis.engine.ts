/** Edge 진단 Job 평가 — 프론트 시뮬레이션 로직을 서버로 이전 */
export type DiagnosisComponent = 'detector' | 'motor' | 'tube' | 'body';

export interface DiagnosisRunPayload {
  findingId: string;
  equipmentSn: string;
  component: DiagnosisComponent;
  severity: 'critical' | 'warning';
  messageKey: string;
  actionKey: string;
  metrics: Record<string, string | number>;
  status: 'open' | 'in_progress' | 'resolved';
  completedAt: string;
}

function inferComponent(code: string): DiagnosisComponent {
  const c = code.toUpperCase();
  if (c.includes('DET') || c.includes('TEMP')) return 'detector';
  if (c.includes('TUBE') || c.includes('KV')) return 'tube';
  if (c.includes('MOTOR')) return 'motor';
  return 'body';
}

function jitter(n: number, pct = 0.08): number {
  const delta = n * pct * (Math.random() * 2 - 1);
  return Math.round((n + delta) * 10) / 10;
}

function buildLiveMetrics(
  component: DiagnosisComponent,
  base: Record<string, string | number>,
): Record<string, string | number> {
  if (component === 'detector') {
    const count = Number(base.deadPixelCount ?? 42);
    return {
      deadPixelCount: Math.round(jitter(count, 0.05)),
      threshold: base.threshold ?? 120,
      scanLines: Math.round(jitter(2048, 0.001)),
      badPixelRate: `${jitter(count / 20480, 0.06).toFixed(2)}%`,
    };
  }
  if (component === 'motor') {
    return {
      offsetX: Number(base.offsetX ?? 0.3),
      offsetY: Number(base.offsetY ?? -0.2),
      offsetZ: Number(base.offsetZ ?? 0.4),
      unit: base.unit ?? 'deg',
      homingOk: 'Y',
    };
  }
  if (component === 'tube') {
    const drift = Number(base.kvDrift ?? 0.8);
    return {
      kvDrift: jitter(drift, 0.1),
      kvTarget: 160,
      kvMeasured: jitter(160 + drift, 0.02),
      maMeasured: jitter(3.5, 0.05),
    };
  }
  return base;
}

function evaluateSeverity(
  component: DiagnosisComponent,
  metrics: Record<string, string | number>,
): 'critical' | 'warning' {
  if (component === 'detector') {
    const count = Number(metrics.deadPixelCount ?? 0);
    const threshold = Number(metrics.threshold ?? 120);
    if (count > threshold * 5) return 'critical';
    return 'warning';
  }
  if (component === 'motor') {
    const max = Math.max(
      Math.abs(Number(metrics.offsetX ?? 0)),
      Math.abs(Number(metrics.offsetY ?? 0)),
      Math.abs(Number(metrics.offsetZ ?? 0)),
    );
    return max >= 3 ? 'critical' : 'warning';
  }
  if (component === 'tube') {
    return Math.abs(Number(metrics.kvDrift ?? 0)) >= 5 ? 'critical' : 'warning';
  }
  return 'warning';
}

function isWithinNormalRange(
  component: DiagnosisComponent,
  metrics: Record<string, string | number>,
): boolean {
  if (component === 'detector') {
    return Number(metrics.deadPixelCount ?? 0) <= Number(metrics.threshold ?? 120);
  }
  if (component === 'motor') {
    const max = Math.max(
      Math.abs(Number(metrics.offsetX ?? 0)),
      Math.abs(Number(metrics.offsetY ?? 0)),
      Math.abs(Number(metrics.offsetZ ?? 0)),
    );
    return max < 1.5;
  }
  if (component === 'tube') {
    return Math.abs(Number(metrics.kvDrift ?? 0)) < 2.5;
  }
  return false;
}

export function runDiagnosisEvaluation(input: {
  id: string;
  device_code: string;
  finding_code: string;
  severity: string;
}): DiagnosisRunPayload {
  const component = inferComponent(input.finding_code);
  const metrics = buildLiveMetrics(component, {});
  const severity = evaluateSeverity(component, metrics);
  const resolved = isWithinNormalRange(component, metrics);

  return {
    findingId: input.id,
    equipmentSn: input.device_code,
    component,
    severity,
    messageKey: 'remoteDiagnosis.finding.generic.message',
    actionKey: 'remoteDiagnosis.finding.generic.action',
    metrics,
    status: resolved ? 'resolved' : 'in_progress',
    completedAt: new Date().toISOString(),
  };
}
