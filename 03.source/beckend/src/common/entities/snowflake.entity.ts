/**
 * 공통 TypeORM 데코레이터: BIGINT snowflake PK
 *
 * PostgreSQL `generate_snowflake_id()`로 생성되는 BIGINT PK를
 * TypeORM 엔티티에 일관되게 매핑한다.
 * JS 정밀도 한계로 런타임 값은 string 타입으로 다룬다.
 */
import { PrimaryColumn } from 'typeorm';

/** BIGINT snowflake PK — JS string으로 매핑 */
export function SnowflakePrimaryColumn() {
  return PrimaryColumn({ type: 'bigint' });
}
