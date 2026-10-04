# Autopilot — Midday → Rust direct cutover

> **Canonical autopilot plan (2026-10-02).** Replaces the façade-delegation loop in [2026-09-28-autopilot-migration-continuation.md](./2026-09-28-autopilot-migration-continuation.md).  
> **Sits on top of:** [Clean Rust replacement (no permanent proxy)](./2026-09-28-clean-rust-replacement-no-proxy.md), live status in [Delegation inventory](./2026-09-28-delegation-inventory.md), blocked leftovers in [Still to be worked on](./still-to-be-worked-on.md).

---

## Standing authorization (pre-approved for the whole run)

When the user (or a Cursor Automation / Loop / hook) points an agent at **this file**, or pastes the **agent prompt block** below, treat the following as **already approved**. Do **not** ask “should I continue?”, “should I commit?”, or “should I push?” between slices.

| Action | Allowed |
|--------|---------|
| Read/search/edit `fintech/midday` and sibling `fintech/clone` (API crates only) | Yes |
| Add utoipa OpenAPI paths/schemas; regenerate `openapi.json`; run `bun run generate:rust-api` in `apps/dashboard` | Yes |
| Wire dashboard `src/lib/rust-api/*` clients + call-site swaps (preserve React Query keys) | Yes |
| Run focused tests (`cargo test -p clone-api`, dashboard unit tests, scoped typecheck) | Yes |
| Update inventory rows → `direct Rust` and this plan’s queue status | Yes |
| **Commit + push** midday → remote `torksabig`, branch `cursor/backend-replace-ui-frozen-plans` | Yes |
| **Commit + push** clone → remote `origin`, branch `cursor/backend-replace-ui-frozen-plans` | Yes |
| Redesign `apps/dashboard` UI / routes / styling | **No** |
| Commit `.env`, secrets, credentials | **No** |
| Force push, amend pushed commits, change git config | **No** |
| Implement decrypt / encrypt / Resend / live OAuth / Stripe / accounting-provider as wholes | **No** — STOP |
| Wire `bankConnections.create` / `addAccounts` (encrypt) | **No** — STOP |
| Move `bankConnections.delete` off tRPC (Trigger teardown is Node-owned) | **No** — leave on tRPC |
| Stage 4: delete `apps/api` / `packages/replacement-backend` / `packages/db` | **No** until user one-shot **“decommission”** |

**Batch size:** one slice (table below) per iteration; prefer 1–6 related procedures, not a whole product area in one commit.

---

## Architecture (non-negotiable)

```
apps/dashboard (frozen UI)
        │  direct fetch + generated OpenAPI types
        │  React Query keys = former trpc.*.queryKey()
        ▼
fintech/clone Axum (:8787)   ← durable logic
        ▲
apps/api tRPC                ← temporary façade only (until Stage 4)
```

- **Direct cutover** = dashboard calls Rust REST with Supabase session JWT. Façade delegation may already exist for the same procedure; direct cutover still requires OpenAPI typing + dashboard wiring.
- Path A (Vite clone UI) stays deferred.
- Fail-closed: if Rust returns error on a cut-over path, surface it — do **not** silently invent Node decrypt/crypto or widen scope.

---

## Definition of Done (every slice)

A slice is **DONE** only when all of the following hold:

1. **Rust route exists** for each procedure (or is added in this slice).
2. **OpenAPI / utoipa** — if the surface is new to the dashboard contract, add `#[utoipa::path]` + schemas to `clone/crates/api/src/openapi.rs`, regenerate checked-in `openapi.json` (`cargo run -p clone-api --bin generate_openapi > crates/api/openapi.json`).
3. **Generate types** — from midday `apps/dashboard`: `bun run generate:rust-api` → `src/lib/rust-api/openapi.generated.ts`.
4. **Dashboard clients** — shared fetch module + `-client.ts` / `-server.ts` (match existing patterns under `apps/dashboard/src/lib/rust-api/`).
5. **Wire call sites** — replace `trpc.<proc>.*` data fetching/mutations with Rust helpers; **preserve** `trpc.<proc>.queryKey()` / `infiniteQueryKey()` / mutation invalidate keys so React Query cache stays coherent.
6. **Inventory** — mark each procedure row `direct Rust` in [delegation-inventory.md](./2026-09-28-delegation-inventory.md); update the “Direct dashboard cutover” blurb if needed.
7. **Tests** — focused proof (clone handler/OpenAPI drift tests and/or dashboard client unit test); no full-monorepo suite required.
8. **Commit + push both repos** on `cursor/backend-replace-ui-frozen-plans`:
   - midday → `git push -u torksabig HEAD`
   - clone → `git push -u origin HEAD`
