import { NotFoundException } from '@nestjs/common';
import { DeepPartial, FindManyOptions, ObjectLiteral } from 'typeorm';
import { TypeOrmCrudRepository } from './typeorm-crud.repository';
import { SnowflakeIdService } from '../../infrastructure/database/snowflake-id.service';

export type SnowflakeCrudOptions = {
  snowflake?: SnowflakeIdService;
};

/**
 * @file crud-dao.mixin.ts
 * @description PK 타입별 CRUD DAO 추상 베이스 클래스.
 *
 * **하이브리드 데이터 접근 패턴**
 * - 공통 CRUD는 {@link TypeOrmCrudRepository} (TypeORM)를 상속한다.
 * - 도메인별 DAO는 이 베이스를 확장하고, JOIN·집계가 필요한 메서드만 raw SQL을 추가한다.
 *
 * | 베이스 클래스        | PK 타입              | ID 발급 방식                    |
 * |---------------------|----------------------|---------------------------------|
 * | {@link SnowflakeCrudDao} | `string` (BIGINT) | Postgres `generate_snowflake_id()` |
 * | {@link IntCrudDao}       | `number` (INT)    | DB auto-increment / 시퀀스       |
 */

/**
 * BIGINT snowflake PK 엔티티용 CRUD DAO 베이스.
 *
 * - PK: `string` (Postgres BIGINT, JS에서는 문자열로 다룸)
 * - CRUD 베이스: {@link TypeOrmCrudRepository}
 * - 생성 시 {@link SnowflakeIdService#nextId}로 PK를 선할당한다.
 */
export abstract class SnowflakeCrudDao<
  T extends ObjectLiteral & { id: string },
> extends TypeOrmCrudRepository<T> {
  constructor(
    repo: ConstructorParameters<typeof TypeOrmCrudRepository<T>>[0],
    protected readonly snowflake: SnowflakeIdService,
  ) {
    super(repo);
  }

  /** snowflake ID를 발급한 뒤 엔티티를 생성한다. */
  async createRow(data: DeepPartial<T>): Promise<T> {
    const id = await this.snowflake.nextId();
    return this.create({ ...data, id } as DeepPartial<T>);
  }

  /** PK로 업데이트한다. 대상이 없으면 `NotFoundException`. */
  async updateRow(id: string, data: DeepPartial<T>): Promise<T> {
    const updated = await this.update(id, data);
    if (!updated) throw new NotFoundException(`Resource ${id} not found`);
    return updated;
  }

  /** PK로 삭제한다. 대상이 없으면 `NotFoundException`. */
  async deleteRow(id: string): Promise<void> {
    const ok = await this.delete(id);
    if (!ok) throw new NotFoundException(`Resource ${id} not found`);
  }

  /** 목록 조회 (페이징 옵션 전달 가능). `findAll`의 별칭. */
  findPage(options?: FindManyOptions<T>): Promise<T[]> {
    return this.findAll(options);
  }
}

/**
 * INT auto-increment PK 엔티티용 CRUD DAO 베이스.
 *
 * - PK: `number` (SERIAL / IDENTITY)
 * - CRUD 베이스: {@link TypeOrmCrudRepository}
 * - 생성 시 DB가 PK를 자동 할당한다.
 */
export abstract class IntCrudDao<
  T extends ObjectLiteral & { id: number },
> extends TypeOrmCrudRepository<T> {
  /** DB auto-increment에 PK 할당을 위임하여 생성한다. */
  async createRow(data: DeepPartial<T>): Promise<T> {
    return this.create(data);
  }

  /** PK로 업데이트한다. 대상이 없으면 `NotFoundException`. */
  async updateRow(id: number, data: DeepPartial<T>): Promise<T> {
    const updated = await this.update(id, data);
    if (!updated) throw new NotFoundException(`Resource ${id} not found`);
    return updated;
  }

  /** PK로 삭제한다. 대상이 없으면 `NotFoundException`. */
  async deleteRow(id: number): Promise<void> {
    const ok = await this.delete(id);
    if (!ok) throw new NotFoundException(`Resource ${id} not found`);
  }

  /** 목록 조회 (페이징 옵션 전달 가능). `findAll`의 별칭. */
  findPage(options?: FindManyOptions<T>): Promise<T[]> {
    return this.findAll(options);
  }
}
