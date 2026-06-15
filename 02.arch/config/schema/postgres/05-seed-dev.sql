-- =============================================================================
-- 테크밸리 개발 시드 — UI mock·로컬 E2E 정합
-- 적용: 01 → 02 → 04 → 05 (03-seed-reference.sql 은 풀 더미 참고용)
-- =============================================================================

BEGIN;

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. 사용자
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO public."user" (code, email, user_name, auth_type, account_status, email_verified_at, approved_at, remark)
VALUES
  ('USR-TV-ADMIN',   'admin@techvalley.local',   '테크밸리 관리자', 10, 'active', NOW(), NOW(), '로컬 개발'),
  ('USR-TV-OPS',     'ops@techvalley.local',      '현장 운영자',     1,  'active', NOW(), NOW(), '로컬 개발'),
  ('USR-ENG-KIM',    'kim@techvalley.local',      '김민준',          1,  'active', NOW(), NOW(), '필드 엔지니어'),
  ('USR-ENG-LEE',    'lee@techvalley.local',      '이서연',          1,  'active', NOW(), NOW(), '필드 엔지니어'),
  ('USR-ENG-PARK',   'park@techvalley.local',     '박지호',          1,  'active', NOW(), NOW(), '필드 엔지니어'),
  ('USR-ENG-CHOI',   'choi@techvalley.local',     '최수아',          1,  'active', NOW(), NOW(), '필드 엔지니어')
ON CONFLICT (code) DO UPDATE SET updated_at = NOW();

-- 로컬 JWT 로그인용 demo-password (bcrypt)
UPDATE public."user"
SET password_hash = '$2b$10$DCSBPdhdfWhzs.Suf0hOe.vdbaLWqVcpKZpUFmEr97eM4XbXKy8zO'
WHERE code IN ('USR-TV-ADMIN', 'USR-TV-OPS', 'USR-ENG-KIM', 'USR-ENG-LEE', 'USR-ENG-PARK', 'USR-ENG-CHOI');

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. 언어
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO public.language (code, language_name, locale, is_default, sort_order)
VALUES
  ('ko', '한국어', 'ko-KR', TRUE,  1),
  ('en', 'English', 'en-US', FALSE, 2)
ON CONFLICT (code) DO UPDATE SET updated_at = NOW();

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. 고객사
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO public.company (code, company_name, description, company_type, region_label)
VALUES
  ('TV-CUST-001', '테크밸리 데모 고객사',  '기능검증용 고객사',         '고객사',    '경기'),
  ('TV-CUST-002', 'LG이노텍',             'LG이노텍 구미사업장',        '고객사',    '경북'),
  ('TV-CUST-003', 'SK hynix',             'SK하이닉스 이천캠퍼스',      '고객사',    '경기'),
  ('TV-CUST-004', '삼성전자',             '삼성전자 수원DS부문',         '고객사',    '경기'),
  ('TV-CUST-005', '현대자동차',           '현대차 울산공장',             '고객사',    '울산')
ON CONFLICT (code) DO UPDATE SET
  company_name = EXCLUDED.company_name,
  region_label = EXCLUDED.region_label,
  updated_at   = NOW();

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. 제품
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO public.product (code, product_name, description, remark)
VALUES ('TV-PRODUCT-XRAY', 'Techvalley X-Ray Line', '튜브·디텍터 검사 장비', '데모')
ON CONFLICT (code) DO UPDATE SET product_name = EXCLUDED.product_name, updated_at = NOW();

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. 지사 (branch)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO public.branch (code, company_id, branch_name, branch_type, remark)
SELECT 'TV-BR-HQ',      c.id, '본사',          1, '데모' FROM public.company c WHERE c.code = 'TV-CUST-001'
ON CONFLICT (code) DO UPDATE SET branch_name = EXCLUDED.branch_name, updated_at = NOW();

INSERT INTO public.branch (code, company_id, branch_name, branch_type, remark)
SELECT 'TV-BR-GUMI',    c.id, '구미사업장',     2, '데모' FROM public.company c WHERE c.code = 'TV-CUST-002'
ON CONFLICT (code) DO UPDATE SET branch_name = EXCLUDED.branch_name, updated_at = NOW();

INSERT INTO public.branch (code, company_id, branch_name, branch_type, remark)
SELECT 'TV-BR-ICHEON',  c.id, '이천캠퍼스',     2, '데모' FROM public.company c WHERE c.code = 'TV-CUST-003'
ON CONFLICT (code) DO UPDATE SET branch_name = EXCLUDED.branch_name, updated_at = NOW();

INSERT INTO public.branch (code, company_id, branch_name, branch_type, remark)
SELECT 'TV-BR-SUWON',   c.id, '수원DS센터',     2, '데모' FROM public.company c WHERE c.code = 'TV-CUST-004'
ON CONFLICT (code) DO UPDATE SET branch_name = EXCLUDED.branch_name, updated_at = NOW();

INSERT INTO public.branch (code, company_id, branch_name, branch_type, remark)
SELECT 'TV-BR-ULSAN',   c.id, '울산공장',        2, '데모' FROM public.company c WHERE c.code = 'TV-CUST-005'
ON CONFLICT (code) DO UPDATE SET branch_name = EXCLUDED.branch_name, updated_at = NOW();

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. 설치현장 (site) — 전국 9개소 (Korea lat/lng 포함)
-- ─────────────────────────────────────────────────────────────────────────────
-- 기존 수원 공장 lat/lng 업데이트
UPDATE public.site
SET latitude = 37.2636, longitude = 127.0286, region_label = '경기', geo_zone = 'korea',
    address = '경기도 수원시 팔달구 팔달로 1'
