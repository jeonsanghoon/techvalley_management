/**
 * @file parts.controller.ts
 * @description 부품 REST API. prefix `api/parts`.
 * @routes
 *   - GET/POST/PUT/DELETE /api/parts/orders, /api/parts/orders/:id
 *   - GET/POST/PUT/DELETE /api/parts/schedules, /api/parts/schedules/:id
 */
import { Controller, Delete, Get, Param, Post, Put, Body } from '@nestjs/common';
import { PartsService } from '../services/parts.service';
import {
  CreatePartsOrderDto,
  CreatePartsScheduleDto,
  UpdatePartsOrderDto,
  UpdatePartsScheduleDto,
} from '../dto/parts-crud.dto';

/** 부품 주문·일정 CRUD HTTP 엔드포인트 그룹. */
@Controller('parts')
export class PartsController {
  constructor(private readonly service: PartsService) {}

  /** GET /api/parts/orders — 부품 주문 목록 */
  @Get('orders')
  orders() {
    return this.service.listOrders();
  }

  /** GET /api/parts/orders/:id — 부품 주문 단건 */
  @Get('orders/:id')
  order(@Param('id') id: string) {
    return this.service.getOrder(id);
  }

  /** POST /api/parts/orders — 부품 주문 생성 */
  @Post('orders')
  createOrder(@Body() dto: CreatePartsOrderDto) {
    return this.service.createOrder(dto);
  }

  /** PUT /api/parts/orders/:id — 부품 주문 수정 */
  @Put('orders/:id')
  updateOrder(@Param('id') id: string, @Body() dto: UpdatePartsOrderDto) {
    return this.service.updateOrder(id, dto);
  }

  /** DELETE /api/parts/orders/:id — 부품 주문 하드 삭제 */
  @Delete('orders/:id')
  deleteOrder(@Param('id') id: string) {
    return this.service.deleteOrder(id);
  }

  /** GET /api/parts/schedules — 교체 일정 목록 */
  @Get('schedules')
  schedules() {
    return this.service.listSchedules();
  }

  /** GET /api/parts/schedules/:id — 교체 일정 단건 */
  @Get('schedules/:id')
  schedule(@Param('id') id: string) {
    return this.service.getSchedule(id);
  }

  /** POST /api/parts/schedules — 교체 일정 생성 */
  @Post('schedules')
  createSchedule(@Body() dto: CreatePartsScheduleDto) {
    return this.service.createSchedule(dto);
  }

  /** PUT /api/parts/schedules/:id — 교체 일정 수정 */
  @Put('schedules/:id')
  updateSchedule(@Param('id') id: string, @Body() dto: UpdatePartsScheduleDto) {
    return this.service.updateSchedule(id, dto);
  }

  /** DELETE /api/parts/schedules/:id — 교체 일정 하드 삭제 */
  @Delete('schedules/:id')
  deleteSchedule(@Param('id') id: string) {
    return this.service.deleteSchedule(id);
  }
}
