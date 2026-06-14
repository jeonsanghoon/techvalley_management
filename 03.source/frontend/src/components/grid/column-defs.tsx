"use client";

import type { ColDef } from "ag-grid-community";
import type { GridViewport } from "@/hooks/useViewport";
import { filterColumnsByViewport } from "@/lib/grid/viewport-columns";
import type { AppLanguage } from "@/lib/locale/types";
import { localeLabel } from "@/lib/locale/types";
import { localizeGridHeader } from "@/lib/locale/grid-headers";
import { localizeActionLabel, localizeDomainValue } from "@/lib/locale/domain-labels";
import { formatLocaleDateTime, gridDatePreset } from "@/lib/locale/datetime";
import type {
  AlgorithmRow,
  CodeRow,
  CollectionRow,
  ConsumableRow,
  FirmwareRow,
  GridColumnSet,
  IotThingRow,
  SlaEquipmentRow,
  TelemetryRow,
} from "@/lib/grid/types";
import type { MenuActionPermRow } from "@/lib/auth/types";
import {
  BoolCellRenderer,
  LifeBarCellRenderer,
  MonoCellRenderer,
  ServiceabilityCellRenderer,
  SeverityCellRenderer,
  SlaBreachedCellRenderer,
  StatusCellRenderer,
  YieldCellRenderer,
  LogCategoryCellRenderer,
  LogLevelCellRenderer,
  MetricKindCellRenderer,
  PayloadCellRenderer,
  LiveDotCellRenderer,
  AlarmRelatedLogsCellRenderer,
  EquipmentRemoteActionsCellRenderer,
} from "@/components/grid/cell-renderers";
import type {
  Alarm,
  AlarmRule,
  AsRecord,
  Customer,
  Equipment,
  EquipmentLogEntry,
  Installation,
  MenuPermission,
  MetricLogEntry,
  NotificationChannel,
  PartOrder,
  PipelineStatus,
  ReportSummary,
  ServiceTicket,
  Site,
  UserAccount,
  YieldRecord,
} from "@/lib/types";

export const equipmentColDefs: ColDef<Equipment>[] = [
  { field: "serialNo", headerName: "S/N", pinned: "left", width: 140, cellRenderer: MonoCellRenderer },
  { field: "model", headerName: "모델", width: 130 },
  { field: "customer", headerName: "고객사", width: 130 },
  { field: "site", headerName: "설치현장", width: 130 },
  { field: "region", headerName: "권역", width: 90 },
  { field: "status", headerName: "상태", width: 110, cellRenderer: StatusCellRenderer },
  { field: "slaTier", headerName: "SLA 등급", width: 100 },
  { field: "serviceability", headerName: "서비스 가능", width: 130, cellRenderer: ServiceabilityCellRenderer },
  { field: "tubeLifePct", headerName: "튜브 수명", width: 150, cellRenderer: LifeBarCellRenderer },
  { field: "detectorLifePct", headerName: "디텍터 수명", width: 150, cellRenderer: LifeBarCellRenderer },
  { field: "firmwareVersion", headerName: "펌웨어", width: 100 },
  { field: "installDate", headerName: "설치일", width: 110 },
  { field: "lastTelemetryAt", headerName: "최근 수신", width: 150 },
  {
    colId: "remoteActions",
    headerName: "원격",
    pinned: "right",
    width: 200,
    minWidth: 88,
    sortable: false,
    filter: false,
    suppressSizeToFit: true,
    cellClass: "tv-cell-remote-actions",
    cellRenderer: EquipmentRemoteActionsCellRenderer,
  },
];

export const alarmColDefs: ColDef<Alarm>[] = [
  { field: "id", headerName: "알람 ID", pinned: "left", width: 100, cellRenderer: MonoCellRenderer },
  { field: "equipmentSn", headerName: "장비 S/N", width: 140, cellRenderer: MonoCellRenderer },
  { field: "ruleName", headerName: "룰", width: 160 },
  { field: "message", headerName: "메시지", flex: 1, minWidth: 220 },
  { field: "severity", headerName: "심각도", width: 100, cellRenderer: SeverityCellRenderer },
  { field: "acknowledged", headerName: "확인", width: 80, valueFormatter: (p) => (p.value ? "Y" : "N") },
  { field: "remoteAttempted", headerName: "원격 시도", width: 90, valueFormatter: (p) => (p.value ? "Y" : "N") },
  { field: "remoteResult", headerName: "원격 결과", width: 110 },
  { field: "ticketId", headerName: "티켓", width: 140, cellRenderer: MonoCellRenderer },
  { field: "triggeredAt", headerName: "발생 시각", width: 150 },
  {
    colId: "relatedLogs",
    headerName: "연관 로그",
    width: 200,
    sortable: false,
    cellRenderer: AlarmRelatedLogsCellRenderer,
  },
];