WHERE code = 'TV-SITE-FACTORY-01';

INSERT INTO public.site (code, site_name, company_id, branch_id, site_type, org_level_type,
                          latitude, longitude, region_label, geo_zone, address, remark)
SELECT 'TV-SITE-SUWON-02', '수원 공장 2라인', c.id, b.id, 1, 3,
       37.2800, 127.0430, '경기', 'korea', '경기도 수원시 영통구 영통로 1', '데모'
FROM public.company c JOIN public.branch b ON b.company_id = c.id AND b.code = 'TV-BR-HQ'
WHERE c.code = 'TV-CUST-001'
ON CONFLICT (code) DO UPDATE SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, updated_at = NOW();

INSERT INTO public.site (code, site_name, company_id, branch_id, site_type, org_level_type,
                          latitude, longitude, region_label, geo_zone, address, remark)
SELECT 'TV-SITE-BUSAN-01', '부산 물류센터', c.id, b.id, 1, 3,
       35.1796, 129.0756, '부산', 'korea', '부산광역시 해운대구 센텀중앙로 55', '데모'
FROM public.company c JOIN public.branch b ON b.company_id = c.id AND b.code = 'TV-BR-HQ'
WHERE c.code = 'TV-CUST-001'
ON CONFLICT (code) DO UPDATE SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, updated_at = NOW();

INSERT INTO public.site (code, site_name, company_id, branch_id, site_type, org_level_type,
                          latitude, longitude, region_label, geo_zone, address, remark)
SELECT 'TV-SITE-GUMI-01', '구미 생산라인 A', c.id, b.id, 1, 3,
       36.1197, 128.3446, '경북', 'korea', '경상북도 구미시 산동면 첨단기업로 1', '데모'
FROM public.company c JOIN public.branch b ON b.company_id = c.id AND b.code = 'TV-BR-GUMI'
WHERE c.code = 'TV-CUST-002'
ON CONFLICT (code) DO UPDATE SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, updated_at = NOW();

INSERT INTO public.site (code, site_name, company_id, branch_id, site_type, org_level_type,
                          latitude, longitude, region_label, geo_zone, address, remark)
SELECT 'TV-SITE-GUMI-02', '구미 생산라인 B', c.id, b.id, 1, 3,
       36.1280, 128.3520, '경북', 'korea', '경상북도 구미시 산동면 첨단기업로 25', '데모'
FROM public.company c JOIN public.branch b ON b.company_id = c.id AND b.code = 'TV-BR-GUMI'
WHERE c.code = 'TV-CUST-002'
ON CONFLICT (code) DO UPDATE SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, updated_at = NOW();

INSERT INTO public.site (code, site_name, company_id, branch_id, site_type, org_level_type,
                          latitude, longitude, region_label, geo_zone, address, remark)
SELECT 'TV-SITE-ICHEON-01', '이천 반도체 팹', c.id, b.id, 1, 3,
       37.2722, 127.4349, '경기', 'korea', '경기도 이천시 부발읍 경충대로 2091', '데모'
FROM public.company c JOIN public.branch b ON b.company_id = c.id AND b.code = 'TV-BR-ICHEON'
WHERE c.code = 'TV-CUST-003'
ON CONFLICT (code) DO UPDATE SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, updated_at = NOW();

INSERT INTO public.site (code, site_name, company_id, branch_id, site_type, org_level_type,
                          latitude, longitude, region_label, geo_zone, address, remark)
SELECT 'TV-SITE-SUWON-DS', '삼성 수원DS', c.id, b.id, 1, 3,
       37.3008, 127.0367, '경기', 'korea', '경기도 수원시 영통구 삼성로 1', '데모'
FROM public.company c JOIN public.branch b ON b.company_id = c.id AND b.code = 'TV-BR-SUWON'
WHERE c.code = 'TV-CUST-004'
ON CONFLICT (code) DO UPDATE SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, updated_at = NOW();

INSERT INTO public.site (code, site_name, company_id, branch_id, site_type, org_level_type,
                          latitude, longitude, region_label, geo_zone, address, remark)
SELECT 'TV-SITE-ULSAN-01', '울산 조립라인', c.id, b.id, 1, 3,
       35.5384, 129.3114, '울산', 'korea', '울산광역시 북구 산업로 915', '데모'
FROM public.company c JOIN public.branch b ON b.company_id = c.id AND b.code = 'TV-BR-ULSAN'
WHERE c.code = 'TV-CUST-005'
ON CONFLICT (code) DO UPDATE SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, updated_at = NOW();

INSERT INTO public.site (code, site_name, company_id, branch_id, site_type, org_level_type,
                          latitude, longitude, region_label, geo_zone, address, remark)
SELECT 'TV-SITE-DAEJEON-01', '대전 R&D센터', c.id, b.id, 1, 3,
       36.3504, 127.3845, '대전', 'korea', '대전광역시 유성구 테크노2로 55', '데모'
FROM public.company c JOIN public.branch b ON b.company_id = c.id AND b.code = 'TV-BR-HQ'
WHERE c.code = 'TV-CUST-001'
ON CONFLICT (code) DO UPDATE SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, updated_at = NOW();

