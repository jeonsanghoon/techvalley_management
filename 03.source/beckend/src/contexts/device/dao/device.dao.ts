/**
 * @file device.dao.ts
 * @description 디바이스(Device) 도메인 데이터 접근 계층.
 *
 * **하이브리드 데이터 접근 패턴**
 * - 단순 count·조건 필터: TypeORM `DeviceEntity` Repository
 * - fleet JOIN (device ↔ site ↔ company ↔ product): raw SQL — 다중 테이블 JOIN·동적 ORDER BY
 * - firmware 최신 버전: raw SQL — 단일 row LIMIT 1
 *
 * `DEVICE_JOIN_SQL` 상수는 dashboard 등 다른 DAO에서도 재사용 가능한 JOIN 베이스 쿼리이다.
 */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { QueryResult } from 'pg';
import { PostgresService } from '../../../infrastructure/postgres.service';
import type {
  CountRow,
  DeviceFleetRow,
  DeviceRawRow,
  FirmwareVersionRow,
} from '../../../common/types/db/postgres-rows';
import { DeviceEntity } from '../entities/device.entity';

/**
 * 디바이스 fleet JOIN 베이스 SQL.
 * raw SQL 유지 이유: site/branch/company COALESCE JOIN 패턴을 QueryBuilder보다 명확하게 표현.
 */
export const DEVICE_JOIN_SQL = `
  SELECT d.*, s.site_name, s.code AS site_code, s.address, s.region_label, s.geo_zone,
         c.company_name, c.code AS company_code, c.contract_tier,
         p.product_name
  FROM device d
  JOIN site s ON s.id = d.site_id
  LEFT JOIN branch b ON b.id = s.branch_id
  JOIN company c ON c.id = COALESCE(s.company_id, b.company_id)
  JOIN product p ON p.id = d.product_id
  WHERE d.is_use = TRUE`;

/**
 * 디바이스 DAO.
 *
 * - PG 엔티티: {@link DeviceEntity} (PK: `number` INT)
 * - CRUD 베이스: TypeORM Repository 직접 주입 (count 전용)
 */
@Injectable()
export class DeviceDao {
  constructor(
    private readonly pg: PostgresService,
    @InjectRepository(DeviceEntity)
    private readonly deviceRepo: Repository<DeviceEntity>,
  ) {}

  /**
   * 활성 디바이스 fleet 목록을 site/company/product JOIN과 함께 조회한다.
   * raw SQL: 복합 JOIN + 동적 `orderBy` 절.
   */
  findFleetJoined(orderBy = 'd.device_code'): Promise<QueryResult<DeviceFleetRow>> {
    return this.pg.query<DeviceFleetRow>(`${DEVICE_JOIN_SQL} ORDER BY ${orderBy}`);
  }

  /** 최근 통신(`last_seen_at`) 순 fleet 목록 — `findFleetJoined` 래퍼. */
  findFleetLive(): Promise<QueryResult<DeviceFleetRow>> {
    return this.findFleetJoined('d.last_seen_at DESC NULLS LAST');
  }

  /**
   * 디바이스 요약 목록 (핵심 컬럼 + site/company/product).
   * raw SQL: projection 커스텀.
   */
  findDevicesRaw(): Promise<QueryResult<DeviceRawRow>> {
    return this.pg.query<DeviceRawRow>(`
      SELECT d.id, d.device_code, d.serial, d.operational_status_type,
             s.code AS site_code, s.site_name, c.company_name, p.product_name
      FROM device d
      JOIN site s ON s.id = d.site_id
      LEFT JOIN branch b ON b.id = s.branch_id
      JOIN company c ON c.id = COALESCE(s.company_id, b.company_id)
      JOIN product p ON p.id = d.product_id
      ORDER BY d.device_code`);
  }

  /**
   * 활성(`is_use = TRUE`) 디바이스 수.
   * TypeORM `count` — 단일 테이블 조건 count.
   */
  async countActiveDevices(): Promise<QueryResult<CountRow>> {
    const c = await this.deviceRepo.count({ where: { is_use: true } });
    return this.toCountResult(c);
  }

  /**
   * 온라인(`operational_status_type = 1`) 활성 디바이스 수.
   * TypeORM `count` — 복합 where 조건.
   */
  async countOnlineDevices(): Promise<QueryResult<CountRow>> {
    const c = await this.deviceRepo.count({
      where: { is_use: true, operational_status_type: 1 },
    });
    return this.toCountResult(c);
  }

  /**
   * 최신 firmware 버전 1건 조회.
   * raw SQL: `ORDER BY created_at DESC LIMIT 1` 단일 row 패턴.
   */
  findLatestFirmwareVersion(): Promise<QueryResult<FirmwareVersionRow>> {
    return this.pg.query<FirmwareVersionRow>(
      `SELECT firmware_version FROM firmware WHERE is_use = TRUE ORDER BY created_at DESC LIMIT 1`,
    );
  }

  /** TypeORM count 결과를 레거시 `QueryResult<CountRow>` 형태로 변환한다. */
  private toCountResult(c: number): QueryResult<CountRow> {
    return {
      rows: [{ c }],
      rowCount: 1,
      command: 'SELECT',
      oid: 0,
      fields: [],
    };
  }
}