export const alarmRuleColDefs: ColDef<AlarmRule>[] = [
  { field: "name", headerName: "룰명", pinned: "left", flex: 1, minWidth: 180 },
  { field: "target", headerName: "대상", width: 100, cellRenderer: StatusCellRenderer },
  { field: "condition", headerName: "조건식", flex: 1, minWidth: 200, cellClass: "tv-cell-mono" },
  { field: "severity", headerName: "심각도", width: 100, cellRenderer: SeverityCellRenderer },
  { field: "notifyChannels", headerName: "알림 채널", width: 170, valueFormatter: (p) => (p.value as string[])?.join(", ") },
  { field: "triggerRemote", headerName: "원격", width: 72, cellClass: "tv-cell-center", cellRenderer: BoolCellRenderer },
  { field: "triggerTicket", headerName: "티켓", width: 72, cellClass: "tv-cell-center", cellRenderer: BoolCellRenderer },
  { field: "enabled", headerName: "활성", width: 72, cellClass: "tv-cell-center", cellRenderer: BoolCellRenderer },
];

export const serviceTicketColDefs: ColDef<ServiceTicket>[] = [
  { field: "id", headerName: "티켓 ID", pinned: "left", width: 150, cellRenderer: MonoCellRenderer },
  { field: "equipmentSn", headerName: "장비", width: 140, cellRenderer: MonoCellRenderer },
  { field: "customer", headerName: "고객사", width: 120 },
  { field: "site", headerName: "현장", width: 120 },
  { field: "symptom", headerName: "증상", flex: 1, minWidth: 220 },
  { field: "severity", headerName: "심각도", width: 100, cellRenderer: SeverityCellRenderer },
  { field: "slaTier", headerName: "SLA", width: 100, cellRenderer: SlaBreachedCellRenderer },
  { field: "serviceability", headerName: "서비스 가능", width: 130, cellRenderer: ServiceabilityCellRenderer },
  { field: "stage", headerName: "단계", width: 90, cellRenderer: StatusCellRenderer },
  { field: "engineerName", headerName: "담당 엔지니어", width: 120 },
  { field: "createdAt", headerName: "발행", width: 150 },
  { field: "slaDeadline", headerName: "SLA 마감", width: 150 },
];

export const partOrderColDefs: ColDef<PartOrder>[] = [
  { field: "id", headerName: "요청 ID", pinned: "left", width: 140, cellRenderer: MonoCellRenderer },
  { field: "ticketId", headerName: "티켓", width: 150 },
  { field: "equipmentSn", headerName: "장비", width: 140 },
  { field: "partNo", headerName: "부품번호", width: 120, cellRenderer: MonoCellRenderer },
  { field: "partName", headerName: "부품명", flex: 1, minWidth: 160 },
  { field: "qty", headerName: "수량", width: 80 },
  { field: "status", headerName: "상태", width: 100, cellRenderer: StatusCellRenderer },
  { field: "plannedShipDate", headerName: "출하예정", width: 110 },
  { field: "plannedDeliveryDate", headerName: "배송예정", width: 110 },
  { field: "carrier", headerName: "운송사", width: 110 },
  { field: "trackingNo", headerName: "송장번호", width: 140 },
  { field: "requestedAt", headerName: "요청일", width: 150 },
];

export const partScheduleColDefs: ColDef<import("@/lib/grid/types").PartScheduleRow>[] = [
  { field: "orderId", headerName: "발주 ID", pinned: "left", width: 130, cellRenderer: MonoCellRenderer },
  { field: "ticketId", headerName: "티켓", width: 150, cellRenderer: MonoCellRenderer },
  { field: "equipmentSn", headerName: "장비 S/N", width: 140, cellRenderer: MonoCellRenderer },
  { field: "customer", headerName: "고객사", width: 120 },
  { field: "site", headerName: "현장", width: 120 },
  { field: "partName", headerName: "부품", flex: 1, minWidth: 140 },
  { field: "eta", headerName: "배송 ETA", width: 110 },
  { field: "visitPlannedAt", headerName: "방문 예정", width: 110 },
  { field: "engineerName", headerName: "담당 기사", width: 100 },
  { field: "delayDays", headerName: "지연(일)", width: 80, valueFormatter: (p) => (Number(p.value) > 0 ? `${p.value}일` : "—") },
  { field: "podStatus", headerName: "진행", width: 100, cellRenderer: StatusCellRenderer },
  { field: "carrier", headerName: "운송사", width: 100 },
  { field: "trackingNo", headerName: "송장", width: 130 },
];

