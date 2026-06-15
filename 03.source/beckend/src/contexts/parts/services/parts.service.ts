/**
 * @file parts.service.ts
 * @description 부품(주문·일정) 도메인 비즈니스 로직.
 *              PartsOrder/PartsSchedule CRUD — deleteRow 로 물리(하드) 삭제.
 */
import { Injectable, NotFoundException } from '@nestjs/common';
import { batchMeta, mapPartOrder, mapPartSchedule, wrapData } from '../../../common/mappers';
import { PartsOrderDao, PartsScheduleDao } from '../dao/parts.dao';
import type { PartsOrderRow, PartsScheduleRow } from '../../../common/types/db/postgres-rows';
import type {
  CreatePartsOrderDto,
  CreatePartsScheduleDto,
  UpdatePartsOrderDto,
  UpdatePartsScheduleDto,
} from '../dto/parts-crud.dto';

/**
 * 부품 주문·교체 일정 CRUD 서비스.
 * PartsOrderDao·PartsScheduleDao를 통해 parts_order/parts_schedule 테이블에 접근한다.
 */
@Injectable()
export class PartsService {
  constructor(
    private readonly orderDao: PartsOrderDao,
    private readonly scheduleDao: PartsScheduleDao,
  ) {}

  /** 부품 주문 목록 조회. GET /api/parts/orders */
  async listOrders() {
    const rows = await this.orderDao.findAllOrdered();
    return wrapData({ items: rows.map((r) => mapPartOrder(r as unknown as PartsOrderRow)) }, batchMeta('postgres.parts_order'));
  }

  /** 부품 주문 단건 조회. GET /api/parts/orders/:id */
  async getOrder(id: string) {
    const row = await this.orderDao.findById(id);
    if (!row) throw new NotFoundException(`Parts order ${id} not found`);
    return wrapData(mapPartOrder(row as unknown as PartsOrderRow), batchMeta('postgres.parts_order'));
  }

  /** 부품 주문 생성. POST /api/parts/orders — ordered_at=now, quantity 기본 1, status=requested */
  async createOrder(dto: CreatePartsOrderDto) {
    const row = await this.orderDao.createRow({
      ...dto,
      ordered_at: new Date(),
      quantity: dto.quantity ?? 1,
      order_status: dto.order_status ?? 'requested',
    });
    return wrapData(mapPartOrder(row as unknown as PartsOrderRow), batchMeta('postgres.parts_order'));
  }

  /** 부품 주문 수정. PUT /api/parts/orders/:id */
  async updateOrder(id: string, dto: UpdatePartsOrderDto) {
    await this.orderDao.updateRow(id, dto);
    return this.getOrder(id);
  }

  /**
   * 부품 주문 삭제 (하드 삭제).
   * DELETE /api/parts/orders/:id — DAO deleteRow.
   */
  async deleteOrder(id: string) {
    await this.orderDao.deleteRow(id);
    return { deleted: true, id };
  }

  /** 부품 교체 일정 목록 (JOIN). GET /api/parts/schedules */
  async listSchedules() {
    const { rows } = await this.scheduleDao.findSchedulesJoined();
    return wrapData({ items: rows.map((r) => mapPartSchedule(r as unknown as PartsScheduleRow)) }, batchMeta('postgres.parts_schedule'));
  }

  /** 부품 교체 일정 단건 조회. GET /api/parts/schedules/:id */
  async getSchedule(id: string) {
    const row = await this.scheduleDao.findById(id);
    if (!row) throw new NotFoundException(`Parts schedule ${id} not found`);
    return wrapData(mapPartSchedule(row as unknown as PartsScheduleRow), batchMeta('postgres.parts_schedule'));
  }

  /** 부품 교체 일정 생성. POST /api/parts/schedules — scheduled_at ISO 문자열 파싱 */
  async createSchedule(dto: CreatePartsScheduleDto) {
    const row = await this.scheduleDao.createRow({
      ...dto,
      scheduled_at: new Date(dto.scheduled_at),
      schedule_status: dto.schedule_status ?? 'planned',
    });
    return wrapData(mapPartSchedule(row as unknown as PartsScheduleRow), batchMeta('postgres.parts_schedule'));
  }

  /** 부품 교체 일정 수정. PUT /api/parts/schedules/:id — scheduled_at 있으면 Date 변환 */
  async updateSchedule(id: string, dto: UpdatePartsScheduleDto) {
    const patch: Record<string, unknown> = { ...dto };
    if (dto.scheduled_at) patch.scheduled_at = new Date(dto.scheduled_at);
    await this.scheduleDao.updateRow(id, patch);
    return this.getSchedule(id);
  }

  /**
   * 부품 교체 일정 삭제 (하드 삭제).
   * DELETE /api/parts/schedules/:id — DAO deleteRow.
   */
  async deleteSchedule(id: string) {
    await this.scheduleDao.deleteRow(id);
    return { deleted: true, id };
  }
}
