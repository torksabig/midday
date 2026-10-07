# Dashboard typecheck remainder (2026-10-07)

## Snapshot

| Metric | Value |
|--------|-------|
| Before | 725 TS errors (`apps/dashboard` `bun run typecheck`) |
| After slice | ~185–191 (see latest local run) |
| Reduction | ~74% |

## What this slice fixed

- Added `apps/dashboard/src/lib/rust-api/delegated-trpc-shapes.ts` — stable UI types where tRPC `RouterOutputs` collapse to `{}` / `unknown` under Rust delegation.
- Rewired `rust-api` modules (`customers`, `reports`, `oauth-applications`, `invoice-recurring`, `inbox-accounts`, `search`, `invoice-products`, `invoice-templates`, `invoices`, …) to use those shapes instead of `RouterOutputs`.
- `trpc/server.tsx` `prefetch` / `batchPrefetch` accept Rust hybrid TanStack options (`any` at boundary).
- Component type imports updated for vault, customers, oauth, tracker, products, team select, api keys, vault tags, etc.
- `connection-status.ts` uses `BankConnectionListItem` + `InboxAccount` from rust-api.

## Remaining error buckets (approx.)

1. **`src/app/[locale]/`** — onboarding nullability, public invoice `Invoice` type mismatch vs `@midday/invoice`, portal content optional strings.
2. **Metrics** — `revenue-forecast-card`, `runway-card`, `cash-balance-card` (forecast/runway response shapes vs UI).
3. **Inbox / transactions** — `match-transaction`, inbox item/status/actions still on `RouterOutputs`.
4. **Tracker** — `tracker-schedule.tsx` residual typing.
5. **OAuth UI** — `oauth-application-form`, `oauth-consent-screen`.
6. **Recurring** — `edit-recurring-sheet.tsx`.
7. **Tests included in typecheck** — `fetch-invoice-pdf.test.ts`, rust-api fetch mock `as typeof fetch` (TS2352).

## Suggested next slice

1. Extend `delegated-trpc-shapes` for inbox rows, transactions, billing orders.
2. Align public invoice page with `Invoice` from `@midday/invoice` or a narrow view-model type.
3. Exclude `*.test.ts` from dashboard `typecheck` script **or** fix mocks with `as unknown as typeof fetch`.
4. Regenerate OpenAPI where responses are `Record<string, never>` (customers list, report series).

## Verify

```bash
cd apps/dashboard && bun run typecheck
cd apps/dashboard && bun test src/lib/rust-api/*.test.ts
```
