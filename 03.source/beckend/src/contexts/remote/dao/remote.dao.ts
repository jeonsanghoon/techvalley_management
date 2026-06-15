/**
 * @file remote.dao.ts
 * @description 원격진단(Remote) 도메인 — 원격 진단 결과(Finding) 데이터 접근.
 *
 * **하이브리드 데이터 접근 패턴**
 * - 전 메서드 TypeORM {@link SnowflakeCrudDao} 기반
 * - raw SQL 없음 — 단일 테이블 CRUD·정렬 조회
 */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SnowflakeIdService } from '../../../infrastructure/database/snowflake-id.service';
import { SnowflakeCrudDao } from '../../../common/repository/crud-dao.mixin';
import { RemoteDiagnosisFindingEntity } from '../entities/remote-diagnosis-finding.entity';

/**
 * 원격 진단 Finding DAO.
 * - 엔티티: {@link RemoteDiagnosisFindingEntity} | PK: `string` (snowflake) | CRUD: {@link SnowflakeCrudDao}
 */
@Injectable()
export class RemoteDao extends SnowflakeCrudDao<RemoteDiagnosisFindingEntity> {
  constructor(
    @InjectRepository(RemoteDiagnosisFindingEntity)
    repo: Repository<RemoteDiagnosisFindingEntity>,
    snowflake: SnowflakeIdService,
  ) {
    super(repo, snowflake);
  }

  /** 전체 Finding — `detected_at` 내림차순 (최신 우선). */
  findAllOrdered() {
    return this.repository.find({ order: { detected_at: 'DESC' } });
  }
}
