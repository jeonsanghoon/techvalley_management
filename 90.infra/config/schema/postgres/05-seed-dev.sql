-- =============================================================================
-- 테크밸리 개발 시드 — UI mock·로컬 E2E 정합
-- 적용: 01 → 02 → 04 → 05 (03-seed-reference.sql 은 풀 더미 참고용)
-- =============================================================================

BEGIN;

INSERT INTO public."user" (code, email, user_name, auth_type, account_status, email_verified_at, approved_at, remark)
VALUES
  ('USR-TV-ADMIN', 'admin@techvalley.local', '테크밸리 관리자', 10, 'active', NOW(), NOW(), '로컬 개발'),
  ('USR-TV-OPS', 'ops@techvalley.local', '현장 운영자', 1, 'active', NOW(), NOW(), '로컬 개발')
ON CONFLICT (code) DO UPDATE SET updated_at = NOW();

-- 로컬 JWT 로그인용 demo-password (bcrypt)
UPDATE public."user"
SET password_hash = '$2b$10$DCSBPdhdfWhzs.Suf0hOe.vdbaLWqVcpKZpUFmEr97eM4XbXKy8zO'
WHERE code IN ('USR-TV-ADMIN', 'USR-TV-OPS');

INSERT INTO public.language (code, language_name, locale, is_default, sort_order)
VALUES
  ('ko', '한국어', 'ko-KR', TRUE, 1),
  ('en', 'English', 'en-US', FALSE, 2)
ON CONFLICT (code) DO UPDATE SET updated_at = NOW();

INSERT INTO public.company (code, company_name, description, remark)
VALUES ('TV-CUST-001', '테크밸리 데모 고객사', '기능검증용 고객사', 'UI customers')
ON CONFLICT (code) DO UPDATE SET company_name = EXCLUDED.company_name, updated_at = NOW();

INSERT INTO public.product (code, product_name, description, remark)
VALUES ('TV-PRODUCT-XRAY', 'Techvalley X-Ray Line', '튜브·디텍터 검사 장비', '데모')
ON CONFLICT (code) DO UPDATE SET product_name = EXCLUDED.product_name, updated_at = NOW();

INSERT INTO public.branch (code, company_id, branch_name, branch_type, remark)
SELECT 'TV-BR-HQ', c.id, '본사', 1, '데모'
FROM public.company c WHERE c.code = 'TV-CUST-001'
ON CONFLICT (code) DO UPDATE SET branch_name = EXCLUDED.branch_name, updated_at = NOW();

INSERT INTO public.site (code, site_name, company_id, branch_id, site_type, org_level_type, remark)
SELECT 'TV-SITE-FACTORY-01', '수원 공장 1라인', c.id, b.id, 1, 3, '데모 설치현장'
FROM public.company c
JOIN public.branch b ON b.company_id = c.id AND b.code = 'TV-BR-HQ'
WHERE c.code = 'TV-CUST-001'
ON CONFLICT (code) DO UPDATE SET site_name = EXCLUDED.site_name, updated_at = NOW();

INSERT INTO public.device (
  device_code, site_id, product_id, serial, operational_status_type, remark
)
SELECT 'HK-2024-00158', s.id, p.id, 'SN-HK-2024-00158', 1, '샘플 장비 S/N'
FROM public.site s
JOIN public.product p ON p.code = 'TV-PRODUCT-XRAY'
WHERE s.code = 'TV-SITE-FACTORY-01'
ON CONFLICT (device_code) DO UPDATE SET serial = EXCLUDED.serial, updated_at = NOW();

INSERT INTO self_heal_playbooks (playbook_code, playbook_name, trigger_hint, steps_json, min_confidence)
VALUES (
  'edge-client-restart-v1',
  'Edge client 재시작',
  'edge_client',
  '[{"step":"evaluate","action":"check_spool"},{"step":"execute","action":"iot_job_restart_gg"}]'::jsonb,
  0.9
)
ON CONFLICT (playbook_code) DO NOTHING;

COMMIT;
