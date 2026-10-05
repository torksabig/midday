# Stage 4 — Residual Node surface (DC-STAGE4)

> **Status:** IN_PROGRESS → partial decommission (2026-10-04).  
> **Gate:** User one-shot **`decommission`** from [autopilot direct cutover](./2026-10-02-autopilot-direct-cutover.md).  
> **Policy:** Incremental safe teardown — do **not** delete all of `apps/api` while hybrids / STOP gates still have live dashboard callers.

## How to run now (local)

| Process | Port | Role |
|---------|------|------|
| Supabase (local) | `54321` | Auth + Postgres + vault storage |
| **clone** Axum API | `8787` | Durable product logic (cut-over screens) + vault `/files/*` + invoice stored PDF + document process/reprocess SQL + signed-url(s) |
| **apps/dashboard** | `3001` | Frozen UI — direct Rust via `NEXT_PUBLIC_RUST_API_URL` |
| **apps/api** (minimal Node) | `3003` | Residual tRPC (job enqueue hybrids) + invoice PDF entry `/files/download/invoice` (stored PDF→Rust; React-PDF drafts/receipts) + `/chat` + OAuth callbacks |

```bash
# 1) Clone API
cd ../clone && cargo run -p clone-api   # :8787
# Require: FILE_KEY_SECRET (same as Midday), SUPABASE_URL, SUPABASE_SECRET_KEY

# 2) Midday API (residual Node) — require replacement mode
cd apps/api
# MIDDAY_BACKEND_MODE=replacement
# REPLACEMENT_API_URL=http://127.0.0.1:8787
bun run dev                             # :3003

# 3) Dashboard
cd apps/dashboard
# NEXT_PUBLIC_RUST_API_URL=http://127.0.0.1:8787
# NEXT_PUBLIC_API_URL=http://localhost:3003
bun run dev                             # :3001
```

Cut-over screens hit Rust. Residual screens (billing, bank connect OAuth, invoice send, etc.) still hit `NEXT_PUBLIC_API_URL/trpc` (and invoice PDF `/files/download/invoice`, `/chat`).

## What Stage 4 removed vs kept

### Removed / retired (this decommission pass)

- **Dead-façade tRPC routers** (no live dashboard tRPC data callers; no jobs/worker callers): Drizzle legacy fallback deleted; procedures are **fail-closed** (delegate to Rust or error). AppRouter entries stay for React Query `queryKey` / `RouterOutputs` typing only.
  - `notifications`, `notificationSettings`
  - `tags`, `transactionTags`, `transactionCategories`
  - `documentTags`, `documentTagAssignments`
  - `institutions`
  - `reports`, `search`
  - `trackerEntries`, `trackerProjects`
  - `invoiceProducts`, `invoiceTemplate`
- Default `MIDDAY_BACKEND_MODE` → **`replacement`** (legacy dual/Drizzle no longer the default cutover path).
- Env/docs updated so the run path is **dashboard + clone + minimal Node**.

### Migrated off residual Node (2026-10-04 files/hybrid slice)

| Capability | Now |
|------------|-----|
| `GET /files/proxy`, `GET /files/download/file` | **Rust** (`clone` root routes) — dashboard uses `NEXT_PUBLIC_RUST_API_URL`; Node thins to forward-to-Rust |
| `documents.delete` | **Rust direct** — SQL + vault storage remove |
| `inbox.delete` / `deleteMany` | **Rust direct** — SQL + vault storage remove (storage errors logged, non-fatal) |
| `shortLinks.createForDocument` | **Rust direct** — signed URL + short_links insert |

### Migrated (2026-10-04 reprocess / signedUrls / invoice-data slice)

| Capability | Now |
|------------|-----|
| `documents.reprocessDocument` SQL | **Rust** `POST /api/v1/documents/{id}/reprocess` — dashboard → Rust; Node `enqueueProcessDocument` for job only |
| `documents.processDocument` SQL | **Rust** `POST /api/v1/documents/process` — unsupported → completed; dashboard enqueues supported via Node |
| `documents.signedUrls` | **Rust** `POST /api/v1/documents/signed-urls` — vault zip download |
| Invoice PDF **SQL** | **Rust** `GET /files/invoice-data` (fk+id or token) — Node `/files/download/invoice` only React-PDF renders |

### Migrated (2026-10-05 invoice stored PDF / signedUrl / enrich SQL)

| Capability | Now |
|------------|-----|
| Invoice PDF **stored vault bytes** | **Rust** `GET /files/download/invoice` when `file_path` set — Node entry still used by dashboard; forwards stored PDF, React-PDF only for drafts / receipts / missing vault object |
| `documents.signedUrl` | **Rust** `POST /api/v1/documents/signed-url` — single vault signed URL (batch already on Rust) |
| `customers.enrich` SQL | **Rust** `POST /api/v1/customers/{id}/start-enrichment` — Node only enqueues Trigger `enrich-customer` |

