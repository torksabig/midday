import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mocks } from "../setup";
import { createCallerFactory } from "../../trpc/init";
import { oauthApplicationsRouter } from "../../trpc/routers/oauth-applications";
import { createTestContext } from "../helpers/test-context";

const envSnapshot = { ...process.env };
const APP_ID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";

describe("tRPC: AP-31 oauthApplications CRUD replacement fail-closed", () => {
  beforeEach(() => {
    mocks.createOAuthApplication?.mockReset?.();
    mocks.getOAuthApplicationById?.mockReset?.();
    mocks.updateOAuthApplication?.mockReset?.();
    mocks.deleteOAuthApplication?.mockReset?.();
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

  test("get throws without Drizzle when API is down", async () => {
    const caller = createCallerFactory(oauthApplicationsRouter)(
      createTestContext({ accessToken: "fake-session-jwt" }),
    );
    await expect(caller.get({ id: APP_ID })).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });
    expect(mocks.getOAuthApplicationById).not.toHaveBeenCalled();
  });

  test("create throws without Drizzle when API is down", async () => {
    const caller = createCallerFactory(oauthApplicationsRouter)(
      createTestContext({ accessToken: "fake-session-jwt" }),
    );
    await expect(
      caller.create({
        name: "Test App",
        redirectUris: ["https://example.com/callback"],
        scopes: [],
        isPublic: false,
      }),
    ).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });
    expect(mocks.createOAuthApplication).not.toHaveBeenCalled();
  });

  test("update throws without Drizzle when API is down", async () => {
    const caller = createCallerFactory(oauthApplicationsRouter)(
      createTestContext({ accessToken: "fake-session-jwt" }),
    );
    await expect(
      caller.update({ id: APP_ID, name: "Updated" }),
    ).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });
    expect(mocks.updateOAuthApplication).not.toHaveBeenCalled();
  });

  test("delete throws without Drizzle when API is down", async () => {
    const caller = createCallerFactory(oauthApplicationsRouter)(
      createTestContext({ accessToken: "fake-session-jwt" }),
    );
    await expect(caller.delete({ id: APP_ID })).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });
    expect(mocks.deleteOAuthApplication).not.toHaveBeenCalled();
  });
});
