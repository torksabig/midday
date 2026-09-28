import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mocks } from "../setup";
import { createCallerFactory } from "../../trpc/init";
import { transactionsRouter } from "../../trpc/routers/transactions";
import { createTestContext } from "../helpers/test-context";

const createCaller = createCallerFactory(transactionsRouter);
const env = process.env;

describe("tRPC: transactions.get replacement delegation", () => {
  beforeEach(() => {
    mocks.getTransactions.mockReset();
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

  test("returns mapped list when replacement API is reachable", async () => {
    const healthOk = await fetch("http://127.0.0.1:8787/api/v1/health", {
      signal: AbortSignal.timeout(500),
    })
      .then((r) => r.ok)
      .catch(() => false);

    if (!healthOk) {
      console.warn("skip: replacement API not running on :8787");
      return;
    }

    const caller = createCaller(createTestContext());
    const result = await caller.get({ pageSize: 5 });

    expect(result.data).toBeDefined();
    expect(Array.isArray(result.data)).toBe(true);
    expect(result.meta).toBeDefined();
    expect(mocks.getTransactions).not.toHaveBeenCalled();
  });

  test("replacement mode throws without calling Drizzle when API is down", async () => {
    process.env.MIDDAY_BACKEND_MODE = "replacement";
    delete process.env.REPLACEMENT_DELEGATION_USE_DEMO;
    process.env.REPLACEMENT_API_URL = "http://127.0.0.1:1";

    const caller = createCaller(
      createTestContext({ accessToken: "fake-session-jwt" }),
    );

    await expect(caller.get({})).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });
    expect(mocks.getTransactions).not.toHaveBeenCalled();
  });
});
