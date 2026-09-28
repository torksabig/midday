import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mocks } from "../setup";
import { createCallerFactory } from "../../trpc/init";
import { transactionCategoriesRouter } from "../../trpc/routers/transaction-categories";
import { createTestContext } from "../helpers/test-context";

const envSnapshot = { ...process.env };
const CAT_ID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";

describe("tRPC: AP-30 categories CRUD replacement fail-closed", () => {
  beforeEach(() => {
    mocks.createTransactionCategory?.mockReset?.();
    mocks.updateTransactionCategory?.mockReset?.();
    mocks.deleteTransactionCategory?.mockReset?.();
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

  test("create throws without Drizzle when API is down", async () => {
    const caller = createCallerFactory(transactionCategoriesRouter)(
      createTestContext({ accessToken: "fake-session-jwt" }),
    );
    await expect(caller.create({ name: "Office" })).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });
  });

  test("update throws without Drizzle when API is down", async () => {
    const caller = createCallerFactory(transactionCategoriesRouter)(
      createTestContext({ accessToken: "fake-session-jwt" }),
    );
    await expect(
      caller.update({
        id: CAT_ID,
        name: "Office",
        color: null,
        description: null,
        taxRate: null,
        taxType: null,
        taxReportingCode: null,
        excluded: null,
      }),
    ).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });
  });

  test("delete throws without Drizzle when API is down", async () => {
    const caller = createCallerFactory(transactionCategoriesRouter)(
      createTestContext({ accessToken: "fake-session-jwt" }),
    );
    await expect(caller.delete({ id: CAT_ID })).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });
  });
});
