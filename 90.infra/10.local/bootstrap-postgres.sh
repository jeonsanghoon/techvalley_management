#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
INFRA="$(cd "$ROOT/.." && pwd)"
REPO="$(cd "$INFRA/.." && pwd)"

SCHEMA="$INFRA/config/schema/postgres"
# shellcheck source=lib/podman-env.sh
source "$ROOT/lib/podman-env.sh"

PG_CONTAINER="${TV_POSTGRES_CONTAINER:-tv-postgres}"

export PGPASSWORD
PSQL="psql -v ON_ERROR_STOP=1 -h $PGHOST -p $PGPORT -U $PGUSER -d $PGDATABASE"

run_sql_file() {
  local file=$1
  if command -v psql >/dev/null 2>&1; then
    $PSQL -f "$file"
  elif detect_podman 2>/dev/null && podman_cmd ps --format '{{.Names}}' 2>/dev/null | grep -qx "$PG_CONTAINER"; then
    podman_cmd exec -i "$PG_CONTAINER" psql -U "$PGUSER" -d "$PGDATABASE" -v ON_ERROR_STOP=1 -f - <"$file"
  else
    echo "psql not found and container $PG_CONTAINER unavailable" >&2
    exit 1
  fi
}

schema_applied() {
  if command -v psql >/dev/null 2>&1; then
    psql -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d "$PGDATABASE" -tAc \
      "SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='company' LIMIT 1" \
      2>/dev/null | grep -qx 1
  elif detect_podman 2>/dev/null && podman_cmd ps --format '{{.Names}}' 2>/dev/null | grep -qx "$PG_CONTAINER"; then
    podman_cmd exec "$PG_CONTAINER" psql -U "$PGUSER" -d "$PGDATABASE" -tAc \
      "SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='company' LIMIT 1" \
      2>/dev/null | grep -qx 1
  else
    return 1
  fi
}

echo "== Techvalley postgres bootstrap ($PGHOST:$PGPORT/$PGDATABASE) =="

if schema_applied; then
  echo ">> schema already applied — skipping DDL"
else
  for f in 01-core-schema.sql 02-pipeline-alarm-notification.sql 04-tv-domain-extensions.sql 06-ui-portal-schema.sql; do
    echo ">> $f"
    run_sql_file "$SCHEMA/$f"
  done
fi

if [[ "${TV_SEED:-1}" == "1" ]]; then
  echo ">> 05-seed-dev.sql"
  run_sql_file "$SCHEMA/05-seed-dev.sql"
  echo ">> 06-seed-dev-ui.sql"
  run_sql_file "$SCHEMA/06-seed-dev-ui.sql"
fi

echo "postgres bootstrap OK"
