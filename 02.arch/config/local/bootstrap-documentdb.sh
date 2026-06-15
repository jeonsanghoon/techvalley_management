#!/usr/bin/env bash
# Wrapper → SSOT: 90.infra/10.local/
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
exec "$ROOT/../../../90.infra/10.local/$(basename "$0")" "$@"
