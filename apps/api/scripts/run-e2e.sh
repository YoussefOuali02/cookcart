#!/usr/bin/env bash
# Starts the API against whatever DATABASE_URL is already set in the
# environment, waits for it to come up, runs the e2e suite over HTTP, then
# tears the server down. Assumes migrations have already been applied to
# that database (CI does this as a separate step; see .github/workflows/ci.yml).
set -euo pipefail

cd "$(dirname "$0")/.."

PORT="${PORT:-3000}"
LOG_FILE="$(mktemp)"

cleanup() {
  if [[ -n "${SERVER_PID:-}" ]] && kill -0 "$SERVER_PID" 2>/dev/null; then
    kill "$SERVER_PID" 2>/dev/null || true
    wait "$SERVER_PID" 2>/dev/null || true
  fi
}
trap cleanup EXIT

pnpm run start:dev >"$LOG_FILE" 2>&1 &
SERVER_PID=$!

echo "Waiting for API on port $PORT (pid $SERVER_PID)..."
if ! timeout 60 bash -c "until curl -sf http://localhost:$PORT/health >/dev/null 2>&1; do sleep 1; done"; then
  echo "API never came up. Server log:"
  cat "$LOG_FILE"
  exit 1
fi

jest --config ./test/jest-e2e.json
