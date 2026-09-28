# tRPC delegation inventory (2026-09-28)

Branch: `cursor/backend-replace-ui-frozen-plans` · Glue: `@midday/replacement-backend` + `MIDDAY_BACKEND_MODE` (`legacy` | `dual` | `replacement`) · Rust: `fintech/clone` Axum `:8787`

**Autopilot:** Agents run slices from the queue below without per-step user approval — see [Autopilot migration continuation](./2026-09-28-autopilot-migration-continuation.md).

**Counts:** **59 / ~256** read procedures delegate to Rust when mode is `dual` or `replacement` (~23.0%). **1** write procedure delegates (`transactions.update`). All other procedures still hit Drizzle/legacy in `apps/api`.

| Procedure path | Delegated? | Notes |
| --- | --- | --- |
| `user.me` | yes | read · identity |
| `user.update` | no | write |
| `user.switchTeam` | no | write |
| `user.delete` | no | write |
| `user.invites` | yes | read · pending team invites by email (Phase 10) |
| `team.current` | yes | read · identity |
| `team.*` (other) | no | writes / team admin reads |
| `bankAccounts.get` | yes | read · `enabled`/`manual` filters |
| `bankAccounts.balances` | yes | read · `get_team_bank_accounts_balances()` (Phase 10) |
| `bankAccounts.currencies` | yes | read · `get_bank_account_currencies()` (Phase 10) |
| `bankAccounts.getTransactionCount` | yes | read · tx count for delete dialog (Phase 11) |
| `bankAccounts.*` (other) | no | getDetails (decrypt), payment info, writes |
| `bankConnections.get` | yes | read · list + nested accounts (Phase 6 slice 1) |
| `bankConnections.*` (other) | no | create, delete, reconnect |
| `transactionCategories.get` | yes | read · full tree |
| `transactionCategories.*` (other) | no | getById, CRUD |
| `transactions.get` | yes | read · list filters (Phase 2e matrix) |
| `transactions.getById` | yes | read |
| `transactions.getReviewCount` | yes | read |
| `transactions.update` | yes | **write** · partial PATCH-style PUT on Midday Postgres; clears tax on category change; drops `accounting_sync_records` when un-exporting (Phase 11 **first write**) |
| `transactions.*` (other) | no | updateMany, export, import, AI CSV |
| `inbox.get` | yes | read · list |
| `inbox.getById` | yes | read |
| `inbox.checkAttachments` | yes | read |
| `inbox.search` | yes | read |
| `inbox.getByStatus` | yes | read |
| `inbox.*` (other) | no | mutations, blocklist sub-router |
| `overview.summary` | yes | read · dashboard home |
| `documents.get` | yes | read · list (Phase 4) |
| `documents.getById` | yes | read (Phase 4) |
| `documents.getRelatedDocuments` | yes | read · `match_similar_documents_by_title()` (Phase 5 slice 3) |
| `documents.*` (other) | no | attachments, vault mutations |
| `documentTags.get` | yes | read · vault tag list (Phase 10) |
| `documentTags.*` (other) | no | create, delete |
| `customers.get` | yes | read · list (Phase 4) |
| `customers.getById` | yes | read (Phase 4) |
| `customers.*` (other) | no | portal public, CRUD, enrichment |
| `invoice.get` | yes | read · list (Phase 4) |
| `invoice.getById` | yes | read (Phase 4) |
| `invoice.getInvoiceByToken` | yes | public · token verified in API, read by id (Phase 6 slice 1) |
| `invoice.paymentStatus` | yes | read · weighted score (Phase 5 slice 1) |
| `invoice.invoiceSummary` | yes | read · FX rollup (Phase 5 slice 1) |
| `invoice.mostActiveClient` | yes | read · 30d dashboard metric (Phase 10) |
| `invoice.inactiveClientsCount` | yes | read · 30d dashboard metric (Phase 10) |
| `invoice.averageDaysToPayment` | yes | read · 30d dashboard metric (Phase 10) |
| `invoice.averageInvoiceSize` | yes | read · 30d by currency (Phase 10) |
| `invoice.topRevenueClient` | yes | read · 30d dashboard metric (Phase 10) |
| `invoice.newCustomersCount` | yes | read · 30d dashboard metric (Phase 10) |
| `invoice.*` (other) | no | mutations |
| `trackerProjects.get` | yes | read · list (Phase 6 slice 1) |
| `trackerProjects.getById` | yes | read · detail + assigned users (Phase 9) |
| `trackerProjects.*` (other) | no | CRUD |
| `trackerEntries.byRange` | yes | read · calendar week/month (Phase 6 slice 1) |
| `trackerEntries.getBillableHours` | yes | read · earnings rollup (Phase 6 slice 1) |
| `trackerEntries.byDate` | yes | read · day sheet (Phase 9) |
| `trackerEntries.getCurrentTimer` | yes | read · running entry (Phase 9) |
| `trackerEntries.getTimerStatus` | yes | read · elapsed + summary (Phase 9) |
| `trackerEntries.*` (other) | no | upsert, delete, start/stop timer mutations |
| `accounting.getSyncStatus` | yes | read · `accounting_sync_records` (Phase 9) |
| `accounting.getConnections` | yes | read · connected apps (Phase 9) |
| `accounting.getAccounts` | no | external provider API |
| `accounting.*` (other) | no | export, disconnect writes |
| `search.global` | yes | read · `global_search()` RPC (Phase 5 slice 2) |
| `search.attachments` | yes | read · inbox ILIKE + invoice list (Phase 5 slice 4) |
| `reports.revenue` | yes | read · chart YoY (Phase 5 slice 3) |
| `reports.profit` | yes | read · chart YoY |
| `reports.burnRate` | yes | read · monthly burn |
| `reports.runway` | yes | read · median burn × cash |
| `reports.expense` | yes | read · recurring split |
| `reports.spending` | yes | read · category breakdown |
| `reports.taxSummary` | yes | read · VAT-style rollup |
| `reports.getAccountBalances` | yes | read · cash accounts |
| `reports.revenueForecast` | yes | read · bottom-up forecast (Phase 5 slice 4) |
| `reports.getByLinkId` | yes | public share · no auth (Phase 5 slice 4) |
| `reports.getChartDataByLinkId` | yes | public chart · no auth (Phase 5 slice 4) |
| `reports.create` | no | write |
| `tags.get` | yes | read · transaction tag list (Phase 11) |
| `tags.*` (other) | no | CRUD |
| All other routers | no | notifications, oauth, banking adapters, etc. |

