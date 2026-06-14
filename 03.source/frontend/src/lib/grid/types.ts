import type { Equipment, TelemetrySnapshot } from "@/lib/types";

export type TelemetryRow = TelemetrySnapshot & {
  serialNo: string;
  model: string;
  status: string;
};

export type CollectionRow = Equipment & {
  tubeRx: string;
  detectorRx: string;
  bodyRx: string;
};

export type ConsumableRow = Equipment;

export type SlaEquipmentRow = Equipment & {
  partsAvail: string;
  engineerAvail: string;
  remoteOk: string;
};

export type IotThingRow = {
  id: string;
  sn: string;
  thing: string;
  cert: string;
  policy: string;
  status: string;
  lastSeenAt?: string;
};

export type CodeRow = {
  id: string;
  group: string;
  code: string;
  name: string;
  sort: number;
};

export type AlgorithmRow = {
  id: string;
  name: string;
  version: string;
  threshold: number;
  status: string;
  appliedEquipmentCount?: number;
};

export type FirmwareRow = {
  id: string;
  serialNo: string;
  model: string;
  customer: string;
  current: string;
  target: string;
  auto: string;
  lastCheckAt: string;
};

export type PartScheduleRow = {
  id: string;
  orderId: string;
  ticketId: string;
  equipmentSn: string;
  customer: string;
  site: string;
  partName: string;
  eta: string;
  visitPlannedAt?: string;
  visitActualAt?: string;
  engineerName?: string;
  delayDays: number;
  podStatus: string;
  carrier?: string;
  trackingNo?: string;
};

export type GridColumnSet =
  | "equipment"
  | "alarm"
  | "alarmRule"
  | "serviceTicket"
  | "partOrder"
  | "partSchedule"
  | "installation"
  | "asRecord"
  | "customer"
  | "site"
  | "pipeline"
  | "yield"
  | "report"
  | "user"
  | "menuPerm"
  | "telemetry"
  | "collection"
  | "consumable"
  | "slaEquipment"
  | "iotThing"
  | "code"
  | "algorithm"
  | "firmware"
  | "equipmentLog"
  | "equipmentLogCategory"
  | "metricLog"
  | "metricLogPeriodic"
  | "metricLogEvent"
  | "metricLogFirmware"
  | "metricLogControl"
  | "notificationChannel"
  | "menuActionPerm";
