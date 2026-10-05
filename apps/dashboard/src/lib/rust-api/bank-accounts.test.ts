import { afterEach, describe, expect, mock, test } from "bun:test";
import { fetchBankAccountById } from "./bank-accounts";

describe("fetchBankAccountById", () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  test("returns normalized account on 200", async () => {
    globalThis.fetch = mock(() =>
      Promise.resolve(
        new Response(
          JSON.stringify({
            id: "ba-1",
            created_at: "2026-01-01T00:00:00Z",
            created_by: "user-1",
            team_id: "team-1",
            name: "Manual",
            currency: "USD",
            bank_connection_id: null,
            enabled: true,
            account_id: "acc-1",
            balance: 100,
            manual: true,
            type: null,
            base_currency: null,
            base_balance: null,
            error_details: null,
            error_retries: null,
            account_reference: null,
            subtype: null,
            bic: null,
            routing_number: null,
            wire_routing_number: null,
            sort_code: null,
            available_balance: null,
            credit_limit: null,
            bank_connection: null,
          }),
          { status: 200 },
        ),
      ),
    ) as typeof fetch;

    await expect(
      fetchBankAccountById("http://127.0.0.1:8787", "tok", "ba-1"),
    ).resolves.toMatchObject({
      id: "ba-1",
      manual: true,
      currency: "USD",
    });
  });

  test("returns null on 404", async () => {
    globalThis.fetch = mock(() =>
      Promise.resolve(new Response(null, { status: 404 })),
    ) as typeof fetch;

    await expect(
      fetchBankAccountById("http://127.0.0.1:8787", "tok", "missing"),
    ).resolves.toBeNull();
  });
});
