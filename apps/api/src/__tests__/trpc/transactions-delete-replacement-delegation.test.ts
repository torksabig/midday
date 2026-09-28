import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mocks } from "../setup";
import { createCallerFactory } from "../../trpc/init";
import { transactionsRouter } from "../../trpc/routers/transactions";
import { createTestContext } from "../helpers/test-context";

const createCaller = createCallerFactory(transactionsRouter);
const env = process.env;

describe("tRPC: transactions.deleteMany replacement delegation", () => {
  beforeEach(() => {
    mocks.deleteTransactions.mockReset();
    process.env = {
      ...env,
      SUPABASE_URL: env.SUPABASE_URL ?? "https://test.supabase.co",
      MIDDAY_BACKEND_MODE: "dual",
      REPLACEMENT_DELEGATION_USE_DEMO: "true",
      REPLACEMENT_API_URL: "http://127.0.0.1:8787",
    };
  });

  afterEach(() => {
    process.env = { ...env };
  });

  test("replacement mode throws without calling Drizzle when API is down", async () => {
    process.env.MIDDAY_BACKEND_MODE = "replacement";
    delete process.env.REPLACEMENT_DELEGATION_USE_DEMO;
    process.env.REPLACEMENT_API_URL = "http://127.0.0.1:1";

    const caller = createCaller(
      createTestContext({ accessToken: "fake-session-jwt" }),
    );

    await expect(
      caller.deleteMany(["b3b7c8e2-1f2a-4c3d-9e4f-5a6b7c8d9e0f"]),
    ).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });
    expect(mocks.deleteTransactions).not.toHaveBeenCalled();
  });
});
