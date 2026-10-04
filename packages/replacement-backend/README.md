# @midday/replacement-backend

**Temporary cutover package** — REST client and response mappers used while residual `apps/api` tRPC procedures fetch the Rust replacement API (sibling [`fintech/clone`](../../../clone)).

**Stage 4 (2026-10-04):** Partial decommission — dead-façade routers are fail-closed; dashboard cut-over screens call Rust directly. This package remains only for **residual hybrid** tRPC SQL delegation inside `apps/api`. Full delete waits until hybrids/STOP/`/files`/`/chat` are gone — see [`docs/plans/2026-10-04-stage4-residual-node.md`](../../docs/plans/2026-10-04-stage4-residual-node.md).

Do **not** treat `MIDDAY_BACKEND_MODE` or this SDK as permanent architecture. Canonical plan: [`docs/plans/2026-09-28-clean-rust-replacement-no-proxy.md`](../../docs/plans/2026-09-28-clean-rust-replacement-no-proxy.md). Autopilot: [`docs/plans/2026-10-02-autopilot-direct-cutover.md`](../../docs/plans/2026-10-02-autopilot-direct-cutover.md).

## Env

| Variable | Default | Purpose |
|----------|---------|---------|
| `MIDDAY_BACKEND_MODE` | `replacement` | Stage 4 default. `legacy` \| `dual` only for debugging residual Node |
| `REPLACEMENT_API_URL` | `http://127.0.0.1:8787` | Replacement API base URL |
| `REPLACEMENT_DELEGATION_TOKEN` | — | Bearer JWT for `apps/api` delegation (optional) |
| `REPLACEMENT_DELEGATION_USE_DEMO` | — | Set `true` / `1` to use clone `POST /api/v1/auth/demo` for smoke only |

Set `MIDDAY_BACKEND_MODE` on **`apps/api`** (and dashboard for `/api/replacement/status` probes). Dashboard product data uses `NEXT_PUBLIC_RUST_API_URL`, not this mode.

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

Dashboard probe:

```bash
# apps/dashboard/.env: MIDDAY_BACKEND_MODE=replacement
curl -s http://localhost:3001/api/replacement/status | jq
```
