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
| **Identity cutover** | **Direct Rust for dashboard `user.me` and `team.current`:** dashboard server/client reads call `GET /api/v1/auth/me` and `GET /api/v1/team/current` with the Supabase session JWT and receive legacy-compatible user/team/file-key shapes. Temporary tRPC identity/team mutations and team list/member reads remain until those full settings/team flows are Rust-complete. | Delete remaining Drizzle identity paths when each settings/team flow is direct Rust |
| **Dashboard-to-Rust contract** | **Generated OpenAPI:** clone uses `utoipa` (`cargo run -p clone-api --bin generate_openapi > crates/api/openapi.json`) for direct dashboard routes; clone tests fail if the checked-in contract drifts from generated Rust schemas. Midday regenerates `apps/dashboard/src/lib/rust-api/openapi.generated.ts` from that file. | Extend generated contract before each direct dashboard read |
| **Transactions list (Phase 2)** | **Done (read path):** `transactions.get` → `GET /api/v1/transactions`; **Phase 2e:** remaining dashboard filters on Postgres + attachments/tags JSON on list/detail rows; **`transactions.getReviewCount`** → `GET /api/v1/transactions/review-count`. See filter matrix below. | Delete Drizzle list + review count when stable |
| **Inbox list/detail (Phase 3 read)** | **Done (read path):** `inbox.get` / `getById` / `search` / `getByStatus` / `checkAttachments` → Rust inbox routes; list/detail blocklist + joins as before. Search uses ILIKE/amount tolerance (no FTS/AI re-rank). | Inbox mutations still Drizzle |
| **Overview home (Phase 3b read)** | **Direct Rust:** dashboard calls `GET /api/v1/overview/summary` with its Supabase session JWT; the tRPC overview router and delegation mapper are removed. Postgres aggregates; `runway` stub `0`, invoice FX simplified. | No Node fallback |
| **Invoice default settings** | **Direct Rust for dashboard read:** dashboard calls `GET /api/v1/invoices/default-settings-data` with the Supabase session JWT and normalizes the result to the legacy draft-defaults object locally. Invoice send, PDF, email, and payment/provider flows stay on Node until each full action is Rust-owned. | Delete the temporary tRPC default-settings path when invoice screen mutations are direct Rust |
| **Notifications feed** | **Direct Rust for dashboard screen:** notification center reads call `GET /api/v1/notifications` directly, and status writes call `PUT /api/v1/notifications/:id/status` / `PUT /api/v1/notifications/status` directly. Generated types are used and the old React Query cache keys are preserved. | Delete the temporary tRPC notification procedures when the remaining API consumers are direct Rust |
| **Notification settings** | **Direct Rust for dashboard settings screen:** preferences read calls `GET /api/v1/notification-settings/preferences` directly, and checkbox writes call `PUT /api/v1/notification-settings` directly. Generated types are used and the old React Query cache key is preserved. | Delete temporary tRPC notification-settings procedures when bulk/non-screen consumers are direct Rust |
| **Categories / bank accounts (read)** | **Done:** `transactionCategories.get` → `GET /api/v1/categories`; `bankAccounts.get` → `GET /api/v1/bank-accounts` with delegation | Mutations still Drizzle-only |
| **Auth on Rust** | **Done:** Supabase HS256 + JWKS path; session bearer from tRPC `accessToken` | Same |
| **Data path** | Drizzle + Supabase Postgres for most domains | Rust SQLx only |
| **UI** | Frozen by policy; workspace may diverge from Downloads baseline | Same — sync UI from Downloads; no backend-driven UI redesign |
| **Path A (Vite clone UI)** | Documented as deferred in `path-a-decision.md` | Still deferred — clone is **API/backend**, not product shell |
| **Documents / customers / invoices (Phase 4 read)** | **Done (read path):** `documents.get` / `getById`, `customers.get` / `getById`, `invoice.get` / `getById` → Rust Postgres routes; dual fallback, replacement fail-closed. | Delete Drizzle read paths when stable |

