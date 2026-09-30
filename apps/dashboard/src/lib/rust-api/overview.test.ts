import { expect, test } from "bun:test";
import { normalizeOverviewSummary } from "./overview";

test("normalizes the Rust overview contract for the dashboard", () => {
  expect(
    normalizeOverviewSummary({
      open_invoices: { count: 2, total_amount: 123.45, currency: "EUR" },
      unbilled_time: {
        total_duration: 3600,
        total_amount: 90,
        project_count: 1,
        currency: "EUR",
      },
      inbox_pending: { count: 3 },
      transactions_to_review: { count: 4 },
      cash_balance: {
        total_balance: 987.65,
        currency: "EUR",
        account_count: 2,
      },
      runway: 0,
    }),
  ).toEqual({
    openInvoices: { count: 2, totalAmount: 123.45, currency: "EUR" },
    unbilledTime: {
      totalDuration: 3600,
      totalAmount: 90,
      projectCount: 1,
      currency: "EUR",
    },
    inboxPending: { count: 3 },
    transactionsToReview: { count: 4 },
    cashBalance: {
      totalBalance: 987.65,
      currency: "EUR",
      accountCount: 2,
    },
    runway: 0,
  });
});
