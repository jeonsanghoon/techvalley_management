/**
 * @file identity.dao.ts
 * @description 인증·사용자(Identity) 도메인 — 사용자 계정 데이터 접근.
 */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { QueryResult } from 'pg';
import { IntCrudDao } from '../../../common/repository/crud-dao.mixin';
import { UserEntity } from '../entities/user.entity';
import type { UserRow } from '../../../common/types/db/postgres-rows';

@Injectable()
export class IdentityDao extends IntCrudDao<UserEntity> {
  constructor(@InjectRepository(UserEntity) repo: Repository<UserEntity>) {
    super(repo);
  }

  findActiveUsers(): Promise<QueryResult<UserRow>> {
    return this.repository.find({ where: { is_use: true }, order: { user_name: 'ASC' } }).then(
      (rows) => ({
        rows: rows as unknown as UserRow[],
        rowCount: rows.length,
        command: 'SELECT',
        oid: 0,
        fields: [],
      }),
    );
  }

  findByLoginId(userId: string): Promise<QueryResult<UserRow>> {
    return this.findEntityByLoginId(userId).then((entity) => ({
      rows: entity ? [entity as unknown as UserRow] : [],
      rowCount: entity ? 1 : 0,
      command: 'SELECT',
      oid: 0,
      fields: [],
    }));
  }

  findEntityByLoginId(loginId: string): Promise<UserEntity | null> {
    return this.repository
      .createQueryBuilder('u')
      .where('(u.code = :loginId OR u.email = :loginId) AND u.is_use = TRUE', { loginId })
      .limit(1)
      .getOne();
  }

  findEntityBySsoId(ssoId: string): Promise<UserEntity | null> {
    return this.repository.findOne({ where: { sso_id: ssoId, is_use: true } });
  }

  findEntityById(id: number): Promise<UserEntity | null> {
    return this.repository.findOne({ where: { id } });
  }
}
