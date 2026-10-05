# Stage 4 — Residual Node surface (DC-STAGE4)

> **Status:** IN_PROGRESS → partial decommission (2026-10-04).  
> **Gate:** User one-shot **`decommission`** from [autopilot direct cutover](./2026-10-02-autopilot-direct-cutover.md).  
> **Policy:** Incremental safe teardown — do **not** delete all of `apps/api` while hybrids / STOP gates still have live dashboard callers.

## Tip SHAs (2026-10-05 post–REST transactions list/get/write/delete Rust delegation)

| Repo | Branch | SHA | Remote |
|------|--------|-----|--------|
| **midday** | `cursor/backend-replace-ui-frozen-plans` | `d747d9665` | torksabig |
| **clone** (origin) | (default) | `9bf4592` | origin |

Prior tip: `ebfd0e72a` (REST inbox list/get/update/delete).

Post–OpenAPI `getAppById` slice: clone adds typed `InstalledAppResponse` in utoipa; dashboard `generate:rust-api` picks up `components["schemas"]["InstalledAppResponse"]` for `getAppById` / `getApps` / app settings mutations.

### Remaining dashboard tRPC (live `:3003/trpc` HTTP)

Excludes procedures used **only** as React Query `queryKey` / `mutationKey` while `queryFn` / `mutationFn` calls Rust (`*FromRust`, `*ServerQueryOptions`, `*Client`). Those are typed against `AppRouter` but do not execute SQL on Node.

| Procedure | Node role today | Class |
|-----------|-----------------|-------|
| `documents.enqueueProcessDocument` | BullMQ `process-document` only | Hybrid job-only |
| `inbox.enqueueProcessAttachments` / `enqueueRetryMatching` | BullMQ attachment / matching jobs | Hybrid job-only |
| `transactionAttachments.enqueueProcessTransactionAttachments` | BullMQ `process-transaction-attachment` | Hybrid job-only |
| `transactions.enqueueExportTransactions` / `enqueueImportTransactions` | BullMQ export / import | Hybrid job-only |
| `accounting.enqueueExportToAccounting` | BullMQ `export-to-accounting` (Rust `GET /api/v1/apps/{id}` prep in UI) | Hybrid job-only |
| `team.enqueueInviteTeamEmails` / `enqueueDeleteTeamJob` / `enqueueUpdateBaseCurrency` / `enqueueExportAllData` | Trigger / BullMQ only | Hybrid job-only |
| `inboxAccounts.enqueueSyncInboxAccount` / `enqueueDeleteInboxAccountSchedule` | Trigger sync / schedule del | Hybrid job-only |
| `bankConnections.enqueueDeleteConnection` | Trigger `delete-connection` only | Hybrid job-only |
| `oauthApplications.enqueueOAuthAppInstalledEmail` / `enqueueOAuthApprovalReviewEmail` | Resend only | Hybrid job-only |
| `invoice.enqueueSendInvoiceReminder` / `enqueueRemoveScheduledInvoiceJob` / `enqueueGenerateInvoice` / `enqueueScheduleInvoice` / `enqueueInvoiceScheduledNotification` | Trigger / BullMQ only (SQL on Rust) | Hybrid job-only |
| `invoiceRecurring.enqueueRemoveInvoiceScheduledJobs` / `enqueueRecurringSeriesStartedNotification` | BullMQ / notification only (SQL on Rust) | Hybrid job-only |
| `invoice.create` / `cancelSchedule` / `remind` / `updateSchedule` (tRPC) | Non-dashboard; dashboard uses Rust + enqueue* | Hybrid fallback |
| `invoice.createFromTracker` (tRPC) | Non-dashboard (MCP/chat); dashboard Rust tracker + draft | Hybrid fallback |
| `invoiceRecurring.create` / `update` / `pause` / `delete` (tRPC) | Non-dashboard; dashboard uses Rust + enqueue* (`resume` direct) | Hybrid fallback |
| `customers.enqueueEnrichCustomer` | Trigger `enrich-customer` only (SQL on Rust) | Hybrid job-only |
| `customers.enrich` (tRPC) | Non-dashboard callers; dashboard uses Rust + enqueue | Hybrid fallback |
| `bankConnections.create` / `addAccounts` | Encrypt + `initial-bank-setup` | STOP |
| `bankConnections.delete` (tRPC) | Non-dashboard; Rust delegate + Trigger inline | Hybrid fallback |
| `banking.plaid*` / `gocardless*` / `enablebanking*` (+ `getProviderAccounts`) | Live bank OAuth / token exchange | STOP |
| `bankAccounts.getDetails` / `getWithPaymentInfo` | Decrypt | STOP |
| `inboxAccounts.connect` | Inbox OAuth | STOP |
| `connectors.*` | Composio | STOP |
| `billing.*` / `invoicePayments.*` | Stripe / Polar | STOP |
| `user.delete` / `apiKeys.upsert` | Admin email side effects | STOP |
| `jobs.getStatus` | Job polling | STOP |
| `transactions.generateCsvMapping` | Claude Haiku (no Rust) | Node AI |

