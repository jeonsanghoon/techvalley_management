-- =============================================================================
-- UI 포털 개발 시드 — mock-data 대체 (05-seed-dev 선행)
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- UI 공통코드 (main_code 5자, sub_code > 0 = 실제값, sub_code=-1 = 그룹헤더)
-- -----------------------------------------------------------------------------
INSERT INTO public.common_code (main_code, sub_code, code_name, ref_data1, order_seq, is_use, remark)
VALUES
  -- 장비 상태 (EQST): code_name=한글표시, ref_data1=영문코드(device_fleet.status 저장값)
  ('EQST', -1, '장비 운영 상태',  '',            -1, FALSE, 'group_header'),
  ('EQST', 1,  '가동',            'online',       1, TRUE,  '정상 운영'),
  ('EQST', 2,  '알람',            'alarm',        2, TRUE,  '알람 발생'),
  ('EQST', 3,  '유지보수',        'maintenance',  3, TRUE,  '유지보수 중'),
  ('EQST', 4,  '안전모드',        'safe_mode',    4, TRUE,  '안전 모드'),
  ('EQST', 5,  '오프라인',        'offline',      5, TRUE,  '오프라인'),
  -- 티켓 단계 (TKST): ref_data1=영문코드(service_ticket.ticket_status)
  ('TKST', -1, '서비스 티켓 단계', '',            -1, FALSE, 'group_header'),
  ('TKST', 1,  '접수',            'open',         1, TRUE,  '티켓 접수'),
  ('TKST', 2,  '배정',            'assigned',     2, TRUE,  '엔지니어 배정'),
  ('TKST', 3,  '출동',            'dispatched',   3, TRUE,  '현장 출동'),
  ('TKST', 4,  '작업',            'in_progress',  4, TRUE,  '작업 진행'),
  ('TKST', 5,  '완료',            'closed',       5, TRUE,  '처리 완료'),
  -- 설치 상태 (INST): ref_data1=영문코드(installation.status)
  ('INST', -1, '설치 진행 상태',  '',             -1, FALSE, 'group_header'),
  ('INST', 1,  '예정',            'planned',       1, TRUE,  '설치 예정'),
  ('INST', 2,  '진행중',          'in_progress',   2, TRUE,  '설치 진행'),
  ('INST', 3,  '시운전',          'commissioning', 3, TRUE,  '시운전 중'),
  ('INST', 4,  '완료',            'done',          4, TRUE,  '설치 완료'),
  -- 부품 주문/납품 상태 (PRST): ref_data1=영문코드(parts_order.order_status)
  ('PRST', -1, '부품 주문·납품 상태', '',         -1, FALSE, 'group_header'),
  ('PRST', 1,  '요청',            'requested',    1, TRUE,  '주문 요청'),
  ('PRST', 2,  '확정',            'confirmed',    2, TRUE,  '주문 확정'),
  ('PRST', 3,  '출고',            'shipped',      3, TRUE,  '창고 출고'),
  ('PRST', 4,  '운송중',          'in_transit',   4, TRUE,  '배송 중'),
  ('PRST', 5,  '도착',            'delivered',    5, TRUE,  '현장 도착'),
  ('PRST', 6,  '교체완료',        'completed',    6, TRUE,  '교체 완료'),
  -- 리포트 카테고리 (RPCT): ref_data1=영문코드(report_definition.category)
  ('RPCT', -1, '리포트 분류',     '',             -1, FALSE, 'group_header'),
  ('RPCT', 1,  '운영',            'operations',   1, TRUE,  '운영 리포트'),
  ('RPCT', 2,  '알람',            'alarm',        2, TRUE,  '알람 리포트'),
  ('RPCT', 3,  'AS',              'as_service',   3, TRUE,  'AS 리포트'),
  ('RPCT', 4,  '검사',            'inspection',   4, TRUE,  '검사 리포트'),
  -- 알고리즘 상태 (ALGS): ref_data1=영문코드(algorithm_config.status) — 이미 영문
  ('ALGS', -1, '알고리즘 설정 상태', '',          -1, FALSE, 'group_header'),
  ('ALGS', 1,  '활성',            'active',       1, TRUE,  '운영 중'),
  ('ALGS', 2,  '스테이징',        'staging',      2, TRUE,  '스테이징'),
  ('ALGS', 3,  '비활성',          'disabled',     3, TRUE,  '비활성'),
  -- 알림 채널 유형 (NTTY): ref_data1=영문코드(notification_channel.channel_type)
  ('NTTY', -1, '알림 채널 유형',  '',             -1, FALSE, 'group_header'),
  ('NTTY', 1,  '대시보드',        'Dashboard',    1, TRUE,  '포털 인앱'),
  ('NTTY', 2,  'SNS',             'SNS',          2, TRUE,  'AWS SNS'),
  ('NTTY', 3,  'SES 이메일',      'SES',          3, TRUE,  'AWS SES'),
  ('NTTY', 4,  '웹훅',            'Webhook',      4, TRUE,  'HTTP Webhook'),
  -- IoT 연결 상태 (IOTC): ref_data1=영문코드(iot_thing_registry.connection_status)
  ('IOTC', -1, 'IoT 연결 상태',   '',             -1, FALSE, 'group_header'),
  ('IOTC', 1,  '연결됨',          'connected',    1, TRUE,  '정상 연결'),
  ('IOTC', 2,  '연결 끊김',       'disconnected', 2, TRUE,  '연결 끊김'),
  ('IOTC', 3,  '연결 대기',       'pending',      3, TRUE,  '연결 대기'),
  -- SLA 티어 (SLAT): ref_data1=영문코드(contract_tier)
  ('SLAT', -1, 'SLA 계약 티어',   '',             -1, FALSE, 'group_header'),
  ('SLAT', 1,  '최고등급',        'Critical',     1, TRUE,  'SLA Critical'),
  ('SLAT', 2,  '높음',            'High',         2, TRUE,  'SLA High'),
  ('SLAT', 3,  '기본',            'Standard',     3, TRUE,  'SLA Standard')
