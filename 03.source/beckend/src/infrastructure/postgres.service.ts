import { Injectable } from '@nestjs/common';
import type { QueryResult, QueryResultRow } from 'pg';
import { RawQueryService } from './database/raw-query.service';

/**
 * @file postgres.service.ts
 * @description Postgres 접근 파사드 — 레거시 DAO 호환 API를 제공한다.
 *
 * **하이브리드 데이터 접근 패턴**
 * - 내부적으로 TypeORM DataSource 단일 커넥션 풀({@link RawQueryService})을 사용한다.
 * - `{ rows, rowCount }` 형태의 `query()` 반환은 기존 pg Pool 기반 DAO와의 호환을 위해 유지한다.
 * - 신규 DAO는 {@link RawQueryService}를 직접 주입해 `select` / `selectOne` 사용을 권장한다.
 *
 * @deprecated 점진적으로 {@link RawQueryService} 직접 주입으로 마이그레이션 중.
 *             이 파사드는 기존 `PostgresService.query()` 호출부 호환용이다.
 */
@Injectable()
export class PostgresService {
  constructor(private readonly raw: RawQueryService) {}

  /**
   * raw SQL을 실행하고 `pg.Pool.query` 호환 `{ rows }` 형태를 반환한다.
   * 복합 JOIN·집계 쿼리 등 TypeORM Repository로 표현하기 어려운 조회에 사용된다.
   */
  query<T extends QueryResultRow = QueryResultRow>(
    text: string,
    params?: unknown[],
  ): Promise<QueryResult<T>> {
    return this.raw.queryResult<T>(text, params);
  }

  /** row 배열만 필요할 때 — {@link RawQueryService#select} 위임. */
  select<T = Record<string, unknown>>(text: string, params?: unknown[]): Promise<T[]> {
    return this.raw.select<T>(text, params);
  }
}
