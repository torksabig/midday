import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mocks } from "../setup";
import { createCallerFactory } from "../../trpc/init";
import { inboxAccountsRouter } from "../../trpc/routers/inbox-accounts";
import { invoiceRouter } from "../../trpc/routers/invoice";
import { transactionsRouter } from "../../trpc/routers/transactions";
import { createTestContext } from "../helpers/test-context";

const envSnapshot = { ...process.env };
const ACCOUNT_ID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";

describe("tRPC: AP-58 hybrid defaultSettings/import/inboxAccounts.delete fail-closed", () => {
  beforeEach(() => {
    mocks.getNextInvoiceNumber?.mockReset?.();
    mocks.getInvoiceTemplate?.mockReset?.();
    mocks.getTeamById?.mockReset?.();
    mocks.getUserById?.mockReset?.();
    mocks.getBankAccountById?.mockReset?.();
    mocks.updateBankAccount?.mockReset?.();
    mocks.deleteInboxAccount?.mockReset?.();
    mocks.triggerJob?.mockReset?.();
    mocks.triggerJob?.mockImplementation?.(() => ({ id: "job-1" }));
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

  test("invoice.defaultSettings throws without Drizzle when API is down", async () => {
    const caller = createCallerFactory(invoiceRouter)(
      createTestContext({ accessToken: "fake-session-jwt" }),
    );
    await expect(caller.defaultSettings()).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });
    expect(mocks.getNextInvoiceNumber).not.toHaveBeenCalled();
    expect(mocks.getInvoiceTemplate).not.toHaveBeenCalled();
  });

  test("transactions.import throws without Drizzle when API is down", async () => {
    const caller = createCallerFactory(transactionsRouter)(
      createTestContext({ accessToken: "fake-session-jwt" }),
    );
    await expect(
      caller.import({
        filePath: ["team", "file.csv"],
        bankAccountId: ACCOUNT_ID,
        currency: "USD",
        inverted: false,
        mappings: {
          amount: "Amount",
          date: "Date",
          description: "Description",
        },
      }),
    ).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });
    expect(mocks.getBankAccountById).not.toHaveBeenCalled();
    expect(mocks.triggerJob).not.toHaveBeenCalled();
  });

  test("inboxAccounts.delete throws without Drizzle when API is down", async () => {
    const caller = createCallerFactory(inboxAccountsRouter)(
      createTestContext({ accessToken: "fake-session-jwt" }),
    );
    await expect(caller.delete({ id: ACCOUNT_ID })).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });
    expect(mocks.deleteInboxAccount).not.toHaveBeenCalled();
  });
});
