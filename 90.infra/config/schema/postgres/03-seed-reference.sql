-- =============================================================================
-- PostgreSQL — 개발/검증용 더미 데이터
-- 적용 순서:
--   1) 01-schema-mobi-rds-reference.sql
--   2) 02-init-postgres.sql
--   3) 03-seed-dummy-postgres.sql
--
-- 주의:
--   - 운영 데이터가 아닌 로컬/개발 검증용 샘플이다.
--   - 현재 DDL 기준 tenant_id 는 별도 tenants 테이블이 없으므로 company.id 와 같은 값으로 넣는다.
--   - common_code 그룹 설명 로우는 sub_code=-1/order_seq=-1/is_use=false 로 둔다.
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- 1) 기준 데이터
-- -----------------------------------------------------------------------------
INSERT INTO public."user" (code, email, user_name, auth_type, account_status, email_verified_at, approved_at, remark)
VALUES
  ('USR-DEMO-ADMIN', 'admin.demo@mobi.local', '모비 데모 관리자', 10, 'active', NOW(), NOW(), '개발 검증용 더미 사용자'),
  ('USR-DEMO-OPS', 'ops.demo@mobi.local', '현장 운영자', 1, 'active', NOW(), NOW(), '개발 검증용 더미 사용자')
ON CONFLICT (code) DO UPDATE SET
  email = EXCLUDED.email,
  user_name = EXCLUDED.user_name,
  auth_type = EXCLUDED.auth_type,
  account_status = EXCLUDED.account_status,
  updated_at = NOW();

INSERT INTO public.language (code, language_name, locale, is_default, sort_order, remark)
VALUES
  ('ko', '한국어', 'ko-KR', TRUE, 1, '개발 검증 기본 언어'),
  ('en', 'English', 'en-US', FALSE, 2, '개발 검증 보조 언어')
ON CONFLICT (code) DO UPDATE SET
  language_name = EXCLUDED.language_name,
  locale = EXCLUDED.locale,
  is_default = EXCLUDED.is_default,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

INSERT INTO public.common_code (main_code, sub_code, code_name, code_name_en, order_seq, ref_data1, is_use, remark)
VALUES
  ('S0001', -1, '사이트 유형', 'Site type', -1, 'group_header', FALSE, '더미 데이터용'),
  ('S0001', 1, '공장', 'Factory', 1, 'factory', TRUE, '더미 데이터용'),
  ('S0001', 2, '물류센터', 'Logistics center', 2, 'logistics', TRUE, '더미 데이터용'),
  ('S0001', 3, '오피스', 'Office', 3, 'office', TRUE, '더미 데이터용'),
  ('S0001', 4, '소매·매장', 'Retail store', 4, 'retail', TRUE, '더미 데이터용'),
  ('S0015', -1, '조직·현장 구분', 'Org site level', -1, 'group_header', FALSE, '본사·지사·현장 — site.org_level_type'),
  ('S0015', 1, '본사', 'Headquarters', 1, 'headquarters', TRUE, 'site.org_level_type=1, company_id 필수'),
  ('S0015', 2, '지사', 'Branch office', 2, 'branch_office', TRUE, 'site.org_level_type=2, branch_id 필수'),
  ('S0015', 3, '현장', 'Field site', 3, 'field_site', TRUE, 'site.org_level_type=3, branch/company 선택'),
  ('B0001', -1, '지점 구분', 'Branch kind', -1, 'group_header', FALSE, '본사 지점·일반 지사 — branch.branch_type'),
  ('B0001', 1, '본사 지점', 'Headquarters branch', 1, 'headquarters_branch', TRUE, 'branch.branch_type=1, 회사당 1건'),
  ('B0001', 2, '일반 지사', 'Regional branch', 2, 'regional_branch', TRUE, 'branch.branch_type=2 DEF'),
  ('D0001', -1, '디바이스 단계', 'Device phase', -1, 'group_header', FALSE, '더미 데이터용'),
  ('D0001', 1, '운영', 'Operational', 1, 'operational', TRUE, '더미 데이터용')
ON CONFLICT (main_code, sub_code) DO UPDATE SET
  code_name = EXCLUDED.code_name,
  code_name_en = EXCLUDED.code_name_en,
  order_seq = EXCLUDED.order_seq,
  ref_data1 = EXCLUDED.ref_data1,
  is_use = EXCLUDED.is_use,
  updated_at = NOW();

INSERT INTO public.company (code, company_name, description, remark)
VALUES ('COMP-DEMO-001', '모비 데모 회사', '알람·집계 검증용 회사', '개발 검증용')
ON CONFLICT (code) DO UPDATE SET
  company_name = EXCLUDED.company_name,
  description = EXCLUDED.description,
  updated_at = NOW();

INSERT INTO public.product (code, legacy_system, product_legacy_code, product_name, description, remark)
VALUES ('PRD-MOBI-GW-001', 'cescoservice', 'PRD-MOBI-GW-001-LEG', 'Mobi Gateway Demo', '텔레메트리·통신 품질 검증용 제품', '개발 검증용')
ON CONFLICT (code) DO UPDATE SET
  legacy_system = EXCLUDED.legacy_system,
  product_legacy_code = EXCLUDED.product_legacy_code,
  product_name = EXCLUDED.product_name,
  description = EXCLUDED.description,
  updated_at = NOW();

