# tRPC delegation inventory (2026-09-28)

Branch: `cursor/backend-replace-ui-frozen-plans` · Glue: `@midday/replacement-backend` + `MIDDAY_BACKEND_MODE` (`legacy` | `dual` | `replacement`) · Rust: `fintech/clone` Axum `:8787`

**Autopilot:** Agents run slices from the queue below without per-step user approval — see [Autopilot migration continuation](./2026-09-28-autopilot-migration-continuation.md).

**Counts:** **86 / ~256** read procedures delegate to Rust when mode is `dual` or `replacement` (~33.6%). **74** write procedures delegate (`transactions.update`, `transactions.updateMany`, `transactions.deleteMany`, `inbox.update`, `inbox.matchTransaction`, `inbox.delete`, `inbox.deleteMany`, `inbox.blocklist.create`, `inbox.blocklist.delete`, `invoice.update`, `invoice.draft`, `invoice.delete`, `invoice.duplicate`, `invoice.updateSchedule`, `invoice.cancelSchedule`, `notifications.updateStatus`, `notifications.updateAllStatus`, `user.update`, `team.update`, `team.acceptInvite`, `team.declineInvite`, `team.deleteInvite`, `team.deleteMember`, `team.updateMember`, `team.leave`, `tags.create`, `tags.update`, `tags.delete`, `documentTags.create`, `documentTags.delete`, `documentTagAssignments.create`, `documentTagAssignments.delete`, `transactionTags.create`, `transactionTags.delete`, `customers.delete`, `customers.upsert`, `documents.delete`, `trackerEntries.startTimer`, `trackerEntries.stopTimer`, `trackerEntries.upsert`, `trackerEntries.delete`, `notificationSettings.update`, `notificationSettings.bulkUpdate`, `transactionCategories.create`, `transactionCategories.update`, `transactionCategories.delete`, `oauthApplications.create`, `oauthApplications.update`, `oauthApplications.delete`, `oauthApplications.regenerateSecret`, `oauthApplications.revokeAccess`, `invoiceProducts.delete`, `invoiceProducts.incrementUsage`, `invoiceProducts.create`, `invoiceProducts.upsert`, `invoiceProducts.updateProduct`, `invoiceProducts.saveLineItemAsProduct`, `invoiceTemplate.create`, `invoiceTemplate.upsert`, `invoiceTemplate.setDefault`, `invoiceTemplate.delete`, `trackerProjects.upsert`, `trackerProjects.delete`, `apps.disconnect`, `apps.update`, `apps.updateSettings`, `apiKeys.delete`, `reports.create`, `shortLinks.createForUrl`, `accounting.disconnect`, `bankAccounts.create`, `bankAccounts.update`, `bankAccounts.delete`, `institutions.updateUsage`). All other procedures still hit Drizzle/legacy in `apps/api`.

