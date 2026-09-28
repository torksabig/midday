import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mocks } from "../setup";
import { createCallerFactory } from "../../trpc/init";
import { customersRouter } from "../../trpc/routers/customers";
import { documentsRouter } from "../../trpc/routers/documents";
import { invoiceRouter } from "../../trpc/routers/invoice";
import { createTestContext } from "../helpers/test-context";

const envSnapshot = { ...process.env };
const ID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";

describe("tRPC: AP-59 enrich/remind/reprocess hybrid fail-closed", () => {
  beforeEach(() => {
    mocks.getCustomerById?.mockReset?.();
    mocks.updateCustomerEnrichmentStatus?.mockReset?.();
    mocks.updateInvoice?.mockReset?.();
    mocks.getDocumentById?.mockReset?.();
    mocks.updateDocumentProcessingStatus?.mockReset?.();
    mocks.triggerJob?.mockReset?.();
    mocks.triggerJob?.mockImplementation?.(() => ({ id: "job-1" }));
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

  test("customers.enrich throws without Drizzle when API is down", async () => {
    const caller = createCallerFactory(customersRouter)(
      createTestContext({ accessToken: "fake-session-jwt" }),
    );
    await expect(caller.enrich({ id: ID })).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });
    expect(mocks.getCustomerById).not.toHaveBeenCalled();
    expect(mocks.triggerJob).not.toHaveBeenCalled();
  });

  test("invoice.remind throws without Drizzle when API is down", async () => {
    const caller = createCallerFactory(invoiceRouter)(
      createTestContext({ accessToken: "fake-session-jwt" }),
    );
    await expect(
      caller.remind({ id: ID, date: "2026-09-28T00:00:00.000Z" }),
    ).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });
    expect(mocks.updateInvoice).not.toHaveBeenCalled();
  });

  test("documents.reprocessDocument throws without Drizzle when API is down", async () => {
    const caller = createCallerFactory(documentsRouter)(
      createTestContext({ accessToken: "fake-session-jwt" }),
    );
    await expect(caller.reprocessDocument({ id: ID })).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });
    expect(mocks.getDocumentById).not.toHaveBeenCalled();
    expect(mocks.triggerJob).not.toHaveBeenCalled();
  });
});