**Rust routes used:** `/api/v1/auth/me`, `/team/current`, `/user/invites`, `/bank-accounts`, `/bank-accounts/balances`, `/bank-accounts/currencies`, `/bank-accounts/:id/transaction-count`, `/bank-connections`, `/document-tags`, `/tags`, `/categories`, `/transactions`, `/transactions/review-count`, `/transactions/:id` (GET + **PUT**), `/inbox*`, `/overview/summary`, `/documents`, `/documents/:id`, `/documents/:id/related`, `/customers`, `/customers/:id`, `/invoices`, `/invoices/:id`, `/invoices/public/:id`, `/invoices/payment-status`, `/invoices/summary`, `/invoices/metrics/*`, `/tracker/projects`, `/tracker/projects/:id`, `/tracker/entries/by-date`, `/tracker/entries/by-range`, `/tracker/timer/current`, `/tracker/timer/status`, `/tracker/billable-hours`, `/accounting/sync-status`, `/accounting/connections`, `/search/global`, `/search/attachments`, `/reports/*`.

### `search.global` parity (Rust vs Drizzle façade)

| Concern | Rust / delegated path | Legacy Drizzle path |
| --- | --- | --- |
| Primary FTS | Yes · calls Postgres `global_search()` with same arg order as `@midday/db` | Same stored procedure |
| Multi-word empty → LLM semantic fallback | No · still runs in `apps/api` via `global_semantic_search()` + `generateLLMFilters` when delegated FTS returns `[]` | Same |
| `global_semantic_search` filters (amount, dates, types, …) | Not in Rust | LLM fallback only |
| Exchange-rate cache (4h TTL) on unrelated paths | N/A | N/A |

### `search.attachments` parity (Phase 5 slice 4)

| Concern | Rust | Legacy Drizzle |
| --- | --- | --- |
| Inbox ILIKE / amount tolerance | Yes · reuses `/inbox/search` SQL | Same + optional FTS |
| Invoice ILIKE list | Yes · `statuses` unpaid/overdue/paid | Same |
| `transactionId` smart ranking | **No** | Yes · tx-context re-rank |

### Dashboard `reports.*` parity (Phase 5 slice 3–4)

