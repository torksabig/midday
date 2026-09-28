import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mocks } from "../setup";
import { createCallerFactory } from "../../trpc/init";
import { userRouter } from "../../trpc/routers/user";
import { createTestContext } from "../helpers/test-context";

if (!process.env.FILE_KEY_SECRET) {
  process.env.FILE_KEY_SECRET = "test-file-key-secret-for-trpc-user-tests";
}

const createCaller = createCallerFactory(userRouter);
const env = process.env;

describe("tRPC: user.me replacement delegation", () => {
  beforeEach(() => {
    mocks.getUserById.mockReset();
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

  test("returns mapped user when replacement API is reachable", async () => {
    const healthOk = await fetch("http://127.0.0.1:8787/api/v1/health", {
      signal: AbortSignal.timeout(500),
    }).then((r) => r.ok).catch(() => false);

    if (!healthOk) {
      console.warn("skip: replacement API not running on :8787");
      return;
    }

    const caller = createCaller(createTestContext());
    const result = await caller.me();

    expect(result).toMatchObject({
      email: "demo@local.dev",
      fullName: "Demo",
    });
    expect(mocks.getUserById).not.toHaveBeenCalled();
  });

  test("replacement mode throws without calling Drizzle when API is down", async () => {
    process.env.MIDDAY_BACKEND_MODE = "replacement";
    delete process.env.REPLACEMENT_DELEGATION_USE_DEMO;
    process.env.REPLACEMENT_API_URL = "http://127.0.0.1:1";

    const caller = createCaller(
      createTestContext({ accessToken: "fake-session-jwt" }),
    );

    await expect(caller.me()).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });
    expect(mocks.getUserById).not.toHaveBeenCalled();
  });

  test("dual mode falls back to Drizzle when replacement API is down", async () => {
    delete process.env.REPLACEMENT_DELEGATION_USE_DEMO;
    process.env.REPLACEMENT_API_URL = "http://127.0.0.1:1";

    mocks.getUserById.mockResolvedValue({
      id: "test-user-id",
      email: "legacy@example.com",
      teamId: "test-team-id",
    });

    const caller = createCaller(
      createTestContext({ accessToken: "fake-session-jwt" }),
    );
    const result = await caller.me();

    expect(result).toMatchObject({ email: "legacy@example.com" });
    expect(mocks.getUserById).toHaveBeenCalled();
  });
});
