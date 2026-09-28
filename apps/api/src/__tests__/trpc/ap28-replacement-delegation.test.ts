import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mocks } from "../setup";
import { createCallerFactory } from "../../trpc/init";
import { customersRouter } from "../../trpc/routers/customers";
import { notificationSettingsRouter } from "../../trpc/routers/notification-settings";
import { createTestContext } from "../helpers/test-context";

const envSnapshot = { ...process.env };

describe("tRPC: AP-28 replacement fail-closed", () => {
  beforeEach(() => {
    mocks.upsertCustomer.mockReset();
    mocks.upsertNotificationSetting.mockReset();
    mocks.bulkUpdateNotificationSettings.mockReset();
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

  test("customers.upsert throws without Drizzle when API is down", async () => {
    const caller = createCallerFactory(customersRouter)(
      createTestContext({ accessToken: "fake-session-jwt" }),
    );
    await expect(
      caller.upsert({ name: "Acme", email: "a@example.com" }),
    ).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });
    expect(mocks.upsertCustomer).not.toHaveBeenCalled();
  });

  test("notificationSettings.update throws without Drizzle when API is down", async () => {
    const caller = createCallerFactory(notificationSettingsRouter)(
      createTestContext({ accessToken: "fake-session-jwt" }),
    );
    await expect(
      caller.update({
        notificationType: "transactions",
        channel: "in_app",
        enabled: false,
      }),
    ).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });
    expect(mocks.upsertNotificationSetting).not.toHaveBeenCalled();
  });

  test("notificationSettings.bulkUpdate throws without Drizzle when API is down", async () => {
    const caller = createCallerFactory(notificationSettingsRouter)(
      createTestContext({ accessToken: "fake-session-jwt" }),
    );
    await expect(
      caller.bulkUpdate({
        updates: [
          {
            notificationType: "transactions",
            channel: "email",
            enabled: true,
          },
        ],
      }),
    ).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });
    expect(mocks.bulkUpdateNotificationSettings).not.toHaveBeenCalled();
  });
});