| Procedure path | Delegated? | Notes |
| --- | --- | --- |
| `user.me` | yes | read · identity |
| `user.update` | yes | **write** · preference fields PATCH (AP-21); no Supabase admin / email |
| `user.switchTeam` | no | write · cache invalidation |
| `user.delete` | no | write · Supabase admin + Resend |
| `user.invites` | yes | read · pending team invites by email (Phase 10) |
| `team.current` | yes | read · identity |
| `team.members` | yes | read · AP-13 |
| `team.list` | yes | read · AP-13 |
| `team.teamInvites` | yes | read · AP-13 |
| `team.update` | yes | **write** · name/currency/settings PATCH (AP-22) |
| `team.connectionStatus` | yes | read · bank + inbox status summary (AP-26) |
| `team.acceptInvite` | yes | **write** · join team from invite (AP-41) |
| `team.declineInvite` | yes | **write** · delete invite by email (AP-41) |
| `team.deleteInvite` | yes | **write** · owner cancels invite (AP-41) |
| `team.invitesByEmail` | yes | read · reuse `/user/invites` (AP-41) |
| `team.deleteMember` | yes | **write** · owner removes member; cache invalidate Node (AP-42) |
| `team.updateMember` | yes | **write** · owner role change (AP-42) |
| `team.leave` | yes | **write** · leave team; last-owner guard; cache invalidate Node (AP-43) |
| `team.*` (other) | no | create/delete/invite emails |
| `notifications.list` | yes | read · activities feed (AP-12) |
| `notifications.updateStatus` | yes | **write** · single activity status (AP-20 follow-on) |
| `notifications.updateAllStatus` | yes | **write** · bulk status for current user (AP-21) |
| `notifications.*` (other) | no | — |
| `notificationSettings.get` | yes | read · user/team channel settings (AP-25) |
| `notificationSettings.update` | yes | **write** · single channel upsert (AP-28) |
| `notificationSettings.bulkUpdate` | yes | **write** · bulk channel upserts (AP-28) |
| `notificationSettings.*` (other) | no | getAll (JS type catalog) |
| `bankAccounts.get` | yes | read · `enabled`/`manual` filters |
| `bankAccounts.balances` | yes | read · `get_team_bank_accounts_balances()` (Phase 10) |
| `bankAccounts.currencies` | yes | read · `get_bank_account_currencies()` (Phase 10) |
| `bankAccounts.getTransactionCount` | yes | read · tx count for delete dialog (Phase 11) |
| `bankAccounts.create` | yes | **write** · manual account insert (AP-44) |
| `bankAccounts.update` | yes | **write** · partial update (AP-44) |
| `bankAccounts.delete` | yes | **write** · team-scoped delete (AP-44) |
| `bankAccounts.*` (other) | no | getDetails (decrypt), payment info (decrypt) |
| `bankConnections.get` | yes | read · list + nested accounts (Phase 6 slice 1) |
| `bankConnections.*` (other) | no | create, delete, reconnect |
| `apps.get` | yes | read · team installed apps (AP-16); preserves `app_id` snake_case |
| `apps.disconnect` | yes | **write** · delete app + platform identities (AP-39) |
| `apps.update` | yes | **write** · single settings option (AP-39) |
| `apps.updateSettings` | yes | **write** · replace settings array (AP-39) |
| `apps.*` (other) | no | WhatsApp/platform link |
| `apiKeys.get` | yes | read · team keys metadata, no raw secrets (AP-26) |
| `apiKeys.delete` | yes | **write** · DB delete; cache invalidation stays Node (AP-40) |
| `apiKeys.*` (other) | no | upsert (Resend email) |
| `oauthApplications.list` | yes | read · team OAuth apps (AP-16) |
| `oauthApplications.get` | yes | read · by id + createdByUser (AP-31) |
| `oauthApplications.create` | yes | **write** · insert + SHA-256 client secret hash; plaintext returned once (AP-31) |
| `oauthApplications.update` | yes | **write** · partial update + slug regen (AP-31) |
| `oauthApplications.delete` | yes | **write** · team-scoped delete (AP-31) |
| `oauthApplications.regenerateSecret` | yes | **write** · SHA-256 hash rotate; plaintext once (AP-38) |
| `oauthApplications.authorized` | yes | read · user tokens for team (AP-45) |
| `oauthApplications.revokeAccess` | yes | **write** · revoke user tokens (AP-45) |
| `oauthApplications.*` (other) | no | authorize, approval (email) |
| `inboxAccounts.get` | yes | read · connected inboxes (AP-16) |
| `inboxAccounts.*` (other) | no | connect, sync, delete |
| `transactionCategories.get` | yes | read · full tree |
| `transactionCategories.getById` | yes | read · detail + children (AP-24) |
| `transactionCategories.create` | yes | **write** · insert + activity (AP-30); embedding stays in Node |
| `transactionCategories.update` | yes | **write** · partial update (AP-30) |
| `transactionCategories.delete` | yes | **write** · non-system only (AP-30) |
| `transactionCategories.*` (other) | no | — |
| `transactionTags.create` | yes | **write** · link tag to tx (AP-24) |
| `transactionTags.delete` | yes | **write** · unlink tag (AP-24) |
| `transactions.get` | yes | read · list filters (Phase 2e matrix) |
| `transactions.getById` | yes | read |
| `transactions.getReviewCount` | yes | read |
| `transactions.update` | yes | **write** · partial PATCH-style PUT on Midday Postgres; clears tax on category change; drops `accounting_sync_records` when un-exporting (Phase 11 **first write**) |
| `transactions.updateMany` | yes | **write** · bulk PATCH + tag insert + sync record delete (AP-12b); no bulk activity feed |
| `transactions.deleteMany` | yes | **write** · manual txs only (AP-17) |
| `transactions.*` (other) | no | create, export, import, AI CSV |
| `inbox.get` | yes | read · list |
| `inbox.getById` | yes | read |
| `inbox.checkAttachments` | yes | read |
| `inbox.search` | yes | read |
| `inbox.getByStatus` | yes | read |
| `inbox.update` | yes | **write** · partial PUT (AP-12c); `status: deleted` not on Rust path |
| `inbox.matchTransaction` | yes | **write** · single-item match + attachment (AP-18); no grouped-inbox siblings |
| `inbox.delete` | yes | **write** · soft-delete + attachment/suggestion cleanup (AP-18); storage remove stays in API |
| `inbox.deleteMany` | yes | **write** · batch soft-delete (AP-18) |
| `inbox.blocklist.get` | yes | read · team blocklist (AP-40) |
| `inbox.blocklist.create` | yes | **write** · insert blocklist row (AP-40) |
| `inbox.blocklist.delete` | yes | **write** · delete blocklist row (AP-40) |
| `inbox.*` (other) | no | unmatch, confirm/decline, create |
| `overview.summary` | yes | read · dashboard home |
| `documents.get` | yes | read · list (Phase 4) |
| `documents.getById` | yes | read (Phase 4) |
| `documents.getRelatedDocuments` | yes | read · `match_similar_documents_by_title()` (Phase 5 slice 3) |
| `documents.checkAttachments` | yes | read · path token attachment check (AP-25) |
| `documents.delete` | yes | **write** · DB + attachment cleanup (AP-26); storage remove in Node |
| `documents.*` (other) | no | vault process/reprocess, signed URLs |
| `documentTags.get` | yes | read · vault tag list (Phase 10) |
| `documentTags.create` | yes | **write** · insert tag (AP-23); embedding stays in Node |
| `documentTags.delete` | yes | **write** · delete tag (AP-23) |
| `documentTagAssignments.create` | yes | **write** · assign tag to document (AP-23) |
| `documentTagAssignments.delete` | yes | **write** · unassign tag (AP-23) |
| `customers.get` | yes | read · list (Phase 4) |
| `customers.getById` | yes | read (Phase 4) |
| `customers.delete` | yes | **write** · fetch-then-delete (AP-24) |
| `customers.upsert` | yes | **write** · DB upsert + tags (AP-28); enrichment job stays in Node |
| `customers.*` (other) | no | portal public, enrich mutations |
| `invoice.get` | yes | read · list (Phase 4) |
| `invoice.getById` | yes | read (Phase 4) |
| `invoice.getInvoiceByToken` | yes | public · token verified in API, read by id (Phase 6 slice 1) |
| `invoice.paymentStatus` | yes | read · weighted score (Phase 5 slice 1) |
| `invoice.searchInvoiceNumber` | yes | read · ILIKE existence check (AP-25) |
| `invoice.invoiceSummary` | yes | read · FX rollup (Phase 5 slice 1) |
| `invoice.mostActiveClient` | yes | read · 30d dashboard metric (Phase 10) |
| `invoice.inactiveClientsCount` | yes | read · 30d dashboard metric (Phase 10) |
| `invoice.averageDaysToPayment` | yes | read · 30d dashboard metric (Phase 10) |
| `invoice.averageInvoiceSize` | yes | read · 30d by currency (Phase 10) |
| `invoice.topRevenueClient` | yes | read · 30d dashboard metric (Phase 10) |
| `invoice.newCustomersCount` | yes | read · 30d dashboard metric (Phase 10) |
| `invoice.update` | yes | **write** · partial PUT status/paidAt/internalNote/scheduledAt (AP-14); no activity feed for paid/canceled |
| `invoice.draft` | yes | **write** · upsert draft row (AP-29); `getNextInvoiceNumber` stays in Node |
| `invoice.delete` | yes | **write** · draft/canceled only (AP-32) |
| `invoice.duplicate` | yes | **write** · copy as draft; number gen stays Node (AP-33) |
| `invoice.updateSchedule` | yes | **write** · DB after Trigger job create in Node (AP-33) |
| `invoice.cancelSchedule` | yes | **write** · DB after Trigger cancel in Node (AP-33) |
| `invoice.*` (other) | no | create/send, remind, etc. |
| `trackerProjects.get` | yes | read · list (Phase 6 slice 1) |
| `trackerProjects.getById` | yes | read · detail + assigned users (Phase 9) |
| `trackerProjects.upsert` | yes | **write** · insert/update + tags + activity (AP-38) |
| `trackerProjects.delete` | yes | **write** · team-scoped delete (AP-38) |
| `trackerEntries.byRange` | yes | read · calendar week/month (Phase 6 slice 1) |
| `trackerEntries.getBillableHours` | yes | read · earnings rollup (Phase 6 slice 1) |
| `trackerEntries.byDate` | yes | read · day sheet (Phase 9) |
| `trackerEntries.getCurrentTimer` | yes | read · running entry (Phase 9) |
| `trackerEntries.getTimerStatus` | yes | read · elapsed + summary (Phase 9) |
| `trackerEntries.startTimer` | yes | **write** · start running entry (AP-27); stops prior running timer |
| `trackerEntries.stopTimer` | yes | **write** · stop / discard <60s (AP-27) |
| `trackerEntries.upsert` | yes | **write** · multi-date upsert + activity on create (AP-32) |
| `trackerEntries.delete` | yes | **write** · team-scoped delete (AP-32) |
| `trackerEntries.*` (other) | no | bulkCreate |
| `accounting.getSyncStatus` | yes | read · `accounting_sync_records` (Phase 9) |
| `accounting.getConnections` | yes | read · connected apps (Phase 9) |
| `accounting.getAccounts` | no | external provider API |
| `accounting.disconnect` | yes | **write** · delete app row (reuses `/apps/:appId` DELETE) (AP-43) |
| `accounting.*` (other) | no | export writes |
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
| `reports.create` | yes | **write** · insert share link; shortUrl in Node (AP-40) |
| `tags.get` | yes | read · transaction tag list (Phase 11) |
| `tags.create` | yes | **write** · insert tag (AP-22) |
| `tags.update` | yes | **write** · rename tag (AP-22) |
| `tags.delete` | yes | **write** · delete tag (AP-22) |
| `shortLinks.get` | yes | public read · by shortId (AP-42) |
| `shortLinks.createForUrl` | yes | **write** · insert redirect; shortUrl in Node (AP-42) |
| `shortLinks.*` (other) | no | createForDocument (signed URL) |
| All other routers | no | oauth flow, banking adapters, etc. |

