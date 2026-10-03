import { expect, test } from "bun:test";
import type { components } from "./openapi.generated";
import {
  buildInboxByStatusQuery,
  buildInboxListQuery,
  buildInboxSearchQuery,
  normalizeCreatedInboxItem,
  normalizeInboxBlocklistEntry,
  normalizeInboxCheckAttachments,
  normalizeInboxDetail,
  normalizeInboxList,
  normalizeInboxSearchItem,
} from "./inbox";

type RawInboxListResponse = components["schemas"]["InboxListResponse"];
type RawInboxDetailItem = components["schemas"]["InboxDetailItem"];
type RawInboxCheckAttachments =
  components["schemas"]["InboxCheckAttachmentsResponse"];
type RawInboxSearchItem = components["schemas"]["InboxSearchItem"];

test("buildInboxListQuery encodes filters like the façade", () => {
  expect(
    buildInboxListQuery({
      cursor: "c1",
      pageSize: 25,
      q: "acme",
      order: "desc",
      sort: "alphabetical",
      status: "pending",
      tab: "all",
    }),
  ).toBe(
    "?cursor=c1&pageSize=25&order=desc&sort=alphabetical&q=acme&status=pending&tab=all",
  );
});

test("buildInboxSearchQuery and by-status encode params", () => {
  expect(
    buildInboxSearchQuery({
      q: "12.50",
      transactionId: "tx-1",
      limit: 10,
    }),
  ).toBe("?q=12.50&transactionId=tx-1&limit=10");
  expect(buildInboxByStatusQuery({ status: "pending" })).toBe(
    "?status=pending",
  );
});

test("normalizes snake_case inbox list payloads", () => {
  const payload = {
    meta: {
      cursor: "next",
      has_previous_page: false,
      has_next_page: true,
    },
    data: [
      {
        id: "inbox-1",
        file_name: "receipt.pdf",
        file_path: ["a", "b"],
        display_name: "Acme",
        transaction_id: null,
        amount: 12.5,
        currency: "EUR",
        content_type: "application/pdf",
        date: "2026-01-02",
        status: "pending",
        type: "invoice",
        created_at: "2026-01-02T10:00:00Z",
        website: "acme.com",
        sender_email: "billing@acme.com",
        description: "Office supplies",
        inbox_account_id: "acc-1",
        tax_amount: 2.5,
        tax_rate: 20,
        tax_type: "vat",
        related_count: 0,
        inbox_account: {
          id: "acc-1",
          email: "inbox@midday.ai",
          provider: "gmail",
        },
        transaction: null,
      },
    ],
  } as unknown as RawInboxListResponse;

  const list = normalizeInboxList(payload);

  expect(list.meta).toEqual({
    cursor: "next",
    hasPreviousPage: false,
    hasNextPage: true,
  });
  expect(list.data[0]).toMatchObject({
    id: "inbox-1",
    fileName: "receipt.pdf",
    filePath: ["a", "b"],
    displayName: "Acme",
    createdAt: "2026-01-02T10:00:00Z",
    senderEmail: "billing@acme.com",
    inboxAccountId: "acc-1",
    taxAmount: 2.5,
    taxRate: 20,
    taxType: "vat",
    type: "invoice",
    inboxAccount: {
      id: "acc-1",
      email: "inbox@midday.ai",
      provider: "gmail",
    },
    transaction: null,
  });
});