ON CONFLICT (main_code, sub_code) DO UPDATE SET
  code_name  = EXCLUDED.code_name,
  ref_data1  = EXCLUDED.ref_data1,
  order_seq  = EXCLUDED.order_seq,
  is_use     = EXCLUDED.is_use,
  updated_at = NOW();

-- 추가 고객사·현장·장비
INSERT INTO public.company (code, company_name, description, company_type, contract_tier, region_label, remark)
VALUES
  ('TV-CUST-002', 'LG이노텍', '데모 고객', '고객사', 'High', '경북', 'UI seed'),
  ('TV-CUST-003', 'SK hynix', '데모 고객', '고객사', 'Critical', '경기', 'UI seed')
ON CONFLICT (code) DO UPDATE SET company_name = EXCLUDED.company_name, updated_at = NOW();

INSERT INTO public.site (code, site_name, company_id, branch_id, site_type, org_level_type, address, region_label, geo_zone, remark)
SELECT 'TV-SITE-GUMI', '구미 2공장', c.id, b.id, 1, 3, '경북 구미시', '경북', 'korea', 'UI seed'
FROM public.company c
JOIN public.branch b ON b.company_id = c.id AND b.code = 'TV-BR-HQ'
WHERE c.code = 'TV-CUST-002'
ON CONFLICT (code) DO UPDATE SET site_name = EXCLUDED.site_name, updated_at = NOW();

INSERT INTO public.site (code, site_name, company_id, branch_id, site_type, org_level_type, address, region_label, geo_zone, remark)
SELECT 'TV-SITE-ICHEON', '이천 M15', c.id, b.id, 1, 3, '경기 이천시', '경기', 'korea', 'UI seed'
FROM public.company c
JOIN public.branch b ON b.company_id = c.id AND b.code = 'TV-BR-HQ'
WHERE c.code = 'TV-CUST-003'
ON CONFLICT (code) DO UPDATE SET site_name = EXCLUDED.site_name, updated_at = NOW();

UPDATE public.site SET address = '경기 수원시', region_label = '경기', geo_zone = 'korea'
WHERE code = 'TV-SITE-FACTORY-01';

UPDATE public.company SET company_type = '고객사', contract_tier = 'Critical', region_label = '경기'
WHERE code = 'TV-CUST-001';

INSERT INTO public.device (device_code, site_id, product_id, serial, operational_status_type, firmware_version, last_seen_at, portal_meta, remark)
SELECT 'RP-2023-00892', s.id, p.id, 'SN-RP-892', 1, 'v2.8.4', NOW() - INTERVAL '2 minutes',
  '{"model":"RAPIDER 225","status":"alarm","slaTier":"High","serviceability":"당일 방문","lat":36.1,"lng":128.4,"tubeLifePct":45,"detectorLifePct":62,"region":"경북","geoZone":"korea"}'::jsonb,
  'UI seed'
FROM public.site s JOIN public.product p ON p.code = 'TV-PRODUCT-XRAY' WHERE s.code = 'TV-SITE-GUMI'
ON CONFLICT (device_code) DO UPDATE SET portal_meta = EXCLUDED.portal_meta, firmware_version = EXCLUDED.firmware_version, updated_at = NOW();

