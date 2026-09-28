import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mocks } from "../setup";
import { createCallerFactory } from "../../trpc/init";
import { transactionAttachmentsRouter } from "../../trpc/routers/transaction-attachments";
import { bankConnectionsRouter } from "../../trpc/routers/bank-connections";
import { createTestContext } from "../helpers/test-context";

const envSnapshot = { ...process.env };
const ID = "d1e2f3a4-b5c6-7890-abcd-ef1234567890";

describe("tRPC: AP-46 attachments + bankConnections.reconnect fail-closed", () => {
  beforeEach(() => {
    mocks.createAttachments?.mockReset?.();
    mocks.deleteAttachment?.mockReset?.();
    mocks.reconnectBankConnection?.mockReset?.();
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

  test("createMany throws without Drizzle when API is down", async () => {
    const caller = createCallerFactory(transactionAttachmentsRouter)(
      createTestContext({ accessToken: "fake-session-jwt" }),
    );
    await expect(
      caller.createMany([
        {
          type: "application/pdf",
          name: "a.pdf",
          size: 10,
          path: ["team", "a.pdf"],
          transactionId: ID,
        },
      ]),
    ).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });
    expect(mocks.createAttachments).not.toHaveBeenCalled();
  });

  test("delete throws without Drizzle when API is down", async () => {
    const caller = createCallerFactory(transactionAttachmentsRouter)(
      createTestContext({ accessToken: "fake-session-jwt" }),
    );
    await expect(caller.delete({ id: ID })).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });
    expect(mocks.deleteAttachment).not.toHaveBeenCalled();
  });

  test("reconnect throws without Drizzle when API is down", async () => {
    const caller = createCallerFactory(bankConnectionsRouter)(
      createTestContext({ accessToken: "fake-session-jwt" }),
    );
    await expect(
      caller.reconnect({
        referenceId: "old-ref",
        newReferenceId: "new-ref",
        expiresAt: "2030-01-01T00:00:00.000Z",
      }),
    ).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });
  });
});
