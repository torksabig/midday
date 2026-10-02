import { expect, test } from "bun:test";
import type { components } from "./openapi.generated";
import {
  buildTransactionsListQuery,
  normalizeTransactionDetail,
  normalizeTransactionsList,
} from "./transactions";

type RawTxListResponse = components["schemas"]["TxListResponse"];
type RawTxDetailItem = components["schemas"]["TxDetailItem"];

test("buildTransactionsListQuery encodes filters like the façade", () => {
  expect(
    buildTransactionsListQuery({
      cursor: "c1",
      pageSize: 50,
      q: "acme",
      sort: ["date", "desc"],
      statuses: ["in_review"],
      categories: ["software"],
      amountRange: [10, 20],
      type: "expense",
      fulfilled: true,
      exported: false,
    }),
  ).toBe(
    "?cursor=c1&pageSize=50&q=acme&sort=date&sort=desc&statuses=in_review&categories=software&exported=false&fulfilled=true&amountRange=10&amountRange=20&type=expense",
  );
});

test("normalizes snake_case transaction list payloads", () => {
  const payload = {
    meta: {
      cursor: "next",
      has_previous_page: false,
      has_next_page: true,
    },
    data: [
      {
        id: "tx-1",
        date: "2026-01-02",
        amount: -12.5,
        currency: "EUR",
        method: "card",
        status: "posted",
        note: null,
        manual: false,
        internal: false,
        recurring: null,
        counterparty_name: "Acme",
        frequency: null,
        name: "Coffee",
        description: null,
        created_at: "2026-01-02T10:00:00Z",
        tax_rate: null,
        tax_type: null,
        tax_amount: null,
        base_amount: -12.5,
        base_currency: "EUR",
        enrichment_completed: true,
        is_fulfilled: false,
        has_pending_suggestion: false,
        is_exported: false,
        has_export_error: false,
        export_provider: null,
        exported_at: null,
        export_error_code: null,
        attachments: [
          {
            id: "att-1",
            filename: "receipt.pdf",
            path: "a/b",
            type: "application/pdf",
            size: 12,
          },
        ],
        tags: [{ id: "tag-1", name: "ops" }],
        assigned: {
          id: "user-1",
          full_name: "Ada",
          avatar_url: null,
        },
        category: {
          id: "cat-1",
          name: "Software",
          color: "#fff",
          slug: "software",
          tax_rate: 24,
          tax_type: "vat",
        },
        account: {
          id: "ba-1",
          name: "Checking",
          currency: "EUR",
          connection: {
            id: "bc-1",
            name: "Bank",
            logo_url: null,
          },
        },
      },
    ],
  } as unknown as RawTxListResponse;

  const list = normalizeTransactionsList(payload);

  expect(list.meta).toEqual({
    cursor: "next",
    hasPreviousPage: false,
    hasNextPage: true,
  });
  expect(list.data[0]).toMatchObject({
    id: "tx-1",
    counterpartyName: "Acme",
    createdAt: "2026-01-02T10:00:00Z",
    isFulfilled: false,
    assigned: { id: "user-1", fullName: "Ada", avatarUrl: null },
    category: {
      id: "cat-1",
      slug: "software",
      taxRate: 24,
      taxType: "vat",
    },
    account: {
      id: "ba-1",
      connection: { id: "bc-1", name: "Bank", logoUrl: null },
    },
    attachments: [
      {
        id: "att-1",
        filename: "receipt.pdf",
        path: "a/b",
        type: "application/pdf",
        size: 12,
      },
    ],
    tags: [{ id: "tag-1", name: "ops" }],
  });
});

test("normalizes transaction detail suggestion fields", () => {
  const payload = {
    id: "tx-1",
    date: "2026-01-02",
    amount: -12.5,
    currency: "EUR",
    method: "card",
    status: "posted",
    note: null,
    manual: false,
    internal: false,
    recurring: null,
    counterparty_name: null,
    frequency: null,
    name: "Coffee",
    description: null,
    created_at: "2026-01-02T10:00:00Z",
    tax_rate: null,
    tax_type: null,
    tax_amount: null,
    base_amount: null,
    base_currency: null,
    enrichment_completed: false,
    is_fulfilled: true,
    has_pending_suggestion: true,
    is_exported: false,
    has_export_error: false,
    export_provider: null,
    exported_at: null,
    export_error_code: null,
    attachments: [],
    tags: [],
    assigned: null,
    category: null,
    account: null,
    suggestion: {
      suggestion_id: "sug-1",
      inbox_id: "inbox-1",
      document_name: "Receipt",
      document_amount: 12.5,
      document_currency: "EUR",
      document_path: "x/y",
      confidence_score: 0.9,
    },
  } as unknown as RawTxDetailItem;

  expect(normalizeTransactionDetail(payload).suggestion).toEqual({
    suggestionId: "sug-1",
    inboxId: "inbox-1",
    documentName: "Receipt",
    documentAmount: 12.5,
    documentCurrency: "EUR",
    documentPath: "x/y",
    confidenceScore: 0.9,
  });
});
