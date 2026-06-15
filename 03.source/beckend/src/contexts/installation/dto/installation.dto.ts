import type { InstallationStatus } from '../../../common/types/enums';

export interface InstallationDto {
  id: string;
  orderRef: string;
  equipmentSn: string;
  model: string;
  customer: string;
  site: string;
  plannedInstallDate: string;
  actualInstallDate?: string;
  iotRegistered: boolean;
  status: InstallationStatus;
}