**Non-tRPC `apps/api` (dashboard):** `POST /chat`; `GET /files/download/invoice` (React-PDF fallback — **STOP**); Gmail/Outlook OAuth redirects on `:3003`.

**SSR / public routes still on tRPC proxy:** `invoice.getInvoiceByToken`, portal `customers.*`, `reports.getByLinkId`, `shortLinks.get`, `app/api/enablebanking/session` → `banking.enablebankingExchange` (delegates where configured; still Node hop).

### Prioritized next slices (no invoice PDF live render)

1. **`invoice.updateSchedule`** — **no dashboard tRPC callers** (2026-10-05 grep); defer until reschedule UI calls tRPC or add Rust+enqueue when product ships it.
2. **REST OpenAPI list/get/delete** on `:3003` — **documents**, **inbox**, and **transactions** list/get/write/delete now Rust in replacement mode; **customers**, **teams**, **invoices**, etc. still Drizzle (transaction/inbox presigned-url paths already Rust).
3. **`POST /chat`** — move off Node or document long-term co-host (**permanent block** until ported).
4. **Worker / `packages/jobs`** — stop calling Node `trpc.banking.*` (**permanent block** for full Node teardown).
5. **OAuth redirect URIs** — keep on minimal Node until product accepts new redirect hosts.
6. **Invoice PDF live render** — **STOP** (drafts/receipts `@midday/invoice` React-PDF); do not cut over in Stage 4 automation.

### Permanent Node blocks (Stage 4 — do not auto-cutover)

These surfaces stay on minimal Node until an explicit product/engineering replacement exists. Automation must **not** delete or “fail-closed” them without a migration note and UX plan.

| Block | Dashboard / caller touchpoints | Why Node stays |
|-------|----------------------------------|----------------|
| **`POST /chat`** | `chat-context`, `store/chat.ts` → `NEXT_PUBLIC_API_URL/chat` | Agent stream + tools; **no Rust port in Stage 4** — see **Chat co-host** below |
| **Worker `trpc.banking.*`** | `packages/jobs`, `apps/worker` (not dashboard HTTP) | Provider HTTP, decrypt, schedules; SQL half on Rust only — see **Worker banking tRPC** below |
| **Bank OAuth callbacks** | Plaid/GC/EB connect components; `app/api/enablebanking/session` → `banking.enablebankingExchange` | Live token exchange + redirect URIs on `:3003` |
| **Invoice PDF live render** | Draft/receipt downloads; Node `GET /files/download/invoice` when Rust returns `needs_render` / `no_stored_pdf` | React-PDF (`@midday/invoice`); stored bytes on Rust |
| **`jobs.getStatus`** | `hooks/use-job-status.ts` | BullMQ job polling; no Rust equivalent |
| **`transactions.generateCsvMapping`** | `modals/import-modal/field-mapping.tsx` | Claude Haiku mapping; Node AI |
| **Decrypt reads** | `bankAccounts.getDetails`, `getWithPaymentInfo` | Vault decrypt |
| **Encrypt writes** | `bankConnections.create`, `addAccounts` | Vault encrypt + `initial-bank-setup` |
| **Billing / Polar** | `billing.*`, `invoicePayments.*`, subscription UI | Stripe/Polar |
| **Connectors (Composio)** | `connectors.*`, chat connector reads | Third-party OAuth |
| **Inbox OAuth** | `inboxAccounts.connect` | Gmail/Outlook OAuth on Node |
| **Admin side effects** | `user.delete`, `apiKeys.upsert` | Resend / admin email |

Hybrid **enqueue-only** tRPC (SQL on Rust, Node triggers BullMQ/Trigger/Resend) is intentional residual surface—not listed as permanent blocks, but required until each enqueue is callable without full-stack tRPC from the dashboard.

### Chat co-host (`POST /chat` on minimal Node)

