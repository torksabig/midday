import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import {
  deleteInboxForRest,
  fetchInboxByIdForRest,
  fetchInboxListForRest,
  updateInboxForRest,
} from "../../rest/services/replacement-rest-inbox";

const envSnapshot = { ...process.env };

describe("REST inbox replacement delegation", () => {
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
      fetchInboxListForRest(
        { pageSize: 20 },
        "Bearer fake-session-jwt",
        legacy,
      ),
    ).rejects.toMatchObject({ status: 500 });
    expect(legacy).not.toHaveBeenCalled();
  });

  test("getById fails closed without Drizzle when Rust is down", async () => {
    const legacy = mock(() => Promise.resolve({ id: "inbox-1" }));
    await expect(
      fetchInboxByIdForRest(
        "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "Bearer fake-session-jwt",
        legacy,
      ),
    ).rejects.toMatchObject({ status: 500 });
    expect(legacy).not.toHaveBeenCalled();
  });

  test("update fails closed without Drizzle when Rust is down", async () => {
    const legacy = mock(() => Promise.resolve({ id: "inbox-1" }));
    await expect(
      updateInboxForRest(
        "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        { status: "done" },
        "Bearer fake-session-jwt",
        legacy,
      ),
    ).rejects.toMatchObject({ status: 500 });
    expect(legacy).not.toHaveBeenCalled();
  });

  test("delete fails closed without Drizzle when Rust is down", async () => {
    const legacy = mock(() => Promise.resolve({ id: "inbox-1" }));
    await expect(
      deleteInboxForRest(
        "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "Bearer fake-session-jwt",
        legacy,
      ),
    ).rejects.toMatchObject({ status: 500 });
    expect(legacy).not.toHaveBeenCalled();
  });

  test("legacy mode uses Drizzle fetcher", async () => {
    process.env.MIDDAY_BACKEND_MODE = "legacy";
    const legacy = mock(() => Promise.resolve({ data: [{ id: "inbox-1" }] }));
    const result = await fetchInboxListForRest(
      { pageSize: 10 },
      undefined,
      legacy,
    );
    expect(result).toEqual({ data: [{ id: "inbox-1" }] });
    expect(legacy).toHaveBeenCalledTimes(1);
  });
});
