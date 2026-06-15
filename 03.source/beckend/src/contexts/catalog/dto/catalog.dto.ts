import type { FirmwareAutoMode, IotConnectionStatus } from '../../../common/types/enums';

export interface FirmwareConfigDto {
  id: string;
  serialNo: string;
  model: string;
  customer: string;
  current: string;
  target: string;
  auto: FirmwareAutoMode;
  lastCheckAt: string;
}

export interface IotThingDto {
  id: string;
  sn: string;
  thing: string;
  cert: string;
  policy: string;
  status: IotConnectionStatus;
  lastSeenAt: string;
}
