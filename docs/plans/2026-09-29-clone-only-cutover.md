# Clone-only cutover (dashboard + Rust API as one codebase)

**Date:** 2026-09-29  
**Branch:** `cursor/backend-replace-ui-frozen-plans`  
**Repos:** Midday (this repo) + sibling `fintech/clone` (Axum `:8787`)  
**Related:** [Delegation inventory](./2026-09-28-delegation-inventory.md), [Clean Rust replacement](./2026-09-28-clean-rust-replacement-no-proxy.md), [UI frozen downloads](./2026-09-28-backend-replace-ui-frozen-downloads.md)

This plan describes how the **frozen Midday dashboard** and the **Rust clone** become one product codebase later. It does **not** schedule deletion of `apps/api`, `packages/db`, or `packages/replacement-backend`.

---

## Non-goals (this document)

- No code deletion or decommission PRs.
- No dashboard UI, route, or styling changes.
- No Vite `apps/web` (or clone frontend) as the product UI — product UI stays `apps/dashboard`.
- No live Stripe / Fortnox / Xero / QuickBooks / bank OAuth calls, no bank-token decryption exercises, no user deletion, no outbound email as part of proving cutover stages.
- No inventing sessions for automation; authenticated checks require a real logged-in dashboard user.

---

## Current shape (2026-09-29)

```
Browser / apps/dashboard (:3001)
        │  tRPC (same AppRouter types)
        ▼
apps/api (:3003)  ← MIDDAY_BACKEND_MODE=dual|replacement|legacy
        │
        ├─ shouldDelegateToReplacementBackend() → HTTP to clone REST (:8787)
        │     (SQL-shaped reads/writes that already have a Rust handler)
        │
        └─ no delegation branch → Node path always
              (Drizzle, jobs, Stripe/Polar, accounting SDKs, decrypt, email, …)
```

| Process | Port | Role |
| --- | --- | --- |
| `clone-api` | `8787` | Standalone Rust REST (`/api/v1/*`) |
| Midday `apps/api` | `3003` | tRPC façade + gated provider/job code |
| `apps/dashboard` | `3001` | Frozen product UI |
| Postgres (via tunnel) | `54322` | Shared DB |

`shouldDelegateToReplacementBackend()` is true when `MIDDAY_BACKEND_MODE` is `dual` **or** `replacement` (`packages/replacement-backend/src/config.ts`). Delegation is **opt-in per procedure**: if a handler has no `if (shouldDelegateToReplacementBackend())` branch, it runs Node code even when mode is `replacement`.

### Why the dashboard must keep calling `apps/api`

1. The dashboard is typed against **tRPC `AppRouter`**, not clone REST.
2. Many procedures still have **no** Rust equivalent (or only partial SQL with Node side effects).
3. Gated provider flows (bank decrypt, invoice PDF/email jobs, Stripe Connect, Polar billing, accounting export jobs, account deletion) are intentionally **Node-only** today.
4. Until either (a) every procedure the UI calls exists on the clone with **identical JSON shapes**, or (b) a thin BFF still speaks tRPC, pointing the dashboard at `:8787` would break the product.

“Clone works with the frontend” means: **same tRPC/JSON response shapes, same dashboard routes, no visual change** — whether the data came from Rust via the façade or still from Node.

---

## Test baseline (read-only / health) — 2026-09-29

Stack reused in place (nothing killed, no second copy started). Mode on Midday API process: `MIDDAY_BACKEND_MODE=dual`, `REPLACEMENT_API_URL=http://127.0.0.1:8787`.

| Check | Result |
| --- | --- |
| `GET http://127.0.0.1:8787/api/v1/health` | **pass** — `{"ok":true}` HTTP 200 |
| `GET http://127.0.0.1:3003/health` | **pass** — `{"status":"ok"}` HTTP 200 |
| `scripts/smoke-replacement-delegation.sh` | **pass** — health + demo login + `/auth/me` + `/team/current` |
| `scripts/smoke-phase1-session.sh` | **skipped** — needs `SUPABASE_ACCESS_TOKEN` / logged-in user JWT |

