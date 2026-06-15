#!/usr/bin/env bash
# Podman 기동 → health wait → Postgres/Mongo/MinIO bootstrap
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
INFRA="$(cd "$ROOT/.." && pwd)"
REPO="$(cd "$INFRA/.." && pwd)"

# shellcheck source=lib/podman-env.sh
source "$ROOT/lib/podman-env.sh"

cd "$REPO"
echo "== Techvalley local-up (podman + bootstrap) =="
echo "Ports: Postgres=$TV_POSTGRES_PORT Mongo=$TV_MONGO_PORT MinIO=$TV_MINIO_API_PORT/$TV_MINIO_CONSOLE_PORT"

detect_podman

ensure_postgres_container
ensure_mongo_container
ensure_minio_container

wait_postgres_ready
wait_port "$TV_PUBLISH_HOST" "$TV_POSTGRES_PORT" postgres 90
wait_port "$TV_PUBLISH_HOST" "$TV_MONGO_PORT" mongo 90
wait_port "$TV_PUBLISH_HOST" "$TV_MINIO_API_PORT" minio 90 || echo "WARN: minio port not ready (optional)"

if [[ ! -d "$REPO/03.source/lambda/node_modules/mongodb" ]] || [[ ! -d "$REPO/03.source/lambda/node_modules/yaml" ]]; then
  echo ">> npm install (03.source/lambda — mongodb/yaml for docdb bootstrap)"
  npm install --prefix "$REPO/03.source/lambda"
fi

"$ROOT/bootstrap-postgres.sh"
"$ROOT/bootstrap-documentdb.sh"
"$ROOT/minio-init.sh" || echo "WARN: minio-init skipped"

print_podman_status

echo ""
echo "Local stack ready."
echo "  Postgres:  $TV_POSTGRES_URI"
echo "  Mongo:     $TV_MONGO_URI"
echo "  MinIO:     $MINIO_ENDPOINT  (console $MINIO_CONSOLE)"
echo ""
echo "Next: npm run local:verify   (스키마 확인 + 백엔드 테스트)"
