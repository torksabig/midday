import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mocks } from "../setup";
import { createCallerFactory } from "../../trpc/init";
import { invoiceTemplateRouter } from "../../trpc/routers/invoice-template";
import { createTestContext } from "../helpers/test-context";

const envSnapshot = { ...process.env };
const TEMPLATE_ID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";

describe("tRPC: AP-36 invoiceTemplate writes replacement fail-closed", () => {
  beforeEach(() => {
    mocks.upsertInvoiceTemplate?.mockReset?.();
    mocks.setDefaultTemplate?.mockReset?.();
    mocks.deleteInvoiceTemplate?.mockReset?.();
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

  test("upsert throws without Drizzle when API is down", async () => {
    const caller = createCallerFactory(invoiceTemplateRouter)(
      createTestContext({ accessToken: "fake-session-jwt" }),
    );
    await expect(
      caller.upsert({ name: "Updated" }),
    ).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });
    expect(mocks.upsertInvoiceTemplate).not.toHaveBeenCalled();
  });

  test("setDefault throws without Drizzle when API is down", async () => {
    const caller = createCallerFactory(invoiceTemplateRouter)(
      createTestContext({ accessToken: "fake-session-jwt" }),
    );
    await expect(
      caller.setDefault({ id: TEMPLATE_ID }),
    ).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });
    expect(mocks.setDefaultTemplate).not.toHaveBeenCalled();
  });

  test("delete throws without Drizzle when API is down", async () => {
    const caller = createCallerFactory(invoiceTemplateRouter)(
      createTestContext({ accessToken: "fake-session-jwt" }),
    );
    await expect(
      caller.delete({ id: TEMPLATE_ID }),
    ).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });
    expect(mocks.deleteInvoiceTemplate).not.toHaveBeenCalled();
  });
});