9. **Log one line** — slice id, procedures, midday SHA, clone SHA — then **immediately** start the next PENDING slice (no user ping).

Incomplete OpenAPI-only or client-only work is **not** DONE; finish wiring or leave the slice PENDING with a concrete remainder note.

---

## How to pick “what’s next” (cold resume)

1. Open this file → **Direct-cutover queue** → first `PENDING` / `IN_FLIGHT` row.
2. Cross-check [delegation-inventory.md](./2026-09-28-delegation-inventory.md): prefer procedures that are **not** yet `direct Rust` but **already have** a Rust route under `/api/v1/...` (see `clone/crates/api/src/domains.rs` + façade URLs in `packages/replacement-backend`).
3. Skip rows marked `BLOCKED` / `GATED` unless the user explicitly lifted the gate.
4. If the top row’s code is already fully wired on disk, mark DONE, push inventory if dirty, take the next row.
5. Prefer screens that already load via tRPC but can swap to existing Rust handlers over inventing new domains.

**Do not** start Stage 4 teardown from cold resume.

---

## Direct-cutover queue

| ID | Status | Procedures / scope | Notes |
|----|--------|--------------------|-------|
| **DC-0** | **DONE** | Finish balances + `bankConnections.get` / `reconnect` | Done 2026-10-02. **Leave `bankConnections.delete` on tRPC.** |
| **DC-1** | **DONE** | Team/settings shell: `team.members`, `team.list`, `team.update`, `user.update` | Done 2026-10-02. Invites/connectionStatus remain for a follow-on if needed. |
| **DC-2** | **DONE** | Transactions reads: `transactions.get`, `transactions.getById`, `transactions.getReviewCount` | Done 2026-10-02. Routes: `GET /transactions`, `GET /transactions/{id}`, `GET /transactions/review-count`. Infinite query keys preserved. |
| **DC-3** | **DONE** | Transactions writes used by the list/detail UI: `transactions.update`, `transactions.updateMany`, `transactions.deleteMany`, `transactions.moveToReview` | Done 2026-10-02. `transactions.create` remains tRPC for a follow-on. |
| **DC-4** | **DONE** | Inbox reads: `inbox.get`, `inbox.getById`, `inbox.search`, `inbox.getByStatus`, `inbox.checkAttachments` | Done 2026-10-02. Routes: `GET /inbox`, `GET /inbox/{id}`, `GET /inbox/search`, `GET /inbox/by-status`, `GET /inbox/{id}/check-attachments`. Infinite/getById/checkAttachments keys preserved. Search/by-status helpers ready (no dashboard fetch sites yet). |
| **DC-5** | **DONE** | Documents: `documents.get`, `documents.getById` (+ `getRelatedDocuments` / processing-status if call sites are simple) | Done 2026-10-02. Routes: `GET /documents`, `GET /documents/{id}`, `GET /documents/{id}/related`. Skip `signedUrl(s)`. No processing-status GET. |
| **DC-6** | **DONE** | Customers: `customers.get`, `customers.getById` (+ invoice-summary / portal reads if already on Rust) | Done 2026-10-02. Routes: `GET /customers`, `GET /customers/{id}`, `GET /customers/{id}/invoice-summary`. Portal public reads remain for a follow-on. |
| **DC-7** | **DONE** | Invoices list/detail: `invoice.get`, `invoice.getById` (+ paymentStatus / invoiceSummary metrics reads) | Done 2026-10-02. Routes: `GET /invoices`, `GET /invoices/{id}`, `GET /invoices/payment-status`, `GET /invoices/summary`. Send/PDF/remind email stay gated Node. |
| **DC-8a** | **DONE** | Tracker timer + calendar reads/writes: `trackerEntries.getTimerStatus`, `getCurrentTimer`, `startTimer`, `stopTimer`, `byRange`, `byDate` | Done 2026-10-02. Routes: timer status/current/start/stop + entries by-range/by-date. |
| **DC-8b** | **DONE** | Tracker projects + entries upsert/delete/billableHours | Done 2026-10-02. Routes: projects list/getById/upsert/delete + entries upsert/delete + billable-hours. |
| **DC-8** | **DONE** | Remaining settings/misc: document tags (+ assignments), institutions, short-links.get, apiKeys.get/delete, apps get/disconnect/update (SQL-only) | Done 2026-10-02. Skip encrypt/OAuth/Stripe/Resend. `apiKeys.upsert` + `shortLinks.createForDocument` stay Node. |
| **DC-H1** | **DONE** | Post-DC-8 hardening (high-traffic satellite reads): `search.global`, invoice customer metrics (`mostActiveClient` / `inactiveClientsCount` / `topRevenueClient` / `newCustomersCount`), `transactions.getSimilarTransactions`, `transactions.searchTransactionMatch` | Done 2026-10-02. OpenAPI + dashboard clients; customers page + cmd-k + inbox match + similar-tx prompts. |
| **DC-H2** | **DONE** | Inbox SQL writes + team invites/connectionStatus: `inbox.update`/`matchTransaction`/`confirmMatch`/`declineMatch`/`unmatchTransaction`/`blocklist.*`; `team.connectionStatus`/`teamInvites`/`invitesByEmail`/`user.invites`/`acceptInvite`/`declineInvite`/`deleteInvite`/`updateMember`/`deleteMember` | Done 2026-10-02. Hybrid stays on tRPC: `inbox.delete`/`deleteMany` (storage), `team.invite` (Trigger email). |
| **DC-H3** | **DONE** | Customers SQL writes + invoice SQL writes + documents checkAttachments + `transactions.create`: `customers.upsert`/`delete`/`togglePortal`/`cancelEnrichment`/`clearEnrichment`; `invoice.draft`/`update`/`delete`/`duplicate`; `documents.checkAttachments`; `transactions.create` | Done 2026-10-02. Hybrid stays on tRPC: `customers.enrich` (Trigger job), `invoice.create` (send/schedule Trigger), `documents.delete` (vault storage), `documents.reprocessDocument` (process-document job). Upsert/create defer Node enrich side-effects. Next: remaining satellite reads/writes or hybrid orchestrators — **not** Stage 4. |
| **DC-H4** | **DONE** | Remaining invoice satellite reads + inboxAccounts list: `invoice.searchInvoiceNumber`, `invoice.averageDaysToPayment`, `invoice.averageInvoiceSize`, `inboxAccounts.get` | Done 2026-10-03. OpenAPI + dashboard clients; invoice form search-number cut over; avg metrics helpers wired (no UI fetch sites); apps/inbox settings call `GET /api/v1/inbox-accounts`. Hybrids stay on tRPC: `customers.enrich`, `invoice.create`, `documents.delete`, `inboxAccounts.sync`/`delete` (Trigger). Next: `invoiceProducts.*` / `reports.*` / `invoiceRecurring.*` OpenAPI+cutover — **not** Stage 4. |
| **DC-H5a** | **DONE** | `invoiceProducts.*` OpenAPI + dashboard cutover | Done 2026-10-03. Routes under `/api/v1/invoice-products`; products page/table/sheet/form + invoice line-item autocomplete/amount/unit cut over. `upsert` OpenAPI-ready, no UI sites. Next: `reports.*` SQL reads — **not** Stage 4. |
| **DC-H5b** | **DONE** | `reports.*` SQL reads + create | Done 2026-10-03. Metrics cards + public `/r/{linkId}` + share modal cut over to `/api/v1/reports/*`. `taxSummary` client ready (invalidate-only). Next: `invoiceRecurring` SQL pieces — **not** Stage 4. |
| **DC-H5c** | **DONE** | `invoiceRecurring` SQL pieces used by dashboard | Done 2026-10-03. OpenAPI + cutover for `get`/`getUpcoming`/`resume` (+ `list` helpers). Hybrid stays on tRPC: `pause`/`delete` (BullMQ job remove), `create`/`update` (notifications/validation). Next: `invoiceTemplate.*` or other non-gated satellites — **not** Stage 4. |
| **DC-H5** | **DONE** | Products + reports + recurring SQL cluster | Umbrella for DC-H5a/b/c. |
| **DC-H6a** | **DONE** | `invoiceTemplate.*` OpenAPI + dashboard cutover (SQL-only) | Done 2026-10-03. Routes under `/api/v1/invoice-templates`; list/count/create/upsert/setDefault/delete (+ get helper) cut over. Template selector/settings/create dialog + `useTemplateUpdate` preserve query/mutation keys. Next: remaining non-gated satellites with dashboard call sites — **not** Stage 4. |
| **DC-H6b** | **DONE** | `search.attachments` + `transactionAttachments.createMany`/`delete` | Done 2026-10-03. OpenAPI + cutover for attachment search and SQL attachment create/delete. `processAttachment` stays on tRPC (jobs). Next: oauthApplications SQL cluster or team switch/leave — **not** Stage 4. |
| **DC-H6c** | **DONE** | `oauthApplications` SQL cluster (list/get/create/update/delete/regenerateSecret/authorized/revokeAccess/getApplicationInfo) | Done 2026-10-03. Routes under `/api/v1/oauth-applications*`. Apps/developer/consent cut over; secret plaintext returned once on create/regenerate. Hybrid stays on tRPC: `authorize`/`updateApprovalStatus` (Resend). Next: `user.switchTeam`/`team.leave` — **not** Stage 4. |
| **DC-H6d** | **DONE** | `user.switchTeam` + `team.leave` | Done 2026-10-03. `POST /api/v1/user/switch-team` + `POST /api/v1/team/leave`; Redis team-cache invalidation skipped (expire-naturally, already accepted). Dropdown/teams/members/invite cut over. Next: remaining non-gated satellites — **not** Stage 4. |
| **DC-H6** | **DONE** | Remaining non-gated satellites after templates | DC-H6a–d done 2026-10-03. |
| **DC-H7** | **DONE** | Portal public reads + availablePlans + notificationSettings.get/bulkUpdate helpers | Done 2026-10-03. Routes: `GET /api/v1/portal/{portal_id}`, `.../invoices`, `GET /api/v1/team/available-plans`. Portal pages cut over (no auth). availablePlans + notificationSettings.get/bulkUpdate helpers wired (no UI sites). Accounting sync/connections/disconnect: no dashboard call sites. |
| **DC-H8** | **DONE** | `apps.createPlatformLinkToken` + `inbox.create` | Done 2026-10-03. Routes: `POST /api/v1/apps/platform-link-tokens`, `POST /api/v1/inbox`. Connect Slack/Telegram/WhatsApp/iMessage + inbox/transactions upload zones cut over. `inbox.processAttachments` stays tRPC (jobs). |
| **DC-H9** | **DONE** | `invoice.getInvoiceByToken` (+ inventory: `invoice.defaultSettings`) | Done 2026-10-03. Route: `GET /api/v1/invoices/by-token/{token}` (JWT verify with `INVOICE_JWT_SECRET` on clone; fail-closed 404). Public `/i/[token]` page + OG image cut over; query keys preserved. `invoice.defaultSettings` already wired via `default-settings-data` — inventory marked direct Rust. |
| **HARDENING** | **EXHAUSTED** | No remaining easy non-hybrid / non-STOP `| yes |` rows with dashboard UI on tRPC | Remaining UI tRPC callers are hybrids (Trigger/BullMQ/storage/jobs), STOP gates (decrypt/encrypt/Resend/OAuth/Stripe/billing/accounting HTTP), or Stage 4. **Do not invent workarounds.** |
| **SMOKE-1** | **DONE** | Local clone smoke of critical direct-Rust paths (2026-10-03) | Against local `:8787` + Midday Postgres tunnel: `GET /health` ok; checked-in OpenAPI drift ok (145 paths); `by-token` garbage + valid-JWT-missing-row → **404** fail-closed; unauth `auth/me` → **401**; authed **200** for `auth/me`, `team/current`, `transactions`, `invoices`, `documents`, `overview/summary`. Dashboard client unit tests (invoices/documents/overview/transactions) pass. No real invoice `token` row in local DB — public `/i/[token]` E2E still needs a real token. Hybrid split `documents.delete` **skipped** (Rust SQL DELETE exists but **not** in OpenAPI; no established Next storage-after-SQL pattern; keep tRPC). |
| **DC-STAGE4** | **GATED** | Delete `apps/api` + `replacement-backend` (+ scheduled package removals) | **Only** when user says **decommission**. |

