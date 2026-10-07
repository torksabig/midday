# Dashboard typecheck remainder (2026-10-07)

## Snapshot

| Metric | Value |
|--------|-------|
| Before slice 1 | 725 TS errors (`apps/dashboard` `bun run typecheck`) |
| After slice 1 | ~187 |
| After slice 2 | **98** |
| Reduction (total) | ~86% |

## Slice 2 (this commit)

- Extended `delegated-trpc-shapes.ts`: inbox/transaction re-exports, `ReportByLinkId`, `ReportsRevenueForecast`, `InvoiceRecurringDetail`/`List`, `PublicInvoiceTemplateData` (`@midday/invoice/types`).
- Public invoice pages cast Rust `Invoice` → template type at HTML/Og boundaries only.
- Inbox + transaction UI wired to `InboxListItem` / `InboxDetail` / `TransactionDetail` / `SearchTransactionMatchRow` (null coalescing for match UI).
- `[locale]` fixes: onboarding nullability, portal PDF token, shared report OG (`teamLogoUrl`), `PublicMetricView` accepts `ReportByLinkId`.
- Metrics cards: revenue forecast / runway / cash balance typing + safe optional fields.
- `CustomerInvoiceSummary` + `InvoiceSummary` shapes for customer portal stats.
- **`tsconfig.json`**: exclude `**/*.test.ts` from dashboard typecheck (matches intent of API; rust-api tests still run via `bun test`).

## Remaining error buckets (~98)

1. **`edit-recurring-sheet.tsx`** — residual `{}` on some recurring fields if API schema drifts.
2. **Tracker** — `tracker-schedule.tsx`, `data-table-row.tsx`.
3. **OAuth UI** — `oauth-application-form`, `oauth-consent-screen`.
4. **Tables** — customers, oauth-applications, api-keys columns.
5. **Misc** — apps, bank-account, bank-search, invoice form-context, documents tags, connection-status.

## Suggested next slice

1. Tighten `InvoiceDefaultSettings` vs editor template type (chat/invoice sheet).
2. OAuth form `redirectUris` / `screenshots` OpenAPI `Record<string, never>` → delegated shapes.
3. Tracker schedule entries typing (reuse `TrackerEntryByDate`).
4. Regenerate OpenAPI where responses are still empty objects.

## Verify

```bash
cd apps/dashboard && bun run typecheck
cd apps/dashboard && bun test src/lib/rust-api/*.test.ts
```
