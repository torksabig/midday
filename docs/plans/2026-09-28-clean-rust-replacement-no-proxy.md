# Clean Rust replacement — no permanent proxy

> **Canonical migration plan** (2026-09-28). Replaces the façade-first strangler / permanent dual-mode blueprint.  
> **UI baseline:** [Backend replace, UI frozen (Downloads)](./2026-09-28-backend-replace-ui-frozen-downloads.md)  
> **Rust backend:** sibling [`fintech/clone`](../../../clone) (Axum API at `http://127.0.0.1:8787`) — may later move in-repo as a Cargo workspace member; business logic lives in Rust only.

## Goal

| Layer | End state |
|-------|-----------|
| **Product UI** | `apps/dashboard` — Next.js unchanged (routes, components, tRPC client types) |
| **Business logic** | One Rust backend — auth, DB, jobs, connectors, all domains |
| **Temporary boundary** | `apps/api` — tRPC **only** until every procedure is Rust-native **or** the dashboard calls Rust REST/Connect directly; then **delete** `apps/api` |
| **Not allowed long-term** | Permanent `@midday/replacement-backend` bridge, forever `MIDDAY_BACKEND_MODE=dual`, or a hybrid Node orchestration layer |

Short-term dual/delegation env vars may exist in the repo today for smoke tests; treat them as **deprecated cutover aids** on the path to deletion, not architecture.

---

## Architecture (target)

```
                         +-------------------------------------+
                         |   Next.js Dashboard (:3001)         |
                         |   (frozen UI, same AppRouter types) |
                         +------------------+------------------+
                                            |
              +-----------------------------+-----------------------------+
              | During cutover only         | After cutover               |
              v                             v
   +------------------------+     +------------------------+
   | apps/api tRPC (:3003)  |     | Dashboard → Rust REST  |
   | thin fetch-to-Rust     |     | or generated client    |
   +-----------+------------+     +-----------+------------+
               |                              |
               |  Authorization: Bearer       |
               |  (Supabase session JWT)      |
               v                              v
   +----------------------------------------------------------+
   |              Rust Axum API (:8787)                       |
   |  JWKS validation · team context · domain handlers        |
   +---------------------------+------------------------------+
                               |
                               v
   +----------------------------------------------------------+
   |  SQLx (SQLite → Postgres) · vault · async workers      |
   +----------------------------------------------------------+
```

There is **no** second Postgres/Drizzle path in the target state. Each domain moves to Rust and its legacy TypeScript + Drizzle code is removed in the same PR series—not left behind “just in case.”

---

## Auth: Supabase JWKS in Rust

The dashboard keeps Supabase Auth for login/MFA/session cookies. The Rust API validates the **same** JWT the browser already holds:

- JWKS URL (local): `http://127.0.0.1:54321/auth/v1/.well-known/jwks.json`
- Production: project `{SUPABASE_URL}/auth/v1/.well-known/jwks.json`
- Axum extractor validates `Authorization: Bearer <access_token>` before any handler runs.

```rust
// Target: fintech/clone/crates/api/src/auth/jwt.rs
use axum::{
    extract::FromRequestParts,
    http::{request::Parts, StatusCode},
};
use jsonwebtoken::{decode, decode_header, DecodingKey, Validation};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct SupabaseClaims {
    pub sub: String,
    pub email: Option<String>,
    pub role: Option<String>,
    pub exp: usize,
}

pub struct AuthenticatedUser(pub SupabaseClaims);

#[async_trait::async_trait]
impl<S> FromRequestParts<S> for AuthenticatedUser
where
    S: Send + Sync,
{
    type Rejection = (StatusCode, &'static str);

    async fn from_request_parts(
        parts: &mut Parts,
        _state: &S,
    ) -> Result<Self, Self::Rejection> {
        let auth_header = parts
            .headers
            .get(axum::http::header::AUTHORIZATION)
            .and_then(|h| h.to_str().ok())
            .ok_or((StatusCode::UNAUTHORIZED, "Missing authorization header"))?;

        let token = auth_header
            .strip_prefix("Bearer ")
            .ok_or((StatusCode::UNAUTHORIZED, "Expected Bearer token"))?;

        let claims = validate_supabase_jwt(token).map_err(|_| {
            (StatusCode::UNAUTHORIZED, "Invalid or expired token")
        })?;

        Ok(AuthenticatedUser(claims))
    }
}
```

`apps/api` during cutover forwards `ctx.token` (session access token) to Rust—**not** demo delegation tokens—as soon as JWKS validation lands.

Team isolation: require active `team_id` (header or path) on every mutating and team-scoped read handler, matching today’s tRPC `ctx.teamId`.

---

## Domain cutover — execution protocol (3 steps)

Repeat for **every** tRPC router / domain (start with `user`, `team`, then `transactions`, `inbox`, `invoice`, …):

1. **Implement in Rust** — handlers, SQLx queries, response shapes that match the tRPC return type (contract tests or Zod mappers only while `apps/api` still exists).
2. **Swap the procedure** — change the tRPC handler to `fetch(`${REPLACEMENT_API_URL}/api/v1/...`)` with the user’s bearer (or point the dashboard at Rust for that screen if types allow).
3. **Delete legacy immediately** — remove Drizzle queries, domain helpers in `packages/*`, and tests for that domain from Node; do not keep a legacy fallback branch.

