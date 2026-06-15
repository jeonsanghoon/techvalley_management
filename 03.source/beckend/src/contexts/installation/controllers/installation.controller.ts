/**
 * @file installation.controller.ts
 * @description 설치 REST API. prefix `api/installation`.
 * @routes GET/POST/PUT/DELETE /api/installation, /api/installation/:id
 */
import { Controller, Delete, Get, Param, Post, Put, Body } from '@nestjs/common';
import { InstallationService } from '../services/installation.service';
import { CreateInstallationDto, UpdateInstallationDto } from '../dto/installation-crud.dto';

/** 설치 이력 CRUD HTTP 엔드포인트 그룹. */
@Controller('installation')
export class InstallationController {
  constructor(private readonly service: InstallationService) {}

  /** GET /api/installation — 설치 이력 목록 */
  @Get()
  list() {
    return this.service.listAll();
  }

  /** GET /api/installation/:id — 설치 이력 단건 */
  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.service.getOne(id);
  }

  /** POST /api/installation — 설치 이력 생성 */
  @Post()
  create(@Body() dto: CreateInstallationDto) {
    return this.service.create(dto);
  }

  /** PUT /api/installation/:id — 설치 이력 수정 */
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateInstallationDto) {
    return this.service.update(id, dto);
  }

  /** DELETE /api/installation/:id — 설치 이력 하드 삭제 */
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }
}
