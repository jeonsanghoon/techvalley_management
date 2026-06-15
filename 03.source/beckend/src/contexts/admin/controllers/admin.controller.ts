/**
 * @file admin.controller.ts
 * @description 관리 REST API 컨트롤러. 전역 prefix `api`, 컨트롤러 prefix `admin`.
 * @routes
 *   - GET/POST/PUT/DELETE /api/admin/users, /api/admin/users/:id
 *   - GET/POST/PUT/DELETE /api/admin/codes, /api/admin/codes/:id
 */
import { Controller, Delete, Get, Param, Post, Put, Body, ParseIntPipe, Query } from '@nestjs/common';
import { AdminService } from '../services/admin.service';
import {
  CreateCommonCodeDto,
  CreateUserDto,
  UpdateCommonCodeDto,
  UpdateUserDto,
} from '../dto/admin-crud.dto';

/** 관리(사용자·공통코드) CRUD HTTP 엔드포인트 그룹. */
@Controller('admin')
export class AdminController {
  constructor(private readonly service: AdminService) {}

  /** GET /api/admin/users — 사용자 목록 */
  @Get('users')
  users() {
    return this.service.listUsers();
  }

  /** GET /api/admin/users/:id — 사용자 단건 */
  @Get('users/:id')
  user(@Param('id', ParseIntPipe) id: number) {
    return this.service.getUser(id);
  }

  /** POST /api/admin/users — 사용자 생성 */
  @Post('users')
  createUser(@Body() dto: CreateUserDto) {
    return this.service.createUser(dto);
  }

  /** PUT /api/admin/users/:id — 사용자 수정 */
  @Put('users/:id')
  updateUser(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUserDto) {
    return this.service.updateUser(id, dto);
  }

  /** DELETE /api/admin/users/:id — 사용자 소프트 삭제 */
  @Delete('users/:id')
  deleteUser(@Param('id', ParseIntPipe) id: number) {
    return this.service.deleteUser(id);
  }

  /** GET /api/admin/codes — 공통코드 목록 (group 쿼리 파라미터로 main_code 필터 가능) */
  @Get('codes')
  codes(@Query('group') group?: string) {
    if (group) return this.service.listCommonCodesByGroup(group);
    return this.service.listCommonCodes();
  }

  /** GET /api/admin/codes/:id — 공통코드 단건 */
  @Get('codes/:id')
  code(@Param('id', ParseIntPipe) id: number) {
    return this.service.getCommonCode(id);
  }

  /** POST /api/admin/codes — 공통코드 생성 */
  @Post('codes')
  createCode(@Body() dto: CreateCommonCodeDto) {
    return this.service.createCommonCode(dto);
  }

  /** PUT /api/admin/codes/:id — 공통코드 수정 */
  @Put('codes/:id')
  updateCode(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCommonCodeDto) {
    return this.service.updateCommonCode(id, dto);
  }

  /** DELETE /api/admin/codes/:id — 공통코드 소프트 삭제 */
  @Delete('codes/:id')
  deleteCode(@Param('id', ParseIntPipe) id: number) {
    return this.service.deleteCommonCode(id);
  }
}
