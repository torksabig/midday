import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mocks } from "../setup";
import { createCallerFactory } from "../../trpc/init";
import { trackerEntriesRouter } from "../../trpc/routers/tracker-entries";
import { invoiceRouter } from "../../trpc/routers/invoice";
import { createTestContext } from "../helpers/test-context";

const envSnapshot = { ...process.env };
const ENTRY_ID = "b3b6e2c2-1f2a-4e3b-9c1d-2a4b6e2c21f2";
const PROJECT_ID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
const INVOICE_ID = "c1d2e3f4-a5b6-7890-abcd-ef1234567890";

describe("tRPC: AP-32 tracker upsert/delete + invoice.delete fail-closed", () => {
  beforeEach(() => {
    mocks.upsertTrackerEntries?.mockReset?.();
    mocks.deleteTrackerEntry?.mockReset?.();
    mocks.deleteInvoice?.mockReset?.();
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

  test("trackerEntries.upsert throws without Drizzle when API is down", async () => {
    const caller = createCallerFactory(trackerEntriesRouter)(
      createTestContext({ accessToken: "fake-session-jwt" }),
    );
    await expect(
      caller.upsert({
        start: "2024-04-15T09:00:00.000Z",
        stop: "2024-04-15T17:00:00.000Z",
        dates: ["2024-04-15"],
        projectId: PROJECT_ID,
        duration: 28800,
      }),
    ).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });
    expect(mocks.upsertTrackerEntries).not.toHaveBeenCalled();
  });

  test("trackerEntries.delete throws without Drizzle when API is down", async () => {
    const caller = createCallerFactory(trackerEntriesRouter)(
      createTestContext({ accessToken: "fake-session-jwt" }),
    );
    await expect(caller.delete({ id: ENTRY_ID })).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });
    expect(mocks.deleteTrackerEntry).not.toHaveBeenCalled();
  });

  test("invoice.delete throws without Drizzle when API is down", async () => {
    const caller = createCallerFactory(invoiceRouter)(
      createTestContext({ accessToken: "fake-session-jwt" }),
    );
    await expect(caller.delete({ id: INVOICE_ID })).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });
    expect(mocks.deleteInvoice).not.toHaveBeenCalled();
  });
});
