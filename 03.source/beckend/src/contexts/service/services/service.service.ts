/**
 * @file service.service.ts
 * @description 서비스 데스크·SLA 도메인 비즈니스 로직.
 *              티켓·SLA 정의 CRUD — deleteRow 로 물리(하드) 삭제.
 */
import { Injectable, NotFoundException } from '@nestjs/common';
import {
  batchMeta,
  mapAsRecord,
  mapEngineer,
  mapServiceTicket,
  mapSlaDefinition,
  mapSlaSnapshot,
  wrapData,
} from '../../../common/mappers';
import type { ApiDataEnvelopeDto, ItemsDto } from '../../../common/dto/api-response.dto';
import { ServiceTicketDao, SlaDao } from '../dao/service.dao';
import type {
  AsRecordDto,
  EngineerDto,
  ServiceTicketDto,
  SlaDefinitionDto,
  SlaSnapshotDto,
} from '../dto/service.dto';
import type { CreateServiceTicketDto, UpdateServiceTicketDto } from '../dto/service-crud.dto';

/**
 * 서비스 데스크(티켓·엔지니어·AS 기록) 서비스.
 * ServiceTicketDao를 통해 service_ticket 등 PostgreSQL 테이블에 접근한다.
 */
@Injectable()
export class ServiceDeskService {
  constructor(private readonly dao: ServiceTicketDao) {}

  /** 서비스 티켓 목록 조회 (JOIN). GET /api/service/tickets */
  async listTickets(): Promise<ApiDataEnvelopeDto<ItemsDto<ServiceTicketDto>>> {
    const { rows } = await this.dao.findAllJoined();
    return wrapData(
      { items: rows.map(mapServiceTicket) },
      batchMeta('postgres.service_ticket'),
    );
  }

  /** 서비스 티켓 단건 조회. GET /api/service/tickets/:id */
  async getTicket(id: string): Promise<ApiDataEnvelopeDto<ServiceTicketDto>> {
    const { rows } = await this.dao.findOneJoined(id);
    const row = rows[0];
    if (!row) throw new NotFoundException(`Ticket ${id} not found`);
    return wrapData(mapServiceTicket(row), batchMeta('postgres.service_ticket'));
  }

  /** 서비스 티켓 생성. POST /api/service/tickets — 기본 status=open, priority=2 */
  async createTicket(dto: CreateServiceTicketDto) {
    const row = await this.dao.createRow({
      ...dto,
      opened_at: new Date(),
      ticket_status: dto.ticket_status ?? 'open',
      priority_type: dto.priority_type ?? 2,
      portal_meta: {},
    });
    const { rows } = await this.dao.findOneJoined(row.id);
    return wrapData(mapServiceTicket(rows[0]!), batchMeta('postgres.service_ticket'));
  }

  /** 서비스 티켓 수정. PUT /api/service/tickets/:id */
  async updateTicket(id: string, dto: UpdateServiceTicketDto) {
    await this.dao.updateRow(id, dto);
    return this.getTicket(id);
  }

  /**
   * 서비스 티켓 삭제 (하드 삭제).
   * DELETE /api/service/tickets/:id — DAO deleteRow 로 행 제거.
   */
  async deleteTicket(id: string) {
    await this.dao.deleteRow(id);
    return { deleted: true, id };
  }

  /** 담당 엔지니어 목록 (배정 건수 포함). GET /api/service/engineers */
  async listEngineers(): Promise<ApiDataEnvelopeDto<ItemsDto<EngineerDto>>> {
    const { rows } = await this.dao.findEngineersWithAssignments();
    return wrapData(
      { items: rows.map((r) => mapEngineer(r, r.assigned ?? 0)) },
      batchMeta('postgres.engineer_profile'),
    );
  }

  /** AS(애프터서비스) 기록 목록. GET /api/service/as-records */
  async listAsRecords(): Promise<ApiDataEnvelopeDto<ItemsDto<AsRecordDto>>> {
    const { rows } = await this.dao.findAsRecords();
    return wrapData({ items: rows.map(mapAsRecord) }, batchMeta('postgres.as_record'));
  }
}

/**
 * SLA(서비스 수준 계약) 스냅샷·정의 CRUD 서비스.
 * SlaDao를 통해 sla_fleet_snapshot·sla_contract_definition 테이블에 접근한다.
 */
@Injectable()
export class SlaService {
  constructor(private readonly dao: SlaDao) {}

  /** SLA 스냅샷 최근 24건. GET /api/sla/snapshots */
  async listSnapshots() {
    const { rows } = await this.dao.findSnapshots(24);
    return wrapData({ items: rows.map(mapSlaSnapshot) }, batchMeta('postgres.sla_fleet_snapshot'));
  }

  /** SLA 계약 정의 목록. GET /api/sla/definitions */
  async listDefinitions(): Promise<ApiDataEnvelopeDto<ItemsDto<SlaDefinitionDto>>> {
    const { rows } = await this.dao.findDefinitions();
    return wrapData({ items: rows.map(mapSlaDefinition) }, batchMeta('postgres.sla_contract_definition'));
  }

  /** SLA 계약 정의 단건. GET /api/sla/definitions/:id */
  async getDefinition(id: string) {
    const row = await this.dao.findDefinitionById(id);
    if (!row) throw new NotFoundException(`SLA definition ${id} not found`);
    return wrapData(row, batchMeta('postgres.sla_contract_definition'));
  }

  /** SLA 계약 정의 생성. POST /api/sla/definitions */
  async createDefinition(dto: {
    tier_code: string;
    tier_name: string;
    response_minutes: number;
    resolve_minutes: number;
    uptime_target_pct: string;
    description?: string;
  }) {
    const row = await this.dao.createDefinition(dto);
    return wrapData(row, batchMeta('postgres.sla_contract_definition'));
  }

  /** SLA 계약 정의 수정. PUT /api/sla/definitions/:id */
  async updateDefinition(id: string, dto: Partial<{
    tier_name: string;
    response_minutes: number;
    resolve_minutes: number;
    uptime_target_pct: string;
    description: string;
  }>) {
    const row = await this.dao.updateDefinition(id, dto);
    if (!row) throw new NotFoundException(`SLA definition ${id} not found`);
    return wrapData(row, batchMeta('postgres.sla_contract_definition'));
  }

  /**
   * SLA 계약 정의 삭제 (하드 삭제).
   * DELETE /api/sla/definitions/:id — DAO deleteDefinition.
   */
  async deleteDefinition(id: string) {
    await this.dao.deleteDefinition(id);
    return { deleted: true, id };
  }
}
