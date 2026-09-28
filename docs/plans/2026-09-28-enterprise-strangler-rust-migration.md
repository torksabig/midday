# Enterprise strangler migration — Rust clone backend (façade-first)

> **Superseded by:** [**Clean Rust replacement — no permanent proxy**](./2026-09-28-clean-rust-replacement-no-proxy.md) (2026-09-28).  
> The approach below kept a long-lived `apps/api` façade, `@midday/replacement-backend`, and `MIDDAY_BACKEND_MODE` dual routing. The active strategy is **one Rust backend**, **temporary tRPC only**, and **delete legacy per domain**—not a permanent strangler bridge.

> **Archived reference** — historical façade-first strangler blueprint.  
> **Sibling backend:** `../clone` (Rust Axum). **UI baseline:** [Downloads / frozen UI plan](./2026-09-28-backend-replace-ui-frozen-downloads.md).

## Current state (2026-09-28)

This document is an **archived** strangler blueprint (ASCII architecture, Phases 1–5, checklist). For current execution, use the [clean replacement plan](./2026-09-28-clean-rust-replacement-no-proxy.md). It aligned with the [UI-frozen / Downloads baseline plan](./2026-09-28-backend-replace-ui-frozen-downloads.md) and extended the older [Midday stack replacement](./2026-09-28-midday-stack-replacement.md) outline. [Path A](./path-a-decision.md) (Vite clone as product UI) remains **deferred**; clone is the **replacement API** only.

### Already implemented in `fintech/midday`

| Area | Status |
|------|--------|
| **`@midday/replacement-backend`** | Package: mode config (`legacy` \| `dual` \| `replacement`), REST client, Zod-shaped mappers, demo bearer helper |
| **Observability** | `GET /api/replacement/status`, root `bun run dev:replacement-api`, env on `apps/api` + dashboard |
| **`user.me` / `team.current` delegation** | `apps/api` → `tryDelegateUserMe` / `tryDelegateTeamCurrent` when mode is `dual` \| `replacement`; legacy Drizzle fallback on error or missing token |
| **Auth for delegation today** | **`REPLACEMENT_DELEGATION_USE_DEMO`** / `REPLACEMENT_DELEGATION_TOKEN` — **not** forwarding Supabase session JWT with JWKS validation on Axum yet |
| **Verification** | `scripts/smoke-replacement-delegation.sh`, `apps/api/src/__tests__/trpc/user-replacement-delegation.test.ts`, mapper tests in `packages/replacement-backend` |
| **UI** | Frozen **by policy** per downloads plan; workspace dashboard still **diverges** from Downloads — baseline sync not complete |

### Immediate gap (Phase 1)

