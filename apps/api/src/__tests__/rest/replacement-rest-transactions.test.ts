import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import {
  createTransactionForRest,
  createTransactionsForRest,
  deleteTransactionsForRest,
  fetchTransactionByIdForRest,
  fetchTransactionsListForRest,
  updateTransactionForRest,
  updateTransactionsForRest,
} from "../../rest/services/replacement-rest-transactions";

const envSnapshot = { ...process.env };

describe("REST transactions replacement delegation", () => {
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
      fetchTransactionsListForRest(
        { pageSize: 20 },
        "Bearer fake-session-jwt",
        legacy,
      ),
    ).rejects.toMatchObject({ status: 500 });
    expect(legacy).not.toHaveBeenCalled();
  });

  test("getById fails closed without Drizzle when Rust is down", async () => {
    const legacy = mock(() => Promise.resolve({ id: "tx-1" }));
    await expect(
      fetchTransactionByIdForRest(
        "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "Bearer fake-session-jwt",
        legacy,
      ),
    ).rejects.toMatchObject({ status: 500 });
    expect(legacy).not.toHaveBeenCalled();
  });

  test("create fails closed without Drizzle when Rust is down", async () => {
    const legacy = mock(() => Promise.resolve({ id: "tx-1" }));
    await expect(
      createTransactionForRest(
        {
          name: "Test",
          amount: 100,
          currency: "USD",
          date: "2026-01-01",
          bankAccountId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        },
        "Bearer fake-session-jwt",
        legacy,
      ),
    ).rejects.toMatchObject({ status: 500 });
    expect(legacy).not.toHaveBeenCalled();
  });

  test("update fails closed without Drizzle when Rust is down", async () => {
    const legacy = mock(() => Promise.resolve({ id: "tx-1" }));
    await expect(
      updateTransactionForRest(
        { id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890", name: "Updated" },
        "Bearer fake-session-jwt",
        legacy,
      ),
    ).rejects.toMatchObject({ status: 500 });
    expect(legacy).not.toHaveBeenCalled();
  });

  test("createMany fails closed without Drizzle when Rust is down", async () => {
    const legacy = mock(() => Promise.resolve([]));
    await expect(
      createTransactionsForRest(
        [
          {
            name: "Test",
            amount: 100,
            currency: "USD",
            date: "2026-01-01",
            bankAccountId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
          },
        ],
        "Bearer fake-session-jwt",
        legacy,
      ),
    ).rejects.toMatchObject({ status: 500 });
    expect(legacy).not.toHaveBeenCalled();
  });

  test("updateMany fails closed without Drizzle when Rust is down", async () => {
    const legacy = mock(() => Promise.resolve([]));
    await expect(
      updateTransactionsForRest(
        { ids: ["a1b2c3d4-e5f6-7890-abcd-ef1234567890"] },
        "Bearer fake-session-jwt",
        legacy,
      ),
    ).rejects.toMatchObject({ status: 500 });
    expect(legacy).not.toHaveBeenCalled();
  });

  test("deleteMany fails closed without Drizzle when Rust is down", async () => {
    const legacy = mock(() => Promise.resolve([{ id: "tx-1" }]));
    await expect(
      deleteTransactionsForRest(
        ["a1b2c3d4-e5f6-7890-abcd-ef1234567890"],
        "Bearer fake-session-jwt",
        legacy,
      ),
    ).rejects.toMatchObject({ status: 500 });
    expect(legacy).not.toHaveBeenCalled();
  });

  test("legacy mode uses Drizzle fetcher", async () => {
    process.env.MIDDAY_BACKEND_MODE = "legacy";
    const legacy = mock(() => Promise.resolve({ data: [{ id: "tx-1" }] }));
    const result = await fetchTransactionsListForRest(
      { pageSize: 10 },
      undefined,
      legacy,
    );
    expect(result).toEqual({ data: [{ id: "tx-1" }] });
    expect(legacy).toHaveBeenCalledTimes(1);
  });
});
