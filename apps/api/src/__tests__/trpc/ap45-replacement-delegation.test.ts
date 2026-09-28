import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mocks } from "../setup";
import { createCallerFactory } from "../../trpc/init";
import { institutionsRouter } from "../../trpc/routers/institutions";
import { oauthApplicationsRouter } from "../../trpc/routers/oauth-applications";
import { createTestContext } from "../helpers/test-context";

const envSnapshot = { ...process.env };
const ID = "d1e2f3a4-b5c6-7890-abcd-ef1234567890";

describe("tRPC: AP-45 institutions + oauth authorized/revoke fail-closed", () => {
  beforeEach(() => {
    mocks.getInstitutions?.mockReset?.();
    mocks.getInstitutionById?.mockReset?.();
    mocks.updateInstitutionUsage?.mockReset?.();
    mocks.getUserAuthorizedApplications?.mockReset?.();
    mocks.revokeUserApplicationTokens?.mockReset?.();
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

  test("institutions.get throws without Drizzle when API is down", async () => {
    const caller = createCallerFactory(institutionsRouter)(
      createTestContext({ accessToken: "fake-session-jwt" }),
    );
    await expect(caller.get({ countryCode: "US" })).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });
    expect(mocks.getInstitutions).not.toHaveBeenCalled();
  });

  test("institutions.getById throws without Drizzle when API is down", async () => {
    const caller = createCallerFactory(institutionsRouter)(
      createTestContext({ accessToken: "fake-session-jwt" }),
    );
    await expect(caller.getById({ id: "ins_1" })).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });
    expect(mocks.getInstitutionById).not.toHaveBeenCalled();
  });

  test("institutions.updateUsage throws without Drizzle when API is down", async () => {
    const caller = createCallerFactory(institutionsRouter)(
      createTestContext({ accessToken: "fake-session-jwt" }),
    );
    await expect(caller.updateUsage({ id: "ins_1" })).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });
    expect(mocks.updateInstitutionUsage).not.toHaveBeenCalled();
  });

  test("oauthApplications.authorized throws without Drizzle when API is down", async () => {
    const caller = createCallerFactory(oauthApplicationsRouter)(
      createTestContext({ accessToken: "fake-session-jwt" }),
    );
    await expect(caller.authorized()).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });
    expect(mocks.getUserAuthorizedApplications).not.toHaveBeenCalled();
  });

  test("oauthApplications.revokeAccess throws without Drizzle when API is down", async () => {
    const caller = createCallerFactory(oauthApplicationsRouter)(
      createTestContext({ accessToken: "fake-session-jwt" }),
    );
    await expect(
      caller.revokeAccess({ applicationId: ID }),
    ).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });
    expect(mocks.revokeUserApplicationTokens).not.toHaveBeenCalled();
  });
});
