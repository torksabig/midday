# Stage 3 — Workers design (no implementation)

Date: 2026-09-29  
Branch: `cursor/backend-replace-ui-frozen-plans`  
Status: **sixth handler live** — `process-document` SQL status transitions via `POST /api/v1/workers/process-document` (AP-WORKER-6). Classify, embed, OCR, and HEIC conversion stay on Node. Prior workers (`batch-process-matching`, `match-transactions-bidirectional`, `notification`, `activity-notification-flush`, `rates-scheduler`, `check-invoice-status`, `noop`) remain.  
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

- Module: `crates/api/src/job_consumers.rs` (+ `inbox_matching_worker.rs`, `match_scoring.rs`)
- Route: `POST /api/v1/workers/noop` — accepts `{ job, payload }`, requires Midday Postgres auth, **executes nothing**
- Route: `POST /api/v1/workers/check-invoice-status` — invoice match/overdue SQL (AP-WORKER-1)
- Route: `POST /api/v1/workers/rates-scheduler` — idempotent `exchange_rates` upsert (AP-WORKER-2); FX fetch stays Node
- Route: `POST /api/v1/workers/activity-notification-flush` — claim due batches + mark sent / identity metadata (AP-WORKER-3); provider send stays Node
- Route: `POST /api/v1/workers/notification` — activities insert/combine (AP-WORKER-4); Resend stays Node
- Route: `POST /api/v1/workers/batch-process-matching` — inbox suggestion/auto-match SQL (AP-WORKER-5); notifications stay Node
- Route: `POST /api/v1/workers/match-transactions-bidirectional` — forward + reverse match SQL (AP-WORKER-5); notifications stay Node
- Route: `POST /api/v1/workers/process-document` — document by-path status SQL (AP-WORKER-6); classify/embed/OCR/HEIC stay Node
- Documented allowlist stub: `notification`, `check-invoice-status`, `rates-scheduler`, `activity-notification-flush`, `batch-process-matching`, `match-transactions-bidirectional`, `process-document`

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
7. **Transaction import/export file pipelines** — after document/inbox SQL parity; storage signed URLs stay Node.
8. **Bank sync / reconnect / delete-connection** — last among high-value paths; depends on connector + encrypt gates.
9. **Team delete / onboarding / invite mail** — after SQL team APIs are stable; mail stays Node.
10. **Accounting export / insights / invoice PDF+email** — after connectors and mail strategy.

Exit criterion for each job: dual-run (Node enqueue → Rust execute **or** Node execute + Rust shadow) for N days, then Node processor becomes a thin HTTP forwarder, then delete the TypeScript body **for that job only**.

---

## Non-goals this doc does not authorize

- Implementing further `/workers/...` handlers beyond `check-invoice-status`, `rates-scheduler`, `activity-notification-flush`, `notification`, inbox matching, `process-document`, and the noop
- Removing or renaming BullMQ queues
- Migrating Trigger schedules into Rust cron
- Decommissioning Midday Node API, `packages/db`, or `packages/replacement-backend`

---

## Next concrete slice

`process-document` SQL status transitions are live (AP-WORKER-6). Next is **transaction import/export file pipelines**; storage signed URLs stay Node.
