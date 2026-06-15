-- =============================================================================
-- UI 포털 확장 스키마 — 프론트 Equipment/Service/Parts 등 DB 직접 연동
-- 선행: 01 → 02 → 04 → 05
-- =============================================================================

ALTER TABLE public.device
  ADD COLUMN IF NOT EXISTS portal_meta JSONB NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE public.service_ticket
  ADD COLUMN IF NOT EXISTS portal_meta JSONB NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE public.site
  ADD COLUMN IF NOT EXISTS address VARCHAR(512) NULL,
  ADD COLUMN IF NOT EXISTS region_label VARCHAR(64) NULL,
  ADD COLUMN IF NOT EXISTS geo_zone VARCHAR(32) NULL DEFAULT 'korea';

ALTER TABLE public.company
  ADD COLUMN IF NOT EXISTS company_type VARCHAR(24) NULL DEFAULT '고객사',
  ADD COLUMN IF NOT EXISTS contract_tier VARCHAR(32) NULL DEFAULT 'Standard',
  ADD COLUMN IF NOT EXISTS region_label VARCHAR(64) NULL DEFAULT '경기';

COMMENT ON COLUMN public.device.portal_meta IS 'UI Equipment: lat/lng, tubeLifePct, status, slaTier, serviceability, model';
COMMENT ON COLUMN public.service_ticket.portal_meta IS 'UI ServiceTicket: stage, engineer, SLA, customer snapshot';

CREATE TABLE IF NOT EXISTS collection_daily_stats (
  id BIGINT PRIMARY KEY DEFAULT public.generate_snowflake_id(),
  collection_name VARCHAR(128) NOT NULL,
  stat_date DATE NOT NULL,
  doc_count BIGINT NOT NULL DEFAULT 0,
  ingest_bytes BIGINT NOT NULL DEFAULT 0,
  lag_ms INTEGER NOT NULL DEFAULT 0,
  dlq_count INTEGER NOT NULL DEFAULT 0,
  tier VARCHAR(16) NOT NULL DEFAULT 'Hot',
  status VARCHAR(16) NOT NULL DEFAULT 'healthy',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (collection_name, stat_date)
);
COMMENT ON TABLE collection_daily_stats IS 'data-pipeline 일별 컬렉션 통계';

CREATE TABLE IF NOT EXISTS notification_channel_setting (
  id BIGINT PRIMARY KEY DEFAULT public.generate_snowflake_id(),
  channel_code VARCHAR(64) NOT NULL UNIQUE,
  channel_name VARCHAR(128) NOT NULL,
  channel_type VARCHAR(24) NOT NULL,
  target VARCHAR(512) NOT NULL,
  severity_filter JSONB NOT NULL DEFAULT '["warning","critical"]'::jsonb,
  recipients TEXT NOT NULL DEFAULT '',
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  description TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE notification_channel_setting IS 'settings/notifications';

CREATE TABLE IF NOT EXISTS iot_thing_registry (
  id BIGINT PRIMARY KEY DEFAULT public.generate_snowflake_id(),
  device_code VARCHAR(64) NOT NULL UNIQUE,
  device_id INTEGER NULL REFERENCES public.device(id) ON DELETE SET NULL,
  thing_name VARCHAR(128) NOT NULL,
  certificate_id VARCHAR(128) NOT NULL,
  policy_name VARCHAR(128) NOT NULL,
  connection_status VARCHAR(24) NOT NULL DEFAULT 'pending',
  last_seen_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE iot_thing_registry IS 'admin/iot-auth';

CREATE TABLE IF NOT EXISTS engineer_profile (
  id BIGINT PRIMARY KEY DEFAULT public.generate_snowflake_id(),
  user_id INTEGER NOT NULL REFERENCES public."user"(id) ON DELETE CASCADE,
  display_name VARCHAR(128) NOT NULL,
  region_label VARCHAR(64) NOT NULL DEFAULT '경기',
  specialty JSONB NOT NULL DEFAULT '[]'::jsonb,
  availability_status VARCHAR(24) NOT NULL DEFAULT '출동가능',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id)
);
COMMENT ON TABLE engineer_profile IS 'service-progress 엔지니어';

CREATE TABLE IF NOT EXISTS yield_inspection_record (
  id BIGINT PRIMARY KEY DEFAULT public.generate_snowflake_id(),
  device_code VARCHAR(64) NOT NULL,
  lot_no VARCHAR(64) NOT NULL,
  serial_no VARCHAR(128) NOT NULL,
  yield_pct NUMERIC(6, 3) NOT NULL,
  inspected_at TIMESTAMPTZ NOT NULL,
  algorithm_version VARCHAR(64) NOT NULL DEFAULT 'v1.0.0',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_yield_inspection_device ON yield_inspection_record (device_code, inspected_at DESC);
COMMENT ON TABLE yield_inspection_record IS 'inspection 수율';

CREATE TABLE IF NOT EXISTS algorithm_config (
  id BIGINT PRIMARY KEY DEFAULT public.generate_snowflake_id(),
  config_code VARCHAR(64) NOT NULL UNIQUE,
  config_name VARCHAR(128) NOT NULL,
  version_label VARCHAR(32) NOT NULL,
  threshold NUMERIC(8, 4) NOT NULL DEFAULT 0.95,
  status VARCHAR(24) NOT NULL DEFAULT 'active',
  applied_device_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE algorithm_config IS 'inspection 알고리즘';

CREATE TABLE IF NOT EXISTS report_definition (
  id BIGINT PRIMARY KEY DEFAULT public.generate_snowflake_id(),
  report_code VARCHAR(64) NOT NULL UNIQUE,
  report_name VARCHAR(256) NOT NULL,
  category VARCHAR(64) NOT NULL,
  last_generated_at TIMESTAMPTZ NULL,
  record_count BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE report_definition IS 'reports 목록';

CREATE TABLE IF NOT EXISTS sla_contract_definition (
  id BIGINT PRIMARY KEY DEFAULT public.generate_snowflake_id(),
  tier_code VARCHAR(32) NOT NULL UNIQUE,
  tier_name VARCHAR(64) NOT NULL,
  response_minutes INTEGER NOT NULL,
  resolve_minutes INTEGER NOT NULL,
  uptime_target_pct NUMERIC(6, 3) NOT NULL,
  description TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE sla_contract_definition IS 'sla 정의';

CREATE TABLE IF NOT EXISTS remote_diagnosis_finding (
  id BIGINT PRIMARY KEY DEFAULT public.generate_snowflake_id(),
  device_code VARCHAR(64) NOT NULL,
  finding_code VARCHAR(64) NOT NULL,
  severity VARCHAR(16) NOT NULL DEFAULT 'warning',
  title VARCHAR(256) NOT NULL,
  detail TEXT NOT NULL,
  suggested_action TEXT NULL,
  detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_remote_diag_device ON remote_diagnosis_finding (device_code, detected_at DESC);
COMMENT ON TABLE remote_diagnosis_finding IS 'remote-diagnosis';

CREATE TABLE IF NOT EXISTS dashboard_alarm_daily (
  id BIGINT PRIMARY KEY DEFAULT public.generate_snowflake_id(),
  stat_date DATE NOT NULL UNIQUE,
  critical_count INTEGER NOT NULL DEFAULT 0,
  warning_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE dashboard_alarm_daily IS 'dashboard 알람 트렌드';

ALTER TABLE public.installation
  ADD COLUMN IF NOT EXISTS status VARCHAR(16) NULL DEFAULT '완료';
COMMENT ON COLUMN public.installation.status IS '설치 상태: 예정|진행중|시운전|완료';