### Post-hardening — remaining hybrids (keep on tRPC) + user gates

| Kind | Procedures | Why still Node / tRPC |
|------|------------|------------------------|
| **Hybrid · storage** | `documents.delete`, `inbox.delete` / `deleteMany` | Vault/storage remove after SQL; façade already delegates SQL to Rust then removes in Node. No dashboard Next hybrid pattern — do not invent. |
| **Hybrid · Trigger / jobs** | `team.invite`, `bankConnections.delete`, `customers.enrich`, `invoice.create`, `documents.reprocessDocument`, `inboxAccounts.sync`/`delete`, `inbox.processAttachments`, `transactionAttachments.processAttachment` | Side-effect jobs/email/teardown stay Node. |
| **Hybrid · BullMQ / notify** | `invoiceRecurring.pause`/`delete`/`create`/`update` | Job remove + Node validation/notifications. |
| **Hybrid · Resend** | `oauthApplications.authorize` / `updateApprovalStatus` | SQL may be on Rust façade; email stays Node. |
| **STOP** | decrypt / encrypt / Resend wholes / live OAuth / Stripe·Polar / accounting provider HTTP / `documents.signedUrl(s)` | Do **not** invent. |
| **Stage 4** | delete `apps/api` + `replacement-backend` (+ packages) | User one-shot **`decommission`** only. |

