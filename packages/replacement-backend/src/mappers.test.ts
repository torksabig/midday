import { describe, expect, test } from "bun:test";
import {
  mapReplacementToTeamCurrent,
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
});
