import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../entities/user.entity';
import { IdentityController } from '../controllers/identity.controller';
import { IdentityService } from '../services/identity.service';
import { IdentityDao } from '../dao/identity.dao';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  controllers: [IdentityController],
  providers: [IdentityService, IdentityDao],
})
export class IdentityModule {}
