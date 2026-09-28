import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mocks } from "../setup";
import { createCallerFactory } from "../../trpc/init";
import { invoiceRecurringRouter } from "../../trpc/routers/invoice-recurring";
import { createTestContext } from "../helpers/test-context";

const envSnapshot = { ...process.env };
const ID = "d1e2f3a4-b5c6-7890-abcd-ef1234567890";
const CUSTOMER_ID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";

describe("tRPC: AP-56 invoiceRecurring create/update fail-closed", () => {
  beforeEach(() => {
    mocks.createInvoiceRecurring?.mockReset?.();
    mocks.updateInvoiceRecurring?.mockReset?.();
    mocks.getCustomerById?.mockReset?.();
    mocks.getCustomerById?.mockImplementation?.(() =>
      Promise.resolve({
        id: CUSTOMER_ID,
        email: "customer@example.com",
        billingEmail: null,
        name: "Acme",
      }),
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

  test("create throws without Drizzle when API is down", async () => {
    const caller = createCallerFactory(invoiceRecurringRouter)(
      createTestContext({ accessToken: "fake-session-jwt" }),
    );
    await expect(
      caller.create({
        customerId: CUSTOMER_ID,
        frequency: "monthly_date",
        frequencyDay: 15,
        endType: "never",
        timezone: "UTC",
      }),
    ).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });
    expect(mocks.createInvoiceRecurring).not.toHaveBeenCalled();
  });

  test("update throws without Drizzle when API is down", async () => {
    const caller = createCallerFactory(invoiceRecurringRouter)(
      createTestContext({ accessToken: "fake-session-jwt" }),
    );
    await expect(
      caller.update({ id: ID, customerName: "Renamed" }),
    ).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });
    expect(mocks.updateInvoiceRecurring).not.toHaveBeenCalled();
  });
});
