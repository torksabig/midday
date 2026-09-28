import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { createCallerFactory } from "../../trpc/init";
import { searchRouter } from "../../trpc/routers/search";
import { createTestContext } from "../helpers/test-context";
import { mocks } from "../setup";

const createCaller = createCallerFactory(searchRouter);
const env = process.env;

describe("tRPC: search AP-20 no dual Drizzle fallback", () => {
  beforeEach(() => {
    mocks.globalSearchQuery.mockReset();
    mocks.getInboxSearch.mockReset();
    mocks.getInvoices.mockReset();
    mocks.globalSearchQuery.mockImplementation(() => Promise.resolve([]));
    mocks.getInboxSearch.mockImplementation(() => Promise.resolve([]));
    mocks.getInvoices.mockImplementation(() =>
      Promise.resolve({ data: [], meta: {} }),
    );
    process.env = {
      ...env,
      SUPABASE_URL: env.SUPABASE_URL ?? "https://test.supabase.co",
      MIDDAY_BACKEND_MODE: "dual",
      REPLACEMENT_API_URL: "http://127.0.0.1:1",
    };
    delete process.env.REPLACEMENT_DELEGATION_USE_DEMO;
  });

  afterEach(() => {
    process.env = { ...env };
  });

  test("search.global dual mode throws without FTS Drizzle when API is down", async () => {
    const caller = createCaller(
      createTestContext({ accessToken: "fake-session-jwt" }),
    );

    await expect(caller.global({ searchTerm: "acme" })).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
      message: expect.stringContaining("search.global"),
    });
    expect(mocks.globalSearchQuery).not.toHaveBeenCalled();
  });

  test("search.attachments dual mode throws without Drizzle when API is down", async () => {
    const caller = createCaller(
      createTestContext({ accessToken: "fake-session-jwt" }),
    );

    await expect(caller.attachments({ q: "receipt" })).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
      message: expect.stringContaining("search.attachments"),
    });
    expect(mocks.getInboxSearch).not.toHaveBeenCalled();
  });
});
