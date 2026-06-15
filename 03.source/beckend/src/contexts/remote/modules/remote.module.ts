/**
 * @file remote.module.ts
 * @description 원격 진단 NestJS 모듈.
 * @remarks TypeOrmModule.forFeature
 *   - RemoteDiagnosisFindingEntity: 원격 진단 finding(심각도·권장 조치)
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EquipmentLogModule } from '../../equipment-log/modules/equipment-log.module';
import { RemoteDiagnosisFindingEntity } from '../entities/remote-diagnosis-finding.entity';
import { RemoteController } from '../controllers/remote.controller';
import { RemoteService } from '../services/remote.service';
import { RemoteDao } from '../dao/remote.dao';

@Module({
  imports: [
    TypeOrmModule.forFeature([RemoteDiagnosisFindingEntity]),
    EquipmentLogModule,
  ],
  controllers: [RemoteController],
  providers: [RemoteService, RemoteDao],
})
export class RemoteModule {}
