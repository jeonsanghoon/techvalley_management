import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import type { TypeOrmModuleOptions } from '@nestjs/typeorm';

export function loadLocalEnv() {
  const configRoot = join(process.cwd(), '../../90.infra/10.local');
  const envPath = join(configRoot, 'env.local');
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const i = t.indexOf('=');
    if (i < 1) continue;
    const k = t.slice(0, i).trim();
    if (!process.env[k]) process.env[k] = t.slice(i + 1).trim();
  }
}

export function postgresUri(): string {
  loadLocalEnv();
  return (
    process.env.TV_POSTGRES_URI ??
    'postgresql://tv:tv_local_dev@127.0.0.1:35432/iot_analytics'
  );
}

export function typeOrmOptions(entities: TypeOrmModuleOptions['entities']): TypeOrmModuleOptions {
  return {
    type: 'postgres',
    url: postgresUri(),
    entities,
    synchronize: false,
    logging: process.env.TYPEORM_LOGGING === '1',
    extra: { max: 10 },
  };
}
