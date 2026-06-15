import { Injectable } from '@nestjs/common';
import { RawQueryService } from './raw-query.service';

/**
 * @file snowflake-id.service.ts
 * @description Postgres `generate_snowflake_id()` 함수를 호출해 BIGINT PK를 발급하는 서비스.
 *
 * **하이브리드 데이터 접근 패턴**
 * - ID 발급만 raw SQL(`SELECT generate_snowflake_id()`)을 사용한다.
 * - 발급된 ID는 {@link SnowflakeCrudDao}의 `createRow`에서 TypeORM `save`에 전달된다.
 *
 * snowflake PK를 사용하는 테이블: service_ticket, installation, parts_order 등
 * (PK 타입 `string`, DB 컬럼 `BIGINT`)
 */
@Injectable()
export class SnowflakeIdService {
  constructor(private readonly raw: RawQueryService) {}

  /**
   * Postgres DB 함수로 다음 snowflake ID를 문자열로 반환한다.
   * JS Number 정밀도 한계를 피하기 위해 `::text` 캐스팅을 사용한다.
   */
  async nextId(): Promise<string> {
    const row = await this.raw.selectOne<{ id: string }>(
      `SELECT generate_snowflake_id()::text AS id`,
    );
    if (!row?.id) throw new Error('generate_snowflake_id() returned no id');
    return row.id;
  }
}