-- ─────────────────────────────────────────────────────────────────────────────
-- 7. 장비 (device) — 총 10대, 다양한 상태
-- ─────────────────────────────────────────────────────────────────────────────

-- 기존 장비 portal_meta 보강
UPDATE public.device
SET portal_meta = '{"model":"HAWKEYE 1625","status":"online","slaTier":"Critical","serviceability":"즉시 원격가능","lat":37.2636,"lng":127.0286,"tubeLifePct":72,"detectorLifePct":85,"region":"경기","geoZone":"korea","installDate":"2024-03-15"}'::jsonb,
    last_seen_at = NOW()
WHERE device_code = 'HK-2024-00158';

-- 수원 공장 2라인 — alarm
INSERT INTO public.device (device_code, site_id, product_id, serial, operational_status_type, firmware_version, last_seen_at, portal_meta, remark)
SELECT 'HK-2024-00201', s.id, p.id, 'SN-HK-2024-00201', 1, 'v3.2.1', NOW() - INTERVAL '2 minutes',
  '{"model":"HAWKEYE 1625","status":"alarm","slaTier":"Critical","serviceability":"알람 대응 필요","lat":37.2800,"lng":127.0430,"tubeLifePct":34,"detectorLifePct":61,"region":"경기","geoZone":"korea","installDate":"2024-05-10"}'::jsonb,
  '알람 상태 장비'
FROM public.site s, public.product p
WHERE s.code = 'TV-SITE-SUWON-02' AND p.code = 'TV-PRODUCT-XRAY'
ON CONFLICT (device_code) DO UPDATE SET
  portal_meta = EXCLUDED.portal_meta, last_seen_at = EXCLUDED.last_seen_at, updated_at = NOW();

-- 부산 물류센터 — maintenance
INSERT INTO public.device (device_code, site_id, product_id, serial, operational_status_type, firmware_version, last_seen_at, portal_meta, remark)
SELECT 'HK-2024-00243', s.id, p.id, 'SN-HK-2024-00243', 1, 'v3.1.8', NOW() - INTERVAL '5 minutes',
  '{"model":"HAWKEYE 1630","status":"maintenance","slaTier":"Standard","serviceability":"정기점검 중","lat":35.1796,"lng":129.0756,"tubeLifePct":58,"detectorLifePct":43,"region":"부산","geoZone":"korea","installDate":"2023-11-20"}'::jsonb,
  '유지보수 중'
FROM public.site s, public.product p
WHERE s.code = 'TV-SITE-BUSAN-01' AND p.code = 'TV-PRODUCT-XRAY'
ON CONFLICT (device_code) DO UPDATE SET
  portal_meta = EXCLUDED.portal_meta, last_seen_at = EXCLUDED.last_seen_at, updated_at = NOW();

-- 부산 물류센터 — online
INSERT INTO public.device (device_code, site_id, product_id, serial, operational_status_type, firmware_version, last_seen_at, portal_meta, remark)
SELECT 'HK-2024-00459', s.id, p.id, 'SN-HK-2024-00459', 1, 'v3.2.1', NOW() - INTERVAL '1 minute',
  '{"model":"HAWKEYE 1625","status":"online","slaTier":"Standard","serviceability":"즉시 원격가능","lat":35.1850,"lng":129.0800,"tubeLifePct":89,"detectorLifePct":91,"region":"부산","geoZone":"korea","installDate":"2024-07-22"}'::jsonb,
  '정상 운영 중'
FROM public.site s, public.product p
WHERE s.code = 'TV-SITE-BUSAN-01' AND p.code = 'TV-PRODUCT-XRAY'
ON CONFLICT (device_code) DO UPDATE SET
  portal_meta = EXCLUDED.portal_meta, last_seen_at = EXCLUDED.last_seen_at, updated_at = NOW();

-- 구미 생산라인 A — alarm
INSERT INTO public.device (device_code, site_id, product_id, serial, operational_status_type, firmware_version, last_seen_at, portal_meta, remark)
SELECT 'HK-2024-00295', s.id, p.id, 'SN-HK-2024-00295', 1, 'v3.2.1', NOW() - INTERVAL '8 minutes',
  '{"model":"HAWKEYE 1625","status":"alarm","slaTier":"Critical","serviceability":"출동 필요","lat":36.1197,"lng":128.3446,"tubeLifePct":21,"detectorLifePct":55,"region":"경북","geoZone":"korea","installDate":"2023-09-05"}'::jsonb,
  '크리티컬 알람'
FROM public.site s, public.product p
WHERE s.code = 'TV-SITE-GUMI-01' AND p.code = 'TV-PRODUCT-XRAY'
ON CONFLICT (device_code) DO UPDATE SET
  portal_meta = EXCLUDED.portal_meta, last_seen_at = EXCLUDED.last_seen_at, updated_at = NOW();

-- 구미 생산라인 B — online
INSERT INTO public.device (device_code, site_id, product_id, serial, operational_status_type, firmware_version, last_seen_at, portal_meta, remark)
SELECT 'HK-2024-00512', s.id, p.id, 'SN-HK-2024-00512', 1, 'v3.2.1', NOW() - INTERVAL '3 minutes',
  '{"model":"HAWKEYE 1630","status":"online","slaTier":"Standard","serviceability":"즉시 원격가능","lat":36.1280,"lng":128.3520,"tubeLifePct":77,"detectorLifePct":82,"region":"경북","geoZone":"korea","installDate":"2024-01-18"}'::jsonb,
  '정상 운영 중'
