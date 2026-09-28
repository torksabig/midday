import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mocks } from "../setup";
import { createCallerFactory } from "../../trpc/init";
import { notificationsRouter } from "../../trpc/routers/notifications";
import { createTestContext } from "../helpers/test-context";

const ACTIVITY_ID = "b3b6e2c2-1f2a-4e3b-9c1d-2a4b6e2c21f2";
const createCaller = createCallerFactory(notificationsRouter);
const env = process.env;

describe("tRPC: notifications.updateStatus replacement delegation", () => {
  beforeEach(() => {
    mocks.updateActivityStatus.mockReset();
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
      caller.updateStatus({ activityId: ACTIVITY_ID, status: "read" }),
    ).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });
    expect(mocks.updateActivityStatus).not.toHaveBeenCalled();
  });

  test("dual mode falls back to Drizzle when replacement API is down", async () => {
    delete process.env.REPLACEMENT_DELEGATION_USE_DEMO;
    process.env.REPLACEMENT_API_URL = "http://127.0.0.1:1";
    mocks.updateActivityStatus.mockResolvedValue({
      id: ACTIVITY_ID,
      status: "read",
    });

    const caller = createCaller(
      createTestContext({ accessToken: "fake-session-jwt" }),
    );
    const result = await caller.updateStatus({
      activityId: ACTIVITY_ID,
      status: "read",
    });

    expect(result).toMatchObject({ id: ACTIVITY_ID, status: "read" });
    expect(mocks.updateActivityStatus).toHaveBeenCalled();
  });
});
