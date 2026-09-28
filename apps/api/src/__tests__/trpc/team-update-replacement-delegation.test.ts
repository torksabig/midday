import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mocks } from "../setup";
import { createCallerFactory } from "../../trpc/init";
import { teamRouter } from "../../trpc/routers/team";
import { createTestContext } from "../helpers/test-context";

const createCaller = createCallerFactory(teamRouter);
const env = process.env;

describe("tRPC: team.update replacement delegation", () => {
  beforeEach(() => {
    mocks.updateTeam.mockReset();
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

    await expect(caller.update({ name: "Acme Corp" })).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });
    expect(mocks.updateTeam).not.toHaveBeenCalled();
  });
});
