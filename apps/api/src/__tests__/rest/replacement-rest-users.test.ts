import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import {
  fetchCurrentUserForRest,
  updateCurrentUserForRest,
} from "../../rest/services/replacement-rest-users";

const envSnapshot = { ...process.env };

describe("REST users replacement delegation", () => {
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

  test("get me fails closed without Drizzle when Rust is down", async () => {
    const legacy = mock(() => Promise.resolve({ id: "u-1", email: "a@b.co" }));
    await expect(
      fetchCurrentUserForRest("Bearer fake-session-jwt", legacy),
    ).rejects.toMatchObject({ status: 500 });
    expect(legacy).not.toHaveBeenCalled();
  });

  test("update me fails closed without Drizzle when Rust is down", async () => {
    const legacy = mock(() => Promise.resolve({ id: "u-1", fullName: "A" }));
    await expect(
      updateCurrentUserForRest(
        { fullName: "A" },
        "Bearer fake-session-jwt",
        legacy,
      ),
    ).rejects.toMatchObject({ status: 500 });
    expect(legacy).not.toHaveBeenCalled();
  });

  test("legacy mode uses Drizzle fetcher", async () => {
    process.env.MIDDAY_BACKEND_MODE = "legacy";
    const legacy = mock(() => Promise.resolve({ id: "u-1" }));
    const result = await fetchCurrentUserForRest(undefined, legacy);
    expect(result).toEqual({ id: "u-1" });
    expect(legacy).toHaveBeenCalledTimes(1);
  });
});