**Delegation inventory:** live procedure table and counts in [`2026-09-28-delegation-inventory.md`](./2026-09-28-delegation-inventory.md). **Autopilot (no repeated “continue”):** [`2026-09-28-autopilot-migration-continuation.md`](./2026-09-28-autopilot-migration-continuation.md). Strategic correction unchanged: **frozen `apps/dashboard` UI**, **`apps/api` = temporary tRPC façade only** (not a permanent Hono→Axum proxy), **`@midday/replacement-backend` + `MIDDAY_BACKEND_MODE` = strangler glue deleted with `apps/api`**, all durable logic in **`fintech/clone` Rust**, **no Vite clone UI (Path A)**.

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
2. **Done (read path):** `transactions.getById` → `GET /api/v1/transactions/{id}`. **Phase 2d:** categories/accounts/tags/exported/fulfilled. **Phase 2e:** assignees, attachments filter, recurring, type/manual, amount/amountRange, row attachments/tags JSON, `getReviewCount` delegation.
3. **Phase 3 inbox read:** `inbox.get` / `getById` / `search` / `getByStatus` / `checkAttachments` delegated; clone `inbox_list.rs` on Midday Postgres; smoke covers inbox routes + optional `INBOX_ITEM_ID` for detail/check-attachments.
4. **Phase 3b overview:** `overview.summary` delegated via `overview_summary.rs`; smoke adds `GET /api/v1/overview/summary`.
5. **Phase 4 (done):** documents + customers + invoices list/getById reads delegated; see delegation inventory doc.
6. **Next:** `invoice.paymentStatus` / `invoiceSummary`, `documents.getRelatedDocuments`, `search.global`, `reports.*` reads; then write paths per domain.

### Inbox read matrix (`inbox.get` / `inbox.getById` → Rust)

| Concern | Rust Postgres | Notes |
|---------|---------------|--------|
| Pagination (`cursor`, `pageSize`) | Yes | Offset cursor like transactions list |
| `sort` / `order` | Yes | Matches Drizzle including inverted default `createdAt` when `order=desc` |
| `status`, `tab` (`all` / `other`) | Yes | |
| Blocklist (email/domain) | Yes | Preloaded per team |
| `q` search | Partial | ILIKE + numeric amount; no `fts` tsquery in Rust |
| List joins (account, transaction, `relatedCount`) | Yes | |
| Detail grouped primary + `relatedItems` | Yes | `getById` |
| Pending match `suggestion` + `suggestedTransaction` | Yes | `getById` |
| `inbox.search` | Partial | Unmatched-only + ILIKE/amount; no FTS tsquery or transaction-context re-rank / AI suggestions |
| `inbox.getByStatus`, `checkAttachments` | Yes | |
| Inbox mutations | No | Still Drizzle |

### Transactions list filter matrix (`transactions.get` → Rust)

| Filter | Rust Postgres | Notes |
|--------|---------------|--------|
| `q`, cursor, `pageSize`, `sort` | Yes | Phase 2b |
| `statuses`, `start`, `end` | Yes | Phase 2c |
| `categories`, `accounts`, `tags` | Yes | Phase 2d; category parent→child expansion |
| `exported`, `fulfilled` | Yes | Phase 2d; review tab uses both |
| `assignees` | Yes | Phase 2e |
| `attachments` (include/exclude) | Yes | Phase 2e; same semantics as fulfilled presence |
| `recurring` | Yes | Phase 2e; `all` → `recurring = true`, else frequency IN |
| `type` (income/expense) | Yes | Phase 2e; income uses revenue slug set |
| `manual` (include/exclude) | Yes | Phase 2e |
| `amountRange`, `amount` | Yes | Phase 2e; range respects `type`; amount supports gte/lte pair or exact IN |
| Row `attachments` / `tags` JSON | Yes | Phase 2e; `json_agg` subqueries |
| Full-text `q` (tsvector) | No | Rust uses ILIKE + exact amount; Drizzle fallback in dual only |
| `transactions.getReviewCount` | Yes | Phase 2e; mirrors `getTransactionsReadyForExportCount` |

Parallel (product hygiene): rsync Downloads → workspace for `apps/dashboard` + `packages/ui` only, per [UI frozen plan](./2026-09-28-backend-replace-ui-frozen-downloads.md).

---

## Related docs

- [Autopilot migration continuation](./2026-09-28-autopilot-migration-continuation.md) — standing authorization + slice loop
- [UI frozen / Downloads baseline](./2026-09-28-backend-replace-ui-frozen-downloads.md)
- [Enterprise strangler (archived)](./2026-09-28-enterprise-strangler-rust-migration.md) — superseded by this plan
- [Path A decision](./path-a-decision.md) — Vite clone as product UI remains deferred
- Temporary package: [`packages/replacement-backend/README.md`](../../packages/replacement-backend/README.md)
- Clone quick start: [`fintech/clone/README.md`](../../../clone/README.md)
