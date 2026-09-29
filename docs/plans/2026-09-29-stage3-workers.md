# Stage 3 — Workers design (no implementation)

Date: 2026-09-29  
Branch: `cursor/backend-replace-ui-frozen-plans`  
Status: **Stage 3 SQL slices complete** — AP-WORKER-10 accounting export / insights / invoice PDF+email SQL half via `POST /api/v1/workers/upsert-accounting-sync`, `update-accounting-attachment-mapping`, `persist-team-insight`, `update-invoice-file`, `update-invoice-sent`. Provider HTTP, PDF bytes, Resend, and LLM generation stay on Node. `dispatch-insights` deferred (timezone fan-out + enqueue only). Prior workers (team onboard, bank sync, import/export, `process-document`, inbox matching, `notification`, `activity-notification-flush`, `rates-scheduler`, `check-invoice-status`, `noop`) remain.  
Do **not** rip out `apps/worker` or `packages/jobs` in this stage.

Related: [`2026-09-28-clean-rust-replacement-no-proxy.md`](./2026-09-28-clean-rust-replacement-no-proxy.md) (Stage 3 = async & integrations), [`job_consumers.rs`](../../../clone/crates/api/src/job_consumers.rs) sketch in the clone API.

---

## Goal

Move **durable job side effects** (Postgres writes, status transitions, matching, exports) behind Rust HTTP consumers under `/api/v1/workers/...`, while Node keeps owning:

- Redis / BullMQ enqueue + retries + Bull Board
- Trigger.dev schedules and cloud runners
- Mail (Resend), Stripe, live bank/inbox OAuth, decrypt/encrypt vault paths

Until a job’s Rust handler is proven dual-run, the Node processor stays the source of truth.

---

## What exists today

### BullMQ (`apps/worker`)

Queues registered in `apps/worker/src/queues/index.ts`:

| Queue | Role |
|-------|------|
| `inbox` / `inbox-provider` | Attachment processing, matching, Slack upload, sync/initial setup |
| `transactions` | Enrich, import/export, attachments, base-currency updates |
| `documents` | Process / classify / embed tags |
| `rates` | FX rates scheduler |
| `institutions` | Institution catalog sync |
| `accounting` | Attachment sync + export-to-accounting |
| `invoices` | Generate, email, reminder, schedule, recurring |
| `customers` | Customer enrichment |
| `teams` | Delete team, cancellation / payment-issue emails |
| `insights` | Dispatch + generate team insights |
| `notifications` | Notification send + activity flush |

**BullMQ job names** (from processor registries):

- **inbox:** `batch-process-matching`, `match-transactions-bidirectional`, `process-attachment`, `slack-upload`, `no-match-scheduler`, `sync-scheduler`, `initial-setup`
- **transactions:** `enrich-transactions`, `export-team-data`, `export-transactions`, `import-transactions`, `process-export`, `process-transaction-attachment`, `update-account-base-currency`, `update-base-currency`
- **documents:** `process-document`, `classify-image`, `classify-document`, `embed-document-tags`
- **rates:** `rates-scheduler`
- **institutions:** `sync-institutions`
- **accounting:** `sync-accounting-attachments`, `export-to-accounting`
- **invoices:** `invoice-recurring-scheduler`, `invoice-upcoming-notification`, `generate-invoice`, `send-invoice-email`, `send-invoice-reminder`, `schedule-invoice`
- **customers:** `enrich-customer`
- **teams:** `delete-team`, `cancellation-email-immediate`, `cancellation-email-followup`, `payment-issue`
- **insights:** `dispatch-insights`, `generate-team-insights`
- **notifications:** `activity-notification-flush`, `notification`

API surface still on Node: `jobs.getStatus` (BullMQ introspection, not Postgres).

### Trigger.dev (`packages/jobs`)

Task ids under `packages/jobs/src/tasks/`:

