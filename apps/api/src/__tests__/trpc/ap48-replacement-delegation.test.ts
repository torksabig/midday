import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mocks } from "../setup";
import { createCallerFactory } from "../../trpc/init";
import { customersRouter } from "../../trpc/routers/customers";
import { transactionsRouter } from "../../trpc/routers/transactions";
import { createTestContext } from "../helpers/test-context";

const envSnapshot = { ...process.env };
const ID = "d1e2f3a4-b5c6-7890-abcd-ef1234567890";

describe("tRPC: AP-48 customer summary/enrichment + moveToReview fail-closed", () => {
  beforeEach(() => {
    mocks.getCustomerInvoiceSummary?.mockReset?.();
    mocks.updateCustomerEnrichmentStatus?.mockReset?.();
    mocks.clearCustomerEnrichment?.mockReset?.();
    mocks.moveTransactionToReview?.mockReset?.();
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

  test("getInvoiceSummary throws without Drizzle when API is down", async () => {
    const caller = createCallerFactory(customersRouter)(
      createTestContext({ accessToken: "fake-session-jwt" }),
    );
    await expect(caller.getInvoiceSummary({ id: ID })).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });
    expect(mocks.getCustomerInvoiceSummary).not.toHaveBeenCalled();
  });

  test("cancelEnrichment throws without Drizzle when API is down", async () => {
    const caller = createCallerFactory(customersRouter)(
      createTestContext({ accessToken: "fake-session-jwt" }),
    );
    await expect(caller.cancelEnrichment({ id: ID })).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });
    expect(mocks.updateCustomerEnrichmentStatus).not.toHaveBeenCalled();
  });

  test("clearEnrichment throws without Drizzle when API is down", async () => {
    const caller = createCallerFactory(customersRouter)(
      createTestContext({ accessToken: "fake-session-jwt" }),
    );
    await expect(caller.clearEnrichment({ id: ID })).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });
    expect(mocks.clearCustomerEnrichment).not.toHaveBeenCalled();
  });

  test("moveToReview throws without Drizzle when API is down", async () => {
    const caller = createCallerFactory(transactionsRouter)(
      createTestContext({ accessToken: "fake-session-jwt" }),
    );
    await expect(
      caller.moveToReview({ transactionId: ID }),
    ).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });
    expect(mocks.moveTransactionToReview).not.toHaveBeenCalled();
  });
});