| `invoiceTemplate.list` | yes | read · team templates (AP-35) |
| `invoiceTemplate.get` | yes | read · by id (AP-35) |
| `invoiceTemplate.count` | yes | read · team count (AP-35) |
| `invoiceTemplate.create` | yes | **write** · insert + first/default logic (AP-35) |
| `invoiceTemplate.upsert` | yes | **write** · by id or default (AP-36) |
| `invoiceTemplate.setDefault` | yes | **write** · atomic default swap (AP-36) |
| `invoiceTemplate.delete` | yes | **write** · refuse last template (AP-36) |
| `invoiceProducts.get` | yes | read · list filters (AP-34) |
| `invoiceProducts.getById` | yes | read · detail (AP-34) |
| `invoiceProducts.create` | yes | **write** · insert product (AP-37) |
| `invoiceProducts.upsert` | yes | **write** · conflict on team+name+currency+price (AP-37) |
| `invoiceProducts.updateProduct` | yes | **write** · partial update (AP-37) |
| `invoiceProducts.delete` | yes | **write** · team-scoped delete (AP-34) |
| `invoiceProducts.incrementUsage` | yes | **write** · bump usage count (AP-34) |
| `invoiceProducts.saveLineItemAsProduct` | yes | **write** · update-or-upsert from line item (AP-39) |
| `invoiceRecurring.list` | yes | read · paginated series list (AP-43) |
| `invoiceRecurring.get` | yes | read · series detail + customer (AP-43) |
| `invoiceRecurring.*` (other) | no | create/update/pause/resume/delete (jobs + email) |
| `institutions.get` | yes | read · country search list (AP-45) |
| `institutions.getById` | yes | read · by id (AP-45) |
| `institutions.updateUsage` | yes | **write** · bump popularity (AP-45) |

