/**
 * @file service-desk.controller.ts
 * @description 서비스 데스크 REST API. prefix `api/service`.
 * @routes
 *   - GET/POST/PUT/DELETE /api/service/tickets, /api/service/tickets/:id
 *   - GET /api/service/engineers, /api/service/as-records
 */
import { Controller, Delete, Get, Param, Post, Put, Body } from '@nestjs/common';
import { ServiceDeskService } from '../services/service.service';
import { CreateServiceTicketDto, UpdateServiceTicketDto } from '../dto/service-crud.dto';

/** 서비스 데스크(티켓·엔지니어·AS) HTTP 엔드포인트 그룹. */
@Controller('service')
export class ServiceDeskController {
  constructor(private readonly service: ServiceDeskService) {}

  /** GET /api/service/tickets — 티켓 목록 */
  @Get('tickets')
  tickets() {
    return this.service.listTickets();
  }

  /** GET /api/service/tickets/:id — 티켓 단건 */
  @Get('tickets/:id')
  ticket(@Param('id') id: string) {
    return this.service.getTicket(id);
  }

  /** POST /api/service/tickets — 티켓 생성 */
  @Post('tickets')
  createTicket(@Body() dto: CreateServiceTicketDto) {
    return this.service.createTicket(dto);
  }

  /** PUT /api/service/tickets/:id — 티켓 수정 */
  @Put('tickets/:id')
  updateTicket(@Param('id') id: string, @Body() dto: UpdateServiceTicketDto) {
    return this.service.updateTicket(id, dto);
  }

  /** DELETE /api/service/tickets/:id — 티켓 하드 삭제 */
  @Delete('tickets/:id')
  deleteTicket(@Param('id') id: string) {
    return this.service.deleteTicket(id);
  }

  /** GET /api/service/engineers — 엔지니어 목록 */
  @Get('engineers')
  engineers() {
    return this.service.listEngineers();
  }

  /** GET /api/service/as-records — AS 기록 목록 */
  @Get('as-records')
  asRecords() {
    return this.service.listAsRecords();
  }
}