**Recommended user gates (pick one):**

1. **`smoke OK`** — acknowledge local API smoke; optionally provide a real invoice share token to hit `/i/[token]` E2E.
2. **`STOP work`** — leave hybrids/STOP on tRPC; no further cutover.
3. **`decommission`** — only then start **DC-STAGE4** (delete temporary Node façade).)

### Slice 0 — finish in-flight (DC-0)

As of 2026-10-02 mid-stream (may be incomplete on disk):

| Piece | Expected state to mark DONE |
|-------|-----------------------------|
| `bankAccounts.balances` | OpenAPI path + `fetchBankAccountBalances` + `bankAccountBalancesQueryOptions` exist; **verify every former `trpc.bankAccounts.balances` consumer** (UI, chat tools, server) uses Rust helpers with `trpc.bankAccounts.balances.queryKey()`. If no remaining tRPC callers, confirm and mark inventory `direct Rust`. |
| `bankConnections.get` | Clients (`bank-connections.ts` / `-client` / `-server`) + accounts settings page, bank list, metrics, sync action, etc. use Rust; query key preserved. |
| `bankConnections.reconnect` | Enable Banking session route + reconnect hooks call Rust `POST /api/v1/bank-connections/reconnect`. |
| `bankConnections.delete` | **Must remain** `trpc.bankConnections.delete` (Trigger provider teardown). Do not cut over. |
| `bankConnections.create` / `addAccounts` | **Blocked** (encrypt) — do not touch. |

