import { describe, expect, test } from "bun:test";
import {
  mapReplacementToBankAccountsGet,
  mapReplacementToInboxById,
  mapReplacementToInboxGet,
  mapReplacementToTeamCurrent,
  mapReplacementToTransactionById,
  mapReplacementToTransactionCategoriesGet,
  mapReplacementToTransactionsGet,
  mapReplacementToUserMe,
} from "./mappers";

describe("replacement mappers", () => {
  test("mapReplacementToUserMe maps clone auth/me to Midday user.me", () => {
    const mapped = mapReplacementToUserMe(
      {
        user: { id: "u1", email: "a@b.com", name: "Ada" },
        team: { id: "t1", name: "Team" },
        settings: { currency: "EUR", locale: "de-DE" },
      },
      "file-key",
    );

    expect(mapped).toMatchObject({
      id: "u1",
      email: "a@b.com",
      fullName: "Ada",
      teamId: "t1",
      fileKey: "file-key",
      team: {
        id: "t1",
        name: "Team",
        baseCurrency: "EUR",
      },
      locale: "de-DE",
    });
  });

  test("mapReplacementToTeamCurrent maps team/current payload", () => {
    const mapped = mapReplacementToTeamCurrent({
      id: "t1",
      name: "Acme",
      base_currency: "USD",
      locale: "en-US",
    });

    expect(mapped).toMatchObject({
      id: "t1",
      name: "Acme",
      baseCurrency: "USD",
      plan: "trial",
    });
  });

  test("mapReplacementToTransactionsGet maps list payload to transactions.get", () => {
    const mapped = mapReplacementToTransactionsGet({
      meta: {
        cursor: "40",
        has_previous_page: false,
        has_next_page: true,
      },
      data: [
        {
          id: "tx1",
          date: "2026-09-01",
          amount: -49.5,
          currency: "USD",
          method: "card",
          status: "posted",
          manual: false,
          internal: false,
          name: "Software",
          created_at: "2026-09-01T12:00:00Z",
          enrichment_completed: false,
          is_fulfilled: false,
          has_pending_suggestion: false,
          is_exported: false,
          has_export_error: false,
          counterparty_name: "Figma",
          account: {
            id: "ba1",
            name: "Main",
            currency: "USD",
            connection: null,
          },
        },
      ],
    });

    expect(mapped.meta).toMatchObject({
      cursor: "40",
      hasNextPage: true,
    });
    expect(mapped.data[0]).toMatchObject({
      id: "tx1",
      amount: -49.5,
      counterpartyName: "Figma",
      account: { id: "ba1", name: "Main", currency: "USD" },
    });
  });

  test("mapReplacementToTransactionsGet maps attachments and tags", () => {
    const mapped = mapReplacementToTransactionsGet({
      meta: {
        has_previous_page: false,
        has_next_page: false,
      },
      data: [
        {
          id: "tx1",
          date: "2026-09-01",
          amount: -10,
          currency: "USD",
          method: "card",
          status: "posted",
          manual: false,
          internal: false,
          name: "Item",
          created_at: "2026-09-01T12:00:00Z",
          enrichment_completed: false,
          is_fulfilled: true,
          has_pending_suggestion: false,
          is_exported: false,
          has_export_error: false,
          attachments: [
            {
              id: "att1",
              filename: "receipt.pdf",
              path: "/p",
              type: "application/pdf",
              size: 42,
            },
          ],
          tags: [{ id: "tag1", name: "Travel" }],
        },
      ],
    });

    expect(mapped.data[0]?.attachments).toEqual([
      {
        id: "att1",
        filename: "receipt.pdf",
        path: "/p",
        type: "application/pdf",
        size: 42,
      },
    ]);
    expect(mapped.data[0]?.tags).toEqual([{ id: "tag1", name: "Travel" }]);
  });

  test("mapReplacementToTransactionById maps detail payload with suggestion", () => {
    const mapped = mapReplacementToTransactionById({
      id: "tx1",
      date: "2026-09-01",
      amount: -49.5,
      currency: "USD",
      method: "card",
      status: "posted",
      manual: false,
      internal: false,
      name: "Software",
      created_at: "2026-09-01T12:00:00Z",
      enrichment_completed: false,
      is_fulfilled: false,
      has_pending_suggestion: true,
      is_exported: false,
      has_export_error: false,
      suggestion: {
        suggestion_id: "s1",
        inbox_id: "in1",
        document_name: "Receipt.pdf",
        confidence_score: 0.92,
      },
    });

    expect(mapped).toMatchObject({
      id: "tx1",
      hasPendingSuggestion: true,
      suggestion: {
        suggestionId: "s1",
        inboxId: "in1",
        documentName: "Receipt.pdf",
        confidenceScore: 0.92,
      },
    });
  });

  test("mapReplacementToTransactionCategoriesGet maps nested children", () => {
    const mapped = mapReplacementToTransactionCategoriesGet([
      {
        id: "c1",
        name: "Travel",
        slug: "travel",
        children: [
          {
            id: "c2",
            name: "Flights",
            slug: "flights",
            parent_id: "c1",
          },
        ],
      },
    ]);

    expect(mapped[0]?.children[0]).toMatchObject({
      id: "c2",
      name: "Flights",
      slug: "flights",
      parentId: "c1",
    });
  });

  test("mapReplacementToBankAccountsGet maps bank connection without token", () => {
    const mapped = mapReplacementToBankAccountsGet([
      {
        id: "ba1",
        created_at: "2026-01-01T00:00:00Z",
        created_by: "u1",
        team_id: "t1",
        enabled: true,
        account_id: "ext-1",
        bank_connection: {
          id: "bc1",
          created_at: "2026-01-01T00:00:00Z",
          institution_id: "ins",
          team_id: "t1",
          name: "Chase",
          provider: "plaid",
        },
      },
    ]);

    expect(mapped[0]?.bankConnection).toMatchObject({
      id: "bc1",
      name: "Chase",
      accessToken: null,
    });
  });

  test("mapReplacementToInboxGet maps paginated inbox list", () => {
    const mapped = mapReplacementToInboxGet({
      meta: {
        cursor: "20",
        has_previous_page: true,
        has_next_page: false,
      },
      data: [
        {
          id: "in1",
          file_name: "inv.pdf",
          file_path: ["vault", "inv.pdf"],
          display_name: "Invoice",
          status: "pending",
          created_at: "2026-09-01T00:00:00Z",
          related_count: 2,
          inbox_account: { id: "ia1", email: "in@co.com", provider: "gmail" },
          transaction: {
            id: "tx1",
            amount: 10,
            currency: "USD",
            name: "Coffee",
            date: "2026-08-30",
          },
        },
      ],
    });

    expect(mapped.meta).toMatchObject({
      cursor: "20",
      hasPreviousPage: true,
      hasNextPage: false,
    });
    expect(mapped.data[0]).toMatchObject({
      id: "in1",
      fileName: "inv.pdf",
      relatedCount: 2,
      inboxAccount: { id: "ia1", email: "in@co.com", provider: "gmail" },
      transaction: { id: "tx1", name: "Coffee" },
    });
  });

  test("mapReplacementToInboxById maps detail fields", () => {
    const mapped = mapReplacementToInboxById({
      id: "in1",
      status: "suggested_match",
      created_at: "2026-09-01T00:00:00Z",
      related_count: 0,
      grouped_inbox_id: null,
      suggestion: {
        id: "s1",
        transaction_id: "tx9",
        confidence_score: 0.91,
        match_type: "amount",
        status: "pending",
        suggested_transaction: {
          id: "tx9",
          name: "Vendor",
          amount: 50,
          currency: "USD",
          date: "2026-08-01",
        },
      },
    });

    expect(mapped.suggestion).toMatchObject({
      id: "s1",
      transactionId: "tx9",
      confidenceScore: 0.91,
      suggestedTransaction: { id: "tx9", name: "Vendor" },
    });
  });
});
