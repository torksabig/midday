import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mocks } from "../setup";
import { createCallerFactory } from "../../trpc/init";
import { oauthApplicationsRouter } from "../../trpc/routers/oauth-applications";
import { teamRouter } from "../../trpc/routers/team";
import { createTestContext } from "../helpers/test-context";

const envSnapshot = { ...process.env };
const ID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";

describe("tRPC: AP-62 team.create / oauth authorize hybrid fail-closed", () => {
  beforeEach(() => {
    mocks.createTeam?.mockReset?.();
    mocks.getOAuthApplicationByClientId?.mockReset?.();
    mocks.getTeamsByUserId?.mockReset?.();
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

  test("team.create throws without Drizzle when API is down", async () => {
    const caller = createCallerFactory(teamRouter)(
      createTestContext({ accessToken: "fake-session-jwt" }),
    );
    await expect(
      caller.create({
        name: "Acme",
        baseCurrency: "USD",
        companyType: "solo_founder",
        heardAbout: "twitter",
        switchTeam: false,
      }),
    ).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });
    expect(mocks.createTeam).not.toHaveBeenCalled();
  });

  test("oauthApplications.authorize throws without Drizzle when API is down", async () => {
    const caller = createCallerFactory(oauthApplicationsRouter)(
      createTestContext({ accessToken: "fake-session-jwt" }),
    );
    await expect(
      caller.authorize({
        clientId: "mid_client_test",
        decision: "allow",
        scopes: ["transactions.read"],
        redirectUri: "https://example.com/callback",
        teamId: ID,
      }),
    ).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });
    expect(mocks.getOAuthApplicationByClientId).not.toHaveBeenCalled();
    expect(mocks.getTeamsByUserId).not.toHaveBeenCalled();
  });
});