FROM public.site s, public.product p
WHERE s.code = 'TV-SITE-GUMI-02' AND p.code = 'TV-PRODUCT-XRAY'
ON CONFLICT (device_code) DO UPDATE SET
  portal_meta = EXCLUDED.portal_meta, last_seen_at = EXCLUDED.last_seen_at, updated_at = NOW();

-- 이천 반도체 팹 — safe_mode
INSERT INTO public.device (device_code, site_id, product_id, serial, operational_status_type, firmware_version, last_seen_at, portal_meta, remark)
SELECT 'HK-2024-00376', s.id, p.id, 'SN-HK-2024-00376', 1, 'v3.1.8', NOW() - INTERVAL '15 minutes',
  '{"model":"HAWKEYE 1625","status":"safe_mode","slaTier":"Critical","serviceability":"안전모드 점검","lat":37.2722,"lng":127.4349,"tubeLifePct":45,"detectorLifePct":38,"region":"경기","geoZone":"korea","installDate":"2023-12-01"}'::jsonb,
  '안전모드 진입'
FROM public.site s, public.product p
WHERE s.code = 'TV-SITE-ICHEON-01' AND p.code = 'TV-PRODUCT-XRAY'
ON CONFLICT (device_code) DO UPDATE SET
  portal_meta = EXCLUDED.portal_meta, last_seen_at = EXCLUDED.last_seen_at, updated_at = NOW();

-- 삼성 수원DS — online
INSERT INTO public.device (device_code, site_id, product_id, serial, operational_status_type, firmware_version, last_seen_at, portal_meta, remark)
SELECT 'HK-2024-00411', s.id, p.id, 'SN-HK-2024-00411', 1, 'v3.2.1', NOW() - INTERVAL '1 minute',
  '{"model":"HAWKEYE 1625","status":"online","slaTier":"Standard","serviceability":"즉시 원격가능","lat":37.3008,"lng":127.0367,"tubeLifePct":93,"detectorLifePct":96,"region":"경기","geoZone":"korea","installDate":"2024-09-03"}'::jsonb,
  '신규 설치 정상'
FROM public.site s, public.product p
WHERE s.code = 'TV-SITE-SUWON-DS' AND p.code = 'TV-PRODUCT-XRAY'
ON CONFLICT (device_code) DO UPDATE SET
  portal_meta = EXCLUDED.portal_meta, last_seen_at = EXCLUDED.last_seen_at, updated_at = NOW();

-- 울산 조립라인 — offline
INSERT INTO public.device (device_code, site_id, product_id, serial, operational_status_type, firmware_version, last_seen_at, portal_meta, remark)
SELECT 'HK-2024-00332', s.id, p.id, 'SN-HK-2024-00332', 2, 'v3.1.5', NOW() - INTERVAL '3 hours',
  '{"model":"HAWKEYE 1620","status":"offline","slaTier":"Standard","serviceability":"연결 끊김","lat":35.5384,"lng":129.3114,"tubeLifePct":62,"detectorLifePct":74,"region":"울산","geoZone":"korea","installDate":"2023-08-14"}'::jsonb,
  '통신 두절'
FROM public.site s, public.product p
WHERE s.code = 'TV-SITE-ULSAN-01' AND p.code = 'TV-PRODUCT-XRAY'
ON CONFLICT (device_code) DO UPDATE SET
  portal_meta = EXCLUDED.portal_meta, last_seen_at = EXCLUDED.last_seen_at, updated_at = NOW();

-- 대전 R&D 센터 — online
INSERT INTO public.device (device_code, site_id, product_id, serial, operational_status_type, firmware_version, last_seen_at, portal_meta, remark)
SELECT 'HK-2024-00187', s.id, p.id, 'SN-HK-2024-00187', 1, 'v3.2.1', NOW() - INTERVAL '2 minutes',
  '{"model":"HAWKEYE 1630","status":"online","slaTier":"Standard","serviceability":"즉시 원격가능","lat":36.3504,"lng":127.3845,"tubeLifePct":65,"detectorLifePct":78,"region":"대전","geoZone":"korea","installDate":"2024-02-28"}'::jsonb,
  'R&D 테스트 장비'
FROM public.site s, public.product p
WHERE s.code = 'TV-SITE-DAEJEON-01' AND p.code = 'TV-PRODUCT-XRAY'
ON CONFLICT (device_code) DO UPDATE SET
  portal_meta = EXCLUDED.portal_meta, last_seen_at = EXCLUDED.last_seen_at, updated_at = NOW();

-- ─────────────────────────────────────────────────────────────────────────────
-- 8. 엔지니어 프로필
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO public.engineer_profile (user_id, display_name, region_label, specialty, availability_status)
SELECT u.id, '김민준', '경기', '["튜브","디텍터","전기"]'::jsonb, '출동가능'
FROM public."user" u WHERE u.code = 'USR-ENG-KIM'
ON CONFLICT (user_id) DO UPDATE SET
  display_name        = EXCLUDED.display_name,
  region_label        = EXCLUDED.region_label,
  availability_status = EXCLUDED.availability_status;