INSERT INTO public.branch (code, legacy_system, branch_legacy_code, branch_type, company_id, branch_name, description, remark)
SELECT
  'BR-DEMO-HQ',
  'cescoservice',
  'BR-DEMO-HQ-LEG',
  1,
  c.id,
  '모비 데모 본사 지점',
  '본사 지점(B0001=1) — 회사당 1건',
  '개발 검증용'
FROM public.company c
WHERE c.code = 'COMP-DEMO-001'
ON CONFLICT (code) DO UPDATE SET
  legacy_system = EXCLUDED.legacy_system,
  branch_legacy_code = EXCLUDED.branch_legacy_code,
  branch_type = EXCLUDED.branch_type,
  company_id = EXCLUDED.company_id,
  branch_name = EXCLUDED.branch_name,
  description = EXCLUDED.description,
  updated_at = NOW();

INSERT INTO public.branch (code, legacy_system, branch_legacy_code, branch_type, company_id, branch_name, description, remark)
SELECT
  'BR-DEMO-SEOUL',
  'cescoservice',
  'BR-DEMO-SEOUL-LEG',
  2,
  c.id,
  '서울 데모 지점',
  '일반 지사(B0001=2) — 알람 검증용',
  '개발 검증용'
FROM public.company c
WHERE c.code = 'COMP-DEMO-001'
ON CONFLICT (code) DO UPDATE SET
  legacy_system = EXCLUDED.legacy_system,
  branch_legacy_code = EXCLUDED.branch_legacy_code,
  branch_type = EXCLUDED.branch_type,
  company_id = EXCLUDED.company_id,
  branch_name = EXCLUDED.branch_name,
  description = EXCLUDED.description,
  updated_at = NOW();

INSERT INTO public.site (code, legacy_system, site_legacy_code, org_level_type, company_id, branch_id, site_name, description, latitude, longitude, utc_offset_hours, site_type, remark)
SELECT
  'HQ-DEMO-001',
  'cescoservice',
  'HQ-DEMO-001-LEG',
  1,
  c.id,
  NULL,
  '모비 데모 본사',
  '본사 조직 단위 (branch 미연결)',
  NULL,
  NULL,
  9.0,
  3,
  '개발 검증용'
FROM public.company c
WHERE c.code = 'COMP-DEMO-001'
ON CONFLICT (code) DO UPDATE SET
  legacy_system = EXCLUDED.legacy_system,
  site_legacy_code = EXCLUDED.site_legacy_code,
  org_level_type = EXCLUDED.org_level_type,
  company_id = EXCLUDED.company_id,
  branch_id = EXCLUDED.branch_id,
  site_name = EXCLUDED.site_name,
  updated_at = NOW();

INSERT INTO public.site (code, legacy_system, site_legacy_code, org_level_type, company_id, branch_id, site_name, description, utc_offset_hours, site_type, remark)
SELECT
  'BR-SITE-DEMO-SEOUL',
  'cescoservice',
  'BR-SITE-DEMO-SEOUL-LEG',
  2,
  c.id,
  b.id,
  '서울 지사(조직 단위)',
  '지사 org_level — branch 마스터와 1:1 대응 예시',
  9.0,
  3,
  '개발 검증용'
FROM public.branch b
JOIN public.company c ON c.id = b.company_id
WHERE b.code = 'BR-DEMO-SEOUL'
ON CONFLICT (code) DO UPDATE SET
  legacy_system = EXCLUDED.legacy_system,
  site_legacy_code = EXCLUDED.site_legacy_code,
  org_level_type = EXCLUDED.org_level_type,
  company_id = EXCLUDED.company_id,
  branch_id = EXCLUDED.branch_id,
  site_name = EXCLUDED.site_name,
  updated_at = NOW();

INSERT INTO public.site (code, legacy_system, site_legacy_code, org_level_type, company_id, branch_id, site_name, description, latitude, longitude, utc_offset_hours, site_type, remark)
SELECT
  'SITE-DEMO-001',
  'cescoservice',
  'SITE-DEMO-001-LEG',
  3,
  c.id,
  NULL,
  '데모 1공장',
  '독립 현장 — branch_id 없이 company 만 연결',
  37.5665000,
  126.9780000,
  9.0,
  1,
  '개발 검증용'
FROM public.company c
WHERE c.code = 'COMP-DEMO-001'
ON CONFLICT (code) DO UPDATE SET
  legacy_system = EXCLUDED.legacy_system,
  site_legacy_code = EXCLUDED.site_legacy_code,
  org_level_type = EXCLUDED.org_level_type,
  company_id = EXCLUDED.company_id,
  branch_id = EXCLUDED.branch_id,
  site_name = EXCLUDED.site_name,
  description = EXCLUDED.description,
  utc_offset_hours = EXCLUDED.utc_offset_hours,
  updated_at = NOW();

INSERT INTO public.firmware (code, product_id, firmware_version, s3_key, checksum, size_bytes, release_notes, remark)
SELECT
  'FW-DEMO-1.0.0',
  p.id,
  '1.0.0',
  'dummy/firmware/mobi-gw/1.0.0.bin',
  'dummy-checksum',
  1048576,
  '개발 검증용 펌웨어',
  '개발 검증용'
FROM public.product p
WHERE p.code = 'PRD-MOBI-GW-001'
ON CONFLICT (code) DO UPDATE SET
  product_id = EXCLUDED.product_id,
  firmware_version = EXCLUDED.firmware_version,
  s3_key = EXCLUDED.s3_key,
  checksum = EXCLUDED.checksum,
  size_bytes = EXCLUDED.size_bytes,
  updated_at = NOW();

