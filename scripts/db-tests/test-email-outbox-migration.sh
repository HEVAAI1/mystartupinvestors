#!/usr/bin/env bash
# Runs supabase/migrations/12_email_outbox.sql against a disposable Postgres
# container and asserts its constraints/RPCs behave correctly for real,
# not just against a mocked Supabase client. Requires Docker + psql.
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$DIR/../.." && pwd)"

"$DIR/run-migration-test.sh" \
  email_outbox_migration_test \
  "$DIR/email_outbox_stub_schema.sql" \
  "$REPO_ROOT/supabase/migrations/12_email_outbox.sql" \
  "$DIR/email_outbox_assertions.sql"
