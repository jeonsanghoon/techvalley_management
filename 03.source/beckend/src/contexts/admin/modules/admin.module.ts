/**
 * @file admin.module.ts
 * @description 관리(사용자·공통코드) NestJS 모듈.
 * @remarks TypeOrmModule.forFeature
 *   - CommonCodeEntity: 공통코드(main/sub) 마스터
 *   - UserEntity: 사용자 계정 (identity 컨텍스트 엔티티 재사용)
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonCodeEntity } from '../entities/common-code.entity';
import { UserEntity } from '../../identity/entities/user.entity';
import { AdminController } from '../controllers/admin.controller';
import { AdminService } from '../services/admin.service';
import { AdminDao, AdminUserDao, CommonCodeDao } from '../dao/admin.dao';

@Module({
  imports: [TypeOrmModule.forFeature([CommonCodeEntity, UserEntity])],
  controllers: [AdminController],
  providers: [AdminService, AdminDao, AdminUserDao, CommonCodeDao],
})
export class AdminModule {}
