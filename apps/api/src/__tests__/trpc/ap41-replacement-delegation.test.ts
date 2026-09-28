import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mocks } from "../setup";
import { createCallerFactory } from "../../trpc/init";
import { teamRouter } from "../../trpc/routers/team";
import { createTestContext } from "../helpers/test-context";

const envSnapshot = { ...process.env };
const ID = "d1e2f3a4-b5c6-7890-abcd-ef1234567890";

describe("tRPC: AP-41 team invite mutations + invitesByEmail fail-closed", () => {
  beforeEach(() => {
    mocks.acceptTeamInvite?.mockReset?.();
    mocks.declineTeamInvite?.mockReset?.();
    mocks.deleteTeamInvite?.mockReset?.();
    mocks.getInvitesByEmail?.mockReset?.();
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

  test("acceptInvite throws without Drizzle when API is down", async () => {
    const caller = createCallerFactory(teamRouter)(
      createTestContext({ accessToken: "fake-session-jwt" }),
    );
    await expect(caller.acceptInvite({ id: ID })).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });
    expect(mocks.acceptTeamInvite).not.toHaveBeenCalled();
  });

  test("declineInvite throws without Drizzle when API is down", async () => {
    const caller = createCallerFactory(teamRouter)(
      createTestContext({ accessToken: "fake-session-jwt" }),
    );
    await expect(caller.declineInvite({ id: ID })).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });
    expect(mocks.declineTeamInvite).not.toHaveBeenCalled();
  });

  test("deleteInvite throws without Drizzle when API is down", async () => {
    const caller = createCallerFactory(teamRouter)(
      createTestContext({ accessToken: "fake-session-jwt" }),
    );
    await expect(caller.deleteInvite({ id: ID })).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });
    expect(mocks.deleteTeamInvite).not.toHaveBeenCalled();
  });

  test("invitesByEmail throws without Drizzle when API is down", async () => {
    const caller = createCallerFactory(teamRouter)(
      createTestContext({ accessToken: "fake-session-jwt" }),
    );
    await expect(caller.invitesByEmail()).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });
    expect(mocks.getInvitesByEmail).not.toHaveBeenCalled();
  });
});