**Rust routes used:** `/api/v1/auth/me`, `/team` (**PUT**), `/team/current`, `/team/members` (GET + **PUT** + **DELETE**), `/team/leave` (**POST**), `/team/list`, `/team/invites` (GET), `/team/invites/accept` (**POST**), `/team/invites/decline` (**POST**), `/team/invites/:id` (**DELETE**), `/notifications`, `/notifications/:id/status` (**PUT**), `/notifications/status` (**PUT** bulk), `/user` (**PUT**), `/user/invites`, `/workers/noop` (**POST** Stage-3 sketch), `/bank-accounts`, `/bank-accounts` (**POST** create), `/bank-accounts/:id` (**PUT** + **DELETE**), `/bank-accounts/balances`, `/bank-accounts/currencies`, `/bank-accounts/:id/transaction-count`, `/bank-connections`, `/apps` (GET), `/apps/:appId` (**DELETE**), `/apps/:appId/settings` (**PUT**), `/apps/:appId/settings/bulk` (**PUT**), `/oauth-applications` (GET + **POST**), `/oauth-applications/authorized` (GET), `/oauth-applications/authorized/:applicationId` (**DELETE**), `/oauth-applications/:id` (GET + **PUT** + **DELETE**), `/oauth-applications/:id/regenerate-secret` (**POST**), `/institutions` (GET), `/institutions/:id` (GET + **POST** usage), `/inbox-accounts`, `/document-tags` (GET + **POST**), `/document-tags/:id` (**DELETE**), `/document-tag-assignments` (**POST** + **DELETE**), `/tags` (GET + **POST**), `/tags/:id` (**PUT** + **DELETE**), `/categories` (GET + **POST**), `/categories/:id` (GET + **PUT** + **DELETE**), `/transaction-tags` (**POST** + **DELETE**), `/transactions`, `/transactions/update-many`, `/transactions/delete-many`, `/transactions/review-count`, `/transactions/:id` (GET + **PUT**), `/inbox*`, `/inbox/blocklist` (GET + **POST**), `/inbox/blocklist/:id` (**DELETE**), `/inbox/:id` (**PUT**), `/inbox/:id/match`, `/inbox/:id/ignore`, `/inbox/:id/delete`, `/inbox/delete-many`, `/overview/summary`, `/documents`, `/documents/:id`, `/documents/:id/related`, `/customers` (GET + **POST** upsert), `/customers/:id` (GET + **DELETE**), `/invoices`, `/invoices/draft` (**POST**), `/invoices/duplicate` (**POST**), `/invoices/:id` (GET + **PUT** + **DELETE**; PUT supports `scheduledJobId`), `/invoices/public/:id`, `/invoices/payment-status`, `/invoices/summary`, `/invoices/metrics/*`, `/invoice-products` (GET + **POST**), `/invoice-products/upsert` (**POST**), `/invoice-products/save-line-item` (**POST**), `/invoice-products/:id` (GET + **PUT** + **DELETE**), `/invoice-products/:id/increment-usage` (**POST**), `/invoice-templates` (GET + **POST**), `/invoice-templates/count`, `/invoice-templates/upsert` (**POST**), `/invoice-templates/:id` (GET + **DELETE**), `/invoice-templates/:id/set-default` (**POST**), `/invoice-recurring` (GET list), `/invoice-recurring/:id` (GET), `/tracker/projects` (GET + **POST** upsert), `/tracker/projects/:id` (GET + **DELETE**), `/tracker/entries/by-date`, `/tracker/entries/by-range`, `/tracker/entries/upsert` (**POST**), `/tracker/entries/:id` (**DELETE**), `/tracker/timer/current`, `/tracker/timer/status`, `/tracker/timer/start` (**POST**), `/tracker/timer/stop` (**POST**), `/tracker/billable-hours`, `/notification-settings` (GET + **PUT**), `/notification-settings/bulk` (**PUT**), `/api-keys` (GET), `/api-keys/:id` (**DELETE**), `/short-links` (**POST**), `/short-links/:shortId` (public GET), `/accounting/sync-status`, `/accounting/connections`, `/search/global`, `/search/attachments`, `/reports` (**POST** create), `/reports/*`.

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
| Project list pagination / filters | Yes · core filters + FTS `q` via `to_tsquery` (AP-19) | Full FTS `q` via `to_tsquery` |
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