**Long-term model (Stage 4 default):** Product reads/writes go **dashboard → Rust (`NEXT_PUBLIC_RUST_API_URL`, `:8787`)**. Chat is the main exception: the frozen UI streams agent turns via **`POST ${NEXT_PUBLIC_API_URL}/chat`** on minimal Node (`apps/api`, `:3003`). That is an intentional **co-host**, not a regression to full-stack Node for product SQL.

| Piece | Location / env |
|-------|----------------|
| Transport | `@ai-sdk/react` `DefaultChatTransport` in `apps/dashboard/src/store/chat.ts` and `chat-context.tsx` |
| API base | `NEXT_PUBLIC_API_URL` (local default `http://localhost:3003`) — must stay reachable while chat is enabled |
| Rust (everything else) | `NEXT_PUBLIC_RUST_API_URL` — independent of chat |
| Auth | Supabase session JWT in `Authorization` + `x-user-timezone` on chat requests |
| Server | `apps/api` chat route (agent stream, tool calls into existing Node/MCP surfaces) |

**Out of scope for autopilot / Stage 4 automation:** porting chat to Rust, rewriting tool routing, or deleting `apps/api` because chat moved. No “Rust chat port” slice unless product explicitly scopes it.

**To decommission Node for chat (future gate, not current work):**

1. Replace `POST /chat` with an equivalent host (new BFF or Rust SSE/WebSocket) and point `DefaultChatTransport` `api` at it.
2. Re-home or retire every chat tool that still assumes Node tRPC, Trigger, decrypt, or provider HTTP on `:3003`.
3. Update rate limits, observability, and deployment so `:3003` is not required for dashboard chat.
4. Mark the **Chat** row in the decommission checklist below **done** and re-run AP-63 + manual chat QA.

Until then, local/prod runbooks keep **clone + minimal Node + dashboard** even when Rust owns all non-chat product paths.

### Worker banking tRPC (`apps/worker` + `packages/jobs`)

Background runtimes still call Node **`trpc.banking.*`** for provider HTTP and decrypt—not the dashboard HTTP surface, but they **pin `apps/api` alive** for full Node teardown.

**`apps/worker` (BullMQ processors on `:3003` tRPC client):**

| Call site | Procedure | Role |
|-----------|-----------|------|
| `processors/rates/rates-scheduler.ts` | `banking.rates` (query) | FX / rate feed for scheduled jobs |
| `processors/teams/delete-team.ts` | `banking.deleteConnection` (mutate) | Provider teardown while deleting a team (after dashboard/Rust SQL prep) |

**`packages/jobs` (Trigger.dev tasks; same Node tRPC endpoint):**

| Task area | Procedures | Role |
|-----------|------------|------|
| `tasks/bank/delete/delete-connection.ts` | `banking.deleteConnection` (mutate) | Provider delete after SQL row removed (pairs with dashboard `enqueueDeleteConnection` / Rust DELETE) |
| `tasks/bank/sync/connection.ts` | `banking.connectionStatus` (query) | Sync gate / status |
| `tasks/bank/sync/account.ts` | `banking.getBalance`, `getProviderTransactions` (query) | Account sync |
| `tasks/reconnect/connection.ts` | `banking.connectionByReference`, `getProviderAccounts` (query) | Reconnect flows |

**Exit criteria (worker row in checklist):** Move provider HTTP + vault decrypt for these jobs onto Rust (or a dedicated banking micro-BFF), then delete worker/Trigger imports of `@midday/trpc` banking procedures. Dashboard bank OAuth STOP gates can remain on Node longer, but **worker banking** is the hard dependency for deleting the whole `apps/api` package.

### Safe to decommission `apps/api`?

**NO.** Minimal Node remains required for: **Permanent Node blocks** (table above), hybrid job enqueue, and worker banking tRPC. See **Decommission checklist** below for exit criteria.

### Decommission checklist (required before deleting `apps/api`)

Use this as a gate for the user one-shot **`decommission`** ([autopilot direct cutover](./2026-10-02-autopilot-direct-cutover.md)). Every item must be **done** or **explicitly waived in writing** with product sign-off.

