import type { PartOrderStatus, SlaTier } from '../../../common/types/enums';

export interface PartOrderDto {
  id: string;
  ticketId: string;
  equipmentSn: string;
  partNo: string;
  partName: string;
  qty: number;
  status: PartOrderStatus | string;
  requestedAt: string;
}

export interface PartScheduleDto {
  id: string;
  orderId: string;
  ticketId: string;
  equipmentSn: string;
  customer: string;
  site: string;
  partName: string;
  eta: string;
  delayDays: number;
  podStatus: PartOrderStatus | string;
}
