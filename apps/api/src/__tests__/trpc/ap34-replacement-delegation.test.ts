import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mocks } from "../setup";
import { createCallerFactory } from "../../trpc/init";
import { invoiceProductsRouter } from "../../trpc/routers/invoice-products";
import { createTestContext } from "../helpers/test-context";

const envSnapshot = { ...process.env };
const PRODUCT_ID = "d1e2f3a4-b5c6-7890-abcd-ef1234567890";

describe("tRPC: AP-34 invoiceProducts replacement fail-closed", () => {
  beforeEach(() => {
    mocks.getInvoiceProducts?.mockReset?.();
    mocks.getInvoiceProductById?.mockReset?.();
    mocks.deleteInvoiceProduct?.mockReset?.();
    mocks.incrementProductUsage?.mockReset?.();
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

  test("get throws without Drizzle when API is down", async () => {
    const caller = createCallerFactory(invoiceProductsRouter)(
      createTestContext({ accessToken: "fake-session-jwt" }),
    );
    await expect(caller.get({})).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });
    expect(mocks.getInvoiceProducts).not.toHaveBeenCalled();
  });

  test("getById throws without Drizzle when API is down", async () => {
    const caller = createCallerFactory(invoiceProductsRouter)(
      createTestContext({ accessToken: "fake-session-jwt" }),
    );
    await expect(caller.getById({ id: PRODUCT_ID })).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });
    expect(mocks.getInvoiceProductById).not.toHaveBeenCalled();
  });

  test("delete throws without Drizzle when API is down", async () => {
    const caller = createCallerFactory(invoiceProductsRouter)(
      createTestContext({ accessToken: "fake-session-jwt" }),
    );
    await expect(caller.delete({ id: PRODUCT_ID })).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });
    expect(mocks.deleteInvoiceProduct).not.toHaveBeenCalled();
  });

  test("incrementUsage throws without Drizzle when API is down", async () => {
    const caller = createCallerFactory(invoiceProductsRouter)(
      createTestContext({ accessToken: "fake-session-jwt" }),
    );
    await expect(
      caller.incrementUsage({ id: PRODUCT_ID }),
    ).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });
    expect(mocks.incrementProductUsage).not.toHaveBeenCalled();
  });
});
