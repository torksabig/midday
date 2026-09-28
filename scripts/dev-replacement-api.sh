#!/usr/bin/env bash
# Starts the clean-room replacement API from the sibling `clone` repo.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CLONE_DIR="${REPLACEMENT_REPO_PATH:-$(dirname "$ROOT")/clone}"

if [[ ! -d "$CLONE_DIR/crates/api" ]]; then
  echo "Replacement API repo not found at: $CLONE_DIR" >&2
  echo "Set REPLACEMENT_REPO_PATH to the clone checkout root." >&2
  exit 1
fi

cd "$CLONE_DIR"
export API_ADDR="${API_ADDR:-127.0.0.1:8787}"
export DATABASE_URL="${DATABASE_URL:-sqlite:data/clone.db}"
export JWT_SECRET="${JWT_SECRET:-dev-secret-change-me}"
export VAULT_DIR="${VAULT_DIR:-data/vault}"

echo "Starting replacement API at http://${API_ADDR} (repo: $CLONE_DIR)"
exec bun run api
