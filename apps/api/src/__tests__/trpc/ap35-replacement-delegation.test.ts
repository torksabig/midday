import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mocks } from "../setup";
import { createCallerFactory } from "../../trpc/init";
import { invoiceTemplateRouter } from "../../trpc/routers/invoice-template";
import { createTestContext } from "../helpers/test-context";

const envSnapshot = { ...process.env };
const TEMPLATE_ID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";

describe("tRPC: AP-35 invoiceTemplate replacement fail-closed", () => {
  beforeEach(() => {
    mocks.getInvoiceTemplates?.mockReset?.();
    mocks.getInvoiceTemplateById?.mockReset?.();
    mocks.getInvoiceTemplateCount?.mockReset?.();
    mocks.createInvoiceTemplate?.mockReset?.();
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

  test("list throws without Drizzle when API is down", async () => {
    const caller = createCallerFactory(invoiceTemplateRouter)(
      createTestContext({ accessToken: "fake-session-jwt" }),
    );
    await expect(caller.list()).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });
    expect(mocks.getInvoiceTemplates).not.toHaveBeenCalled();
  });

  test("get throws without Drizzle when API is down", async () => {
    const caller = createCallerFactory(invoiceTemplateRouter)(
      createTestContext({ accessToken: "fake-session-jwt" }),
    );
    await expect(caller.get({ id: TEMPLATE_ID })).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });
    expect(mocks.getInvoiceTemplateById).not.toHaveBeenCalled();
  });

  test("count throws without Drizzle when API is down", async () => {
    const caller = createCallerFactory(invoiceTemplateRouter)(
      createTestContext({ accessToken: "fake-session-jwt" }),
    );
    await expect(caller.count()).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });
    expect(mocks.getInvoiceTemplateCount).not.toHaveBeenCalled();
  });

  test("create throws without Drizzle when API is down", async () => {
    const caller = createCallerFactory(invoiceTemplateRouter)(
      createTestContext({ accessToken: "fake-session-jwt" }),
    );
    await expect(
      caller.create({ name: "Default Template" }),
    ).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });
    expect(mocks.createInvoiceTemplate).not.toHaveBeenCalled();
  });
});