export const installationColDefs: ColDef<Installation>[] = [
  { field: "orderRef", headerName: "수주 Ref", pinned: "left", width: 130 },
  { field: "equipmentSn", headerName: "S/N", width: 140, cellRenderer: MonoCellRenderer },
  { field: "model", headerName: "모델", width: 130 },
  { field: "customer", headerName: "고객사", width: 120 },
  { field: "site", headerName: "설치현장", width: 130 },
  { field: "plannedInstallDate", headerName: "설치 예정", width: 110 },
  { field: "actualInstallDate", headerName: "설치 실적", width: 110 },
  { field: "status", headerName: "상태", width: 100, cellRenderer: StatusCellRenderer },
  { field: "iotRegistered", headerName: "IoT 등록", width: 100, cellRenderer: BoolCellRenderer, valueFormatter: (p) => (p.value ? "완료" : "대기") },
];

export const asRecordColDefs: ColDef<AsRecord>[] = [
  { field: "id", headerName: "AS ID", pinned: "left", width: 90 },
  { field: "ticketId", headerName: "티켓", width: 150 },
  { field: "equipmentSn", headerName: "장비", width: 140 },
  { field: "customer", headerName: "고객사", width: 120 },
  { field: "workSummary", headerName: "작업 내용", flex: 1, minWidth: 200 },
  { field: "replacedParts", headerName: "교체 부품", width: 160, valueFormatter: (p) => (p.value as string[])?.join(", ") || "—" },
  { field: "satisfaction", headerName: "만족도", width: 90 },
  { field: "recurrence", headerName: "재발", width: 80, valueFormatter: (p) => (p.value ? "Y" : "N") },
  { field: "normalRestored", headerName: "운영 복귀", width: 100, cellRenderer: BoolCellRenderer, valueFormatter: (p) => (p.value ? "Y" : "N") },
  { field: "completedAt", headerName: "완료일", width: 150 },
];

export const customerColDefs: ColDef<Customer>[] = [
  { field: "name", headerName: "명칭", pinned: "left", flex: 1, minWidth: 140 },
  { field: "type", headerName: "유형", width: 100 },
  { field: "region", headerName: "권역", width: 100 },
  { field: "registeredAt", headerName: "등록일", width: 110 },
  { field: "siteCount", headerName: "현장 수", width: 90 },
  { field: "equipmentCount", headerName: "장비 수", width: 90 },
  { field: "contractTier", headerName: "계약 SLA", width: 110 },
];

export const siteColDefs: ColDef<Site>[] = [
  { field: "customerName", headerName: "고객사", pinned: "left", width: 130 },
  { field: "name", headerName: "현장명", flex: 1, minWidth: 140 },
  { field: "address", headerName: "주소", flex: 1, minWidth: 160 },
  { field: "region", headerName: "권역", width: 90 },
  { field: "installedAt", headerName: "설치일", width: 110 },
  { field: "equipmentCount", headerName: "장비 수", width: 90 },
];

export const pipelineColDefs: ColDef<PipelineStatus>[] = [
  { field: "tier", headerName: "Tier", pinned: "left", width: 90 },
  { field: "store", headerName: "저장소", width: 160 },
  { field: "retention", headerName: "보존 기간", width: 110 },
  { field: "recordCount", headerName: "레코드 수", width: 130, valueFormatter: (p) => Number(p.value).toLocaleString("ko-KR") },
  { field: "lagMs", headerName: "적재 지연(ms)", width: 120 },
  { field: "status", headerName: "상태", width: 100, cellRenderer: StatusCellRenderer },
];