INSERT INTO public.engineer_profile (user_id, display_name, region_label, specialty, availability_status)
SELECT u.id, '이서연', '경남', '["튜브","고전압"]'::jsonb, '출동가능'
FROM public."user" u WHERE u.code = 'USR-ENG-LEE'
ON CONFLICT (user_id) DO UPDATE SET
  display_name        = EXCLUDED.display_name,
  region_label        = EXCLUDED.region_label,
  availability_status = EXCLUDED.availability_status;

INSERT INTO public.engineer_profile (user_id, display_name, region_label, specialty, availability_status)
SELECT u.id, '박지호', '경기', '["디텍터","전기","소프트웨어"]'::jsonb, '출동중'
FROM public."user" u WHERE u.code = 'USR-ENG-PARK'
ON CONFLICT (user_id) DO UPDATE SET
  display_name        = EXCLUDED.display_name,
  region_label        = EXCLUDED.region_label,
  availability_status = EXCLUDED.availability_status;

INSERT INTO public.engineer_profile (user_id, display_name, region_label, specialty, availability_status)
SELECT u.id, '최수아', '부산', '["전기","통신","튜브"]'::jsonb, '대기중'
FROM public."user" u WHERE u.code = 'USR-ENG-CHOI'
ON CONFLICT (user_id) DO UPDATE SET
  display_name        = EXCLUDED.display_name,
  region_label        = EXCLUDED.region_label,
  availability_status = EXCLUDED.availability_status;

-- ─────────────────────────────────────────────────────────────────────────────
-- 9. 알람 인시던트 (최근순 15건)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO public.communication_alarm_incident
  (tenant_id, alert_code, alarm_label, severity_type, alarm_grade_type,
   incident_status, handling_mode, device_code, device_id, site_id, company_id, opened_at)
SELECT
  c.id,
  'TUBE_LIFE_LOW',         '튜브 수명 임박 (21%)',
  1, 1, 'open',            'field_service_transfer',
  'HK-2024-00295',
  d.id, d.site_id, c.id,
  NOW() - INTERVAL '10 minutes'
FROM public.device d, public.company c
WHERE d.device_code = 'HK-2024-00295' AND c.code = 'TV-CUST-002';

INSERT INTO public.communication_alarm_incident
  (tenant_id, alert_code, alarm_label, severity_type, alarm_grade_type,
   incident_status, handling_mode, device_code, device_id, site_id, company_id, opened_at)
SELECT
  c.id,
  'COMM_ERROR_CRITICAL',   '통신 오류 연속 발생',
  1, 1, 'open',            'remote_diagnosis',
  'HK-2024-00201',
  d.id, d.site_id, c.id,
  NOW() - INTERVAL '25 minutes'
FROM public.device d, public.company c
WHERE d.device_code = 'HK-2024-00201' AND c.code = 'TV-CUST-001';

INSERT INTO public.communication_alarm_incident
  (tenant_id, alert_code, alarm_label, severity_type, alarm_grade_type,
   incident_status, handling_mode, device_code, device_id, site_id, company_id, opened_at)
SELECT
  c.id,
  'DETECTOR_LIFE_WARN',    '디텍터 수명 경고 (38%)',
  2, 1, 'acknowledged',    'remote_diagnosis',
  'HK-2024-00376',
  d.id, d.site_id, c.id,
  NOW() - INTERVAL '45 minutes'
FROM public.device d, public.company c
WHERE d.device_code = 'HK-2024-00376' AND c.code = 'TV-CUST-003';

INSERT INTO public.communication_alarm_incident
  (tenant_id, alert_code, alarm_label, severity_type, alarm_grade_type,
   incident_status, handling_mode, device_code, device_id, site_id, company_id, opened_at)
SELECT
  c.id,
  'DEVICE_OFFLINE',        '장비 오프라인 — 통신 두절',
  1, 1, 'in_progress',     'field_service_transfer',
  'HK-2024-00332',
  d.id, d.site_id, c.id,
  NOW() - INTERVAL '3 hours'
FROM public.device d, public.company c
WHERE d.device_code = 'HK-2024-00332' AND c.code = 'TV-CUST-005';

INSERT INTO public.communication_alarm_incident
  (tenant_id, alert_code, alarm_label, severity_type, alarm_grade_type,
   incident_status, handling_mode, device_code, device_id, site_id, company_id, opened_at)
SELECT
  c.id,
  'HV_SPIKE',              '고전압 스파이크 감지',
  2, 1, 'open',            'remote_diagnosis',
  'HK-2024-00243',
  d.id, d.site_id, c.id,
  NOW() - INTERVAL '1 hour 20 minutes'
FROM public.device d, public.company c
WHERE d.device_code = 'HK-2024-00243' AND c.code = 'TV-CUST-001';

INSERT INTO public.communication_alarm_incident
  (tenant_id, alert_code, alarm_label, severity_type, alarm_grade_type,
   incident_status, handling_mode, device_code, device_id, site_id, company_id, opened_at)
SELECT
  c.id,
  'PACKET_LOSS_HIGH',      '패킷 손실률 초과 (12.4%)',
  2, 1, 'resolved',        'remote_diagnosis',
  'HK-2024-00158',
  d.id, d.site_id, c.id,
  NOW() - INTERVAL '4 hours'
FROM public.device d, public.company c
WHERE d.device_code = 'HK-2024-00158' AND c.code = 'TV-CUST-001';

INSERT INTO public.communication_alarm_incident
  (tenant_id, alert_code, alarm_label, severity_type, alarm_grade_type,
   incident_status, handling_mode, device_code, device_id, site_id, company_id, opened_at)
