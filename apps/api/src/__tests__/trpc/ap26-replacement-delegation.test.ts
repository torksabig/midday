import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mocks } from "../setup";
import { createCallerFactory } from "../../trpc/init";
import { documentsRouter } from "../../trpc/routers/documents";
import { apiKeysRouter } from "../../trpc/routers/api-keys";
import { teamRouter } from "../../trpc/routers/team";
import { createTestContext } from "../helpers/test-context";

const envSnapshot = { ...process.env };
const DOC_ID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";

describe("tRPC: AP-26 replacement fail-closed", () => {
  beforeEach(() => {
    mocks.deleteDocument.mockReset();
    mocks.getApiKeysByTeam?.mockReset?.();
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

  test("documents.delete throws without Drizzle when API is down", async () => {
    const caller = createCallerFactory(documentsRouter)(
      createTestContext({ accessToken: "fake-session-jwt" }),
    );
    await expect(caller.delete({ id: DOC_ID })).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });
    expect(mocks.deleteDocument).not.toHaveBeenCalled();
  });

  test("apiKeys.get throws when API is down", async () => {
    const caller = createCallerFactory(apiKeysRouter)(
      createTestContext({ accessToken: "fake-session-jwt" }),
    );
    await expect(caller.get()).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });
  });

  test("team.connectionStatus throws when API is down", async () => {
    const caller = createCallerFactory(teamRouter)(
      createTestContext({ accessToken: "fake-session-jwt" }),
    );
    await expect(caller.connectionStatus()).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });
  });
});
