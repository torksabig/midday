import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { createCallerFactory } from "../../trpc/init";
import { userRouter } from "../../trpc/routers/user";
import { createTestContext } from "../helpers/test-context";
import { mocks } from "../setup";

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
});