**Phase 10:** `user.invites`, `bankAccounts.balances`/`currencies`, `documentTags.get`, invoice dashboard metric reads.

**Phase 11:** `tags.get`, `bankAccounts.getTransactionCount`; **first write** `transactions.update`.

**Autopilot AP-12–16:** `notifications.list`; writes `transactions.updateMany`, `inbox.update`, `invoice.update`; team reads; OAuth/connection reads `apps.get`, `oauthApplications.list`, `inboxAccounts.get`.

### `transactions.update` write parity (Phase 11 — first delegated mutation)

| Concern | Rust / delegated path | Legacy Drizzle path |
| --- | --- | --- |
| Partial field update | Yes · JSON keys only | Same spread into `update()` |
| Tax clear on `categorySlug` | Yes | Same |
| Un-export sync record delete | Yes · when `status` present and ≠ `exported` | Same |
| Activity feed (`transactions_categorized` / `_assigned`) | Yes · AP-19 inserts activities on category/assignee change | Yes · `createActivity` |
| Return shape | Yes · full tx + suggestion via GET SQL | `getTransactionById` |

### `transactions.updateMany` write parity (AP-12b)

| Concern | Rust | Legacy Drizzle |
| --- | --- | --- |
| Bulk field update + tag insert | Yes · core fields | Same |
| Sync record delete on un-export | Yes | Same |
| Bulk activity feed | **No** | Yes |

