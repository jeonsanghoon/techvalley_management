import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { parse as parseYaml } from "yaml";
import { ARCH_ROOT } from "./docs";

export type MediaUploadConfig = {
  thresholds?: {
    single_put_max_bytes?: number;
    multipart_part_size_bytes?: number;
    image_chunk_size_bytes?: number;
    video_stream_segment_duration_sec?: number;
  };
  presigned?: {
    single_put_expires_seconds?: number;
    part_url_expires_seconds?: number;
  };
  mqtt?: { roles?: string[] };
  upload_modes?: Record<string, { default_mode?: string }>;
};

export type FileSample = {
  filename: string;
  rel: string;
  title: string;
  uploadMode?: string;
  content: object;
};

export const FILE_CONVERTER_RULES = [
  { file: "rule_file_request_v1.yaml", role: "request", desc: "업로드 세션 시작" },
  { file: "rule_file_response_v1.yaml", role: "response", desc: "Presigned URL 발행" },
  { file: "rule_file_chunk_v1.yaml", role: "chunk", desc: "이미지 청크·파트 ETag" },
  { file: "rule_video_stream_v1.yaml", role: "stream", desc: "비디오 스트림 세그먼트" },
  { file: "rule_file_complete_v1.yaml", role: "complete", desc: "CompleteMultipart / single 완료" },
  { file: "rule_file_abort_v1.yaml", role: "abort", desc: "AbortMultipartUpload" },
  { file: "rule_file_progress_v1.yaml", role: "progress", desc: "진행률" },
  { file: "rule_file_events_v1.yaml", role: "*", desc: "fallback (기타 file role)" },
];

export const MQTT_FILE_TOPICS = [
  { role: "request", topic: "tv/{env}/{edge}/{device}/event/file/request/json", dir: "↑" },
  { role: "response", topic: "tv/{env}/{edge}/{device}/event/file/response/json", dir: "↓ Retained" },
  { role: "chunk", topic: "tv/{env}/{edge}/{device}/event/file/chunk/json", dir: "↑" },
  { role: "stream", topic: "tv/{env}/{edge}/{device}/event/file/stream/json", dir: "↑" },
  { role: "progress", topic: "tv/{env}/{edge}/{device}/event/file/progress/json", dir: "↑" },
  { role: "complete", topic: "tv/{env}/{edge}/{device}/event/file/complete/json", dir: "↑" },
  { role: "abort", topic: "tv/{env}/{edge}/{device}/event/file/abort/json", dir: "↑" },
];

export const UPLOAD_MODES = [
  {
    mode: "single_put",
    label: "단일 PUT",
    condition: "≤ 5MB (기본)",
    s3: "PutObject Presigned",
    sample: "file_request_single_put.sample.json",
  },
  {
    mode: "multipart",
    label: "멀티파트",
    condition: "대용량 단일 객체",
    s3: "CreateMultipartUpload + UploadPart",
    sample: "file_response_multipart.sample.json",
  },
  {
    mode: "image_chunk",
    label: "이미지 청크",
    condition: "검사 프레임 순차",
    s3: "멀티파트 + chunk_index",
    sample: "file_request_image_chunk.sample.json",
  },
  {
    mode: "video_stream",
    label: "비디오 스트림",
    condition: "MJPEG/H.264 세그먼트",
    s3: "세그먼트별 PUT",
    sample: "file_request_video_stream.sample.json",
  },
];

export const MEDIA_POSTGRES_TABLES = [
  { name: "media_upload_session", desc: "S3 업로드 세션 (single/multipart/chunk/stream)" },
  { name: "media_upload_part", desc: "멀티파트·이미지 청크 파트" },
  { name: "media_stream_segment", desc: "비디오 스트림 세그먼트" },
  { name: "equipment_log_media", desc: "UI inspection · equipment-logs" },
];

export function loadMediaUploadConfig(): MediaUploadConfig {
  const path = join(ARCH_ROOT, "config/media-upload.yaml");
  if (!existsSync(path)) return {};
  return parseYaml(readFileSync(path, "utf8")) as MediaUploadConfig;
}

const SAMPLE_TITLES: Record<string, string> = {
  "file_request_image_chunk.sample.json": "이미지 청크 — request",
  "file_request_video_stream.sample.json": "비디오 스트림 — request",
  "file_request_single_put.sample.json": "단일 PUT — request",
  "file_response_multipart.sample.json": "멀티파트 — response",
  "file_chunk_image.sample.json": "이미지 청크 — chunk",
  "file_stream_video.sample.json": "비디오 — stream 세그먼트",
  "file_complete.sample.json": "업로드 complete",
};

export function loadFileSamples(): FileSample[] {
  const dir = join(ARCH_ROOT, "config/samples");
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.startsWith("file_") && f.endsWith(".sample.json"))
    .sort()
    .map((filename) => {
      const content = JSON.parse(readFileSync(join(dir, filename), "utf8")) as object;
      const uploadMode =
        "upload_mode" in content && typeof (content as { upload_mode: unknown }).upload_mode === "string"
          ? (content as { upload_mode: string }).upload_mode
          : undefined;
      return {
        filename,
        rel: `config/samples/${filename}`,
        title: SAMPLE_TITLES[filename] ?? filename,
        uploadMode,
        content,
      };
    });
}

export function formatBytes(n?: number): string {
  if (n == null) return "—";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}
