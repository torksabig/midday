import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mocks } from "../setup";
import { createCallerFactory } from "../../trpc/init";
import { trackerProjectsRouter } from "../../trpc/routers/tracker-projects";
import { oauthApplicationsRouter } from "../../trpc/routers/oauth-applications";
import { createTestContext } from "../helpers/test-context";

const envSnapshot = { ...process.env };
const PROJECT_ID = "b7e6c8e2-1f2a-4c3b-9e2d-1a2b3c4d5e6f";
const OAUTH_APP_ID = "c8e7d9f3-2a3b-4d5e-8f1a-2b3c4d5e6f7a";

describe("tRPC: AP-38 trackerProjects + oauth regenerateSecret fail-closed", () => {
  beforeEach(() => {
    mocks.upsertTrackerProject?.mockReset?.();
    mocks.deleteTrackerProject?.mockReset?.();
    mocks.regenerateClientSecret?.mockReset?.();
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

  test("trackerProjects.upsert throws without Drizzle when API is down", async () => {
    const caller = createCallerFactory(trackerProjectsRouter)(
      createTestContext({ accessToken: "fake-session-jwt" }),
    );
    await expect(
      caller.upsert({ name: "Website Redesign" }),
    ).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });
    expect(mocks.upsertTrackerProject).not.toHaveBeenCalled();
  });

  test("trackerProjects.delete throws without Drizzle when API is down", async () => {
    const caller = createCallerFactory(trackerProjectsRouter)(
      createTestContext({ accessToken: "fake-session-jwt" }),
    );
    await expect(
      caller.delete({ id: PROJECT_ID }),
    ).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });
    expect(mocks.deleteTrackerProject).not.toHaveBeenCalled();
  });

  test("oauthApplications.regenerateSecret throws without Drizzle when API is down", async () => {
    const caller = createCallerFactory(oauthApplicationsRouter)(
      createTestContext({ accessToken: "fake-session-jwt" }),
    );
    await expect(
      caller.regenerateSecret({ id: OAUTH_APP_ID }),
    ).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });
    expect(mocks.regenerateClientSecret).not.toHaveBeenCalled();
  });
});
