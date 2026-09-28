# @midday/replacement-backend

**Temporary cutover package** — REST client and response mappers used while `apps/api` tRPC procedures fetch the Rust replacement API (sibling [`fintech/clone`](../../../clone)).

**End state:** delete this package together with `apps/api` when either (a) all tRPC routers are served from Rust-native handlers with no Node business logic, or (b) the dashboard calls Rust directly and no longer needs a tRPC boundary.

Do **not** treat `MIDDAY_BACKEND_MODE` or this SDK as permanent architecture. See the canonical plan: [`docs/plans/2026-09-28-clean-rust-replacement-no-proxy.md`](../../docs/plans/2026-09-28-clean-rust-replacement-no-proxy.md).

**Phase 1 (identity):** Supabase JWKS validation on the clone API and session JWT passthrough (replacing demo delegation). Until JWKS lands, demo env vars below support smoke tests only.

## Env

| Variable | Default | Purpose |
|----------|---------|---------|
| `MIDDAY_BACKEND_MODE` | `legacy` | **Deprecated cutover aid:** `legacy` \| `dual` \| `replacement` — remove when legacy API is deleted |
| `REPLACEMENT_API_URL` | `http://127.0.0.1:8787` | Replacement API base URL |
| `REPLACEMENT_DELEGATION_TOKEN` | — | Bearer JWT for `apps/api` delegation (optional) |
| `REPLACEMENT_DELEGATION_USE_DEMO` | — | Set `true` / `1` to use clone `POST /api/v1/auth/demo` for smoke only |

Set `MIDDAY_BACKEND_MODE` on **`apps/api`** (and dashboard for `/api/replacement/status` probes).

## tRPC → REST mapping (Phase 2)

| tRPC procedure | Replacement REST | Notes |
|----------------|------------------|-------|
| `user.me` | `GET /api/v1/auth/me` + `GET /api/v1/settings` | Mapped to legacy shape; `fileKey` from encryption |
| `team.current` | `GET /api/v1/team/current` | Currency from settings; other fields defaulted |

When `MIDDAY_BACKEND_MODE` is `dual` or `replacement`, `apps/api` tries delegation first (if a bearer is available), then falls back to legacy Postgres on failure or missing token. **Target:** no fallback—delete legacy once Rust passes contract tests.

## Dev: replacement API

From monorepo root:

```bash
bun run dev:replacement-api
```

Uses `scripts/dev-replacement-api.sh` (override clone path with `REPLACEMENT_REPO_PATH`).

## Smoke

With clone API running and demo delegation enabled:

```bash
bash scripts/smoke-replacement-delegation.sh
```

Dashboard dual-mode probe:

```bash
# apps/dashboard/.env: MIDDAY_BACKEND_MODE=dual
curl -s http://localhost:3001/api/replacement/status | jq
```

API delegation (requires `apps/api` env):

```bash
export MIDDAY_BACKEND_MODE=dual
export REPLACEMENT_DELEGATION_USE_DEMO=true
export REPLACEMENT_API_URL=http://127.0.0.1:8787
# then call user.me via tRPC with a valid Supabase session, or run:
bun test apps/api/src/__tests__/trpc/user-replacement-delegation.test.ts
```
