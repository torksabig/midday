import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mocks } from "../setup";
import { createCallerFactory } from "../../trpc/init";
import { invoiceRouter } from "../../trpc/routers/invoice";
import { createTestContext } from "../helpers/test-context";

const envSnapshot = { ...process.env };
const INVOICE_ID = "c1d2e3f4-a5b6-7890-abcd-ef1234567890";

describe("tRPC: AP-33 invoice schedule/duplicate replacement fail-closed", () => {
  beforeEach(() => {
    mocks.duplicateInvoice?.mockReset?.();
    mocks.updateInvoice?.mockReset?.();
    mocks.getInvoiceById?.mockReset?.();
    mocks.getNextInvoiceNumber?.mockReset?.();
    mocks.getNextInvoiceNumber?.mockImplementation?.(() => "INV-0099");
    mocks.triggerJob?.mockReset?.();
    mocks.triggerJob?.mockImplementation?.(() => ({ id: "invoices:job-1" }));
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

  test("duplicate throws without Drizzle when API is down", async () => {
    const caller = createCallerFactory(invoiceRouter)(
      createTestContext({ accessToken: "fake-session-jwt" }),
    );
    await expect(caller.duplicate({ id: INVOICE_ID })).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });
    expect(mocks.duplicateInvoice).not.toHaveBeenCalled();
  });

  test("updateSchedule throws without Drizzle when API is down", async () => {
    const caller = createCallerFactory(invoiceRouter)(
      createTestContext({ accessToken: "fake-session-jwt" }),
    );
    const future = new Date(Date.now() + 86_400_000).toISOString();
    await expect(
      caller.updateSchedule({ id: INVOICE_ID, scheduledAt: future }),
    ).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });
    expect(mocks.getInvoiceById).not.toHaveBeenCalled();
    expect(mocks.updateInvoice).not.toHaveBeenCalled();
  });

  test("cancelSchedule throws without Drizzle when API is down", async () => {
    const caller = createCallerFactory(invoiceRouter)(
      createTestContext({ accessToken: "fake-session-jwt" }),
    );
    await expect(
      caller.cancelSchedule({ id: INVOICE_ID }),
    ).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });
    expect(mocks.getInvoiceById).not.toHaveBeenCalled();
    expect(mocks.updateInvoice).not.toHaveBeenCalled();
  });
});
