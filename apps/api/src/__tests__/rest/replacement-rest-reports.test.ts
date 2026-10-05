import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import {
  fetchBurnRateReportsForRest,
  fetchExpensesReportsForRest,
  fetchProfitReportsForRest,
  fetchRevenueReportsForRest,
  fetchRunwayReportsForRest,
  fetchSpendingReportsForRest,
} from "../../rest/services/replacement-rest-reports";

const envSnapshot = { ...process.env };

const dateRange = {
  from: "2024-01-01",
  to: "2024-12-31",
  currency: "USD",
  revenueType: "net" as const,
};

describe("REST reports replacement delegation", () => {
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

  test("revenue fails closed without Drizzle when Rust is down", async () => {
    const legacy = mock(() => Promise.resolve({ meta: {}, result: [] }));
    await expect(
      fetchRevenueReportsForRest(dateRange, "Bearer fake-session-jwt", legacy),
    ).rejects.toMatchObject({ status: 500 });
    expect(legacy).not.toHaveBeenCalled();
  });

  test("profit fails closed without Drizzle when Rust is down", async () => {
    const legacy = mock(() => Promise.resolve({ meta: {}, result: [] }));
    await expect(
      fetchProfitReportsForRest(dateRange, "Bearer fake-session-jwt", legacy),
    ).rejects.toMatchObject({ status: 500 });
    expect(legacy).not.toHaveBeenCalled();
  });

  test("burn-rate fails closed without Drizzle when Rust is down", async () => {
    const legacy = mock(() => Promise.resolve({ meta: {}, result: [] }));
    await expect(
      fetchBurnRateReportsForRest(
        { from: dateRange.from, to: dateRange.to, currency: dateRange.currency },
        "Bearer fake-session-jwt",
        legacy,
      ),
    ).rejects.toMatchObject({ status: 500 });
    expect(legacy).not.toHaveBeenCalled();
  });

  test("runway fails closed without Drizzle when Rust is down", async () => {
    const legacy = mock(() => Promise.resolve({ meta: {}, result: [] }));
    await expect(
      fetchRunwayReportsForRest("USD", "Bearer fake-session-jwt", legacy),
    ).rejects.toMatchObject({ status: 500 });
    expect(legacy).not.toHaveBeenCalled();
  });

  test("expenses fails closed without Drizzle when Rust is down", async () => {
    const legacy = mock(() => Promise.resolve({ meta: {}, result: [] }));
    await expect(
      fetchExpensesReportsForRest(
        { from: dateRange.from, to: dateRange.to, currency: dateRange.currency },
        "Bearer fake-session-jwt",
        legacy,
      ),
    ).rejects.toMatchObject({ status: 500 });
    expect(legacy).not.toHaveBeenCalled();
  });

  test("spending fails closed without Drizzle when Rust is down", async () => {
    const legacy = mock(() => Promise.resolve({ meta: {}, result: [] }));
    await expect(
      fetchSpendingReportsForRest(
        { from: dateRange.from, to: dateRange.to, currency: dateRange.currency },
        "Bearer fake-session-jwt",
        legacy,
      ),
    ).rejects.toMatchObject({ status: 500 });
    expect(legacy).not.toHaveBeenCalled();
  });

  test("legacy mode uses Drizzle fetcher", async () => {
    process.env.MIDDAY_BACKEND_MODE = "legacy";
    const legacy = mock(() => Promise.resolve({ meta: {}, result: [{ x: 1 }] }));
    const result = await fetchRevenueReportsForRest(dateRange, undefined, legacy);
    expect(result).toEqual({ meta: {}, result: [{ x: 1 }] });
    expect(legacy).toHaveBeenCalledTimes(1);
  });
});
