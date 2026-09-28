import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { createCallerFactory } from "../../trpc/init";
import { overviewRouter } from "../../trpc/routers/overview";
import { createTestContext } from "../helpers/test-context";
import { mocks } from "../setup";

const createCaller = createCallerFactory(overviewRouter);
const env = process.env;

describe("tRPC: overview.summary AP-20 no dual Drizzle fallback", () => {
  beforeEach(() => {
    mocks.getOverviewSummary.mockReset();
    mocks.getOverviewSummary.mockImplementation(() =>
      Promise.resolve({
        openInvoices: { count: 0, totalAmount: 0, currency: "USD" },
        unbilledTime: {
          totalDuration: 0,
          totalAmount: 0,
          projectCount: 0,
          currency: "USD",
        },
        inboxPending: { count: 0 },
        transactionsToReview: { count: 0 },
        cashBalance: { totalBalance: 0, currency: "USD", accountCount: 0 },
        runway: 0,
      }),
    );
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

  test("dual mode throws without calling Drizzle when replacement API is down", async () => {
    delete process.env.REPLACEMENT_DELEGATION_USE_DEMO;
    process.env.REPLACEMENT_API_URL = "http://127.0.0.1:1";

    const caller = createCaller(
      createTestContext({ accessToken: "fake-session-jwt" }),
    );

    await expect(caller.summary()).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
      message: expect.stringContaining("overview.summary"),
    });
    expect(mocks.getOverviewSummary).not.toHaveBeenCalled();
  });

  test("legacy mode still uses Drizzle", async () => {
    process.env.MIDDAY_BACKEND_MODE = "legacy";
    delete process.env.REPLACEMENT_DELEGATION_USE_DEMO;

    const caller = createCaller(createTestContext());
    await caller.summary();

    expect(mocks.getOverviewSummary).toHaveBeenCalled();
  });
});
