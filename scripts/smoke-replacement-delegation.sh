#!/usr/bin/env bash
# Smoke: replacement API health + demo delegation payloads (no Midday DB).
set -euo pipefail

BASE="${REPLACEMENT_API_URL:-http://127.0.0.1:8787}"
BASE="${BASE%/}"

echo "== health =="
curl -sf "${BASE}/api/v1/health" | head -c 200
echo

echo "== demo login =="
TOKEN="$(curl -sf -X POST "${BASE}/api/v1/auth/demo" -H 'Content-Type: application/json' | bun -e 'const j=JSON.parse(await Bun.stdin.text()); process.stdout.write(j.token??"")')"
if [[ -z "$TOKEN" ]]; then
  echo "demo login failed" >&2
  exit 1
fi

echo "== auth/me =="
curl -sf -H "Authorization: Bearer ${TOKEN}" "${BASE}/api/v1/auth/me"
echo

echo "== team/current =="
curl -sf -H "Authorization: Bearer ${TOKEN}" "${BASE}/api/v1/team/current"
echo

echo "OK"
