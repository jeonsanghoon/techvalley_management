import type { SlaTier } from '../../../common/types/enums';

export interface CustomerDto {
  id: string;
  name: string;
  type: string;
  region: string;
  siteCount: number;
  equipmentCount: number;
  contractTier: SlaTier | string;
  registeredAt: string;
}

export interface SiteDto {
  id: string;
  customerId: string;
  customerName: string;
  name: string;
  address: string;
  region: string;
  equipmentCount: number;
  installedAt: string;
}
