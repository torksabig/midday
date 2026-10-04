# tRPC delegation inventory (2026-09-28)

Branch: `cursor/backend-replace-ui-frozen-plans` · Glue: `@midday/replacement-backend` + `MIDDAY_BACKEND_MODE` (`legacy` | `dual` | `replacement`) · Rust: `fintech/clone` Axum `:8787`

**Autopilot:** Agents run direct-cutover slices without per-step user approval — see [2026-10-02-autopilot-direct-cutover.md](./2026-10-02-autopilot-direct-cutover.md) (supersedes the old façade autopilot doc).

**Direct dashboard adjustment (2026-10-02):** Direct-Rust dashboard traffic now includes transactions list/getById/review-count, category getById + writes, bank-account create/update/delete/balances/currencies/transaction-count, bank-connections get/reconnect, and transaction-tag assignment writes, in addition to the earlier identity/overview/notifications/tags/categories-list/bank-accounts-list cutovers. Façade delegation counts for dual/replacement mode are unchanged.

**Counts:** **96 / ~256** read procedures delegate to Rust when mode is `dual` or `replacement` (~37.5%). **111** write procedures delegate (`transactions.update`, `transactions.updateMany`, `transactions.deleteMany`, `transactions.create`, `transactions.import` SQL prep, `inbox.update`, `inbox.matchTransaction`, `inbox.delete`, `inbox.deleteMany`, `inbox.confirmMatch`, `inbox.declineMatch`, `inbox.unmatchTransaction`, `inbox.create`, `customers.cancelEnrichment`, `customers.clearEnrichment`, `customers.enrich` SQL, `transactions.moveToReview`, `customers.togglePortal`, `inbox.blocklist.create`, `inbox.blocklist.delete`, `invoice.update`, `invoice.draft`, `invoice.delete`, `invoice.duplicate`, `invoice.updateSchedule`, `invoice.cancelSchedule`, `invoice.create`, `invoice.createFromTracker`, `invoice.remind` SQL, `notifications.updateStatus`, `notifications.updateAllStatus`, `user.update`, `user.switchTeam`, `team.update`, `team.acceptInvite`, `team.declineInvite`, `team.deleteInvite`, `team.deleteMember`, `team.updateMember`, `team.leave`, `team.invite` SQL, `team.create` SQL, `tags.create`, `tags.update`, `tags.delete`, `documentTags.create`, `documentTags.delete`, `documentTagAssignments.create`, `documentTagAssignments.delete`, `transactionTags.create`, `transactionTags.delete`, `customers.delete`, `customers.upsert`, `documents.delete`, `documents.reprocessDocument` SQL, `documents.processDocument` SQL, `trackerEntries.startTimer`, `trackerEntries.stopTimer`, `trackerEntries.upsert`, `trackerEntries.delete`, `notificationSettings.update`, `notificationSettings.bulkUpdate`, `transactionCategories.create`, `transactionCategories.update`, `transactionCategories.delete`, `oauthApplications.create`, `oauthApplications.update`, `oauthApplications.delete`, `oauthApplications.regenerateSecret`, `oauthApplications.revokeAccess`, `oauthApplications.authorize` SQL, `invoiceProducts.delete`, `invoiceProducts.incrementUsage`, `invoiceProducts.create`, `invoiceProducts.upsert`, `invoiceProducts.updateProduct`, `invoiceProducts.saveLineItemAsProduct`, `invoiceTemplate.create`, `invoiceTemplate.upsert`, `invoiceTemplate.setDefault`, `invoiceTemplate.delete`, `trackerProjects.upsert`, `trackerProjects.delete`, `apps.disconnect`, `apps.update`, `apps.updateSettings`, `apps.removeWhatsAppConnection`, `apps.createPlatformLinkToken`, `apiKeys.delete`, `reports.create`, `shortLinks.createForUrl`, `shortLinks.createForDocument`, `accounting.disconnect`, `accounting.export` app lookup, `bankAccounts.create`, `bankAccounts.update`, `bankAccounts.delete`, `institutions.updateUsage`, `transactionAttachments.createMany`, `transactionAttachments.delete`, `bankConnections.reconnect`, `bankConnections.delete`, `invoiceRecurring.pause`, `invoiceRecurring.resume`, `invoiceRecurring.delete`, `invoiceRecurring.create`, `invoiceRecurring.update`, `inboxAccounts.delete`, `inboxAccounts.sync` SQL, `team.delete` SQL, `oauthApplications.updateApprovalStatus` SQL). All other procedures still hit Drizzle/legacy in `apps/api`.

