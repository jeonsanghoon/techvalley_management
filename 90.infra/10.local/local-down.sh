#!/usr/bin/env bash
# Techvalley 로컬 컨테이너 중지
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=lib/podman-env.sh
source "$ROOT/lib/podman-env.sh"

detect_podman

for name in "$TV_POSTGRES_CONTAINER" "$TV_MONGO_CONTAINER" "$TV_MINIO_CONTAINER"; do
  if podman_cmd ps -a --format '{{.Names}}' 2>/dev/null | grep -qx "$name"; then
    echo ">> stopping $name"
    podman_cmd stop "$name" 2>/dev/null || true
  fi
done

echo "local stack stopped (containers preserved — run local:up to restart)"
