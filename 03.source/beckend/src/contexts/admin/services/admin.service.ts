/**
 * @file admin.service.ts
 * @description 관리(사용자·공통코드) 도메인 비즈니스 로직.
 *              User/CommonCode CRUD — 삭제는 is_use=false 소프트 삭제.
 */
import { Injectable, NotFoundException } from '@nestjs/common';
import { batchMeta, mapCommonCode, mapUser, wrapData } from '../../../common/mappers';
import { AdminUserDao, CommonCodeDao } from '../dao/admin.dao';
import type { UserRow } from '../../../common/types/db/postgres-rows';
import type {
  CreateCommonCodeDto,
  CreateUserDto,
  UpdateCommonCodeDto,
  UpdateUserDto,
} from '../dto/admin-crud.dto';

/**
 * 관리(사용자·공통코드) CRUD 서비스.
 * AdminUserDao·CommonCodeDao를 통해 PostgreSQL user/common_code 테이블에 접근한다.
 */
@Injectable()
export class AdminService {
  constructor(
    private readonly userDao: AdminUserDao,
    private readonly codeDao: CommonCodeDao,
  ) {}

  /** 활성 사용자 목록 조회. GET /api/admin/users */
  async listUsers() {
    const rows = await this.userDao.findActiveUsers();
    return wrapData({ items: rows.map((r) => mapUser(r as UserRow)) }, batchMeta('postgres.user'));
  }

  /** 사용자 단건 조회. GET /api/admin/users/:id — 비활성(is_use=false)이면 404 */
  async getUser(id: number) {
    const row = await this.userDao.findById(id);
    if (!row || !row.is_use) throw new NotFoundException(`User ${id} not found`);
    return wrapData(mapUser(row as UserRow), batchMeta('postgres.user'));
  }

  /** 사용자 생성. POST /api/admin/users — is_use=true, account_status=active */
  async createUser(dto: CreateUserDto) {
    const row = await this.userDao.createRow({ ...dto, is_use: true, account_status: 'active' });
    return wrapData(mapUser(row as UserRow), batchMeta('postgres.user'));
  }

  /** 사용자 수정. PUT /api/admin/users/:id */
  async updateUser(id: number, dto: UpdateUserDto) {
    await this.userDao.updateRow(id, dto);
    return this.getUser(id);
  }

  /**
   * 사용자 삭제 (소프트 삭제).
   * DELETE /api/admin/users/:id — is_use=false 로 비활성화.
   */
  async deleteUser(id: number) {
    await this.userDao.updateRow(id, { is_use: false });
    return { deleted: true, id: String(id) };
  }

  /** 활성 공통코드(서브코드) 목록 조회. GET /api/admin/codes */
  async listCommonCodes() {
    const rows = await this.codeDao.findActiveSubCodes();
    return wrapData({ items: rows.map(mapCommonCode) }, batchMeta('postgres.common_code'));
  }

  /** 특정 그룹(main_code) 공통코드 목록 조회. GET /api/admin/codes?group=EQST */
  async listCommonCodesByGroup(group: string) {
    const rows = await this.codeDao.findByGroup(group);
    return wrapData({ items: rows.map(mapCommonCode) }, batchMeta('postgres.common_code'));
  }

  /** 공통코드 단건 조회. GET /api/admin/codes/:id */
  async getCommonCode(id: number) {
    const row = await this.codeDao.findById(id);
    if (!row) throw new NotFoundException(`Common code ${id} not found`);
    return wrapData(mapCommonCode(row), batchMeta('postgres.common_code'));
  }

  /** 공통코드 생성. POST /api/admin/codes — is_use=true, order_seq 기본 0 */
  async createCommonCode(dto: CreateCommonCodeDto) {
    const row = await this.codeDao.createRow({ ...dto, is_use: true, order_seq: dto.order_seq ?? 0 });
    return wrapData(mapCommonCode(row), batchMeta('postgres.common_code'));
  }

  /** 공통코드 수정. PUT /api/admin/codes/:id */
  async updateCommonCode(id: number, dto: UpdateCommonCodeDto) {
    await this.codeDao.updateRow(id, dto);
    return this.getCommonCode(id);
  }

  /**
   * 공통코드 삭제 (소프트 삭제).
   * DELETE /api/admin/codes/:id — is_use=false 로 비활성화.
   */
  async deleteCommonCode(id: number) {
    await this.codeDao.updateRow(id, { is_use: false });
    return { deleted: true, id: String(id) };
  }
}
