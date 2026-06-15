# Database — TypeORM + Raw SQL 하이브리드

단일 Postgres 커넥션 풀(`TypeOrmModule.forRoot`) 위에서 **두 가지 접근**을 병행합니다.

| 방식 | 사용처 | 예 |
|------|--------|-----|
| **TypeORM Repository** | 단일 테이블 CRUD · 단순 count/find | `deviceRepo.count({ where: { is_use: true } })` |
| **Raw SQL** (`RawQueryService` / `PostgresService`) | JOIN · 집계 · CTE · DB 특화 함수 | `DEVICE_JOIN_SQL`, engineer GROUP BY |

Mongo · YAML rules는 기존 `MongoService`, `ConfigLoaderService` 유지.

## DI

```typescript
// 1) Repository — entity 정의 필요 (contexts/*/entities/)
@InjectRepository(DeviceEntity) private deviceRepo: Repository<DeviceEntity>

// 2) Raw SQL — pg 호환 { rows }
constructor(private readonly pg: PostgresService) {}
await this.pg.query<DeviceFleetRow>(`${DEVICE_JOIN_SQL} ORDER BY ...`);

// 3) Raw SQL — row 배열만
constructor(private readonly raw: RawQueryService) {}
await this.raw.select<DeviceFleetRow>(sql, [param]);
```

## 트랜잭션 (write API 확장)

```typescript
await this.raw.withTransaction(async (runner) => {
  await runner.query('INSERT INTO ...', [a, b]);
  await runner.manager.save(DeviceEntity, entity);
});
```

## Entity 추가 절차

1. `contexts/{domain}/entities/*.entity.ts` — DDL SSOT: `02.arch/config/schema/postgres/`
2. `src/entities/index.ts` re-export + `TYPEORM_ENTITIES` 배열에 추가
3. `{domain}/modules/*.module.ts` → `TypeOrmModule.forFeature([...])`
4. DAO: 단순 조회는 Repository, 복잡 쿼리는 raw 유지

`synchronize: false` — 스키마 변경은 SQL migration만 사용.
