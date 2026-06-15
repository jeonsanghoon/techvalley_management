/**
 * @file service.dao.ts
 * @description 서비스(Service) 도메인 — 티켓·SLA·엔지니어·AS 기록 데이터 접근.
 *
 * **하이브리드 데이터 접근 패턴**
 * - 단순 CRUD: TypeORM {@link SnowflakeCrudDao} / Repository
 * - JOIN 목록 (ticket + site + company, engineer + assignment count, AS + device): raw SQL
 * - SLA snapshot: raw SQL (LIMIT), definition: TypeORM find
 *
 * ServiceTicketDao가 핵심 DAO이며, SlaDao는 snapshot/definition을 별도 관리한다.
 */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { QueryResult } from 'pg';
import { PostgresService } from '../../../infrastructure/postgres.service';
import { SnowflakeIdService } from '../../../infrastructure/database/snowflake-id.service';
import { SnowflakeCrudDao } from '../../../common/repository/crud-dao.mixin';
import type {
  AsRecordRow,
  EngineerProfileRow,
  ServiceTicketRow,
  SlaDefinitionRow,
  SlaSnapshotRow,
} from '../../../common/types/db/postgres-rows';
import {
  AsRecordEntity,
  EngineerProfileEntity,
  ServiceTicketEntity,
  SlaContractDefinitionEntity,
  SlaFleetSnapshotEntity,
} from '../entities/service.entities';

/**
 * 서비스 티켓 DAO.
 * - 엔티티: {@link ServiceTicketEntity} | PK: `string` (snowflake) | CRUD: {@link SnowflakeCrudDao}
 */
@Injectable()
export class ServiceTicketDao extends SnowflakeCrudDao<ServiceTicketEntity> {
  constructor(
    @InjectRepository(ServiceTicketEntity)
    repo: Repository<ServiceTicketEntity>,
    snowflake: SnowflakeIdService,
    private readonly pg: PostgresService,
  ) {
    super(repo, snowflake);
  }

  /**
   * 티켓 전체 목록 — site/company JOIN.
   * raw SQL: branch 경유 company COALESCE JOIN + `opened_at` 정렬.
   */
  findAllJoined(): Promise<QueryResult<ServiceTicketRow>> {
    return this.pg.query<ServiceTicketRow>(`
      SELECT t.*, s.site_name, c.company_name
      FROM service_ticket t
      LEFT JOIN site s ON s.id = t.site_id
      LEFT JOIN branch b ON b.id = s.branch_id
      LEFT JOIN company c ON c.id = COALESCE(s.company_id, b.company_id)
      ORDER BY t.opened_at DESC`);
  }

  /**
   * 단일 티켓 상세 — site/company JOIN.
   * raw SQL: PK 파라미터 바인딩($1).
   */
  findOneJoined(id: string): Promise<QueryResult<ServiceTicketRow>> {
    return this.pg.query<ServiceTicketRow>(
      `
      SELECT t.*, s.site_name, c.company_name
      FROM service_ticket t
      LEFT JOIN site s ON s.id = t.site_id
      LEFT JOIN branch b ON b.id = s.branch_id
      LEFT JOIN company c ON c.id = COALESCE(s.company_id, b.company_id)
      WHERE t.id = $1`,
      [id],
    );
  }

  /**
   * 엔지니어 목록 + 미종료 티켓 배정 건수.
   * raw SQL: GROUP BY + JSONB `portal_meta` 조건 집계.
   */
  findEngineersWithAssignments(): Promise<QueryResult<EngineerProfileRow>> {
    return this.pg.query<EngineerProfileRow>(`
      SELECT e.*, COUNT(t.id)::int AS assigned
      FROM engineer_profile e
      LEFT JOIN service_ticket t ON t.portal_meta->>'engineerId' = ('eng-' || e.user_id::text)
        AND t.ticket_status NOT IN ('closed')
      GROUP BY e.id ORDER BY e.display_name`);
  }

  /**
   * AS 기록 목록 — device/site/company JOIN.
   * raw SQL: device_code 경유 다중 LEFT JOIN.
   */
  findAsRecords(): Promise<QueryResult<AsRecordRow>> {
    return this.pg.query<AsRecordRow>(`
      SELECT a.*, c.company_name
      FROM as_record a
      LEFT JOIN device d ON d.device_code = a.device_code
      LEFT JOIN site s ON s.id = d.site_id
      LEFT JOIN branch b ON b.id = s.branch_id
      LEFT JOIN company c ON c.id = COALESCE(s.company_id, b.company_id)
      ORDER BY a.performed_at DESC`);
  }
}

