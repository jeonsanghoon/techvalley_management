/**
 * @file parts.dao.ts
 * @description 부품(Parts) 도메인 — 부품 주문·교체 일정 데이터 접근.
 *
 * **하이브리드 데이터 접근 패턴**
 * - 단순 CRUD·정렬: TypeORM {@link SnowflakeCrudDao}
 * - schedule JOIN 목록 (site/company/order): raw SQL — device 경유 다중 LEFT JOIN
 *
 * {@link PartsDao}는 레거시 파사드이며, 신규 코드는 PartsOrderDao/PartsScheduleDao를 직접 주입한다.
 */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { QueryResult } from 'pg';
import { PostgresService } from '../../../infrastructure/postgres.service';
import { SnowflakeIdService } from '../../../infrastructure/database/snowflake-id.service';
import { SnowflakeCrudDao } from '../../../common/repository/crud-dao.mixin';
import { PartsOrderEntity, PartsScheduleEntity } from '../entities/parts.entities';

/**
 * 부품 주문 DAO.
 * - 엔티티: {@link PartsOrderEntity} | PK: `string` (snowflake) | CRUD: {@link SnowflakeCrudDao}
 */
@Injectable()
export class PartsOrderDao extends SnowflakeCrudDao<PartsOrderEntity> {
  constructor(
    @InjectRepository(PartsOrderEntity)
    repo: Repository<PartsOrderEntity>,
    snowflake: SnowflakeIdService,
  ) {
    super(repo, snowflake);
  }

  /** 전체 주문 — `ordered_at` 내림차순. */
  findAllOrdered() {
    return this.repository.find({ order: { ordered_at: 'DESC' } });
  }
}

/**
 * 부품 교체 일정 DAO.
 * - 엔티티: {@link PartsScheduleEntity} | PK: `string` (snowflake) | CRUD: {@link SnowflakeCrudDao}
 */
@Injectable()
export class PartsScheduleDao extends SnowflakeCrudDao<PartsScheduleEntity> {
  constructor(
    @InjectRepository(PartsScheduleEntity)
    repo: Repository<PartsScheduleEntity>,
    snowflake: SnowflakeIdService,
    private readonly pg: PostgresService,
  ) {
    super(repo, snowflake);
  }

  /**
   * 교체 일정 목록 — site/company/parts_order JOIN.
   * raw SQL: device_code 경유 site·company·order 매칭 JOIN.
   */
  findSchedulesJoined(): Promise<QueryResult<Record<string, unknown>>> {
    return this.pg.query(`
      SELECT ps.*, s.site_name, c.company_name, po.order_no
      FROM parts_schedule ps
      LEFT JOIN device d ON d.device_code = ps.device_code
      LEFT JOIN site s ON s.id = d.site_id
      LEFT JOIN branch b ON b.id = s.branch_id
      LEFT JOIN company c ON c.id = COALESCE(s.company_id, b.company_id)
      LEFT JOIN parts_order po ON po.device_code = ps.device_code AND po.part_type_code = ps.part_type_code
      ORDER BY ps.scheduled_at`);
  }
}

/**
 * @deprecated {@link PartsOrderDao}, {@link PartsScheduleDao}로 분리됨.
 *             기존 Controller/Service의 `PartsDao` 주입 호환용 파사드.
 *             신규 코드는 PartsOrderDao / PartsScheduleDao를 직접 주입할 것.
 */
@Injectable()
export class PartsDao {
  constructor(
    private readonly orderDao: PartsOrderDao,
    private readonly scheduleDao: PartsScheduleDao,
  ) {}

  /** {@link PartsOrderDao#findAllOrdered} 위임 — QueryResult 래핑. */
  async findOrders() {
    const rows = await this.orderDao.findAllOrdered();
    return { rows, rowCount: rows.length, command: 'SELECT', oid: 0, fields: [] };
  }

  /** {@link PartsScheduleDao#findSchedulesJoined} 위임. */
  findSchedules() {
    return this.scheduleDao.findSchedulesJoined();
  }
}