export const yieldColDefs: ColDef<YieldRecord>[] = [
  { field: "lotNo", headerName: "LOT", pinned: "left", width: 150, cellRenderer: MonoCellRenderer },
  { field: "serialNo", headerName: "시리얼", width: 120 },
  { field: "equipmentSn", headerName: "장비 S/N", width: 140 },
  { field: "yieldPct", headerName: "수율%", width: 100, cellRenderer: YieldCellRenderer },
  { field: "algorithmVersion", headerName: "알고리즘", width: 110 },
  { field: "inspectedAt", headerName: "검사 시각", width: 150 },
];

export const reportColDefs: ColDef<ReportSummary>[] = [
  { field: "name", headerName: "리포트명", pinned: "left", flex: 1, minWidth: 180 },
  { field: "category", headerName: "카테고리", width: 100 },
  { field: "recordCount", headerName: "레코드", width: 110, valueFormatter: (p) => Number(p.value).toLocaleString("ko-KR") },
  { field: "lastGenerated", headerName: "최종 생성", width: 120 },
];

export const userColDefs: ColDef<UserAccount>[] = [
  { field: "name", headerName: "이름", pinned: "left", width: 100 },
  { field: "email", headerName: "이메일", flex: 1, minWidth: 180 },
  { field: "role", headerName: "역할", width: 130 },
  { field: "region", headerName: "권역", width: 90 },
  { field: "mfaEnabled", headerName: "MFA", width: 80, cellRenderer: BoolCellRenderer, valueFormatter: (p) => (p.value ? "Y" : "N") },
  { field: "active", headerName: "상태", width: 90, cellRenderer: BoolCellRenderer, valueFormatter: (p) => (p.value ? "active" : "offline") },
];

export const menuPermColDefs: ColDef<MenuPermission>[] = [
  { field: "groupLabel", headerName: "그룹", pinned: "left", width: 112 },
  { field: "lifecyclePhase", headerName: "수집 단계", width: 132 },
  { field: "menuName", headerName: "메뉴", pinned: "left", flex: 1, minWidth: 148 },
  { field: "menuId", headerName: "메뉴 ID", width: 156, cellClass: "tv-cell-mono" },
  { field: "dataScope", headerName: "데이터", width: 72 },
  { field: "storageTier", headerName: "Tier", width: 64 },
  { field: "admin", headerName: "관리자", width: 90, cellClass: "tv-cell-center", cellRenderer: BoolCellRenderer },
  { field: "engineer", headerName: "엔지니어", width: 90, cellClass: "tv-cell-center", cellRenderer: BoolCellRenderer },
  { field: "cs", headerName: "상담·CS", width: 90, cellClass: "tv-cell-center", cellRenderer: BoolCellRenderer },
  { field: "customer", headerName: "고객사", width: 90, cellClass: "tv-cell-center", cellRenderer: BoolCellRenderer },
];

export const menuActionPermColDefs: ColDef<MenuActionPermRow>[] = [
  { field: "groupLabel", headerName: "그룹", pinned: "left", width: 112 },
  { field: "lifecyclePhase", headerName: "수집 단계", width: 132 },
  { field: "menuName", headerName: "메뉴", pinned: "left", width: 148 },
  { field: "menuId", headerName: "메뉴 ID", width: 168, cellClass: "tv-cell-mono" },
  { field: "actionLabel", headerName: "기능", width: 72 },
  { field: "admin", headerName: "관리자", width: 88, cellClass: "tv-cell-center", cellRenderer: BoolCellRenderer },
  { field: "engineer", headerName: "엔지니어", width: 88, cellClass: "tv-cell-center", cellRenderer: BoolCellRenderer },
  { field: "cs", headerName: "상담·CS", width: 88, cellClass: "tv-cell-center", cellRenderer: BoolCellRenderer },
  { field: "customer", headerName: "고객사", width: 88, cellClass: "tv-cell-center", cellRenderer: BoolCellRenderer },
];

export const telemetryColDefs: ColDef<TelemetryRow>[] = [
  { field: "serialNo", headerName: "S/N", pinned: "left", width: 140, cellRenderer: MonoCellRenderer },
  { field: "tubeKv", headerName: "kV", width: 80 },
  { field: "tubeMa", headerName: "mA", width: 80 },
  { field: "tubeSec", headerName: "s", width: 70 },
  { field: "detectorTemp", headerName: "디텍터°C", width: 100 },
  { field: "bodyTemp", headerName: "본체°C", width: 90 },
  { field: "uptimeHours", headerName: "가동(h)", width: 100, valueFormatter: (p) => Number(p.value).toLocaleString("ko-KR") },
  { field: "yieldPct", headerName: "수율%", width: 90, cellRenderer: YieldCellRenderer },
  { field: "status", headerName: "상태", width: 110, cellRenderer: StatusCellRenderer },
  { field: "receivedAt", headerName: "수신 시각", width: 150 },
];

