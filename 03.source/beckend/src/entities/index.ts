/**
 * TypeORM 엔티티 중앙 레지스트리.
 *
 * NestJS `TypeOrmModule.forRoot({ entities })` 및 컨텍스트별 `forFeature`에서
 * 이 모듈의 `TYPEORM_ENTITIES` 배열을 단일 진입점으로 사용한다.
 *
 * 도메인별 엔티티 그룹:
 * - device: 단말 마스터
 * - alarm: 통신 알람 인시던트
 * - identity: 사용자 계정
 * - organization: 회사·지점·현장 계층
 * - catalog: 제품·펌웨어·IoT Thing
 * - admin: 공통 코드
 * - service: 서비스 티켓·엔지니어·AS·SLA
 * - parts: 부품 주문·교체 예정
 * - installation: 장비 설치 이력
 * - settings: 알림 채널 설정
 * - inspection: 수율 검사·알고리즘 설정
 * - reports: 리포트 정의
 * - remote: 원격 진단 소견
 * - pipeline: 컬렉션 일별 통계
 * - dashboard: 대시보드 알람 일별 집계
 * - equipment-log: 장비 로그 카테고리별 테이블
 */
import { DeviceEntity } from '../contexts/device/entities/device.entity';
import { CommunicationAlarmIncidentEntity } from '../contexts/alarm/entities/communication-alarm-incident.entity';
import { UserEntity } from '../contexts/identity/entities/user.entity';
import {
  CompanyEntity,
  BranchEntity,
  SiteEntity,
} from '../contexts/organization/entities/organization.entities';
import {
  ProductEntity,
  FirmwareEntity,
  IotThingRegistryEntity,
} from '../contexts/catalog/entities/catalog.entities';
import { CommonCodeEntity } from '../contexts/admin/entities/common-code.entity';
import {
  ServiceTicketEntity,
  EngineerProfileEntity,
  AsRecordEntity,
  SlaFleetSnapshotEntity,
  SlaContractDefinitionEntity,
} from '../contexts/service/entities/service.entities';
import { PartsOrderEntity, PartsScheduleEntity } from '../contexts/parts/entities/parts.entities';
import { InstallationEntity } from '../contexts/installation/entities/installation.entity';
import { NotificationChannelSettingEntity } from '../contexts/settings/entities/notification-channel-setting.entity';
import {
  YieldInspectionRecordEntity,
  AlgorithmConfigEntity,
} from '../contexts/inspection/entities/inspection.entities';
import { ReportDefinitionEntity } from '../contexts/reports/entities/report-definition.entity';
import { RemoteDiagnosisFindingEntity } from '../contexts/remote/entities/remote-diagnosis-finding.entity';
import { CollectionDailyStatsEntity } from '../contexts/pipeline/entities/collection-daily-stats.entity';
import { DashboardAlarmDailyEntity } from '../contexts/dashboard/entities/dashboard-alarm-daily.entity';
import {
  EquipmentLogTubeEntity,
  EquipmentLogDetectorEntity,
  EquipmentLogBodyEntity,
  EquipmentLogControlEntity,
  EquipmentLogFirmwareEntity,
  EquipmentLogAuditEntity,
} from '../contexts/equipment-log/entities/equipment-log.entities';

export {
  DeviceEntity,
  CommunicationAlarmIncidentEntity,
  UserEntity,
  CompanyEntity,
  BranchEntity,
  SiteEntity,
  ProductEntity,
  FirmwareEntity,
  IotThingRegistryEntity,
  CommonCodeEntity,
  ServiceTicketEntity,
  EngineerProfileEntity,
  AsRecordEntity,
  SlaFleetSnapshotEntity,
  SlaContractDefinitionEntity,
  PartsOrderEntity,
  PartsScheduleEntity,
  InstallationEntity,
  NotificationChannelSettingEntity,
  YieldInspectionRecordEntity,
  AlgorithmConfigEntity,
  ReportDefinitionEntity,
  RemoteDiagnosisFindingEntity,
  CollectionDailyStatsEntity,
  DashboardAlarmDailyEntity,
  EquipmentLogTubeEntity,
  EquipmentLogDetectorEntity,
  EquipmentLogBodyEntity,
  EquipmentLogControlEntity,
  EquipmentLogFirmwareEntity,
  EquipmentLogAuditEntity,
};

/** TypeORM `forRoot({ entities })` 진입점 — 도메인 순서와 동일 */
export const TYPEORM_ENTITIES = [
  // device
  DeviceEntity,
  // alarm
  CommunicationAlarmIncidentEntity,
  // identity
  UserEntity,
  // organization
  CompanyEntity,
  BranchEntity,
  SiteEntity,
  // catalog
  ProductEntity,
  FirmwareEntity,
  IotThingRegistryEntity,
  // admin
  CommonCodeEntity,
  // service
  ServiceTicketEntity,
  EngineerProfileEntity,
  AsRecordEntity,
  SlaFleetSnapshotEntity,
  SlaContractDefinitionEntity,
  // parts
  PartsOrderEntity,
  PartsScheduleEntity,
  // installation
  InstallationEntity,
  // settings
  NotificationChannelSettingEntity,
  // inspection
  YieldInspectionRecordEntity,
  AlgorithmConfigEntity,
  // reports
  ReportDefinitionEntity,
  // remote
  RemoteDiagnosisFindingEntity,
  // pipeline
  CollectionDailyStatsEntity,
  // dashboard
  DashboardAlarmDailyEntity,
  // equipment-log
  EquipmentLogTubeEntity,
  EquipmentLogDetectorEntity,
  EquipmentLogBodyEntity,
  EquipmentLogControlEntity,
  EquipmentLogFirmwareEntity,
  EquipmentLogAuditEntity,
];