INSERT INTO public.device (device_code, hub_code, site_id, product_id, serial, firmware_version, firmware_id, last_seen_at, remark)
SELECT
  d.device_code,
  d.hub_code,
  s.id,
  p.id,
  d.serial,
  '1.0.0',
  f.id,
  d.last_seen_at,
  '개발 검증용'
FROM (
  VALUES
    ('DEV-DEMO-001', 'HUB-DEMO-A', 'SN-DEMO-001', NOW() - INTERVAL '2 minutes'),
    ('DEV-DEMO-002', 'HUB-DEMO-A', 'SN-DEMO-002', NOW() - INTERVAL '16 minutes')
) AS d(device_code, hub_code, serial, last_seen_at)
CROSS JOIN public.site s
CROSS JOIN public.product p
CROSS JOIN public.firmware f
WHERE s.code = 'SITE-DEMO-001'
  AND p.code = 'PRD-MOBI-GW-001'
  AND f.code = 'FW-DEMO-1.0.0'
ON CONFLICT (device_code) DO UPDATE SET
  hub_code = EXCLUDED.hub_code,
  site_id = EXCLUDED.site_id,
  product_id = EXCLUDED.product_id,
  firmware_version = EXCLUDED.firmware_version,
  firmware_id = EXCLUDED.firmware_id,
  last_seen_at = EXCLUDED.last_seen_at,
  updated_at = NOW();

-- 레거시 "user".scope_site_id (신규 RBAC SSOT 는 member)
UPDATE public."user" u
SET
  scope_site_id = s.id,
  updated_at = NOW()
FROM public.site s
WHERE u.code = 'USR-DEMO-OPS'
  AND s.code = 'SITE-DEMO-001';

-- -----------------------------------------------------------------------------
-- 1a2) 포털 메뉴·그룹 (website_menu / website_group / website_group_menu)
-- -----------------------------------------------------------------------------
INSERT INTO public.website_menu (tenant_id, menu_code, menu_name, menu_name_en, site_url, menu_level, parent_menu_code, remark)
SELECT c.id, v.menu_code, v.menu_name, v.menu_name_en, v.site_url, v.menu_level, v.parent_menu_code, '데모 메뉴'
FROM public.company c
CROSS JOIN (
  VALUES
    ('10', '대시보드', 'Dashboard', '/dashboard', 1, NULL::varchar),
    ('1010', '알람', 'Alarms', '/alarms', 2, '10'),
    ('1020', '텔레메트리', 'Telemetry', '/telemetry', 2, '10'),
    ('20', '관리', 'Admin', '/admin', 1, NULL::varchar),
    ('2010', '회원', 'Members', '/admin/members', 2, '20')
) AS v(menu_code, menu_name, menu_name_en, site_url, menu_level, parent_menu_code)
WHERE c.code = 'COMP-DEMO-001'
ON CONFLICT (tenant_id, menu_code) DO UPDATE SET
  menu_name = EXCLUDED.menu_name,
  menu_name_en = EXCLUDED.menu_name_en,
  site_url = EXCLUDED.site_url,
  menu_level = EXCLUDED.menu_level,
  parent_menu_code = EXCLUDED.parent_menu_code,
  updated_at = NOW();

INSERT INTO public.website_group (tenant_id, group_code, group_name, group_seq, auth_type, remark)
SELECT c.id, v.group_code, v.group_name, v.group_seq, v.auth_type, '데모 그룹'
FROM public.company c
CROSS JOIN (
  VALUES
    ('WG-DEMO-USER', '일반 사용자 메뉴', 10, 1),
    ('WG-DEMO-ADMIN', '관리자 메뉴', 20, 9)
) AS v(group_code, group_name, group_seq, auth_type)
WHERE c.code = 'COMP-DEMO-001'
ON CONFLICT (tenant_id, group_code) DO UPDATE SET
  group_name = EXCLUDED.group_name,
  group_seq = EXCLUDED.group_seq,
  auth_type = EXCLUDED.auth_type,
  updated_at = NOW();

INSERT INTO public.website_group_menu (tenant_id, group_id, menu_id, is_insert, is_modify, is_delete, is_excel)
SELECT c.id, sg.id, sm.id, TRUE, TRUE, FALSE, TRUE
FROM public.company c
JOIN public.website_group sg ON sg.tenant_id = c.id AND sg.group_code = 'WG-DEMO-USER'
JOIN public.website_menu sm ON sm.tenant_id = c.id AND sm.menu_code IN ('10', '1010', '1020')
WHERE c.code = 'COMP-DEMO-001'
ON CONFLICT (tenant_id, group_id, menu_id) DO UPDATE SET is_use = TRUE;

INSERT INTO public.website_group_menu (tenant_id, group_id, menu_id, is_insert, is_modify, is_delete, is_excel, is_special)
SELECT c.id, sg.id, sm.id, TRUE, TRUE, TRUE, TRUE, TRUE
FROM public.company c
JOIN public.website_group sg ON sg.tenant_id = c.id AND sg.group_code = 'WG-DEMO-ADMIN'
JOIN public.website_menu sm ON sm.tenant_id = c.id
WHERE c.code = 'COMP-DEMO-001'
ON CONFLICT (tenant_id, group_id, menu_id) DO UPDATE SET is_use = TRUE;