### Kept — residual Node (live dashboard tRPC or non-tRPC API)

#### Hybrid (Rust SQL may exist; Node owns side effects)

| Procedure | Why Node |
|-----------|----------|
| `documents.enqueueProcessDocument` (+ thin `reprocessDocument`/`processDocument` orchestrators) | process-document BullMQ jobs |
| `inbox.processAttachments` / `retryMatching` | Jobs |
| `team.invite` / `create` / `delete` | Trigger email / multi-table / delete-team job |
| `team.updateBaseCurrency` / `exportAllData` | Trigger jobs |
| `bankConnections.delete` | Trigger provider teardown |
| `oauthApplications.authorize` / `updateApprovalStatus` | Resend |
| `invoice.create` / `createFromTracker` / `cancelSchedule` / `remind` | Trigger send/schedule/PDF |
| `invoiceRecurring.create` / `update` / `pause` / `delete` | BullMQ + notifications |
| `customers.enrich` | Trigger enrich job only (SQL on Rust) |
| `inboxAccounts.sync` / `delete` | Trigger schedules |
| `transactionAttachments.processAttachment` | Jobs |
| `accounting.export` | Export job (+ provider HTTP gated) |
| `transactions.import` / `export` / `generateCsvMapping` | Jobs / AI |

#### STOP gates (do not invent cutover)

| Area | Live procedures |
|------|-----------------|
| Decrypt | `bankAccounts.getDetails`, `getWithPaymentInfo` |
| Encrypt | `bankConnections.create`, `addAccounts` |
| Live bank OAuth | `banking.plaid*`, `gocardless*`, `enablebanking*` (+ `getProviderAccounts`) |
| Inbox OAuth | `inboxAccounts.connect` |
| Composio | `connectors.*` |
| Stripe / Polar | `billing.*`, `invoicePayments.*` |
| Admin email | `user.delete`, `apiKeys.upsert` |
| Job status | `jobs.getStatus` |
| Invoice PDF **live render** | Node React-PDF for drafts / receipts / no `file_path` (`@midday/invoice`) |

#### Non-tRPC `apps/api` surfaces

- `POST /chat`
- `GET /files/download/invoice` (entry + React-PDF fallback; stored PDF + SQL on Rust)
- Gmail/Outlook OAuth redirect URIs on `:3003`

#### Internal non-dashboard tRPC

- `packages/jobs` / `apps/worker` → `trpc.banking.*` (sync/delete/reconnect/rates)

## Deferred full delete

Full deletion of `apps/api`, `packages/replacement-backend`, `packages/db` waits until:

1. Every §KEEP hybrid/STOP procedure is Rust-owned **or** explicitly retired with a migration note in product UX.
2. Invoice PDF **live render** (drafts/receipts React-PDF) + `/chat` + OAuth callbacks moved or replaced.
3. Jobs/worker no longer call Node tRPC banking.

Until then, `@midday/replacement-backend` remains for residual hybrid SQL delegation only.

## Migration notes (capability status)

| Capability | Status after Stage 4 invoice-stored-PDF slice |
|------------|----------------------------------------|
| Overview / tx / inbox reads / invoices SQL / tracker / reports / tags / categories | **Rust direct** |
| Vault proxy / vault file download | **Rust direct** |
| Vault delete / inbox delete / document short-link | **Rust direct** |
| Document reprocess / process SQL + signedUrls / signedUrl | **Rust direct** (job enqueue Node) |
| Invoice PDF SQL + stored vault PDF | **Rust**; Node React-PDF for drafts/receipts |
| `customers.enrich` SQL | **Rust**; Trigger job Node |
| Bank connect (Plaid/GC/EB) / decrypt account details | **Node** — STOP |
| Billing / Stripe invoice payments | **Node** — STOP |
| Invoice PDF live render (draft/receipt) | **Node** — STOP / non-tRPC |
| Invoice send / remind / recurring pause-delete | **Node** — hybrid |
| Team invite email / create team / delete team | **Node** — hybrid |

### Next recommended residual slice

1. **Invoice PDF live render** — port `@midday/invoice` React-PDF off Node (drafts/receipts), or generate receipts into vault so Rust can serve them too.  
2. Or next hybrid job orchestrator with a clean Rust SQL half (`invoice.remind` / `invoice.cancelSchedule` status SQL if separable).  
3. Or point dashboard invoice download URL at Rust when UI already knows `file_path` (skip Node hop for stored PDFs).

Do **not** silently remove STOP/hybrid without a replacement plan.
