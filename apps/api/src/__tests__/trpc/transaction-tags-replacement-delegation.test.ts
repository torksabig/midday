import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mocks } from "../setup";
import { createCallerFactory } from "../../trpc/init";
import { transactionTagsRouter } from "../../trpc/routers/transaction-tags";
import { createTestContext } from "../helpers/test-context";

const createCaller = createCallerFactory(transactionTagsRouter);
const TRANSACTION_ID = "f1e2d3c4-b5a6-7890-abcd-ef1234567890";
const TAG_ID = "e2d3c4b5-a6f7-8901-bcde-f12345678901";
const envSnapshot = { ...process.env };

describe("tRPC: transactionTags replacement delegation", () => {
  beforeEach(() => {
    mocks.createTransactionTag.mockReset();
    mocks.deleteTransactionTag.mockReset();
    process.env = {
      ...envSnapshot,
      SUPABASE_URL: envSnapshot.SUPABASE_URL ?? "https://test.supabase.co",
      MIDDAY_BACKEND_MODE: "dual",
      REPLACEMENT_DELEGATION_USE_DEMO: "true",
      REPLACEMENT_API_URL: "http://127.0.0.1:8787",
    };
  });

  afterEach(() => {
    process.env = { ...envSnapshot };
  });

  test("replacement mode create throws without calling Drizzle when API is down", async () => {
    process.env.MIDDAY_BACKEND_MODE = "replacement";
    delete process.env.REPLACEMENT_DELEGATION_USE_DEMO;
    process.env.REPLACEMENT_API_URL = "http://127.0.0.1:1";

    const caller = createCaller(
      createTestContext({ accessToken: "fake-session-jwt" }),
    );

    await expect(
      caller.create({ transactionId: TRANSACTION_ID, tagId: TAG_ID }),
    ).rejects.toMatchObject({ code: "INTERNAL_SERVER_ERROR" });
    expect(mocks.createTransactionTag).not.toHaveBeenCalled();
  });

  test("replacement mode delete throws without calling Drizzle when API is down", async () => {
    process.env.MIDDAY_BACKEND_MODE = "replacement";
    delete process.env.REPLACEMENT_DELEGATION_USE_DEMO;
    process.env.REPLACEMENT_API_URL = "http://127.0.0.1:1";

    const caller = createCaller(
      createTestContext({ accessToken: "fake-session-jwt" }),
    );

    await expect(
      caller.delete({ transactionId: TRANSACTION_ID, tagId: TAG_ID }),
    ).rejects.toMatchObject({ code: "INTERNAL_SERVER_ERROR" });
    expect(mocks.deleteTransactionTag).not.toHaveBeenCalled();
  });
});