- [ ] **Chat:** Dashboard no longer depends on `POST /chat` on `:3003` (replacement host or feature retired).
- [ ] **Workers:** No `packages/jobs` / worker runtime calls to Node `trpc.banking.*` (provider ops Rust-owned or isolated micro-BFF).
- [ ] **Bank OAuth:** Redirect URIs and token exchange moved or accepted on new hosts; Enable Banking session route not proxying Node tRPC.
- [ ] **PDF live render:** Draft/receipt/needs-render paths do not require Node React-PDF (or feature retired).
- [ ] **Job polling:** `jobs.getStatus` replaced (Rust job status API or remove UI dependency).
- [ ] **CSV import AI:** `generateCsvMapping` replaced or import flow retired.
- [ ] **Decrypt/encrypt:** `bankAccounts.getDetails` / `getWithPaymentInfo` and `bankConnections.create` / `addAccounts` Rust-safe or retired.
- [ ] **Billing:** Stripe/Polar flows not on Node tRPC (or billing product sunset complete).
- [ ] **Connectors / inbox OAuth:** Composio + Gmail/Outlook connect not on Node tRPC.
- [ ] **Admin:** `user.delete` / `apiKeys.upsert` side effects moved or retired.
- [ ] **Hybrid enqueue:** Every dashboard path uses Rust SQL + thin enqueue (or jobs retired)—no full-stack tRPC mutations for product writes.
- [x] **`bankConnections.delete` (dashboard hybrid):** Rust `DELETE /api/v1/bank-connections/{id}` then Node `bankConnections.enqueueDeleteConnection` only; no dashboard `trpc.bankConnections.delete` caller (2026-10-05).
- [ ] **SSR/public tRPC proxy:** Portal token invoice, reports link, short links—migrated or documented co-host.
- [ ] **Tests/docs:** AP-63 delegation suite green; this doc updated with final SHA and “DECOMMISSIONED” status.

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
| `invoice.createFromTracker` (non-dashboard tRPC) | **Rust** draft via `tryDelegateInvoiceDraft`; tracker aggregation Node |
| `invoice.createFromTracker` (dashboard) | **Rust** tracker reads + browser compose + `POST /invoices/draft` |
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

### Migrated (2026-10-05 bankConnections.delete dashboard hybrid)

| Capability | Now |
|------------|-----|
| `bankConnections.delete` SQL | **Rust direct** — dashboard `DELETE /api/v1/bank-connections/{id}` → Node `bankConnections.enqueueDeleteConnection` (Trigger `delete-connection` only); full `bankConnections.delete` tRPC retained for non-dashboard callers |

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

### Migrated (2026-10-05 invoice createFromTracker dashboard hybrid)

| Capability | Now |
|------------|-----|
| `invoice.createFromTracker` | **Rust direct** — dashboard reads tracker project + entries by range + default-settings-data (+ customer when linked), composes draft payload in browser, `POST /api/v1/invoices/draft`; full tRPC retained for MCP/chat/non-dashboard |

### Migrated (2026-10-05 invoice send/schedule/recurring dashboard hybrid)

| Capability | Now |
|------------|-----|
| `invoice.remind` | **Rust direct** — dashboard `PUT` reminderSentAt → Node `enqueueSendInvoiceReminder` (Trigger only); full tRPC for non-dashboard |
| `invoice.cancelSchedule` | **Rust direct** — dashboard get + clear schedule fields → Node `enqueueRemoveScheduledInvoiceJob`; full tRPC fallback |
| `invoice.create` (send/schedule) | **Rust direct** — dashboard status/schedule PUT + Node `enqueueGenerateInvoice` / `enqueueScheduleInvoice` / `enqueueInvoiceScheduledNotification`; full tRPC fallback |
| `invoiceRecurring.pause` / `delete` | **Rust direct** — dashboard pause/delete → Node `enqueueRemoveInvoiceScheduledJobs`; full tRPC fallback |
| `invoiceRecurring.create` | **Rust direct** — dashboard create → Node `enqueueRecurringSeriesStartedNotification`; full tRPC fallback |
| `invoiceRecurring.update` | **Rust direct** — dashboard `PUT /invoice-recurring/{id}`; full tRPC fallback |

### Migrated (2026-10-05 customers.enrich dashboard hybrid)

| Capability | Now |
|------------|-----|
| `customers.enrich` SQL | **Rust direct** — dashboard `POST /api/v1/customers/{id}/start-enrichment` → Node `customers.enqueueEnrichCustomer` (Trigger `enrich-customer` only); full `customers.enrich` tRPC retained for non-dashboard callers |

### Migrated (2026-10-05 inbox / transaction attachment job hybrids)

