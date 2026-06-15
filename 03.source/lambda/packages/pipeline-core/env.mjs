/** Local / Lambda env — SSOT: 90.infra/10.local/env.local.example */

export function getEnv(name, fallback = "") {
  return process.env[name] ?? fallback;
}

export function mongoUri() {
  return (
    getEnv("TV_MONGO_URI") ||
    getEnv("MONGO_URI") ||
    "mongodb://tv:tv_local_dev@127.0.0.1:37017/iot_service?authSource=admin&directConnection=true"
  );
}

export function postgresUri() {
  return (
    getEnv("TV_POSTGRES_URI") ||
    getEnv("DATABASE_URL") ||
    "postgresql://tv:tv_local_dev@127.0.0.1:35432/iot_analytics"
  );
}

export function minioConfig() {
  return {
    endpoint: getEnv("AWS_ENDPOINT_URL", getEnv("MINIO_ENDPOINT", "http://127.0.0.1:39100")),
    accessKey: getEnv("AWS_ACCESS_KEY_ID", getEnv("MINIO_ROOT_USER", "tv")),
    secretKey: getEnv("AWS_SECRET_ACCESS_KEY", getEnv("MINIO_ROOT_PASSWORD", "tv_local_dev")),
    bucket: getEnv("TV_MEDIA_BUCKET", getEnv("MINIO_MEDIA_BUCKET", "tv-media-upload")),
    region: getEnv("AWS_REGION", "ap-northeast-2"),
  };
}
