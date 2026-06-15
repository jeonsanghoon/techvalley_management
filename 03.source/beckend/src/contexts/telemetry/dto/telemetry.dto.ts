import type { MetricKind } from '../../../common/types/enums';

export interface MetricLogEntryDto {
  id: string;
  equipmentId: string;
  serialNo: string;
  kind: MetricKind;
  metric: string;
  value: string;
  receivedAt: string;
  edgePublished: boolean;
}
