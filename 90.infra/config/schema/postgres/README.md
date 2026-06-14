# PostgreSQL DDL (테크밸리 Warm)

조직 계층: [org-hierarchy.md](../org-hierarchy.md) — `company` → `branch` → `site` → `device`

| 파일 | 내용 |
|------|------|
| `01-core-schema.sql` | user, common_code, **company, branch, site**, device, OTA, RBAC |
| `02-pipeline-alarm-notification.sql` | alert, notification, communication_* (site·branch grain), telemetry_*_time_series |
| `04-tv-domain-extensions.sql` | AI Ops, service_ticket, equipment_log_*, parts, as |
| `05-seed-dev.sql` | 로컬 시드 (HK-2024-00158) |
| `03-seed-reference.sql` | MOBI 더미 전체 (참고·부하 테스트) |

```bash
# 로컬
../../90.infra/local/bootstrap-postgres.sh
```

## UI ↔ RDS 매핑

| RDS | UI 화면 |
|-----|---------|
| `company` | customers (고객사) |
| `branch` | customers · 조직 (지점) |
| `site` | installation · site 필터 |
| `device` | equipment (장비) |

장비 키: `device.device_code` = MQTT `topic(4)` = DocDB `device_code`.
