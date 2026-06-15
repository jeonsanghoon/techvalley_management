export interface RemoteDiagnosisDto {
  id: string;
  equipmentSn: string;
  code: string;
  severity: string;
  title: string;
  detail: string;
  suggestedAction?: string;
  detectedAt: string;
}
