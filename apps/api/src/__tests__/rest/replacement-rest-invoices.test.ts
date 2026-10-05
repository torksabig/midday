import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import {
  createRestInvoiceDraft,
  deleteInvoiceForRest,
  fetchInvoiceByIdForRest,
  fetchInvoicePaymentStatusForRest,
  fetchInvoiceSummaryForRest,
  fetchInvoicesListForRest,
  updateInvoiceForRest,
} from "../../rest/services/replacement-rest-invoices";

const envSnapshot = { ...process.env };

describe("REST invoices replacement delegation", () => {
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

  test("list fails closed without Drizzle when Rust is down", async () => {
    const legacy = mock(() => Promise.resolve({ data: [], meta: {} }));
    await expect(
      fetchInvoicesListForRest(
        { pageSize: 20 },
        "Bearer fake-session-jwt",
        legacy,
      ),
    ).rejects.toMatchObject({ status: 500 });
    expect(legacy).not.toHaveBeenCalled();
  });

  test("getById fails closed without Drizzle when Rust is down", async () => {
    const legacy = mock(() => Promise.resolve({ id: "inv-1" }));
    await expect(
      fetchInvoiceByIdForRest(
        "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "Bearer fake-session-jwt",
        legacy,
      ),
    ).rejects.toMatchObject({ status: 500 });
    expect(legacy).not.toHaveBeenCalled();
  });

  test("paymentStatus fails closed without Drizzle when Rust is down", async () => {
    const legacy = mock(() => Promise.resolve({ paid: 0, unpaid: 0 }));
    await expect(
      fetchInvoicePaymentStatusForRest("Bearer fake-session-jwt", legacy),
    ).rejects.toMatchObject({ status: 500 });
    expect(legacy).not.toHaveBeenCalled();
  });

  test("summary fails closed without Drizzle when Rust is down", async () => {
    const legacy = mock(() => Promise.resolve({ total: 0 }));
    await expect(
      fetchInvoiceSummaryForRest(
        { statuses: ["unpaid"] },
        "Bearer fake-session-jwt",
        legacy,
      ),
    ).rejects.toMatchObject({ status: 500 });
    expect(legacy).not.toHaveBeenCalled();
  });

  test("update fails closed without Drizzle when Rust is down", async () => {
    const legacy = mock(() => Promise.resolve({ id: "inv-1" }));
    await expect(
      updateInvoiceForRest(
        { id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890", status: "unpaid" },
        "Bearer fake-session-jwt",
        legacy,
      ),
    ).rejects.toMatchObject({ status: 500 });
    expect(legacy).not.toHaveBeenCalled();
  });

  test("delete fails closed without Drizzle when Rust is down", async () => {
    const legacy = mock(() => Promise.resolve({ id: "inv-1" }));
    await expect(
      deleteInvoiceForRest(
        "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "Bearer fake-session-jwt",
        legacy,
      ),
    ).rejects.toMatchObject({ status: 500 });
    expect(legacy).not.toHaveBeenCalled();
  });

  test("create draft fails closed without Drizzle when Rust is down", async () => {
    const legacy = mock(() => Promise.resolve({ id: "inv-1" }));
    await expect(
      createRestInvoiceDraft(
        {
          invoiceId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
          teamId: "team-1",
          userId: "user-1",
          input: {
            customerId: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
          },
        },
        "Bearer fake-session-jwt",
        legacy,
      ),
    ).rejects.toMatchObject({ status: 500 });
    expect(legacy).not.toHaveBeenCalled();
  });

  test("legacy mode uses Drizzle fetcher", async () => {
    process.env.MIDDAY_BACKEND_MODE = "legacy";
    const legacy = mock(() => Promise.resolve({ data: [{ id: "inv-1" }] }));
    const result = await fetchInvoicesListForRest(
      { pageSize: 10 },
      undefined,
      legacy,
    );
    expect(result).toEqual({ data: [{ id: "inv-1" }] });
    expect(legacy).toHaveBeenCalledTimes(1);
  });
});
