import { expect, test } from "bun:test";
import type { components } from "./openapi.generated";
import {
  buildInvoiceSummaryQuery,
  buildInvoicesListQuery,
  deepCamelCaseKeys,
  normalizeInvoicePaymentStatus,
  normalizeInvoiceSummary,
  normalizeInvoicesList,
} from "./invoices";

type RawInvoicesListResponse = components["schemas"]["InvoicesListResponse"];
type RawPaymentStatusResponse = components["schemas"]["PaymentStatusResponse"];
type RawInvoiceSummaryResponse = components["schemas"]["InvoiceSummaryResponse"];

test("buildInvoicesListQuery encodes filters like the façade", () => {
  expect(
    buildInvoicesListQuery({
      cursor: "25",
      pageSize: 25,
      q: "INV",
      start: "2026-01-01",
      end: "2026-01-31",
      recurring: true,
      statuses: ["paid", "overdue"],
      customers: ["cust-1"],
      sort: ["createdAt", "desc"],
      ids: ["inv-1"],
      recurringIds: ["rec-1"],
    }),
  ).toBe(
    "?cursor=25&pageSize=25&q=INV&start=2026-01-01&end=2026-01-31&recurring=true&statuses=paid&statuses=overdue&customers=cust-1&sort=createdAt&sort=desc&ids=inv-1&recurringIds=rec-1",
  );
});

test("buildInvoiceSummaryQuery encodes statuses", () => {
  expect(
    buildInvoiceSummaryQuery({
      statuses: ["draft", "scheduled", "unpaid"],
    }),
  ).toBe("?statuses=draft&statuses=scheduled&statuses=unpaid");
});

test("normalizes snake_case invoices list payloads", () => {
  const payload = {
    meta: {
      cursor: "25",
      has_previous_page: false,
      has_next_page: true,
    },
    data: [
      {
        id: "inv-1",
        invoice_number: "INV-0001",
        status: "paid",
        amount: 100,
        customer: { id: "cust-1", name: "Acme" },
      },
    ],
  } as unknown as RawInvoicesListResponse;

  const list = normalizeInvoicesList(payload);

  expect(list.meta).toEqual({
    cursor: "25",
    hasPreviousPage: false,
    hasNextPage: true,
  });
  expect(list.data[0]).toMatchObject({
    id: "inv-1",
    invoiceNumber: "INV-0001",
    status: "paid",
    amount: 100,
    customer: { id: "cust-1", name: "Acme" },
  });
});

test("normalizes payment status and summary payloads", () => {
  expect(
    normalizeInvoicePaymentStatus({
      score: 82,
      payment_status: "good",
    } as RawPaymentStatusResponse),
  ).toEqual({
    score: 82,
    paymentStatus: "good",
  });

  expect(
    normalizeInvoiceSummary({
      total_amount: 1200,
      invoice_count: 3,
      currency: "USD",
      breakdown: [
        {
          currency: "EUR",
          original_amount: 100,
          converted_amount: 110,
          count: 1,
        },
      ],
    } as RawInvoiceSummaryResponse),
  ).toEqual({
    totalAmount: 1200,
    invoiceCount: 3,
    currency: "USD",
    breakdown: [
      {
        currency: "EUR",
        originalAmount: 100,
        convertedAmount: 110,
        count: 1,
      },
    ],
  });
});

test("deepCamelCaseKeys walks nested objects", () => {
  expect(
    deepCamelCaseKeys({
      invoice_number: "INV-1",
      nested_obj: { due_date: "2026-01-01" },
    }),
  ).toEqual({
    invoiceNumber: "INV-1",
    nestedObj: { dueDate: "2026-01-01" },
  });
});
