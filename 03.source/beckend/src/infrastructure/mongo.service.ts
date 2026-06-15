import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { MongoClient, Db } from 'mongodb';

@Injectable()
export class MongoService implements OnModuleDestroy {
  private client: MongoClient | null = null;

  private uri() {
    return (
      process.env.TV_MONGO_URI ??
      'mongodb://tv:tv_local_dev@127.0.0.1:37017/iot_service?authSource=admin&directConnection=true'
    );
  }

  async db(): Promise<Db> {
    if (!this.client) {
      this.client = new MongoClient(this.uri());
      await this.client.connect();
    }
    return this.client.db('iot_service');
  }

  async onModuleDestroy() {
    if (this.client) await this.client.close();
  }
}
