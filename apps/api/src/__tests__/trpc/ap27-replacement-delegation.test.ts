import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mocks } from "../setup";
import { createCallerFactory } from "../../trpc/init";
import { trackerEntriesRouter } from "../../trpc/routers/tracker-entries";
import { createTestContext } from "../helpers/test-context";

const envSnapshot = { ...process.env };
const PROJECT_ID = "b3b6e2c2-1f2a-4e3b-9c1d-2a4b6e2c21f2";

describe("tRPC: AP-27 tracker timer replacement fail-closed", () => {
  beforeEach(() => {
    mocks.startTimer.mockReset();
    mocks.stopTimer.mockReset();
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

  test("startTimer throws without Drizzle when API is down", async () => {
    const caller = createCallerFactory(trackerEntriesRouter)(
      createTestContext({ accessToken: "fake-session-jwt" }),
    );
    await expect(
      caller.startTimer({ projectId: PROJECT_ID }),
    ).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });
    expect(mocks.startTimer).not.toHaveBeenCalled();
  });

  test("stopTimer throws without Drizzle when API is down", async () => {
    const caller = createCallerFactory(trackerEntriesRouter)(
      createTestContext({ accessToken: "fake-session-jwt" }),
    );
    await expect(caller.stopTimer({})).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });
    expect(mocks.stopTimer).not.toHaveBeenCalled();
  });
});