After DC-0 verification + any missing wire-ups: commit+push both remotes → DC-1.

---

## Explicit STOP / ask-user gates

Stop the autopilot loop and report once (do not invent workarounds):

| Gate | Procedures / area |
|------|-------------------|
| **Decrypt** | `bankAccounts.getDetails`, `bankAccounts.getWithPaymentInfo` |
| **Encrypt** | `bankConnections.create`, `bankConnections.addAccounts` |
| **Resend / admin email** | `user.delete`, `apiKeys.upsert`, invoice send/remind email halves, oauth install/approve email |
| **Live OAuth exchange** | `banking.*`, `inboxAccounts.connect` / `exchangeCodeForAccount`, `connectors.*` |
| **Stripe / Polar** | `billing.*`, `invoicePayments.*` |
| **Accounting provider HTTP** | `accounting.getAccounts`, live Fortnox/Xero/QuickBooks export HTTP |
| **Storage-only** | `documents.signedUrl(s)` — no SQL to move; leave façade |
| **Stage 4 decommission** | Deleting `apps/api` / replacement-backend / packages — requires user one-shot **“decommission”** |
| **Hard failures** | Same slice fails focused tests **3 times** → mark `BLOCKED` in inventory + this queue with reason; pause |
| **Secrets / legal / irreversible schema** | Prod secrets missing, AGPL questions, destructive migrations |