SELECT
  c.id,
  'TUBE_LIFE_LOW',         '튜브 수명 34% 경고',
  2, 1, 'open',            'field_service_transfer',
  'HK-2024-00201',
  d.id, d.site_id, c.id,
  NOW() - INTERVAL '6 hours'
FROM public.device d, public.company c
WHERE d.device_code = 'HK-2024-00201' AND c.code = 'TV-CUST-001';

INSERT INTO public.communication_alarm_incident
  (tenant_id, alert_code, alarm_label, severity_type, alarm_grade_type,
   incident_status, handling_mode, device_code, device_id, site_id, company_id, opened_at)
SELECT
  c.id,
  'SAFE_MODE_TRIGGERED',   '안전모드 자동 전환',
  1, 1, 'in_progress',     'remote_diagnosis',
  'HK-2024-00376',
  d.id, d.site_id, c.id,
  NOW() - INTERVAL '15 minutes'
FROM public.device d, public.company c
WHERE d.device_code = 'HK-2024-00376' AND c.code = 'TV-CUST-003';

INSERT INTO public.communication_alarm_incident
  (tenant_id, alert_code, alarm_label, severity_type, alarm_grade_type,
   incident_status, handling_mode, device_code, device_id, site_id, company_id, opened_at)
SELECT
  c.id,
  'DETECTOR_TEMP_HIGH',    '디텍터 온도 상승 (62°C)',
  2, 1, 'open',            'remote_diagnosis',
  'HK-2024-00512',
  d.id, d.site_id, c.id,
  NOW() - INTERVAL '2 hours 30 minutes'
FROM public.device d, public.company c
WHERE d.device_code = 'HK-2024-00512' AND c.code = 'TV-CUST-002';

INSERT INTO public.communication_alarm_incident
  (tenant_id, alert_code, alarm_label, severity_type, alarm_grade_type,
   incident_status, handling_mode, device_code, device_id, site_id, company_id, opened_at)
SELECT
  c.id,
  'COMM_LATENCY_HIGH',     '통신 지연 임계 초과 (340ms)',
  2, 1, 'resolved',        'remote_diagnosis',
  'HK-2024-00459',
  d.id, d.site_id, c.id,
  NOW() - INTERVAL '1 day 2 hours'
FROM public.device d, public.company c
WHERE d.device_code = 'HK-2024-00459' AND c.code = 'TV-CUST-001';

-- ─────────────────────────────────────────────────────────────────────────────
-- 10. 서비스 티켓 (stage 영문 코드로 저장)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO public.service_ticket (ticket_no, device_code, device_id, site_id, ticket_status, priority_type, title, description, portal_meta, opened_at)
SELECT 'TK-2026-0001', 'HK-2024-00295', d.id, d.site_id, 'open', 1,
  '튜브 수명 임박 교체 요청',
  '튜브 수명이 21%로 하락. 즉시 교체 필요.',
  '{"stage":"open","engineerId":null,"customer":"LG이노텍","slaTier":"Critical","region":"경북"}'::jsonb,
  NOW() - INTERVAL '10 minutes'
FROM public.device d WHERE d.device_code = 'HK-2024-00295'
ON CONFLICT (ticket_no) DO UPDATE SET
  portal_meta = EXCLUDED.portal_meta, ticket_status = EXCLUDED.ticket_status, updated_at = NOW();

INSERT INTO public.service_ticket (ticket_no, device_code, device_id, site_id, ticket_status, priority_type, title, description, portal_meta, opened_at)
SELECT 'TK-2026-0002', 'HK-2024-00201', d.id, d.site_id, 'assigned', 1,
  '통신 오류 긴급 점검',
  '알람 발생 — 현장 점검 배정 완료.',
  '{"stage":"assigned","engineerId":"eng-3","customer":"테크밸리 데모 고객사","slaTier":"Critical","region":"경기"}'::jsonb,
  NOW() - INTERVAL '20 minutes'
FROM public.device d WHERE d.device_code = 'HK-2024-00201'
ON CONFLICT (ticket_no) DO UPDATE SET
  portal_meta = EXCLUDED.portal_meta, ticket_status = EXCLUDED.ticket_status, updated_at = NOW();

INSERT INTO public.service_ticket (ticket_no, device_code, device_id, site_id, ticket_status, priority_type, title, description, portal_meta, opened_at)
SELECT 'TK-2026-0003', 'HK-2024-00332', d.id, d.site_id, 'dispatched', 2,
  '오프라인 장비 현장 출동',
  '3시간째 통신 두절. 엔지니어 출동 중.',
  '{"stage":"dispatched","engineerId":"eng-4","customer":"현대자동차","slaTier":"Standard","region":"울산"}'::jsonb,
  NOW() - INTERVAL '2 hours 30 minutes'
FROM public.device d WHERE d.device_code = 'HK-2024-00332'
ON CONFLICT (ticket_no) DO UPDATE SET
  portal_meta = EXCLUDED.portal_meta, ticket_status = EXCLUDED.ticket_status, updated_at = NOW();

