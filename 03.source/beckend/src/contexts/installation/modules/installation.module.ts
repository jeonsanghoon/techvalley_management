/**
 * @file installation.module.ts
 * @description 설치 NestJS 모듈.
 * @remarks TypeOrmModule.forFeature
 *   - InstallationEntity: 디바이스 현장 설치 이력
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InstallationEntity } from '../entities/installation.entity';
import { InstallationController } from '../controllers/installation.controller';
import { InstallationService } from '../services/installation.service';
import { InstallationDao } from '../dao/installation.dao';

@Module({
  imports: [TypeOrmModule.forFeature([InstallationEntity])],
  controllers: [InstallationController],
  providers: [InstallationService, InstallationDao],
})
export class InstallationModule {}