| Area | Task ids |
|------|----------|
| Bank | `bank-sync-scheduler`, `ensure-bank-schedulers`, `initial-bank-setup`, `sync-connection`, `sync-account`, `upsert-transactions`, `delete-connection`, `transaction-notifications`, `reconnect-connection` |
| Inbox | `inbox-sync-scheduler`, `initial-inbox-setup`, `sync-inbox-account`, `process-attachment`, `batch-process-matching`, `match-transactions-bidirectional`, `no-match-scheduler` |
| Documents | `process-document`, `classify-document`, `classify-image`, `embed-document-tags`, `convert-heic` |
| Invoice | `invoice-scheduler`, `check-invoice-status`, `invoice-notifications` |
| Team | `onboard-team`, `invite-team-members` |
| Other | `notification`, `enrich-transactions` |

Many names overlap BullMQ (same domain work, dual enqueue paths historically). Stage 3 must not assume one runner owns a name until dual-run proves it.

### Rust foothold (clone)

- Module: `crates/api/src/job_consumers.rs` (+ `inbox_matching_worker.rs`, `match_scoring.rs`, `process_document_worker.rs`, `transaction_import_export_worker.rs`, `bank_sync_worker.rs`, `team_jobs_worker.rs`, `accounting_insights_invoice_worker.rs`)
- Route: `POST /api/v1/workers/noop` — accepts `{ job, payload }`, requires Midday Postgres auth, **executes nothing**
- Route: `POST /api/v1/workers/check-invoice-status` — invoice match/overdue SQL (AP-WORKER-1)
- Route: `POST /api/v1/workers/rates-scheduler` — idempotent `exchange_rates` upsert (AP-WORKER-2); FX fetch stays Node
- Route: `POST /api/v1/workers/activity-notification-flush` — claim due batches + mark sent / identity metadata (AP-WORKER-3); provider send stays Node
- Route: `POST /api/v1/workers/notification` — activities insert/combine (AP-WORKER-4); Resend stays Node
- Route: `POST /api/v1/workers/batch-process-matching` — inbox suggestion/auto-match SQL (AP-WORKER-5); notifications stay Node
- Route: `POST /api/v1/workers/match-transactions-bidirectional` — forward + reverse match SQL (AP-WORKER-5); notifications stay Node
- Route: `POST /api/v1/workers/process-document` — document by-path status SQL (AP-WORKER-6); classify/embed/OCR/HEIC stay Node
- Route: `POST /api/v1/workers/import-transactions` — bulk insert imported rows (AP-WORKER-7); CSV parse + vault download stay Node
- Route: `POST /api/v1/workers/process-export` — select transaction rows for export (AP-WORKER-7); attachment download + CSV/XLSX stay Node
- Route: `POST /api/v1/workers/export-transactions` — mark exported + optional short_link insert (AP-WORKER-7); zip/upload/signed URL stay Node
- Route: `POST /api/v1/workers/upsert-transactions` — bank-sync row insert ON CONFLICT DO NOTHING (AP-WORKER-8); provider fetch + transform stay Node
- Route: `POST /api/v1/workers/sync-connection-status` — connection status / last_accessed / reference_id / disconnect-if-retries (AP-WORKER-8); provider `connectionStatus` stays Node
- Route: `POST /api/v1/workers/update-bank-account-sync` — balance / error / currency heal writes (AP-WORKER-8); provider balance/tx fetch stays Node
- Route: `POST /api/v1/workers/remap-bank-account-ids` — post-reconnect account_id remaps (AP-WORKER-8); matching + provider accounts stay Node
- Route: `POST /api/v1/workers/onboard-team` — user + trial/plan gate + bank_connections count (AP-WORKER-9); Resend + `wait.for` stay Node
- Route: `POST /api/v1/workers/upsert-accounting-sync` — export batch status upsert (AP-WORKER-10); Fortnox/Xero/QB HTTP stays Node
- Route: `POST /api/v1/workers/update-accounting-attachment-mapping` — attachment mapping + status (AP-WORKER-10); provider upload/delete stays Node
- Route: `POST /api/v1/workers/persist-team-insight` — insight row of already-generated text (AP-WORKER-10); LLM stays Node
- Route: `POST /api/v1/workers/update-invoice-file` — file_path / file_size after PDF (AP-WORKER-10); PDF bytes + vault stay Node
- Route: `POST /api/v1/workers/update-invoice-sent` — status / sent_to / sent_at after email (AP-WORKER-10); Resend stays Node
- Documented allowlist stub: `notification`, `check-invoice-status`, `rates-scheduler`, `activity-notification-flush`, `batch-process-matching`, `match-transactions-bidirectional`, `process-document`, `import-transactions`, `process-export`, `export-transactions`, `upsert-transactions`, `sync-connection-status`, `update-bank-account-sync`, `remap-bank-account-ids`, `onboard-team`, `upsert-accounting-sync`, `update-accounting-attachment-mapping`, `persist-team-insight`, `update-invoice-file`, `update-invoice-sent`

