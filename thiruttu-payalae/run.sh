#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

DB_PATH="movies.db"
JDBC_URL=""
WEB_PORT="8080"
WEB_HOST="127.0.0.1"
NO_WEB="0"
SKIP_STARTUP_REFRESH="0"
JAR_PATH="target/movies-mcp-server-1.0.0-jar-with-dependencies.jar"

usage() {
  cat <<'USAGE'
Usage: ./run.sh [options]

Options:
  --db=<path>          SQLite DB path (default: movies.db)
  --jdbc-url=<url>     JDBC URL for Postgres/Supabase (overrides --db)
  --web-port=<port>    Web server port (default: 8080)
  --web-host=<host>    Web server host (default: 127.0.0.1)
  --no-web             Disable web server
  --skip-startup-refresh  Skip indexing refresh at startup
  -h, --help           Show this help
USAGE
}

for arg in "$@"; do
  case "$arg" in
    --db=*)
      DB_PATH="${arg#--db=}"
      ;;
    --jdbc-url=*)
      JDBC_URL="${arg#--jdbc-url=}"
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
    --skip-startup-refresh)
      SKIP_STARTUP_REFRESH="1"
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
ARGS=()
if [[ -n "$JDBC_URL" ]]; then
  ARGS+=("--jdbc-url=$JDBC_URL")
else
  ARGS+=("--db=$DB_PATH")
fi
if [[ "$SKIP_STARTUP_REFRESH" == "1" ]]; then
  ARGS+=("--skip-startup-refresh")
fi

if [[ "$NO_WEB" == "1" ]]; then
  exec java -jar "$JAR_PATH" "${ARGS[@]}" --no-web
else
  java -jar "$JAR_PATH" "${ARGS[@]}" --web-host="$WEB_HOST" --web-port="$WEB_PORT" &
  APP_PID="$!"

  trap 'kill "$APP_PID" 2>/dev/null || true' INT TERM

  healthy="0"
  for _ in {1..30}; do
    if lsof -nP -iTCP:"$WEB_PORT" -sTCP:LISTEN -t >/dev/null 2>&1; then
      healthy="1"
      break
    fi
    if ! kill -0 "$APP_PID" 2>/dev/null; then
      wait "$APP_PID"
      exit $?
    fi
    sleep 1
  done

  if [[ "$healthy" == "1" ]]; then
    echo "Server is healthy and listening at http://$WEB_HOST:$WEB_PORT"
  else
    echo "Server did not become healthy within 30s. Check logs above."
  fi

  wait "$APP_PID"
fi