-- -----------------------------------------------------------------------------
-- 1b) member · member_permission ("user" 와 분리)
-- -----------------------------------------------------------------------------
INSERT INTO public.member (
  code, tenant_id, user_id, company_id, branch_id, site_id,
  member_role_type, member_status_type, auth_type, website_group_id, is_primary, remark
)
SELECT
  'MEM-DEMO-TENANT-ADMIN',
  c.id,
  u.id,
  c.id,
  NULL,
  NULL,
  3,
  1,
  9,
  sg.id,
  TRUE,
  '테넌트 관리자 멤버십'
FROM public."user" u
CROSS JOIN public.company c
JOIN public.website_group sg ON sg.tenant_id = c.id AND sg.group_code = 'WG-DEMO-ADMIN' AND sg.auth_type = 9
WHERE u.code = 'USR-DEMO-ADMIN' AND c.code = 'COMP-DEMO-001'
ON CONFLICT (code) DO UPDATE SET
  member_role_type = EXCLUDED.member_role_type,
  member_status_type = EXCLUDED.member_status_type,
  auth_type = EXCLUDED.auth_type,
  website_group_id = EXCLUDED.website_group_id,
  is_primary = EXCLUDED.is_primary,
  updated_at = NOW();

INSERT INTO public.member (
  code, tenant_id, user_id, company_id, branch_id, site_id,
  member_role_type, member_status_type, auth_type, website_group_id, is_primary, remark
)
SELECT
  'MEM-DEMO-SITE-OPS',
  c.id,
  u.id,
  c.id,
  b.id,
  s.id,
  1,
  1,
  1,
  sg.id,
  TRUE,
  '사이트 운영자 멤버십'
FROM public."user" u
JOIN public.company c ON c.code = 'COMP-DEMO-001'
JOIN public.branch b ON b.code = 'BR-DEMO-SEOUL' AND b.company_id = c.id
JOIN public.site s ON s.code = 'SITE-DEMO-001' AND s.company_id = c.id
JOIN public.website_group sg ON sg.tenant_id = c.id AND sg.group_code = 'WG-DEMO-USER' AND sg.auth_type = 1
WHERE u.code = 'USR-DEMO-OPS'
ON CONFLICT (code) DO UPDATE SET
  branch_id = EXCLUDED.branch_id,
  site_id = EXCLUDED.site_id,
  member_role_type = EXCLUDED.member_role_type,
  auth_type = EXCLUDED.auth_type,
  website_group_id = EXCLUDED.website_group_id,
  updated_at = NOW();

INSERT INTO public.member_permission (member_id, permission_type, created_id)
SELECT m.id, p.permission_type, admin_u.id
FROM public.member m
JOIN public."user" admin_u ON admin_u.code = 'USR-DEMO-ADMIN'
CROSS JOIN (
  VALUES (3), (8)
) AS p(permission_type)
WHERE m.code = 'MEM-DEMO-TENANT-ADMIN'
ON CONFLICT (member_id, permission_type) DO UPDATE SET
  is_use = TRUE,
  updated_at = NOW();

INSERT INTO public.member_permission (member_id, permission_type, created_id)
SELECT m.id, p.permission_type, admin_u.id
FROM public.member m
JOIN public."user" admin_u ON admin_u.code = 'USR-DEMO-ADMIN'
CROSS JOIN (
  VALUES (1), (4), (6)
) AS p(permission_type)
WHERE m.code = 'MEM-DEMO-SITE-OPS'
ON CONFLICT (member_id, permission_type) DO UPDATE SET
  is_use = TRUE,
  updated_at = NOW();

-- -----------------------------------------------------------------------------
-- 2) 알람 메시지·룰셋 미러
-- -----------------------------------------------------------------------------
INSERT INTO public.alert (
  alert_code,
  domain_type,
  alarm_grade_type,
  severity_type,
  language_code,
  title,
  body,
  created_id,
  updated_id,
  yyyymmddhh
)
SELECT
  'COMM_QUALITY_HEARTBEAT_MISSED',
  1,
  1,
  3,
  'ko',
  '통신 품질 알람',
  '{{device_code}} 단말의 heartbeat 누락이 {{missed_count}}회 감지되었습니다.',
  u.id,
  u.id,
  2026042506
FROM public."user" u
WHERE u.code = 'USR-DEMO-ADMIN'
ON CONFLICT (alert_code, language_code) DO UPDATE SET
  domain_type = EXCLUDED.domain_type,
  alarm_grade_type = EXCLUDED.alarm_grade_type,
  severity_type = EXCLUDED.severity_type,
  title = EXCLUDED.title,
  body = EXCLUDED.body,
  updated_id = EXCLUDED.updated_id,
  updated_at = NOW(),
  yyyymmddhh = EXCLUDED.yyyymmddhh;

INSERT INTO public.alert (
  alert_code,
  domain_type,
  alarm_grade_type,
  severity_type,
  language_code,
  title,
  body,
  created_id,
  updated_id,
  yyyymmddhh
)
SELECT
  'COMM_QUALITY_HEARTBEAT_MISSED',
  1,
  1,
  3,
  'en',
  'Communication quality alert',
  'Heartbeat missed {{missed_count}} times on device {{device_code}}.',
  u.id,
  u.id,
  2026042506
FROM public."user" u
WHERE u.code = 'USR-DEMO-ADMIN'
ON CONFLICT (alert_code, language_code) DO UPDATE SET
  title = EXCLUDED.title,
  body = EXCLUDED.body,
  updated_id = EXCLUDED.updated_id,
  updated_at = NOW(),
  yyyymmddhh = EXCLUDED.yyyymmddhh;