### `inbox.update` write parity (AP-12c)

| Concern | Rust | Legacy Drizzle |
| --- | --- | --- |
| status / displayName / amount / currency | Yes | Same |
| `status: deleted` attachment cleanup | **No** | Yes |

### `invoice.update` write parity (AP-14)

| Concern | Rust | Legacy Drizzle |
| --- | --- | --- |
| status / paidAt / internalNote / scheduledAt | Yes · partial PUT | Same |
| Activity feed (`invoice_paid` / `invoice_cancelled`) | **No** | Yes · `logActivity` when status paid/canceled |
| Full draft field update | **No** · out of scope | Yes via draft mutation |

### `transactions.deleteMany` write parity (AP-17)

| Concern | Rust | Legacy Drizzle |
| --- | --- | --- |
| Delete manual txs by id list | Yes · `manual = true` filter | Same |
| Non-manual / bank-synced rows | Skipped (0 rows) | Same |

### Inbox mutations parity (AP-18)

| Concern | Rust | Legacy Drizzle |
| --- | --- | --- |
| `matchTransaction` single item + attachment + tax | Yes | Same + grouped siblings |
| Grouped inbox sibling match | **No** | Yes |
| `delete` / `deleteMany` soft-delete + DB cleanup | Yes | Same |
| Storage vault file remove | API façade after delegate | Same |
| `ignore` (`POST /inbox/:id/ignore`) | Yes · sets `done` + clears suggestions | No tRPC; SQLite stub had `ignored` |

### Parity hardening (AP-19)

| Concern | Hardened |
| --- | --- |
| `transactions.get` `q` | FTS `to_tsquery` on `fts_vector` **plus** name/description ILIKE (and numeric amount), matching Drizzle |
| `trackerProjects.get` `q` | FTS `to_tsquery` on `tp.fts` (was ILIKE-only) |
| `transactions.update` activity feed | Inserts `transactions_categorized` / `transactions_assigned` into `activities` |

