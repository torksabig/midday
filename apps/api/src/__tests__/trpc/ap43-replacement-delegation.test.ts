import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mocks } from "../setup";
import { createCallerFactory } from "../../trpc/init";
import { invoiceRecurringRouter } from "../../trpc/routers/invoice-recurring";
import { accountingRouter } from "../../trpc/routers/accounting";
import { teamRouter } from "../../trpc/routers/team";
import { createTestContext } from "../helpers/test-context";

const envSnapshot = { ...process.env };
const ID = "d1e2f3a4-b5c6-7890-abcd-ef1234567890";

describe("tRPC: AP-43 invoiceRecurring + accounting.disconnect + team.leave fail-closed", () => {
  beforeEach(() => {
    mocks.getInvoiceRecurringById?.mockReset?.();
    mocks.getInvoiceRecurringList?.mockReset?.();
    mocks.leaveTeam?.mockReset?.();
    mocks.getTeamMembersByTeamId?.mockReset?.();
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

  test("invoiceRecurring.get throws without Drizzle when API is down", async () => {
    const caller = createCallerFactory(invoiceRecurringRouter)(
      createTestContext({ accessToken: "fake-session-jwt" }),
    );
    await expect(caller.get({ id: ID })).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });
    expect(mocks.getInvoiceRecurringById).not.toHaveBeenCalled();
  });

  test("invoiceRecurring.list throws without Drizzle when API is down", async () => {
    const caller = createCallerFactory(invoiceRecurringRouter)(
      createTestContext({ accessToken: "fake-session-jwt" }),
    );
    await expect(caller.list({})).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });
    expect(mocks.getInvoiceRecurringList).not.toHaveBeenCalled();
  });

  test("accounting.disconnect throws without Drizzle when API is down", async () => {
    const caller = createCallerFactory(accountingRouter)(
      createTestContext({ accessToken: "fake-session-jwt" }),
    );
    await expect(
      caller.disconnect({ providerId: "xero" }),
    ).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });
  });

  test("team.leave throws without Drizzle when API is down", async () => {
    const caller = createCallerFactory(teamRouter)(
      createTestContext({ accessToken: "fake-session-jwt" }),
    );
    await expect(caller.leave({ teamId: ID })).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });
    expect(mocks.leaveTeam).not.toHaveBeenCalled();
    expect(mocks.getTeamMembersByTeamId).not.toHaveBeenCalled();
  });
});
