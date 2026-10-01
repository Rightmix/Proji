#!/usr/bin/env bash
# Runs PROJI RLS tests against a throwaway local Postgres. Never points at a hosted project.
set -euo pipefail
cd "$(dirname "$0")/.."
PGBIN=${PGBIN:-$(ls -d /usr/lib/postgresql/*/bin 2>/dev/null | sort -V | tail -1)}
DATA=$(mktemp -d); PORT=${RLS_TEST_PORT:-54329}
trap '"$PGBIN/pg_ctl" -D "$DATA" -m immediate stop >/dev/null 2>&1 || true; rm -rf "$DATA"' EXIT
"$PGBIN/initdb" -D "$DATA" -U postgres -A trust >/dev/null
"$PGBIN/pg_ctl" -D "$DATA" -o "-p $PORT -k $DATA -c listen_addresses=''" -w start >/dev/null
PSQL=(psql -h "$DATA" -p "$PORT" -U postgres -v ON_ERROR_STOP=1 -q -X)
"${PSQL[@]}" -c 'create database proji_rls_test'
"${PSQL[@]}" -d proji_rls_test -f tests/auth_shim.sql
for m in migrations/*.sql; do echo "applying $m"; "${PSQL[@]}" -d proji_rls_test -f "$m"; done
"${PSQL[@]}" -d proji_rls_test -f tests/rls_test.sql
"${PSQL[@]}" -d proji_rls_test -f tests/rls_stage5_test.sql
