import { describe, expect, test } from "bun:test";
import {
  mapReplacementToBankAccountsGet,
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
});
