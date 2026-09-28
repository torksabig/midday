import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mocks } from "../setup";
import { createCallerFactory } from "../../trpc/init";
import { invoiceProductsRouter } from "../../trpc/routers/invoice-products";
import { appsRouter } from "../../trpc/routers/apps";
import { createTestContext } from "../helpers/test-context";

const envSnapshot = { ...process.env };

describe("tRPC: AP-39 saveLineItem + apps writes replacement fail-closed", () => {
  beforeEach(() => {
    mocks.saveLineItemAsProduct?.mockReset?.();
    mocks.disconnectApp?.mockReset?.();
    mocks.updateAppSettings?.mockReset?.();
    mocks.updateAppSettingsBulk?.mockReset?.();
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

  test("saveLineItemAsProduct throws without Drizzle when API is down", async () => {
    const caller = createCallerFactory(invoiceProductsRouter)(
      createTestContext({ accessToken: "fake-session-jwt" }),
    );
    await expect(
      caller.saveLineItemAsProduct({ name: "Consulting", price: 100 }),
    ).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });
    expect(mocks.saveLineItemAsProduct).not.toHaveBeenCalled();
  });

  test("apps.disconnect throws without Drizzle when API is down", async () => {
    const caller = createCallerFactory(appsRouter)(
      createTestContext({ accessToken: "fake-session-jwt" }),
    );
    await expect(caller.disconnect({ appId: "slack" })).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });
    expect(mocks.disconnectApp).not.toHaveBeenCalled();
  });

  test("apps.update throws without Drizzle when API is down", async () => {
    const caller = createCallerFactory(appsRouter)(
      createTestContext({ accessToken: "fake-session-jwt" }),
    );
    await expect(
      caller.update({ appId: "slack", option: { id: "receipts", value: true } }),
    ).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });
    expect(mocks.updateAppSettings).not.toHaveBeenCalled();
  });

  test("apps.updateSettings throws without Drizzle when API is down", async () => {
    const caller = createCallerFactory(appsRouter)(
      createTestContext({ accessToken: "fake-session-jwt" }),
    );
    await expect(
      caller.updateSettings({
        appId: "slack",
        settings: [{ id: "receipts", value: true }],
      }),
    ).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });
    expect(mocks.updateAppSettingsBulk).not.toHaveBeenCalled();
  });
});