| Procedure path | Delegated? | Notes |
| --- | --- | --- |
| **Direct dashboard cutover** | **reads + writes** | Dashboard now calls Rust directly for overview, identity/team shell (current + members + list + update), user update + user.invites, invoice defaults + public `getInvoiceByToken`, notifications (+ status), notification settings preferences/update, categories list/getById/create/update/delete, bank accounts list/create/update/delete/balances/currencies/transaction-count, bank connections get/reconnect, tags list/create/update/delete, transaction-tag assignment create/delete, transactions list/getById/review-count plus update/updateMany/deleteMany/moveToReview/create + getSimilarTransactions/searchTransactionMatch, inbox get/getById/checkAttachments (+ search/getByStatus helpers) plus update/match/confirmMatch/declineMatch/unmatch + blocklist get/create/delete + create, documents get/getById/getRelatedDocuments/checkAttachments, customers get/getById/getInvoiceSummary/getByPortalId/getPortalInvoices plus upsert/delete/togglePortal/cancelEnrichment/clearEnrichment, invoices get/getById/paymentStatus/invoiceSummary + mostActiveClient/inactiveClientsCount/topRevenueClient/newCustomersCount plus draft/update/delete/duplicate, trackerEntries getTimerStatus/getCurrentTimer/startTimer/stopTimer/byRange/byDate/getBillableHours/upsert/delete, trackerProjects get/getById/upsert/delete, documentTags get/create/delete, documentTagAssignments create/delete, institutions get/updateUsage, shortLinks.get, apiKeys get/delete, apps get/disconnect/update + createPlatformLinkToken, search.global, invoiceProducts get/getById/create/updateProduct/delete/incrementUsage/saveLineItemAsProduct, reports revenue/profit/burnRate/runway/expense/spending/taxSummary/getAccountBalances/revenueForecast/getByLinkId/getChartDataByLinkId/create, invoiceRecurring get/getUpcoming/resume (+ list helpers), invoiceTemplate list/get/count/create/upsert/setDefault/delete, search.attachments, transactionAttachments createMany/delete, oauthApplications list/get/create/update/delete/regenerateSecret/authorized/revokeAccess/getApplicationInfo, user.switchTeam, team.leave, and team invites/connectionStatus + accept/decline/deleteInvite + updateMember/deleteMember. Hybrid stays on tRPC: `inbox.delete`/`deleteMany` (storage remove), `team.invite` (Trigger email), `customers.enrich` (Trigger job), `invoice.create` (send/schedule Trigger), `documents.delete` (vault storage), `documents.reprocessDocument` (process-document job), gated decrypt, `bankConnections.delete` (Trigger teardown), `oauthApplications.authorize`/`updateApprovalStatus` (Resend), `invoiceRecurring.pause`/`delete` (BullMQ), `invoiceRecurring.create`/`update` (notifications/validation). |
| `user.me` | direct Rust | read · identity; dashboard calls `GET /api/v1/auth/me` with the Supabase session JWT; update/switch/delete mutations stay on the temporary path |
| `user.update` | direct Rust | **write** · preference fields PUT `/api/v1/user` (AP-21); dashboard calls Rust directly; no Supabase admin / email |
| `user.switchTeam` | direct Rust | **write** · DB switch (AP-52); dashboard calls `POST /api/v1/user/switch-team`; Redis team cache expires naturally |
| `user.delete` | no | write · Supabase admin + Resend |
| `user.invites` | direct Rust | read · pending team invites by email; dashboard calls `GET /api/v1/user/invites` |
| `team.current` | direct Rust | read · identity/team shell; dashboard calls `GET /api/v1/team/current` with the Supabase session JWT |
| `team.members` | direct Rust | read · AP-13; dashboard calls `GET /api/v1/team/members` directly |
| `team.list` | direct Rust | read · AP-13; dashboard calls `GET /api/v1/team/list` directly |
| `team.teamInvites` | direct Rust | read · AP-13; dashboard calls `GET /api/v1/team/invites` |
| `team.update` | direct Rust | **write** · name/currency/settings PUT `/api/v1/team` (AP-22); dashboard calls Rust directly |
| `team.connectionStatus` | direct Rust | read · bank + inbox status summary (AP-26); dashboard calls `GET /api/v1/team/connection-status` |
| `team.availablePlans` | direct Rust | read · starter/pro flags (AP-50); OpenAPI `GET /api/v1/team/available-plans`; dashboard helper ready; no UI call sites yet |
| `team.acceptInvite` | direct Rust | **write** · join team from invite (AP-41); dashboard calls `POST /api/v1/team/invites/accept` |
| `team.declineInvite` | direct Rust | **write** · delete invite by email (AP-41); dashboard calls `POST /api/v1/team/invites/decline` |
| `team.deleteInvite` | direct Rust | **write** · owner cancels invite (AP-41); dashboard calls `DELETE /api/v1/team/invites/{id}` |
| `team.invitesByEmail` | direct Rust | read · reuse `/user/invites` (AP-41); dashboard calls Rust directly |
| `team.deleteMember` | direct Rust | **write** · owner removes member (AP-42); dashboard calls `DELETE /api/v1/team/members`; cache invalidate stays Node-side if any |
| `team.updateMember` | direct Rust | **write** · owner changes role (AP-42); dashboard calls `PUT /api/v1/team/members` |
| `team.leave` | direct Rust | **write** · leave team; last-owner guard (AP-43); dashboard calls `POST /api/v1/team/leave`; Redis team cache expires naturally |
| `team.invite` | yes | **write** · invite SQL insert; Trigger email stays Node (AP-60) — **hybrid, keep on tRPC** |
| `team.delete` | yes | **write** · prep + delete SQL; delete-team job stays Node (AP-61) |
| `team.create` | yes | **write** · multi-table + category seed SQL; tax helpers stay Node (AP-62) |
| `team.*` (other) | no | — |
| `notifications.list` | direct Rust | read · activities feed (AP-12); dashboard calls `GET /api/v1/notifications` with the Supabase session JWT and preserves the old React Query keys |
| `notifications.updateStatus` | direct Rust | **write** · single activity status (AP-20 follow-on); dashboard calls `PUT /api/v1/notifications/:id/status` directly |
| `notifications.updateAllStatus` | direct Rust | **write** · bulk status for current user (AP-21); dashboard calls `PUT /api/v1/notifications/status` directly |
| `notifications.*` (other) | no | — |
| `notificationSettings.get` | direct Rust | read · user/team channel settings (AP-25); dashboard helper calls `GET /api/v1/notification-settings`; settings UI uses getAll |
| `notificationSettings.getAll` | direct Rust | read · catalog + settings merge (AP-52); dashboard settings screen calls `GET /api/v1/notification-settings/preferences` directly |
| `notificationSettings.update` | direct Rust | **write** · single channel upsert (AP-28); dashboard settings screen calls `PUT /api/v1/notification-settings` directly |
| `notificationSettings.bulkUpdate` | direct Rust | **write** · bulk channel upserts (AP-28); dashboard helper calls `PUT /api/v1/notification-settings/bulk`; no UI call sites yet |
| `notificationSettings.*` (other) | no | — |
| `bankAccounts.get` | direct Rust | read · `enabled`/`manual` filters; dashboard calls `GET /api/v1/bank-accounts` directly and preserves the old React Query cache key |
| `bankAccounts.balances` | direct Rust | read · `get_team_bank_accounts_balances()` (Phase 10); dashboard client calls `GET /api/v1/bank-accounts/balances` directly |
| `bankAccounts.currencies` | direct Rust | read · `get_bank_account_currencies()` (Phase 10); dashboard metrics call `GET /api/v1/bank-accounts/currencies` directly |
| `bankAccounts.getTransactionCount` | direct Rust | read · tx count for delete dialog (Phase 11); dashboard calls `GET /api/v1/bank-accounts/:id/transaction-count` directly |
| `bankAccounts.create` | direct Rust | **write** · manual account insert (AP-44); dashboard calls `POST /api/v1/bank-accounts` directly |
| `bankAccounts.update` | direct Rust | **write** · partial update (AP-44); dashboard calls `PUT /api/v1/bank-accounts/:id` directly |
| `bankAccounts.delete` | direct Rust | **write** · team-scoped delete (AP-44); dashboard calls `DELETE /api/v1/bank-accounts/:id` directly |
| `bankAccounts.*` (other) | no | getDetails (decrypt), payment info (decrypt) |
| `bankConnections.get` | direct Rust | read · list + nested accounts (Phase 6 slice 1); dashboard calls `GET /api/v1/bank-connections` directly |
| `bankConnections.reconnect` | direct Rust | **write** · update reference + status (AP-46); Enable Banking session route calls Rust directly |
| `bankConnections.delete` | yes | **write** · DB delete; Trigger delete-connection stays Node (AP-52) |
| `bankConnections.*` (other) | no | create (encrypt), addAccounts (encrypt) |
| `apps.get` | direct Rust | read · team installed apps (AP-16); dashboard calls `GET /api/v1/apps` directly; preserves `app_id` snake_case |
| `apps.disconnect` | direct Rust | **write** · delete app + platform identities (AP-39); dashboard calls `DELETE /api/v1/apps/{app_id}` directly |
| `apps.update` | direct Rust | **write** · single settings option (AP-39); dashboard calls `PUT /api/v1/apps/{app_id}/settings` directly |
| `apps.updateSettings` | yes | **write** · replace settings array (AP-39); no dashboard call sites |
| `apps.removeWhatsAppConnection` | yes | **write** · platform identity + config (AP-57) |
| `apps.createPlatformLinkToken` | direct Rust | **write** · insert link token (AP-57); connect Slack/Telegram/WhatsApp/iMessage call `POST /api/v1/apps/platform-link-tokens` |
| `apps.*` (other) | no | — |
| `apiKeys.get` | direct Rust | read · team keys metadata, no raw secrets (AP-26); dashboard calls `GET /api/v1/api-keys` directly |
| `apiKeys.delete` | direct Rust | **write** · DB delete (AP-40); dashboard calls `DELETE /api/v1/api-keys/{id}` directly; cache invalidation via React Query |
| `apiKeys.*` (other) | no | upsert (Resend email) |
| `oauthApplications.list` | direct Rust | read · team OAuth apps (AP-16); dashboard calls `GET /api/v1/oauth-applications` |
| `oauthApplications.get` | direct Rust | read · by id + createdByUser (AP-31); dashboard calls `GET /api/v1/oauth-applications/{id}` |
| `oauthApplications.create` | direct Rust | **write** · insert + SHA-256 client secret hash; plaintext returned once (AP-31); dashboard calls `POST /api/v1/oauth-applications` |
| `oauthApplications.update` | direct Rust | **write** · partial update + slug regen (AP-31); dashboard calls `PUT /api/v1/oauth-applications/{id}` |
| `oauthApplications.delete` | direct Rust | **write** · team-scoped delete (AP-31); dashboard calls `DELETE /api/v1/oauth-applications/{id}` |
| `oauthApplications.regenerateSecret` | direct Rust | **write** · SHA-256 hash rotate; plaintext once (AP-38); OpenAPI + client ready; no dashboard call sites yet |
| `oauthApplications.authorized` | direct Rust | read · user tokens for team (AP-45); dashboard calls `GET /api/v1/oauth-applications/authorized` |
| `oauthApplications.revokeAccess` | direct Rust | **write** · revoke user tokens (AP-45); dashboard calls `DELETE /api/v1/oauth-applications/authorized/{application_id}` |
| `oauthApplications.getApplicationInfo` | direct Rust | read · consent screen validation (AP-49); dashboard calls `GET /api/v1/oauth-applications/application-info` |
| `oauthApplications.updateApprovalStatus` | yes | **write** · status SQL; review email stays Node (AP-61) |
| `oauthApplications.authorize` | yes | **write** · auth-code SQL; install email stays Node (AP-62) |
| `oauthApplications.*` (other) | no | — |
| `inboxAccounts.get` | direct Rust | read · connected inboxes (AP-16); dashboard calls `GET /api/v1/inbox-accounts` directly |
| `inboxAccounts.delete` | yes | **write** · DB delete; Trigger `schedules.del` stays Node (AP-58) |
| `inboxAccounts.sync` | yes | **write** · account row read SQL; Trigger sync stays Node (AP-60) |
| `inboxAccounts.*` (other) | no | connect, OAuth exchange |
| `transactionCategories.get` | direct Rust | read · parent/child category tree (AP-30); dashboard calls `GET /api/v1/categories` directly and preserves the old React Query cache key |
| `transactionCategories.getById` | direct Rust | read · detail + children (AP-24); dashboard calls `GET /api/v1/categories/:id` directly |
| `transactionCategories.create` | direct Rust | **write** · insert + activity (AP-30); dashboard calls `POST /api/v1/categories` directly; embedding stays in Node if needed |
| `transactionCategories.update` | direct Rust | **write** · partial update (AP-30); dashboard calls `PUT /api/v1/categories/:id` directly and maps `parentId: null` to `clearParent` |
| `transactionCategories.delete` | direct Rust | **write** · non-system only (AP-30); dashboard calls `DELETE /api/v1/categories/:id` directly |
| `transactionCategories.*` (other) | no | — |
| `transactionTags.create` | direct Rust | **write** · link tag to tx (AP-24); dashboard calls `POST /api/v1/transaction-tags` directly |
| `transactionTags.delete` | direct Rust | **write** · unlink tag (AP-24); dashboard calls `DELETE /api/v1/transaction-tags` directly |
| `transactions.get` | direct Rust | read · list filters (Phase 2e matrix); dashboard infinite query calls `GET /api/v1/transactions` directly and preserves tRPC infinite query keys |
| `transactions.getById` | direct Rust | read · detail + pending suggestion; dashboard calls `GET /api/v1/transactions/{id}` directly |
| `transactions.getReviewCount` | direct Rust | read · ready-for-export count; dashboard calls `GET /api/v1/transactions/review-count` directly |
| `transactions.update` | direct Rust | **write** · partial PATCH-style PUT on Midday Postgres; dashboard calls `PUT /api/v1/transactions/{id}` directly |
| `transactions.updateMany` | direct Rust | **write** · bulk PATCH + tag insert; dashboard calls `POST /api/v1/transactions/update-many` directly |
| `transactions.create` | direct Rust | **write** · manual insert; enrich/match jobs deferred (were Node AP-54); dashboard create form calls `POST /api/v1/transactions/create` directly |
| `transactions.moveToReview` | direct Rust | **write** · un-export + sync delete (AP-48); dashboard calls `POST /api/v1/transactions/{id}/move-to-review` directly |
| `transactions.getSimilarTransactions` | direct Rust | read · pg_trgm candidates (AP-49); dashboard calls `GET /api/v1/transactions/similar` directly |
| `transactions.searchTransactionMatch` | direct Rust | read · FTS/pg_trgm match candidates (AP-53); dashboard calls `GET /api/v1/transactions/search-match` directly (snake_case fields preserved) |
| `transactions.import` | yes | **write** · bank account get/update SQL; import job stays Node (AP-58) |
| `transactions.*` (other) | no | export (job-only), generateCsvMapping (AI) |
| `inbox.get` | direct Rust | read · list; dashboard infinite query calls `GET /api/v1/inbox` directly and preserves tRPC infinite query keys |
| `inbox.getById` | direct Rust | read · detail + suggestion/related; dashboard calls `GET /api/v1/inbox/{id}` directly |
| `inbox.checkAttachments` | direct Rust | read · attachment linkage check; dashboard calls `GET /api/v1/inbox/{id}/check-attachments` directly |
| `inbox.search` | direct Rust | read · search helpers wired; no dashboard fetch sites yet (cmd-k uses `search.global` → Rust) |
| `inbox.getByStatus` | direct Rust | read · by-status helpers wired; no dashboard fetch sites yet |
| `inbox.update` | direct Rust | **write** · partial PUT (AP-12c); dashboard calls `PUT /api/v1/inbox/{id}`; `status: deleted` not on Rust path |
| `inbox.matchTransaction` | direct Rust | **write** · single-item match + attachment (AP-18); dashboard calls `POST /api/v1/inbox/{id}/match`; no grouped-inbox siblings |
| `inbox.delete` | yes | **write** · soft-delete + attachment/suggestion cleanup (AP-18); **hybrid — storage remove stays on tRPC** |
| `inbox.deleteMany` | yes | **write** · batch soft-delete (AP-18); **hybrid — storage remove stays on tRPC** |
| `inbox.confirmMatch` | direct Rust | **write** · confirm suggestion + match (AP-47); dashboard calls `POST /api/v1/inbox/confirm-match` |
| `inbox.declineMatch` | direct Rust | **write** · decline suggestion + pending (AP-47); dashboard calls `POST /api/v1/inbox/decline-match` |
| `inbox.unmatchTransaction` | direct Rust | **write** · unmatch group + learning feedback (AP-47); dashboard calls `POST /api/v1/inbox/{id}/unmatch` |
| `inbox.blocklist.get` | direct Rust | read · team blocklist (AP-40); dashboard calls `GET /api/v1/inbox/blocklist` |
| `inbox.blocklist.create` | direct Rust | **write** · insert blocklist row (AP-40); dashboard calls `POST /api/v1/inbox/blocklist` |
| `inbox.blocklist.delete` | direct Rust | **write** · delete blocklist row (AP-40); dashboard calls `DELETE /api/v1/inbox/blocklist/{id}` |
| `inbox.create` | direct Rust | **write** · insert inbox item (AP-57); upload zones call `POST /api/v1/inbox`; `processAttachments` stays tRPC (jobs) |
| `inbox.*` (other) | no | processAttachments / retryMatching (jobs) |
| `overview.summary` | direct Rust | read · dashboard home; dashboard calls `GET /api/v1/overview/summary` with the Supabase session JWT |
| `documents.get` | direct Rust | read · list (Phase 4); dashboard infinite query calls `GET /api/v1/documents` directly and preserves tRPC infinite query keys |
| `documents.getById` | direct Rust | read (Phase 4); dashboard calls `GET /api/v1/documents/{id}` directly (`-` + `filePath` for path-only opens) |
| `documents.getRelatedDocuments` | direct Rust | read · `match_similar_documents_by_title()`; dashboard calls `GET /api/v1/documents/{id}/related` directly |
| `documents.checkAttachments` | direct Rust | read · path token attachment check (AP-25); dashboard calls `GET /api/v1/documents/{id}/check-attachments` directly |
| `documents.delete` | yes | **write** · DB + attachment cleanup (AP-26); **hybrid — storage remove stays on tRPC** (2026-10-03: Next hybrid split skipped — Rust DELETE exists but not OpenAPI; no established dashboard storage-after-SQL pattern) |
| `documents.reprocessDocument` | yes | **write** · get + processing-status SQL; process-document job stays Node (AP-59) — **hybrid, keep on tRPC** |
| `documents.processDocument` | yes | **write** · unsupported bulk status SQL; process-document jobs stay Node (AP-60) |
| `documents.*` (other) | no | signed URLs (storage only, no SQL) |
| `documentTags.get` | direct Rust | read · vault tag list (Phase 10); dashboard calls `GET /api/v1/document-tags` directly |
| `documentTags.create` | direct Rust | **write** · insert tag (AP-23); dashboard calls `POST /api/v1/document-tags` directly; embedding side-effect deferred (was Node) |
| `documentTags.delete` | direct Rust | **write** · delete tag (AP-23); dashboard calls `DELETE /api/v1/document-tags/{id}` directly |
| `documentTagAssignments.create` | direct Rust | **write** · assign tag to document (AP-23); dashboard calls `POST /api/v1/document-tag-assignments` directly |
| `documentTagAssignments.delete` | direct Rust | **write** · unassign tag (AP-23); dashboard calls `DELETE /api/v1/document-tag-assignments` directly |
| `customers.get` | direct Rust | read · list (Phase 4); dashboard infinite/list queries call `GET /api/v1/customers` directly and preserve tRPC query keys |
| `customers.getById` | direct Rust | read (Phase 4); dashboard calls `GET /api/v1/customers/{id}` directly |
| `customers.delete` | direct Rust | **write** · fetch-then-delete (AP-24); dashboard calls `DELETE /api/v1/customers/{id}` directly |
| `customers.upsert` | direct Rust | **write** · DB upsert + tags (AP-28); auto enrich-customer Trigger deferred (was Node); dashboard calls `POST /api/v1/customers` directly |
| `customers.getInvoiceSummary` | direct Rust | read · FX rollup per customer (AP-48); dashboard calls `GET /api/v1/customers/{id}/invoice-summary` directly |
| `customers.cancelEnrichment` | direct Rust | **write** · clear enrichment_status (AP-48); dashboard calls `POST /api/v1/customers/{id}/cancel-enrichment` |
| `customers.clearEnrichment` | direct Rust | **write** · null enrichment fields (AP-48); dashboard calls `POST /api/v1/customers/{id}/clear-enrichment` |
| `customers.togglePortal` | direct Rust | **write** · portal_enabled + portal_id (AP-49); dashboard calls `POST /api/v1/customers/toggle-portal` |
| `customers.getByPortalId` | direct Rust | public read · portal customer + summary (AP-50); dashboard public portal calls `GET /api/v1/portal/{portal_id}` (no auth) |
| `customers.getPortalInvoices` | direct Rust | public read · portal invoice list (AP-50); dashboard public portal calls `GET /api/v1/portal/{portal_id}/invoices` (no auth) |
| `customers.enrich` | yes | **write** · set enrichment pending; enrich job stays Node (AP-59) — **hybrid, keep on tRPC** |
| `customers.*` (other) | no | — |
| `invoice.get` | direct Rust | read · list (Phase 4); dashboard infinite query calls `GET /api/v1/invoices` directly and preserves tRPC infinite query keys |
| `invoice.getById` | direct Rust | read (Phase 4); dashboard calls `GET /api/v1/invoices/{id}` directly |
| `invoice.getInvoiceByToken` | direct Rust | public · JWT verify on clone (`INVOICE_JWT_SECRET`); dashboard `/i/[token]` calls `GET /api/v1/invoices/by-token/{token}` (no auth) |
| `invoice.paymentStatus` | direct Rust | read · weighted score (Phase 5 slice 1); dashboard calls `GET /api/v1/invoices/payment-status` directly |
| `invoice.searchInvoiceNumber` | direct Rust | read · ILIKE existence check (AP-25); invoice form calls `GET /api/v1/invoices/search-number` directly |
| `invoice.invoiceSummary` | direct Rust | read · FX rollup (Phase 5 slice 1); dashboard calls `GET /api/v1/invoices/summary` directly |
| `invoice.mostActiveClient` | direct Rust | read · 30d dashboard metric; customers page calls `GET /api/v1/invoices/metrics/most-active-client` directly |
| `invoice.inactiveClientsCount` | direct Rust | read · 30d dashboard metric; customers page calls `GET /api/v1/invoices/metrics/inactive-clients-count` directly |
| `invoice.averageDaysToPayment` | direct Rust | read · 30d dashboard metric; helpers wired (`GET /api/v1/invoices/metrics/average-days-to-payment`); no dashboard fetch sites yet |
| `invoice.averageInvoiceSize` | direct Rust | read · 30d by currency; helpers wired (`GET /api/v1/invoices/metrics/average-invoice-size`); no dashboard fetch sites yet |
| `invoice.topRevenueClient` | direct Rust | read · 30d dashboard metric; customers page calls `GET /api/v1/invoices/metrics/top-revenue-client` directly |
| `invoice.newCustomersCount` | direct Rust | read · 30d dashboard metric; customers page calls `GET /api/v1/invoices/metrics/new-customers-count` directly |
| `invoice.update` | direct Rust | **write** · partial PUT status/paidAt/internalNote/scheduledAt (AP-14); dashboard calls `PUT /api/v1/invoices/{id}` directly |
| `invoice.draft` | direct Rust | **write** · upsert draft row (AP-29); dashboard calls `POST /api/v1/invoices/draft` (form supplies invoiceNumber) |
| `invoice.delete` | direct Rust | **write** · draft/canceled only (AP-32); dashboard calls `DELETE /api/v1/invoices/{id}` |
| `invoice.duplicate` | direct Rust | **write** · copy as draft; next number from Rust default-settings then `POST /api/v1/invoices/duplicate` |
| `invoice.updateSchedule` | yes | **write** · DB after Trigger job create in Node (AP-33) |
| `invoice.cancelSchedule` | yes | **write** · DB after Trigger cancel in Node (AP-33) |
| `invoice.create` | yes | **write** · status/schedule DB after Trigger in Node (AP-55) — **hybrid, keep on tRPC** (send/PDF/schedule) |
| `invoice.createFromTracker` | yes | **write** · tracker compose Node + draft insert (AP-55) |
| `invoice.defaultSettings` | direct Rust | read · Postgres bundle via `GET /api/v1/invoices/default-settings-data`; dashboard compose (geo/uuid/date) in `invoice-default-settings.ts` (AP-58) |
| `invoice.remind` | yes | **write** · reminderSentAt SQL; send-reminder job stays Node (AP-59) |
| `invoice.*` (other) | no | send (email delivery) |
| `trackerProjects.get` | direct Rust | read · list (Phase 6 slice 1); dashboard infinite/list calls `GET /api/v1/tracker/projects` directly |
| `trackerProjects.getById` | direct Rust | read · detail + assigned users (Phase 9); dashboard calls `GET /api/v1/tracker/projects/{id}` directly |
| `trackerProjects.upsert` | direct Rust | **write** · insert/update + tags + activity (AP-38); dashboard calls `POST /api/v1/tracker/projects` directly |
| `trackerProjects.delete` | direct Rust | **write** · team-scoped delete (AP-38); dashboard calls `DELETE /api/v1/tracker/projects/{id}` directly |
| `trackerEntries.byRange` | direct Rust | read · calendar week/month (Phase 6 slice 1); dashboard calls `GET /api/v1/tracker/entries/by-range` directly |
| `trackerEntries.getBillableHours` | direct Rust | read · earnings rollup (Phase 6 slice 1); dashboard calls `GET /api/v1/tracker/billable-hours` directly |
| `trackerEntries.byDate` | direct Rust | read · day sheet (Phase 9); dashboard calls `GET /api/v1/tracker/entries/by-date` directly |
| `trackerEntries.getCurrentTimer` | direct Rust | read · running entry (Phase 9); helpers wired; dashboard invalidates preserved tRPC keys |
| `trackerEntries.getTimerStatus` | direct Rust | read · elapsed + summary (Phase 9); dashboard calls `GET /api/v1/tracker/timer/status` directly |
| `trackerEntries.startTimer` | direct Rust | **write** · start running entry (AP-27); dashboard calls `POST /api/v1/tracker/timer/start` directly |
| `trackerEntries.stopTimer` | direct Rust | **write** · stop / discard <60s (AP-27); dashboard calls `POST /api/v1/tracker/timer/stop` directly |
| `trackerEntries.upsert` | direct Rust | **write** · multi-date upsert + activity on create (AP-32); dashboard calls `POST /api/v1/tracker/entries/upsert` directly |
| `trackerEntries.delete` | direct Rust | **write** · team-scoped delete (AP-32); dashboard calls `DELETE /api/v1/tracker/entries/{id}` directly |
| `trackerEntries.*` (other) | no | bulkCreate |
| `accounting.getSyncStatus` | yes | read · `accounting_sync_records` (Phase 9) |
| `accounting.getConnections` | yes | read · connected apps (Phase 9) |
| `accounting.getAccounts` | no | external provider API |
| `accounting.disconnect` | yes | **write** · delete app row (reuses `/apps/:appId` DELETE) (AP-43) |
| `accounting.export` | yes | **write** · app lookup SQL; export-to-accounting job stays Node (AP-60) |
| `accounting.*` (other) | no | getAccounts (external provider) |
| `search.global` | direct Rust | read · `global_search()` RPC; cmd-k + layout prefetch call `GET /api/v1/search/global` directly |
| `search.attachments` | direct Rust | read · inbox ILIKE + invoice list (Phase 5 slice 4); dashboard calls `GET /api/v1/search/attachments` directly |
| `reports.revenue` | direct Rust | read · chart YoY; dashboard calls `GET /api/v1/reports/revenue` |
| `reports.profit` | direct Rust | read · chart YoY; dashboard calls `GET /api/v1/reports/profit` |
| `reports.burnRate` | direct Rust | read · monthly burn; dashboard calls `GET /api/v1/reports/burn-rate` |
| `reports.runway` | direct Rust | read · median burn × cash; dashboard calls `GET /api/v1/reports/runway` |
| `reports.expense` | direct Rust | read · recurring split; dashboard calls `GET /api/v1/reports/expense` |
| `reports.spending` | direct Rust | read · category breakdown; dashboard calls `GET /api/v1/reports/spending` |
| `reports.taxSummary` | direct Rust | read · VAT-style rollup; OpenAPI + client ready (invalidate-only UI sites) |
| `reports.getAccountBalances` | direct Rust | read · cash accounts; dashboard calls `GET /api/v1/reports/account-balances` |
| `reports.revenueForecast` | direct Rust | read · bottom-up forecast; dashboard calls `GET /api/v1/reports/revenue-forecast` |
| `reports.getByLinkId` | direct Rust | public share · no auth; dashboard calls `GET /api/v1/reports/public/{linkId}` |
| `reports.getChartDataByLinkId` | direct Rust | public chart · no auth; dashboard calls `GET /api/v1/reports/public/{linkId}/chart` |
| `reports.create` | direct Rust | **write** · insert share link (`linkId`); dashboard builds `/r/{linkId}` client-side |
| `tags.get` | direct Rust | read · transaction tag list (Phase 11); dashboard calls `GET /api/v1/tags` directly and preserves the old React Query cache key |
| `tags.create` | direct Rust | **write** · insert tag (AP-22); dashboard calls `POST /api/v1/tags` directly and preserves the old React Query cache key |
| `tags.update` | direct Rust | **write** · rename tag (AP-22); dashboard calls `PUT /api/v1/tags/:id` directly and preserves the old React Query cache key |
| `tags.delete` | direct Rust | **write** · delete tag (AP-22); dashboard calls `DELETE /api/v1/tags/:id` directly and preserves the old React Query cache key |
| `shortLinks.get` | direct Rust | public read · by shortId (AP-42); public page calls `GET /api/v1/short-links/{short_id}` directly |
| `shortLinks.createForUrl` | yes | **write** · insert redirect; shortUrl in Node (AP-42); no dashboard call sites; OpenAPI helper ready |
| `shortLinks.createForDocument` | yes | **write** · signed URL Node + Postgres insert (AP-55) |
| `shortLinks.*` (other) | no | — |
| All other routers | no | oauth flow, banking adapters, etc. |

