/**
 * @file device.module.ts
 * @description 디바이스 NestJS 모듈.
 * @remarks TypeOrmModule.forFeature
 *   - DeviceEntity: 디바이스(장비) 마스터 — portal_meta·현장 FK
 *   DeviceDao를 exports — catalog·pipeline 등 다른 모듈에서 재사용.
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeviceEntity } from '../entities/device.entity';
import { DeviceController } from '../controllers/device.controller';
import { DeviceService } from '../services/device.service';
import { DeviceDao } from '../dao/device.dao';

@Module({
  imports: [TypeOrmModule.forFeature([DeviceEntity])],
  controllers: [DeviceController],
  providers: [DeviceService, DeviceDao],
  exports: [DeviceDao],
})
export class DeviceModule {}