### Unauthenticated clone probes

| Route | Result | Notes |
| --- | --- | --- |
| `/api/v1/health` | pass | public |
| `/api/v1/auth/me` | expected 401 | missing Authorization |
| `/api/v1/transactions` | expected 401 | auth required |
| `/api/v1/invoices` | expected 401 | auth required |
| `/api/v1/customers` | expected 401 | auth required |
| `/api/v1/inbox` | expected 401 | auth required |
| `/api/v1/documents` | 404 | no public/list route at this path (or different shape) |
| `/health`, `/api/v1/version` | 404 | not exposed |

### Needs a logged-in dashboard user

- Real Supabase session JWT against clone + Midday Postgres (`smoke-phase1-session.sh`).
- Click-through Stage 1 checklist below (transactions, invoices list, customers, inbox, documents status) with `dual` / later `replacement`.
- Any gated façade pass (bank details reveal, invoice send/PDF download, accounting export, Stripe Connect status, Polar portal) — **observe UI only**; do not drive live provider mutations in automation.

---

## Ungated procedures (still Node even when mode is `replacement`)

Confirmed from router source (no `shouldDelegateToReplacementBackend` branch on the procedure body, or entire router has no import).

### Explicitly gated / keep-on-façade (priority)

| Procedure | Why Node stays |
| --- | --- |
| `bankAccounts.getDetails` | Calls `getBankAccountDetails` → **decrypt** IBAN / account number (`packages/db`) |
| `bankAccounts.getWithPaymentInfo` | Same decrypt path for invoice payment slash command |
| `user.delete` | Supabase admin `deleteUser` + Resend contact remove + DB delete — **must never run in cutover tests** |
| `invoice.create` (side effect) | SQL update may delegate; **`generate-invoice` job always Node** (PDF + `create_and_send` email) |
| `invoice.remind` | Enqueues `send-invoice-reminder` in Node; SQL touch may delegate |
| `billing.*` (all) | Entire `billing` router — Polar checkout/orders/portal/cancel; no delegation import |
| `invoicePayments.*` (all) | Stripe Connect status / OAuth URL / disconnect / refund — no delegation |
| `accounting.export` | App lookup may delegate; **`export-to-accounting` job always Node** |
| `accounting.getAccounts` | Live provider SDK (`getAccountingProvider`) — no delegation |

### Other routers / procedures with no delegation branch

Full routers without `shouldDelegateToReplacementBackend`:

- `banking.*` — Plaid / GoCardless / Enable Banking OAuth link+exchange
- `connectors.*` — Composio list / authorize / disconnect
- `jobs.getStatus`

Partial (router imports helper, but these procedures skip it):

- `apiKeys.upsert` (email side effect)
- `bankConnections.create`, `bankConnections.addAccounts` (encrypt)
- `documents.signedUrl`, `documents.signedUrls`
- `inboxAccounts.connect`, `inboxAccounts.exchangeCodeForAccount`
- `inbox.processAttachments`
- `team.updateBaseCurrency`, `team.exportAllData`
- `transactionAttachments.processAttachment`
- `transactions.export`, `transactions.generateCsvMapping`

See [delegation inventory](./2026-09-28-delegation-inventory.md) for the full yes/no matrix.

---

## Stages to a single codebase

Target layout (later, not this task): **`apps/dashboard` + clone API + `packages/ui`** (and shared types). `apps/api` remains the tRPC façade until Stages 1–4 pass.

### Stage 1 — Prove `replacement` on migrated screens

**Goal:** With mode `dual` first (then a **local** `replacement` trial), delegated screens return correct data through tRPC.

**User click checklist (same team, same DB):**

1. **Transactions** — list loads, open one row, filters work.
2. **Invoices list** — list loads; open draft/detail without sending.
3. **Customers** — list + open one customer.
4. **Inbox** — list/status loads; no forced provider reconnect.
5. **Documents** — status/list loads; skip signed-URL edge cases if they fail independently.

**Exit checks:**