INSERT INTO public.service_ticket (ticket_no, device_code, device_id, site_id, ticket_status, priority_type, title, description, portal_meta, opened_at)
SELECT 'TK-2026-0004', 'HK-2024-00376', d.id, d.site_id, 'in_progress', 1,
  '안전모드 원인 분석 및 조치',
  '안전모드 자동 전환. 원격 진단 중.',
  '{"stage":"in_progress","engineerId":"eng-3","customer":"SK hynix","slaTier":"Critical","region":"경기"}'::jsonb,
  NOW() - INTERVAL '15 minutes'
FROM public.device d WHERE d.device_code = 'HK-2024-00376'
ON CONFLICT (ticket_no) DO UPDATE SET
  portal_meta = EXCLUDED.portal_meta, ticket_status = EXCLUDED.ticket_status, updated_at = NOW();

INSERT INTO public.service_ticket (ticket_no, device_code, device_id, site_id, ticket_status, priority_type, title, description, portal_meta, opened_at)
SELECT 'TK-2026-0005', 'HK-2024-00243', d.id, d.site_id, 'in_progress', 2,
  '고전압 스파이크 점검',
  '고전압 이상 감지 — 부품 점검 중.',
  '{"stage":"in_progress","engineerId":"eng-4","customer":"테크밸리 데모 고객사","slaTier":"Standard","region":"부산"}'::jsonb,
  NOW() - INTERVAL '1 hour'
FROM public.device d WHERE d.device_code = 'HK-2024-00243'
ON CONFLICT (ticket_no) DO UPDATE SET
  portal_meta = EXCLUDED.portal_meta, ticket_status = EXCLUDED.ticket_status, updated_at = NOW();

INSERT INTO public.service_ticket (ticket_no, device_code, device_id, site_id, ticket_status, priority_type, title, description, portal_meta, opened_at)
SELECT 'TK-2026-0006', 'HK-2024-00158', d.id, d.site_id, 'closed', 3,
  '패킷 손실 원인 조치 완료',
  '네트워크 설정 교정 후 정상화.',
  '{"stage":"closed","engineerId":"eng-3","customer":"테크밸리 데모 고객사","slaTier":"Critical","region":"경기"}'::jsonb,
  NOW() - INTERVAL '4 hours'
FROM public.device d WHERE d.device_code = 'HK-2024-00158'
ON CONFLICT (ticket_no) DO UPDATE SET
  portal_meta = EXCLUDED.portal_meta, ticket_status = EXCLUDED.ticket_status, updated_at = NOW();

INSERT INTO public.service_ticket (ticket_no, device_code, device_id, site_id, ticket_status, priority_type, title, description, portal_meta, opened_at)
SELECT 'TK-2026-0007', 'HK-2024-00512', d.id, d.site_id, 'open', 2,
  '디텍터 온도 이상 점검',
  '디텍터 내부 온도 62°C 감지. 점검 접수.',
  '{"stage":"open","engineerId":null,"customer":"LG이노텍","slaTier":"Standard","region":"경북"}'::jsonb,
  NOW() - INTERVAL '2 hours'
FROM public.device d WHERE d.device_code = 'HK-2024-00512'
ON CONFLICT (ticket_no) DO UPDATE SET
  portal_meta = EXCLUDED.portal_meta, ticket_status = EXCLUDED.ticket_status, updated_at = NOW();

INSERT INTO public.service_ticket (ticket_no, device_code, device_id, site_id, ticket_status, priority_type, title, description, portal_meta, opened_at)
SELECT 'TK-2026-0008', 'HK-2024-00459', d.id, d.site_id, 'closed', 3,
  '통신 지연 최적화 완료',
  '라우터 설정 변경으로 지연 해소.',
  '{"stage":"closed","engineerId":"eng-4","customer":"테크밸리 데모 고객사","slaTier":"Standard","region":"부산"}'::jsonb,
  NOW() - INTERVAL '1 day 2 hours'
FROM public.device d WHERE d.device_code = 'HK-2024-00459'
ON CONFLICT (ticket_no) DO UPDATE SET
  portal_meta = EXCLUDED.portal_meta, ticket_status = EXCLUDED.ticket_status, updated_at = NOW();

-- ─────────────────────────────────────────────────────────────────────────────
-- 11. 부품 주문 / 부품 스케줄
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO public.parts_order (order_no, device_code, part_type_code, quantity, order_status, ordered_at)
VALUES
  ('PO-2026-0043', 'HK-2024-00295', 'XRAY_TUBE_1625',   1, 'approved',   NOW() - INTERVAL '2 hours'),
  ('PO-2026-0042', 'HK-2024-00243', 'XRAY_TUBE_1630',   1, 'shipped',    NOW() - INTERVAL '1 day'),
  ('PO-2026-0041', 'HK-2024-00376', 'DETECTOR_MODULE',  2, 'received',   NOW() - INTERVAL '3 days'),
  ('PO-2026-0040', 'HK-2024-00201', 'COMM_BOARD',       1, 'requested',  NOW() - INTERVAL '1 hour'),
  ('PO-2026-0039', 'HK-2024-00158', 'DETECTOR_MODULE',  1, 'completed',  NOW() - INTERVAL '7 days')
ON CONFLICT (order_no) DO NOTHING;

