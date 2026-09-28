import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mocks } from "../setup";
import { createCallerFactory } from "../../trpc/init";
import { invoiceProductsRouter } from "../../trpc/routers/invoice-products";
import { createTestContext } from "../helpers/test-context";

const envSnapshot = { ...process.env };
const PRODUCT_ID = "d1e2f3a4-b5c6-7890-abcd-ef1234567890";

describe("tRPC: AP-37 invoiceProducts writes replacement fail-closed", () => {
  beforeEach(() => {
    mocks.createInvoiceProduct?.mockReset?.();
    mocks.upsertInvoiceProduct?.mockReset?.();
    mocks.updateInvoiceProduct?.mockReset?.();
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
    const caller = createCallerFactory(invoiceProductsRouter)(
      createTestContext({ accessToken: "fake-session-jwt" }),
    );
    await expect(caller.create({ name: "Consulting" })).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });
    expect(mocks.createInvoiceProduct).not.toHaveBeenCalled();
  });

  test("upsert throws without Drizzle when API is down", async () => {
    const caller = createCallerFactory(invoiceProductsRouter)(
      createTestContext({ accessToken: "fake-session-jwt" }),
    );
    await expect(caller.upsert({ name: "Consulting" })).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });
    expect(mocks.upsertInvoiceProduct).not.toHaveBeenCalled();
  });

  test("updateProduct throws without Drizzle when API is down", async () => {
    const caller = createCallerFactory(invoiceProductsRouter)(
      createTestContext({ accessToken: "fake-session-jwt" }),
    );
    await expect(
      caller.updateProduct({ id: PRODUCT_ID, name: "Updated" }),
    ).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });
    expect(mocks.updateInvoiceProduct).not.toHaveBeenCalled();
  });
});