### AP-20 — delete Drizzle fallback (100% delegated routers)

| Router | Change |
| --- | --- |
| `overview` (`summary` only) | Dual no longer falls back to `getOverviewSummary`; legacy mode still uses Drizzle |
| `search` (`global` + `attachments`) | Dual no longer falls back to FTS/attachments Drizzle; LLM semantic post-pass on `search.global` kept in `apps/api` |

### `notifications.updateStatus` write parity (AP-20 follow-on)

| Concern | Rust | Legacy Drizzle |
| --- | --- | --- |
| Single activity status update | Yes · `PUT /notifications/:id/status` | Same |
| `updateAllStatus` bulk | Yes · `PUT /notifications/status` (AP-21) | Same |

### `notifications.updateAllStatus` / `user.update` write parity (AP-21)

| Concern | Rust | Legacy Drizzle |
| --- | --- | --- |
| Bulk status scoped to team + user | Yes · unread→read / unread+read→archived filters | Same |
| `user.update` preference fields | Yes · partial PUT `/user` | Same |
| `user.delete` / Supabase admin / Resend | **No** · skipped | Yes |
| `user.switchTeam` + team cache | **No** · skipped | Yes |

### `team.update` / `tags` CRUD write parity (AP-22)

| Concern | Rust | Legacy Drizzle |
| --- | --- | --- |
| `team.update` name/currency/settings | Yes · partial PUT `/team` | Same |
| Return shape (id/name/logo/plan/…) | Yes · matches `updateTeamById` returning | Same |
| `tags.create` / `update` / `delete` | Yes · POST/PUT/DELETE `/tags` | Same |
| Tag return `{ id, name }` | Yes | Same |

### `documentTags` / `documentTagAssignments` write parity (AP-23)

| Concern | Rust | Legacy Drizzle |
| --- | --- | --- |
| `documentTags.create` insert | Yes · POST `/document-tags` | Same |
| Embedding after create | Node façade after delegate | Same Embed service |
| `documentTags.delete` | Yes · DELETE `/document-tags/:id` | Same |
| Assignment create/delete | Yes · POST/DELETE `/document-tag-assignments` | Same |

### AP-24 — transaction tags, customer delete, category getById

| Concern | Rust | Legacy Drizzle |
| --- | --- | --- |
| `transactionTags.create` | Yes · POST `/transaction-tags` (array return) | Same `.returning()` |
| `transactionTags.delete` | Yes · DELETE body | Same |
| `customers.delete` | Yes · fetch-then-delete, return prior shape | Same |
| `transactionCategories.getById` | Yes · GET `/categories/:id` + children | Same |

### AP-STAGE3 — Rust job consumer sketch

| Concern | Status |
| --- | --- |
| Module docs (`job_consumers.rs`) for BullMQ/Trigger → Axum | Yes |
| `POST /api/v1/workers/noop` auth-gated noop | Yes · no DB side effects |
| Rip out `apps/worker` / `packages/jobs` | **No** · Node still owns execution |

## Autopilot queue

Agent: pick the **first `PENDING` row**, implement, mark `DONE` (or `BLOCKED` + reason), update counts above, commit, push `torksabig`.

