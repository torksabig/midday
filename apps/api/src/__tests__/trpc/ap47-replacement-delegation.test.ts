import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mocks } from "../setup";
import { createCallerFactory } from "../../trpc/init";
import { inboxRouter } from "../../trpc/routers/inbox";
import { createTestContext } from "../helpers/test-context";

const envSnapshot = { ...process.env };
const ID = "d1e2f3a4-b5c6-7890-abcd-ef1234567890";

describe("tRPC: AP-47 inbox confirm/decline/unmatch fail-closed", () => {
  beforeEach(() => {
    mocks.confirmSuggestedMatch?.mockReset?.();
    mocks.declineSuggestedMatch?.mockReset?.();
    mocks.unmatchTransaction?.mockReset?.();
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

  test("confirmMatch throws without Drizzle when API is down", async () => {
    const caller = createCallerFactory(inboxRouter)(
      createTestContext({ accessToken: "fake-session-jwt" }),
    );
    await expect(
      caller.confirmMatch({
        suggestionId: ID,
        inboxId: ID,
        transactionId: ID,
      }),
    ).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });
    expect(mocks.confirmSuggestedMatch).not.toHaveBeenCalled();
  });

  test("declineMatch throws without Drizzle when API is down", async () => {
    const caller = createCallerFactory(inboxRouter)(
      createTestContext({ accessToken: "fake-session-jwt" }),
    );
    await expect(
      caller.declineMatch({
        suggestionId: ID,
        inboxId: ID,
      }),
    ).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });
    expect(mocks.declineSuggestedMatch).not.toHaveBeenCalled();
  });

  test("unmatchTransaction throws without Drizzle when API is down", async () => {
    const caller = createCallerFactory(inboxRouter)(
      createTestContext({ accessToken: "fake-session-jwt" }),
    );
    await expect(caller.unmatchTransaction({ id: ID })).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });
    expect(mocks.unmatchTransaction).not.toHaveBeenCalled();
  });
});
