#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
REPO="$(cd "$ROOT/../../.." && pwd)"
SCHEMA="$REPO/02.arch/config/schema/postgres"

PGHOST="${PGHOST:-127.0.0.1}"
PGPORT="${PGPORT:-25432}"
PGUSER="${PGUSER:-tv}"
PGPASSWORD="${PGPASSWORD:-tv_local_dev}"
PGDATABASE="${PGDATABASE:-iot_analytics}"

export PGPASSWORD
PSQL="psql -v ON_ERROR_STOP=1 -h $PGHOST -p $PGPORT -U $PGUSER -d $PGDATABASE"

echo "== Techvalley postgres bootstrap ($PGHOST:$PGPORT/$PGDATABASE) =="

for f in 01-core-schema.sql 02-pipeline-alarm-notification.sql 04-tv-domain-extensions.sql; do
  echo ">> $f"
  $PSQL -f "$SCHEMA/$f"
done

if [[ "${TV_SEED:-1}" == "1" ]]; then
  echo ">> 05-seed-dev.sql"
  $PSQL -f "$SCHEMA/05-seed-dev.sql"
fi

echo "postgres bootstrap OK"
