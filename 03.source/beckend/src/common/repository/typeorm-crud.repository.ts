import {
  DeepPartial,
  FindManyOptions,
  FindOptionsWhere,
  ObjectLiteral,
  Repository,
} from 'typeorm';

/**
 * @file typeorm-crud.repository.ts
 * @description TypeORM Repository 기반 공통 CRUD 래퍼.
 *
 * **하이브리드 데이터 접근 패턴**
 * - 단순 단일 테이블 조회·생성·수정·삭제는 이 클래스의 TypeORM 메서드를 사용한다.
 * - 복합 JOIN, 집계, CTE, window function 등은 {@link RawQueryService} 또는 QueryBuilder를 병행한다.
 *
 * DAO 계층에서 `@InjectRepository`로 주입받은 `Repository<T>`를 감싸 Service/Controller에
 * 일관된 CRUD 인터페이스를 제공한다.
 */
export class TypeOrmCrudRepository<T extends ObjectLiteral & { id: string | number }> {
  constructor(protected readonly repo: Repository<T>) {}

  /** 조건·페이징 옵션에 따라 엔티티 목록을 조회한다. */
  findAll(options?: FindManyOptions<T>): Promise<T[]> {
    return this.repo.find(options);
  }

  /** PK(id)로 단일 엔티티를 조회한다. 없으면 `null`. */
  findById(id: T['id']): Promise<T | null> {
    return this.repo.findOne({ where: { id } as FindOptionsWhere<T> });
  }

  /** 새 엔티티를 생성·저장한다. PK는 호출 측 또는 DB 시퀀스에 위임한다. */
  create(data: DeepPartial<T>): Promise<T> {
    const row = this.repo.create(data);
    return this.repo.save(row);
  }

  /** PK로 부분 업데이트 후 갱신된 엔티티를 반환한다. */
  async update(id: T['id'], data: DeepPartial<T>): Promise<T | null> {
    await this.repo.update(id as never, data as never);
    return this.findById(id);
  }

  /** PK로 삭제한다. affected > 0 이면 `true`. */
  async delete(id: T['id']): Promise<boolean> {
    const result = await this.repo.delete(id as never);
    return (result.affected ?? 0) > 0;
  }

  /** where 조건에 맞는 행 수를 반환한다. */
  count(where?: FindOptionsWhere<T>): Promise<number> {
    return this.repo.count(where ? { where } : undefined);
  }

  /** QueryBuilder 등 고급 TypeORM 기능이 필요할 때 원본 Repository를 노출한다. */
  get repository(): Repository<T> {
    return this.repo;
  }
}