Implement **Supabase JWKS JWT validation** on the Rust API and pass the dashboard/API bearer through delegation instead of demo-only tokens. See [Phase 1](#phase-1-identity--authorization-foundation-weeks-12) below.

---

This is a classic enterprise migration scenario: **a high-velocity strangler fig architecture** where the Next.js frontend remains completely untouched, consuming the exact same `@midday/api/trpc/routers/_app` type contracts, while the implementation underneath shifts from Node/Drizzle/Postgres to Rust (Axum/SQLx/SQLite or Postgres).

Here is the comprehensive, production-grade migration plan to strangle `apps/api` and `packages/*` into your Rust backend (`fintech/clone`).

---

## 1. Architectural Strategy & Phasing Summary

To execute this without breaking UI stability, we use a **Façade-First Strangler Pattern**.

```
                                  +--------------------------------------+
                                  |        Next.js Dashboard (:3001)     |
                                  +------------------+-------------------+
                                                     |
                                                     | tRPC / Session Bearer
                                                     v
                                  +--------------------------------------+
                                  |      apps/api Hono + tRPC (:3003)    |
                                  |            (Thin Adapter)            |
                                  +--------+--------------------+--------+
                                           |                    |
                  MIDDAY_BACKEND_MODE=dual |                    | MIDDAY_BACKEND_MODE=legacy
                       (Selective Domain)  v                    v
                  +--------------------------------+  +------------------+
                  |  @midday/replacement-backend   |  |   Drizzle / DB   |
                  +---------------+----------------+  +------------------+
                                  | Internal REST/gRPC
                                  v
                  +--------------------------------+
                  |  Rust Axum Clone API (:8787)   |
                  +---------------+----------------+
                                  |
                                  v
                  +--------------------------------+
                  |        Rust Domain Core        |
                  |  (Auth, DB, Sync, Connectors)  |
                  +--------------------------------+

```

---

## Phase 1: Identity & Authorization Foundation (Weeks 1–2)

Before migrating high-volume business logic (transactions, banking), you must bridge identity. Currently, Supabase handles session cookies and issues JWTs via GoTrue (`:54321`). The Rust API must accept and validate these exact claims.

### 1. Unified Claims & Middleware Verification

Implement a Rust JWT validation layer in Axum using `jsonwebtoken` (or JWKS-aware crates) pointing to Supabase’s local JWKS (`http://localhost:54321/auth/v1/.well-known/jwks.json`).

```rust
// fintech/clone/crates/api/src/auth/jwt.rs (target layout)
use axum::{
    extract::FromRequestParts,
    http::{request::Parts, StatusCode},
};
use jsonwebtoken::{decode, decode_header, DecodingKey, Validation};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct SupabaseClaims {
    pub sub: String,       // User ID
    pub email: String,
    pub role: String,
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

        let token = auth_header.trim_start_matches("Bearer ");
        let claims = validate_supabase_jwt(token).map_err(|_| {
            (StatusCode::UNAUTHORIZED, "Invalid or expired token")
        })?;

        Ok(AuthenticatedUser(claims))
    }
}
```

### 2. Tenant Context Injection

Extract the active `team_id` from incoming request headers or path params to match Hono’s `ctx.teamId`. Require this context across all Axum handlers to preserve Midday’s strict team isolation.

---

## Phase 2: Domain Migration Blueprint (Weeks 3–8)

Migrate tRPC routers by functional complexity. Move from **Low-Risk/Read-Heavy** to **State-Mutation/Integrations**.

```
    [Phase 2.1]             [Phase 2.2]             [Phase 2.3]            [Phase 2.4]
  Read-Only Core        Document & Inbox         Transactions &         Async Workers &
   (User / Team)          (Blob + OCR)               Banking           External Connectors
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌──────────────────┐
│  • user.me      │───>│  • documents.*  │───>│  • transactions │───>│  • apps/worker   │
│  • team.current │    │  • inbox.*      │    │  • metrics      │    │  • bank sync     │
│  • insights     │    │  • exports      │    │  • categorization│   │  • notifications │
└─────────────────┘    └─────────────────┘    └─────────────────┘    └──────────────────┘

```

### Strategy for Each Domain Conversion

For every tRPC router (e.g., `transactions`):

1. **Rust API Implementation:** Replicate the endpoints in `fintech/clone` (Axum + SQLx).
2. **Contract Validation:** Create a shared schema validator in `@midday/replacement-backend` using Zod to guarantee the Rust JSON response perfectly satisfies the tRPC procedure's return type.
3. **Toggle Feature Flag:** Route the Hono procedure to `@midday/replacement-backend`.

#### Example: Routing `transactions.list`

```typescript
// apps/api/src/trpc/routers/transactions.ts
import { replacementBackend } from "@midday/replacement-backend";
import { router, protectedProcedure } from "../trpc";
import { z } from "zod";

export const transactionsRouter = router({
  list: protectedProcedure
    .input(z.object({ limit: z.number().default(50), offset: z.number().default(0) }))
    .query(async ({ ctx, input }) => {
      if (process.env.MIDDAY_BACKEND_MODE === "dual" || process.env.MIDDAY_BACKEND_MODE === "replacement") {
        try {
          return await replacementBackend.transactions.list({
            token: ctx.token,
            teamId: ctx.teamId,
            ...input,
          });
        } catch (error) {
          if (process.env.MIDDAY_BACKEND_MODE === "replacement") throw error;
          // Fall back to legacy if in dual/shadow testing mode
          console.warn("Replacement backend failed, falling back to legacy Postgres", error);
        }
      }

      // Legacy fallback logic via Drizzle
      return ctx.db.query.transactions.findMany({
        where: eq(transactions.teamId, ctx.teamId),
        limit: input.limit,
        offset: input.offset,
      });
    }),
});

```

---

## Phase 3: Data Migration & Storage Decoupling (Weeks 6–10)

Moving from dual-writes to a complete Rust cutover requires a deterministic data sync pipeline.

### Data Synchronization Flow

```
                                  ┌────────────────────────┐
                                  │ Legacy Postgres DB     │
                                  │ (Supabase :54322)      │
                                  └───────────┬────────────┘
                                              │
                                              │ CDC / Debezium / PgOutput
                                              v
                                  ┌────────────────────────┐
                                  │   Kafka / NATS JetStream│
                                  └───────────┬────────────┘
                                              │
                                              │ Rust Ingestion Consumer
                                              v
                                  ┌────────────────────────┐
                                  │ Target DB              │
                                  │ (Rust SQLite/Postgres) │
                                  └────────────────────────┘

```

1. **Shadow Reads & Differential Auditing:**
Enable shadow execution mode in `@midday/replacement-backend`. Route requests to **both** legacy and Rust concurrently, compare outputs, and log divergence metrics (without blocking the UI response).
2. **CDC (Change Data Capture) Pipeline:**
Stream Postgres WAL changes to the Rust data store via a light sync service to ensure parity during the migration window.
3. **Schema Normalization:**
Map legacy snake_case SQL tables to idiomatic Rust structs via `sqlx::FromRow`.

---

## Phase 4: Async Processing & Background Workers (Weeks 9–11)

`apps/worker` handles asynchronous banking syncs, invoice parsing, and email indexing via BullMQ/Redis and Trigger.dev.

1. **Queue Interoperability:**
Replace NodeJS BullMQ producers with Redis-compatible queue structures in Rust using `sidekiq-rs` or custom Redis stream consumers.
2. **Bank Connector Encapsulation:**
Isolate bank connections (Plaid, Teller, GoCardless) behind a Rust trait:

```rust
#[async_trait::async_trait]
pub trait BankConnector: Send + Sync {
    async fn fetch_transactions(
        &self,
        access_token: &str,
        since: chrono::DateTime<chrono::Utc>,
    ) -> Result<Vec<BankTransaction>, ConnectorError>;
}
```

---

## Phase 5: Final Cutover & Legacy Decommissioning (Week 12)

Once all 40+ tRPC routers delegate entirely to the Rust clone with zero fallback errors:

1. **Adapter Minimization:** `apps/api` transitions from orchestration engine to a thin proxy layer that maps incoming HTTP/tRPC calls directly to Axum endpoints.
2. **Schema Lock:** Mark legacy Postgres tables as `READ ONLY`.
3. **Drizzle Removal:** Remove `packages/db` and Drizzle dependencies from `apps/api/package.json`.
4. **Final Monorepo Structure:**

```text
apps/
  dashboard/              <-- Unchanged Next.js frontend
  api/                    <-- Lightweight tRPC adapter pointing to Rust
packages/
  ui/                     <-- Shared design components
  replacement-backend/    <-- TypeScript SDK calling Axum
fintech/clone/            <-- Rust Axum API (New primary backend)

```

---

## Implementation Checklist

Status reflects **`fintech/midday`** workspace on branch `cursor/backend-replace-ui-frozen-plans` (2026-09-28).

| Task | Target Domain | Status |
| --- | --- | --- |
| **`@midday/replacement-backend` + dual-mode env** | Infra | ✅ Done (`packages/replacement-backend`, `.env-example`, `dev:replacement-api`, status route) |
| **JWKS middleware verification** | `fintech/clone` | ⬜ Planned — no Supabase JWKS validator in clone yet |
| **`user.me` & `team.current` delegation** | Auth / Core | 🟡 Partial — Hono + mappers + tests + smoke; **demo/replacement JWT only**, not session passthrough |
| **`transactions` router cutover** | Finance core | 🟡 Partial — list/getById/reviewCount + categories/bankAccounts reads delegated |
| **`inbox` & `documents` router cutover** | Documents | 🟡 Partial — `inbox.get` + `inbox.getById` read delegation; mutations/search still Drizzle |
| **`packages/jobs` Rust consumer pipeline** | Async queue | ⬜ Planned |
| **Shadow read verification pipeline** | Infra | ⬜ Planned |
| **Drizzle / legacy Postgres decommission** | Infra | ⬜ Planned |
| **UI sync to Downloads baseline** | UI (frozen) | ⬜ Planned — policy locked; tree not yet byte-synced |

---

## Related docs

- **Current canonical plan:** [Clean Rust replacement — no permanent proxy](./2026-09-28-clean-rust-replacement-no-proxy.md)
- [Backend replace, UI frozen (Downloads)](./2026-09-28-backend-replace-ui-frozen-downloads.md)
- [Midday stack replacement (deferred outline)](./2026-09-28-midday-stack-replacement.md)
- [Path A decision](./path-a-decision.md)
- Package wiring: [`packages/replacement-backend/README.md`](../../packages/replacement-backend/README.md)
