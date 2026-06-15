#!/usr/bin/env bash
# Lambda predeploy + 로컬 invoke 전체 (인프라는 local-up.sh 선행)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
REPO="$(cd "$ROOT/../../.." && pwd)"
LAMBDA="$REPO/03.source/lambda"

cd "$LAMBDA"
echo "== Techvalley local-test-all =="

npm install
npm run rules:build
npm run sync:config
npm run lambda:assets

echo ">> test:local:ingress"
npm run test:local:ingress

echo ">> test:local:ingress:alarm"
npm run test:local:ingress:alarm

echo ">> test:local:batch"
npm run test:local:batch

echo ">> test:local:batch:all"
npm run test:local:batch:all

echo ">> test:local:media"
npm run test:local:media

echo ""
echo "Optional full predeploy validate:"
npm run predeploy

echo "local-test-all OK"
