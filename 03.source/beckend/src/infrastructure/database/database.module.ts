/**
 * @file database.module.ts
 * @description NestJS 전역 데이터베이스 모듈 — TypeORM + raw SQL 인프라를 한곳에 등록한다.
 *
 * **하이브리드 데이터 접근 패턴**
 * - `TypeOrmModule`: 엔티티 매핑 기반 CRUD (Repository 주입)
 * - {@link RawQueryService}: 복합 SQL 직접 실행
 * - {@link SnowflakeIdService}: BIGINT PK 발급 (raw SQL → TypeORM save)
 *
 * `@Global()` 로 선언되어 모든 feature 모듈에서 별도 import 없이 DB 서비스를 주입받을 수 있다.
 */
import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TYPEORM_ENTITIES } from '../../entities';
import { typeOrmOptions } from './database.config';
import { RawQueryService } from './raw-query.service';
import { SnowflakeIdService } from './snowflake-id.service';

@Global()
@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmOptions([...TYPEORM_ENTITIES])),
    TypeOrmModule.forFeature([...TYPEORM_ENTITIES]),
  ],
  providers: [RawQueryService, SnowflakeIdService],
  exports: [TypeOrmModule, RawQueryService, SnowflakeIdService],
})
export class DatabaseModule {}
