#!/usr/bin/env bash
# 로컬 E2E: Podman → Lambda ingest/batch → Backend API smoke
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
INFRA="$(cd "$ROOT/.." && pwd)"
REPO="$(cd "$INFRA/.." && pwd)"

LOCAL="$ROOT"
LAMBDA="$REPO/03.source/lambda"
BACKEND="$REPO/03.source/beckend"

echo "== Techvalley local-e2e-full =="

bash "$LOCAL/local-up.sh"

if [[ ! -f "$LOCAL/env.local" ]]; then
  cp "$LOCAL/env.local.example" "$LOCAL/env.local"
fi
set -a
# shellcheck disable=SC1091
source "$LOCAL/env.local"
set +a

cd "$LAMBDA"
npm install
npm run rules:build
npm run sync:config
npm run lambda:assets

echo ">> ingress (telemetry)"
npm run test:local:ingress

echo ">> ingress (alarm — tube.kv > 180 from YAML alerts_raw)"
npm run test:local:ingress:alarm

echo ">> batch cadences"
npm run test:local:batch:all

cd "$BACKEND"
npm install
npm run start &
BACKEND_PID=$!
trap 'kill $BACKEND_PID 2>/dev/null || true' EXIT

for i in $(seq 1 30); do
  if curl -sf "http://127.0.0.1:3002/health" >/dev/null; then break; fi
  sleep 1
done

API="http://127.0.0.1:3002"
curl -sf "$API/health" | head -c 200
echo ""
curl -sf "$API/api/dashboard/summary" | node -e "const d=JSON.parse(require('fs').readFileSync(0,'utf8')); if(!d.kpis) process.exit(1); console.log('dashboard kpis', d.kpis);"
curl -sf "$API/api/alarms" | node -e "const d=JSON.parse(require('fs').readFileSync(0,'utf8')); console.log('alarms', d.items?.length ?? 0);"
curl -sf "$API/api/alarm-rules" | node -e "const d=JSON.parse(require('fs').readFileSync(0,'utf8')); if((d.count??0)<1) process.exit(1); console.log('alarm-rules from YAML', d.count);"
curl -sf "$API/api/pipeline/live" | node -e "const d=JSON.parse(require('fs').readFileSync(0,'utf8')); console.log('mongo collections', d.collections);"

echo ""
echo "local-e2e-full OK"
echo "Frontend: NEXT_PUBLIC_API_URL=http://localhost:3002/api npm run dev:frontend"
