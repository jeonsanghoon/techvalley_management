# 조직 · 자산 계층 (company → branch → site → device)

Warm Tier(Postgres) SSOT · UI 필터 · 배치 롤업의 **조직 트리**입니다.  
상세: [01-platform-overview.md](../../01-platform-overview.md) §1.2 · DDL: [postgres/01-core-schema.sql](./postgres/01-core-schema.sql)

## 4단계 계층

```
company (회사)
  └── branch (지점·지사)
        └── site (조직·현장 — org_level_type)
              └── device (단말, device_code = S/N)
                    └── Greengrass → IoT Core Thing
```

| 계층 | RDS | 업무 키 | UI | 예 |
|------|-----|---------|-----|-----|
| 회사 | `company` | `code` | customers | COMP-DEMO-001 |
| 지점 | `branch` | `code` | customers · 조직 | BR-HQ, BR-SEOUL |
| 현장 | `site` | `code` | installation · site 필터 | SITE-FIELD-001 |
| 장비 | `device` | `device_code` | equipment | HK-2024-00158 |

## site.org_level_type (S0015)

| 값 | 의미 | FK |
|----|------|-----|
| `1` | 본사 | `company_id` 필수 |
| `2` | 지사 | `branch_id` 필수 |
| `3` | 현장 (field) | `branch_id` 선택 — **device.site_id** 는 보통 이 레벨 |

## MQTT · Hot · 배치

- **MQTT 8세그먼트**에는 company/branch/site 없음 — `{device}` = `device_code`만.
- **DocumentDB** 공통 필드: `site_id`, `customer_id`(=`company.code` 스냅샷) — Lambda가 `device` 마스터 조인으로 채움.
- **롤업 grain** (Warm): device → site → branch → company  
  예: `communication_quality_rollup_site`, `telemetry_branch_product_time_series`, `telemetry_company_product_time_series`.

## API · RBAC 스코프

| API prefix | 마스터 |
|------------|--------|
| `/customers` | `company`, `branch` |
| `/installation` | `site` |
| `/equipment` | `device` |

Cognito JWT: `companyId` / `branchId` / `siteId` claim으로 member 스코프와 연동 (Fleet · AuthZ).
