import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mocks } from "../setup";
import { createCallerFactory } from "../../trpc/init";
import { invoiceRecurringRouter } from "../../trpc/routers/invoice-recurring";
import { createTestContext } from "../helpers/test-context";

const envSnapshot = { ...process.env };
const ID = "d1e2f3a4-b5c6-7890-abcd-ef1234567890";

describe("tRPC: AP-51 invoiceRecurring pause/resume/delete/upcoming fail-closed", () => {
  beforeEach(() => {
    mocks.pauseInvoiceRecurring?.mockReset?.();
    mocks.resumeInvoiceRecurring?.mockReset?.();
    mocks.deleteInvoiceRecurring?.mockReset?.();
    mocks.getUpcomingInvoices?.mockReset?.();
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

  test("pause throws without Drizzle when API is down", async () => {
    const caller = createCallerFactory(invoiceRecurringRouter)(
      createTestContext({ accessToken: "fake-session-jwt" }),
    );
    await expect(caller.pause({ id: ID })).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });
    expect(mocks.pauseInvoiceRecurring).not.toHaveBeenCalled();
  });

  test("resume throws without Drizzle when API is down", async () => {
    const caller = createCallerFactory(invoiceRecurringRouter)(
      createTestContext({ accessToken: "fake-session-jwt" }),
    );
    await expect(caller.resume({ id: ID })).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });
    expect(mocks.resumeInvoiceRecurring).not.toHaveBeenCalled();
  });

  test("delete throws without Drizzle when API is down", async () => {
    const caller = createCallerFactory(invoiceRecurringRouter)(
      createTestContext({ accessToken: "fake-session-jwt" }),
    );
    await expect(caller.delete({ id: ID })).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });
    expect(mocks.deleteInvoiceRecurring).not.toHaveBeenCalled();
  });

  test("getUpcoming throws without Drizzle when API is down", async () => {
    const caller = createCallerFactory(invoiceRecurringRouter)(
      createTestContext({ accessToken: "fake-session-jwt" }),
    );
    await expect(caller.getUpcoming({ id: ID })).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });
    expect(mocks.getUpcomingInvoices).not.toHaveBeenCalled();
  });
});
