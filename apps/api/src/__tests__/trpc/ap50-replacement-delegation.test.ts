import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mocks } from "../setup";
import { createCallerFactory } from "../../trpc/init";
import { customersRouter } from "../../trpc/routers/customers";
import { teamRouter } from "../../trpc/routers/team";
import { createTestContext } from "../helpers/test-context";

const envSnapshot = { ...process.env };
const PORTAL = "portal_test_id_abcdefgh";

describe("tRPC: AP-50 portal reads + availablePlans fail-closed", () => {
  beforeEach(() => {
    mocks.getCustomerByPortalId?.mockReset?.();
    mocks.getCustomerPortalInvoices?.mockReset?.();
    mocks.getAvailablePlans?.mockReset?.();
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

  test("getByPortalId throws without Drizzle when API is down", async () => {
    const caller = createCallerFactory(customersRouter)(
      createTestContext({ accessToken: "fake-session-jwt" }),
    );
    await expect(
      caller.getByPortalId({ portalId: PORTAL }),
    ).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });
    expect(mocks.getCustomerByPortalId).not.toHaveBeenCalled();
  });

  test("getPortalInvoices throws without Drizzle when API is down", async () => {
    const caller = createCallerFactory(customersRouter)(
      createTestContext({ accessToken: "fake-session-jwt" }),
    );
    await expect(
      caller.getPortalInvoices({ portalId: PORTAL }),
    ).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });
    expect(mocks.getCustomerByPortalId).not.toHaveBeenCalled();
  });

  test("availablePlans throws without Drizzle when API is down", async () => {
    const caller = createCallerFactory(teamRouter)(
      createTestContext({ accessToken: "fake-session-jwt" }),
    );
    await expect(caller.availablePlans()).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });
    expect(mocks.getAvailablePlans).not.toHaveBeenCalled();
  });
});
