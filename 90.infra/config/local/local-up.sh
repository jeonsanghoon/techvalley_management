#!/usr/bin/env bash
# Podman Compose 기동 → health wait → Postgres/DocDB/MinIO bootstrap
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
REPO="$(cd "$ROOT/../../.." && pwd)"
COMPOSE="podman compose -f $ROOT/docker-compose.yml"

if command -v docker >/dev/null 2>&1 && ! command -v podman >/dev/null 2>&1; then
  COMPOSE="docker compose -f $ROOT/docker-compose.yml"
fi

cd "$REPO"
echo "== Techvalley local-up (compose + bootstrap) =="

$COMPOSE up -d

wait_port() {
  local host=$1 port=$2 name=$3
  for i in $(seq 1 60); do
    if (echo >/dev/tcp/"$host"/"$port") 2>/dev/null; then
      echo "OK: $name ($host:$port)"
      return 0
    fi
    sleep 1
  done
  echo "TIMEOUT: $name ($host:$port)" >&2
  exit 1
}

wait_port 127.0.0.1 25432 postgres
wait_port 127.0.0.1 27000 mongo
wait_port 127.0.0.1 19010 minio

if [[ ! -d "$REPO/03.source/lambda/node_modules/mongodb" ]]; then
  echo ">> npm install (03.source/lambda — mongodb for docdb bootstrap)"
  npm install --prefix "$REPO/03.source/lambda"
fi

export PGHOST=127.0.0.1 PGPORT=25432 PGUSER=tv PGPASSWORD=tv_local_dev PGDATABASE=iot_analytics
export MONGO_URI="${MONGO_URI:-mongodb://tv:tv_local_dev@127.0.0.1:27000/iot_service?authSource=admin&directConnection=true}"

"$ROOT/bootstrap-postgres.sh"
"$ROOT/bootstrap-documentdb.sh"
"$ROOT/minio-init.sh"

echo ""
echo "Local stack ready."
echo "  Postgres:  postgresql://tv:tv_local_dev@127.0.0.1:25432/iot_analytics"
echo "  Mongo:     mongodb://tv:tv_local_dev@127.0.0.1:27000/iot_service?authSource=admin"
echo "  MinIO:     http://127.0.0.1:19010  (console :19011)"
echo ""
echo "Next: ./02.arch/config/local/local-test-all.sh"
echo "      npm run dev:frontend"