| Concern | Rust | Legacy `@midday/db` |
| --- | --- | --- |
| Currency resolution | Team `base_currency` or input | Same |
| `resolvedAmount` + `exchange_rates` subquery | Yes | Same CASE expression |
| Revenue slugs / contra-revenue | Yes · shared constants | Same |
| Profit COGS tree | Yes · `cost-of-goods-sold` children | Same |
| Chart YoY wrapper (`getReports`) | Yes · in Rust | Drizzle |
| `revenueForecast` bottom-up | Yes · `reports_forecast.rs` | Full Drizzle model |
| Recurring invoice schedule TZ | **UTC calendar math** | `@date-fns/tz` |
| Recurring tx FX batch | Partial · skips unmatched currency | Full batch rates |
| Public share links | Yes · public router, linkId only | Drizzle |

### Tracker reads parity (Phase 6 + 9)

| Concern | Rust | Legacy Drizzle |
| --- | --- | --- |
| Project list pagination / filters | Yes · core filters + sort columns | Full FTS `q` via `to_tsquery` |
| Assigned users on projects | Yes · distinct entry assignees / `get_assigned_users_for_project()` on getById | Same |
| `byRange` grouped by date | Yes | Same shape |
| `getBillableHours` week/month window | Yes · UTC date math | `@date-fns` week start |
| `byDate` day entries | Yes | Same |
| Timer current / status | Yes · local day bounds for running entry | Same |
| Timer `project` alias on current entry | Yes · duplicated from `tracker_project` | Legacy shape |

### Phase 10 invoice dashboard metrics parity

| Concern | Rust | Legacy Drizzle |
| --- | --- | --- |
| 30-day rolling window | Yes · `NOW() - INTERVAL '30 days'` | JS `Date` math |
| Tracker date filter on `byDate` | Yes · cast to date | ISO date string split |
| Nullable “no client” rows | Yes · explicit `{ delegated, value }` in glue | Same `null` |

**Phase 9:** Tracker byDate, getById, timer reads; accounting sync status + connections list.

**Phase 10:** `user.invites`, `bankAccounts.balances`/`currencies`, `documentTags.get`, invoice dashboard metric reads (`mostActiveClient`, `inactiveClientsCount`, `averageDaysToPayment`, `averageInvoiceSize`, `topRevenueClient`, `newCustomersCount`).

**Phase 11:** `tags.get`, `bankAccounts.getTransactionCount`; **first write** `transactions.update` (Rust partial UPDATE + tRPC delegation with dual Drizzle fallback).

### `transactions.update` write parity (Phase 11 — first delegated mutation)

| Concern | Rust / delegated path | Legacy Drizzle path |
| --- | --- | --- |
| Partial field update | Yes · JSON keys only | Same spread into `update()` |
| Tax clear on `categorySlug` | Yes | Same |
| Un-export sync record delete | Yes · when `status` present and ≠ `exported` | Same |
| Activity feed (`transactions_categorized` / `_assigned`) | **No** | Yes · `createActivity` |
| Return shape | Yes · full tx + suggestion via GET SQL | `getTransactionById` |

## Autopilot queue

Agent: pick the **first `PENDING` row**, implement, mark `DONE` (or `BLOCKED` + reason), update counts above, commit, push `torksabig`.

| ID | Status | Scope | Type |
|----|--------|--------|------|
| AP-12 | PENDING | `notifications.*` list/read procedures | read |
| AP-12b | PENDING | `transactions.updateMany` | write |
| AP-12c | PENDING | One inbox write (`update` or ignore — smallest) | write |
| AP-13 | PENDING | `team.*` / `user.*` settings reads not in table as `yes` | read |
| AP-14 | PENDING | One invoice write (draft create or update) | write |
| AP-15 | BLOCKED | `bankAccounts.getDetails` — needs safe decrypt path | read |
| AP-16 | PENDING | OAuth / connection reads from inventory gaps | read |
| AP-17 | PENDING | `transactions.create` or `transactions.delete` (one) | write |
| AP-18 | PENDING | Inbox mutations batch | write |
| AP-19 | PENDING | Parity: FTS `q`, tx update activity feed | parity |
| AP-20 | PENDING | Delete Drizzle for routers at 100% delegation | delete |
| AP-STAGE3 | PENDING | Rust job consumers (replace Node producers) | infra |
| AP-STAGE4 | PENDING | Delete `apps/api` + `replacement-backend` — **user must say decommission** | delete |

**Legacy note (Phase 12):** same as AP-12…AP-12c rows above.