| `invoiceTemplate.list` | direct Rust | read · team templates (AP-35); dashboard calls `GET /api/v1/invoice-templates` directly |
| `invoiceTemplate.get` | direct Rust | read · by id (AP-35); OpenAPI + client helper (`GET /api/v1/invoice-templates/{id}`); no dashboard fetch sites yet |
| `invoiceTemplate.count` | direct Rust | read · team count (AP-35); dashboard calls `GET /api/v1/invoice-templates/count` directly |
| `invoiceTemplate.create` | direct Rust | **write** · insert + first/default logic (AP-35); dashboard calls `POST /api/v1/invoice-templates` directly |
| `invoiceTemplate.upsert` | direct Rust | **write** · by id or default (AP-36); dashboard calls `POST /api/v1/invoice-templates/upsert` directly |
| `invoiceTemplate.setDefault` | direct Rust | **write** · atomic default swap (AP-36); dashboard calls `POST /api/v1/invoice-templates/{id}/set-default` directly |
| `invoiceTemplate.delete` | direct Rust | **write** · refuse last template (AP-36); dashboard calls `DELETE /api/v1/invoice-templates/{id}` directly |
| `invoiceProducts.get` | direct Rust | read · list filters (AP-34); dashboard calls `GET /api/v1/invoice-products` directly |
| `invoiceProducts.getById` | direct Rust | read · detail (AP-34); dashboard calls `GET /api/v1/invoice-products/{id}` directly |
| `invoiceProducts.create` | direct Rust | **write** · insert product (AP-37); dashboard calls `POST /api/v1/invoice-products` directly |
| `invoiceProducts.upsert` | yes | **write** · conflict on team+name+currency+price (AP-37); no dashboard call sites yet |
| `invoiceProducts.updateProduct` | direct Rust | **write** · partial update (AP-37); dashboard calls `PUT /api/v1/invoice-products/{id}` directly |
| `invoiceProducts.delete` | direct Rust | **write** · team-scoped delete (AP-34); dashboard calls `DELETE /api/v1/invoice-products/{id}` directly |
| `invoiceProducts.incrementUsage` | direct Rust | **write** · bump usage count (AP-34); dashboard calls `POST /api/v1/invoice-products/{id}/increment-usage` directly |
| `invoiceProducts.saveLineItemAsProduct` | direct Rust | **write** · update-or-upsert from line item (AP-39); dashboard calls `POST /api/v1/invoice-products/save-line-item` directly |
| `invoiceRecurring.list` | direct Rust | read · paginated series list (AP-43); OpenAPI + client ready (invalidate-only UI sites) |
| `invoiceRecurring.get` | direct Rust | read · series detail + customer; dashboard calls `GET /api/v1/invoice-recurring/{id}` |
| `invoiceRecurring.pause` | yes | **write** · pause + revert scheduled; BullMQ remove stays Node hybrid (AP-51) |
| `invoiceRecurring.resume` | direct Rust | **write** · resume / complete if ended; dashboard calls `POST /api/v1/invoice-recurring/{id}/resume` |
| `invoiceRecurring.delete` | yes | **write** · cancel + revert scheduled; BullMQ remove stays Node hybrid (AP-51) |
| `invoiceRecurring.getUpcoming` | direct Rust | read · upcoming date projection; dashboard calls `GET /api/v1/invoice-recurring/{id}/upcoming` |
| `invoiceRecurring.create` | yes | **write** · DB create/link; notifications stay Node (AP-56) |
| `invoiceRecurring.update` | yes | **write** · DB update; cross-field validation stays Node (AP-56) |
| `invoiceRecurring.*` (other) | no | — |
| `institutions.get` | direct Rust | read · country search list (AP-45); dashboard calls `GET /api/v1/institutions` directly |
| `institutions.getById` | yes | read · by id (AP-45); no dashboard call sites; OpenAPI ready |
| `institutions.updateUsage` | direct Rust | **write** · bump popularity (AP-45); dashboard calls `POST /api/v1/institutions/{id}` directly |
| `transactionAttachments.createMany` | direct Rust | **write** · insert + sync cleanup + activity (AP-46); dashboard calls `POST /api/v1/transaction-attachments` directly |
| `transactionAttachments.delete` | direct Rust | **write** · inbox/suggestion cleanup (AP-46); dashboard calls `DELETE /api/v1/transaction-attachments/{id}` directly |
| `transactionAttachments.*` (other) | no | processAttachment (jobs) — keep on tRPC |

