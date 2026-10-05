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

### Migrated (2026-10-05 team create/delete SQL hybrid)

| Capability | Now |
|------------|-----|
| `team.create` SQL | **Rust direct** — dashboard `POST /api/v1/team/create` with `@midday/categories` tax seed in browser; Node tRPC `team.create` retained for non-dashboard callers |
| `team.delete` prep + delete SQL | **Rust direct** — dashboard `POST /team/delete-prep` → Node `team.enqueueDeleteTeamJob` (BullMQ `delete-team`) → `POST /team/delete`; full `team.delete` tRPC retained for CLI/tests |
| `bankConnections.delete` SQL | **Rust** `DELETE /api/v1/bank-connections/{id}` (already delegated); Node only Trigger `delete-connection` — documented in OpenAPI + router |

### Migrated (2026-10-05 team invite dashboard hybrid)

| Capability | Now |
|------------|-----|
| `team.invite` SQL insert | **Rust direct** — dashboard `POST /api/v1/team/invites` → Node `team.enqueueInviteTeamEmails` (Trigger `invite-team-members` / Resend only); full `team.invite` tRPC retained for non-dashboard callers |

### Migrated (2026-10-05 team base currency + export job hybrids)

| Capability | Now |
|------------|-----|
| `team.updateBaseCurrency` team row SQL | **Rust direct** — dashboard `PUT /api/v1/team` (`baseCurrency` via `useTeamMutation`) before recalc; Node `team.enqueueUpdateBaseCurrency` (BullMQ `update-base-currency` only); full `team.updateBaseCurrency` tRPC retained for non-dashboard callers |
| `team.exportAllData` | **Node job-only** — dashboard `team.enqueueExportAllData` (BullMQ `export-team-data`); no team SQL on Node; full `team.exportAllData` tRPC retained for non-dashboard callers |

### Migrated (2026-10-05 inbox account sync/delete hybrids)

| Capability | Now |
|------------|-----|
| `inboxAccounts.delete` SQL | **Rust direct** — dashboard `DELETE /api/v1/inbox-accounts/{id}` → Node `inboxAccounts.enqueueDeleteInboxAccountSchedule` (Trigger `schedules.del` only); full `inboxAccounts.delete` tRPC retained for non-dashboard callers |
| `inboxAccounts.sync` row read SQL | **Rust direct** — dashboard `GET /api/v1/inbox-accounts/{id}` → Node `inboxAccounts.enqueueSyncInboxAccount` (Trigger `sync-inbox-account` only); full `inboxAccounts.sync` tRPC retained for non-dashboard callers |

### Migrated (2026-10-05 OAuth authorize / approval-status hybrids)

| Capability | Now |
|------------|-----|
| `oauthApplications.authorize` SQL | **Rust direct** — dashboard `POST /api/v1/oauth-applications/authorize` → Node `oauthApplications.enqueueOAuthAppInstalledEmail` (Resend only); full `oauthApplications.authorize` tRPC retained for non-dashboard callers |
| `oauthApplications.updateApprovalStatus` SQL | **Rust direct** — dashboard `POST /api/v1/oauth-applications/{id}/approval-status` → Node `oauthApplications.enqueueOAuthApprovalReviewEmail` when status is `pending` (Resend only); full tRPC retained for non-dashboard callers |

### Migrated (2026-10-05 inbox / transaction attachment job hybrids)

| Capability | Now |
|------------|-----|
| `inbox.processAttachments` | **Node job-only** — dashboard Rust `POST /api/v1/inbox` (create row) → Node `inbox.enqueueProcessAttachments` (BullMQ `process-attachment` + optional `inbox_new` notification); full `processAttachments` tRPC retained for non-dashboard callers |
| `inbox.retryMatching` | **Node job-only** — dashboard `inbox.enqueueRetryMatching` (BullMQ `batch-process-matching`); full `retryMatching` tRPC retained for non-dashboard callers |
| `transactionAttachments.processAttachment` | **Node job-only** — dashboard Rust `POST /api/v1/transaction-attachments` → Node `transactionAttachments.enqueueProcessTransactionAttachments` (BullMQ `process-transaction-attachment`); full `processAttachment` tRPC retained for non-dashboard callers |

### Migrated (2026-10-05 transactions import / export hybrids)

