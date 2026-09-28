import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mocks } from "../setup";
import { createCallerFactory } from "../../trpc/init";
import { transactionsRouter } from "../../trpc/routers/transactions";
import { createTestContext } from "../helpers/test-context";

const envSnapshot = { ...process.env };

describe("tRPC: AP-53/54 searchTransactionMatch + create fail-closed", () => {
  beforeEach(() => {
    mocks.searchTransactionMatch?.mockReset?.();
    mocks.createTransaction?.mockReset?.();
    process.env = {
      ...envSnapshot,
      SUPABASE_URL: envSnapshot.SUPABASE_URL ?? "https://test.supabase.co",
      MIDDAY_BACKEND_MODE: "replacement",
      REPLACEMENT_API_URL: "http://127.0.0.1:1",
    };
    delete process.env.REPLACEMENT_DELEGATION_USE_DEMO;
  });

  afterEach(() => {
    process.env = { ...envSnapshot };
  });

  test("searchTransactionMatch throws without Drizzle when API is down", async () => {
    const caller = createCallerFactory(transactionsRouter)(
      createTestContext({ accessToken: "fake-session-jwt" }),
    );
    await expect(
      caller.searchTransactionMatch({ query: "office" }),
    ).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });
    expect(mocks.searchTransactionMatch).not.toHaveBeenCalled();
  });

  test("create throws without Drizzle when API is down", async () => {
    const caller = createCallerFactory(transactionsRouter)(
      createTestContext({ accessToken: "fake-session-jwt" }),
    );
    await expect(
      caller.create({
        name: "Coffee",
        amount: -12,
        currency: "USD",
        date: "2026-01-01",
        bankAccountId: "d1e2f3a4-b5c6-7890-abcd-ef1234567890",
      }),
    ).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });
    expect(mocks.createTransaction).not.toHaveBeenCalled();
  });
});