export const collectionColDefs: ColDef<CollectionRow>[] = [
  { field: "serialNo", headerName: "S/N", pinned: "left", width: 140, cellRenderer: MonoCellRenderer },
  { field: "model", headerName: "모델", width: 130 },
  { field: "status", headerName: "연결", width: 110, cellRenderer: StatusCellRenderer },
  { field: "tubeRx", headerName: "튜브 수신", width: 90 },
  { field: "detectorRx", headerName: "디텍터 수신", width: 100 },
  { field: "bodyRx", headerName: "본체 수신", width: 90 },
  { field: "region", headerName: "권역", width: 90 },
  { field: "lastTelemetryAt", headerName: "마지막 수신", flex: 1, minWidth: 150 },
];

export const consumableColDefs: ColDef<ConsumableRow>[] = [
  { field: "serialNo", headerName: "장비 S/N", pinned: "left", width: 140, cellRenderer: MonoCellRenderer },
  { field: "model", headerName: "모델", width: 130 },
  { field: "customer", headerName: "고객사", width: 120 },
  { field: "tubeLifePct", headerName: "튜브 잔여", width: 150, cellRenderer: LifeBarCellRenderer },
  { field: "detectorLifePct", headerName: "디텍터 잔여", width: 150, cellRenderer: LifeBarCellRenderer },
];

export const slaEquipmentColDefs: ColDef<SlaEquipmentRow>[] = [
  { field: "serialNo", headerName: "S/N", pinned: "left", width: 140, cellRenderer: MonoCellRenderer },
  { field: "customer", headerName: "고객사", width: 120 },
  { field: "slaTier", headerName: "SLA 등급", width: 100 },
  { field: "serviceability", headerName: "서비스 가능 수준", width: 150, cellRenderer: ServiceabilityCellRenderer },
  { field: "partsAvail", headerName: "부품 가용", width: 100 },
  { field: "engineerAvail", headerName: "엔지니어", width: 100 },
  { field: "remoteOk", headerName: "원격 가능", width: 100 },
];

export const iotThingColDefs: ColDef<IotThingRow>[] = [
  { field: "sn", headerName: "장비 S/N", pinned: "left", width: 140, cellRenderer: MonoCellRenderer },
  { field: "thing", headerName: "Thing Name", width: 160, cellClass: "tv-cell-mono" },
  { field: "cert", headerName: "인증서", width: 140 },
  { field: "policy", headerName: "Policy", width: 140 },
  { field: "status", headerName: "연결", width: 110, cellRenderer: StatusCellRenderer },
  { field: "lastSeenAt", headerName: "마지막 수신", flex: 1, minWidth: 150 },
];

export const codeColDefs: ColDef<CodeRow>[] = [
  { field: "group", headerName: "코드그룹", pinned: "left", width: 140 },
  { field: "code", headerName: "코드", width: 120, cellRenderer: MonoCellRenderer },
  { field: "name", headerName: "코드명", flex: 1, minWidth: 140 },
  { field: "sort", headerName: "정렬", width: 80 },
];

export const algorithmColDefs: ColDef<AlgorithmRow>[] = [
  { field: "name", headerName: "알고리즘", pinned: "left", flex: 1, minWidth: 140 },
  { field: "version", headerName: "버전", width: 120 },
  { field: "threshold", headerName: "Threshold(%)", width: 110 },
  { field: "appliedEquipmentCount", headerName: "적용 장비", width: 100 },
  { field: "status", headerName: "상태", width: 100, cellRenderer: StatusCellRenderer },
];

export const firmwareColDefs: ColDef<FirmwareRow>[] = [
  { field: "serialNo", headerName: "S/N", pinned: "left", width: 140, cellRenderer: MonoCellRenderer },
  { field: "model", headerName: "모델", width: 120 },
  { field: "customer", headerName: "고객사", width: 120 },
  { field: "current", headerName: "현재 버전", width: 110 },
  { field: "target", headerName: "대상 버전", width: 110 },
  { field: "auto", headerName: "Auto", width: 80 },
  { field: "lastCheckAt", headerName: "마지막 확인", width: 150 },
];