Optional **short-term** `MIDDAY_BACKEND_MODE=dual` is allowed only to compare Rust vs legacy during step 2; remove the fallback when step 3 merges.

---

## Four stages — what gets deleted

| Stage | Focus | Delete / shrink (when stage completes) |
|-------|--------|----------------------------------------|
| **1 — Identity & first domains** | JWKS on Rust; `user.me`, `team.current`, next read-heavy routers on Rust | Drizzle + router code for those domains in `apps/api`; demo-only delegation paths |
| **2 — Core product domains** | Transactions, inbox, documents, invoices, metrics, banking adapters in Rust | Matching `packages/*` service modules, `packages/db` tables usage from API, Supabase service-role calls for those features |
| **3 — Async & integrations** | Rust workers/queues; bank connectors; exports | `apps/worker`, `packages/jobs`, `packages/job-client`, Trigger/BullMQ producers in Node |
| **4 — Shell removal** | All procedures Rust-backed or dashboard-native client | **`apps/api`**, **`packages/replacement-backend`**, **`packages/db`**, **`packages/supabase`** (if fully replaced), remaining legacy domain packages |

---

## Final monorepo tree

```text
apps/
  dashboard/          # Next.js product UI (unchanged look & routes)
fintech/clone/        # Rust API + domain crate(s) — primary backend (sibling or in-repo)
packages/
  ui/                 # Shared design system only
```

Everything else (`apps/api`, `apps/worker`, `packages/db`, `packages/replacement-backend`, domain `packages/*` consumed only by legacy API) is **scheduled for deletion**, not maintained in parallel.

---

## Current code vs target

| Topic | Today in `fintech/midday` | Target |
|-------|---------------------------|--------|
| **Backend mode** | `MIDDAY_BACKEND_MODE` = `legacy` \| `dual` \| `replacement` on `apps/api` | Env removed; no permanent dual |
| **Delegation package** | `@midday/replacement-backend` REST client + Zod mappers | Temporary; delete with `apps/api` |
| **Identity cutover** | **Done (replacement mode):** `user.me` / `team.current` use Rust only (throw on failure; no Drizzle). **Dual:** delegate first, Drizzle fallback. Demo bearer still available for smoke when no session. | Delete Drizzle identity paths entirely when `apps/api` goes away |
| **Transactions list (Phase 2)** | **Done (read path):** `transactions.get` delegates to `GET /api/v1/transactions` when dual/replacement; Postgres via `MIDDAY_DATABASE_URL`. **Phase 2c:** Rust list supports `sort`, `statuses`, `start`/`end` (+ `q`, cursor, `pageSize`). Remaining filters Drizzle-only in dual fallback. | Remaining list filters + delete Drizzle list |
| **Auth on Rust** | **Done:** Supabase HS256 + JWKS path; session bearer from tRPC `accessToken` | Same |
| **Data path** | Drizzle + Supabase Postgres for most domains | Rust SQLx only |
| **UI** | Frozen by policy; workspace may diverge from Downloads baseline | Same — sync UI from Downloads; no backend-driven UI redesign |
| **Path A (Vite clone UI)** | Documented as deferred in `path-a-decision.md` | Still deferred — clone is **API/backend**, not product shell |

Existing smoke assets (`scripts/smoke-replacement-delegation.sh`, `scripts/smoke-phase1-session.sh`, `GET /api/replacement/status`) remain useful until Stage 4; then remove with `replacement-backend`.

---

## Recommended domain order

1. **User / team / settings** — identity routing done in replacement mode; settings reads next
2. **Transactions + categories**
3. **Inbox + documents**
4. **Invoices + customers**
5. **Banking connectors + sync jobs**
6. **Notifications, exports, assistant**

Inventory source: `apps/api/src/trpc/routers/_app.ts`.

---

## Immediate next engineering step (Phase 2 → 3)

1. **Phase 2 list read** — landed: clone paginated `GET /api/v1/transactions`, tRPC `transactions.get` delegation, mapper tests.
2. **Done (read path):** `transactions.getById` delegates to `GET /api/v1/transactions/{id}`. Next: remaining list filters (status, tags, sort columns), attachments/tags JSON on Rust path.
3. Contract tests + smoke; delete Drizzle for transactions when stable.

Parallel (product hygiene): rsync Downloads → workspace for `apps/dashboard` + `packages/ui` only, per [UI frozen plan](./2026-09-28-backend-replace-ui-frozen-downloads.md).

---

## Related docs

- [UI frozen / Downloads baseline](./2026-09-28-backend-replace-ui-frozen-downloads.md)
- [Enterprise strangler (archived)](./2026-09-28-enterprise-strangler-rust-migration.md) — superseded by this plan
- [Path A decision](./path-a-decision.md) — Vite clone as product UI remains deferred
- Temporary package: [`packages/replacement-backend/README.md`](../../packages/replacement-backend/README.md)
- Clone quick start: [`fintech/clone/README.md`](../../../clone/README.md)
