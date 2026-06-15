# shellcheck shell=bash
# Podman 연결·컨테이너 헬퍼 (macOS rootless/포트포워딩 이슈 우회)
LIB_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=ports.sh
source "$LIB_DIR/ports.sh"

detect_podman() {
  export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"
  if ! command -v podman >/dev/null 2>&1; then
    echo "ERROR: podman not found (brew install podman)" >&2
    return 1
  fi

  if [[ "$(uname -s)" == "Darwin" ]]; then
    podman machine set --rootful 2>/dev/null || true
  fi

  podman machine start 2>/dev/null || true
  sleep 2
  unset PODMAN_CONNECTION

  export TV_POSTGRES_CONTAINER="${TV_POSTGRES_CONTAINER:-tv-postgres}"
  export TV_MONGO_CONTAINER="${TV_MONGO_CONTAINER:-tv-mongo}"
  export TV_MINIO_CONTAINER="${TV_MINIO_CONTAINER:-tv-minio}"
}

podman_cmd() {
  podman "$@"
}

wait_port() {
  local host=$1 port=$2 name=$3
  local max=${4:-90}
  for _ in $(seq 1 "$max"); do
    if (echo >/dev/tcp/"$host"/"$port") 2>/dev/null; then
      echo "OK: $name ($host:$port)"
      return 0
    fi
    sleep 1
  done
  echo "TIMEOUT: $name ($host:$port)" >&2
  return 1
}

container_running() {
  local name=$1
  podman_cmd ps --format '{{.Names}}' 2>/dev/null | grep -qx "$name"
}

# 컨테이너 published 포트가 기대값과 다르면 true (재생성 필요)
container_port_mismatch() {
  local name=$1 internal=$2 expected=$3
  local published
  published=$(podman_cmd port "$name" "${internal}/tcp" 2>/dev/null | awk -F: '{print $NF}' | tr -d '[:space:]')
  [[ -n "$published" && "$published" != "$expected" ]]
}

_start_or_recreate() {
  local name=$1
  shift
  if container_running "$name"; then
    return 0
  fi
  if podman_cmd ps -a --format '{{.Names}}' 2>/dev/null | grep -qx "$name"; then
    echo ">> starting $name"
    if podman_cmd start "$name" 2>/dev/null && container_running "$name"; then
      return 0
    fi
    echo ">> removing broken $name"
    podman_cmd rm -f "$name" 2>/dev/null || true
  fi
  echo ">> creating $name"
  podman_cmd run -d --name "$name" "$@"
}

ensure_postgres_container() {
  local name="$TV_POSTGRES_CONTAINER"
  local host="$TV_PUBLISH_HOST"
  local port="$TV_POSTGRES_PORT"
  if container_running "$name"; then
    if container_port_mismatch "$name" 5432 "$port"; then
      echo ">> postgres port changed ($port) — recreating $name"
      podman_cmd rm -f "$name" 2>/dev/null || true
    else
      echo ">> postgres already running ($name :$port)"
      return 0
    fi
  fi
  _start_or_recreate "$name" \
    -e POSTGRES_USER=tv \
    -e POSTGRES_PASSWORD=tv_local_dev \
    -e POSTGRES_DB=iot_analytics \
    -p "${host}:${port}:5432" \
    docker.io/library/postgres:16
}

ensure_mongo_container() {
  local name="$TV_MONGO_CONTAINER"
  local host="$TV_PUBLISH_HOST"
  local port="$TV_MONGO_PORT"
  if container_running "$name"; then
    if container_port_mismatch "$name" 27017 "$port"; then
      echo ">> mongo port changed ($port) — recreating $name"
      podman_cmd rm -f "$name" 2>/dev/null || true
    else
      echo ">> mongo already running ($name :$port)"
      return 0
    fi
  fi
  _start_or_recreate "$name" \
    -e MONGO_INITDB_ROOT_USERNAME=tv \
    -e MONGO_INITDB_ROOT_PASSWORD=tv_local_dev \
    -p "${host}:${port}:27017" \
    docker.io/library/mongo:7
}

ensure_minio_container() {
  local name="$TV_MINIO_CONTAINER"
  local host="$TV_PUBLISH_HOST"
  local api="$TV_MINIO_API_PORT"
  local console="$TV_MINIO_CONSOLE_PORT"
  if container_running "$name"; then
    if container_port_mismatch "$name" 9000 "$api"; then
      echo ">> minio port changed ($api) — recreating $name"
      podman_cmd rm -f "$name" 2>/dev/null || true
    else
      echo ">> minio already running ($name :$api)"
      return 0
    fi
  fi
  _start_or_recreate "$name" \
    -e MINIO_ROOT_USER=tv \
    -e MINIO_ROOT_PASSWORD=tv_local_dev \
    -p "${host}:${api}:9000" -p "${host}:${console}:9001" \
    docker.io/minio/minio server /data --console-address ":9001"
}

wait_postgres_ready() {
  local name="$TV_POSTGRES_CONTAINER"
  for _ in $(seq 1 60); do
    if podman_cmd exec "$name" pg_isready -U tv -d iot_analytics >/dev/null 2>&1; then
      return 0
    fi
    sleep 1
  done
  echo "TIMEOUT: postgres not ready in $name" >&2
  return 1
}

print_podman_status() {
  echo ""
  echo "== Podman status (ports: PG=$TV_POSTGRES_PORT Mongo=$TV_MONGO_PORT MinIO=$TV_MINIO_API_PORT) =="
  podman machine list 2>/dev/null || true
  podman_cmd ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" 2>/dev/null | grep -E 'NAMES|tv-' || podman_cmd ps
}
