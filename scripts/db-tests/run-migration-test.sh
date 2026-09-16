#!/usr/bin/env bash
# Shared runner: applies a stub schema + a real migration file to a
# disposable Postgres container, then runs an assertions file against it.
# Requires Docker + psql. Usage:
#   run-migration-test.sh <container-name> <stub-schema.sql> <migration.sql> <assertions.sql>
set -euo pipefail

CONTAINER="$1"
STUB_SCHEMA="$2"
MIGRATION="$3"
ASSERTIONS="$4"
PORT="${5:-55433}"

cleanup() { docker stop "$CONTAINER" >/dev/null 2>&1 || true; }
trap cleanup EXIT

docker run -d --rm --name "$CONTAINER" -e POSTGRES_PASSWORD=test -p "$PORT:5432" postgres:16 >/dev/null

for _ in $(seq 1 30); do
  docker exec "$CONTAINER" pg_isready -U postgres >/dev/null 2>&1 && break
  sleep 1
done

export PGPASSWORD=test
psql -h localhost -p "$PORT" -U postgres -v ON_ERROR_STOP=1 -q -f "$STUB_SCHEMA"
psql -h localhost -p "$PORT" -U postgres -v ON_ERROR_STOP=1 -q -f "$MIGRATION"
psql -h localhost -p "$PORT" -U postgres -v ON_ERROR_STOP=1 -q -f "$ASSERTIONS"
