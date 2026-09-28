#!/usr/bin/env bash
# Phase 1 smoke: clone API with real Supabase session JWT + optional Midday Postgres.
#
# Prerequisites:
#   - Clone API running (default http://127.0.0.1:8787)
#   - For real user/team (not demo-only): in clone/.env set
#       MIDDAY_DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres
#       SUPABASE_JWT_SECRET=<from `supabase status` JWT secret>
#       SUPABASE_URL=http://127.0.0.1:54321
#
# Usage:
#   export SUPABASE_ACCESS_TOKEN='<access_token from logged-in dashboard or supabase auth>'
#   bash scripts/smoke-phase1-session.sh
#
# Optional:
#   REPLACEMENT_API_URL=http://127.0.0.1:8787
#   MIDDAY_API_URL=http://127.0.0.1:3003   # if testing tRPC delegation end-to-end

set -euo pipefail

BASE="${REPLACEMENT_API_URL:-http://127.0.0.1:8787}"
BASE="${BASE%/}"

echo "== health =="
curl -sf "${BASE}/api/v1/health"
echo

TOKEN="${SUPABASE_ACCESS_TOKEN:-${REPLACEMENT_DELEGATION_TOKEN:-}}"
if [[ -z "$TOKEN" ]]; then
  echo "Set SUPABASE_ACCESS_TOKEN (session JWT) or REPLACEMENT_DELEGATION_TOKEN" >&2
  exit 1
fi

echo "== auth/me (session bearer) =="
curl -sf -H "Authorization: Bearer ${TOKEN}" "${BASE}/api/v1/auth/me"
echo

echo "== team/current =="
curl -sf -H "Authorization: Bearer ${TOKEN}" "${BASE}/api/v1/team/current"
echo

echo "== transactions (first page) =="
curl -sf -H "Authorization: Bearer ${TOKEN}" \
  "${BASE}/api/v1/transactions?pageSize=5"
echo

echo "== transactions review-count =="
curl -sf -H "Authorization: Bearer ${TOKEN}" \
  "${BASE}/api/v1/transactions/review-count"
echo

echo "== transactions filtered (review tab shape) =="
curl -sf -G -H "Authorization: Bearer ${TOKEN}" \
  --data-urlencode "fulfilled=true" \
  --data-urlencode "exported=false" \
  --data-urlencode "pageSize=5" \
  "${BASE}/api/v1/transactions"
echo

echo "== inbox (first page) =="
curl -sf -G -H "Authorization: Bearer ${TOKEN}" \
  --data-urlencode "pageSize=5" \
  --data-urlencode "tab=all" \
  "${BASE}/api/v1/inbox"
echo

if [[ -n "${INBOX_ITEM_ID:-}" ]]; then
  echo "== inbox by id =="
  curl -sf -H "Authorization: Bearer ${TOKEN}" \
    "${BASE}/api/v1/inbox/${INBOX_ITEM_ID}"
  echo
fi

if [[ -n "${MIDDAY_API_URL:-}" ]]; then
  MIDDAY="${MIDDAY_API_URL%/}"
  echo "== tRPC user.me (replacement mode requires apps/api env) =="
  curl -sf "${MIDDAY}/trpc/user.me" \
    -H "Authorization: Bearer ${TOKEN}" \
    -H 'Content-Type: application/json' \
    | head -c 500
  echo
fi

echo "OK"
