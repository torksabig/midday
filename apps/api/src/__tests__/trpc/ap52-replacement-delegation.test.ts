import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mocks } from "../setup";
import { createCallerFactory } from "../../trpc/init";
import { userRouter } from "../../trpc/routers/user";
import { notificationSettingsRouter } from "../../trpc/routers/notification-settings";
import { bankConnectionsRouter } from "../../trpc/routers/bank-connections";
import { createTestContext } from "../helpers/test-context";

const envSnapshot = { ...process.env };
const ID = "d1e2f3a4-b5c6-7890-abcd-ef1234567890";

describe("tRPC: AP-52 switchTeam/getAll/bankConnections.delete fail-closed", () => {
  beforeEach(() => {
    mocks.switchUserTeam?.mockReset?.();
    mocks.getUserNotificationPreferences?.mockReset?.();
    mocks.deleteBankConnection?.mockReset?.();
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

  test("switchTeam throws without Drizzle when API is down", async () => {
    const caller = createCallerFactory(userRouter)(
      createTestContext({ accessToken: "fake-session-jwt" }),
    );
    await expect(caller.switchTeam({ teamId: ID })).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });
    expect(mocks.switchUserTeam).not.toHaveBeenCalled();
  });

  test("getAll throws without Drizzle when API is down", async () => {
    const caller = createCallerFactory(notificationSettingsRouter)(
      createTestContext({ accessToken: "fake-session-jwt" }),
    );
    await expect(caller.getAll()).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });
    expect(mocks.getUserNotificationPreferences).not.toHaveBeenCalled();
  });

  test("bankConnections.delete throws without Drizzle when API is down", async () => {
    const caller = createCallerFactory(bankConnectionsRouter)(
      createTestContext({ accessToken: "fake-session-jwt" }),
    );
    await expect(caller.delete({ id: ID })).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });
    expect(mocks.deleteBankConnection).not.toHaveBeenCalled();
  });
});