INSERT INTO public.notification_ruleset (
  tenant_id,
  ruleset_code,
  ruleset_name,
  enabled,
  source_yaml_hash,
  revision,
  synced_at,
  ruleset_json,
  remark
)
SELECT
  c.id,
  'RS-COMM-QUALITY-DEMO',
  '통신 품질 데모 룰셋',
  TRUE,
  'dummy-yaml-hash',
  1,
  NOW(),
  '{"domain":"communication_quality","window":"10m","source":"dummy"}'::jsonb,
  '개발 검증용'
FROM public.company c
WHERE c.code = 'COMP-DEMO-001'
  AND NOT EXISTS (
    SELECT 1
    FROM public.notification_ruleset r
    WHERE r.tenant_id = c.id
      AND r.ruleset_code = 'RS-COMM-QUALITY-DEMO'
      AND r.revision = 1
  );

INSERT INTO public.notification_rule (
  notification_ruleset_id,
  rule_code,
  metric,
  compare,
  threshold_value,
  severity_type,
  notification_message_code,
  rule_json,
  remark
)
SELECT
  r.id,
  'RULE-HEARTBEAT-MISSED',
  'missed_heartbeat_intervals',
  'gte',
  3,
  3,
  'COMM_QUALITY_HEARTBEAT_MISSED',
  '{"metric":"missed_heartbeat_intervals","compare":"gte","threshold":3}'::jsonb,
  '개발 검증용'
FROM public.notification_ruleset r
JOIN public.company c ON c.id = r.tenant_id
WHERE c.code = 'COMP-DEMO-001'
  AND r.ruleset_code = 'RS-COMM-QUALITY-DEMO'
  AND r.revision = 1
ON CONFLICT (notification_ruleset_id, rule_code) DO UPDATE SET
  metric = EXCLUDED.metric,
  compare = EXCLUDED.compare,
  threshold_value = EXCLUDED.threshold_value,
  severity_type = EXCLUDED.severity_type,
  notification_message_code = EXCLUDED.notification_message_code,
  rule_json = EXCLUDED.rule_json,
  updated_at = NOW();

INSERT INTO public.notification_ruleset_composite_trigger (
  notification_ruleset_id,
  trigger_code,
  notification_message_code,
  severity_type,
  expression_json,
  remark
)
SELECT
  r.id,
  'TRG-COMM-QUALITY-DEGRADED',
  'COMM_QUALITY_HEARTBEAT_MISSED',
  3,
  '{"and":[{"metric":"missed_heartbeat_intervals","gte":3},{"metric":"packet_loss_percent","gte":10}]}'::jsonb,
  '개발 검증용'
FROM public.notification_ruleset r
JOIN public.company c ON c.id = r.tenant_id
WHERE c.code = 'COMP-DEMO-001'
  AND r.ruleset_code = 'RS-COMM-QUALITY-DEMO'
  AND r.revision = 1
ON CONFLICT (notification_ruleset_id, trigger_code) DO UPDATE SET
  notification_message_code = EXCLUDED.notification_message_code,
  severity_type = EXCLUDED.severity_type,
  expression_json = EXCLUDED.expression_json,
  updated_at = NOW();

INSERT INTO public.alarm_user_condition (
  tenant_id,
  scope_kind,
  scope_id,
  condition_code,
  condition_name,
  expression_json,
  evaluator_kind,
  condition_version,
  remark
)
SELECT
  c.id,
  'site',
  s.id,
  'COND-SITE-COMM-DEGRADED',
  '사이트 통신 품질 저하 조건',
  '{"and":[{"field":"missed_heartbeat_intervals","op":"gte","value":3},{"field":"source_event_count","op":"gte","value":1}]}'::jsonb,
  'condition_tree',
  1,
  '개발 검증용'
FROM public.company c
JOIN public.site s ON s.code = 'SITE-DEMO-001' AND s.company_id = c.id
WHERE c.code = 'COMP-DEMO-001'
  AND NOT EXISTS (
    SELECT 1
    FROM public.alarm_user_condition auc
    WHERE auc.tenant_id = c.id
      AND auc.scope_kind = 'site'
      AND auc.scope_id = s.id
      AND auc.condition_code = 'COND-SITE-COMM-DEGRADED'
      AND auc.condition_version = 1
  );

-- -----------------------------------------------------------------------------
-- 3) 통신 품질 롤업·알람 인시던트·알림 이력
-- -----------------------------------------------------------------------------
INSERT INTO public.communication_quality_rollup (
  tenant_id,
  device_id,
  site_id,
  product_id,
  device_code,
  source_window_start_ms,
  source_window_end_ms,
  source_created_10min_min,
  source_created_10min_max,
  source_event_keys,
  source_event_count,
  expected_heartbeat_count,
  observed_heartbeat_count,
  missed_heartbeat_intervals,
  latency_ms,
  packet_loss_percent,
  ruleset_code,
  batch_run_code,
  remark
)
SELECT
  c.id,
  d.id,
  s.id,
  p.id,
  d.device_code,
  1777081800000,
  1777082400000,
  202604250630,
  202604250630,
  jsonb_build_array('evt-demo-001', 'evt-demo-002'),
  2,
  6,
  CASE WHEN d.device_code = 'DEV-DEMO-001' THEN 6 ELSE 2 END,
  CASE WHEN d.device_code = 'DEV-DEMO-001' THEN 0 ELSE 4 END,
  CASE WHEN d.device_code = 'DEV-DEMO-001' THEN 80.125 ELSE 730.250 END,
  CASE WHEN d.device_code = 'DEV-DEMO-001' THEN 0.5000 ELSE 18.2500 END,
  'RS-COMM-QUALITY-DEMO',
  'BATCH-DEMO-202604250630',
  '개발 검증용'
