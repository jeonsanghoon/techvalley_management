/**
 * @file catalog.module.ts
 * @description 카탈로그 NestJS 모듈.
 * @remarks TypeOrmModule.forFeature
 *   - ProductEntity: 제품 마스터
 *   - FirmwareEntity: 펌웨어 버전
 *   - IotThingRegistryEntity: IoT Thing 레지스트리
 *   DeviceModule import — DeviceDao(플릿 JOIN) 재사용.
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  ProductEntity,
  FirmwareEntity,
  IotThingRegistryEntity,
} from '../entities/catalog.entities';
import { DeviceModule } from '../../device/modules/device.module';
import { CatalogController } from '../controllers/catalog.controller';
import { CatalogService } from '../services/catalog.service';
import {
  CatalogDao,
  ProductDao,
  FirmwareDao,
  IotThingRegistryDao,
} from '../dao/catalog.dao';

@Module({
  imports: [
    DeviceModule,
    TypeOrmModule.forFeature([ProductEntity, FirmwareEntity, IotThingRegistryEntity]),
  ],
  controllers: [CatalogController],
  providers: [CatalogService, CatalogDao, ProductDao, FirmwareDao, IotThingRegistryDao],
})
export class CatalogModule {}