`bankConnections.delete` is **not** a “ask to migrate” item — it is **permanently on tRPC for this phase** by design.

---

## Failure handling

- **Fail-closed** on cut-over paths: do not add silent legacy fallbacks that hide Rust bugs.
- **Do not invent decrypt** (or any crypto) in Rust or dashboard to unblock a slice.
- **Do not widen UI redesign** — only swap data sources / types; keep layout, copy, and interaction identical.
- If OpenAPI generation drifts, fix schemas in clone first; never hand-edit `openapi.generated.ts`.
- If midday `origin` (midday-ai) push 403s, skip after one attempt; keep using `torksabig`.
- If clone push fails, fix remote/auth once; do not drop the clone commit.

---

## Repos & remotes

| Repo | Path | Branch | Push target |
|------|------|--------|-------------|
| Midday | `…/fintech/midday` | `cursor/backend-replace-ui-frozen-plans` | `torksabig` |
| Clone API | `…/fintech/clone` | `cursor/backend-replace-ui-frozen-plans` | `origin` |

---

## Already direct Rust (dashboard) — do not re-cut

overview; identity/`team.current` + `team.members`/`team.list`/`team.update`; `user.update` + `user.invites`; invoice defaults + `invoice.getInvoiceByToken`; notifications + status; notification settings prefs/update; categories get/getById/create/update/delete; bank accounts get/create/update/delete/currencies/getTransactionCount (+ balances when DC-0 done); tags CRUD; transactionTags create/delete; bankConnections get/reconnect (when DC-0 done); transactions get/getById/getReviewCount (DC-2); transactions update/updateMany/deleteMany/moveToReview/create (DC-3/H3); inbox get/getById/checkAttachments (+ search/getByStatus helpers) (DC-4); inbox update/match/confirm/decline/unmatch + blocklist get/create/delete + create (DC-H2/H8; delete/deleteMany hybrid tRPC); documents get/getById/getRelatedDocuments (DC-5); customers get/getById/getInvoiceSummary + portal public reads (DC-6/H7); invoices get/getById/paymentStatus/invoiceSummary (DC-7; send/PDF/remind stay gated); trackerEntries getTimerStatus/getCurrentTimer/startTimer/stopTimer/byRange/byDate (DC-8a); trackerProjects get/getById/upsert/delete + trackerEntries upsert/delete/getBillableHours (DC-8b); documentTags + documentTagAssignments; institutions get/updateUsage; shortLinks.get; apiKeys get/delete; apps get/disconnect/update + createPlatformLinkToken (DC-8/H8); search.global + invoice customer metrics + transactions getSimilarTransactions/searchTransactionMatch (DC-H1); team connectionStatus/teamInvites/invitesByEmail/accept/decline/deleteInvite/updateMember/deleteMember (DC-H2); invoice satellite reads + inboxAccounts.get (DC-H4); invoiceProducts get/getById/create/updateProduct/delete/incrementUsage/saveLineItemAsProduct (DC-H5a); reports revenue/profit/burnRate/runway/expense/spending/taxSummary/getAccountBalances/revenueForecast/getByLinkId/getChartDataByLinkId/create (DC-H5b); invoiceRecurring get/getUpcoming/resume (+ list helpers) (DC-H5c); invoiceTemplate list/get/count/create/upsert/setDefault/delete (DC-H6a); search.attachments + transactionAttachments createMany/delete (DC-H6b); oauthApplications list/get/create/update/delete/regenerateSecret/authorized/revokeAccess/getApplicationInfo (DC-H6c); user.switchTeam + team.leave (DC-H6d).

