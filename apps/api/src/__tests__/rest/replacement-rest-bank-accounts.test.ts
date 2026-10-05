import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import {
  createBankAccountForRest,
  deleteBankAccountForRest,
  fetchBankAccountByIdForRest,
  fetchBankAccountsListForRest,
  updateBankAccountForRest,
} from "../../rest/services/replacement-rest-bank-accounts";

const envSnapshot = { ...process.env };

describe("REST bank-accounts replacement delegation", () => {
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
    const legacy = mock(() => Promise.resolve([]));
    await expect(
      fetchBankAccountsListForRest({}, "Bearer fake-session-jwt", legacy),
    ).rejects.toMatchObject({ status: 500 });
    expect(legacy).not.toHaveBeenCalled();
  });

  test("getById fails closed without Drizzle when Rust is down", async () => {
    const legacy = mock(() => Promise.resolve({ id: "ba-1" }));
    await expect(
      fetchBankAccountByIdForRest(
        "b3b7c8e2-1f2a-4c3d-9e4f-5a6b7c8d9e0f",
        "Bearer fake-session-jwt",
        legacy,
      ),
    ).rejects.toMatchObject({ status: 500 });
    expect(legacy).not.toHaveBeenCalled();
  });

  test("create fails closed without Drizzle when Rust is down", async () => {
    const legacy = mock(() => Promise.resolve({ id: "ba-1", name: "Main" }));
    await expect(
      createBankAccountForRest(
        { name: "Main", currency: "USD", manual: true },
        "Bearer fake-session-jwt",
        legacy,
      ),
    ).rejects.toMatchObject({ status: 500 });
    expect(legacy).not.toHaveBeenCalled();
  });

  test("update fails closed without Drizzle when Rust is down", async () => {
    const legacy = mock(() => Promise.resolve({ id: "ba-1", name: "Updated" }));
    await expect(
      updateBankAccountForRest(
        "b3b7c8e2-1f2a-4c3d-9e4f-5a6b7c8d9e0f",
        { name: "Updated" },
        "Bearer fake-session-jwt",
        legacy,
      ),
    ).rejects.toMatchObject({ status: 500 });
    expect(legacy).not.toHaveBeenCalled();
  });

  test("delete fails closed without Drizzle when Rust is down", async () => {
    const legacy = mock(() => Promise.resolve({ id: "ba-1" }));
    await expect(
      deleteBankAccountForRest(
        "b3b7c8e2-1f2a-4c3d-9e4f-5a6b7c8d9e0f",
        "Bearer fake-session-jwt",
        legacy,
      ),
    ).rejects.toMatchObject({ status: 500 });
    expect(legacy).not.toHaveBeenCalled();
  });

  test("legacy mode uses Drizzle fetcher", async () => {
    process.env.MIDDAY_BACKEND_MODE = "legacy";
    const legacy = mock(() => Promise.resolve([{ id: "ba-1" }]));
    const result = await fetchBankAccountsListForRest({}, undefined, legacy);
    expect(result).toEqual({ data: [{ id: "ba-1" }] });
    expect(legacy).toHaveBeenCalledTimes(1);
  });
});