INSERT INTO public.device (device_code, site_id, product_id, serial, operational_status_type, firmware_version, last_seen_at, portal_meta, remark)
SELECT 'HK-2025-00201', s.id, p.id, 'SN-HK-201', 1, 'v3.1.0', NOW() - INTERVAL '40 minutes',
  '{"model":"HAWKEYE 1300","status":"maintenance","slaTier":"Critical","serviceability":"부품 대기","lat":37.3,"lng":127.4,"tubeLifePct":28,"detectorLifePct":91,"region":"경기","geoZone":"korea"}'::jsonb,
  'UI seed'
FROM public.site s JOIN public.product p ON p.code = 'TV-PRODUCT-XRAY' WHERE s.code = 'TV-SITE-ICHEON'
ON CONFLICT (device_code) DO UPDATE SET portal_meta = EXCLUDED.portal_meta, updated_at = NOW();

UPDATE public.device SET
  firmware_version = 'v3.2.1',
  last_seen_at = NOW() - INTERVAL '1 minute',
  portal_meta = '{"model":"HAWKEYE 1625","status":"online","slaTier":"Critical","serviceability":"즉시 원격가능","lat":37.2,"lng":126.8,"tubeLifePct":72,"detectorLifePct":85,"region":"경기","geoZone":"korea","installDate":"2024-03-15"}'::jsonb
WHERE device_code = 'HK-2024-00158';

INSERT INTO public.firmware (code, product_id, firmware_version, s3_key, remark)
SELECT 'FW-XRAY-322', p.id, 'v3.2.2', 'firmware/xray/v3.2.2.bin', 'UI seed target'
FROM public.product p WHERE p.code = 'TV-PRODUCT-XRAY'
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.engineer_profile (user_id, display_name, region_label, specialty, availability_status)
SELECT u.id, u.user_name, '경기', '["튜브","디텍터"]'::jsonb, '출동가능'
FROM public."user" u WHERE u.code = 'USR-TV-OPS'
ON CONFLICT (user_id) DO UPDATE SET display_name = EXCLUDED.display_name;

INSERT INTO public.service_ticket (ticket_no, device_code, device_id, site_id, ticket_status, priority_type, title, description, opened_at, portal_meta)
SELECT 'TK-2026-0042', d.device_code, d.id, d.site_id, 'in_progress', 1,
  '튜브 kV 임계 초과', 'tube.kv > 180 알람 연동', NOW() - INTERVAL '3 hours',
  '{"stage":"작업","customer":"테크밸리 데모 고객사","site":"수원 공장 1라인","severity":"critical","slaTier":"Critical","serviceability":"즉시 원격가능","engineerId":"eng-001","engineerName":"김현장","slaDeadline":"2026-06-13T18:00:00+09:00","slaBreached":false,"alarmId":"ALARM_TUBE_KV_HIGH"}'::jsonb
FROM public.device d WHERE d.device_code = 'HK-2024-00158'
ON CONFLICT (ticket_no) DO UPDATE SET portal_meta = EXCLUDED.portal_meta, updated_at = NOW();

INSERT INTO public.service_ticket_progress (ticket_id, progress_status, note, recorded_at)
SELECT t.id, 'assigned', '엔지니어 배정', NOW() - INTERVAL '2 hours'
FROM public.service_ticket t WHERE t.ticket_no = 'TK-2026-0042'
  AND NOT EXISTS (SELECT 1 FROM public.service_ticket_progress p WHERE p.ticket_id = t.id AND p.progress_status = 'assigned');

INSERT INTO public.parts_order (order_no, device_code, part_type_code, quantity, order_status, ordered_at)
VALUES ('PO-2026-0101', 'HK-2025-00201', 'TUBE-1625', 1, '출고', NOW() - INTERVAL '2 days')
ON CONFLICT (order_no) DO NOTHING;

INSERT INTO public.parts_schedule (device_code, part_type_code, scheduled_at, schedule_status)
SELECT 'HK-2025-00201', 'TUBE-1625', NOW() + INTERVAL '3 days', 'planned'
WHERE NOT EXISTS (
  SELECT 1 FROM public.parts_schedule ps
  WHERE ps.device_code = 'HK-2025-00201' AND ps.part_type_code = 'TUBE-1625'
);

INSERT INTO public.installation (device_code, device_id, site_id, installed_at, installer_note, status)
SELECT d.device_code, d.id, d.site_id, '2024-03-15'::timestamptz, 'IO-2024-0158', '완료'
FROM public.device d WHERE d.device_code = 'HK-2024-00158'
AND NOT EXISTS (SELECT 1 FROM public.installation i WHERE i.device_code = d.device_code);

