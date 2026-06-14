-- =============================================================================
-- PostgreSQL — 알람·통신품질·텔레메트리 롤업 (테크밸리 data-platform 계약)
-- SSOT: 02.arch/config/schema/postgres/02-pipeline-alarm-notification.sql
-- 선행: 01-core-schema.sql
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 0a) 알람 심각도 (main A0002) — sub_code 고정 (변경 금지)
-- -----------------------------------------------------------------------------
INSERT INTO public.common_code (main_code, sub_code, code_name, code_name_en, order_seq, ref_data1, is_use)
VALUES
  ('A0002', -1, '알람 심각도', 'Alarm severity', -1, 'group_header', FALSE),
  ('A0002', 1, '정보', 'info', 1, 'info', TRUE),
  ('A0002', 2, '경고', 'warn', 2, 'warn', TRUE),
  ('A0002', 3, '오류', 'error', 3, 'error', TRUE)
ON CONFLICT (main_code, sub_code) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 0b) 알람 운영 등급 (main A0003) — sub_code 고정 (변경 금지), ref_data1 에 P1/P3 토큰
-- -----------------------------------------------------------------------------
INSERT INTO public.common_code (main_code, sub_code, code_name, code_name_en, order_seq, ref_data1, is_use)
VALUES
  ('A0003', -1, '알람 등급', 'Alarm grade', -1, 'group_header', FALSE),
  ('A0003', 1, '1급', 'P1', 1, 'P1', TRUE),
  ('A0003', 2, '3급', 'P3', 2, 'P3', TRUE)
ON CONFLICT (main_code, sub_code) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 0c) 기능 도메인 (main A0004) — sub_code 고정 (변경 금지), ref_data1 에 토큰
-- -----------------------------------------------------------------------------
INSERT INTO public.common_code (main_code, sub_code, code_name, code_name_en, order_seq, ref_data1, is_use)
VALUES
  ('A0004', -1, '기능 도메인', 'Functional domain', -1, 'group_header', FALSE),
  ('A0004', 1, '통신 품질', 'Communication quality', 1, 'communication_quality', TRUE),
  ('A0004', 2, '텔레메트리', 'Telemetry', 2, 'telemetry', TRUE),
  ('A0004', 3, 'FOTA', 'FOTA', 3, 'fota', TRUE),
  ('A0004', 4, '제어', 'Control', 4, 'control', TRUE),
  ('A0004', 5, '이미지', 'Image', 5, 'image', TRUE),
  ('A0004', 6, '파일', 'File', 6, 'file', TRUE),
  ('A0004', 7, '사용자 정의', 'Custom', 7, 'custom', TRUE),
  ('A0004', 8, '알람', 'Alarm', 8, 'alarm', TRUE)
ON CONFLICT (main_code, sub_code) DO NOTHING;

-- 0d) 포털 권한 (main A0005) — permission_type 컬럼·member_permission.permission_type 에 sub_code 직접 저장
INSERT INTO public.common_code (main_code, sub_code, code_name, code_name_en, order_seq, ref_data1, is_use)
VALUES
  ('A0005', -1, '포털 권한', 'Portal permission', -1, 'group_header', FALSE),
  ('A0005', 1, '사이트 알람 열람', 'alarm.read_site', 1, 'alarm.read_site', TRUE),
  ('A0005', 2, '지점 알람 열람', 'alarm.read_branch', 2, 'alarm.read_branch', TRUE),
  ('A0005', 3, '테넌트 알람 열람', 'alarm.read_tenant', 3, 'alarm.read_tenant', TRUE),
  ('A0005', 4, '사이트 알람 수신', 'alarm.notify_site', 4, 'alarm.notify_site', TRUE),
  ('A0005', 5, '지점 알람 수신', 'alarm.notify_branch', 5, 'alarm.notify_branch', TRUE),
  ('A0005', 6, '텔레메트리 사이트 열람', 'telemetry.read_site', 6, 'telemetry.read_site', TRUE),
  ('A0005', 7, '텔레메트리 지점 열람', 'telemetry.read_branch', 7, 'telemetry.read_branch', TRUE),
  ('A0005', 8, '조직 회원 관리', 'org.manage_members', 8, 'org.manage_members', TRUE)
ON CONFLICT (main_code, sub_code) DO NOTHING;

-- 0e) 멤버 역할 (main A0006) — member.member_role_type 에 sub_code 직접 저장 (manifest role_bindings.role_id 와 ref_data1 정합)
INSERT INTO public.common_code (main_code, sub_code, code_name, code_name_en, order_seq, ref_data1, is_use)
VALUES
  ('A0006', -1, '멤버 역할', 'Member role', -1, 'group_header', FALSE),
  ('A0006', 1, '사이트 운영자', 'site_operator', 1, 'site_operator', TRUE),
  ('A0006', 2, '지점 관리자', 'branch_manager', 2, 'branch_manager', TRUE),
  ('A0006', 3, '테넌트 관리자', 'tenant_admin', 3, 'tenant_admin', TRUE),
  ('A0006', 4, '회사 관리자', 'company_admin', 4, 'company_admin', TRUE)
ON CONFLICT (main_code, sub_code) DO NOTHING;

-- 0f) 멤버 계정 상태 (main A0007) — member.member_status_type
INSERT INTO public.common_code (main_code, sub_code, code_name, code_name_en, order_seq, ref_data1, is_use)
VALUES
  ('A0007', -1, '멤버 상태', 'Member status', -1, 'group_header', FALSE),
  ('A0007', 1, '활성', 'active', 1, 'active', TRUE),
  ('A0007', 2, '초대됨', 'invited', 2, 'invited', TRUE),
  ('A0007', 3, '정지', 'suspended', 3, 'suspended', TRUE)
ON CONFLICT (main_code, sub_code) DO NOTHING;

-- 0g) 사용자 권한 유형 (main A0001) — member.auth_type · website_group.auth_type 에 sub_code 직접 저장 (레거시 A001)
INSERT INTO public.common_code (main_code, sub_code, code_name, code_name_en, order_seq, ref_data1, is_use)
VALUES
  ('A0001', -1, '사용자 권한 유형', 'User auth type', -1, 'group_header', FALSE),
  ('A0001', 1, '일반 사용자', 'User', 1, 'user', TRUE),
  ('A0001', 9, '관리자', 'Administrator', 9, 'admin', TRUE),
  ('A0001', 10, '시스템 관리자', 'System administrator', 10, 'system_admin', TRUE)
ON CONFLICT (main_code, sub_code) DO NOTHING;

-- 0h) 파이프라인 DLQ 처리 상태 (main A0008) — DocumentDB pipeline_dlq_events.status_type
INSERT INTO public.common_code (main_code, sub_code, code_name, code_name_en, order_seq, ref_data1, is_use)
VALUES
  ('A0008', -1, 'DLQ 처리 상태', 'DLQ status', -1, 'group_header', FALSE),
  ('A0008', 1, '대기', 'pending', 1, 'pending', TRUE),
  ('A0008', 2, '처리중', 'processing', 2, 'processing', TRUE),
  ('A0008', 3, '해결', 'resolved', 3, 'resolved', TRUE),
  ('A0008', 4, '실패', 'failed', 4, 'failed', TRUE)
ON CONFLICT (main_code, sub_code) DO NOTHING;

-- 0i) OTA Job 상태 (main A0009) — update_job.status_type
INSERT INTO public.common_code (main_code, sub_code, code_name, code_name_en, order_seq, ref_data1, is_use)
VALUES
  ('A0009', -1, 'OTA Job 상태', 'Update job status', -1, 'group_header', FALSE),
  ('A0009', 1, '대기', 'pending', 1, 'pending', TRUE),
  ('A0009', 2, '진행중', 'in_progress', 2, 'in_progress', TRUE),
  ('A0009', 3, '완료', 'completed', 3, 'completed', TRUE),
  ('A0009', 4, '실패', 'failed', 4, 'failed', TRUE),
  ('A0009', 5, '취소', 'cancelled', 5, 'cancelled', TRUE)
ON CONFLICT (main_code, sub_code) DO NOTHING;

-- 0j) OTA 배포 방식 (main A0010) — update_job.deploy_type
INSERT INTO public.common_code (main_code, sub_code, code_name, code_name_en, order_seq, ref_data1, is_use)
VALUES
  ('A0010', -1, 'OTA 배포 방식', 'Update job deploy type', -1, 'group_header', FALSE),
  ('A0010', 1, '직접', 'direct', 1, 'direct', TRUE),
  ('A0010', 2, '그룹', 'group', 2, 'group', TRUE)
ON CONFLICT (main_code, sub_code) DO NOTHING;

-- 0k) 단말 운영 상태 (main A0011) — device.operational_status_type
INSERT INTO public.common_code (main_code, sub_code, code_name, code_name_en, order_seq, ref_data1, is_use)
VALUES
  ('A0011', -1, '단말 운영 상태', 'Device operational status', -1, 'group_header', FALSE),
  ('A0011', 1, '운영', 'operational', 1, 'operational', TRUE),
  ('A0011', 2, '비운영', 'non_operational', 2, 'non_operational', TRUE)
ON CONFLICT (main_code, sub_code) DO NOTHING;

-- 0l) 펌웨어 업데이트 이력 상태 (main A0012) — firmware_update_history.status_type
INSERT INTO public.common_code (main_code, sub_code, code_name, code_name_en, order_seq, ref_data1, is_use)
VALUES
  ('A0012', -1, '펌웨어 업데이트 결과', 'Firmware update history status', -1, 'group_header', FALSE),
  ('A0012', 1, '대기', 'pending', 1, 'pending', TRUE),
  ('A0012', 2, '성공', 'success', 2, 'success', TRUE),
  ('A0012', 3, '실패', 'failed', 3, 'failed', TRUE),
  ('A0012', 4, '건너뜀', 'skipped', 4, 'skipped', TRUE)
ON CONFLICT (main_code, sub_code) DO NOTHING;

-- 0m) OTA Job 단말 이벤트 종류 (main A0013) — update_job_device_status_event.event_kind_type
INSERT INTO public.common_code (main_code, sub_code, code_name, code_name_en, order_seq, ref_data1, is_use)
VALUES
  ('A0013', -1, 'OTA Job 단말 이벤트 종류', 'Update job device status event kind', -1, 'group_header', FALSE),
  ('A0013', 1, '요청', 'requested', 1, 'requested', TRUE),
  ('A0013', 2, '상태', 'status', 2, 'status', TRUE)
ON CONFLICT (main_code, sub_code) DO NOTHING;

-- 0n) OTA Job 단말 행 상태 (main A0014) — update_job_device.status_type
INSERT INTO public.common_code (main_code, sub_code, code_name, code_name_en, order_seq, ref_data1, is_use)
VALUES
  ('A0014', -1, 'OTA Job 단말 행 상태', 'Update job device row status', -1, 'group_header', FALSE),
  ('A0014', 1, '대기', 'pending', 1, 'pending', TRUE),
  ('A0014', 2, '진행중', 'in_progress', 2, 'in_progress', TRUE),
  ('A0014', 3, '성공', 'success', 3, 'success', TRUE),
  ('A0014', 4, '실패', 'failed', 4, 'failed', TRUE)
ON CONFLICT (main_code, sub_code) DO NOTHING;

-- -----------------------------------------------------------------------------
-- Snowflake ID generator (shard-friendly BIGINT PK default)
-- -----------------------------------------------------------------------------
CREATE SEQUENCE IF NOT EXISTS public.snowflake_id_seq;

CREATE OR REPLACE FUNCTION public.generate_snowflake_id()
RETURNS BIGINT
LANGUAGE plpgsql
AS $$
DECLARE
  v_epoch_ms BIGINT;
  v_seq BIGINT;
  v_node_id BIGINT := 1; -- shard/worker id (0..1023). Override per cluster if needed.
BEGIN
  v_epoch_ms := FLOOR(EXTRACT(EPOCH FROM clock_timestamp()) * 1000)::BIGINT;
  v_seq := nextval('public.snowflake_id_seq') & 4095; -- 12 bits
  RETURN (v_epoch_ms << 22) | ((v_node_id & 1023) << 12) | v_seq;
END;
$$;

