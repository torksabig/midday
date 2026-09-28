import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mocks } from "../setup";
import { createCallerFactory } from "../../trpc/init";
import { customersRouter } from "../../trpc/routers/customers";
import { transactionsRouter } from "../../trpc/routers/transactions";
import { oauthApplicationsRouter } from "../../trpc/routers/oauth-applications";
import { createTestContext } from "../helpers/test-context";

const envSnapshot = { ...process.env };
const ID = "d1e2f3a4-b5c6-7890-abcd-ef1234567890";

describe("tRPC: AP-49 similar/portal toggle/applicationInfo fail-closed", () => {
  beforeEach(() => {
    mocks.getSimilarTransactions?.mockReset?.();
    mocks.toggleCustomerPortal?.mockReset?.();
    mocks.getOAuthApplicationByClientId?.mockReset?.();
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

  test("getSimilarTransactions throws without Drizzle when API is down", async () => {
    const caller = createCallerFactory(transactionsRouter)(
      createTestContext({ accessToken: "fake-session-jwt" }),
    );
    await expect(
      caller.getSimilarTransactions({ name: "Amazon" }),
    ).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });
    expect(mocks.getSimilarTransactions).not.toHaveBeenCalled();
  });

  test("togglePortal throws without Drizzle when API is down", async () => {
    const caller = createCallerFactory(customersRouter)(
      createTestContext({ accessToken: "fake-session-jwt" }),
    );
    await expect(
      caller.togglePortal({ customerId: ID, enabled: true }),
    ).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });
    expect(mocks.toggleCustomerPortal).not.toHaveBeenCalled();
  });

  test("getApplicationInfo throws without Drizzle when API is down", async () => {
    const caller = createCallerFactory(oauthApplicationsRouter)(
      createTestContext({ accessToken: "fake-session-jwt" }),
    );
    await expect(
      caller.getApplicationInfo({
        clientId: "client",
        redirectUri: "https://example.com/cb",
        scope: "openid",
      }),
    ).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });
    expect(mocks.getOAuthApplicationByClientId).not.toHaveBeenCalled();
  });
});