| ID | Status | Scope | Type |
|----|--------|--------|------|
| AP-12 | DONE | `notifications.list` | read |
| AP-12b | DONE | `transactions.updateMany` | write |
| AP-12c | DONE | `inbox.update` (partial PUT) | write |
| AP-13 | DONE | `team.members`, `team.list`, `team.teamInvites` | read |
| AP-14 | DONE | `invoice.update` (status/paidAt/internalNote/scheduledAt) | write |
| AP-15 | BLOCKED | `bankAccounts.getDetails` — needs safe decrypt path | read |
| AP-16 | DONE | `apps.get`, `oauthApplications.list`, `inboxAccounts.get` | read |
| AP-17 | DONE | `transactions.deleteMany` (manual only) | write |
| AP-18 | DONE | Inbox match + delete(+many); ignore→done (Rust) | write |
| AP-19 | DONE | FTS `q` (tx + tracker) + tx update activity feed | parity |
| AP-20 | DONE | Delete Drizzle fallback for `overview` + `search` (100% delegated); + `notifications.updateStatus` write | delete + write |
| AP-21 | DONE | `notifications.updateAllStatus` + `user.update` writes | write |
| AP-STAGE3 | DONE | Thin `job_consumers` sketch + `POST /workers/noop` (Node workers untouched) | infra |
| AP-22 | DONE | `team.update` + `tags.create`/`update`/`delete` writes | write |
| AP-23 | DONE | `documentTags.create`/`delete` + `documentTagAssignments.create`/`delete` | write |
| AP-24 | DONE | `transactionTags.create`/`delete` + `customers.delete` + `transactionCategories.getById` | write+read |
| AP-25 | DONE | `invoice.searchInvoiceNumber` + `notificationSettings.get` + `documents.checkAttachments` | read |
| AP-26 | DONE | `documents.delete` + `apiKeys.get` + `team.connectionStatus` | write+read |
| AP-27 | DONE | `trackerEntries.startTimer` + `trackerEntries.stopTimer` | write |
| AP-28 | DONE | `customers.upsert` + `notificationSettings.update`/`bulkUpdate` | write |
| AP-29 | DONE | `invoice.draft` (number gen stays Node) | write |
| AP-30 | DONE | `transactionCategories.create`/`update`/`delete` | write |
| AP-31 | DONE | `oauthApplications.get`/`create`/`update`/`delete` (SHA-256 secret hash) | write+read |
| AP-32 | DONE | `trackerEntries.upsert`/`delete` + `invoice.delete` | write |
| AP-33 | DONE | `invoice.duplicate` + `updateSchedule`/`cancelSchedule` (Trigger stays Node) | write |
| AP-34 | DONE | `invoiceProducts.get`/`getById`/`delete`/`incrementUsage` | write+read |
| AP-35 | DONE | `invoiceTemplate.list`/`get`/`count`/`create` | write+read |
| AP-36 | DONE | `invoiceTemplate.upsert`/`setDefault`/`delete` | write |
| AP-37 | DONE | `invoiceProducts.create`/`upsert`/`updateProduct` | write |
| AP-38 | DONE | `trackerProjects.upsert`/`delete` + `oauthApplications.regenerateSecret` | write |
| AP-39 | DONE | `invoiceProducts.saveLineItemAsProduct` + `apps.disconnect`/`update`/`updateSettings` | write |
| AP-40 | DONE | `inbox.blocklist.*` + `apiKeys.delete` + `reports.create` | write+read |
| AP-41 | DONE | `team.acceptInvite`/`declineInvite`/`deleteInvite`/`invitesByEmail` | write+read |
| AP-42 | DONE | `team.deleteMember`/`updateMember` + `shortLinks.get`/`createForUrl` | write+read |
| AP-43 | DONE | `invoiceRecurring.list`/`get` + `accounting.disconnect` + `team.leave` | write+read |
| AP-44 | DONE | `bankAccounts.create`/`update`/`delete` | write |
| AP-45 | DONE | `institutions.get`/`getById`/`updateUsage` + `oauthApplications.authorized`/`revokeAccess` | write+read |
| AP-STAGE4 | PENDING | Delete `apps/api` + `replacement-backend` — **user must say decommission** | delete |

**Next slice:** remaining pure Postgres (transactionAttachments, bankConnections.reconnect, inbox match confirm/unmatch), then blocked/email/external leftovers. Stage 4 gated on explicit decommission. AP-15 remains BLOCKED.

**Blocked:** AP-15 `bankAccounts.getDetails` (decrypt); `bankAccounts.getWithPaymentInfo` (decrypt); `user.delete` (Supabase admin + Resend); `apiKeys.upsert` email side-effect; live bank OAuth token exchange; accounting.getAccounts / external provider APIs; email/Resend sends; oauth authorize / updateApprovalStatus (Resend).

**Autopilot AP-12–45 + AP-STAGE3 sketch complete** (AP-15 remains BLOCKED). Stage 4 gated on explicit decommission.
