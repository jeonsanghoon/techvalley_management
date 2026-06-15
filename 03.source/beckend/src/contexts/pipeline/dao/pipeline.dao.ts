/**
 * @file pipeline.dao.ts
 * @description 파이프라인(Pipeline) 도메인 — 수집 통계·Mongo 컬렉션·YAML 설정 데이터 접근.
 *
 * **하이브리드 데이터 접근 패턴**
 * - Postgres `collection_daily_stats`: TypeORM {@link SnowflakeCrudDao} + QueryBuilder (오늘 stat)
 * - MongoDB telemetry 컬렉션: MongoService 직접 접근 (count)
 * - YAML 파이프라인 설정: ConfigLoaderService (DB 외 설정)
 * - {@link PipelineDao}: PG/Mongo/YAML 통합 조회 파사드
 */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { QueryResult } from 'pg';
import { PostgresService } from '../../../infrastructure/postgres.service';
import { MongoService } from '../../../infrastructure/mongo.service';
import { ConfigLoaderService } from '../../../infrastructure/config-loader.service';
import { SnowflakeIdService } from '../../../infrastructure/database/snowflake-id.service';
import { SnowflakeCrudDao } from '../../../common/repository/crud-dao.mixin';
import { CollectionDailyStatsEntity } from '../entities/collection-daily-stats.entity';
import type {
  BatchCadenceYaml,
  IngressDeployYaml,
  NormalizeConfigYaml,
} from '../../../common/types/db/yaml-config';
import type { CollectionDailyStatsRow } from '../../../common/types/db/postgres-rows';

/** MongoDB 수집 관련 컬렉션 목록. */
const MONGO_COLLECTIONS = [
  'periodic_telemetry',
  'telemetry_rollups_device_10min',
  'device_notifications',
] as const;

/**
 * 일별 수집 통계 DAO.
 * - 엔티티: {@link CollectionDailyStatsEntity} | PK: `string` (snowflake) | CRUD: {@link SnowflakeCrudDao}
 */
@Injectable()
export class CollectionDailyStatsDao extends SnowflakeCrudDao<CollectionDailyStatsEntity> {
  constructor(
    @InjectRepository(CollectionDailyStatsEntity)
    repo: Repository<CollectionDailyStatsEntity>,
    snowflake: SnowflakeIdService,
  ) {
    super(repo, snowflake);
  }

  /**
   * 오늘(`CURRENT_DATE`) 수집 통계.
   * TypeORM QueryBuilder — `stat_date = CURRENT_DATE` 조건.
   */
  findToday(): Promise<QueryResult<CollectionDailyStatsRow>> {
    return this.repository
      .createQueryBuilder('s')
      .where('s.stat_date = CURRENT_DATE')
      .getMany()
      .then((rows) => ({
        rows: rows as unknown as CollectionDailyStatsRow[],
        rowCount: rows.length,
        command: 'SELECT',
        oid: 0,
        fields: [],
      }));
  }
}

/**
 * 파이프라인 통합 DAO — YAML 설정, Mongo 수집량, PG 일별 통계를 조합한다.
 * - CRUD 베이스 없음 (조회·설정 로드 전용)
 */
@Injectable()
export class PipelineDao {
  constructor(
    private readonly pg: PostgresService,
    private readonly mongo: MongoService,
    private readonly config: ConfigLoaderService,
    private readonly statsDao: CollectionDailyStatsDao,
  ) {}

  /** Ingress 배포 YAML 설정을 로드한다. */
  loadIngressYaml(): IngressDeployYaml {
    return this.config.loadYaml('ingress-deploy.yaml') as IngressDeployYaml;
  }

  /** 정규화(Normalize) 기본 YAML 설정을 로드한다. */
  loadNormalizeYaml(): NormalizeConfigYaml {
    return this.config.loadYaml('normalize-config.default.yaml') as NormalizeConfigYaml;
  }

  /** 배치 주기(Batch cadence) YAML 설정을 로드한다. */
  loadBatchCadenceYaml(): BatchCadenceYaml {
    return this.config.loadYaml('02-batch-cadence.yaml') as BatchCadenceYaml;
  }

  /**
   * MongoDB 수집 컬렉션별 문서 수를 반환한다.
   * MongoService 직접 접근 — PG에 없는 telemetry 원시 데이터.
   */
  async countMongoCollections(): Promise<Record<string, number>> {
    const db = await this.mongo.db();
    const stats: Record<string, number> = {};
    for (const name of MONGO_COLLECTIONS) {
      stats[name] = await db.collection(name).countDocuments({});
    }
    return stats;
  }

  /** {@link CollectionDailyStatsDao#findToday} 위임 — 오늘 PG 수집 통계. */
  findCollectionDailyStatsToday() {
    return this.statsDao.findToday();
  }

  /** `periodic_telemetry` 컬렉션 전체 문서 수. */
  async countPeriodicTelemetry(): Promise<number> {
    const db = await this.mongo.db();
    return db.collection('periodic_telemetry').countDocuments({});
  }
}
