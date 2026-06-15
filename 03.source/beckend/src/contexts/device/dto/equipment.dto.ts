import type {
  AlarmSeverity,
  EquipmentStatus,
  GeoZone,
  ServiceabilityLevel,
  SlaTier,
} from '../../../common/types/enums';

export interface EquipmentDto {
  id: string;
  serialNo: string;
  model: string;
  customer: string;
  site: string;
  region: string;
  geoZone?: GeoZone;
  status: EquipmentStatus;
  slaTier: SlaTier;
  serviceability: ServiceabilityLevel;
  lat: number;
  lng: number;
  tubeLifePct: number;
  detectorLifePct: number;
  lastTelemetryAt: string;
  firmwareVersion: string;
  installDate?: string;
}

export interface DeviceRawItemDto {
  id: number;
  device_code: string;
  serial?: string;
  operational_status_type: number;
  site_code: string;
  site_name: string;
  company_name: string;
  product_name: string;
}

export interface DeviceListRawResponseDto {
  items: DeviceRawItemDto[];
}
