/**
 * @file catalog.dao.ts
 * @description 카탈로그(Catalog) 도메인 — 제품·펌웨어·IoT Thing 레지스트리 데이터 접근.
 *
 * **하이브리드 데이터 접근 패턴**
 * - Product / Firmware: TypeORM {@link IntCrudDao} — INT PK, 단순 CRUD·정렬 조회
 * - IotThingRegistry: TypeORM {@link SnowflakeCrudDao} — BIGINT snowflake PK
 * - 복합 JOIN 없음 — 전 메서드 TypeORM Repository 기반
 *
 * {@link CatalogDao}는 레거시 파사드이며, 신규 코드는 개별 DAO를 직접 주입한다.
 */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { QueryResult } from 'pg';
import { IntCrudDao } from '../../../common/repository/crud-dao.mixin';
import { SnowflakeCrudDao } from '../../../common/repository/crud-dao.mixin';
import { SnowflakeIdService } from '../../../infrastructure/database/snowflake-id.service';
import {
  ProductEntity,
  FirmwareEntity,
  IotThingRegistryEntity,
} from '../entities/catalog.entities';
import type { IotThingRegistryRow } from '../../../common/types/db/postgres-rows';

/**
 * 제품(Product) DAO.
 * - 엔티티: {@link ProductEntity} | PK: `number` (INT) | CRUD: {@link IntCrudDao}
 */
@Injectable()
export class ProductDao extends IntCrudDao<ProductEntity> {
  constructor(@InjectRepository(ProductEntity) repo: Repository<ProductEntity>) {
    super(repo);
  }

  /** 활성 제품 목록 — `code` 오름차순. */
  findActive() {
    return this.repository.find({ where: { is_use: true }, order: { code: 'ASC' } });
  }
}

/**
 * 펌웨어(Firmware) DAO.
 * - 엔티티: {@link FirmwareEntity} | PK: `number` (INT) | CRUD: {@link IntCrudDao}
 */
@Injectable()
export class FirmwareDao extends IntCrudDao<FirmwareEntity> {
  constructor(@InjectRepository(FirmwareEntity) repo: Repository<FirmwareEntity>) {
    super(repo);
  }

  /** 활성 펌웨어 목록 — `created_at` 내림차순. */
  findActive() {
    return this.repository.find({
      where: { is_use: true },
      order: { created_at: 'DESC' },
    });
  }

  /** 최신 활성 펌웨어 1건. */
  findLatestVersion() {
    return this.repository.findOne({
      where: { is_use: true },
      order: { created_at: 'DESC' },
    });
  }
}

/**
 * IoT Thing 레지스트리 DAO.
 * - 엔티티: {@link IotThingRegistryEntity} | PK: `string` (snowflake BIGINT) | CRUD: {@link SnowflakeCrudDao}
 */
@Injectable()
export class IotThingRegistryDao extends SnowflakeCrudDao<IotThingRegistryEntity> {
  constructor(
    @InjectRepository(IotThingRegistryEntity)
    repo: Repository<IotThingRegistryEntity>,
    snowflake: SnowflakeIdService,
  ) {
    super(repo, snowflake);
  }

  /**
   * 전체 Thing 목록 — `device_code` 오름차순.
   * TypeORM find 결과를 레거시 `QueryResult` 형태로 래핑한다.
   */
  findAllOrdered(): Promise<QueryResult<IotThingRegistryRow>> {
    return this.repository.find({ order: { device_code: 'ASC' } }).then((rows) => ({
      rows: rows as unknown as IotThingRegistryRow[],
      rowCount: rows.length,
      command: 'SELECT',
      oid: 0,
      fields: [],
    }));
  }
}

/**
 * @deprecated {@link ProductDao}, {@link FirmwareDao}, {@link IotThingRegistryDao}로 분리됨.
 *             기존 Controller/Service의 `CatalogDao` 주입 호환용 파사드.
 *             신규 코드는 개별 DAO를 직접 주입할 것.
 */
@Injectable()
export class CatalogDao {
  constructor(private readonly iotDao: IotThingRegistryDao) {}

  /** {@link IotThingRegistryDao#findAllOrdered} 위임. */
  findIotThings() {
    return this.iotDao.findAllOrdered();
  }
}
