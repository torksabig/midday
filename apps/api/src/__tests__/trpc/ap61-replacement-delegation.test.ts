import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mocks } from "../setup";
import { createCallerFactory } from "../../trpc/init";
import { oauthApplicationsRouter } from "../../trpc/routers/oauth-applications";
import { teamRouter } from "../../trpc/routers/team";
import { createTestContext } from "../helpers/test-context";

const envSnapshot = { ...process.env };
const ID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";

describe("tRPC: AP-61 team.delete / oauth approval-status hybrid fail-closed", () => {
  beforeEach(() => {
    mocks.hasTeamAccess?.mockReset?.();
    mocks.getTeamById?.mockReset?.();
    mocks.getBankConnections?.mockReset?.();
    mocks.deleteTeam?.mockReset?.();
    mocks.getOAuthApplicationById?.mockReset?.();
    mocks.updateOAuthApplicationstatus?.mockReset?.();
    mocks.triggerJob?.mockReset?.();
    mocks.triggerJob?.mockImplementation?.(() => ({ id: "job-1" }));
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

  test("team.delete throws without Drizzle when API is down", async () => {
    const caller = createCallerFactory(teamRouter)(
      createTestContext({ accessToken: "fake-session-jwt" }),
    );
    await expect(caller.delete({ teamId: ID })).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });
    expect(mocks.hasTeamAccess).not.toHaveBeenCalled();
    expect(mocks.deleteTeam).not.toHaveBeenCalled();
    expect(mocks.triggerJob).not.toHaveBeenCalled();
  });

  test("oauthApplications.updateApprovalStatus throws without Drizzle when API is down", async () => {
    const caller = createCallerFactory(oauthApplicationsRouter)(
      createTestContext({ accessToken: "fake-session-jwt" }),
    );
    await expect(
      caller.updateApprovalStatus({ id: ID, status: "pending" }),
    ).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });
    expect(mocks.getOAuthApplicationById).not.toHaveBeenCalled();
    expect(mocks.updateOAuthApplicationstatus).not.toHaveBeenCalled();
  });
});
