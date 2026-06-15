/**
 * @file dashboard.dao.ts
 * @description 대시보드(Dashboard) 도메인 — KPI·fleet·알람·티켓·부품 집계 데이터 접근.
 *
 * **하이브리드 데이터 접근 패턴**
 * - 단순 count: TypeORM Repository / QueryBuilder
 * - fleet JOIN, 알람·티켓 JOIN, AVG 집계: raw SQL
 * - MongoDB 최신 알림: MongoService
 * - 일별 알람 트렌드: TypeORM {@link SnowflakeCrudDao} (DashboardAlarmDailyDao)
 *
 * DashboardDao는 여러 도메인 테이블을 cross-context로 조회하는 집계 DAO이다.
 */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { QueryResult } from 'pg';
import { PostgresService } from '../../../infrastructure/postgres.service';
import { MongoService } from '../../../infrastructure/mongo.service';
import { SnowflakeIdService } from '../../../infrastructure/database/snowflake-id.service';
import { SnowflakeCrudDao } from '../../../common/repository/crud-dao.mixin';
import type { DeviceNotificationDoc } from '../../../common/types/db/mongo-docs';
import type {
  AvgRow,
  CountRow,
  DashboardAlarmDailyRow,
  DeviceFleetRow,
  PgAlarmIncidentRow,
  ServiceTicketRow,
} from '../../../common/types/db/postgres-rows';
import { CommunicationAlarmIncidentEntity } from '../../alarm/entities/communication-alarm-incident.entity';
import { DashboardAlarmDailyEntity } from '../entities/dashboard-alarm-daily.entity';
import { PartsOrderEntity } from '../../parts/entities/parts.entities';
import { ServiceTicketEntity } from '../../service/entities/service.entities';

/**
 * 일별 알람 통계 DAO.
 * - 엔티티: {@link DashboardAlarmDailyEntity} | PK: `string` (snowflake) | CRUD: {@link SnowflakeCrudDao}
 */
@Injectable()
export class DashboardAlarmDailyDao extends SnowflakeCrudDao<DashboardAlarmDailyEntity> {
  constructor(
    @InjectRepository(DashboardAlarmDailyEntity)
    repo: Repository<DashboardAlarmDailyEntity>,
    snowflake: SnowflakeIdService,
  ) {
    super(repo, snowflake);
  }

  /**
   * 일별 알람 트렌드 — `stat_date` 오름차순, 최근 N건.
   * TypeORM find — 단일 테이블 정렬·take.
   */
  findTrends(limit = 30): Promise<QueryResult<DashboardAlarmDailyRow>> {
    return this.repository
      .find({ order: { stat_date: 'ASC' }, take: limit })
      .then((rows) => ({
        rows: rows as unknown as DashboardAlarmDailyRow[],
        rowCount: rows.length,
        command: 'SELECT',
        oid: 0,
        fields: [],
      }));
  }
}

/**
 * 대시보드 KPI 집계 DAO.
 * - alarm context: {@link CommunicationAlarmIncidentEntity}
 * - parts context: {@link PartsOrderEntity}
 * - service context: {@link ServiceTicketEntity}
 * - CRUD 베이스 없음 (읽기·집계 전용)
 */
@Injectable()
export class DashboardDao {
  constructor(
    private readonly pg: PostgresService,
    private readonly mongo: MongoService,
    @InjectRepository(CommunicationAlarmIncidentEntity)
    private readonly incidentRepo: Repository<CommunicationAlarmIncidentEntity>,
    @InjectRepository(PartsOrderEntity)
    private readonly partsOrderRepo: Repository<PartsOrderEntity>,
    @InjectRepository(ServiceTicketEntity)
    private readonly ticketRepo: Repository<ServiceTicketEntity>,
    private readonly alarmDailyDao: DashboardAlarmDailyDao,
  ) {}