test("normalizes inbox detail suggestion and related items", () => {
  const payload = {
    id: "inbox-1",
    file_name: "receipt.pdf",
    file_path: ["a", "b"],
    display_name: "Acme",
    transaction_id: null,
    amount: 12.5,
    currency: "EUR",
    content_type: "application/pdf",
    date: "2026-01-02",
    status: "suggested_match",
    type: "invoice",
    created_at: "2026-01-02T10:00:00Z",
    website: null,
    sender_email: null,
    description: null,
    inbox_account_id: null,
    tax_amount: null,
    tax_rate: null,
    tax_type: null,
    related_count: 1,
    inbox_account: null,
    transaction: null,
    grouped_inbox_id: "group-1",
    meta: { source: "email" },
    suggestion: {
      id: "sug-1",
      transaction_id: "tx-1",
      confidence_score: 0.92,
      match_type: "amount_date",
      status: "pending",
      suggested_transaction: {
        id: "tx-1",
        name: "Acme Inc",
        amount: -12.5,
        currency: "EUR",
        date: "2026-01-02",
      },
    },
    related_items: [
      {
        id: "inbox-2",
        file_name: "related.pdf",
        file_path: null,
        display_name: "Related",
        transaction_id: null,
        amount: null,
        currency: null,
        content_type: null,
        date: null,
        status: "pending",
        type: null,
        created_at: "2026-01-03T10:00:00Z",
        website: null,
        sender_email: null,
        description: null,
        inbox_account_id: null,
      },
    ],
  } as unknown as RawInboxDetailItem;

  const detail = normalizeInboxDetail(payload);

  expect(detail.groupedInboxId).toBe("group-1");
  expect(detail.suggestion).toMatchObject({
    id: "sug-1",
    transactionId: "tx-1",
    confidenceScore: 0.92,
    matchType: "amount_date",
    status: "pending",
    suggestedTransaction: {
      id: "tx-1",
      name: "Acme Inc",
      amount: -12.5,
      currency: "EUR",
      date: "2026-01-02",
    },
  });
  expect(detail.relatedItems?.[0]).toMatchObject({
    id: "inbox-2",
    displayName: "Related",
    relatedCount: 0,
    inboxAccount: null,
    transaction: null,
  });
});

test("normalizes check-attachments and search items", () => {
  const check = normalizeInboxCheckAttachments({
    has_attachments: true,
    attachments: [
      { id: "att-1", transaction_id: "tx-1", name: "receipt.pdf" },
    ],
    file_name: "receipt.pdf",
  } as RawInboxCheckAttachments);

  expect(check).toEqual({
    hasAttachments: true,
    attachments: [
      { id: "att-1", transactionId: "tx-1", name: "receipt.pdf" },
    ],
    fileName: "receipt.pdf",
  });

  const search = normalizeInboxSearchItem({
    id: "inbox-1",
    created_at: "2026-01-02T10:00:00Z",
    file_name: "receipt.pdf",
    amount: 12.5,
    currency: "EUR",
    file_path: ["a"],
    content_type: "application/pdf",
    date: "2026-01-02",
    display_name: "Acme",
    size: 100,
    description: null,
    status: "pending",
    website: null,
    base_amount: 12.5,
    base_currency: "EUR",
    tax_amount: null,
    tax_rate: null,
    tax_type: null,
    type: "invoice",
  } as RawInboxSearchItem);

  expect(search).toMatchObject({
    id: "inbox-1",
    createdAt: "2026-01-02T10:00:00Z",
    fileName: "receipt.pdf",
    baseAmount: 12.5,
    baseCurrency: "EUR",
    type: "invoice",
  });
});

test("normalizes blocklist entries from camelCase payload", () => {
  expect(
    normalizeInboxBlocklistEntry({
      id: "bl-1",
      teamId: "team-1",
      type: "domain",
      value: "spam.com",
      createdAt: "2026-01-02T10:00:00Z",
    }),
  ).toEqual({
    id: "bl-1",
    teamId: "team-1",
    type: "domain",
    value: "spam.com",
    createdAt: "2026-01-02T10:00:00Z",
  });
});

test("normalizes created inbox item payload", () => {
  expect(
    normalizeCreatedInboxItem({
      id: "inbox-1",
      file_name: "receipt.pdf",
      display_name: "receipt.pdf",
      status: "processing",
    }),
  ).toMatchObject({
    id: "inbox-1",
    fileName: "receipt.pdf",
    displayName: "receipt.pdf",
    status: "processing",
  });
});