FROM public.device d
JOIN public.site s ON s.id = d.site_id
LEFT JOIN public.branch b ON b.id = s.branch_id
JOIN public.company c ON c.id = COALESCE(s.company_id, b.company_id)
JOIN public.product p ON p.id = d.product_id
WHERE c.code = 'COMP-DEMO-001'
  AND d.device_code IN ('DEV-DEMO-001', 'DEV-DEMO-002')
ON CONFLICT (tenant_id, device_code, source_window_start_ms) DO UPDATE SET
  device_id = EXCLUDED.device_id,
  site_id = EXCLUDED.site_id,
  product_id = EXCLUDED.product_id,
  source_window_end_ms = EXCLUDED.source_window_end_ms,
  source_event_keys = EXCLUDED.source_event_keys,
  source_event_count = EXCLUDED.source_event_count,
  expected_heartbeat_count = EXCLUDED.expected_heartbeat_count,
  observed_heartbeat_count = EXCLUDED.observed_heartbeat_count,
  missed_heartbeat_intervals = EXCLUDED.missed_heartbeat_intervals,
  latency_ms = EXCLUDED.latency_ms,
  packet_loss_percent = EXCLUDED.packet_loss_percent,
  ruleset_code = EXCLUDED.ruleset_code,
  batch_run_code = EXCLUDED.batch_run_code;

INSERT INTO public.communication_quality_rollup_site (
  tenant_id,
  site_id,
  product_id,
  source_window_start_ms,
  source_window_end_ms,
  source_created_10min_min,
  source_created_10min_max,
  device_count,
  degraded_device_count,
  offline_device_count,
  avg_latency_ms,
  max_latency_ms,
  avg_packet_loss_percent,
  total_missed_heartbeat_intervals,
  source_rollup_id_from,
  source_rollup_id_to,
  ruleset_code,
  batch_run_code,
  remark
)
SELECT
  c.id,
  s.id,
  p.id,
  1777081800000,
  1777082400000,
  202604250630,
  202604250630,
  COUNT(*),
  COUNT(*) FILTER (WHERE r.missed_heartbeat_intervals > 0),
  0,
  AVG(r.latency_ms),
  MAX(r.latency_ms),
  AVG(r.packet_loss_percent),
  SUM(r.missed_heartbeat_intervals),
  MIN(r.id),
  MAX(r.id),
  'RS-COMM-QUALITY-DEMO',
  'BATCH-DEMO-202604250630',
  '개발 검증용'
FROM public.communication_quality_rollup r
JOIN public.site s ON s.id = r.site_id
LEFT JOIN public.branch b ON b.id = s.branch_id
JOIN public.company c ON c.id = COALESCE(s.company_id, b.company_id)
JOIN public.product p ON p.id = r.product_id
WHERE c.code = 'COMP-DEMO-001'
  AND s.code = 'SITE-DEMO-001'
  AND p.code = 'PRD-MOBI-GW-001'
  AND r.source_window_start_ms = 1777081800000
GROUP BY c.id, s.id, p.id
HAVING NOT EXISTS (
  SELECT 1
  FROM public.communication_quality_rollup_site site_rollup
  WHERE site_rollup.tenant_id = c.id
    AND site_rollup.site_id = s.id
    AND site_rollup.product_id = p.id
    AND site_rollup.source_window_start_ms = 1777081800000
);

INSERT INTO public.communication_alarm_incident (
  tenant_id,
  alert_code,
  alarm_type_code,
  ruleset_code,
  rule_code,
  severity_type,
  alarm_grade_type,
  incident_status,
  company_id,
  branch_id,
  site_id,
  product_id,
  device_id,
  device_code,
  quality_grade_at_open,
  comm_error_count_at_open,
  opened_at,
  remark
)
SELECT
  c.id,
  'COMM_QUALITY_HEARTBEAT_MISSED',
  'heartbeat_missed',
  'RS-COMM-QUALITY-DEMO',
  'RULE-HEARTBEAT-MISSED',
  3,
  1,
  'open',
  c.id,
  b.id,
  s.id,
  p.id,
  d.id,
  d.device_code,
  'bad',
  4,
  NOW() - INTERVAL '5 minutes',
  '개발 검증용'
FROM public.device d
JOIN public.site s ON s.id = d.site_id
LEFT JOIN public.branch b ON b.id = s.branch_id
JOIN public.company c ON c.id = COALESCE(s.company_id, b.company_id)
JOIN public.product p ON p.id = d.product_id
WHERE d.device_code = 'DEV-DEMO-002'
  AND NOT EXISTS (
    SELECT 1
    FROM public.communication_alarm_incident i
    WHERE i.alert_code = 'COMM_QUALITY_HEARTBEAT_MISSED'
      AND i.device_code = d.device_code
      AND i.incident_status = 'open'
  );

INSERT INTO public.notification (
  tenant_id,
  alert_code,
  language_code,
  incident_id,
  company_id,
  branch_id,
  site_id,
  product_id,
  device_id,
  channel,
  recipient_user_id,
  recipient_destination,
  placeholders_json,
  rendered_title,
  rendered_body,
  notification_status,
  sent_at,
  created_id,
  updated_id
)
SELECT
  c.id,
  i.alert_code,
  'ko',
  i.id,
  c.id,
  b.id,
  s.id,
  p.id,
  d.id,
  'in_app',
  u.id,
  'USR-DEMO-OPS',
  jsonb_build_object('device_code', d.device_code, 'missed_count', 4, 'site_name', s.site_name),
  '통신 품질 알람',
  d.device_code || ' 단말의 heartbeat 누락이 4회 감지되었습니다.',
  'sent',
  NOW() - INTERVAL '4 minutes',
  admin_user.id,
  admin_user.id
