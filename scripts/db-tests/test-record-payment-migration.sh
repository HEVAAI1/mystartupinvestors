#!/usr/bin/env bash
# Runs supabase/migrations/14_record_payment_atomic.sql against a disposable
# Postgres container and asserts record_payment_and_grant_credits is truly
# atomic: a failed credit grant rolls back the transaction insert too, so a
# retried webhook delivery is recoverable instead of stuck behind a
# duplicate-transaction short-circuit. Requires Docker + psql.
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$DIR/../.." && pwd)"

"$DIR/run-migration-test.sh" \
  record_payment_migration_test \
  "$DIR/payment_stub_schema.sql" \
  "$REPO_ROOT/supabase/migrations/14_record_payment_atomic.sql" \
  "$DIR/payment_assertions.sql" \
  55434
