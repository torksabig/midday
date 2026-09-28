# tRPC delegation inventory (2026-09-28)

Branch: `cursor/backend-replace-ui-frozen-plans` · Glue: `@midday/replacement-backend` + `MIDDAY_BACKEND_MODE` (`legacy` | `dual` | `replacement`) · Rust: `fintech/clone` Axum `:8787`

**Counts:** **20 / ~256** procedures delegate reads to Rust when mode is `dual` or `replacement` (~8%). All other procedures still hit Drizzle/legacy in `apps/api`.

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
| `documents.*` (other) | no | related, attachments, vault mutations |
| `customers.get` | yes | read · list (Phase 4) |
| `customers.getById` | yes | read (Phase 4) |
| `customers.*` (other) | no | portal public, CRUD, enrichment |
| `invoice.get` | yes | read · list (Phase 4) |
| `invoice.getById` | yes | read (Phase 4) |
| `invoice.*` (other) | no | public token, summary, mutations |
| All other routers | no | accounting, banking, billing, reports, search, tracker, vault tags, notifications, oauth, etc. |

**Rust routes used:** `/api/v1/auth/me`, `/team/current`, `/bank-accounts`, `/categories`, `/transactions`, `/transactions/review-count`, `/transactions/:id`, `/inbox*`, `/overview/summary`, `/documents`, `/documents/:id`, `/customers`, `/customers/:id`, `/invoices`, `/invoices/:id`.

**Phase 4 agent note:** Subagent `232b8ce9` left uncommitted `crates/api/src/documents_read.rs` in `fintech/clone` (plus unrelated Vite web edits — not committed per Path A freeze). Phase 4 completed in this pass with wired routes, mappers, tRPC delegation, and mapper tests.
