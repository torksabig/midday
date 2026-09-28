import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { createCallerFactory } from "../../trpc/init";
import { invoiceRouter } from "../../trpc/routers/invoice";
import { notificationSettingsRouter } from "../../trpc/routers/notification-settings";
import { documentsRouter } from "../../trpc/routers/documents";
import { createTestContext } from "../helpers/test-context";

const envSnapshot = { ...process.env };

describe("tRPC: AP-25 replacement fail-closed", () => {
  beforeEach(() => {
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

  test("invoice.searchInvoiceNumber throws when API is down", async () => {
    const caller = createCallerFactory(invoiceRouter)(
      createTestContext({ accessToken: "fake-session-jwt" }),
    );
    await expect(
      caller.searchInvoiceNumber({ query: "INV" }),
    ).rejects.toMatchObject({ code: "INTERNAL_SERVER_ERROR" });
  });

  test("notificationSettings.get throws when API is down", async () => {
    const caller = createCallerFactory(notificationSettingsRouter)(
      createTestContext({ accessToken: "fake-session-jwt" }),
    );
    await expect(caller.get({})).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });
  });

  test("documents.checkAttachments throws when API is down", async () => {
    const caller = createCallerFactory(documentsRouter)(
      createTestContext({ accessToken: "fake-session-jwt" }),
    );
    await expect(
      caller.checkAttachments({
        id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      }),
    ).rejects.toMatchObject({ code: "INTERNAL_SERVER_ERROR" });
  });
});
