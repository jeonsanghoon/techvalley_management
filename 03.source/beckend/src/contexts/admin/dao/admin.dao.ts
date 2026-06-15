/**
 * @file admin.dao.ts
 * @description 관리(Admin) 도메인 — 공통코드·관리자 사용자 데이터 접근.
 *
 * **하이브리드 데이터 접근 패턴**
 * - 전 메서드 TypeORM 기반 (Repository / QueryBuilder)
 * - raw SQL 없음 — 단일 테이블 조회·필터
 *
 * {@link AdminDao}는 레거시 파사드이며, 신규 코드는 CommonCodeDao/AdminUserDao를 직접 주입한다.
 */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IntCrudDao } from '../../../common/repository/crud-dao.mixin';
import { CommonCodeEntity } from '../entities/common-code.entity';
import { UserEntity } from '../../identity/entities/user.entity';

/**
 * 공통코드 DAO.
 * - 엔티티: {@link CommonCodeEntity} | PK: `number` (INT) | CRUD: {@link IntCrudDao}
 */
@Injectable()
export class CommonCodeDao extends IntCrudDao<CommonCodeEntity> {
  constructor(
    @InjectRepository(CommonCodeEntity)
    repo: Repository<CommonCodeEntity>,
  ) {
    super(repo);
  }

  /** 활성 공통코드 전체 — main_code, order_seq 정렬. */
  findActiveCodes() {
    return this.repository.find({
      where: { is_use: true },
      order: { main_code: 'ASC', order_seq: 'ASC' },
    });
  }

  /**
   * 활성 하위코드(sub_code > 0) 목록.
   * TypeORM QueryBuilder — `sub_code > 0` 조건 표현.
   */
  findActiveSubCodes() {
    return this.repository
      .createQueryBuilder('c')
      .where('c.sub_code > 0 AND c.is_use = TRUE')
      .orderBy('c.main_code')
      .addOrderBy('c.order_seq')
      .getMany();
  }

  /**
   * 특정 main_code 그룹의 활성 하위코드 목록.
   * TypeORM QueryBuilder — `main_code = :group AND sub_code > 0`.
   */
  findByGroup(group: string) {
    return this.repository
      .createQueryBuilder('c')
      .where('c.main_code = :group AND c.sub_code > 0 AND c.is_use = TRUE', { group })
      .orderBy('c.order_seq')
      .getMany();
  }
}

/**
 * 관리자 사용자 DAO.
 * - 엔티티: {@link UserEntity} | PK: `number` (INT) | CRUD: {@link IntCrudDao}
 */
@Injectable()
export class AdminUserDao extends IntCrudDao<UserEntity> {
  constructor(
    @InjectRepository(UserEntity)
    repo: Repository<UserEntity>,
  ) {
    super(repo);
  }

  /** 활성 사용자 목록 — user_name 오름차순. */
  findActiveUsers() {
    return this.repository.find({
      where: { is_use: true },
      order: { user_name: 'ASC' },
    });
  }
}

/**
 * @deprecated {@link CommonCodeDao}, {@link AdminUserDao}로 분리됨.
 *             기존 Controller/Service의 `AdminDao` 주입 호환용 파사드.
 *             반환 형태를 레거시 `QueryResult`로 래핑한다.
 *             신규 코드는 CommonCodeDao / AdminUserDao를 직접 주입할 것.
 */
@Injectable()
export class AdminDao {
  constructor(
    private readonly userDao: AdminUserDao,
    private readonly codeDao: CommonCodeDao,
  ) {}

  /** {@link AdminUserDao#findActiveUsers} 위임 — QueryResult 래핑. */
  async findActiveUsers() {
    const rows = await this.userDao.findActiveUsers();
    return {
      rows,
      rowCount: rows.length,
      command: 'SELECT',
      oid: 0,
      fields: [],
    };
  }

  /** {@link CommonCodeDao#findActiveSubCodes} 위임 — QueryResult 래핑. */
  async findCommonCodes() {
    const rows = await this.codeDao.findActiveSubCodes();
    return {
      rows,
      rowCount: rows.length,
      command: 'SELECT',
      oid: 0,
      fields: [],
    };
  }
}
