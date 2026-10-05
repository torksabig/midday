import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mocks } from "../setup";
import { createCallerFactory } from "../../trpc/init";
import { teamRouter } from "../../trpc/routers/team";
import { createTestContext } from "../helpers/test-context";

const envSnapshot = { ...process.env };
const ID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";

describe("tRPC: AP-63 team.enqueueInviteTeamEmails (email-only hybrid)", () => {
  beforeEach(() => {
    mocks.triggerDevTask?.mockReset?.();
    mocks.triggerDevTask?.mockImplementation?.(() =>
      Promise.resolve({ id: "evt_trigger_test" }),
    );
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

  test("enqueueInviteTeamEmails triggers invite-team-members without Drizzle", async () => {
    const caller = createCallerFactory(teamRouter)(
      createTestContext({ accessToken: "fake-session-jwt" }),
    );
    await caller.enqueueInviteTeamEmails({
      invites: [
        {
          email: "new@example.com",
          invitedByName: "Ada",
          invitedByEmail: "ada@example.com",
          teamName: "Acme",
        },
      ],
    });
    expect(mocks.triggerDevTask).toHaveBeenCalledWith("invite-team-members", {
      teamId: "test-team-id",
      invites: [
        {
          email: "new@example.com",
          invitedByName: "Ada",
          invitedByEmail: "ada@example.com",
          teamName: "Acme",
        },
      ],
      ip: "127.0.0.1",
      locale: "en",
    });
  });
});

describe("tRPC: AP-63 team.enqueueDeleteTeamJob (job-only hybrid)", () => {
  beforeEach(() => {
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

  test("enqueueDeleteTeamJob triggers delete-team without Drizzle", async () => {
    const caller = createCallerFactory(teamRouter)(
      createTestContext({ accessToken: "fake-session-jwt" }),
    );
    await caller.enqueueDeleteTeamJob({
      teamId: ID,
      connections: [
        {
          referenceId: "ref-1",
          provider: "plaid",
          accessToken: "tok",
        },
      ],
    });
    expect(mocks.triggerJob).toHaveBeenCalledWith(
      "delete-team",
      {
        teamId: ID,
        connections: [
          {
            referenceId: "ref-1",
            provider: "plaid",
            accessToken: "tok",
          },
        ],
      },
      "teams",
    );
  });
});
