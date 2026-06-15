import { IsOptional, IsString } from 'class-validator';
import type { LogCategory, LogLevel } from '../../../common/types/enums';

export class EquipmentLogsQueryDto {
  @IsOptional()
  @IsString()
  category?: string;
}

export interface EquipmentLogEntryDto {
  id: string;
  equipmentId: string;
  serialNo: string;
  category: LogCategory | string;
  source: string;
  level: LogLevel;
  message: string;
  payload?: string;
  occurredAt: string;
}