**Rust routes used:** `/api/v1/auth/me`, `/team` (**PUT**), `/team/create` (**POST**), `/team/current`, `/team/members` (GET + **PUT** + **DELETE**), `/team/leave` (**POST**), `/team/delete-prep` (**POST**), `/team/delete` (**POST**), `/team/list`, `/team/invites` (GET + **POST** create), `/team/invites/accept` (**POST**), `/team/invites/decline` (**POST**), `/team/invites/:id` (**DELETE**), `/notifications`, `/notifications/:id/status` (**PUT**), `/notifications/status` (**PUT** bulk), `/user` (**PUT**), `/user/invites`, `/workers/noop` (**POST** Stage-3 sketch), `/bank-accounts`, `/bank-accounts` (**POST** create), `/bank-accounts/:id` (GET + **PUT** + **DELETE**), `/bank-accounts/balances`, `/bank-accounts/currencies`, `/bank-accounts/:id/transaction-count`, `/bank-connections`, `/bank-connections/reconnect` (**POST**), `/transaction-attachments` (**POST**), `/transaction-attachments/:id` (**DELETE**), `/apps` (GET), `/apps/whatsapp/remove-connection` (**POST**), `/apps/platform-link-tokens` (**POST**), `/apps/:appId` (GET + **DELETE**), `/apps/:appId/settings` (**PUT**), `/apps/:appId/settings/bulk` (**PUT**), `/oauth-applications` (GET + **POST**), `/oauth-applications/authorized` (GET), `/oauth-applications/authorized/:applicationId` (**DELETE**), `/oauth-applications/authorize` (**POST**), `/oauth-applications/:id` (GET + **PUT** + **DELETE**), `/oauth-applications/:id/regenerate-secret` (**POST**), `/oauth-applications/:id/approval-status` (**POST**), `/institutions` (GET), `/institutions/:id` (GET + **POST** usage), `/inbox-accounts` (GET), `/inbox-accounts/:id` (GET + **DELETE**), `/document-tags` (GET + **POST**), `/document-tags/:id` (**DELETE**), `/document-tag-assignments` (**POST** + **DELETE**), `/tags` (GET + **POST**), `/tags/:id` (**PUT** + **DELETE**), `/categories` (GET + **POST**), `/categories/:id` (GET + **PUT** + **DELETE**), `/transaction-tags` (**POST** + **DELETE**), `/transactions`, `/transactions/update-many`, `/transactions/delete-many`, `/transactions/review-count`, `/transactions/:id` (GET + **PUT**), `/inbox*` (GET list + **POST** create), `/inbox/blocklist` (GET + **POST**), `/inbox/blocklist/:id` (**DELETE**), `/inbox/:id` (**PUT**), `/inbox/:id/match`, `/inbox/confirm-match` (**POST**), `/inbox/decline-match` (**POST**), `/inbox/:id/unmatch` (**POST**), `/inbox/:id/ignore`, `/inbox/:id/delete`, `/inbox/delete-many`, `/overview/summary`, `/documents`, `/documents/processing-status` (**POST** bulk), `/documents/:id`, `/documents/:id/related`, `/documents/:id/processing-status` (**PUT**), `/customers` (GET + **POST** upsert), `/customers/:id` (GET + **DELETE**), `/customers/:id/invoice-summary`, `/customers/:id/cancel-enrichment` (**POST**), `/customers/:id/clear-enrichment` (**POST**), `/transactions/:id/move-to-review` (**POST**), `/transactions/similar`, `/customers/toggle-portal` (**POST**), `/oauth-applications/application-info`, `/team/available-plans`, `/portal/:portalId` (public), `/portal/:portalId/invoices` (public), `/invoices`, `/invoices/default-settings-data` (GET), `/invoices/draft` (**POST**), `/invoices/duplicate` (**POST**), `/invoices/:id` (GET + **PUT** + **DELETE**; PUT supports `scheduledJobId`), `/invoices/public/:id`, `/invoices/by-token/:token`, `/invoices/payment-status`, `/invoices/summary`, `/invoices/metrics/*`, `/invoice-products` (GET + **POST**), `/invoice-products/upsert` (**POST**), `/invoice-products/save-line-item` (**POST**), `/invoice-products/:id` (GET + **PUT** + **DELETE**), `/invoice-products/:id/increment-usage` (**POST**), `/invoice-templates` (GET + **POST**), `/invoice-templates/count`, `/invoice-templates/upsert` (**POST**), `/invoice-templates/:id` (GET + **DELETE**), `/invoice-templates/:id/set-default` (**POST**), `/invoice-recurring` (GET list + **POST** create), `/invoice-recurring/:id` (GET + **PUT** + **DELETE**), `/invoice-recurring/:id/pause` (**POST**), `/invoice-recurring/:id/resume` (**POST**), `/invoice-recurring/:id/upcoming` (GET), `/tracker/projects` (GET + **POST** upsert), `/tracker/projects/:id` (GET + **DELETE**), `/tracker/entries/by-date`, `/tracker/entries/by-range`, `/tracker/entries/upsert` (**POST**), `/tracker/entries/:id` (**DELETE**), `/tracker/timer/current`, `/tracker/timer/status`, `/tracker/timer/start` (**POST**), `/tracker/timer/stop` (**POST**), `/tracker/billable-hours`, `/notification-settings` (GET + **PUT**), `/notification-settings/preferences`, `/notification-settings/bulk` (**PUT**), `/api-keys` (GET), `/api-keys/:id` (**DELETE**), `/short-links` (**POST**), `/short-links/:shortId` (public GET), `/accounting/sync-status`, `/accounting/connections`, `/search/global`, `/search/attachments`, `/reports` (**POST** create), `/reports/*`.

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
| `POST /api/v1/workers/check-invoice-status` | Yes · AP-WORKER-1. Match/overdue SQL. Notification stays on Trigger |
| `POST /api/v1/workers/rates-scheduler` | Yes · AP-WORKER-2. `exchange_rates` upsert. Banking FX fetch stays on BullMQ Node |
| `POST /api/v1/workers/activity-notification-flush` | Yes · AP-WORKER-3. Claim due batches + mark sent / identity metadata. Slack/Telegram/WhatsApp/Sendblue send stays on BullMQ Node |
| `POST /api/v1/workers/notification` | Yes · AP-WORKER-4. `activities` insert/combine. Resend stays on Node `@midday/notifications` |
| `POST /api/v1/workers/batch-process-matching` | Yes · AP-WORKER-5. Inbox suggestion/auto-match SQL. Matching notifications stay on Node |
| `POST /api/v1/workers/match-transactions-bidirectional` | Yes · AP-WORKER-5. Forward + reverse match SQL. Matching notifications stay on Node |
| `POST /api/v1/workers/process-document` | Yes · AP-WORKER-6. Document by-path status SQL. Classify/embed/OCR/HEIC stay on Node |
| `POST /api/v1/workers/import-transactions` | Yes · AP-WORKER-7. Bulk insert imported rows. CSV parse + vault download stay on BullMQ Node |
| `POST /api/v1/workers/process-export` | Yes · AP-WORKER-7. Select rows for export. Attachment download + CSV/XLSX/zip stay on Node |
| `POST /api/v1/workers/export-transactions` | Yes · AP-WORKER-7. Mark exported + optional short_link. Signed URL + zip upload stay on Node |
| `POST /api/v1/workers/upsert-transactions` | Yes · AP-WORKER-8. Bank-sync row insert (ON CONFLICT DO NOTHING). Provider fetch + transform stay on Trigger |
| `POST /api/v1/workers/sync-connection-status` | Yes · AP-WORKER-8. Connection status / last_accessed / reference_id / disconnect-if-retries. Provider `connectionStatus` stays on Node |
| `POST /api/v1/workers/update-bank-account-sync` | Yes · AP-WORKER-8. Balance / error / currency heal writes. Provider balance + tx fetch stay on Node |
| `POST /api/v1/workers/remap-bank-account-ids` | Yes · AP-WORKER-8. Post-reconnect account_id remaps. Matching + provider accounts stay on Node |
| `POST /api/v1/workers/onboard-team` | Yes · AP-WORKER-9. User + trial/plan gate + bank_connections count. Resend + `wait.for` stay on Trigger. Invite insert / team delete-prep already via tRPC AP-60/61 — not forked into workers. `invite-team-members` / `delete-team` / cancellation / `payment-issue` still gated (email/provider, no separable SQL) |
| `POST /api/v1/workers/upsert-accounting-sync` | Yes · AP-WORKER-10. Export batch status upsert. Fortnox/Xero/QuickBooks HTTP stays on BullMQ Node |
| `POST /api/v1/workers/update-accounting-attachment-mapping` | Yes · AP-WORKER-10. Attachment mapping + status. Provider upload/delete + vault download stay on Node |
| `POST /api/v1/workers/persist-team-insight` | Yes · AP-WORKER-10. Insight row of already-generated text. LLM generation stays on Node. `dispatch-insights` deferred (fan-out only) |
| `POST /api/v1/workers/update-invoice-file` | Yes · AP-WORKER-10. `file_path` / `file_size` after PDF. PDF bytes + vault upload stay on Node |
| `POST /api/v1/workers/update-invoice-sent` | Yes · AP-WORKER-10. `status` / `sent_to` / `sent_at` after email. Resend stays on Node |

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
| AP-WORKER-1 | DONE | `check-invoice-status` Postgres match in Rust; Trigger still sends invoice notifications | worker |
| AP-WORKER-2 | DONE | `rates-scheduler` exchange_rates upsert in Rust; BullMQ still fetches banking FX | worker |
| AP-WORKER-3 | DONE | `activity-notification-flush` claim/finalize SQL in Rust; BullMQ still sends Slack/Telegram/WhatsApp/Sendblue | worker |
| AP-WORKER-4 | DONE | `notification` activities insert/combine in Rust; Resend + sendToProviders stay on Node | worker |
| AP-WORKER-5 | DONE | Inbox DB matching (`batch-process-matching`, `match-transactions-bidirectional`) in Rust; Resend/Slack/provider notify stay on Node | worker |
| AP-WORKER-6 | DONE | `process-document` by-path status SQL in Rust; classify/embed/OCR/HEIC stay on Node | worker |
| AP-WORKER-7 | DONE | Transaction import/export SQL (`import-transactions`, `process-export`, `export-transactions`); CSV/XLSX/zip + vault + signed URLs stay on Node | worker |
| AP-WORKER-8 | DONE | Bank sync SQL (`upsert-transactions`, `sync-connection-status`, `update-bank-account-sync`, `remap-bank-account-ids`); provider HTTP + decrypt + schedules stay on Trigger; `delete-connection` / `initial-bank-setup` still gated (no separable SQL) | worker |
| AP-WORKER-9 | DONE | Team onboard SQL context (`onboard-team`); Resend + wait stay on Trigger; invite insert / delete-prep already via tRPC AP-60/61 (not forked); `invite-team-members` / BullMQ `delete-team` / cancellation / `payment-issue` still gated (email/provider, no separable SQL) | worker |
| AP-WORKER-10 | DONE | Accounting export / insights / invoice PDF+email SQL (`upsert-accounting-sync`, `update-accounting-attachment-mapping`, `persist-team-insight`, `update-invoice-file`, `update-invoice-sent`); provider HTTP + PDF + Resend + LLM stay on Node; `dispatch-insights` deferred (fan-out only). **Stage 3 SQL slices complete.** | worker |
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
| AP-46 | DONE | `transactionAttachments.createMany`/`delete` + `bankConnections.reconnect` | write |
| AP-47 | DONE | `inbox.confirmMatch`/`declineMatch`/`unmatchTransaction` | write |
| AP-48 | DONE | `customers.getInvoiceSummary`/`cancelEnrichment`/`clearEnrichment` + `transactions.moveToReview` | write+read |
| AP-49 | DONE | `transactions.getSimilarTransactions` + `customers.togglePortal` + `oauthApplications.getApplicationInfo` | write+read |
| AP-50 | DONE | `customers.getByPortalId`/`getPortalInvoices` + `team.availablePlans` | read |
| AP-51 | DONE | `invoiceRecurring.pause`/`resume`/`delete`/`getUpcoming` (BullMQ remove stays Node) | write+read |
| AP-52 | DONE | `user.switchTeam` + `notificationSettings.getAll` + `bankConnections.delete` (Trigger stays Node) | write+read |
| AP-53 | DONE | `transactions.searchTransactionMatch` | read |
| AP-54 | DONE | `transactions.create` (enrich/match jobs stay Node) | write |
| AP-55 | DONE | `invoice.create`/`createFromTracker` + `shortLinks.createForDocument` (Trigger/signed URL stay Node) | write |
| AP-56 | DONE | `invoiceRecurring.create`/`update` (notifications + cross-field validation stay Node) | write |
| AP-57 | DONE | `inbox.create` + `apps.removeWhatsAppConnection`/`createPlatformLinkToken` | write |
| AP-58 | DONE | `invoice.defaultSettings` reads + `transactions.import` SQL + `inboxAccounts.delete` (jobs/geo/Trigger stay Node) | write+read |
| AP-59 | DONE | `customers.enrich` + `invoice.remind` SQL + `documents.reprocessDocument` SQL (jobs stay Node) | write |
| AP-60 | DONE | `documents.processDocument` SQL + `accounting.export` app lookup + `team.invite` SQL + `inboxAccounts.sync` SQL (jobs/email stay Node) | write |
| AP-61 | DONE | `team.delete` SQL + `oauthApplications.updateApprovalStatus` SQL (jobs/email stay Node) | write |
| AP-62 | DONE | `team.create` SQL + `oauthApplications.authorize` SQL (tax helpers / install email stay Node) | write |
| AP-STAGE4 | PARTIAL | Incremental decommission after user **decommission** (2026-10-04): dead-façade routers fail-closed; residual Node kept — [stage4 residual](./2026-10-04-stage4-residual-node.md) | delete |