| Capability | Now |
|------------|-----|
| `transactions.export` | **Node job-only** — dashboard `transactions.enqueueExportTransactions` (BullMQ `export-transactions`); full `export` tRPC retained for non-dashboard callers (MCP, etc.) |
| `transactions.import` manual account SQL | **Rust direct** — dashboard `GET/PUT /api/v1/bank-accounts/{id}` via `prepareManualBankAccountForImport` → Node `transactions.enqueueImportTransactions` (BullMQ `import-transactions`); full `import` tRPC retained for non-dashboard callers |
| `transactions.generateCsvMapping` | **Node AI** — dashboard still uses tRPC (Claude Haiku); no Rust SQL |

### Migrated (2026-10-05 accounting export hybrid)

| Capability | Now |
|------------|-----|
| `accounting.export` | **Node job-only** — dashboard Rust GET `/api/v1/apps/{app_id}` via `prepareAccountingProviderForExport` → Node `accounting.enqueueExportToAccounting` (BullMQ `export-to-accounting`); full `export` tRPC retained for non-dashboard callers |

### Kept — residual Node (live dashboard tRPC or non-tRPC API)

#### Hybrid (Rust SQL may exist; Node owns side effects)

| Procedure | Why Node |
|-----------|----------|
| `documents.enqueueProcessDocument` (+ thin `reprocessDocument`/`processDocument` orchestrators) | process-document BullMQ jobs |
| `inbox.enqueueProcessAttachments` / `enqueueRetryMatching` | BullMQ process-attachment / batch-process-matching only (inbox SQL on Rust) |
| `inbox.processAttachments` / `retryMatching` (tRPC) | Non-dashboard callers; dashboard uses enqueue* |
| `team.enqueueInviteTeamEmails` | Trigger `invite-team-members` / Resend only (SQL on Rust) |
| `team.enqueueDeleteTeamJob` | BullMQ `delete-team` provider teardown only (SQL on Rust) |
| `team.enqueueUpdateBaseCurrency` | BullMQ `update-base-currency` only (team row SQL on Rust) |
| `team.enqueueExportAllData` | BullMQ `export-team-data` only (no team SQL) |
| `inboxAccounts.enqueueDeleteInboxAccountSchedule` | Trigger `schedules.del` only (SQL on Rust) |
| `inboxAccounts.enqueueSyncInboxAccount` | Trigger `sync-inbox-account` only (row read on Rust) |
| `oauthApplications.enqueueOAuthAppInstalledEmail` | Resend install email only (auth-code SQL on Rust) |
| `oauthApplications.enqueueOAuthApprovalReviewEmail` | Resend review email only (status SQL on Rust) |
| `team.invite` / `team.create` / `team.delete` (tRPC) | Non-dashboard callers; dashboard skips SQL hop |
| `team.updateBaseCurrency` / `exportAllData` (tRPC) | Non-dashboard callers; dashboard uses enqueue* |
| `bankConnections.delete` | Trigger `delete-connection` only (SQL on Rust) |
| `oauthApplications.authorize` / `updateApprovalStatus` (tRPC) | Non-dashboard callers; dashboard uses Rust + enqueue* |
| `invoice.create` / `createFromTracker` | Trigger send/schedule/PDF job only (status/draft SQL on Rust) |
| `invoice.cancelSchedule` / `remind` / `updateSchedule` | Trigger/BullMQ only (SQL on Rust) |
| `invoiceRecurring.create` / `update` / `pause` / `delete` | BullMQ + notifications only (SQL on Rust; resume direct) |
| `customers.enrich` | Trigger enrich job only (SQL on Rust) |
| `inboxAccounts.sync` / `delete` (tRPC) | Non-dashboard callers; dashboard uses enqueue* |
| `transactionAttachments.enqueueProcessTransactionAttachments` | BullMQ `process-transaction-attachment` only (rows on Rust) |
| `transactionAttachments.processAttachment` (tRPC) | Non-dashboard callers; dashboard uses enqueue* |
| `transactions.enqueueExportTransactions` | BullMQ `export-transactions` only (no SQL) |
| `transactions.enqueueImportTransactions` | BullMQ `import-transactions` only (manual bank-account prep on Rust) |
| `transactions.import` / `export` (tRPC) | Non-dashboard callers; dashboard uses Rust prep + enqueue* |
| `transactions.generateCsvMapping` | Claude Haiku CSV mapping (Node AI; dashboard tRPC) |
| `accounting.enqueueExportToAccounting` | BullMQ `export-to-accounting` only (app lookup on Rust) |
| `accounting.export` (tRPC) | Non-dashboard callers; dashboard uses Rust prep + enqueue* |

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

