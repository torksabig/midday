import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mocks } from "../setup";
import { createCallerFactory } from "../../trpc/init";
import { invoiceRouter } from "../../trpc/routers/invoice";
import { createTestContext } from "../helpers/test-context";

const envSnapshot = { ...process.env };
const INVOICE_ID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";

describe("tRPC: AP-29 invoice.draft replacement fail-closed", () => {
  beforeEach(() => {
    mocks.draftInvoice.mockReset();
    mocks.getNextInvoiceNumber?.mockReset?.();
    mocks.getNextInvoiceNumber?.mockImplementation?.(() => "INV-001");
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

  test("invoice.draft throws without Drizzle draft when API is down", async () => {
    const caller = createCallerFactory(invoiceRouter)(
      createTestContext({ accessToken: "fake-session-jwt" }),
    );
    await expect(
      caller.draft({
        id: INVOICE_ID,
        dueDate: "2026-10-01T00:00:00.000Z",
        issueDate: "2026-09-28T00:00:00.000Z",
        invoiceNumber: "INV-100",
        template: { currency: "USD" },
      } as never),
    ).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });
    expect(mocks.draftInvoice).not.toHaveBeenCalled();
  });
});