- [ ] Each screen above works under `MIDDAY_BACKEND_MODE=dual`.
- [ ] Same five screens work under a **local** `MIDDAY_BACKEND_MODE=replacement` trial (façade still on `:3003`).
- [ ] No dashboard UI/route changes required to pass.
- [ ] Failures are filed as missing clone handlers or shape mismatches — not fixed by pointing the browser at `:8787`.

### Stage 2 — Keep gated flows working through the façade

**Goal:** Provider / decrypt / job / billing paths still succeed via Node while SQL may already be on Rust.

| Flow | Pass condition (manual; no live abuse) |
| --- | --- |
| Bank details | UI “reveal” calls `bankAccounts.getDetails`; response still comes from Node decrypt; **do not** add clone decrypt in this stage |
| Invoice email | Finalize with send uses Node `generate-invoice` / mail; invoice row still consistent in UI |
| Invoice PDF | Download/preview still served by existing Node/job/storage path |
| Accounting export | `accounting.export` enqueues Node job; UI shows in-progress/complete without requiring clone export |
| Stripe | `invoicePayments.stripeStatus` / Connect UI still answered by Node (no need to complete OAuth in test) |
| Account deletion | Control remains Node-only; **do not execute** in cutover verification — pass = code path still ungated and behind confirm UI |

**Exit checks:**

- [ ] Each gated procedure above still has **no** silent “delegate and drop side effect” path.
- [ ] `replacement` mode does not 500 those screens when SQL is delegated but jobs stay Node.
- [ ] Inventory of ungated procedures is reviewed and still accurate.

### Stage 3 — Switch default from `dual` to `replacement`

**Goal:** Local/dev default (and later deploy config) prefers clone for all **delegated** procedures.

**Exit checks:**

- [ ] Stages 1–2 pass on the target environment.
- [ ] `MIDDAY_BACKEND_MODE=replacement` is the documented default for the dual-stack setup.
- [ ] Rollback to `dual` or `legacy` remains a config flip (façade + packages kept).
- [ ] Monitoring/smoke: health on `:8787` and `:3003` plus Stage 1 click checklist.

### Stage 4 — Reimplement or consciously retire each gated provider in the clone

One provider/domain at a time (order is negotiable; each needs its own PR series):

1. Bank decrypt / payment-info reads (or product decision to stop exposing decrypt).
2. Invoice PDF generation + send/reminder jobs.
3. Accounting export + `getAccounts` (or retire Fortnox/Xero/QuickBooks).
4. Stripe Connect / invoice payments.
5. Polar billing (or retire wind-down endpoints).
6. Bank OAuth connectors (`banking.*`).
7. Account deletion (Supabase admin + email) — last and with extreme care.

**Exit checks per domain:**

- [ ] Clone implements the behavior **or** product explicitly retires it.
- [ ] tRPC procedure either delegates fully (including side effects) **or** is removed from the UI with a deliberate UX decision.
- [ ] JSON shapes match dashboard expectations (no UI rewrite).

### Stage 5 — Decommission Node (later; not scheduled here)

Only after Stage 4 domains pass:

- Dashboard talks to clone (native client or remaining thin tRPC BFF).
- Then — and only then — consider removing `apps/api` / Drizzle usage.

**This document does not schedule deletion.** Keeping `apps/api`, `packages/db`, and `packages/replacement-backend` is required through Stages 1–4.

---

## Single-codebase definition of done

| Piece | Required |
| --- | --- |
| UI | `apps/dashboard` + `packages/ui` — frozen look/routes |
| API | Clone Axum as system of record for business logic |
| Contract | Same procedure names / JSON shapes the dashboard already uses |
| Cutover aid | Façade + `MIDDAY_BACKEND_MODE` until Stage 5 |

---

## Immediate next actions (safe)

1. Keep dual stack running; re-run health + `smoke-replacement-delegation.sh` after clone changes.
2. With a real dashboard session, run Stage 1 checklist under `dual`, then a local `replacement` trial.
3. Extend clone handlers only for Stage 1 gaps; leave gated procedures on Node until Stage 4.
4. Update [delegation inventory](./2026-09-28-delegation-inventory.md) when a procedure gains or loses a branch.
