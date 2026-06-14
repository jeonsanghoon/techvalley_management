import { createHandler, decodeKinesisRecord, partitionKey, getEnv } from "@techvalley/pipeline-core";

/**
 * S3 Presigned · Create/Complete/Abort Multipart · IoT file/response publish.
 * SSOT: 02.arch/config/media-upload.yaml · 13-media-upload-pipeline.md
 */
async function onEvent({ record, event }) {
  const payload = decodeKinesisRecord(record) ?? event?.payload ?? event;
  const topic = payload?.topic ?? event?.topic ?? "";
  const role = topic.split("/").slice(-2, -1)[0] ?? payload?.role ?? "request";
  const deviceCode = partitionKey(payload, getEnv("PARTITION_KEY_FIELD", "device_code"));
  const uploadMode = payload?.upload_mode ?? payload?.body?.upload_mode ?? "multipart";

  return {
    action: "file_upload_orchestrate",
    role,
    device_code: deviceCode,
    request_code: payload?.request_code ?? payload?.body?.request_code,
    upload_mode: uploadMode,
    file_kind: payload?.file_kind ?? payload?.body?.file_kind,
    media_bucket: getEnv("TV_MEDIA_BUCKET", "tv-ingress-dev-tv-media-upload"),
    config_path: getEnv("MEDIA_UPLOAD_CONFIG_PATH", "/var/task/config/media-upload.yaml"),
    steps:
      role === "request"
        ? uploadMode === "single_put"
          ? ["presign_put_object", "publish_file_response", "upsert_media_upload_session"]
          : ["create_multipart_upload", "presign_part_urls", "publish_file_response", "upsert_media_upload_session"]
        : role === "complete"
          ? ["complete_multipart_upload", "update_session_completed", "sync_equipment_log_media"]
          : role === "abort"
            ? ["abort_multipart_upload", "update_session_aborted"]
            : ["noop"],
  };
}

export const handler = createHandler("file-upload-orchestrator", { onEvent });
