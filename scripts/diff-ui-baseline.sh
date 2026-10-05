#!/usr/bin/env bash
# Compare frozen UI trees against the Downloads baseline (Phase 0 parity check).
set -euo pipefail

BASELINE="${MIDDAY_UI_BASELINE:-$HOME/Downloads/midday-main-main}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

if [[ ! -d "$BASELINE" ]]; then
  echo "Baseline not found: $BASELINE" >&2
  echo "Set MIDDAY_UI_BASELINE to your Downloads copy of midday-main-main." >&2
  exit 1
fi

echo "Diff apps/dashboard (excluding .next, node_modules)…"
diff -rq \
  --exclude=.next \
  --exclude=node_modules \
  --exclude=.turbo \
  "$BASELINE/apps/dashboard" "$ROOT/apps/dashboard" || true

echo "Diff packages/ui…"
diff -rq \
  --exclude=node_modules \
  "$BASELINE/packages/ui" "$ROOT/packages/ui" || true

echo "Done (non-zero diff lines above indicate drift from baseline)."
