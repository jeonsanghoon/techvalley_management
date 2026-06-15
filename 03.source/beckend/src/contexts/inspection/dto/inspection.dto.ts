import type { AlgorithmStatus } from '../../../common/types/enums';

export interface YieldRecordDto {
  id: string;
  equipmentSn: string;
  lotNo: string;
  serialNo: string;
  yieldPct: number;
  inspectedAt: string;
  algorithmVersion: string;
}

export interface AlgorithmConfigDto {
  id: string;
  name: string;
  version: string;
  threshold: number;
  status: AlgorithmStatus | string;
  appliedEquipmentCount: number;
}
