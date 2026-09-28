import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mocks } from "../setup";
import { createCallerFactory } from "../../trpc/init";
import { inboxRouter } from "../../trpc/routers/inbox";
import { apiKeysRouter } from "../../trpc/routers/api-keys";
import { reportsRouter } from "../../trpc/routers/reports";
import { createTestContext } from "../helpers/test-context";

const envSnapshot = { ...process.env };
const ENTRY_ID = "d1e2f3a4-b5c6-7890-abcd-ef1234567890";

describe("tRPC: AP-40 blocklist + apiKeys.delete + reports.create fail-closed", () => {
  beforeEach(() => {
    mocks.getInboxBlocklist?.mockReset?.();
    mocks.createInboxBlocklist?.mockReset?.();
    mocks.deleteInboxBlocklist?.mockReset?.();
    mocks.deleteApiKey?.mockReset?.();
    mocks.createReport?.mockReset?.();
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

  test("inbox.blocklist.get throws without Drizzle when API is down", async () => {
    const caller = createCallerFactory(inboxRouter)(
      createTestContext({ accessToken: "fake-session-jwt" }),
    );
    await expect(caller.blocklist.get()).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });
    expect(mocks.getInboxBlocklist).not.toHaveBeenCalled();
  });

  test("inbox.blocklist.create throws without Drizzle when API is down", async () => {
    const caller = createCallerFactory(inboxRouter)(
      createTestContext({ accessToken: "fake-session-jwt" }),
    );
    await expect(
      caller.blocklist.create({ type: "domain", value: "spam.com" }),
    ).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });
    expect(mocks.createInboxBlocklist).not.toHaveBeenCalled();
  });

  test("inbox.blocklist.delete throws without Drizzle when API is down", async () => {
    const caller = createCallerFactory(inboxRouter)(
      createTestContext({ accessToken: "fake-session-jwt" }),
    );
    await expect(caller.blocklist.delete({ id: ENTRY_ID })).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });
    expect(mocks.deleteInboxBlocklist).not.toHaveBeenCalled();
  });

  test("apiKeys.delete throws without Drizzle when API is down", async () => {
    const caller = createCallerFactory(apiKeysRouter)(
      createTestContext({ accessToken: "fake-session-jwt" }),
    );
    await expect(caller.delete({ id: ENTRY_ID })).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });
    expect(mocks.deleteApiKey).not.toHaveBeenCalled();
  });

  test("reports.create throws without Drizzle when API is down", async () => {
    const caller = createCallerFactory(reportsRouter)(
      createTestContext({ accessToken: "fake-session-jwt" }),
    );
    await expect(
      caller.create({
        type: "burn_rate",
        from: "2023-01-01",
        to: "2023-12-31",
      }),
    ).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });
    expect(mocks.createReport).not.toHaveBeenCalled();
  });
});