---

## What a Rust replacement would own

Per job, once dual-run is green:

1. **Axum handler** that performs the same Midday Postgres mutations / reads the Node processor does today (SQLx against `MIDDAY_DATABASE_URL`).
2. **Typed payload schema** matching the existing BullMQ / Trigger payload (versioned; reject unknown shapes).
3. **Idempotency** keyed by job id + business key (team id, document id, etc.) so Node retries are safe.
4. Optional later: **Rust-native queue consumer** (Redis BRPOP / streams) — only after HTTP consumers cover the domain. Prefer HTTP first so Node producers stay unchanged during cutover.

Rust does **not** need to own Redis connection config, Bull Board, or Trigger project settings in Stage 3.

---

## Out of scope (stay on Node / gated)

Leave these on Node until dedicated slices exist (same gate list as API migration):

| Concern | Why |
|---------|-----|
| Decrypt / encrypt bank vault fields | Secrets + key handling |
| Resend / Sendblue / Slack outbound mail & chat | Provider credentials |
| Live bank / inbox OAuth token exchange | Provider APIs |
| Stripe / Polar billing jobs (`payment-issue`, cancellation emails) | Billing APIs |
| `accounting.getAccounts` and live accounting connectors | External APIs |
| HEIC convert, image OCR, LLM classify/enrich that call OpenAI/OpenRouter without a Rust client parity plan | Heavy deps + cost |
| `jobs.getStatus` BullMQ peek | Redis queue introspection |
| Deleting `apps/worker` or `packages/jobs` | Explicitly forbidden until Stage 3 cutover is complete |

Gated tRPC procedures that only *enqueue* jobs stay on Node; Rust may later own the *worker body* while enqueue remains Node.

---

## Suggested order

Port **read-mostly or Postgres-only** jobs first; dual-run against noop → real handler; keep Node processor until metrics match.