-- -----------------------------------------------------------------------------
-- 1) 경고 코드·로케별 문구 — (alert_code, language_code) 단위; 상세 바인딩은 레지스트리 YAML
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS alert (
  id BIGINT PRIMARY KEY DEFAULT public.generate_snowflake_id(),
  alert_code VARCHAR(128) NOT NULL,
  domain_type INTEGER NOT NULL,
  alarm_grade_type INTEGER NOT NULL,
  severity_type INTEGER NOT NULL,
  language_code VARCHAR(16) NOT NULL
    REFERENCES public.language (code) ON DELETE RESTRICT,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  is_use BOOLEAN NOT NULL DEFAULT TRUE,
  remark VARCHAR(256) NULL,
  created_id INTEGER NULL
    REFERENCES public."user" (id) ON DELETE SET NULL,
  updated_id INTEGER NULL
    REFERENCES public."user" (id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  yyyymmddhh BIGINT NOT NULL,
  CONSTRAINT uk_alert_code_language UNIQUE (alert_code, language_code),
  CONSTRAINT chk_alert_domain_type CHECK (domain_type IN (1, 2, 3, 4, 5, 6, 7, 8)),
  CONSTRAINT chk_alert_alarm_grade_type CHECK (alarm_grade_type IN (1, 2)),
  CONSTRAINT chk_alert_severity_type CHECK (severity_type IN (1, 2, 3)),
  CONSTRAINT chk_alert_yyyymmddhh CHECK (yyyymmddhh >= 1970010100 AND yyyymmddhh <= 9999123123)
);
COMMENT ON COLUMN alert.id IS 'PK. 로케별 행 식별. notification 은 alert_code+language_code 로 참조';
COMMENT ON COLUMN alert.alert_code IS '업무 키(복합 UK 의 일부). alarm_alert_code_registry·룰 notification_message_code 와 동일 문자열';
COMMENT ON COLUMN alert.domain_type IS 'A0004 sub_code 직접 저장(FK 아님). 기능 도메인. 1=communication_quality, 2=telemetry, 3=fota, 4=control, 5=image, 6=file, 7=custom, 8=alarm';
COMMENT ON COLUMN alert.alarm_grade_type IS 'A0003 sub_code 직접 저장(FK 아님). 1=P1(1급), 2=P3(3급). 불변';
COMMENT ON COLUMN alert.severity_type IS 'A0002 sub_code 직접 저장(FK 아님). 1=info, 2=warn, 3=error. 불변';
COMMENT ON COLUMN alert.language_code IS 'FK → language.code (복합 UK 의 일부). 로케별 title/body (ko, en)';
COMMENT ON COLUMN alert.title IS '제목 템플릿 (레지스트리 placeholder_syntax 와 동일 규칙 권장)';
COMMENT ON COLUMN alert.body IS '본문 템플릿';
COMMENT ON COLUMN alert.is_use IS '마스터 활성 여부';
COMMENT ON COLUMN alert.remark IS '운영 메모';
COMMENT ON COLUMN alert.created_id IS '등록자 "user".id';
COMMENT ON COLUMN alert.updated_id IS '수정자 "user".id';
COMMENT ON COLUMN alert.created_at IS '생성 시각';
COMMENT ON COLUMN alert.updated_at IS '수정 시각. 애플리케이션 저장 코드가 INSERT/UPDATE 시 명시적으로 설정';
COMMENT ON COLUMN alert.yyyymmddhh IS 'updated_at 의 UTC 시각을 yyyyMMddHH 형 정수로 저장 (예: 2026040614). 애플리케이션 저장 코드가 updated_at 과 함께 설정';


COMMENT ON TABLE alert IS '경고 코드 마스터(로케별). alert_code+language_code 당 title/body; 단말별 발생 이력 아님(device_id 없음). binding·채널·요약·placeholders 는 alarm_alert_code_registry YAML';

CREATE INDEX IF NOT EXISTS idx_alert_domain_type ON alert (domain_type) WHERE is_use = TRUE;
CREATE INDEX IF NOT EXISTS idx_alert_severity_type ON alert (severity_type) WHERE is_use = TRUE;
CREATE INDEX IF NOT EXISTS idx_alert_alarm_grade_type ON alert (alarm_grade_type) WHERE is_use = TRUE;
CREATE INDEX IF NOT EXISTS idx_alert_language_code ON alert (language_code);
CREATE INDEX IF NOT EXISTS idx_alert_yyyymmddhh ON alert (yyyymmddhh DESC);

-- -----------------------------------------------------------------------------
-- 2) 알림 이력 (포털·조직) — 단말 원천 이벤트는 원천 이벤트 저장소 device_notifications(device_code 필수)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notification (
  id BIGINT PRIMARY KEY DEFAULT public.generate_snowflake_id(),
  tenant_id BIGINT NOT NULL,
  alert_code VARCHAR(128) NOT NULL,
  language_code VARCHAR(16) NOT NULL
    REFERENCES public.language (code) ON DELETE RESTRICT,
  CONSTRAINT fk_notification_alert_locale
    FOREIGN KEY (alert_code, language_code)
    REFERENCES alert (alert_code, language_code),
  incident_id BIGINT,
  company_id INTEGER NULL
    REFERENCES public.company (id) ON DELETE SET NULL,
  branch_id INTEGER NULL
    REFERENCES public.branch (id) ON DELETE SET NULL,
  site_id INTEGER NULL
    REFERENCES public.site (id) ON DELETE SET NULL,
  product_id INTEGER NULL
    REFERENCES public.product (id) ON DELETE SET NULL,
  device_id INTEGER NULL
    REFERENCES public.device (id) ON DELETE SET NULL,
  channel VARCHAR(32) NOT NULL,
  recipient_user_id INTEGER NULL
    REFERENCES public."user" (id) ON DELETE SET NULL,
  recipient_destination TEXT,
  placeholders_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  rendered_title TEXT,
  rendered_body TEXT,
  notification_status VARCHAR(24) NOT NULL DEFAULT 'pending',
  error_detail TEXT,
  is_use BOOLEAN NOT NULL DEFAULT TRUE,
  remark VARCHAR(256) NULL,
  created_id INTEGER NULL
    REFERENCES public."user" (id) ON DELETE SET NULL,
  updated_id INTEGER NULL
    REFERENCES public."user" (id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sent_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  CONSTRAINT chk_notifications_notification_status
    CHECK (notification_status IN ('pending', 'queued', 'sent', 'delivered', 'failed', 'read', 'dismissed')),
  CONSTRAINT chk_notifications_placeholders_is_object
    CHECK (jsonb_typeof(placeholders_json) = 'object')
);
COMMENT ON COLUMN notification.id IS 'PK';
COMMENT ON COLUMN notification.tenant_id IS '테넌트 스코프';
COMMENT ON COLUMN notification.alert_code IS '업무 키. alert.alert_code 와 동일';
COMMENT ON COLUMN notification.language_code IS 'FK → language.code. 본 행의 발송·렌더·read_at 은 이 로케 전용. 동일 인시던트·수신자라도 언어마다 별도 notification 행(파이프라인 언어별 처리). UI 표시 언어 전환은 alert 마스터 재조회(본 컬럼 UPDATE 금지 권장)';
COMMENT ON COLUMN notification.incident_id IS '인시던트 스냅·연계 (DDL FK 없음, communication_alarm_incident 등)';
COMMENT ON COLUMN notification.company_id IS 'FK → company.id (선택). 삭제 시 NULL 로 보존';
COMMENT ON COLUMN notification.branch_id IS 'FK → branch.id (선택). 삭제 시 NULL 로 보존';
COMMENT ON COLUMN notification.site_id IS 'FK → site.id (선택). 삭제 시 NULL 로 보존';
COMMENT ON COLUMN notification.product_id IS 'FK → product.id (선택). 삭제 시 NULL 로 보존';
COMMENT ON COLUMN notification.device_id IS 'FK → device.id (선택). 단말 관련 수신함·발송 이력의 숫자 FK; 문자열 단말 고유값은 device.device_code 조인';
COMMENT ON COLUMN notification.channel IS '발송 채널 (in_app, email, sns 등 앱 정의)';
COMMENT ON COLUMN notification.recipient_user_id IS 'FK → "user".id (수신 사용자, nullable 가능한 채널)';
COMMENT ON COLUMN notification.recipient_destination IS '채널별 수신 주소·토픽 등 (이메일, ARN 등)';
COMMENT ON COLUMN notification.placeholders_json IS '템플릿 치환용 키·값 (JSON 객체, CHECK)';
COMMENT ON COLUMN notification.rendered_title IS '발송 시점 스냅 제목 (선택)';
COMMENT ON COLUMN notification.rendered_body IS '발송 시점 스냅 본문 (선택)';
COMMENT ON COLUMN notification.notification_status IS 'pending|queued|sent|delivered|failed|read|dismissed';
COMMENT ON COLUMN notification.error_detail IS '실패 시 사유 등';
COMMENT ON COLUMN notification.is_use IS '수신함 행 활성 여부(soft hide). notification_status 와 별도';
COMMENT ON COLUMN notification.remark IS '운영 메모';
COMMENT ON COLUMN notification.created_id IS '등록자 "user".id';
COMMENT ON COLUMN notification.updated_id IS '수정자 "user".id';
COMMENT ON COLUMN notification.created_at IS '생성 시각';
COMMENT ON COLUMN notification.updated_at IS '수정 시각. 애플리케이션 저장 코드가 UPDATE 시 명시적으로 설정';
COMMENT ON COLUMN notification.sent_at IS '발송 완료 등 시각';
COMMENT ON COLUMN notification.read_at IS '최초 열람 시각(first read). 여러 번 열람해도 최초 시각 유지';


COMMENT ON TABLE notification IS '포털·고객 수신함·발송 이력(언어별 1행). incident×channel×recipient×language_code 당 pending→sent→read. 단말 원천은 device_notifications';

CREATE UNIQUE INDEX IF NOT EXISTS uk_notification_incident_recipient_locale
  ON notification (incident_id, channel, recipient_user_id, language_code)
  WHERE incident_id IS NOT NULL AND recipient_user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_notifications_tenant_created ON notification (tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_alert_code_created ON notification (alert_code, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_alert_locale ON notification (alert_code, language_code);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_locale_unread
  ON notification (recipient_user_id, language_code, created_at DESC)
  WHERE channel = 'in_app' AND read_at IS NULL AND notification_status <> 'dismissed';
CREATE INDEX IF NOT EXISTS idx_notifications_site_created ON notification (site_id, created_at DESC)
  WHERE site_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_notifications_device_id ON notification (device_id)
  WHERE device_id IS NOT NULL;


-- -----------------------------------------------------------------------------
-- 3) 통신 품질 시간 팩트 — 원천 이벤트 저장소 lookback / 10분 버킷 기반
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS communication_quality_rollup (
  id BIGINT PRIMARY KEY DEFAULT public.generate_snowflake_id(),
  tenant_id BIGINT NOT NULL,
  device_id INTEGER NULL
    REFERENCES public.device (id) ON DELETE SET NULL,
  site_id INTEGER NULL
    REFERENCES public.site (id) ON DELETE SET NULL,
  product_id INTEGER NULL
    REFERENCES public.product (id) ON DELETE SET NULL,
  device_code VARCHAR(64) NOT NULL,
  source_window_start_ms BIGINT NOT NULL,
  source_window_end_ms BIGINT NOT NULL,
  source_created_10min_min BIGINT NULL,
  source_created_10min_max BIGINT NULL,
  source_event_keys JSONB NOT NULL DEFAULT '[]'::jsonb,
  source_event_count INTEGER NOT NULL DEFAULT 0,
  expected_heartbeat_count INTEGER NOT NULL DEFAULT 0,
  observed_heartbeat_count INTEGER NOT NULL DEFAULT 0,
  missed_heartbeat_intervals INTEGER NOT NULL DEFAULT 0,
  comm_error_count INTEGER NOT NULL DEFAULT 0,
  comm_state_ok_count INTEGER NOT NULL DEFAULT 0,
  comm_state_warn_count INTEGER NOT NULL DEFAULT 0,
  comm_state_error_count INTEGER NOT NULL DEFAULT 0,
  latency_ms NUMERIC(14, 3) NULL,
  latency_p95_ms NUMERIC(14, 3) NULL,
  packet_loss_percent NUMERIC(8, 4) NULL,
  quality_score NUMERIC(6, 2) NULL,
  quality_grade VARCHAR(16) NOT NULL DEFAULT 'unknown',
  ruleset_code VARCHAR(128) NULL,
  batch_run_code VARCHAR(128) NULL,
  is_use BOOLEAN NOT NULL DEFAULT TRUE,
  remark VARCHAR(256) NULL,
  created_id INTEGER NULL
    REFERENCES public."user" (id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uk_comm_quality_rollups_device_window
    UNIQUE (tenant_id, device_code, source_window_start_ms),
  CONSTRAINT chk_comm_quality_rollups_window CHECK (source_window_end_ms > source_window_start_ms),
  CONSTRAINT chk_comm_quality_rollups_source_keys CHECK (jsonb_typeof(source_event_keys) = 'array'),
  CONSTRAINT chk_comm_quality_rollups_error_count CHECK (comm_error_count >= 0),
  CONSTRAINT chk_comm_quality_rollups_state_ok_count CHECK (comm_state_ok_count >= 0),
  CONSTRAINT chk_comm_quality_rollups_state_warn_count CHECK (comm_state_warn_count >= 0),
  CONSTRAINT chk_comm_quality_rollups_state_error_count CHECK (comm_state_error_count >= 0),
  CONSTRAINT chk_comm_quality_rollups_quality_grade CHECK (quality_grade IN ('good', 'degraded', 'bad', 'unknown'))
);
COMMENT ON COLUMN communication_quality_rollup.id IS 'PK';
COMMENT ON COLUMN communication_quality_rollup.tenant_id IS '테넌트 스코프';
COMMENT ON COLUMN communication_quality_rollup.device_id IS 'FK → device.id. 삭제 시 NULL 로 보존';
COMMENT ON COLUMN communication_quality_rollup.site_id IS 'FK → site.id (선택). 삭제 시 NULL 로 보존';
COMMENT ON COLUMN communication_quality_rollup.product_id IS 'FK → product.id (선택). 삭제 시 NULL 로 보존';
COMMENT ON COLUMN communication_quality_rollup.device_code IS '단말 문자열 고유값(DocumentDB·device.device_code 와 동일)';
COMMENT ON COLUMN communication_quality_rollup.source_window_start_ms IS '원천 이벤트 조회/평가 윈도우 시작 epoch ms';
COMMENT ON COLUMN communication_quality_rollup.source_window_end_ms IS '원천 이벤트 조회/평가 윈도우 종료 epoch ms';
COMMENT ON COLUMN communication_quality_rollup.source_created_10min_min IS '윈도우 내 최소 created_10min 버킷';
COMMENT ON COLUMN communication_quality_rollup.source_created_10min_max IS '윈도우 내 최대 created_10min 버킷';
COMMENT ON COLUMN communication_quality_rollup.source_event_keys IS '평가에 사용된 원천 이벤트 키 배열';
COMMENT ON COLUMN communication_quality_rollup.source_event_count IS '평가 윈도우에 포함된 원천 이벤트 수';
COMMENT ON COLUMN communication_quality_rollup.expected_heartbeat_count IS '제품 기대 주기 기준 예상 heartbeat 수';
COMMENT ON COLUMN communication_quality_rollup.observed_heartbeat_count IS '실제 관측 heartbeat 수';
COMMENT ON COLUMN communication_quality_rollup.missed_heartbeat_intervals IS '누락된 heartbeat interval 수';
COMMENT ON COLUMN communication_quality_rollup.comm_error_count IS '평가 윈도우 내 통신 에러 이벤트 수';
COMMENT ON COLUMN communication_quality_rollup.comm_state_ok_count IS '평가 윈도우 내 통신 상태 OK 집계 수';
COMMENT ON COLUMN communication_quality_rollup.comm_state_warn_count IS '평가 윈도우 내 통신 상태 WARN 집계 수';
COMMENT ON COLUMN communication_quality_rollup.comm_state_error_count IS '평가 윈도우 내 통신 상태 ERROR 집계 수';
COMMENT ON COLUMN communication_quality_rollup.latency_ms IS '평가 윈도우 대표 지연시간(ms, 기본 평균값)';
COMMENT ON COLUMN communication_quality_rollup.latency_p95_ms IS '평가 윈도우 지연시간 p95(ms)';
COMMENT ON COLUMN communication_quality_rollup.packet_loss_percent IS '패킷 손실률(%)';
COMMENT ON COLUMN communication_quality_rollup.quality_score IS '통신 품질 점수(0~100 권장)';
COMMENT ON COLUMN communication_quality_rollup.quality_grade IS '통신 품질 등급(good, degraded, bad, unknown)';
COMMENT ON COLUMN communication_quality_rollup.ruleset_code IS '평가에 사용한 YAML ruleset 코드 스냅샷';
COMMENT ON COLUMN communication_quality_rollup.batch_run_code IS '배치 실행 코드';
COMMENT ON COLUMN communication_quality_rollup.is_use IS '활성 여부';
COMMENT ON COLUMN communication_quality_rollup.remark IS '운영 메모';
COMMENT ON COLUMN communication_quality_rollup.created_id IS '배치·등록 주체 "user".id (선택)';
COMMENT ON COLUMN communication_quality_rollup.created_at IS '적재 시각(INSERT 후 불변)';


COMMENT ON TABLE communication_quality_rollup IS '단말별 통신 품질 시간 버킷 팩트(INSERT 후 불변). 윈도우 재평가 시 신규 행 또는 UK 충돌 정책은 앱에서 처리';

CREATE INDEX IF NOT EXISTS idx_comm_quality_rollups_device_time
  ON communication_quality_rollup (device_code, source_window_start_ms DESC);
CREATE INDEX IF NOT EXISTS idx_comm_quality_rollups_site_time
  ON communication_quality_rollup (site_id, source_window_start_ms DESC)
  WHERE site_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_comm_quality_rollups_product_time
  ON communication_quality_rollup (product_id, source_window_start_ms DESC)
  WHERE product_id IS NOT NULL;


CREATE TABLE IF NOT EXISTS communication_quality_rollup_site (
  id BIGINT PRIMARY KEY DEFAULT public.generate_snowflake_id(),
  tenant_id BIGINT NOT NULL,
  site_id INTEGER NOT NULL,
  product_id INTEGER NULL
    REFERENCES public.product (id) ON DELETE SET NULL,
  source_window_start_ms BIGINT NOT NULL,
  source_window_end_ms BIGINT NOT NULL,
  source_created_10min_min BIGINT NULL,
  source_created_10min_max BIGINT NULL,
  device_count INTEGER NOT NULL DEFAULT 0,
  degraded_device_count INTEGER NOT NULL DEFAULT 0,
  offline_device_count INTEGER NOT NULL DEFAULT 0,
  avg_latency_ms NUMERIC(14, 3) NULL,
  max_latency_ms NUMERIC(14, 3) NULL,
  avg_packet_loss_percent NUMERIC(8, 4) NULL,
  total_missed_heartbeat_intervals INTEGER NOT NULL DEFAULT 0,
  source_rollup_id_from BIGINT NULL,
  source_rollup_id_to BIGINT NULL,
  ruleset_code VARCHAR(128) NULL,
  batch_run_code VARCHAR(128) NULL,
  is_use BOOLEAN NOT NULL DEFAULT TRUE,
  remark VARCHAR(256) NULL,
  created_id INTEGER NULL
    REFERENCES public."user" (id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_comm_quality_rollups_site_window CHECK (source_window_end_ms > source_window_start_ms),
  CONSTRAINT chk_comm_quality_rollups_site_source_range
    CHECK (source_rollup_id_from IS NULL OR source_rollup_id_to IS NULL OR source_rollup_id_to >= source_rollup_id_from)
);
COMMENT ON COLUMN communication_quality_rollup_site.id IS 'PK';
COMMENT ON COLUMN communication_quality_rollup_site.tenant_id IS '테넌트 스코프';
COMMENT ON COLUMN communication_quality_rollup_site.site_id IS '사이트 ID 스냅샷';
COMMENT ON COLUMN communication_quality_rollup_site.product_id IS '제품 ID 스냅샷. NULL 이면 사이트 전체 집계';
COMMENT ON COLUMN communication_quality_rollup_site.source_window_start_ms IS '원천 이벤트 조회/평가 윈도우 시작 epoch ms';
COMMENT ON COLUMN communication_quality_rollup_site.source_window_end_ms IS '원천 이벤트 조회/평가 윈도우 종료 epoch ms';
COMMENT ON COLUMN communication_quality_rollup_site.source_created_10min_min IS '집계에 포함된 최소 created_10min 버킷';
COMMENT ON COLUMN communication_quality_rollup_site.source_created_10min_max IS '집계에 포함된 최대 created_10min 버킷';
COMMENT ON COLUMN communication_quality_rollup_site.device_count IS '평가 대상 단말 수';
COMMENT ON COLUMN communication_quality_rollup_site.degraded_device_count IS '성능 저하 또는 경고 상태 단말 수';
COMMENT ON COLUMN communication_quality_rollup_site.offline_device_count IS '오프라인 판단 단말 수';
COMMENT ON COLUMN communication_quality_rollup_site.avg_latency_ms IS '사이트/제품 단위 평균 지연 시간(ms)';
COMMENT ON COLUMN communication_quality_rollup_site.max_latency_ms IS '사이트/제품 단위 최대 지연 시간(ms)';
COMMENT ON COLUMN communication_quality_rollup_site.avg_packet_loss_percent IS '사이트/제품 단위 평균 패킷 손실률(%)';
COMMENT ON COLUMN communication_quality_rollup_site.total_missed_heartbeat_intervals IS '사이트/제품 단위 누락 heartbeat interval 합계';
COMMENT ON COLUMN communication_quality_rollup_site.source_rollup_id_from IS '집계 입력으로 사용한 communication_quality_rollup.id 최소값';
COMMENT ON COLUMN communication_quality_rollup_site.source_rollup_id_to IS '집계 입력으로 사용한 communication_quality_rollup.id 최대값';
COMMENT ON COLUMN communication_quality_rollup_site.ruleset_code IS '평가에 사용한 YAML ruleset 코드 스냅샷';
COMMENT ON COLUMN communication_quality_rollup_site.batch_run_code IS '배치 실행 코드';
COMMENT ON COLUMN communication_quality_rollup_site.is_use IS '활성 여부';
COMMENT ON COLUMN communication_quality_rollup_site.remark IS '운영 메모';
COMMENT ON COLUMN communication_quality_rollup_site.created_id IS '배치·등록 주체 "user".id (선택)';
COMMENT ON COLUMN communication_quality_rollup_site.created_at IS '적재 시각(INSERT 후 불변)';


COMMENT ON TABLE communication_quality_rollup_site IS '사이트별 통신 품질 시간 버킷 팩트(INSERT 후 불변). 단말 롤업을 site/product 단위로 합산';
CREATE UNIQUE INDEX IF NOT EXISTS uk_comm_quality_rollups_site_window
  ON communication_quality_rollup_site (tenant_id, site_id, COALESCE(product_id, 0), source_window_start_ms);
CREATE INDEX IF NOT EXISTS idx_comm_quality_rollups_site_lookup
  ON communication_quality_rollup_site (tenant_id, site_id, source_window_start_ms DESC);
CREATE INDEX IF NOT EXISTS idx_comm_quality_rollups_site_product
  ON communication_quality_rollup_site (product_id, source_window_start_ms DESC)
  WHERE product_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS communication_quality_rollup_branch (
  id BIGINT PRIMARY KEY DEFAULT public.generate_snowflake_id(),
  tenant_id BIGINT NOT NULL,
  branch_id INTEGER NOT NULL
    REFERENCES public.branch (id) ON DELETE CASCADE,
  product_id INTEGER NULL
    REFERENCES public.product (id) ON DELETE SET NULL,
  source_window_start_ms BIGINT NOT NULL,
  source_window_end_ms BIGINT NOT NULL,
  source_created_10min_min BIGINT NULL,
  source_created_10min_max BIGINT NULL,
  site_count INTEGER NOT NULL DEFAULT 0,
  device_count INTEGER NOT NULL DEFAULT 0,
  degraded_device_count INTEGER NOT NULL DEFAULT 0,
  offline_device_count INTEGER NOT NULL DEFAULT 0,
  avg_latency_ms NUMERIC(14, 3) NULL,
  max_latency_ms NUMERIC(14, 3) NULL,
  avg_packet_loss_percent NUMERIC(8, 4) NULL,
  total_missed_heartbeat_intervals INTEGER NOT NULL DEFAULT 0,
  source_rollup_id_from BIGINT NULL,
  source_rollup_id_to BIGINT NULL,
  ruleset_code VARCHAR(128) NULL,
  batch_run_code VARCHAR(128) NULL,
  is_use BOOLEAN NOT NULL DEFAULT TRUE,
  remark VARCHAR(256) NULL,
  created_id INTEGER NULL
    REFERENCES public."user" (id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_comm_quality_rollups_branch_window CHECK (source_window_end_ms > source_window_start_ms)
);
COMMENT ON TABLE communication_quality_rollup_branch IS '지점별 통신 품질 시간 버킷(INSERT 후 불변). site 롤업 또는 device 롤업을 branch 축으로 합산';
COMMENT ON COLUMN communication_quality_rollup_branch.branch_id IS 'FK → branch.id';
CREATE UNIQUE INDEX IF NOT EXISTS uk_comm_quality_rollups_branch_window
  ON communication_quality_rollup_branch (tenant_id, branch_id, COALESCE(product_id, 0), source_window_start_ms);
CREATE INDEX IF NOT EXISTS idx_comm_quality_rollups_branch_lookup
  ON communication_quality_rollup_branch (tenant_id, branch_id, source_window_start_ms DESC);


CREATE TABLE IF NOT EXISTS communication_alarm_incident (
  id BIGINT PRIMARY KEY DEFAULT public.generate_snowflake_id(),
  tenant_id BIGINT NOT NULL,
  alert_code VARCHAR(128) NOT NULL,
  alarm_type_code VARCHAR(64) NULL,
  alarm_label VARCHAR(255) NULL,
  ruleset_code VARCHAR(128) NULL,
  rule_code VARCHAR(128) NULL,
  severity_type INTEGER NOT NULL,
  alarm_grade_type INTEGER NOT NULL,
  incident_status VARCHAR(24) NOT NULL DEFAULT 'open',
  handling_mode VARCHAR(32) NOT NULL DEFAULT 'remote_diagnosis',
  company_id INTEGER NULL
    REFERENCES public.company (id) ON DELETE SET NULL,
  branch_id INTEGER NULL
    REFERENCES public.branch (id) ON DELETE SET NULL,
  site_id INTEGER NULL
    REFERENCES public.site (id) ON DELETE SET NULL,
  product_id INTEGER NULL
    REFERENCES public.product (id) ON DELETE SET NULL,
  device_id INTEGER NULL
    REFERENCES public.device (id) ON DELETE SET NULL,
  device_code VARCHAR(64) NULL,
  quality_grade_at_open VARCHAR(16) NULL,
  quality_score_at_open NUMERIC(6, 2) NULL,
  comm_error_count_at_open INTEGER NULL,
  comm_state_ok_count_at_open INTEGER NULL,
  comm_state_warn_count_at_open INTEGER NULL,
  comm_state_error_count_at_open INTEGER NULL,
  latency_ms_at_open NUMERIC(14, 3) NULL,
  packet_loss_percent_at_open NUMERIC(8, 4) NULL,
  owner_team_type VARCHAR(32) NULL,
  owner_user_id INTEGER NULL
    REFERENCES public."user" (id) ON DELETE SET NULL,
  transferred_to_team_type VARCHAR(32) NULL,
  transferred_to_user_id INTEGER NULL
    REFERENCES public."user" (id) ON DELETE SET NULL,
  transferred_at TIMESTAMPTZ NULL,
  last_transfer_reason VARCHAR(256) NULL,
  remote_command_code VARCHAR(128) NULL,
  service_ticket_no VARCHAR(128) NULL,
  field_engineer_user_id INTEGER NULL
    REFERENCES public."user" (id) ON DELETE SET NULL,
  field_dispatched_at TIMESTAMPTZ NULL,
  field_arrived_at TIMESTAMPTZ NULL,
  field_completed_at TIMESTAMPTZ NULL,
  acknowledged_by INTEGER NULL
    REFERENCES public."user" (id) ON DELETE SET NULL,
  processing_started_at TIMESTAMPTZ NULL,
  processing_by INTEGER NULL
    REFERENCES public."user" (id) ON DELETE SET NULL,
  opened_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  acknowledged_at TIMESTAMPTZ NULL,
  resolved_at TIMESTAMPTZ NULL,
  resolved_by INTEGER NULL
    REFERENCES public."user" (id) ON DELETE SET NULL,
  closed_at TIMESTAMPTZ NULL,
  closed_by INTEGER NULL
    REFERENCES public."user" (id) ON DELETE SET NULL,
  sla_due_at TIMESTAMPTZ NULL,
  resolution_note TEXT NULL,
  is_use BOOLEAN NOT NULL DEFAULT TRUE,
  remark VARCHAR(256) NULL,
  created_id INTEGER NULL
    REFERENCES public."user" (id) ON DELETE SET NULL,
  updated_id INTEGER NULL
    REFERENCES public."user" (id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_comm_alarm_incident_incident_status CHECK (
    incident_status IN ('open', 'acknowledged', 'in_progress', 'resolved', 'closed', 'suppressed', 'reopened')
  ),
  CONSTRAINT chk_comm_alarm_incident_handling_mode CHECK (
    handling_mode IN ('remote_control', 'remote_diagnosis', 'field_service_transfer', 'customer_action_required', 'monitor_only')
  ),
  CONSTRAINT chk_comm_alarm_incident_quality_grade CHECK (
    quality_grade_at_open IS NULL OR quality_grade_at_open IN ('good', 'degraded', 'bad', 'unknown')
  ),
  CONSTRAINT chk_comm_alarm_incident_error_count CHECK (
    comm_error_count_at_open IS NULL OR comm_error_count_at_open >= 0
  ),
  CONSTRAINT chk_comm_alarm_incident_state_ok_count CHECK (
    comm_state_ok_count_at_open IS NULL OR comm_state_ok_count_at_open >= 0
  ),
  CONSTRAINT chk_comm_alarm_incident_state_warn_count CHECK (
    comm_state_warn_count_at_open IS NULL OR comm_state_warn_count_at_open >= 0
  ),
  CONSTRAINT chk_comm_alarm_incident_state_error_count CHECK (
    comm_state_error_count_at_open IS NULL OR comm_state_error_count_at_open >= 0
  ),
  CONSTRAINT chk_comm_alarm_incident_severity_type CHECK (severity_type IN (1, 2, 3)),
  CONSTRAINT chk_comm_alarm_incident_alarm_grade_type CHECK (alarm_grade_type IN (1, 2))
);
COMMENT ON COLUMN communication_alarm_incident.id IS 'PK. notification.incident_id 가 논리적으로 참조';
COMMENT ON COLUMN communication_alarm_incident.tenant_id IS '테넌트 스코프';
COMMENT ON COLUMN communication_alarm_incident.alert_code IS '알람 메시지 코드. alert.alert_code 및 레지스트리 YAML 과 동일 문자열';
COMMENT ON COLUMN communication_alarm_incident.alarm_type_code IS '알람 유형 코드(예: comm_timeout, comm_packet_loss, comm_state_degraded)';
COMMENT ON COLUMN communication_alarm_incident.alarm_label IS '운영 화면 표시용 알람명 스냅샷';
COMMENT ON COLUMN communication_alarm_incident.ruleset_code IS '알람 시작에 사용된 YAML ruleset 코드 스냅샷';
COMMENT ON COLUMN communication_alarm_incident.rule_code IS '알람 시작에 사용된 YAML rule 코드 스냅샷';
COMMENT ON COLUMN communication_alarm_incident.severity_type IS 'A0002 sub_code 직접 저장(FK 아님). 1=info, 2=warn, 3=error. 공통코드 정의와 동일';
COMMENT ON COLUMN communication_alarm_incident.alarm_grade_type IS 'A0003 sub_code 직접 저장(FK 아님). 1=P1(1급), 2=P3(3급). 공통코드 정의와 동일';
COMMENT ON COLUMN communication_alarm_incident.incident_status IS '인시던트 상태(open, acknowledged, in_progress, resolved, closed, suppressed, reopened)';
COMMENT ON COLUMN communication_alarm_incident.handling_mode IS '처리 전략(remote_control, remote_diagnosis, field_service_transfer, customer_action_required, monitor_only)';
COMMENT ON COLUMN communication_alarm_incident.company_id IS 'FK → company.id (선택). 삭제 시 NULL 로 보존';
COMMENT ON COLUMN communication_alarm_incident.branch_id IS 'FK → branch.id (선택). 삭제 시 NULL 로 보존';
COMMENT ON COLUMN communication_alarm_incident.site_id IS 'FK → site.id (선택). 삭제 시 NULL 로 보존';
COMMENT ON COLUMN communication_alarm_incident.product_id IS 'FK → product.id (선택). 삭제 시 NULL 로 보존';
COMMENT ON COLUMN communication_alarm_incident.device_id IS 'FK → device.id. 알람이 특정 단말에서 발생한 경우 저장하는 숫자 FK. 삭제 시 NULL 로 보존';
COMMENT ON COLUMN communication_alarm_incident.device_code IS '단말 문자열 고유값(DocumentDB·device.device_code 와 동일 스냅샷)';
COMMENT ON COLUMN communication_alarm_incident.quality_grade_at_open IS '알람 발생 시점 통신 품질 등급(good, degraded, bad, unknown)';
COMMENT ON COLUMN communication_alarm_incident.quality_score_at_open IS '알람 발생 시점 통신 품질 점수';
COMMENT ON COLUMN communication_alarm_incident.comm_error_count_at_open IS '알람 발생 시점 통신 에러 수';
COMMENT ON COLUMN communication_alarm_incident.comm_state_ok_count_at_open IS '알람 발생 시점 통신 상태 OK 수';
COMMENT ON COLUMN communication_alarm_incident.comm_state_warn_count_at_open IS '알람 발생 시점 통신 상태 WARN 수';
COMMENT ON COLUMN communication_alarm_incident.comm_state_error_count_at_open IS '알람 발생 시점 통신 상태 ERROR 수';
COMMENT ON COLUMN communication_alarm_incident.latency_ms_at_open IS '알람 발생 시점 대표 지연시간(ms)';
COMMENT ON COLUMN communication_alarm_incident.packet_loss_percent_at_open IS '알람 발생 시점 패킷 손실률(%)';
COMMENT ON COLUMN communication_alarm_incident.owner_team_type IS '현재 처리 주체 팀 유형(noc, remote_ops, field_service, partner_service, customer 등)';
COMMENT ON COLUMN communication_alarm_incident.owner_user_id IS '현재 담당자 "user".id';
COMMENT ON COLUMN communication_alarm_incident.transferred_to_team_type IS '마지막 이관 대상 팀 유형';
COMMENT ON COLUMN communication_alarm_incident.transferred_to_user_id IS '마지막 이관 대상 담당자 "user".id';
COMMENT ON COLUMN communication_alarm_incident.transferred_at IS '마지막 이관 시각';
COMMENT ON COLUMN communication_alarm_incident.last_transfer_reason IS '마지막 이관 사유';
COMMENT ON COLUMN communication_alarm_incident.remote_command_code IS '마지막 원격 제어 명령/프로시저 코드';
COMMENT ON COLUMN communication_alarm_incident.service_ticket_no IS '서비스 기사 이관 티켓 번호';
COMMENT ON COLUMN communication_alarm_incident.field_engineer_user_id IS '배정된 서비스 기사 "user".id';
COMMENT ON COLUMN communication_alarm_incident.field_dispatched_at IS '기사 배정/출동 지시 시각';
COMMENT ON COLUMN communication_alarm_incident.field_arrived_at IS '기사 현장 도착 시각';
COMMENT ON COLUMN communication_alarm_incident.field_completed_at IS '기사 조치 완료 시각';
COMMENT ON COLUMN communication_alarm_incident.acknowledged_by IS '최초 확인자 "user".id';
COMMENT ON COLUMN communication_alarm_incident.processing_started_at IS '처리 시작 시각';
COMMENT ON COLUMN communication_alarm_incident.processing_by IS '처리 시작 담당자 "user".id';
COMMENT ON COLUMN communication_alarm_incident.opened_at IS '인시던트 최초 발생 시각';
COMMENT ON COLUMN communication_alarm_incident.acknowledged_at IS '운영자가 확인한 시각';
COMMENT ON COLUMN communication_alarm_incident.resolved_at IS '인시던트 종료 시각';
COMMENT ON COLUMN communication_alarm_incident.resolved_by IS '해결 처리 담당자 "user".id';
COMMENT ON COLUMN communication_alarm_incident.closed_at IS '사후 검증 후 최종 종료 시각';
COMMENT ON COLUMN communication_alarm_incident.closed_by IS '최종 종료 처리 담당자 "user".id';
COMMENT ON COLUMN communication_alarm_incident.sla_due_at IS 'SLA 기준 대응 마감 시각';
COMMENT ON COLUMN communication_alarm_incident.resolution_note IS '해결/종료 요약 메모';
COMMENT ON COLUMN communication_alarm_incident.is_use IS '활성 여부';
COMMENT ON COLUMN communication_alarm_incident.remark IS '운영 메모';
COMMENT ON COLUMN communication_alarm_incident.created_id IS '등록자 "user".id';
COMMENT ON COLUMN communication_alarm_incident.updated_id IS '최종 수정자 "user".id';
COMMENT ON COLUMN communication_alarm_incident.created_at IS '생성 시각';
COMMENT ON COLUMN communication_alarm_incident.updated_at IS '수정 시각. 애플리케이션 저장 코드가 UPDATE 시 명시적으로 설정';


COMMENT ON TABLE communication_alarm_incident IS '알람 인시던트 처리 워크플로우 테이블. 상태/담당/이관/원격·현장 조치 단계를 관리';
CREATE INDEX IF NOT EXISTS idx_comm_alarm_incidents_tenant_status
  ON communication_alarm_incident (tenant_id, incident_status, opened_at DESC);
CREATE INDEX IF NOT EXISTS idx_comm_alarm_incidents_alert
  ON communication_alarm_incident (alert_code, opened_at DESC);
CREATE INDEX IF NOT EXISTS idx_comm_alarm_incidents_site
  ON communication_alarm_incident (site_id, opened_at DESC)
  WHERE site_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_comm_alarm_incidents_device_id
  ON communication_alarm_incident (device_id, opened_at DESC)
  WHERE device_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_comm_alarm_incidents_handling_mode
  ON communication_alarm_incident (handling_mode, incident_status, opened_at DESC);
CREATE INDEX IF NOT EXISTS idx_comm_alarm_incidents_owner_user
  ON communication_alarm_incident (owner_user_id, incident_status, opened_at DESC)
  WHERE owner_user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_comm_alarm_incidents_ticket
  ON communication_alarm_incident (service_ticket_no)
  WHERE service_ticket_no IS NOT NULL;

CREATE TABLE IF NOT EXISTS communication_alarm_incident_action (
  id BIGINT PRIMARY KEY DEFAULT public.generate_snowflake_id(),
  incident_id BIGINT NOT NULL
    REFERENCES communication_alarm_incident (id) ON DELETE CASCADE,
  tenant_id BIGINT NOT NULL,
  action_type VARCHAR(48) NOT NULL,
  actor_team_type VARCHAR(32) NULL,
  actor_user_id INTEGER NULL
    REFERENCES public."user" (id) ON DELETE SET NULL,
  from_status VARCHAR(24) NULL,
  to_status VARCHAR(24) NULL,
  handling_mode VARCHAR(32) NULL,
  transfer_to_team_type VARCHAR(32) NULL,
  transfer_to_user_id INTEGER NULL
    REFERENCES public."user" (id) ON DELETE SET NULL,
  service_ticket_no VARCHAR(128) NULL,
  remote_command_code VARCHAR(128) NULL,
  action_note TEXT NULL,
  payload_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_use BOOLEAN NOT NULL DEFAULT TRUE,
  remark VARCHAR(256) NULL,
  created_id INTEGER NULL
    REFERENCES public."user" (id) ON DELETE SET NULL,
  acted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_comm_alarm_incident_actions_action_type CHECK (
    action_type IN (
      'created',
      'acknowledged',
      'start_processing',
      'start_remote_control',
      'remote_control_success',
      'remote_control_failed',
      'transfer_to_field_service',
      'transfer_to_remote_ops',
      'transfer_to_partner',
      'field_dispatched',
      'field_arrived',
      'field_completed',
      'resolved',
      'closed',
      'suppressed',
      'reopened'
    )
  ),
  CONSTRAINT chk_comm_alarm_incident_actions_payload CHECK (jsonb_typeof(payload_json) = 'object')
);
COMMENT ON TABLE communication_alarm_incident_action IS '인시던트 처리 단계 이력(audit). 원격 제어, 서비스기사 이관, 상태 전이 기록';
COMMENT ON COLUMN communication_alarm_incident_action.id IS 'PK';
COMMENT ON COLUMN communication_alarm_incident_action.incident_id IS 'FK → communication_alarm_incident.id';
COMMENT ON COLUMN communication_alarm_incident_action.tenant_id IS '테넌트 스코프';
COMMENT ON COLUMN communication_alarm_incident_action.action_type IS '처리 액션 유형(created, acknowledged, start_remote_control, transfer_to_field_service 등)';
COMMENT ON COLUMN communication_alarm_incident_action.actor_team_type IS '액션 수행 팀 유형';
COMMENT ON COLUMN communication_alarm_incident_action.actor_user_id IS '액션 수행자 "user".id';
COMMENT ON COLUMN communication_alarm_incident_action.from_status IS '상태 전이 이전 값';
COMMENT ON COLUMN communication_alarm_incident_action.to_status IS '상태 전이 이후 값';
COMMENT ON COLUMN communication_alarm_incident_action.handling_mode IS '액션 시점 처리 전략';
COMMENT ON COLUMN communication_alarm_incident_action.transfer_to_team_type IS '이관 대상 팀 유형';
COMMENT ON COLUMN communication_alarm_incident_action.transfer_to_user_id IS '이관 대상 담당자 "user".id';
COMMENT ON COLUMN communication_alarm_incident_action.service_ticket_no IS '서비스 이관 티켓 번호';
COMMENT ON COLUMN communication_alarm_incident_action.remote_command_code IS '원격 제어 명령/프로시저 코드';
COMMENT ON COLUMN communication_alarm_incident_action.action_note IS '처리 메모';
COMMENT ON COLUMN communication_alarm_incident_action.payload_json IS '액션 상세 컨텍스트(JSON)';
COMMENT ON COLUMN communication_alarm_incident_action.is_use IS '이력 행 활성 여부(soft hide)';
COMMENT ON COLUMN communication_alarm_incident_action.remark IS '운영 메모';
COMMENT ON COLUMN communication_alarm_incident_action.created_id IS '레코드 등록자 "user".id (선택, actor_user_id 와 별도)';
COMMENT ON COLUMN communication_alarm_incident_action.acted_at IS '실제 액션 시각';
COMMENT ON COLUMN communication_alarm_incident_action.created_at IS '레코드 생성 시각(INSERT 후 불변)';
CREATE INDEX IF NOT EXISTS idx_comm_alarm_incident_actions_incident_time
  ON communication_alarm_incident_action (incident_id, acted_at DESC);
CREATE INDEX IF NOT EXISTS idx_comm_alarm_incident_actions_tenant_type_time
  ON communication_alarm_incident_action (tenant_id, action_type, acted_at DESC);


-- -----------------------------------------------------------------------------
-- 4) YAML 룰셋 미러 — Git YAML 이 SSOT, DB 는 운영/감사/테넌트 오버라이드용
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notification_ruleset (
  id BIGINT PRIMARY KEY DEFAULT public.generate_snowflake_id(),
  tenant_id BIGINT NULL,
  ruleset_code VARCHAR(128) NOT NULL,
  ruleset_name VARCHAR(255) NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  source_yaml_hash VARCHAR(128) NULL,
  revision INTEGER NOT NULL DEFAULT 1,
  synced_at TIMESTAMPTZ NULL,
  ruleset_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_use BOOLEAN NOT NULL DEFAULT TRUE,
  remark VARCHAR(256) NULL,
  created_id INTEGER NULL
    REFERENCES public."user" (id) ON DELETE SET NULL,
  updated_id INTEGER NULL
    REFERENCES public."user" (id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_notification_ruleset_json CHECK (jsonb_typeof(ruleset_json) = 'object')
);
COMMENT ON COLUMN notification_ruleset.id IS 'PK';
COMMENT ON COLUMN notification_ruleset.tenant_id IS '테넌트 스코프. NULL 이면 글로벌 기본 룰셋';
COMMENT ON COLUMN notification_ruleset.ruleset_code IS 'YAML rulesets[].code';
COMMENT ON COLUMN notification_ruleset.ruleset_name IS '운영 화면 표시용 룰셋 이름';
COMMENT ON COLUMN notification_ruleset.enabled IS '룰셋 활성 여부';
COMMENT ON COLUMN notification_ruleset.source_yaml_hash IS '동기화한 YAML 원본 해시';
COMMENT ON COLUMN notification_ruleset.revision IS '룰셋 미러 리비전';
COMMENT ON COLUMN notification_ruleset.synced_at IS 'YAML ↔ DB 동기화 시각';
COMMENT ON COLUMN notification_ruleset.ruleset_json IS '원본 ruleset 객체 스냅샷(JSON)';
COMMENT ON COLUMN notification_ruleset.is_use IS '활성 여부';
COMMENT ON COLUMN notification_ruleset.remark IS '운영 메모';
COMMENT ON COLUMN notification_ruleset.created_id IS '등록자 "user".id';
COMMENT ON COLUMN notification_ruleset.updated_id IS '최종 수정자 "user".id';
COMMENT ON COLUMN notification_ruleset.created_at IS '생성 시각';
COMMENT ON COLUMN notification_ruleset.updated_at IS '수정 시각. 애플리케이션 저장 코드가 UPDATE 시 명시적으로 설정';


COMMENT ON TABLE notification_ruleset IS 'YAML rulesets[] 미러. 정본은 data-platform.manifest.yaml, DB는 운영 조회·감사용';
CREATE UNIQUE INDEX IF NOT EXISTS uk_notification_ruleset
  ON notification_ruleset (COALESCE(tenant_id, 0), ruleset_code, revision);
CREATE INDEX IF NOT EXISTS idx_notification_ruleset_active
  ON notification_ruleset (tenant_id, ruleset_code)
  WHERE enabled = TRUE AND is_use = TRUE;


CREATE TABLE IF NOT EXISTS notification_rule (
  id BIGINT PRIMARY KEY DEFAULT public.generate_snowflake_id(),
  notification_ruleset_id BIGINT NOT NULL
    REFERENCES notification_ruleset (id) ON DELETE CASCADE,
  rule_code VARCHAR(128) NOT NULL,
  metric VARCHAR(128) NOT NULL,
  compare VARCHAR(16) NOT NULL,
  threshold_value NUMERIC(18, 6) NULL,
  threshold_key VARCHAR(128) NULL,
  severity_type INTEGER NOT NULL,
  notification_message_code VARCHAR(128) NOT NULL,
  rule_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  is_use BOOLEAN NOT NULL DEFAULT TRUE,
  remark VARCHAR(256) NULL,
  created_id INTEGER NULL
    REFERENCES public."user" (id) ON DELETE SET NULL,
  updated_id INTEGER NULL
    REFERENCES public."user" (id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uk_notification_rule UNIQUE (notification_ruleset_id, rule_code),
  CONSTRAINT chk_notification_rule_compare CHECK (compare IN ('gt', 'gte', 'lt', 'lte', 'eq', 'neq', 'in', 'not_in')),
  CONSTRAINT chk_notification_rule_severity_type CHECK (severity_type IN (1, 2, 3)),
  CONSTRAINT chk_notification_rule_json CHECK (jsonb_typeof(rule_json) = 'object')
);
COMMENT ON COLUMN notification_rule.id IS 'PK';
COMMENT ON COLUMN notification_rule.notification_ruleset_id IS 'FK → notification_ruleset.id';
COMMENT ON COLUMN notification_rule.rule_code IS 'YAML rulesets[].rules[].code';
COMMENT ON COLUMN notification_rule.metric IS '평가 대상 metric 이름';
COMMENT ON COLUMN notification_rule.compare IS '비교 연산자(gt, gte, lt, lte, eq, neq, in, not_in)';
COMMENT ON COLUMN notification_rule.threshold_value IS '숫자 임계값. threshold_key 사용 시 NULL 가능';
COMMENT ON COLUMN notification_rule.threshold_key IS '동적 임계값 참조 키';
COMMENT ON COLUMN notification_rule.severity_type IS 'A0002 sub_code 직접 저장(FK 아님). 1=info, 2=warn, 3=error. 공통코드 정의와 동일';
COMMENT ON COLUMN notification_rule.notification_message_code IS '알람 시작 시 사용할 알림 메시지 코드(alert_code)';
COMMENT ON COLUMN notification_rule.rule_json IS '원본 rule 객체 스냅샷(JSON)';
COMMENT ON COLUMN notification_rule.enabled IS '룰 활성 여부';
COMMENT ON COLUMN notification_rule.is_use IS '활성 여부';
COMMENT ON COLUMN notification_rule.remark IS '운영 메모';
COMMENT ON COLUMN notification_rule.created_id IS '등록자 "user".id';
COMMENT ON COLUMN notification_rule.updated_id IS '최종 수정자 "user".id';
COMMENT ON COLUMN notification_rule.created_at IS '생성 시각';
COMMENT ON COLUMN notification_rule.updated_at IS '수정 시각. 애플리케이션 저장 코드가 UPDATE 시 명시적으로 설정';


COMMENT ON TABLE notification_rule IS 'YAML rulesets[].rules[] 미러. metric·threshold·message code를 운영 조회용으로 펼침';
CREATE INDEX IF NOT EXISTS idx_notification_rule_message_code
  ON notification_rule (notification_message_code);


CREATE TABLE IF NOT EXISTS notification_ruleset_composite_trigger (
  id BIGINT PRIMARY KEY DEFAULT public.generate_snowflake_id(),
  notification_ruleset_id BIGINT NOT NULL
    REFERENCES notification_ruleset (id) ON DELETE CASCADE,
  trigger_code VARCHAR(128) NOT NULL,
  notification_message_code VARCHAR(128) NOT NULL,
  severity_type INTEGER NOT NULL,
  expression_json JSONB NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  is_use BOOLEAN NOT NULL DEFAULT TRUE,
  remark VARCHAR(256) NULL,
  created_id INTEGER NULL
    REFERENCES public."user" (id) ON DELETE SET NULL,
  updated_id INTEGER NULL
    REFERENCES public."user" (id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uk_notification_ruleset_composite_trigger UNIQUE (notification_ruleset_id, trigger_code),
  CONSTRAINT chk_notification_ruleset_composite_severity_type CHECK (severity_type IN (1, 2, 3)),
  CONSTRAINT chk_notification_ruleset_composite_expr CHECK (jsonb_typeof(expression_json) = 'object')
);
COMMENT ON COLUMN notification_ruleset_composite_trigger.id IS 'PK';
COMMENT ON COLUMN notification_ruleset_composite_trigger.notification_ruleset_id IS 'FK → notification_ruleset.id';
COMMENT ON COLUMN notification_ruleset_composite_trigger.trigger_code IS 'YAML 복합 조건 코드';
COMMENT ON COLUMN notification_ruleset_composite_trigger.notification_message_code IS '복합 조건 충족 시 사용할 알림 메시지 코드(alert_code)';
COMMENT ON COLUMN notification_ruleset_composite_trigger.severity_type IS 'A0002 sub_code 직접 저장(FK 아님). 1=info, 2=warn, 3=error. 공통코드 정의와 동일';
COMMENT ON COLUMN notification_ruleset_composite_trigger.expression_json IS 'AND/OR/NOT 등 복합 조건 표현식 JSON';
COMMENT ON COLUMN notification_ruleset_composite_trigger.enabled IS '복합 조건 활성 여부';
COMMENT ON COLUMN notification_ruleset_composite_trigger.is_use IS '활성 여부';
COMMENT ON COLUMN notification_ruleset_composite_trigger.remark IS '운영 메모';
COMMENT ON COLUMN notification_ruleset_composite_trigger.created_id IS '등록자 "user".id';
COMMENT ON COLUMN notification_ruleset_composite_trigger.updated_id IS '최종 수정자 "user".id';
COMMENT ON COLUMN notification_ruleset_composite_trigger.created_at IS '생성 시각';
COMMENT ON COLUMN notification_ruleset_composite_trigger.updated_at IS '수정 시각. 애플리케이션 저장 코드가 UPDATE 시 명시적으로 설정';


COMMENT ON TABLE notification_ruleset_composite_trigger IS 'YAML rulesets[].composite_triggers[] 미러. AND/OR/NOT 조건 트리 저장';

CREATE TABLE IF NOT EXISTS alarm_user_condition (
  id BIGINT PRIMARY KEY DEFAULT public.generate_snowflake_id(),
  tenant_id BIGINT NOT NULL,
  scope_kind VARCHAR(32) NOT NULL,
  scope_id BIGINT NULL,
  condition_code VARCHAR(128) NOT NULL,
  condition_name VARCHAR(255) NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  expression_json JSONB NOT NULL,
  evaluator_kind VARCHAR(32) NOT NULL DEFAULT 'condition_tree',
  condition_version INTEGER NOT NULL DEFAULT 1,
  is_use BOOLEAN NOT NULL DEFAULT TRUE,
  remark VARCHAR(256) NULL,
  created_id INTEGER NULL
    REFERENCES public."user" (id) ON DELETE SET NULL,
  updated_id INTEGER NULL
    REFERENCES public."user" (id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_alarm_user_conditions_scope CHECK (scope_kind IN ('tenant', 'company', 'branch', 'site', 'product', 'device')),
  CONSTRAINT chk_alarm_user_conditions_expr CHECK (jsonb_typeof(expression_json) = 'object')
);
COMMENT ON COLUMN alarm_user_condition.id IS 'PK';
COMMENT ON COLUMN alarm_user_condition.tenant_id IS '테넌트 스코프';
COMMENT ON COLUMN alarm_user_condition.scope_kind IS '조건 적용 범위(tenant, company, branch, site, product, device). 공통코드 매핑 아님';
COMMENT ON COLUMN alarm_user_condition.scope_id IS 'scope_kind 에 대응하는 대상 ID. tenant 범위 등에서는 NULL 가능';
COMMENT ON COLUMN alarm_user_condition.condition_code IS '조건 업무 코드';
COMMENT ON COLUMN alarm_user_condition.condition_name IS '운영 화면 표시용 조건 이름';
COMMENT ON COLUMN alarm_user_condition.enabled IS '조건 활성 여부';
COMMENT ON COLUMN alarm_user_condition.expression_json IS '조건 트리 표현식 JSON';
COMMENT ON COLUMN alarm_user_condition.evaluator_kind IS '조건 평가기 종류';
COMMENT ON COLUMN alarm_user_condition.condition_version IS '조건 정의 버전';
COMMENT ON COLUMN alarm_user_condition.is_use IS '활성 여부';
COMMENT ON COLUMN alarm_user_condition.remark IS '운영 메모';
COMMENT ON COLUMN alarm_user_condition.created_id IS '등록자 "user".id';
COMMENT ON COLUMN alarm_user_condition.updated_id IS '최종 수정자 "user".id';
COMMENT ON COLUMN alarm_user_condition.created_at IS '생성 시각';
COMMENT ON COLUMN alarm_user_condition.updated_at IS '수정 시각. 애플리케이션 저장 코드가 UPDATE 시 명시적으로 설정';


COMMENT ON TABLE alarm_user_condition IS '사용자·테넌트가 등록한 알람 조건 트리. YAML alarm_condition_model user_condition 참조 대상';
CREATE UNIQUE INDEX IF NOT EXISTS uk_alarm_user_conditions
  ON alarm_user_condition (tenant_id, scope_kind, COALESCE(scope_id, 0), condition_code, condition_version);
CREATE INDEX IF NOT EXISTS idx_alarm_user_conditions_active
  ON alarm_user_condition (tenant_id, scope_kind, scope_id, condition_code)
  WHERE enabled = TRUE AND is_use = TRUE;


-- -----------------------------------------------------------------------------
-- 4b) 조직 멤버십·권한 — "user"(로그인) 와 분리
-- -----------------------------------------------------------------------------
-- "user": 인증·계정(이메일/SSO/승인). 조직 스코프·RBAC 정본은 member + member_permission.
-- "user".scope_* 는 레거시·빠른 조회용. auth_type(A0001)·조직 RBAC는 member(A0006·A0005) 가 SSOT.
CREATE TABLE IF NOT EXISTS member (
  id INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  code VARCHAR(64) NOT NULL,
  tenant_id BIGINT NOT NULL,
  user_id INTEGER NOT NULL
    REFERENCES public."user" (id) ON DELETE CASCADE,
  company_id INTEGER NOT NULL
    REFERENCES public.company (id) ON DELETE CASCADE,
  branch_id INTEGER NULL
    REFERENCES public.branch (id) ON DELETE CASCADE,
  site_id INTEGER NULL
    REFERENCES public.site (id) ON DELETE CASCADE,
  member_role_type INTEGER NOT NULL,
  member_status_type INTEGER NOT NULL DEFAULT 1,
  auth_type INTEGER NOT NULL DEFAULT 1,
  website_group_id INTEGER NULL
    REFERENCES public.website_group (id) ON DELETE SET NULL,
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  is_use BOOLEAN NOT NULL DEFAULT TRUE,
  remark VARCHAR(256) NULL,
  created_id INTEGER NULL
    REFERENCES public."user" (id) ON DELETE SET NULL,
  updated_id INTEGER NULL
    REFERENCES public."user" (id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uk_member_code UNIQUE (code),
  CONSTRAINT uk_member_tenant_user UNIQUE (tenant_id, user_id),
  CONSTRAINT chk_member_role_type CHECK (member_role_type IN (1, 2, 3, 4)),
  CONSTRAINT chk_member_status_type CHECK (member_status_type IN (1, 2, 3)),
  CONSTRAINT chk_member_auth_type CHECK (auth_type IN (1, 9, 10)),
  CONSTRAINT chk_member_scope_hierarchy CHECK (
    (site_id IS NOT NULL AND branch_id IS NOT NULL)
    OR (site_id IS NULL AND branch_id IS NOT NULL)
    OR (site_id IS NULL AND branch_id IS NULL)
  )
);
COMMENT ON TABLE member IS '조직 멤버십. 로그인 계정("user")과 분리. 스코프·A0006 역할·A0005 권한·A0001 auth_type·website_group_id(포털 메뉴) 정본';
COMMENT ON COLUMN member.id IS 'Surrogate PK. API X-Member-Id 등 현재 멤버십';
COMMENT ON COLUMN member.code IS '멤버 업무 코드 (예: MEM-DEMO-OPS-001)';
COMMENT ON COLUMN member.tenant_id IS '테넌트 스코프. 개발 환경에서는 company.id 와 동일 값을 쓰는 경우가 많음';
COMMENT ON COLUMN member.user_id IS 'FK → "user".id. 동일 테넌트에서 로그인 계정 1:1';
COMMENT ON COLUMN member.company_id IS 'FK → company.id. 필수 상위 조직';
COMMENT ON COLUMN member.branch_id IS 'FK → branch.id. 지점 스코프 멤버일 때';
COMMENT ON COLUMN member.site_id IS 'FK → site.id. 사이트 스코프 멤버일 때 (가장 좁은 스코프)';
COMMENT ON COLUMN member.member_role_type IS 'A0006 sub_code. 1=site_operator, 2=branch_manager, 3=tenant_admin, 4=company_admin';
COMMENT ON COLUMN member.member_status_type IS 'A0007 sub_code. 1=active, 2=invited, 3=suspended';
COMMENT ON COLUMN member.auth_type IS 'A0001 sub_code(사용자 권한 유형). 1=user, 9=admin, 10=system_admin. website_group_id 지정 시 website_group.auth_type 과 동일해야 함(10은 그룹 없음)';
COMMENT ON COLUMN member.website_group_id IS 'FK → website_group.id. 포털 메뉴 권한 그룹. auth_type 이 그룹과 일치하는 경우만 배정(트리거 검증)';
COMMENT ON COLUMN member.is_primary IS '로그인 후 기본으로 선택할 멤버십(한 계정·다중 멤버십 시)';
COMMENT ON COLUMN member.is_use IS '멤버십 활성 여부. false 이면 포털·RBAC 대상 제외';
COMMENT ON COLUMN member.remark IS '내부 운영 메모';
COMMENT ON COLUMN member.created_id IS '등록자 FK → "user".id';
COMMENT ON COLUMN member.updated_id IS '수정자 FK → "user".id';
COMMENT ON COLUMN member.created_at IS '생성 시각';
COMMENT ON COLUMN member.updated_at IS '수정 시각';
CREATE INDEX IF NOT EXISTS idx_member_user ON member (user_id);
CREATE INDEX IF NOT EXISTS idx_member_website_group ON member (website_group_id) WHERE website_group_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_member_auth_type ON member (tenant_id, auth_type) WHERE is_use = TRUE;

-- member ↔ website_group auth_type·tenant 정합 (레거시: 동일 auth_type 만 그룹 배정)
CREATE OR REPLACE FUNCTION public.trg_member_website_group_auth_check()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.website_group_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1
      FROM public.website_group wg
      WHERE wg.id = NEW.website_group_id
        AND wg.tenant_id = NEW.tenant_id
        AND wg.auth_type = NEW.auth_type
        AND wg.is_use = TRUE
    ) THEN
      RAISE EXCEPTION 'member.website_group_id requires matching tenant_id and auth_type on website_group (A0001)';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_member_website_group_auth ON public.member;
CREATE TRIGGER trg_member_website_group_auth
  BEFORE INSERT OR UPDATE OF website_group_id, auth_type, tenant_id
  ON public.member
  FOR EACH ROW
  EXECUTE PROCEDURE public.trg_member_website_group_auth_check();

-- 기존 DB 마이그레이션 (member 테이블 선행 생성 환경)
ALTER TABLE public.member ADD COLUMN IF NOT EXISTS auth_type INTEGER;
UPDATE public.member SET auth_type = 1 WHERE auth_type IS NULL;
ALTER TABLE public.member ALTER COLUMN auth_type SET DEFAULT 1;
ALTER TABLE public.member ALTER COLUMN auth_type SET NOT NULL;
ALTER TABLE public.member ADD COLUMN IF NOT EXISTS website_group_id INTEGER NULL
  REFERENCES public.website_group (id) ON DELETE SET NULL;
DO $migration$
BEGIN
  ALTER TABLE public.member ADD CONSTRAINT chk_member_auth_type CHECK (auth_type IN (1, 9, 10));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$migration$;
CREATE INDEX IF NOT EXISTS idx_member_company ON member (company_id);
CREATE INDEX IF NOT EXISTS idx_member_branch ON member (branch_id) WHERE branch_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_member_site ON member (site_id) WHERE site_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_member_role ON member (member_role_type, member_status_type) WHERE is_use = TRUE;

CREATE TABLE IF NOT EXISTS member_permission (
  member_id INTEGER NOT NULL
    REFERENCES public.member (id) ON DELETE CASCADE,
  permission_type INTEGER NOT NULL,
  is_use BOOLEAN NOT NULL DEFAULT TRUE,
  remark VARCHAR(256) NULL,
  created_id INTEGER NULL
    REFERENCES public."user" (id) ON DELETE SET NULL,
  updated_id INTEGER NULL
    REFERENCES public."user" (id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (member_id, permission_type),
  CONSTRAINT chk_member_permission_type CHECK (permission_type BETWEEN 1 AND 99)
);
COMMENT ON TABLE member_permission IS '멤버별 포털 권한. permission_type = A0005 sub_code (alarm.read_site 등 ref_data1 과 동일 의미)';
COMMENT ON COLUMN member_permission.permission_type IS 'A0005 sub_code 직접 저장. 예: 1=alarm.read_site, 4=alarm.notify_site';
COMMENT ON COLUMN member_permission.is_use IS '권한 부여 활성 여부';
COMMENT ON COLUMN member_permission.remark IS '운영 메모';
COMMENT ON COLUMN member_permission.created_id IS '권한 부여자 "user".id';
COMMENT ON COLUMN member_permission.updated_id IS '최종 수정자 "user".id';
COMMENT ON COLUMN member_permission.created_at IS '권한 부여 시각';
COMMENT ON COLUMN member_permission.updated_at IS '수정 시각. is_use 변경 등 UPDATE 시 앱이 명시 설정';
CREATE INDEX IF NOT EXISTS idx_member_permission_type ON member_permission (permission_type) WHERE is_use = TRUE;


-- -----------------------------------------------------------------------------
-- 5) 텔레메트리 RDS 집계 — site/product day~year + 파생 조직 축
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS telemetry_site_product_time_series (
  id BIGINT PRIMARY KEY DEFAULT public.generate_snowflake_id(),
  tenant_id BIGINT NOT NULL,
  site_id INTEGER NOT NULL
    REFERENCES public.site (id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL
    REFERENCES public.product (id) ON DELETE CASCADE,
  granularity VARCHAR(16) NOT NULL,
  bucket_start TIMESTAMPTZ NOT NULL,
  bucket_end TIMESTAMPTZ NOT NULL,
  metric_values JSONB NOT NULL DEFAULT '{}'::jsonb,
  metric_values_kv JSONB NOT NULL DEFAULT '[]'::jsonb,
  source_device_count INTEGER NOT NULL DEFAULT 0,
  source_event_count INTEGER NOT NULL DEFAULT 0,
  batch_run_code VARCHAR(128) NULL,
  is_use BOOLEAN NOT NULL DEFAULT TRUE,
  remark VARCHAR(256) NULL,
  created_id INTEGER NULL
    REFERENCES public."user" (id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uk_telemetry_site_product_time UNIQUE (tenant_id, site_id, product_id, granularity, bucket_start),
  CONSTRAINT chk_telemetry_site_product_granularity CHECK (granularity IN ('day', 'month', 'year')),
  CONSTRAINT chk_telemetry_site_product_window CHECK (bucket_end > bucket_start),
  CONSTRAINT chk_telemetry_site_product_metrics CHECK (jsonb_typeof(metric_values) = 'object'),
  CONSTRAINT chk_telemetry_site_product_metrics_kv CHECK (jsonb_typeof(metric_values_kv) = 'array')
);
COMMENT ON COLUMN telemetry_site_product_time_series.id IS 'PK';
COMMENT ON COLUMN telemetry_site_product_time_series.tenant_id IS '테넌트 스코프';
COMMENT ON COLUMN telemetry_site_product_time_series.site_id IS 'FK → site.id';
COMMENT ON COLUMN telemetry_site_product_time_series.product_id IS 'FK → product.id';
COMMENT ON COLUMN telemetry_site_product_time_series.granularity IS '시간 그레인(day, month, year)';
COMMENT ON COLUMN telemetry_site_product_time_series.bucket_start IS '집계 버킷 시작 시각';
COMMENT ON COLUMN telemetry_site_product_time_series.bucket_end IS '집계 버킷 종료 시각';
COMMENT ON COLUMN telemetry_site_product_time_series.metric_values IS '집계 metric 값 객체(JSON)';
COMMENT ON COLUMN telemetry_site_product_time_series.metric_values_kv IS '집계 metric key/value 배열(JSON). 예: [{\"metric\":\"power_kwh\",\"value\":123.4}]';
COMMENT ON COLUMN telemetry_site_product_time_series.source_device_count IS '집계에 포함된 단말 수';
COMMENT ON COLUMN telemetry_site_product_time_series.source_event_count IS '집계에 포함된 원천 이벤트 수';
COMMENT ON COLUMN telemetry_site_product_time_series.batch_run_code IS '배치 실행 코드';
COMMENT ON COLUMN telemetry_site_product_time_series.is_use IS '활성 여부';
COMMENT ON COLUMN telemetry_site_product_time_series.remark IS '운영 메모';
COMMENT ON COLUMN telemetry_site_product_time_series.created_id IS '배치·등록 주체 "user".id (선택)';
COMMENT ON COLUMN telemetry_site_product_time_series.created_at IS '적재 시각(INSERT 후 불변)';


COMMENT ON TABLE telemetry_site_product_time_series IS '사이트·제품 기준 텔레메트리 day/month/year 팩트(INSERT 후 불변). RDS 상위 집계의 기준 테이블';
CREATE INDEX IF NOT EXISTS idx_telemetry_site_product_time_site
  ON telemetry_site_product_time_series (site_id, granularity, bucket_start DESC);
CREATE INDEX IF NOT EXISTS idx_telemetry_site_product_time_product
  ON telemetry_site_product_time_series (product_id, granularity, bucket_start DESC);
CREATE INDEX IF NOT EXISTS gin_telemetry_site_product_metric_values
  ON telemetry_site_product_time_series USING GIN (metric_values jsonb_path_ops);
CREATE INDEX IF NOT EXISTS gin_telemetry_site_product_metric_values_kv
  ON telemetry_site_product_time_series USING GIN (metric_values_kv jsonb_path_ops);

CREATE TABLE IF NOT EXISTS telemetry_company_product_time_series (
  id BIGINT PRIMARY KEY DEFAULT public.generate_snowflake_id(),
  tenant_id BIGINT NOT NULL,
  company_id INTEGER NOT NULL
    REFERENCES public.company (id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL
    REFERENCES public.product (id) ON DELETE CASCADE,
  granularity VARCHAR(16) NOT NULL,
  bucket_start TIMESTAMPTZ NOT NULL,
  bucket_end TIMESTAMPTZ NOT NULL,
  metric_values JSONB NOT NULL DEFAULT '{}'::jsonb,
  metric_values_kv JSONB NOT NULL DEFAULT '[]'::jsonb,
  source_site_count INTEGER NOT NULL DEFAULT 0,
  batch_run_code VARCHAR(128) NULL,
  is_use BOOLEAN NOT NULL DEFAULT TRUE,
  remark VARCHAR(256) NULL,
  created_id INTEGER NULL
    REFERENCES public."user" (id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uk_telemetry_company_product_time UNIQUE (tenant_id, company_id, product_id, granularity, bucket_start),
  CONSTRAINT chk_telemetry_company_product_granularity CHECK (granularity IN ('day', 'month', 'year')),
  CONSTRAINT chk_telemetry_company_product_window CHECK (bucket_end > bucket_start),
  CONSTRAINT chk_telemetry_company_product_metrics CHECK (jsonb_typeof(metric_values) = 'object'),
  CONSTRAINT chk_telemetry_company_product_metrics_kv CHECK (jsonb_typeof(metric_values_kv) = 'array')
);
COMMENT ON COLUMN telemetry_company_product_time_series.id IS 'PK';
COMMENT ON COLUMN telemetry_company_product_time_series.tenant_id IS '테넌트 스코프';
COMMENT ON COLUMN telemetry_company_product_time_series.company_id IS 'FK → company.id';
COMMENT ON COLUMN telemetry_company_product_time_series.product_id IS 'FK → product.id';
COMMENT ON COLUMN telemetry_company_product_time_series.granularity IS '시간 그레인(day, month, year)';
COMMENT ON COLUMN telemetry_company_product_time_series.bucket_start IS '집계 버킷 시작 시각';
COMMENT ON COLUMN telemetry_company_product_time_series.bucket_end IS '집계 버킷 종료 시각';
COMMENT ON COLUMN telemetry_company_product_time_series.metric_values IS '집계 metric 값 객체(JSON)';
COMMENT ON COLUMN telemetry_company_product_time_series.metric_values_kv IS '집계 metric key/value 배열(JSON). 예: [{\"metric\":\"power_kwh\",\"value\":123.4}]';
COMMENT ON COLUMN telemetry_company_product_time_series.source_site_count IS '집계에 포함된 사이트 수';
COMMENT ON COLUMN telemetry_company_product_time_series.batch_run_code IS '배치 실행 코드';
COMMENT ON COLUMN telemetry_company_product_time_series.is_use IS '활성 여부';
COMMENT ON COLUMN telemetry_company_product_time_series.remark IS '운영 메모';
COMMENT ON COLUMN telemetry_company_product_time_series.created_id IS '배치·등록 주체 "user".id (선택)';
COMMENT ON COLUMN telemetry_company_product_time_series.created_at IS '적재 시각(INSERT 후 불변)';


COMMENT ON TABLE telemetry_company_product_time_series IS '회사·제품 기준 텔레메트리 day/month/year 파생 팩트(INSERT 후 불변)';
CREATE INDEX IF NOT EXISTS idx_telemetry_company_product_time_company
  ON telemetry_company_product_time_series (company_id, granularity, bucket_start DESC);
CREATE INDEX IF NOT EXISTS gin_telemetry_company_product_metric_values
  ON telemetry_company_product_time_series USING GIN (metric_values jsonb_path_ops);
CREATE INDEX IF NOT EXISTS gin_telemetry_company_product_metric_values_kv
  ON telemetry_company_product_time_series USING GIN (metric_values_kv jsonb_path_ops);

CREATE TABLE IF NOT EXISTS telemetry_branch_product_time_series (
  id BIGINT PRIMARY KEY DEFAULT public.generate_snowflake_id(),
  tenant_id BIGINT NOT NULL,
  branch_id INTEGER NOT NULL
    REFERENCES public.branch (id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL
    REFERENCES public.product (id) ON DELETE CASCADE,
  granularity VARCHAR(16) NOT NULL,
  bucket_start TIMESTAMPTZ NOT NULL,
  bucket_end TIMESTAMPTZ NOT NULL,
  metric_values JSONB NOT NULL DEFAULT '{}'::jsonb,
  metric_values_kv JSONB NOT NULL DEFAULT '[]'::jsonb,
  source_site_count INTEGER NOT NULL DEFAULT 0,
  source_device_count INTEGER NOT NULL DEFAULT 0,
  source_event_count INTEGER NOT NULL DEFAULT 0,
  batch_run_code VARCHAR(128) NULL,
  is_use BOOLEAN NOT NULL DEFAULT TRUE,
  remark VARCHAR(256) NULL,
  created_id INTEGER NULL
    REFERENCES public."user" (id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uk_telemetry_branch_product_time UNIQUE (tenant_id, branch_id, product_id, granularity, bucket_start),
  CONSTRAINT chk_telemetry_branch_product_granularity CHECK (granularity IN ('day', 'month', 'year')),
  CONSTRAINT chk_telemetry_branch_product_window CHECK (bucket_end > bucket_start),
  CONSTRAINT chk_telemetry_branch_product_metrics CHECK (jsonb_typeof(metric_values) = 'object'),
  CONSTRAINT chk_telemetry_branch_product_metrics_kv CHECK (jsonb_typeof(metric_values_kv) = 'array')
);
COMMENT ON TABLE telemetry_branch_product_time_series IS '지점·제품 기준 텔레메트리 day/month/year 파생 팩트. site_product_time_series 를 branch 축으로 합산';
COMMENT ON COLUMN telemetry_branch_product_time_series.branch_id IS 'FK → branch.id';
COMMENT ON COLUMN telemetry_branch_product_time_series.source_site_count IS '집계에 포함된 사이트 수';
CREATE INDEX IF NOT EXISTS idx_telemetry_branch_product_time_branch
  ON telemetry_branch_product_time_series (branch_id, granularity, bucket_start DESC);
CREATE INDEX IF NOT EXISTS gin_telemetry_branch_product_metric_values_kv
  ON telemetry_branch_product_time_series USING GIN (metric_values_kv jsonb_path_ops);

CREATE TABLE IF NOT EXISTS telemetry_brand_product_time_series (
  id BIGINT PRIMARY KEY DEFAULT public.generate_snowflake_id(),
  tenant_id BIGINT NOT NULL,
  brand_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL
    REFERENCES public.product (id) ON DELETE CASCADE,
  granularity VARCHAR(16) NOT NULL,
  bucket_start TIMESTAMPTZ NOT NULL,
  bucket_end TIMESTAMPTZ NOT NULL,
  metric_values JSONB NOT NULL DEFAULT '{}'::jsonb,
  metric_values_kv JSONB NOT NULL DEFAULT '[]'::jsonb,
  source_site_count INTEGER NOT NULL DEFAULT 0,
  batch_run_code VARCHAR(128) NULL,
  is_use BOOLEAN NOT NULL DEFAULT TRUE,
  remark VARCHAR(256) NULL,
  created_id INTEGER NULL
    REFERENCES public."user" (id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uk_telemetry_brand_product_time UNIQUE (tenant_id, brand_id, product_id, granularity, bucket_start),
  CONSTRAINT chk_telemetry_brand_product_granularity CHECK (granularity IN ('day', 'month', 'year')),
  CONSTRAINT chk_telemetry_brand_product_window CHECK (bucket_end > bucket_start),
  CONSTRAINT chk_telemetry_brand_product_metrics CHECK (jsonb_typeof(metric_values) = 'object'),
  CONSTRAINT chk_telemetry_brand_product_metrics_kv CHECK (jsonb_typeof(metric_values_kv) = 'array')
);
COMMENT ON COLUMN telemetry_brand_product_time_series.id IS 'PK';
COMMENT ON COLUMN telemetry_brand_product_time_series.tenant_id IS '테넌트 스코프';
COMMENT ON COLUMN telemetry_brand_product_time_series.brand_id IS '브랜드 ID 스냅샷. product.brand_id 기준 선택 차원';
COMMENT ON COLUMN telemetry_brand_product_time_series.product_id IS 'FK → product.id';
COMMENT ON COLUMN telemetry_brand_product_time_series.granularity IS '시간 그레인(day, month, year)';
COMMENT ON COLUMN telemetry_brand_product_time_series.bucket_start IS '집계 버킷 시작 시각';
COMMENT ON COLUMN telemetry_brand_product_time_series.bucket_end IS '집계 버킷 종료 시각';
COMMENT ON COLUMN telemetry_brand_product_time_series.metric_values IS '집계 metric 값 객체(JSON)';
COMMENT ON COLUMN telemetry_brand_product_time_series.metric_values_kv IS '집계 metric key/value 배열(JSON). 예: [{\"metric\":\"power_kwh\",\"value\":123.4}]';
COMMENT ON COLUMN telemetry_brand_product_time_series.source_site_count IS '집계에 포함된 사이트 수';
COMMENT ON COLUMN telemetry_brand_product_time_series.batch_run_code IS '배치 실행 코드';
COMMENT ON COLUMN telemetry_brand_product_time_series.is_use IS '활성 여부';
COMMENT ON COLUMN telemetry_brand_product_time_series.remark IS '운영 메모';
COMMENT ON COLUMN telemetry_brand_product_time_series.created_id IS '배치·등록 주체 "user".id (선택)';
COMMENT ON COLUMN telemetry_brand_product_time_series.created_at IS '적재 시각(INSERT 후 불변)';


COMMENT ON TABLE telemetry_brand_product_time_series IS '브랜드·제품 기준 텔레메트리 day/month/year 선택 파생 팩트(INSERT 후 불변)';
CREATE INDEX IF NOT EXISTS idx_telemetry_brand_product_time_brand
  ON telemetry_brand_product_time_series (brand_id, granularity, bucket_start DESC);
CREATE INDEX IF NOT EXISTS gin_telemetry_brand_product_metric_values
  ON telemetry_brand_product_time_series USING GIN (metric_values jsonb_path_ops);
CREATE INDEX IF NOT EXISTS gin_telemetry_brand_product_metric_values_kv
  ON telemetry_brand_product_time_series USING GIN (metric_values_kv jsonb_path_ops);

-- -----------------------------------------------------------------------------
-- 6) 산업 공통 집계 테이블 (회사/지점/사이트/제품 + 도메인)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS industry_aggregate_daily (
  company_id TEXT NOT NULL,
  branch_id TEXT NOT NULL,
  site_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  domain_code TEXT NOT NULL,
  scenario_code TEXT NOT NULL DEFAULT 'default',
  base_day DATE NOT NULL,
  metric_values JSONB NOT NULL DEFAULT '{}'::jsonb,
  metric_values_kv JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_use BOOLEAN NOT NULL DEFAULT TRUE,
  remark VARCHAR(256) NULL,
  created_id INTEGER NULL
    REFERENCES public."user" (id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT pk_industry_aggregate_daily PRIMARY KEY (company_id, site_id, product_id, domain_code, scenario_code, base_day),
  CONSTRAINT chk_industry_aggregate_daily_metric_values CHECK (jsonb_typeof(metric_values) = 'object'),
  CONSTRAINT chk_industry_aggregate_daily_metric_values_kv CHECK (jsonb_typeof(metric_values_kv) = 'array')
);
COMMENT ON COLUMN industry_aggregate_daily.company_id IS '회사 식별자';
COMMENT ON COLUMN industry_aggregate_daily.branch_id IS '지점 식별자';
COMMENT ON COLUMN industry_aggregate_daily.site_id IS '사이트 식별자';
COMMENT ON COLUMN industry_aggregate_daily.product_id IS '제품 식별자';
COMMENT ON COLUMN industry_aggregate_daily.domain_code IS '산업/업무 도메인 코드(예: hvac, cold_chain, factory_line)';
COMMENT ON COLUMN industry_aggregate_daily.scenario_code IS '집계 시나리오 코드(예: default, weather_adjusted)';
COMMENT ON COLUMN industry_aggregate_daily.base_day IS '기준 일자(base_day)';
COMMENT ON COLUMN industry_aggregate_daily.metric_values IS '산업 공통 집계 metric 객체(JSON)';
COMMENT ON COLUMN industry_aggregate_daily.metric_values_kv IS '산업 공통 집계 metric key/value 배열(JSON). 예: [{"metric":"efficiency_pct","value":18.0}]';
COMMENT ON COLUMN industry_aggregate_daily.is_use IS '활성 여부';
COMMENT ON COLUMN industry_aggregate_daily.remark IS '운영 메모';
COMMENT ON COLUMN industry_aggregate_daily.created_id IS '배치·등록 주체 "user".id (선택)';
COMMENT ON COLUMN industry_aggregate_daily.created_at IS '적재 시각(INSERT 후 불변, UTC 권장)';
COMMENT ON TABLE industry_aggregate_daily IS '산업 공통 일별 집계 팩트(INSERT 후 불변)';
CREATE INDEX IF NOT EXISTS idx_industry_aggregate_daily_site_day
  ON industry_aggregate_daily (site_id, base_day DESC);
CREATE INDEX IF NOT EXISTS gin_industry_aggregate_daily_metric_values
  ON industry_aggregate_daily USING GIN (metric_values jsonb_path_ops);
CREATE INDEX IF NOT EXISTS gin_industry_aggregate_daily_metric_values_kv
  ON industry_aggregate_daily USING GIN (metric_values_kv jsonb_path_ops);

CREATE TABLE IF NOT EXISTS industry_aggregate_monthly (
  company_id TEXT NOT NULL,
  branch_id TEXT NOT NULL,
  site_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  domain_code TEXT NOT NULL,
  scenario_code TEXT NOT NULL DEFAULT 'default',
  base_month TEXT NOT NULL,
  metric_values JSONB NOT NULL DEFAULT '{}'::jsonb,
  metric_values_kv JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_use BOOLEAN NOT NULL DEFAULT TRUE,
  remark VARCHAR(256) NULL,
  created_id INTEGER NULL
    REFERENCES public."user" (id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT pk_industry_aggregate_monthly PRIMARY KEY (company_id, site_id, product_id, domain_code, scenario_code, base_month),
  CONSTRAINT chk_industry_aggregate_monthly_metric_values CHECK (jsonb_typeof(metric_values) = 'object'),
  CONSTRAINT chk_industry_aggregate_monthly_metric_values_kv CHECK (jsonb_typeof(metric_values_kv) = 'array')
);
COMMENT ON COLUMN industry_aggregate_monthly.company_id IS '회사 식별자';
COMMENT ON COLUMN industry_aggregate_monthly.branch_id IS '지점 식별자';
COMMENT ON COLUMN industry_aggregate_monthly.site_id IS '사이트 식별자';
COMMENT ON COLUMN industry_aggregate_monthly.product_id IS '제품 식별자';
COMMENT ON COLUMN industry_aggregate_monthly.domain_code IS '산업/업무 도메인 코드';
COMMENT ON COLUMN industry_aggregate_monthly.scenario_code IS '집계 시나리오 코드';
COMMENT ON COLUMN industry_aggregate_monthly.base_month IS '기준 월(YYYY-MM)';
COMMENT ON COLUMN industry_aggregate_monthly.metric_values IS '산업 공통 집계 metric 객체(JSON)';
COMMENT ON COLUMN industry_aggregate_monthly.metric_values_kv IS '산업 공통 집계 metric key/value 배열(JSON)';
COMMENT ON COLUMN industry_aggregate_monthly.is_use IS '활성 여부';
COMMENT ON COLUMN industry_aggregate_monthly.remark IS '운영 메모';
COMMENT ON COLUMN industry_aggregate_monthly.created_id IS '배치·등록 주체 "user".id (선택)';
COMMENT ON COLUMN industry_aggregate_monthly.created_at IS '적재 시각(INSERT 후 불변, UTC 권장)';
COMMENT ON TABLE industry_aggregate_monthly IS '산업 공통 월별 집계 팩트(INSERT 후 불변, daily 롤업)';
CREATE INDEX IF NOT EXISTS idx_industry_aggregate_monthly_site_month
  ON industry_aggregate_monthly (site_id, base_month DESC);
CREATE INDEX IF NOT EXISTS gin_industry_aggregate_monthly_metric_values
  ON industry_aggregate_monthly USING GIN (metric_values jsonb_path_ops);
CREATE INDEX IF NOT EXISTS gin_industry_aggregate_monthly_metric_values_kv
  ON industry_aggregate_monthly USING GIN (metric_values_kv jsonb_path_ops);

CREATE TABLE IF NOT EXISTS industry_aggregate_yearly (
  company_id TEXT NOT NULL,
  branch_id TEXT NOT NULL,
  site_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  domain_code TEXT NOT NULL,
  scenario_code TEXT NOT NULL DEFAULT 'default',
  base_year TEXT NOT NULL,
  metric_values JSONB NOT NULL DEFAULT '{}'::jsonb,
  metric_values_kv JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_use BOOLEAN NOT NULL DEFAULT TRUE,
  remark VARCHAR(256) NULL,
  created_id INTEGER NULL
    REFERENCES public."user" (id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT pk_industry_aggregate_yearly PRIMARY KEY (company_id, site_id, product_id, domain_code, scenario_code, base_year),
  CONSTRAINT chk_industry_aggregate_yearly_metric_values CHECK (jsonb_typeof(metric_values) = 'object'),
  CONSTRAINT chk_industry_aggregate_yearly_metric_values_kv CHECK (jsonb_typeof(metric_values_kv) = 'array')
);
COMMENT ON COLUMN industry_aggregate_yearly.company_id IS '회사 식별자';
COMMENT ON COLUMN industry_aggregate_yearly.branch_id IS '지점 식별자';
COMMENT ON COLUMN industry_aggregate_yearly.site_id IS '사이트 식별자';
COMMENT ON COLUMN industry_aggregate_yearly.product_id IS '제품 식별자';
COMMENT ON COLUMN industry_aggregate_yearly.domain_code IS '산업/업무 도메인 코드';
COMMENT ON COLUMN industry_aggregate_yearly.scenario_code IS '집계 시나리오 코드';
COMMENT ON COLUMN industry_aggregate_yearly.base_year IS '기준 연(YYYY)';
COMMENT ON COLUMN industry_aggregate_yearly.metric_values IS '산업 공통 집계 metric 객체(JSON)';
COMMENT ON COLUMN industry_aggregate_yearly.metric_values_kv IS '산업 공통 집계 metric key/value 배열(JSON)';
COMMENT ON COLUMN industry_aggregate_yearly.is_use IS '활성 여부';
COMMENT ON COLUMN industry_aggregate_yearly.remark IS '운영 메모';
COMMENT ON COLUMN industry_aggregate_yearly.created_id IS '배치·등록 주체 "user".id (선택)';
COMMENT ON COLUMN industry_aggregate_yearly.created_at IS '적재 시각(INSERT 후 불변, UTC 권장)';
COMMENT ON TABLE industry_aggregate_yearly IS '산업 공통 연별 집계 팩트(INSERT 후 불변, monthly 롤업)';
CREATE INDEX IF NOT EXISTS idx_industry_aggregate_yearly_site_year
  ON industry_aggregate_yearly (site_id, base_year DESC);
CREATE INDEX IF NOT EXISTS gin_industry_aggregate_yearly_metric_values
  ON industry_aggregate_yearly USING GIN (metric_values jsonb_path_ops);
CREATE INDEX IF NOT EXISTS gin_industry_aggregate_yearly_metric_values_kv
  ON industry_aggregate_yearly USING GIN (metric_values_kv jsonb_path_ops);

