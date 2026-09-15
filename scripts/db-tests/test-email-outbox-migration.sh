#!/usr/bin/env bash
# Runs supabase/migrations/12_email_outbox.sql against a disposable Postgres
# container and asserts its constraints/RPCs behave correctly for real,
# not just against a mocked Supabase client. Requires Docker + psql.
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$DIR/../.." && pwd)"
MIGRATION="$REPO_ROOT/supabase/migrations/12_email_outbox.sql"
CONTAINER=email_outbox_migration_test
PORT=55433

cleanup() { docker stop "$CONTAINER" >/dev/null 2>&1 || true; }
trap cleanup EXIT

docker run -d --rm --name "$CONTAINER" -e POSTGRES_PASSWORD=test -p "$PORT:5432" postgres:16 >/dev/null

for _ in $(seq 1 30); do
  docker exec "$CONTAINER" pg_isready -U postgres >/dev/null 2>&1 && break
  sleep 1
done

export PGPASSWORD=test
psql -h localhost -p "$PORT" -U postgres -v ON_ERROR_STOP=1 -q -f "$DIR/email_outbox_stub_schema.sql"
psql -h localhost -p "$PORT" -U postgres -v ON_ERROR_STOP=1 -q -f "$MIGRATION"
psql -h localhost -p "$PORT" -U postgres -v ON_ERROR_STOP=1 -q -f "$DIR/email_outbox_assertions.sql"
