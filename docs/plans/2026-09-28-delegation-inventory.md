# tRPC delegation inventory (2026-09-28)

Branch: `cursor/backend-replace-ui-frozen-plans` · Glue: `@midday/replacement-backend` + `MIDDAY_BACKEND_MODE` (`legacy` | `dual` | `replacement`) · Rust: `fintech/clone` Axum `:8787`

**Counts:** **41 / ~256** procedures delegate reads to Rust when mode is `dual` or `replacement` (~16.0%). All other procedures still hit Drizzle/legacy in `apps/api`.

| Procedure path | Delegated? | Notes |
| --- | --- | --- |
| `user.me` | yes | read · identity |
| `user.update` | no | write |
| `user.switchTeam` | no | write |
| `user.delete` | no | write |
| `user.invites` | no | read |
| `team.current` | yes | read · identity |
| `team.*` (other) | no | writes / team admin reads |
| `bankAccounts.get` | yes | read · `enabled`/`manual` filters |
| `bankAccounts.*` (other) | no | balances, details, writes |
| `bankConnections.get` | yes | read · list + nested accounts (Phase 6 slice 1) |
| `bankConnections.*` (other) | no | create, delete, reconnect |
| `transactionCategories.get` | yes | read · full tree |
| `transactionCategories.*` (other) | no | getById, CRUD |
| `transactions.get` | yes | read · list filters (Phase 2e matrix) |
| `transactions.getById` | yes | read |
| `transactions.getReviewCount` | yes | read |
| `transactions.*` (other) | no | mutations, export, import, AI CSV |
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
| `customers.get` | yes | read · list (Phase 4) |
| `customers.getById` | yes | read (Phase 4) |
| `customers.*` (other) | no | portal public, CRUD, enrichment |
| `invoice.get` | yes | read · list (Phase 4) |
| `invoice.getById` | yes | read (Phase 4) |
| `invoice.getInvoiceByToken` | yes | public · token verified in API, read by id (Phase 6 slice 1) |
| `invoice.paymentStatus` | yes | read · weighted score (Phase 5 slice 1) |
| `invoice.invoiceSummary` | yes | read · FX rollup (Phase 5 slice 1) |
| `invoice.*` (other) | no | mutations |
| `trackerProjects.get` | yes | read · list (Phase 6 slice 1) |
| `trackerProjects.*` (other) | no | getById, CRUD |
| `trackerEntries.byRange` | yes | read · calendar week/month (Phase 6 slice 1) |
| `trackerEntries.getBillableHours` | yes | read · earnings rollup (Phase 6 slice 1) |
| `trackerEntries.*` (other) | no | byDate, timer, mutations |
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
| All other routers | no | accounting, banking, billing, vault tags, notifications, oauth, etc. |

**Rust routes used:** `/api/v1/auth/me`, `/team/current`, `/bank-accounts`, `/bank-connections`, `/categories`, `/transactions`, `/transactions/review-count`, `/transactions/:id`, `/inbox*`, `/overview/summary`, `/documents`, `/documents/:id`, `/documents/:id/related`, `/customers`, `/customers/:id`, `/invoices`, `/invoices/:id`, `/invoices/public/:id`, `/invoices/payment-status`, `/invoices/summary`, `/tracker/projects`, `/tracker/entries/by-range`, `/tracker/billable-hours`, `/search/global`, `/search/attachments`, `/reports/revenue`, `/reports/profit`, `/reports/burn-rate`, `/reports/runway`, `/reports/expense`, `/reports/spending`, `/reports/tax-summary`, `/reports/account-balances`, `/reports/revenue-forecast`, `/reports/public/:link_id`, `/reports/public/:link_id/chart`.

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

### Tracker reads parity (Phase 6 slice 1)

| Concern | Rust | Legacy Drizzle |
| --- | --- | --- |
| Project list pagination / filters | Yes · core filters + sort columns | Full FTS `q` via `to_tsquery` |
| Assigned users on projects | Yes · distinct entry assignees | `get_assigned_users_for_project()` |
| `byRange` grouped by date | Yes | Same shape |
| `getBillableHours` week/month window | Yes · UTC date math | `@date-fns` week start |
| `byDate` / timer procedures | No | Legacy only |

**Phase 5 slice 4:** Revenue forecast, public report reads, attachment search; mapper tests in `@midday/replacement-backend`.

**Phase 6 slice 1:** Tracker project list, entries by range, billable hours; public invoice by token; bank connections list.
