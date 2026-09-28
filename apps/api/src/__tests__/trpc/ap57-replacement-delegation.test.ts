import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mocks } from "../setup";
import { createCallerFactory } from "../../trpc/init";
import { appsRouter } from "../../trpc/routers/apps";
import { inboxRouter } from "../../trpc/routers/inbox";
import { createTestContext } from "../helpers/test-context";

const envSnapshot = { ...process.env };

describe("tRPC: AP-57 inbox.create + apps WhatsApp/platform-link fail-closed", () => {
  beforeEach(() => {
    mocks.createInbox?.mockReset?.();
    mocks.removeWhatsAppConnection?.mockReset?.();
    mocks.createPlatformLinkToken?.mockReset?.();
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

  test("inbox.create throws without Drizzle when API is down", async () => {
    const caller = createCallerFactory(inboxRouter)(
      createTestContext({ accessToken: "fake-session-jwt" }),
    );
    await expect(
      caller.create({
        filename: "receipt.pdf",
        mimetype: "application/pdf",
        size: 1024,
        filePath: ["test-team-id", "receipt.pdf"],
      }),
    ).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });
    expect(mocks.createInbox).not.toHaveBeenCalled();
  });

  test("apps.removeWhatsAppConnection throws without Drizzle when API is down", async () => {
    const caller = createCallerFactory(appsRouter)(
      createTestContext({ accessToken: "fake-session-jwt" }),
    );
    await expect(
      caller.removeWhatsAppConnection({ phoneNumber: "+15551234567" }),
    ).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });
    expect(mocks.removeWhatsAppConnection).not.toHaveBeenCalled();
  });

  test("apps.createPlatformLinkToken throws without Drizzle when API is down", async () => {
    const caller = createCallerFactory(appsRouter)(
      createTestContext({ accessToken: "fake-session-jwt" }),
    );
    await expect(
      caller.createPlatformLinkToken({ provider: "slack" }),
    ).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });
    expect(mocks.createPlatformLinkToken).not.toHaveBeenCalled();
  });
});
