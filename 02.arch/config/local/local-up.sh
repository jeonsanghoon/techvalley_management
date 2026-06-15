#!/usr/bin/env bash
# Wrapper → SSOT: 10.local/
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
exec "$ROOT/../../../10.local/$(basename "$0")" "$@"