| Capability | Status after Stage 4 team create/delete slice |
|------------|----------------------------------------|
| Overview / tx / inbox reads / invoices SQL / tracker / reports / tags / categories | **Rust direct** |
| Vault proxy / vault file download | **Rust direct** |
| Vault delete / inbox delete / document short-link | **Rust direct** |
| Document reprocess / process SQL + signedUrls / signedUrl | **Rust direct** (job enqueue Node) |
| Invoice PDF SQL + stored vault PDF | **Rust**; known `file_path` skips Node; blind downloads Rust→Node fallback |
| `invoice.remind` / `cancelSchedule` / schedule / create status SQL | **Rust**; Trigger/BullMQ Node |
| `team.invite` SQL | **Rust direct** (dashboard); `enqueueInviteTeamEmails` / tRPC fallback Node |
| `team.create` / delete prep+delete SQL | **Rust direct** (dashboard); `enqueueDeleteTeamJob` / tRPC fallback Node |
| `team.updateBaseCurrency` | **Rust** team row (dashboard `team.update`); BullMQ recalc via `enqueueUpdateBaseCurrency` / tRPC fallback Node |
| `team.exportAllData` | **BullMQ only** — dashboard `enqueueExportAllData` / tRPC fallback Node |
| `inboxAccounts.delete` SQL | **Rust direct** (dashboard); `enqueueDeleteInboxAccountSchedule` / tRPC fallback Node |
| `inboxAccounts.sync` row read | **Rust direct** (dashboard); `enqueueSyncInboxAccount` / tRPC fallback Node |
| `oauthApplications.authorize` SQL | **Rust direct** (dashboard); `enqueueOAuthAppInstalledEmail` / tRPC fallback Node |
| `oauthApplications.updateApprovalStatus` SQL | **Rust direct** (dashboard); `enqueueOAuthApprovalReviewEmail` / tRPC fallback Node |
| `inbox.processAttachments` / `retryMatching` | **BullMQ only** — dashboard Rust create + `enqueueProcessAttachments` / `enqueueRetryMatching`; tRPC fallback Node |
| `transactionAttachments.processAttachment` | **BullMQ only** — dashboard Rust createMany + `enqueueProcessTransactionAttachments`; tRPC fallback Node |
| `transactions.export` | **BullMQ only** — dashboard `enqueueExportTransactions`; tRPC `export` fallback Node |
| `transactions.import` | **Rust** manual bank-account get/update (dashboard) + BullMQ `enqueueImportTransactions`; tRPC `import` fallback Node |
| `transactions.generateCsvMapping` | **Node AI** — dashboard tRPC (no Rust) |
| `accounting.export` | **Rust** app lookup (dashboard) + BullMQ `enqueueExportToAccounting`; tRPC `export` fallback Node |
| `documents.processDocument` / reprocess SQL | **Rust direct** — dashboard `processDocumentsFromRust` / `reprocessDocumentFromRust` → `documents.enqueueProcessDocument`; tRPC orchestrators for non-dashboard |
| `bankConnections.delete` SQL | **Rust**; Trigger `delete-connection` Node |
| `invoiceRecurring` create/update/pause/delete SQL | **Rust**; BullMQ + notifications Node; resume direct |
| `customers.enrich` SQL | **Rust**; Trigger job Node |
| Bank connect (Plaid/GC/EB) / decrypt account details | **Node** — STOP |
| Billing / Stripe invoice payments | **Node** — STOP |
| Invoice PDF live render (draft/receipt) | **Node** — STOP / non-tRPC |
| Invoice send / create Trigger | **Node** — hybrid |

### Test harness (AP-63 delegation suite)

`apps/api/bunfig.toml` preloads `src/__tests__/setup.ts` so `@trigger.dev/sdk` (`tasks.trigger`, `schedules.del`) and `@midday/job-client` mocks apply before router imports. `TRIGGER_SECRET_KEY` is set in setup as a fallback env. Run:

`cd apps/api && bun test src/__tests__/trpc/ap63-replacement-delegation.test.ts`

### Next recommended residual slice

1. **Invoice PDF live render** — port `@midday/invoice` React-PDF off Node (drafts/receipts), or generate receipts into vault (larger STOP gate).  
2. **OpenAPI schema depth** — `getAppById` is documented (utoipa + checked-in `openapi.json` + dashboard `generate:rust-api`); optional follow-up: typed `App` schema instead of generic `Object` for stronger TS clients.

Do **not** silently remove STOP/hybrid without a replacement plan.
