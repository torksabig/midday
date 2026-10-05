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
| **apps/api** (minimal Node) | `3003` | Residual tRPC (job enqueue hybrids) + invoice PDF React-PDF fallback `/files/download/invoice` (drafts/receipts) + `/chat` + OAuth callbacks |

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

Cut-over screens hit Rust. Residual screens (billing, bank connect OAuth, invoice send, etc.) still hit `NEXT_PUBLIC_API_URL/trpc` (and draft/receipt invoice PDF `/files/download/invoice`, `/chat`). Stored invoice PDFs use Rust when the UI already has `file_path`.

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

### Migrated (2026-10-05 stored-PDF hop skip / schedule hybrid SQL)

| Capability | Now |
|------------|-----|
| Invoice download when UI has `file_path` | **Rust direct** — dashboard `getInvoiceDownloadApiUrl({ filePath })` skips Node; drafts/receipts still Node |
| `invoice.remind` SQL | **Rust** `PUT /api/v1/invoices/{id}` (`reminderSentAt`) — Node only Trigger `send-invoice-reminder` |
| `invoice.cancelSchedule` / `updateSchedule` / create-schedule read+status SQL | **Rust** get-by-id + PUT (clear/set schedule fields) — Node only BullMQ job create/remove |
| Node `/files/download/invoice` | Still React-PDF fallback + forward stored PDF for callers without `file_path` |

### Migrated (2026-10-05 blind downloads / create status SQL)

| Capability | Now |
|------------|-----|
| Blind invoice downloads (portal token, zip, toolbar, customer/email previews) | **Rust first** via `fetchInvoicePdfBlob` / `downloadInvoicePdf`; **Node** on `no_stored_pdf` / `needs_render` / Rust down |
| MCP `pdfUrl` when `filePath` set | **Rust**; drafts without stored PDF stay Node URL; `download=true` tries Rust bytes then React-PDF |
| `invoice.create` status writes (`unpaid` / `scheduled`) | **Rust** `PUT` via `tryDelegateInvoiceUpdate` (already); Trigger/BullMQ/PDF job Node |
| `invoice.createFromTracker` draft insert | **Rust** via `tryDelegateInvoiceDraft` (already); tracker aggregation Node |
| Receipts (`type=receipt`) | **Node** React-PDF (STOP) |

### Migrated (2026-10-05 invite + recurring SQL hybrid harden)

| Capability | Now |
|------------|-----|
| `team.invite` SQL insert | **Rust** `POST /api/v1/team/invites` — Node only Trigger `invite-team-members` (Resend) |
| `invoiceRecurring.pause` / `delete` SQL | **Rust** pause/delete (+ `jobIds`); Node only BullMQ job remove |
| `invoiceRecurring.resume` | **Rust direct** (dashboard already; no BullMQ) |
| `invoiceRecurring.create` / `update` SQL | **Rust** create/update (+ customer get + invoice issue_date on create); Node notifications / email validation orchestration |
| OpenAPI | pause/delete/create/update documented for Midday hybrid callers |

### Kept — residual Node (live dashboard tRPC or non-tRPC API)

#### Hybrid (Rust SQL may exist; Node owns side effects)

| Procedure | Why Node |
|-----------|----------|
| `documents.enqueueProcessDocument` (+ thin `reprocessDocument`/`processDocument` orchestrators) | process-document BullMQ jobs |
| `inbox.processAttachments` / `retryMatching` | Jobs |
| `team.invite` | Trigger email only (SQL on Rust) |
| `team.create` / `delete` | multi-table / delete-team job |
| `team.updateBaseCurrency` / `exportAllData` | Trigger jobs |
| `bankConnections.delete` | Trigger provider teardown |
| `oauthApplications.authorize` / `updateApprovalStatus` | Resend |
| `invoice.create` / `createFromTracker` | Trigger send/schedule/PDF job only (status/draft SQL on Rust) |
| `invoice.cancelSchedule` / `remind` / `updateSchedule` | Trigger/BullMQ only (SQL on Rust) |
| `invoiceRecurring.create` / `update` / `pause` / `delete` | BullMQ + notifications only (SQL on Rust; resume direct) |
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
- `GET /files/download/invoice` (React-PDF fallback for drafts/receipts/`no_stored_pdf`; dashboard blind downloads try Rust first)
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

| Capability | Status after Stage 4 invite / recurring-SQL slice |
|------------|----------------------------------------|
| Overview / tx / inbox reads / invoices SQL / tracker / reports / tags / categories | **Rust direct** |
| Vault proxy / vault file download | **Rust direct** |
| Vault delete / inbox delete / document short-link | **Rust direct** |
| Document reprocess / process SQL + signedUrls / signedUrl | **Rust direct** (job enqueue Node) |
| Invoice PDF SQL + stored vault PDF | **Rust**; known `file_path` skips Node; blind downloads Rust→Node fallback |
| `invoice.remind` / `cancelSchedule` / schedule / create status SQL | **Rust**; Trigger/BullMQ Node |
| `team.invite` SQL | **Rust**; Trigger Resend Node |
| `invoiceRecurring` create/update/pause/delete SQL | **Rust**; BullMQ + notifications Node; resume direct |
| `customers.enrich` SQL | **Rust**; Trigger job Node |
| Bank connect (Plaid/GC/EB) / decrypt account details | **Node** — STOP |
| Billing / Stripe invoice payments | **Node** — STOP |
| Invoice PDF live render (draft/receipt) | **Node** — STOP / non-tRPC |
| Invoice send / create Trigger | **Node** — hybrid |
| Team create / delete team | **Node** — hybrid |

### Next recommended residual slice

1. **`team.create` / `team.delete` SQL vs Trigger/delete-team job** — if prep/create tables are separable like invite.  
2. Or **`bankConnections.delete` SQL** (already delegated) document + harden; Trigger `delete-connection` stays Node.  
3. Or **Invoice PDF live render** — port `@midday/invoice` React-PDF off Node (drafts/receipts), or generate receipts into vault (larger STOP gate).

Do **not** silently remove STOP/hybrid without a replacement plan.