INSERT INTO public.installation (device_code, device_id, site_id, installed_at, installer_note, status)
SELECT d.device_code, d.id, d.site_id, '2023-09-20'::timestamptz, 'IO-2023-0892', '완료'
FROM public.device d WHERE d.device_code = 'RP-2023-00892'
AND NOT EXISTS (SELECT 1 FROM public.installation i WHERE i.device_code = d.device_code);

INSERT INTO public.installation (device_code, device_id, site_id, installed_at, installer_note, status)
SELECT d.device_code, d.id, d.site_id, NOW() + INTERVAL '7 days', 'IO-2025-0201', '예정'
FROM public.device d WHERE d.device_code = 'HK-2025-00201'
AND NOT EXISTS (SELECT 1 FROM public.installation i WHERE i.device_code = d.device_code);

INSERT INTO public.as_record (device_code, service_type, performed_at, summary, parts_used_json)
VALUES ('RP-2023-00892', 'field', NOW() - INTERVAL '30 days', '디텍터 교체 및 캘리브레이션', '["DET-225-A"]'::jsonb);

INSERT INTO public.equipment_log_tube (device_code, event_at, tube_kv, tube_ma, payload_json)
VALUES ('HK-2024-00158', NOW() - INTERVAL '10 minutes', 160.2, 3.8, '{"source":"periodic_telemetry"}'::jsonb);

INSERT INTO public.equipment_log_detector (device_code, event_at, temp_c, payload_json)
VALUES ('HK-2024-00158', NOW() - INTERVAL '10 minutes', 42.1, '{}'::jsonb);

INSERT INTO public.equipment_log_control (device_code, event_at, request_code, control_action, payload_json)
VALUES ('HK-2024-00158', NOW() - INTERVAL '1 day', 'REMOTE_REBOOT', 'reboot', '{}'::jsonb);

INSERT INTO public.notification_channel_setting (channel_code, channel_name, channel_type, target, severity_filter, recipients, enabled, description)
VALUES
  ('CH-DASHBOARD', '대시보드 알림', 'Dashboard', 'in-app', '["warning","critical"]'::jsonb, '운영팀', TRUE, '포털 실시간'),
  ('CH-SNS-OPS', 'SNS 운영', 'SNS', 'arn:aws:sns:ap-northeast-2:000:tv-ops', '["critical"]'::jsonb, 'ops@techvalley.local', TRUE, 'Critical 전용')
ON CONFLICT (channel_code) DO UPDATE SET channel_name = EXCLUDED.channel_name, updated_at = NOW();

INSERT INTO public.iot_thing_registry (device_code, device_id, thing_name, certificate_id, policy_name, connection_status, last_seen_at)
SELECT d.device_code, d.id, 'tv-hk202400158', 'cert-a1b2c3…', 'tv-critical-policy', 'connected', NOW()
FROM public.device d WHERE d.device_code = 'HK-2024-00158'
ON CONFLICT (device_code) DO UPDATE SET last_seen_at = EXCLUDED.last_seen_at;

INSERT INTO public.algorithm_config (config_code, config_name, version_label, threshold, status, applied_device_count)
VALUES ('ALG-YIELD-V1', '수율 이상 탐지', 'v2.4.1', 0.92, 'active', 3)
ON CONFLICT (config_code) DO NOTHING;

INSERT INTO public.yield_inspection_record (device_code, lot_no, serial_no, yield_pct, inspected_at, algorithm_version)
VALUES ('HK-2024-00158', 'LOT-20260606-A', 'SN-HK-2024-00158', 97.4, NOW() - INTERVAL '6 hours', 'v2.4.1');

INSERT INTO public.report_definition (report_code, report_name, category, last_generated_at, record_count)
VALUES
  ('RPT-FLEET-DAILY', '플릿 일일 리포트', '운영', NOW() - INTERVAL '1 day', 128),
  ('RPT-YIELD-WEEKLY', '수율 주간 리포트', '품질', NOW() - INTERVAL '3 days', 56)
ON CONFLICT (report_code) DO NOTHING;

INSERT INTO public.sla_contract_definition (tier_code, tier_name, response_minutes, resolve_minutes, uptime_target_pct, description)
VALUES
  ('Critical', 'Critical SLA', 30, 240, 99.500, '24x7 대응'),
  ('High', 'High SLA', 60, 480, 99.000, '근무시간 우선'),
  ('Standard', 'Standard SLA', 240, 1440, 98.000, '익일 대응')
ON CONFLICT (tier_code) DO NOTHING;

