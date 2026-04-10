#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

DB_PATH="movies.db"
WEB_PORT="8080"
WEB_HOST="127.0.0.1"
NO_WEB="0"
JAR_PATH="target/movies-mcp-server-1.0.0-jar-with-dependencies.jar"

usage() {
  cat <<'USAGE'
Usage: ./run.sh [options]

Options:
  --db=<path>          SQLite DB path (default: movies.db)
  --web-port=<port>    Web server port (default: 8080)
  --web-host=<host>    Web server host (default: 127.0.0.1)
  --no-web             Disable web server
  -h, --help           Show this help
USAGE
}

for arg in "$@"; do
  case "$arg" in
    --db=*)
      DB_PATH="${arg#--db=}"
      ;;
    --web-port=*)
      WEB_PORT="${arg#--web-port=}"
      ;;
    --web-host=*)
      WEB_HOST="${arg#--web-host=}"
      ;;
    --no-web)
      NO_WEB="1"
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown option: $arg" >&2
      usage
      exit 1
      ;;
  esac
done

if [[ ! -f "$JAR_PATH" ]]; then
  echo "Jar not found. Building project..."
  mvn -q -DskipTests package
fi

if [[ "$NO_WEB" != "1" ]]; then
  existing_pid="$(lsof -nP -iTCP:"$WEB_PORT" -sTCP:LISTEN -t | head -n 1 || true)"
  if [[ -n "$existing_pid" ]]; then
    echo "Killing process on port $WEB_PORT (PID: $existing_pid)..."
    kill -9 "$existing_pid" || true
  fi
fi

echo "Starting server..."
if [[ "$NO_WEB" == "1" ]]; then
  exec java -jar "$JAR_PATH" --db="$DB_PATH" --no-web
else
  exec java -jar "$JAR_PATH" --db="$DB_PATH" --web-host="$WEB_HOST" --web-port="$WEB_PORT"
fi