**Next:** Residual hybrids/STOP stay on Node (`apps/api` `:3003`). Full `apps/api` + `replacement-backend` delete deferred until those migrate or retire. Run path: dashboard + clone + minimal Node — see [2026-10-04-stage4-residual-node.md](./2026-10-04-stage4-residual-node.md). AP-15 remains BLOCKED.

**Blocked leftovers (crypto / admin / email):**
- AP-15 `bankAccounts.getDetails` / `getWithPaymentInfo` — blocked · needs safe decrypt path
- `bankConnections.create` / `addAccounts` — blocked · encrypt at rest
- `user.delete` — blocked · Supabase admin + Resend
- `apiKeys.upsert` — blocked · Resend email side-effect
- Email/Resend sends that are email-only after SQL already delegated (`invoice.send`, oauth approve email half, oauth authorize install email half) — blocked · email

**External leftovers (OAuth / Stripe / providers / jobs-only):**
- Live bank OAuth (`banking.*`, `inboxAccounts.connect/exchange`) — external OAuth
- `accounting.getAccounts` — external provider API (app lookup could reuse AP-60 GET `/apps/:appId`)
- Live Fortnox/Xero/QuickBooks export/attachment HTTP — external provider (SQL status via AP-WORKER-10)
- LLM insight generation text — external AI (row persist via AP-WORKER-10); `dispatch-insights` fan-out only
- Invoice PDF bytes + Resend send — Node (status fields via AP-WORKER-10)
- `billing.*` / `invoicePayments.*` — Stripe/Polar
- `connectors.*` — OAuth adapters
- `transactions.export` — job-only (no SQL in handler)
- `transactions.generateCsvMapping` — Anthropic AI only
- `jobs.getStatus` — BullMQ not Postgres
- `documents.signedUrl(s)` — Supabase storage only (no SQL)
- Stage 4 full delete `apps/api` — deferred · residual hybrids/STOP documented in [2026-10-04-stage4-residual-node.md](./2026-10-04-stage4-residual-node.md)

**Façade autopilot AP-12–62 + AP-STAGE3 + AP-WORKER-1..10** complete (AP-15 BLOCKED). **DC-STAGE4 PARTIAL** after user decommission (2026-10-04).