INSERT INTO public.remote_diagnosis_finding (device_code, finding_code, severity, title, detail, suggested_action, detected_at)
VALUES ('RP-2023-00892', 'DET-TEMP-HIGH', 'critical', '디텍터 온도 상승', 'detector.temp_c > 65°C 지속', '원격 냉각 팬 점검', NOW() - INTERVAL '1 hour');

INSERT INTO public.collection_daily_stats (collection_name, stat_date, doc_count, ingest_bytes, lag_ms, dlq_count, tier, status)
VALUES
  ('periodic_telemetry', CURRENT_DATE, 1240, 5242880, 120, 0, 'Hot', 'healthy'),
  ('device_notifications', CURRENT_DATE, 18, 65536, 80, 0, 'Hot', 'healthy'),
  ('telemetry_rollups_device_10min', CURRENT_DATE, 96, 131072, 200, 0, 'Warm', 'healthy')
ON CONFLICT (collection_name, stat_date) DO UPDATE SET doc_count = EXCLUDED.doc_count;

INSERT INTO public.dashboard_alarm_daily (stat_date, critical_count, warning_count)
VALUES
  (CURRENT_DATE - 29, 1, 3),
  (CURRENT_DATE - 28, 0, 2),
  (CURRENT_DATE - 27, 2, 4),
  (CURRENT_DATE - 26, 1, 5),
  (CURRENT_DATE - 25, 0, 1),
  (CURRENT_DATE - 24, 3, 6),
  (CURRENT_DATE - 23, 1, 4),
  (CURRENT_DATE - 22, 0, 3),
  (CURRENT_DATE - 21, 2, 5),
  (CURRENT_DATE - 20, 1, 2),
  (CURRENT_DATE - 19, 0, 4),
  (CURRENT_DATE - 18, 1, 3),
  (CURRENT_DATE - 17, 2, 7),
  (CURRENT_DATE - 16, 0, 2),
  (CURRENT_DATE - 15, 1, 4),
  (CURRENT_DATE - 14, 3, 8),
  (CURRENT_DATE - 13, 0, 3),
  (CURRENT_DATE - 12, 1, 5),
  (CURRENT_DATE - 11, 2, 4),
  (CURRENT_DATE - 10, 0, 2),
  (CURRENT_DATE - 9, 1, 3),
  (CURRENT_DATE - 8, 0, 4),
  (CURRENT_DATE - 7, 2, 6),
  (CURRENT_DATE - 6, 1, 3),
  (CURRENT_DATE - 5, 2, 5),
  (CURRENT_DATE - 4, 1, 4),
  (CURRENT_DATE - 3, 3, 6),
  (CURRENT_DATE - 2, 0, 3),
  (CURRENT_DATE - 1, 2, 7),
  (CURRENT_DATE, 1, 5)
ON CONFLICT (stat_date) DO UPDATE SET critical_count = EXCLUDED.critical_count, warning_count = EXCLUDED.warning_count;

INSERT INTO public.sla_fleet_snapshot (snapshot_at, site_id, fleet_size, uptime_pct, critical_open_count, metrics_json)
SELECT NOW(), s.id, 3, 96.667, 1, '{"source":"seed"}'::jsonb
FROM public.site s WHERE s.code = 'TV-SITE-FACTORY-01';

INSERT INTO public.communication_alarm_incident
  (tenant_id, alert_code, device_code, severity_type, alarm_grade_type, incident_status, opened_at, alarm_label)
VALUES
  (1, 'ALARM_TUBE_KV_HIGH',    'HK-2024-00158', 3, 1, 'open',     NOW() - INTERVAL '2 hours',  '튜브 kV 임계 초과'),
  (1, 'ALARM_DET_TEMP_HIGH',   'RP-2023-00892', 3, 1, 'open',     NOW() - INTERVAL '1 hour',   '디텍터 온도 상승'),
  (1, 'ALARM_UPTIME_DEGRADED', 'HK-2025-00201', 2, 2, 'resolved', NOW() - INTERVAL '1 day',    '가동률 저하 경고'),
  (1, 'ALARM_FIRMWARE_STALE',  'RP-2023-00892', 2, 2, 'resolved', NOW() - INTERVAL '3 days',   '펌웨어 업데이트 필요'),
  (1, 'ALARM_TUBE_KV_HIGH',    'HK-2025-00201', 3, 1, 'resolved', NOW() - INTERVAL '5 days',   '튜브 kV 임계 초과'),
  (1, 'ALARM_DET_TEMP_WARN',   'HK-2024-00158', 2, 2, 'resolved', NOW() - INTERVAL '7 days',   '디텍터 온도 경고');

COMMIT;