**Hardening queue exhausted (DC-H9). SMOKE-1 done 2026-10-03.** Remaining façade-delegated / tRPC UI callers are hybrid or STOP-gated only — see post-hardening table above. Hybrid stays on tRPC: `inbox.delete`/`deleteMany`, `team.invite`, `bankConnections.delete`, `oauthApplications.authorize`/`updateApprovalStatus` (Resend), `invoiceRecurring.pause`/`delete` (BullMQ), `invoiceRecurring.create`/`update` (Node notifications/validation), `invoice.create` (send/schedule Trigger), `documents.delete` (vault storage; Next hybrid split skipped), `documents.reprocessDocument`, `customers.enrich`, `inboxAccounts.sync`/`delete`, `transactionAttachments.processAttachment` (jobs). **Next user action:** `smoke OK` / `STOP work` / **`decommission`**.

---

## Success line (each iteration)

```text
DC-N done: <procedures> | midday <sha> → torksabig | clone <sha> → origin | next=DC-(N+1)
```

---

## Agent prompt block (paste to start a zero-approval run)

```text
Run Midday→Rust direct-cutover autopilot per docs/plans/2026-10-02-autopilot-direct-cutover.md until a STOP/GATED condition.

Standing authorization: implement, test, update inventory, commit, and push both repos without asking me to continue or approve each slice.
- Midday: branch cursor/backend-replace-ui-frozen-plans → push torksabig
- Clone: branch cursor/backend-replace-ui-frozen-plans → push origin

Rules:
- Frozen apps/dashboard UI; durable logic in sibling fintech/clone Axum API.
- Direct dashboard→Rust via utoipa OpenAPI + `bun run generate:rust-api`; preserve React Query keys from tRPC.
- apps/api stays as temporary tRPC façade; do NOT start Stage 4 teardown unless I say "decommission".
- Leave bankConnections.delete on tRPC. Do not implement decrypt/encrypt/Resend/live OAuth/Stripe/accounting-provider wholes. Skip bankConnections.create/addAccounts.
- Start at first IN_FLIGHT/PENDING queue row (DC-0 finish-in-flight if incomplete). Definition of Done per plan. After each DONE slice, immediately start the next.
```

Optional: Cursor **Loop** / Automation on a timer with the same prompt.

---

## Related

- [2026-09-28-autopilot-migration-continuation.md](./2026-09-28-autopilot-migration-continuation.md) — superseded (façade-delegation autopilot); points here
- [Delegation inventory](./2026-09-28-delegation-inventory.md) — procedure status source of truth
- [Clean Rust replacement](./2026-09-28-clean-rust-replacement-no-proxy.md) — stages 1–4
- [Still to be worked on](./still-to-be-worked-on.md) — blocked/external leftovers
- [Clone-only cutover](./2026-09-29-clone-only-cutover.md) — earlier dual-stack notes (façade era)

## Dashboard UI QA leftovers (2026-10-04)

Focused retest after clone timer duration fix (`517d9f4`) + notifications query fix (`b51179bde`):

| Flow | Result |
|------|--------|
| Tags create + assign on transaction sheet | **PASS** — MultipleSelector now opens on type; SelectTags Enter/onCreate persists `tags` + `transaction_tags` |
| Tracker start/stop duration | **PASS** — stop returns sane seconds (e.g. 3s); UI discards &lt;1m entries by design |
| Inbox file upload → row | **PASS** — `POST /api/v1/inbox` creates row; local vault TUS now uses `NEXT_PUBLIC_SUPABASE_URL` + seeded `vault` bucket/RLS |

Still **no Stage 4 / decommission**.
