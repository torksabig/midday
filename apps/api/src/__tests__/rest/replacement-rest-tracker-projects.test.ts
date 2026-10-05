import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import {
  deleteTrackerProjectForRest,
  fetchTrackerProjectByIdForRest,
  fetchTrackerProjectsListForRest,
  upsertTrackerProjectForRest,
} from "../../rest/services/replacement-rest-tracker-projects";

const envSnapshot = { ...process.env };

describe("REST tracker-projects replacement delegation", () => {
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
      fetchTrackerProjectsListForRest({}, "Bearer fake-session-jwt", legacy),
    ).rejects.toMatchObject({ status: 500 });
    expect(legacy).not.toHaveBeenCalled();
  });

  test("getById fails closed without Drizzle when Rust is down", async () => {
    const legacy = mock(() => Promise.resolve({ id: "tp-1" }));
    await expect(
      fetchTrackerProjectByIdForRest(
        "b3b7c8e2-1f2a-4c3d-9e4f-5a6b7c8d9e0f",
        "Bearer fake-session-jwt",
        legacy,
      ),
    ).rejects.toMatchObject({ status: 500 });
    expect(legacy).not.toHaveBeenCalled();
  });

  test("upsert fails closed without Drizzle when Rust is down", async () => {
    const legacy = mock(() => Promise.resolve({ id: "tp-1", name: "Proj" }));
    await expect(
      upsertTrackerProjectForRest(
        { name: "Proj" },
        "Bearer fake-session-jwt",
        legacy,
      ),
    ).rejects.toMatchObject({ status: 500 });
    expect(legacy).not.toHaveBeenCalled();
  });

  test("delete fails closed without Drizzle when Rust is down", async () => {
    const legacy = mock(() => Promise.resolve({ id: "tp-1" }));
    await expect(
      deleteTrackerProjectForRest(
        "b3b7c8e2-1f2a-4c3d-9e4f-5a6b7c8d9e0f",
        "Bearer fake-session-jwt",
        legacy,
      ),
    ).rejects.toMatchObject({ status: 500 });
    expect(legacy).not.toHaveBeenCalled();
  });

  test("legacy mode uses Drizzle fetcher", async () => {
    process.env.MIDDAY_BACKEND_MODE = "legacy";
    const legacy = mock(() =>
      Promise.resolve({ data: [{ id: "tp-1" }], meta: { cursor: null, hasNextPage: false, hasPreviousPage: false } }),
    );
    const result = await fetchTrackerProjectsListForRest({}, undefined, legacy);
    expect(result).toEqual({
      data: [{ id: "tp-1" }],
      meta: { cursor: null, hasNextPage: false, hasPreviousPage: false },
    });
    expect(legacy).toHaveBeenCalledTimes(1);
  });
});
