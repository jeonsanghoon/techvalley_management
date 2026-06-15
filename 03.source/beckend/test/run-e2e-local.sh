#!/usr/bin/env bash
# 인프라 자동 기동·스키마 적용 후 beckend 테스트
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
REPO="$(cd "$ROOT/../.." && pwd)"
LOCAL="$REPO/90.infra/10.local"

echo "== Techvalley backend test (auto infra) =="
bash "$LOCAL/local-up.sh"

cd "$ROOT"
npm run test:unit
npm run test:e2e
echo "backend tests OK"