FROM public.communication_alarm_incident i
JOIN public.device d ON d.id = i.device_id
JOIN public.site s ON s.id = d.site_id
LEFT JOIN public.branch b ON b.id = s.branch_id
JOIN public.company c ON c.id = COALESCE(s.company_id, b.company_id)
JOIN public.product p ON p.id = d.product_id
JOIN public."user" u ON u.code = 'USR-DEMO-OPS'
JOIN public."user" admin_user ON admin_user.code = 'USR-DEMO-ADMIN'
WHERE i.alert_code = 'COMM_QUALITY_HEARTBEAT_MISSED'
  AND i.device_code = 'DEV-DEMO-002'
  AND i.incident_status = 'open'
  AND NOT EXISTS (
    SELECT 1
    FROM public.notification n
    WHERE n.incident_id = i.id
      AND n.channel = 'in_app'
      AND n.recipient_user_id = u.id
      AND n.language_code = 'ko'
  );

-- 동일 인시던트·수신자 — 영문 로케 별도 발송 이력(언어별 파이프라인)
INSERT INTO public.notification (
  tenant_id,
  alert_code,
  language_code,
  incident_id,
  company_id,
  branch_id,
  site_id,
  product_id,
  device_id,
  channel,
  recipient_user_id,
  recipient_destination,
  placeholders_json,
  rendered_title,
  rendered_body,
  notification_status,
  sent_at,
  created_id,
  updated_id
)
SELECT
  c.id,
  i.alert_code,
  'en',
  i.id,
  c.id,
  b.id,
  s.id,
  p.id,
  d.id,
  'in_app',
  u.id,
  'USR-DEMO-OPS',
  jsonb_build_object('device_code', d.device_code, 'missed_count', 4, 'site_name', s.site_name),
  'Communication quality alert',
  'Heartbeat missed 4 times on device ' || d.device_code || '.',
  'sent',
  NOW() - INTERVAL '4 minutes',
  admin_user.id,
  admin_user.id
FROM public.communication_alarm_incident i
JOIN public.device d ON d.id = i.device_id
JOIN public.site s ON s.id = d.site_id
LEFT JOIN public.branch b ON b.id = s.branch_id
JOIN public.company c ON c.id = COALESCE(s.company_id, b.company_id)
JOIN public.product p ON p.id = d.product_id
JOIN public."user" u ON u.code = 'USR-DEMO-OPS'
JOIN public."user" admin_user ON admin_user.code = 'USR-DEMO-ADMIN'
WHERE i.alert_code = 'COMM_QUALITY_HEARTBEAT_MISSED'
  AND i.device_code = 'DEV-DEMO-002'
  AND i.incident_status = 'open'
  AND NOT EXISTS (
    SELECT 1
    FROM public.notification n
    WHERE n.incident_id = i.id
      AND n.channel = 'in_app'
      AND n.recipient_user_id = u.id
      AND n.language_code = 'en'
  );

INSERT INTO public.telemetry_site_product_time_series (
  tenant_id,
  site_id,
  product_id,
  granularity,
  bucket_start,
  bucket_end,
  metric_values,
  source_device_count,
  source_event_count,
  batch_run_code,
  remark
)
SELECT
  c.id,
  s.id,
  p.id,
  'day',
  TIMESTAMPTZ '2026-04-25 00:00:00+00',
  TIMESTAMPTZ '2026-04-26 00:00:00+00',
  '{"temperature_avg":24.7,"humidity_avg":51.2,"rssi_avg":-63}'::jsonb,
  2,
  24,
  'BATCH-DEMO-20260425-DAY',
  '개발 검증용'
FROM public.company c
JOIN public.site s ON s.code = 'SITE-DEMO-001' AND s.company_id = c.id
JOIN public.product p ON p.code = 'PRD-MOBI-GW-001'
WHERE c.code = 'COMP-DEMO-001'
ON CONFLICT (tenant_id, site_id, product_id, granularity, bucket_start) DO UPDATE SET
  bucket_end = EXCLUDED.bucket_end,
  metric_values = EXCLUDED.metric_values,
  source_device_count = EXCLUDED.source_device_count,
  source_event_count = EXCLUDED.source_event_count,
  batch_run_code = EXCLUDED.batch_run_code;

INSERT INTO public.telemetry_company_product_time_series (
  tenant_id,
  company_id,
  product_id,
  granularity,
  bucket_start,
  bucket_end,
  metric_values,
  source_site_count,
  batch_run_code,
  remark
)
SELECT
  c.id,
  c.id,
  p.id,
  'day',
  TIMESTAMPTZ '2026-04-25 00:00:00+00',
  TIMESTAMPTZ '2026-04-26 00:00:00+00',
  '{"temperature_avg":24.7,"humidity_avg":51.2}'::jsonb,
  1,
  'BATCH-DEMO-20260425-DAY',
  '개발 검증용'
FROM public.company c
JOIN public.product p ON p.code = 'PRD-MOBI-GW-001'
WHERE c.code = 'COMP-DEMO-001'
ON CONFLICT (tenant_id, company_id, product_id, granularity, bucket_start) DO UPDATE SET
  bucket_end = EXCLUDED.bucket_end,
  metric_values = EXCLUDED.metric_values,
  source_site_count = EXCLUDED.source_site_count,
  batch_run_code = EXCLUDED.batch_run_code;

