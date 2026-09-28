import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mocks } from "../setup";
import { createCallerFactory } from "../../trpc/init";
import { teamRouter } from "../../trpc/routers/team";
import { shortLinksRouter } from "../../trpc/routers/short-links";
import { createTestContext } from "../helpers/test-context";

const envSnapshot = { ...process.env };
const TEAM_ID = "test-team-id";
const ID = "d1e2f3a4-b5c6-7890-abcd-ef1234567890";

describe("tRPC: AP-42 team members + shortLinks fail-closed", () => {
  beforeEach(() => {
    mocks.deleteTeamMember?.mockReset?.();
    mocks.updateTeamMember?.mockReset?.();
    mocks.createShortLink?.mockReset?.();
    mocks.getShortLinkByShortId?.mockReset?.();
    process.env = {
      ...envSnapshot,
      SUPABASE_URL: envSnapshot.SUPABASE_URL ?? "https://test.supabase.co",
      MIDDAY_BACKEND_MODE: "replacement",
      REPLACEMENT_API_URL: "http://127.0.0.1:1",
      MIDDAY_DASHBOARD_URL: "https://app.midday.ai",
    };
    delete process.env.REPLACEMENT_DELEGATION_USE_DEMO;
  });

  afterEach(() => {
    process.env = { ...envSnapshot };
  });

  test("deleteMember throws without Drizzle when API is down", async () => {
    const caller = createCallerFactory(teamRouter)(
      createTestContext({ accessToken: "fake-session-jwt", teamId: TEAM_ID }),
    );
    await expect(
      caller.deleteMember({ teamId: TEAM_ID, userId: ID }),
    ).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });
    expect(mocks.deleteTeamMember).not.toHaveBeenCalled();
  });

  test("updateMember throws without Drizzle when API is down", async () => {
    const caller = createCallerFactory(teamRouter)(
      createTestContext({ accessToken: "fake-session-jwt", teamId: TEAM_ID }),
    );
    await expect(
      caller.updateMember({ teamId: TEAM_ID, userId: ID, role: "member" }),
    ).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });
    expect(mocks.updateTeamMember).not.toHaveBeenCalled();
  });

  test("shortLinks.createForUrl throws without Drizzle when API is down", async () => {
    const caller = createCallerFactory(shortLinksRouter)(
      createTestContext({ accessToken: "fake-session-jwt" }),
    );
    await expect(
      caller.createForUrl({ url: "https://example.com" }),
    ).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });
    expect(mocks.createShortLink).not.toHaveBeenCalled();
  });

  test("shortLinks.get throws without Drizzle when API is down", async () => {
    const caller = createCallerFactory(shortLinksRouter)(
      createTestContext({ accessToken: "fake-session-jwt" }),
    );
    await expect(caller.get({ shortId: "abc123" })).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });
    expect(mocks.getShortLinkByShortId).not.toHaveBeenCalled();
  });
});