| Capability | Now |
|------------|-----|
| `inbox.processAttachments` | **Node job-only** — dashboard Rust `POST /api/v1/inbox` (create row) → Node `inbox.enqueueProcessAttachments` (BullMQ `process-attachment` + optional `inbox_new` notification); full `processAttachments` tRPC retained for non-dashboard callers |
| `inbox.retryMatching` | **Node job-only** — dashboard `inbox.enqueueRetryMatching` (BullMQ `batch-process-matching`); full `retryMatching` tRPC retained for non-dashboard callers |
| `transactionAttachments.processAttachment` | **Node job-only** — dashboard Rust `POST /api/v1/transaction-attachments` → Node `transactionAttachments.enqueueProcessTransactionAttachments` (BullMQ `process-transaction-attachment`); full `processAttachment` tRPC retained for non-dashboard callers |

### Migrated (2026-10-05 REST presigned-url → Rust vault signed-url)

| Capability | Now |
|------------|-----|
| `POST /documents/{id}/presigned-url` | **Rust** — row read via delegated `GET /api/v1/documents/{id}` + `POST /api/v1/documents/signed-url` (replacement mode); legacy dual still uses Drizzle + Supabase on Node |
| `POST /inbox/{id}/presigned-url` | **Rust** — delegated inbox get + Rust signed-url |
| `POST /transactions/{transactionId}/attachments/{attachmentId}/presigned-url` | **Rust** — delegated transaction get + Rust signed-url |

Public REST / MCP clients on `:3003` no longer require Drizzle for presigned vault URLs when `MIDDAY_BACKEND_MODE=replacement` (Bearer or `REPLACEMENT_DELEGATION_TOKEN`).

### Migrated (2026-10-05 REST documents list/get/delete → Rust)

| Capability | Now |
|------------|-----|
| `GET /documents` | **Rust** — `GET /api/v1/documents` via `tryDelegateDocumentsGet` + shared `replacement-rest-documents` helper (replacement mode) |
| `GET /documents/{id}` | **Rust** — `GET /api/v1/documents/{id}`; 404 when row missing |
| `DELETE /documents/{id}` | **Rust** — `DELETE /api/v1/documents/{id}` (SQL + vault on clone); legacy mode still Drizzle |

Helpers: `apps/api/src/rest/services/replacement-rest-documents.ts` (mirrors tRPC documents router + presigned-url Bearer extraction).

### Migrated (2026-10-05 REST inbox list/get/update/delete → Rust)

| Capability | Now |
|------------|-----|
| `GET /inbox` | **Rust** — `GET /api/v1/inbox` via `tryDelegateInboxGet` + `replacement-rest-inbox` helper (replacement mode) |
| `GET /inbox/{id}` | **Rust** — `GET /api/v1/inbox/{id}`; 404 when row missing |
| `PATCH /inbox/{id}` | **Rust** — partial update via `tryDelegateInboxUpdate` |
| `DELETE /inbox/{id}` | **Rust** — `POST /api/v1/inbox/{id}/delete` on clone (SQL + vault); legacy mode still Drizzle |

Helpers: `apps/api/src/rest/services/replacement-rest-inbox.ts` (mirrors tRPC inbox router + presigned-url Bearer extraction).

### Migrated (2026-10-05 REST transactions list/get/write/delete → Rust)

| Capability | Now |
|------------|-----|
| `GET /transactions` | **Rust** — `GET /api/v1/transactions` via `tryDelegateTransactionsGet` + `replacement-rest-transactions` |
| `GET /transactions/{id}` | **Rust** — `GET /api/v1/transactions/{id}`; 404 when row missing |
| `POST /transactions` | **Rust** — `POST /api/v1/transactions/create` via `tryDelegateCreateTransaction` |
| `PATCH /transactions/{id}` | **Rust** — `PUT /api/v1/transactions/{id}` via `tryDelegateTransactionUpdate` |
| `PATCH /transactions/bulk` | **Rust** — `POST /api/v1/transactions/update-many` |
| `DELETE /transactions/{id}` / `DELETE /transactions/bulk` | **Rust** — `POST /api/v1/transactions/delete-many` |
| `POST /transactions/bulk` | **Drizzle** — no Rust bulk-create on clone yet |
| `POST /transactions/{transactionId}/attachments/{attachmentId}/presigned-url` | **Rust** — unchanged (delegated get + vault signed-url) |

Helpers: `apps/api/src/rest/services/replacement-rest-transactions.ts` (mirrors tRPC transactions router + presigned-url Bearer extraction).

### REST OpenAPI still Drizzle in replacement mode (inventory)

