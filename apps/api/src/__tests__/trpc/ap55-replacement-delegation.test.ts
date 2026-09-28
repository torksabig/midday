import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mocks } from "../setup";
import { createCallerFactory } from "../../trpc/init";
import { invoiceRouter } from "../../trpc/routers/invoice";
import { shortLinksRouter } from "../../trpc/routers/short-links";
import { createTestContext } from "../helpers/test-context";

const envSnapshot = { ...process.env };
const INVOICE_ID = "c1d2e3f4-a5b6-7890-abcd-ef1234567890";
const PROJECT_ID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
const DOC_ID = "b3b7c8e2-1f2a-4c3d-9e4f-5a6b7c8d9e0f";

describe("tRPC: AP-55 hybrid deferred Postgres fail-closed", () => {
  beforeEach(() => {
    mocks.updateInvoice?.mockReset?.();
    mocks.draftInvoice?.mockReset?.();
    mocks.createShortLink?.mockReset?.();
    mocks.getDocumentById?.mockReset?.();
    mocks.signedUrl?.mockReset?.();
    mocks.getInvoiceById?.mockReset?.();
    mocks.getTrackerProjectById?.mockReset?.();
    mocks.getTrackerRecordsByRange?.mockReset?.();
    mocks.getNextInvoiceNumber?.mockReset?.();
    mocks.getInvoiceTemplate?.mockReset?.();
    mocks.getTeamById?.mockReset?.();
    mocks.getUserById?.mockReset?.();
    mocks.triggerJob?.mockReset?.();
    mocks.triggerJob?.mockImplementation?.(() => ({ id: "invoices:job-1" }));
    mocks.getNextInvoiceNumber?.mockImplementation?.(() => "INV-0100");
    mocks.getInvoiceTemplate?.mockImplementation?.(() => null);
    mocks.getTeamById?.mockImplementation?.(() =>
      Promise.resolve({ id: "test-team-id", baseCurrency: "USD" }),
    );
    mocks.getUserById?.mockImplementation?.(() =>
      Promise.resolve({ id: "test-user-id", dateFormat: "yyyy-MM-dd" }),
    );
    mocks.getDocumentById?.mockImplementation?.(() =>
      Promise.resolve({
        id: DOC_ID,
        name: "doc.pdf",
        pathTokens: ["test-team-id", "doc.pdf"],
        metadata: { contentType: "application/pdf", size: 1024 },
      }),
    );
    mocks.signedUrl?.mockImplementation?.(() =>
      Promise.resolve({
        data: { signedUrl: "https://signed.example/file" },
        error: null,
      }),
    );
    mocks.getTrackerProjectById?.mockImplementation?.(() =>
      Promise.resolve({
        id: PROJECT_ID,
        name: "Project A",
        billable: true,
        rate: 100,
        currency: "USD",
        customerId: null,
      }),
    );
    mocks.getTrackerRecordsByRange?.mockImplementation?.(() =>
      Promise.resolve({
        result: {
          "2026-01-01": [{ duration: 3600 }],
        },
      }),
    );
    process.env = {
      ...envSnapshot,
      SUPABASE_URL: envSnapshot.SUPABASE_URL ?? "https://test.supabase.co",
      MIDDAY_BACKEND_MODE: "replacement",
      REPLACEMENT_API_URL: "http://127.0.0.1:1",
      MIDDAY_DASHBOARD_URL: "https://app.midday.ai",
    };
    delete process.env.REPLACEMENT_DELEGATION_USE_DEMO;
  });

  afterEach(() => {
    process.env = { ...envSnapshot };
  });

  test("invoice.create throws without Drizzle when API is down", async () => {
    const caller = createCallerFactory(invoiceRouter)(
      createTestContext({ accessToken: "fake-session-jwt" }),
    );
    await expect(
      caller.create({ id: INVOICE_ID, deliveryType: "create" }),
    ).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });
    expect(mocks.updateInvoice).not.toHaveBeenCalled();
  });

  test("invoice.createFromTracker throws without Drizzle when API is down", async () => {
    const caller = createCallerFactory(invoiceRouter)(
      createTestContext({ accessToken: "fake-session-jwt" }),
    );
    await expect(
      caller.createFromTracker({
        projectId: PROJECT_ID,
        dateFrom: "2026-01-01",
        dateTo: "2026-01-31",
      }),
    ).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });
    expect(mocks.draftInvoice).not.toHaveBeenCalled();
  });

  test("shortLinks.createForDocument throws without Drizzle when API is down", async () => {
    mocks.getDocumentById.mockReset();
    mocks.getDocumentById.mockImplementation(() =>
      Promise.resolve({
        id: DOC_ID,
        name: "doc.pdf",
        pathTokens: ["test-team-id", "doc.pdf"],
        metadata: { contentType: "application/pdf", size: 1024 },
      }),
    );
    mocks.signedUrl.mockReset();
    mocks.signedUrl.mockImplementation(() =>
      Promise.resolve({
        data: { signedUrl: "https://signed.example/file" },
        error: null,
      }),
    );
    mocks.createShortLink.mockReset();

    const caller = createCallerFactory(shortLinksRouter)(
      createTestContext({ accessToken: "fake-session-jwt" }),
    );
    await expect(
      caller.createForDocument({
        documentId: DOC_ID,
        expireIn: 3600,
      }),
    ).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });
    expect(mocks.createShortLink).not.toHaveBeenCalled();
    expect(mocks.getDocumentById).toHaveBeenCalled();
  });
});
