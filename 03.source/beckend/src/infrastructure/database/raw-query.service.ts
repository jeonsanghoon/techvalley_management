import { Injectable } from '@nestjs/common';
import { DataSource, QueryRunner } from 'typeorm';
import type { QueryResult, QueryResultRow } from 'pg';

/**
 * @file raw-query.service.ts
 * @description TypeORM DataSource 기반 **직접 SQL** 실행 서비스.
 *
 * **하이브리드 데이터 접근 패턴**
 * - 단순 CRUD: TypeORM Repository / {@link TypeOrmCrudRepository}
 * - 복합 JOIN, 집계, CTE, window function, DB 함수 호출: 이 서비스의 raw SQL
 *
 * TypeORM 단일 커넥션 풀(`DataSource`)을 공유하므로 Repository와 트랜잭션 경계가 일치한다.
 *
 * @example
 * const rows = await raw.select<DeviceFleetRow>(DEVICE_JOIN_SQL + ' ORDER BY d.device_code');
 * const one = await raw.selectOne<CountRow>('SELECT COUNT(*)::int AS c FROM device WHERE is_use = TRUE');
 */
@Injectable()
export class RawQueryService {
  constructor(private readonly dataSource: DataSource) {}

  /** 트랜잭션·마이그레이션 등 고급 용도를 위해 DataSource 참조를 노출한다. */
  get dataSourceRef(): DataSource {
    return this.dataSource;
  }

  /**
   * SELECT 쿼리를 실행하고 row 배열을 반환한다.
   * TypeORM `DataSource.query` 래퍼.
   */
  select<T = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<T[]> {
    return this.dataSource.query(sql, params);
  }

  /**
   * SELECT 쿼리의 첫 번째 row만 반환한다. 결과 없으면 `undefined`.
   */
  selectOne<T = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<T | undefined> {
    return this.select<T>(sql, params).then((rows) => rows[0]);
  }

  /**
   * 기존 DAO·레거시 코드 호환용 — `pg.Pool.query` 와 동일한 `{ rows, rowCount }` 형태를 반환한다.
   * 신규 코드는 `select` / `selectOne` 사용을 권장한다.
   */
  async queryResult<T extends QueryResultRow = QueryResultRow>(
    sql: string,
    params?: unknown[],
  ): Promise<QueryResult<T>> {
    const rows = (await this.dataSource.query(sql, params)) as T[];
    return {
      rows,
      rowCount: rows.length,
      command: 'SELECT',
      oid: 0,
      fields: [],
    };
  }

  /**
   * QueryRunner 기반 트랜잭션 내에서 raw SQL을 실행한다.
   * write API(INSERT/UPDATE/DELETE) 확장 및 다중 쿼리 원자성 보장용.
   */
  async withTransaction<R>(fn: (runner: QueryRunner) => Promise<R>): Promise<R> {
    const runner = this.dataSource.createQueryRunner();
    await runner.connect();
    await runner.startTransaction();
    try {
      const result = await fn(runner);
      await runner.commitTransaction();
      return result;
    } catch (err) {
      await runner.rollbackTransaction();
      throw err;
    } finally {
      await runner.release();
    }
  }
}