| Router / area | Drizzle-backed routes (non-exhaustive) |
|---------------|----------------------------------------|
| `inbox` | _(list/get/update/delete migrated)_ |
| `transactions` | _(list/get/write/delete migrated; bulk create still Drizzle)_ |
| `customers`, `teams`, `users`, `bank-accounts`, `invoices`, `tags`, `search`, `reports`, `tracker-*`, `notifications` | CRUD/list reads |
| `oauth`, `mcp`, app OAuth callbacks, webhooks | integrations |
| `files/download` | invoice React-PDF fallback + partial delegation |
| REST middleware (`auth`, `db`) | identity / team resolution (required until REST auth moves) |

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
| `bankConnections.enqueueDeleteConnection` | Trigger `delete-connection` only (SQL on Rust) |
| `oauthApplications.enqueueOAuthAppInstalledEmail` | Resend install email only (auth-code SQL on Rust) |
| `oauthApplications.enqueueOAuthApprovalReviewEmail` | Resend review email only (status SQL on Rust) |
| `team.invite` / `team.create` / `team.delete` (tRPC) | Non-dashboard callers; dashboard skips SQL hop |
| `team.updateBaseCurrency` / `exportAllData` (tRPC) | Non-dashboard callers; dashboard uses enqueue* |
| `bankConnections.delete` (tRPC) | Non-dashboard callers; dashboard uses Rust + `enqueueDeleteConnection` |
| `oauthApplications.authorize` / `updateApprovalStatus` (tRPC) | Non-dashboard callers; dashboard uses Rust + enqueue* |
| `invoice.enqueueSendInvoiceReminder` / `enqueueRemoveScheduledInvoiceJob` / `enqueueGenerateInvoice` / `enqueueScheduleInvoice` / `enqueueInvoiceScheduledNotification` | Trigger/BullMQ/notification only (SQL on Rust) |
| `invoice.create` / `cancelSchedule` / `remind` / `updateSchedule` (tRPC) | Non-dashboard callers; dashboard uses Rust + enqueue* |
| `invoice.createFromTracker` (tRPC) | Non-dashboard (MCP/chat); dashboard Rust tracker + draft |
| `invoiceRecurring.enqueueRemoveInvoiceScheduledJobs` / `enqueueRecurringSeriesStartedNotification` | BullMQ/notification only (SQL on Rust) |
| `invoiceRecurring.create` / `update` / `pause` / `delete` (tRPC) | Non-dashboard callers; dashboard uses Rust + enqueue* |
| `customers.enqueueEnrichCustomer` | Trigger `enrich-customer` only (SQL on Rust) |
| `customers.enrich` (tRPC) | Non-dashboard callers; dashboard uses Rust + enqueue |
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

- `packages/jobs` / `apps/worker` → `trpc.banking.*` — inventory in **Worker banking tRPC** above (`rates`, `deleteConnection`, sync/reconnect queries)

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
| `bankConnections.delete` SQL | **Rust direct** (dashboard); `enqueueDeleteConnection` / tRPC `delete` fallback Node |
| `invoiceRecurring` create/update/pause/delete SQL | **Rust**; BullMQ + notifications Node; resume direct |
| `customers.enrich` SQL | **Rust direct** (dashboard); `enqueueEnrichCustomer` / tRPC `enrich` fallback Node |
| Bank connect (Plaid/GC/EB) / decrypt account details | **Node** — STOP |
| Billing / Stripe invoice payments | **Node** — STOP |
| Invoice PDF live render (draft/receipt) | **Node** — STOP / non-tRPC |
| Invoice send / create Trigger | **Node** — hybrid |

### Test harness (AP-63 delegation suite)

`apps/api/bunfig.toml` preloads `src/__tests__/setup.ts` so `@trigger.dev/sdk` (`tasks.trigger`, `schedules.del`) and `@midday/job-client` mocks apply before router imports. `TRIGGER_SECRET_KEY` is set in setup as a fallback env. Run:

`cd apps/api && bun test src/__tests__/trpc/ap63-replacement-delegation.test.ts`

### Next recommended residual slice

**`invoice.updateSchedule`** has no dashboard callers—skip until UI exists. **Next REST slice:** **customers** list/get/write (or **invoices** OpenAPI CRUD). **`POST /transactions/bulk`** create remains Drizzle until clone adds bulk create. Then **`POST /chat`** co-host only (documented).

OpenAPI: **`deleteBankConnection`** on Rust returns SQL row; dashboard delete uses Rust + Node `enqueueDeleteConnection` for provider teardown.

Do **not** silently remove STOP/hybrid/permanent blocks without a replacement plan.