  /**
   * 활성 fleet 디바이스 목록 — site/company/product JOIN.
   * raw SQL: device 도메인과 동일 JOIN 패턴.
   */
  findFleetDevices(): Promise<QueryResult<DeviceFleetRow>> {
    return this.pg.query<DeviceFleetRow>(`
      SELECT d.*, s.site_name, s.code AS site_code, s.address, s.region_label, s.geo_zone,
             c.company_name, c.code AS company_code, c.contract_tier, p.product_name
      FROM device d
      JOIN site s ON s.id = d.site_id
      LEFT JOIN branch b ON b.id = s.branch_id
      JOIN company c ON c.id = COALESCE(s.company_id, b.company_id)
      JOIN product p ON p.id = d.product_id
      WHERE d.is_use = TRUE`);
  }

  /**
   * 미해결(`open`) incident 건수.
   * TypeORM `count` — 단일 테이블 조건 count.
   */
  async countOpenIncidents(): Promise<QueryResult<CountRow>> {
    const c = await this.incidentRepo.count({ where: { incident_status: 'open' } });
    return this.toCountResult(c);
  }

  /**
   * 최근 PG 알람 incident 목록.
   * raw SQL: projection + LIMIT.
   */
  findRecentPgAlarms(limit = 8): Promise<QueryResult<PgAlarmIncidentRow>> {
    return this.pg.query<PgAlarmIncidentRow>(`
      SELECT id, alert_code, device_code, severity_type, incident_status, opened_at, alarm_label AS message
      FROM communication_alarm_incident ORDER BY opened_at DESC LIMIT ${limit}`);
  }

  /**
   * 최근 MongoDB 디바이스 알림.
   * MongoService — `device_timestamp` 내림차순.
   */
  async findRecentMongoAlarms(limit = 8): Promise<DeviceNotificationDoc[]> {
    const db = await this.mongo.db();
    return db
      .collection<DeviceNotificationDoc>('device_notifications')
      .find({})
      .sort({ device_timestamp: -1 })
      .limit(limit)
      .toArray();
  }

  /**
   * 미종료 서비스 티켓 목록 — site/company JOIN.
   * raw SQL: ticket_status 필터 + JOIN.
   */
  findOpenTickets(limit = 20): Promise<QueryResult<ServiceTicketRow>> {
    return this.pg.query<ServiceTicketRow>(`
      SELECT t.*, s.site_name, c.company_name FROM service_ticket t
      LEFT JOIN site s ON s.id = t.site_id
      LEFT JOIN branch b ON b.id = s.branch_id
      LEFT JOIN company c ON c.id = COALESCE(s.company_id, b.company_id)
      WHERE t.ticket_status != 'closed' ORDER BY t.opened_at DESC LIMIT ${limit}`);
  }

  /**
   * 전체 수율 평균.
   * raw SQL: `AVG(yield_pct)` 집계.
   */
  avgYield(): Promise<QueryResult<AvgRow>> {
    return this.pg.query<AvgRow>(
      `SELECT AVG(yield_pct)::numeric(6,2) AS avg FROM yield_inspection_record`,
    );
  }

  /**
   * 미완료 부품 주문 건수.
   * TypeORM QueryBuilder — `order_status NOT IN (...)` 조건 count.
   */
  async countPendingParts(): Promise<QueryResult<CountRow>> {
    const c = await this.partsOrderRepo
      .createQueryBuilder('p')
      .where(`p.order_status NOT IN ('completed','교체완료')`)
      .getCount();
    return this.toCountResult(c);
  }

  /** {@link DashboardAlarmDailyDao#findTrends} 위임 — 일별 알람 트렌드. */
  findAlarmDailyTrends(limit = 30) {
    return this.alarmDailyDao.findTrends(limit);
  }

  /** TypeORM count 결과를 레거시 `QueryResult<CountRow>` 형태로 변환한다. */
  private toCountResult(c: number): QueryResult<CountRow> {
    return { rows: [{ c }], rowCount: 1, command: 'SELECT', oid: 0, fields: [] };
  }
}
