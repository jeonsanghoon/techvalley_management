import { Global, Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { PostgresService } from './postgres.service';
import { MongoService } from './mongo.service';
import { ConfigLoaderService } from './config-loader.service';

@Global()
@Module({
  imports: [DatabaseModule],
  providers: [PostgresService, MongoService, ConfigLoaderService],
  exports: [DatabaseModule, PostgresService, MongoService, ConfigLoaderService],
})
export class InfrastructureModule {}
