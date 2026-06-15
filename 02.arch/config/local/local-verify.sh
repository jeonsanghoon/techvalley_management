#!/usr/bin/env bash
# 인프라 기동 → DB 스키마/시드 → 백엔드 빌드·테스트 (원샷 검증)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
REPO="$(cd "$ROOT/../../.." && pwd)"
BACKEND="$REPO/03.source/beckend"
LIB="$ROOT/lib/podman-env.sh"
# shellcheck source=lib/podman-env.sh
source "$LIB"

failures=0
check() {
  local label=$1
  shift
  echo ""
  echo "── $label ──"
  if "$@"; then
    echo "PASS: $label"
  else
    echo "FAIL: $label" >&2
    failures=$((failures + 1))
  fi
}

echo "========================================"
echo " Techvalley local verify"
echo " $(date '+%Y-%m-%d %H:%M:%S')"
echo "========================================"

check "Podman + local stack" "$ROOT/local-up.sh"

check "Postgres schema (company table)" bash -c "
  source '$LIB'
  detect_podman
  podman_cmd exec \"\$TV_POSTGRES_CONTAINER\" psql -U tv -d iot_analytics -tAc \
    \"SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public' AND table_name='company';\" | grep -qx 1
"

check "Postgres seed (demo user)" bash -c "
  source '$LIB'
  detect_podman
  podman_cmd exec \"\$TV_POSTGRES_CONTAINER\" psql -U tv -d iot_analytics -tAc \
    \"SELECT COUNT(*) FROM \\\"user\\\" WHERE code='USR-TV-OPS';\" | grep -qx 1
"

check "Mongo connection" bash -c "
  source '$LIB'
  detect_podman
  export MONGO_URI=\"\$TV_MONGO_URI\"
  node -e \"
    const { MongoClient } = require('$REPO/03.source/lambda/node_modules/mongodb');
    (async () => {
      const c = new MongoClient(process.env.MONGO_URI);
      await c.connect();
      await c.db('iot_service').command({ ping: 1 });
      await c.close();
    })().catch(e => { console.error(e); process.exit(1); });
  \"
"

check "Backend build" bash -c "cd '$BACKEND' && npm run build"

check "Backend unit tests" bash -c "cd '$BACKEND' && npm run test:unit"

check "Backend e2e tests" bash -c "cd '$BACKEND' && npm run test:e2e"

echo ""
echo "========================================"
if [[ "$failures" -eq 0 ]]; then
  echo " ALL CHECKS PASSED"
  echo "========================================"
  exit 0
else
  echo " $failures CHECK(S) FAILED"
  echo "========================================"
  exit 1
fi