export const notificationChannelColDefs: ColDef<NotificationChannel>[] = [
  { field: "name", headerName: "채널명", pinned: "left", flex: 1, minWidth: 140 },
  { field: "type", headerName: "유형", width: 100, cellRenderer: StatusCellRenderer },
  { field: "target", headerName: "대상", flex: 1, minWidth: 200, cellClass: "tv-cell-mono" },
  {
    field: "severityFilter",
    headerName: "심각도",
    width: 130,
    valueFormatter: (p) => (p.value as string[])?.join(", "),
  },
  { field: "recipients", headerName: "수신 대상", width: 150 },
  { field: "description", headerName: "설명", flex: 1, minWidth: 160 },
  { field: "enabled", headerName: "활성", width: 72, cellClass: "tv-cell-center", cellRenderer: BoolCellRenderer },
];

export const equipmentLogColDefs: ColDef<EquipmentLogEntry>[] = [
  { field: "occurredAt", headerName: "발생 시각", pinned: "left", width: 160 },
  { field: "category", headerName: "구분", width: 100, cellRenderer: LogCategoryCellRenderer },
  { field: "level", headerName: "레벨", width: 80, cellRenderer: LogLevelCellRenderer },
  { field: "source", headerName: "소스", width: 130, cellClass: "tv-cell-mono" },
  { field: "message", headerName: "메시지", flex: 1, minWidth: 220 },
  { field: "payload", headerName: "Payload", width: 200, cellRenderer: PayloadCellRenderer },
  { field: "traceId", headerName: "Trace", width: 120, cellRenderer: MonoCellRenderer },
];

/** 구분 탭 단일 조회 — category 컬럼 생략 */
export const equipmentLogCategoryColDefs: ColDef<EquipmentLogEntry>[] = [
  { field: "occurredAt", headerName: "발생 시각", pinned: "left", width: 160 },
  { field: "level", headerName: "레벨", width: 80, cellRenderer: LogLevelCellRenderer },
  { field: "source", headerName: "소스", width: 130, cellClass: "tv-cell-mono" },
  { field: "message", headerName: "메시지", flex: 1, minWidth: 220 },
  { field: "payload", headerName: "Payload", width: 200, cellRenderer: PayloadCellRenderer },
  { field: "traceId", headerName: "Trace", width: 120, cellRenderer: MonoCellRenderer },
];

export const metricLogColDefs: ColDef<MetricLogEntry>[] = [
  { field: "receivedAt", headerName: "수신 시각", pinned: "left", width: 160 },
  { field: "serialNo", headerName: "S/N", width: 140, cellRenderer: MonoCellRenderer },
  { field: "kind", headerName: "종류", width: 90, cellRenderer: MetricKindCellRenderer },
  { field: "metric", headerName: "메트릭", width: 150, cellClass: "tv-cell-mono" },
  { field: "value", headerName: "값", width: 90, cellRenderer: MonoCellRenderer },
  { field: "unit", headerName: "단위", width: 70 },
  { field: "previousValue", headerName: "이전값", width: 90 },
  { field: "edgePublished", headerName: "Edge", width: 90, cellRenderer: LiveDotCellRenderer, valueFormatter: (p) => (p.value ? "Y" : "N") },
];

const metricLogBaseColDefs: ColDef<MetricLogEntry>[] = [
  { field: "receivedAt", headerName: "수신 시각", pinned: "left", width: 160 },
  { field: "serialNo", headerName: "S/N", width: 140, cellRenderer: MonoCellRenderer },
  { field: "metric", headerName: "메트릭", width: 150, cellClass: "tv-cell-mono" },
  { field: "edgePublished", headerName: "Edge", width: 90, cellRenderer: LiveDotCellRenderer, valueFormatter: (p) => (p.value ? "Y" : "N") },
];

export const metricLogPeriodicColDefs: ColDef<MetricLogEntry>[] = [
  ...metricLogBaseColDefs.slice(0, 3),
  { field: "value", headerName: "측정값", width: 90, cellRenderer: MonoCellRenderer },
  { field: "unit", headerName: "단위", width: 70 },
  { field: "previousValue", headerName: "이전값", width: 90, cellRenderer: MonoCellRenderer },
  metricLogBaseColDefs[3],
];

export const metricLogEventColDefs: ColDef<MetricLogEntry>[] = [
  ...metricLogBaseColDefs.slice(0, 3),
  { field: "value", headerName: "이벤트/상태", flex: 1, minWidth: 140, cellRenderer: MonoCellRenderer },
  metricLogBaseColDefs[3],
];

