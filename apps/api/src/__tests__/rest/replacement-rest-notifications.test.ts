import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import {
  fetchNotificationsListForRest,
  updateAllNotificationsStatusForRest,
  updateNotificationStatusForRest,
} from "../../rest/services/replacement-rest-notifications";

const envSnapshot = { ...process.env };

const listQuery = {
  cursor: null,
  pageSize: 20,
  status: ["unread", "read"] as Array<"unread" | "read" | "archived">,
  userId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  priority: null,
  maxPriority: 3,
};

describe("REST notifications replacement delegation", () => {
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
    const legacy = mock(() =>
      Promise.resolve({ data: [], meta: { cursor: null, hasNextPage: false, hasPreviousPage: false } }),
    );
    await expect(
      fetchNotificationsListForRest(listQuery, "Bearer fake-session-jwt", legacy),
    ).rejects.toMatchObject({ status: 500 });
    expect(legacy).not.toHaveBeenCalled();
  });

  test("updateStatus fails closed without Drizzle when Rust is down", async () => {
    const legacy = mock(() => Promise.resolve({ id: "n-1", status: "read" }));
    await expect(
      updateNotificationStatusForRest(
        "b3b6e2c2-1f2a-4e3b-9c1d-2a4b6e2c21f2",
        "read",
        "Bearer fake-session-jwt",
        legacy,
      ),
    ).rejects.toMatchObject({ status: 500 });
    expect(legacy).not.toHaveBeenCalled();
  });

  test("updateAllStatus fails closed without Drizzle when Rust is down", async () => {
    const legacy = mock(() => Promise.resolve([]));
    await expect(
      updateAllNotificationsStatusForRest("read", "Bearer fake-session-jwt", legacy),
    ).rejects.toMatchObject({ status: 500 });
    expect(legacy).not.toHaveBeenCalled();
  });

  test("legacy mode uses Drizzle fetcher", async () => {
    process.env.MIDDAY_BACKEND_MODE = "legacy";
    const legacy = mock(() =>
      Promise.resolve({ data: [{ id: "n-1" }], meta: { cursor: null, hasNextPage: false, hasPreviousPage: false } }),
    );
    const result = await fetchNotificationsListForRest(listQuery, undefined, legacy);
    expect(result).toEqual({
      data: [{ id: "n-1" }],
      meta: { cursor: null, hasNextPage: false, hasPreviousPage: false },
    });
    expect(legacy).toHaveBeenCalledTimes(1);
  });
});