INSERT INTO public.telemetry_brand_product_time_series (
  tenant_id,
  brand_id,
  product_id,
  granularity,
  bucket_start,
  bucket_end,
  metric_values,
  source_site_count,
  batch_run_code,
  remark
)
SELECT
  c.id,
  1001,
  p.id,
  'day',
  TIMESTAMPTZ '2026-04-25 00:00:00+00',
  TIMESTAMPTZ '2026-04-26 00:00:00+00',
  '{"temperature_avg":24.7,"humidity_avg":51.2}'::jsonb,
  1,
  'BATCH-DEMO-20260425-DAY',
  '개발 검증용'
FROM public.company c
JOIN public.product p ON p.code = 'PRD-MOBI-GW-001'
WHERE c.code = 'COMP-DEMO-001'
ON CONFLICT (tenant_id, brand_id, product_id, granularity, bucket_start) DO UPDATE SET
  bucket_end = EXCLUDED.bucket_end,
  metric_values = EXCLUDED.metric_values,
  source_site_count = EXCLUDED.source_site_count,
  batch_run_code = EXCLUDED.batch_run_code;

INSERT INTO public.industry_aggregate_daily (
  company_id,
  branch_id,
  site_id,
  product_id,
  domain_code,
  scenario_code,
  base_day,
  metric_values,
  metric_values_kv
)
VALUES (
  'COMP-DEMO-001',
  'BR-DEMO-SEOUL',
  'SITE-DEMO-001',
  'PRD-MOBI-GW-001',
  'energy_efficiency',
  'weather_adjusted',
  DATE '2026-04-25',
  '{"baseline_kwh":1000.0,"optimized_kwh":820.0,"saving_kwh":180.0,"efficiency_pct":18.0,"weather_adjusted_pct":17.3,"confidence_score":0.92}'::jsonb,
  '[{"metric":"baseline_kwh","value":1000.0,"unit":"kWh"},{"metric":"optimized_kwh","value":820.0,"unit":"kWh"},{"metric":"saving_kwh","value":180.0,"unit":"kWh"},{"metric":"efficiency_pct","value":18.0,"unit":"pct"},{"metric":"weather_adjusted_pct","value":17.3,"unit":"pct"},{"metric":"confidence_score","value":0.92}]'::jsonb
)
ON CONFLICT (company_id, site_id, product_id, domain_code, scenario_code, base_day) DO UPDATE SET
  metric_values = EXCLUDED.metric_values,
  metric_values_kv = EXCLUDED.metric_values_kv;

INSERT INTO public.industry_aggregate_monthly (
  company_id,
  branch_id,
  site_id,
  product_id,
  domain_code,
  scenario_code,
  base_month,
  metric_values,
  metric_values_kv
)
VALUES (
  'COMP-DEMO-001',
  'BR-DEMO-SEOUL',
  'SITE-DEMO-001',
  'PRD-MOBI-GW-001',
  'energy_efficiency',
  'weather_adjusted',
  '2026-04',
  '{"baseline_kwh":30000.0,"optimized_kwh":24600.0,"saving_kwh":5400.0,"efficiency_pct":18.0,"weather_adjusted_pct":17.5,"confidence_score":0.91}'::jsonb,
  '[{"metric":"baseline_kwh","value":30000.0,"unit":"kWh"},{"metric":"optimized_kwh","value":24600.0,"unit":"kWh"},{"metric":"saving_kwh","value":5400.0,"unit":"kWh"},{"metric":"efficiency_pct","value":18.0,"unit":"pct"},{"metric":"weather_adjusted_pct","value":17.5,"unit":"pct"},{"metric":"confidence_score","value":0.91}]'::jsonb
)
ON CONFLICT (company_id, site_id, product_id, domain_code, scenario_code, base_month) DO UPDATE SET
  metric_values = EXCLUDED.metric_values,
  metric_values_kv = EXCLUDED.metric_values_kv;

INSERT INTO public.industry_aggregate_yearly (
  company_id,
  branch_id,
  site_id,
  product_id,
  domain_code,
  scenario_code,
  base_year,
  metric_values,
  metric_values_kv
)
VALUES (
  'COMP-DEMO-001',
  'BR-DEMO-SEOUL',
  'SITE-DEMO-001',
  'PRD-MOBI-GW-001',
  'energy_efficiency',
  'weather_adjusted',
  '2026',
  '{"baseline_kwh":365000.0,"optimized_kwh":299300.0,"saving_kwh":65700.0,"efficiency_pct":18.0,"weather_adjusted_pct":17.4,"confidence_score":0.90}'::jsonb,
  '[{"metric":"baseline_kwh","value":365000.0,"unit":"kWh"},{"metric":"optimized_kwh","value":299300.0,"unit":"kWh"},{"metric":"saving_kwh","value":65700.0,"unit":"kWh"},{"metric":"efficiency_pct","value":18.0,"unit":"pct"},{"metric":"weather_adjusted_pct","value":17.4,"unit":"pct"},{"metric":"confidence_score","value":0.90}]'::jsonb
)
ON CONFLICT (company_id, site_id, product_id, domain_code, scenario_code, base_year) DO UPDATE SET
  metric_values = EXCLUDED.metric_values,
  metric_values_kv = EXCLUDED.metric_values_kv;

COMMIT;