INSERT INTO public.parts_schedule (device_code, part_type_code, scheduled_at, schedule_status)
VALUES
  ('HK-2024-00158', 'XRAY_TUBE_1625',  NOW() + INTERVAL '14 days',  'planned'),
  ('HK-2024-00243', 'DETECTOR_MODULE', NOW() + INTERVAL '7 days',   'planned'),
  ('HK-2024-00295', 'XRAY_TUBE_1625',  NOW() + INTERVAL '3 days',   'confirmed'),
  ('HK-2024-00376', 'COMM_BOARD',      NOW() + INTERVAL '21 days',  'planned'),
  ('HK-2024-00512', 'DETECTOR_MODULE', NOW() + INTERVAL '30 days',  'planned'),
  ('HK-2024-00332', 'XRAY_TUBE_1620',  NOW() + INTERVAL '5 days',   'confirmed');

-- ─────────────────────────────────────────────────────────────────────────────
-- 12. 설치 이력
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO public.installation (device_code, device_id, site_id, installed_at, installer_note)
SELECT 'HK-2024-00158', d.id, d.site_id, '2024-03-15 09:00:00+09', '초기 설치 완료. 수원 공장 1라인.'
FROM public.device d WHERE d.device_code = 'HK-2024-00158';

INSERT INTO public.installation (device_code, device_id, site_id, installed_at, installer_note)
SELECT 'HK-2024-00201', d.id, d.site_id, '2024-05-10 10:30:00+09', '수원 공장 2라인 신규 설치.'
FROM public.device d WHERE d.device_code = 'HK-2024-00201';

INSERT INTO public.installation (device_code, device_id, site_id, installed_at, installer_note)
SELECT 'HK-2024-00243', d.id, d.site_id, '2023-11-20 14:00:00+09', '부산 물류센터 설치 완료.'
FROM public.device d WHERE d.device_code = 'HK-2024-00243';

INSERT INTO public.installation (device_code, device_id, site_id, installed_at, installer_note)
SELECT 'HK-2024-00295', d.id, d.site_id, '2023-09-05 11:00:00+09', '구미 생산라인 A 설치.'
FROM public.device d WHERE d.device_code = 'HK-2024-00295';

INSERT INTO public.installation (device_code, device_id, site_id, installed_at, installer_note)
SELECT 'HK-2024-00332', d.id, d.site_id, '2023-08-14 09:30:00+09', '울산 조립라인 설치.'
FROM public.device d WHERE d.device_code = 'HK-2024-00332';

INSERT INTO public.installation (device_code, device_id, site_id, installed_at, installer_note)
SELECT 'HK-2024-00376', d.id, d.site_id, '2023-12-01 13:00:00+09', '이천 반도체 팹 설치 완료.'
FROM public.device d WHERE d.device_code = 'HK-2024-00376';

INSERT INTO public.installation (device_code, device_id, site_id, installed_at, installer_note)
SELECT 'HK-2024-00411', d.id, d.site_id, '2024-09-03 10:00:00+09', '삼성 수원DS 신규 설치.'
FROM public.device d WHERE d.device_code = 'HK-2024-00411';

INSERT INTO public.installation (device_code, device_id, site_id, installed_at, installer_note)
SELECT 'HK-2024-00459', d.id, d.site_id, '2024-07-22 09:00:00+09', '부산 물류센터 2호기 설치.'
FROM public.device d WHERE d.device_code = 'HK-2024-00459';

INSERT INTO public.installation (device_code, device_id, site_id, installed_at, installer_note)
SELECT 'HK-2024-00512', d.id, d.site_id, '2024-01-18 14:00:00+09', '구미 생산라인 B 설치.'
FROM public.device d WHERE d.device_code = 'HK-2024-00512';

INSERT INTO public.installation (device_code, device_id, site_id, installed_at, installer_note)
SELECT 'HK-2024-00187', d.id, d.site_id, '2024-02-28 11:00:00+09', '대전 R&D센터 테스트 장비 설치.'
FROM public.device d WHERE d.device_code = 'HK-2024-00187';

-- ─────────────────────────────────────────────────────────────────────────────
-- 13. AS 이력
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO public.as_record (device_code, service_type, performed_at, summary, parts_used_json)
VALUES
  ('HK-2024-00158', 'tube_replace',     NOW() - INTERVAL '6 months',  '튜브 교체 완료 (수명 12% → 100%)',    '[{"part":"XRAY_TUBE_1625","qty":1}]'::jsonb),
  ('HK-2024-00158', 'preventive',       NOW() - INTERVAL '3 months',  '정기 예방 점검 완료',                   '[]'::jsonb),
  ('HK-2024-00243', 'corrective',       NOW() - INTERVAL '45 days',   '고전압 보드 교체 후 정상화',             '[{"part":"HV_BOARD","qty":1}]'::jsonb),
  ('HK-2024-00295', 'tube_replace',     NOW() - INTERVAL '9 months',  '튜브 교체 완료 (노후 튜브 제거)',        '[{"part":"XRAY_TUBE_1625","qty":1}]'::jsonb),
  ('HK-2024-00376', 'software_update',  NOW() - INTERVAL '20 days',   '펌웨어 v3.1.8 → v3.2.0 업그레이드',    '[]'::jsonb),
  ('HK-2024-00459', 'comm_fix',         NOW() - INTERVAL '1 day 2 hours', '네트워크 지연 최적화 완료',          '[]'::jsonb),
  ('HK-2024-00332', 'corrective',       NOW() - INTERVAL '2 months',  '통신 모듈 교체 후 정상화',               '[{"part":"COMM_BOARD","qty":1}]'::jsonb);

-- ─────────────────────────────────────────────────────────────────────────────
-- 14. 플레이북
-- ─────────────────────────────────────────────────────────────────────────────
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