1. **`check-invoice-status`** (Trigger) — **implemented.** Rust writes the match/overdue rows. Node sends `invoice-notifications` when `notify` is true. Dual falls back to Supabase. Replacement does not. Set `MIDDAY_BACKEND_MODE`, `REPLACEMENT_API_URL`, and `MIDDAY_WORKER_TOKEN` (or `REPLACEMENT_DELEGATION_TOKEN`).
2. **`rates-scheduler`** (BullMQ) — **implemented.** Node still calls `trpc.banking.rates` for FX; Rust upserts `exchange_rates` from the posted rows. Dual falls back to Drizzle. Replacement does not.
3. **`activity-notification-flush`** (BullMQ) — **implemented.** Verified not DB-only: flush also sends Slack/Telegram/WhatsApp/Sendblue. Rust claims due batches (marks ineligible `sent_at`) and finalizes after Node deliver; provider send stays Node. Dual falls back to `@midday/bot` flush; replacement does not.
4. **`notification`** (BullMQ + Trigger) — **implemented.** Rust inserts/combines `activities` (preference priority). Node/`@midday/notifications` still sends Resend when `sendEmail` is true; BullMQ still calls `sendToProviders`. Dual falls back to Drizzle create; replacement does not.
5. **Inbox DB matching** — `batch-process-matching`, `match-transactions-bidirectional` — **implemented.** Rust finds/persists matches and status writes. Node still sends matching notifications (Resend / Slack / providers). Dual falls back to Drizzle; replacement does not.
6. **Document SQL status transitions** — worker `process-document` — **implemented.** Rust updates `documents` by `path_tokens` (same status machine as tRPC `documents.reprocessDocument` / `updateDocumentByPath`). Classify, embed, OCR, HEIC stay on Node. Dual falls back to Drizzle; replacement does not.
7. **Transaction import/export file pipelines** — **implemented (AP-WORKER-7).** Rust owns: insert imported rows (`import-transactions`), select rows for export (`process-export`), mark exported + optional `short_links` insert (`export-transactions`). Document export-path status reuses AP-WORKER-6. Node keeps: vault download/upload, CSV parse, CSV/XLSX/zip bytes, attachment blob download, signed URLs, Resend notification enqueue. `export-team-data` multi-entity reads (invoices/customers/tracker/inbox/tags) stay on Node for this slice; its transaction section uses `process-export`. No Trigger tasks for these four BullMQ names.
8. **Bank sync / reconnect / delete-connection** — **implemented (AP-WORKER-8, SQL half).** Rust owns: upsert bank-sync rows (`upsert-transactions`), connection status / last_accessed / reference_id / disconnect-if-retries (`sync-connection-status`), account balance/error/currency writes (`update-bank-account-sync`), post-reconnect account remaps (`remap-bank-account-ids`). Reuses existing tRPC `bankConnections.delete` / `reconnect` SQL writers — no second dialect. Node keeps: provider HTTP (`connectionStatus`, `getBalance`, `getProviderTransactions`, `getProviderAccounts`, provider `deleteConnection`), vault decrypt/encrypt, Trigger schedules (`initial-bank-setup`, `bank-sync-scheduler`), enrich/match fan-out, notification enqueue. **Still gated (no separable SQL in the Trigger body):** `delete-connection` (provider teardown only; DB delete already via tRPC), `initial-bank-setup` (schedules + sync triggers only).
9. **Team delete / onboarding / invite mail** — **implemented (AP-WORKER-9, SQL half).** Rust owns: onboard context reads (`onboard-team` — user + trial/plan gate + `bank_connections` count). Invite inserts / team delete-prep / delete / deleteMember already live on tRPC REST (AP-60/61/42) — reused, not forked into `/workers/*`. Node keeps: Resend (welcome, trial activation, invite batch, payment-issue), Trigger `wait.for`, BullMQ banking provider teardown on `delete-team`. **Still gated (no separable SQL in the job body):** `invite-team-members` (email only), `delete-team` (provider teardown only), `cancellation-email-*` (stubs), `payment-issue` (Resend only).
10. **Accounting export / insights / invoice PDF+email** — **implemented (AP-WORKER-10, SQL half).** Rust owns: export batch status upsert (`upsert-accounting-sync`), attachment mapping + status (`update-accounting-attachment-mapping`), insight row of already-generated text (`persist-team-insight`), invoice `file_path`/`file_size` (`update-invoice-file`), invoice `status`/`sent_to`/`sent_at` (`update-invoice-sent`). Reuses tRPC `accounting.disconnect` / `accounting.export` app lookup (AP-43/60) — not forked. Node keeps: Fortnox/Xero/QuickBooks HTTP, vault attachment download/upload, PDF render bytes, Resend invoice email, LLM insight generation, BullMQ enqueue. **Deferred (no separable SQL in the job body):** `dispatch-insights` (timezone fan-out + enqueue only).

Exit criterion for each job: dual-run (Node enqueue → Rust execute **or** Node execute + Rust shadow) for N days, then Node processor becomes a thin HTTP forwarder, then delete the TypeScript body **for that job only**.

---

## Non-goals this doc does not authorize

- Implementing further `/workers/...` handlers beyond the AP-WORKER-1..10 allowlist and the noop
- Removing or renaming BullMQ queues
- Migrating Trigger schedules into Rust cron
- Decommissioning Midday Node API, `packages/db`, or `packages/replacement-backend`

---

## Next concrete slice

**Stage 3 SQL slices are complete** (AP-WORKER-1..10). Remains gated on Node: live accounting provider HTTP, Resend / invoice email, PDF bytes, LLM insight text, decrypt/encrypt, live OAuth, Stripe/Polar, `dispatch-insights` fan-out, `invite-team-members` / `delete-team` / cancellation / `payment-issue`, `delete-connection` / `initial-bank-setup`, and Stage 4 decommission of `apps/api` (explicit user go-ahead only).
