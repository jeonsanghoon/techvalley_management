#!/usr/bin/env bash
# Podman + DB 포트 상태 한눈에 확인
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=lib/podman-env.sh
source "$ROOT/lib/podman-env.sh"

detect_podman

echo "== Techvalley local status =="
echo "Configured ports: PG=$TV_POSTGRES_PORT Mongo=$TV_MONGO_PORT MinIO=$TV_MINIO_API_PORT"
podman machine list 2>/dev/null || true
echo ""
podman ps -a --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E 'NAMES|tv-' || echo "(tv-* 컨테이너 없음 — npm run local:up 실행)"
echo ""
check_port() {
  local port=$1 name=$2
  if (echo >/dev/tcp/127.0.0.1/"$port") 2>/dev/null; then
    echo "OK: $name 127.0.0.1:$port"
  else
    echo "DOWN: $name 127.0.0.1:$port"
  fi
}
check_port "$TV_POSTGRES_PORT" Postgres
check_port "$TV_MONGO_PORT" Mongo
check_port "$TV_MINIO_API_PORT" MinIO