export const metricLogFirmwareColDefs: ColDef<MetricLogEntry>[] = [
  ...metricLogBaseColDefs.slice(0, 3),
  { field: "value", headerName: "진행/버전", width: 120, cellRenderer: MonoCellRenderer },
  { field: "unit", headerName: "단위", width: 70 },
  metricLogBaseColDefs[3],
];

export const metricLogControlColDefs: ColDef<MetricLogEntry>[] = [
  ...metricLogBaseColDefs.slice(0, 3),
  { field: "value", headerName: "제어값", width: 110, cellRenderer: MonoCellRenderer },
  { field: "unit", headerName: "단위", width: 70 },
  metricLogBaseColDefs[3],
];

const COLUMN_SETS = {
  equipment: equipmentColDefs,
  alarm: alarmColDefs,
  alarmRule: alarmRuleColDefs,
  serviceTicket: serviceTicketColDefs,
  partOrder: partOrderColDefs,
  partSchedule: partScheduleColDefs,
  installation: installationColDefs,
  asRecord: asRecordColDefs,
  customer: customerColDefs,
  site: siteColDefs,
  pipeline: pipelineColDefs,
  yield: yieldColDefs,
  report: reportColDefs,
  user: userColDefs,
  menuPerm: menuPermColDefs,
  telemetry: telemetryColDefs,
  collection: collectionColDefs,
  consumable: consumableColDefs,
  slaEquipment: slaEquipmentColDefs,
  iotThing: iotThingColDefs,
  code: codeColDefs,
  algorithm: algorithmColDefs,
  firmware: firmwareColDefs,
  equipmentLog: equipmentLogColDefs,
  equipmentLogCategory: equipmentLogCategoryColDefs,
  metricLog: metricLogColDefs,
  metricLogPeriodic: metricLogPeriodicColDefs,
  metricLogEvent: metricLogEventColDefs,
  metricLogFirmware: metricLogFirmwareColDefs,
  metricLogControl: metricLogControlColDefs,
  notificationChannel: notificationChannelColDefs,
  menuActionPerm: menuActionPermColDefs,
} as const;

const LOCALIZABLE_FIELDS = new Set(["menuName", "groupLabel"]);

function isLocalizableText(value: unknown): value is { ko: string; en: string } {
  return (
    typeof value === "object" &&
    value !== null &&
    "ko" in value &&
    "en" in value &&
    typeof (value as { ko: unknown }).ko === "string"
  );
}

export function getColumnDefs(
  set: GridColumnSet,
  language: AppLanguage = "ko",
  timeZone = "Asia/Seoul",
  viewport: GridViewport = "full",
): ColDef[] {
  const baseDefs = COLUMN_SETS[set] as ColDef[];
  const defs = filterColumnsByViewport(baseDefs, set, viewport);
  return defs.map((col) => {
    const next: ColDef = {
      ...col,
      headerName: localizeGridHeader(col.headerName, language) ?? col.headerName,
    };
    if (col.field && LOCALIZABLE_FIELDS.has(col.field)) {
      next.valueFormatter = (params) =>
        isLocalizableText(params.value) ? localeLabel(params.value, language) : String(params.value ?? "");
    }
    if (set === "menuActionPerm" && col.field === "actionLabel") {
      next.valueFormatter = (params) =>
        params.data?.action
          ? localizeActionLabel(params.data.action as string, language)
          : String(params.value ?? "");
    }
    if (col.field) {
      const preset = gridDatePreset(col.field);
      if (preset) {
        next.valueFormatter = (params) =>
          formatLocaleDateTime(String(params.value ?? ""), { language, timeZone, preset });
      }
    }
    if (col.field === "role") {
      next.valueFormatter = (params) => localizeDomainValue(String(params.value ?? ""), language);
    }
    if (col.field === "active" && set === "user") {
      next.valueFormatter = (params) =>
        params.value
          ? localizeDomainValue("active", language)
          : localizeDomainValue("inactive", language);
    }
    if (col.colId === "remoteActions") {
      if (viewport === "minimal") {
        next.width = 88;
        next.minWidth = 80;
        next.pinned = "right";
      } else if (viewport === "compact") {
        next.width = 96;
        next.minWidth = 88;
        next.pinned = "right";
      }
    }
    return next;
  });
}
