-- =============================================================================
-- 테크밸리 도메인 확장 — 서비스·AI Ops·장비 로그 (Warm)
-- 선행: 01-core-schema.sql, 02-pipeline-alarm-notification.sql
-- UI: service-tickets, equipment-logs, alarms(AI), alarm-rules, sla, parts, as
-- =============================================================================

-- -----------------------------------------------------------------------------
-- AI Ops (SageMaker · 룰 추천 · self-heal)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS anomaly_events (
  id BIGINT PRIMARY KEY DEFAULT public.generate_snowflake_id(),
  device_code VARCHAR(64) NOT NULL,
  device_id INTEGER NULL REFERENCES public.device(id) ON DELETE SET NULL,
  site_id INTEGER NULL REFERENCES public.site(id) ON DELETE SET NULL,
  detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  anomaly_score NUMERIC(8, 5) NOT NULL,
  severity_type INTEGER NOT NULL DEFAULT 2,
  model_version VARCHAR(64) NULL,
  endpoint_name VARCHAR(128) NULL,
  metric_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  root_cause_hint VARCHAR(32) NULL,
  status VARCHAR(24) NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_anomaly_events_device_time ON anomaly_events (device_code, detected_at DESC);
CREATE INDEX IF NOT EXISTS idx_anomaly_events_site_time ON anomaly_events (site_id, detected_at DESC) WHERE site_id IS NOT NULL;
COMMENT ON TABLE anomaly_events IS 'SageMaker 이상 탐지 결과 — UI alarms, metric-stream overlay';

CREATE TABLE IF NOT EXISTS rule_recommendations (
  id BIGINT PRIMARY KEY DEFAULT public.generate_snowflake_id(),
  device_code VARCHAR(64) NULL,
  anomaly_event_id BIGINT NULL REFERENCES anomaly_events(id) ON DELETE SET NULL,
  recommendation_status VARCHAR(24) NOT NULL DEFAULT 'draft',
  suggested_ruleset JSONB NOT NULL DEFAULT '{}'::jsonb,
  confidence NUMERIC(5, 4) NULL,
  reviewed_by_user_id INTEGER NULL REFERENCES public."user"(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_rule_recommendations_status ON rule_recommendations (recommendation_status, created_at DESC);
COMMENT ON TABLE rule_recommendations IS 'AI 룰셋 추천 draft/approved — UI alarm-rules';

CREATE TABLE IF NOT EXISTS self_heal_playbooks (
  id BIGINT PRIMARY KEY DEFAULT public.generate_snowflake_id(),
  playbook_code VARCHAR(64) NOT NULL UNIQUE,
  playbook_name VARCHAR(255) NOT NULL,
  trigger_hint VARCHAR(64) NOT NULL,
  steps_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  min_confidence NUMERIC(5, 4) NOT NULL DEFAULT 0.9,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE self_heal_playbooks IS '엣지 자가복구 시나리오 정의';

CREATE TABLE IF NOT EXISTS self_heal_executions (
  id BIGINT PRIMARY KEY DEFAULT public.generate_snowflake_id(),
  playbook_id BIGINT NOT NULL REFERENCES self_heal_playbooks(id) ON DELETE RESTRICT,
  device_code VARCHAR(64) NOT NULL,
  device_id INTEGER NULL REFERENCES public.device(id) ON DELETE SET NULL,
  anomaly_event_id BIGINT NULL REFERENCES anomaly_events(id) ON DELETE SET NULL,
  execution_status VARCHAR(24) NOT NULL DEFAULT 'pending',
  iot_job_id VARCHAR(128) NULL,
  step_reached VARCHAR(64) NULL,
  result_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  started_at TIMESTAMPTZ NULL,
  finished_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_self_heal_exec_device ON self_heal_executions (device_code, created_at DESC);
COMMENT ON TABLE self_heal_executions IS 'self-heal Job 실행 이력';

CREATE TABLE IF NOT EXISTS model_registry_mirror (
  id BIGINT PRIMARY KEY DEFAULT public.generate_snowflake_id(),
  model_name VARCHAR(128) NOT NULL,
  model_version VARCHAR(64) NOT NULL,
  endpoint_name VARCHAR(128) NULL,
  deployed_at TIMESTAMPTZ NULL,
  health_status VARCHAR(24) NOT NULL DEFAULT 'unknown',
  metadata_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (model_name, model_version)
);
COMMENT ON TABLE model_registry_mirror IS 'SageMaker 배포 모델 버전 미러 — data-pipeline health';

-- -----------------------------------------------------------------------------
-- 서비스 · SLA
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS service_ticket (
  id BIGINT PRIMARY KEY DEFAULT public.generate_snowflake_id(),
  ticket_no VARCHAR(64) NOT NULL UNIQUE,
  device_code VARCHAR(64) NOT NULL,
  device_id INTEGER NULL REFERENCES public.device(id) ON DELETE SET NULL,
  site_id INTEGER NULL REFERENCES public.site(id) ON DELETE SET NULL,
  ticket_status VARCHAR(24) NOT NULL DEFAULT 'open',
  priority_type INTEGER NOT NULL DEFAULT 2,
  title VARCHAR(512) NOT NULL,
  description TEXT NULL,
  opened_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  closed_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_service_ticket_device ON service_ticket (device_code, opened_at DESC);
COMMENT ON TABLE service_ticket IS '서비스 티켓 — UI service-tickets';

CREATE TABLE IF NOT EXISTS service_ticket_progress (
  id BIGINT PRIMARY KEY DEFAULT public.generate_snowflake_id(),
  ticket_id BIGINT NOT NULL REFERENCES service_ticket(id) ON DELETE CASCADE,
  progress_status VARCHAR(24) NOT NULL,
  actor_user_id INTEGER NULL REFERENCES public."user"(id) ON DELETE SET NULL,
  note TEXT NULL,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_service_ticket_progress_ticket ON service_ticket_progress (ticket_id, recorded_at DESC);
COMMENT ON TABLE service_ticket_progress IS '티켓 진행 이력 — UI service-progress';

CREATE TABLE IF NOT EXISTS sla_fleet_snapshot (
  id BIGINT PRIMARY KEY DEFAULT public.generate_snowflake_id(),
  snapshot_at TIMESTAMPTZ NOT NULL,
  site_id INTEGER NULL REFERENCES public.site(id) ON DELETE SET NULL,
  fleet_size INTEGER NOT NULL DEFAULT 0,
  uptime_pct NUMERIC(6, 3) NOT NULL DEFAULT 0,
  critical_open_count INTEGER NOT NULL DEFAULT 0,
  metrics_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_sla_fleet_snapshot_site ON sla_fleet_snapshot (site_id, snapshot_at DESC);
COMMENT ON TABLE sla_fleet_snapshot IS '플릿 SLA 스냅샷 — UI sla';

CREATE TABLE IF NOT EXISTS installation (
  id BIGINT PRIMARY KEY DEFAULT public.generate_snowflake_id(),
  device_code VARCHAR(64) NOT NULL,
  device_id INTEGER NULL REFERENCES public.device(id) ON DELETE SET NULL,
  site_id INTEGER NOT NULL REFERENCES public.site(id) ON DELETE RESTRICT,
  installed_at TIMESTAMPTZ NOT NULL,
  installer_note TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_installation_device ON installation (device_code, installed_at DESC);
COMMENT ON TABLE installation IS '장비 설치 이력 — UI installation';

CREATE TABLE IF NOT EXISTS as_record (
  id BIGINT PRIMARY KEY DEFAULT public.generate_snowflake_id(),
  device_code VARCHAR(64) NOT NULL,
  service_type VARCHAR(48) NOT NULL,
  performed_at TIMESTAMPTZ NOT NULL,
  summary TEXT NULL,
  parts_used_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_as_record_device ON as_record (device_code, performed_at DESC);
COMMENT ON TABLE as_record IS 'AS 정비 이력 — UI as';

CREATE TABLE IF NOT EXISTS parts_order (
  id BIGINT PRIMARY KEY DEFAULT public.generate_snowflake_id(),
  order_no VARCHAR(64) NOT NULL UNIQUE,
  device_code VARCHAR(64) NULL,
  part_type_code VARCHAR(32) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  order_status VARCHAR(24) NOT NULL DEFAULT 'requested',
  ordered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE parts_order IS '부품 주문 — UI parts-orders';

CREATE TABLE IF NOT EXISTS parts_schedule (
  id BIGINT PRIMARY KEY DEFAULT public.generate_snowflake_id(),
  device_code VARCHAR(64) NOT NULL,
  part_type_code VARCHAR(32) NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  schedule_status VARCHAR(24) NOT NULL DEFAULT 'planned',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_parts_schedule_device ON parts_schedule (device_code, scheduled_at);
COMMENT ON TABLE parts_schedule IS '부품 교체 예정 — UI parts-schedule';

-- -----------------------------------------------------------------------------
-- 장비 로그 (Warm 카테고리별 — batch equipment_log_export)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS equipment_log_tube (
  id BIGINT PRIMARY KEY DEFAULT public.generate_snowflake_id(),
  device_code VARCHAR(64) NOT NULL,
  event_at TIMESTAMPTZ NOT NULL,
  tube_kv NUMERIC(10, 3) NULL,
  tube_ma NUMERIC(10, 3) NULL,
  payload_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_equipment_log_tube ON equipment_log_tube (device_code, event_at DESC);

CREATE TABLE IF NOT EXISTS equipment_log_detector (
  id BIGINT PRIMARY KEY DEFAULT public.generate_snowflake_id(),
  device_code VARCHAR(64) NOT NULL,
  event_at TIMESTAMPTZ NOT NULL,
  temp_c NUMERIC(8, 3) NULL,
  payload_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_equipment_log_detector ON equipment_log_detector (device_code, event_at DESC);

CREATE TABLE IF NOT EXISTS equipment_log_body (
  id BIGINT PRIMARY KEY DEFAULT public.generate_snowflake_id(),
  device_code VARCHAR(64) NOT NULL,
  event_at TIMESTAMPTZ NOT NULL,
  yield_pct NUMERIC(6, 3) NULL,
  payload_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_equipment_log_body ON equipment_log_body (device_code, event_at DESC);

CREATE TABLE IF NOT EXISTS equipment_log_control (
  id BIGINT PRIMARY KEY DEFAULT public.generate_snowflake_id(),
  device_code VARCHAR(64) NOT NULL,
  event_at TIMESTAMPTZ NOT NULL,
  request_code VARCHAR(128) NULL,
  control_action VARCHAR(64) NULL,
  payload_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_equipment_log_control ON equipment_log_control (device_code, event_at DESC);

CREATE TABLE IF NOT EXISTS equipment_log_firmware (
  id BIGINT PRIMARY KEY DEFAULT public.generate_snowflake_id(),
  device_code VARCHAR(64) NOT NULL,
  event_at TIMESTAMPTZ NOT NULL,
  firmware_version VARCHAR(64) NULL,
  ota_status VARCHAR(32) NULL,
  payload_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_equipment_log_firmware ON equipment_log_firmware (device_code, event_at DESC);

CREATE TABLE IF NOT EXISTS equipment_log_audit (
  id BIGINT PRIMARY KEY DEFAULT public.generate_snowflake_id(),
  device_code VARCHAR(64) NOT NULL,
  event_at TIMESTAMPTZ NOT NULL,
  audit_type VARCHAR(48) NOT NULL,
  actor_user_id INTEGER NULL REFERENCES public."user"(id) ON DELETE SET NULL,
  payload_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_equipment_log_audit ON equipment_log_audit (device_code, event_at DESC);

COMMENT ON TABLE equipment_log_tube IS '장비 로그 — 튜브 카테고리 (UI equipment-logs)';

-- -----------------------------------------------------------------------------
-- 미디어 업로드 (이미지 청크 · 비디오 스트림 · S3 single/multipart)
-- SSOT: 02.arch/13-media-upload-pipeline.md · config/media-upload.yaml
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS media_upload_session (
  id BIGINT PRIMARY KEY DEFAULT public.generate_snowflake_id(),
  request_code VARCHAR(128) NOT NULL,
  device_code VARCHAR(64) NOT NULL,
  device_id INTEGER NULL REFERENCES public.device(id) ON DELETE SET NULL,
  file_kind VARCHAR(64) NOT NULL,
  upload_mode VARCHAR(32) NOT NULL,
  status VARCHAR(24) NOT NULL DEFAULT 'pending',
  s3_bucket VARCHAR(128) NULL,
  s3_key VARCHAR(512) NULL,
  upload_id VARCHAR(256) NULL,
  file_size_bytes BIGINT NULL,
  part_size_bytes INTEGER NULL,
  total_parts INTEGER NULL,
  total_chunks INTEGER NULL,
  checksum_sha256 VARCHAR(128) NULL,
  etag VARCHAR(256) NULL,
  expires_at TIMESTAMPTZ NULL,
  completed_at TIMESTAMPTZ NULL,
  metadata_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (device_code, request_code)
);
CREATE INDEX IF NOT EXISTS idx_media_upload_session_device ON media_upload_session (device_code, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_media_upload_session_status ON media_upload_session (status, updated_at DESC);
COMMENT ON TABLE media_upload_session IS 'S3 업로드 세션 — single_put · multipart · image_chunk · video_stream';

CREATE TABLE IF NOT EXISTS media_upload_part (
  id BIGINT PRIMARY KEY DEFAULT public.generate_snowflake_id(),
  session_id BIGINT NOT NULL REFERENCES media_upload_session(id) ON DELETE CASCADE,
  part_number INTEGER NOT NULL,
  chunk_index INTEGER NULL,
  etag VARCHAR(256) NULL,
  size_bytes BIGINT NULL,
  status VARCHAR(24) NOT NULL DEFAULT 'pending',
  uploaded_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (session_id, part_number)
);
CREATE INDEX IF NOT EXISTS idx_media_upload_part_session ON media_upload_part (session_id, part_number);
COMMENT ON TABLE media_upload_part IS '멀티파트·이미지 청크 파트 이력';

CREATE TABLE IF NOT EXISTS media_stream_segment (
  id BIGINT PRIMARY KEY DEFAULT public.generate_snowflake_id(),
  session_id BIGINT NOT NULL REFERENCES media_upload_session(id) ON DELETE CASCADE,
  segment_index INTEGER NOT NULL,
  stream_seq BIGINT NOT NULL,
  duration_ms INTEGER NULL,
  s3_key VARCHAR(512) NULL,
  etag VARCHAR(256) NULL,
  byte_range_start BIGINT NULL,
  byte_range_end BIGINT NULL,
  status VARCHAR(24) NOT NULL DEFAULT 'uploaded',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (session_id, segment_index)
);
CREATE INDEX IF NOT EXISTS idx_media_stream_segment_session ON media_stream_segment (session_id, segment_index);
COMMENT ON TABLE media_stream_segment IS '비디오 스트림 세그먼트 메타';

CREATE TABLE IF NOT EXISTS equipment_log_media (
  id BIGINT PRIMARY KEY DEFAULT public.generate_snowflake_id(),
  device_code VARCHAR(64) NOT NULL,
  session_id BIGINT NULL REFERENCES media_upload_session(id) ON DELETE SET NULL,
  request_code VARCHAR(128) NOT NULL,
  media_type VARCHAR(32) NOT NULL,
  upload_mode VARCHAR(32) NOT NULL,
  s3_bucket VARCHAR(128) NULL,
  s3_key VARCHAR(512) NULL,
  file_size_bytes BIGINT NULL,
  event_at TIMESTAMPTZ NOT NULL,
  payload_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_equipment_log_media_device ON equipment_log_media (device_code, event_at DESC);
COMMENT ON TABLE equipment_log_media IS '장비 로그 — 검사 이미지·비디오 (UI equipment-logs · inspection)';
