import { expect, test } from "bun:test";
import {
  buildInvoiceRecurringListQuery,
  deepCamelCaseKeys,
} from "./invoice-recurring";

test("buildInvoiceRecurringListQuery encodes camelCase filters", () => {
  expect(
    buildInvoiceRecurringListQuery({
      cursor: "25",
      pageSize: 25,
      status: "active",
      customerId: "c-1",
    }),
  ).toBe("?cursor=25&pageSize=25&status=active&customerId=c-1");
});

test("deepCamelCaseKeys normalizes pause/delete jobIds", () => {
  expect(
    deepCamelCaseKeys({
      recurring: { id: "rec-1", status: "paused" },
      job_ids: ["invoices:1"],
    }),
  ).toEqual({
    recurring: { id: "rec-1", status: "paused" },
    jobIds: ["invoices:1"],
  });
});

test("deepCamelCaseKeys normalizes upcoming summary", () => {
  expect(
    deepCamelCaseKeys({
      invoices: [{ date: "2026-04-01", amount: 100 }],
      summary: { total_count: 3, total_amount: 300 },
    }),
  ).toEqual({
    invoices: [{ date: "2026-04-01", amount: 100 }],
    summary: { totalCount: 3, totalAmount: 300 },
  });
});