/**
 * SLA 스냅샷·계약 정의 DAO.
 * - Snapshot 엔티티: {@link SlaFleetSnapshotEntity} (snowflake PK)
 * - Definition 엔티티: {@link SlaContractDefinitionEntity} (snowflake PK)
 * - CRUD: Repository 직접 + snowflake ID 수동 할당
 */
@Injectable()
export class SlaDao {
  constructor(
    @InjectRepository(SlaFleetSnapshotEntity)
    private readonly snapshotRepo: Repository<SlaFleetSnapshotEntity>,
    @InjectRepository(SlaContractDefinitionEntity)
    private readonly definitionRepo: Repository<SlaContractDefinitionEntity>,
    private readonly pg: PostgresService,
    private readonly snowflake: SnowflakeIdService,
  ) {}

  /**
   * fleet SLA 스냅샷 최근 N건.
   * raw SQL: projection 컬럼 지정 + LIMIT.
   */
  findSnapshots(limit = 24): Promise<QueryResult<SlaSnapshotRow>> {
    return this.pg.query<SlaSnapshotRow>(
      `SELECT snapshot_at, fleet_size, uptime_pct, critical_open_count, metrics_json
       FROM sla_fleet_snapshot ORDER BY snapshot_at DESC LIMIT ${limit}`,
    );
  }

  /** SLA 계약 정의 전체 — TypeORM find, `tier_code` 정렬. */
  findDefinitions(): Promise<QueryResult<SlaDefinitionRow>> {
    return this.definitionRepo.find({ order: { tier_code: 'ASC' } }).then((rows) => ({
      rows: rows as unknown as SlaDefinitionRow[],
      rowCount: rows.length,
      command: 'SELECT',
      oid: 0,
      fields: [],
    }));
  }

  /** SLA 계약 정의 단건 조회 — TypeORM findOne. */
  findDefinitionById(id: string) {
    return this.definitionRepo.findOne({ where: { id } });
  }

  /** SLA 계약 정의 생성 — snowflake ID 선할당 후 TypeORM save. */
  async createDefinition(data: Partial<SlaContractDefinitionEntity>) {
    const id = await this.snowflake.nextId();
    return this.definitionRepo.save(this.definitionRepo.create({ ...data, id }));
  }

  /** SLA 계약 정의 수정 — TypeORM update + findOne. */
  async updateDefinition(id: string, data: Partial<SlaContractDefinitionEntity>) {
    await this.definitionRepo.update(id, data);
    return this.definitionRepo.findOne({ where: { id } });
  }

  /** SLA 계약 정의 삭제 — TypeORM delete. */
  async deleteDefinition(id: string) {
    return this.definitionRepo.delete(id);
  }

  /** SLA 스냅샷 엔티티 목록 — TypeORM find (take/limit). */
  findSnapshotEntities(limit = 24) {
    return this.snapshotRepo.find({
      order: { snapshot_at: 'DESC' },
      take: limit,
    });
  }
}

/**
 * 엔지니어 프로필 DAO.
 * - 엔티티: {@link EngineerProfileEntity} | PK: `string` (snowflake) | CRUD: {@link SnowflakeCrudDao}
 */
@Injectable()
export class EngineerProfileDao extends SnowflakeCrudDao<EngineerProfileEntity> {
  constructor(
    @InjectRepository(EngineerProfileEntity)
    repo: Repository<EngineerProfileEntity>,
    snowflake: SnowflakeIdService,
  ) {
    super(repo, snowflake);
  }
}

/**
 * AS 기록 DAO.
 * - 엔티티: {@link AsRecordEntity} | PK: `string` (snowflake) | CRUD: {@link SnowflakeCrudDao}
 */
@Injectable()
export class AsRecordDao extends SnowflakeCrudDao<AsRecordEntity> {
  constructor(
    @InjectRepository(AsRecordEntity)
    repo: Repository<AsRecordEntity>,
    snowflake: SnowflakeIdService,
  ) {
    super(repo, snowflake);
  }
}
