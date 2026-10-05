import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import {
  bulkCreateTrackerEntriesForRest,
  deleteTrackerEntryForRest,
  fetchTrackerEntriesByRangeForRest,
  getCurrentTimerForRest,
  getTimerStatusForRest,
  startTimerForRest,
  stopTimerForRest,
  upsertTrackerEntriesForRest,
} from "../../rest/services/replacement-rest-tracker-entries";

const envSnapshot = { ...process.env };

const upsertInput = {
  start: "2024-04-01T09:00:00.000Z",
  stop: "2024-04-01T10:00:00.000Z",
  dates: ["2024-04-01"],
  projectId: "b3b7c8e2-1f2a-4c3d-9e4f-5a6b7c8d9e0f",
  duration: 3600,
};

describe("REST tracker-entries replacement delegation", () => {
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

  test("list by range fails closed without Drizzle when Rust is down", async () => {
    const legacy = mock(() =>
      Promise.resolve({ meta: { totalDuration: 0, totalAmount: 0, from: "2024-04-01", to: "2024-04-30" }, result: {} }),
    );
    await expect(
      fetchTrackerEntriesByRangeForRest(
        { from: "2024-04-01", to: "2024-04-30" },
        "Bearer fake-session-jwt",
        legacy,
      ),
    ).rejects.toMatchObject({ status: 500 });
    expect(legacy).not.toHaveBeenCalled();
  });

  test("bulkCreate fails closed without Drizzle when Rust is down", async () => {
    const legacy = mock(() => Promise.resolve([]));
    await expect(
      bulkCreateTrackerEntriesForRest(
        [upsertInput],
        "Bearer fake-session-jwt",
        legacy,
      ),
    ).rejects.toMatchObject({ status: 500 });
    expect(legacy).not.toHaveBeenCalled();
  });

  test("upsert fails closed without Drizzle when Rust is down", async () => {
    const legacy = mock(() => Promise.resolve([]));
    await expect(
      upsertTrackerEntriesForRest(upsertInput, "Bearer fake-session-jwt", legacy),
    ).rejects.toMatchObject({ status: 500 });
    expect(legacy).not.toHaveBeenCalled();
  });

  test("delete fails closed without Drizzle when Rust is down", async () => {
    const legacy = mock(() => Promise.resolve({ id: "te-1" }));
    await expect(
      deleteTrackerEntryForRest(
        "b3b7c8e2-1f2a-4c3d-9e4f-5a6b7c8d9e0f",
        "Bearer fake-session-jwt",
        legacy,
      ),
    ).rejects.toMatchObject({ status: 500 });
    expect(legacy).not.toHaveBeenCalled();
  });

  test("startTimer fails closed without Drizzle when Rust is down", async () => {
    const legacy = mock(() => Promise.resolve({ id: "te-1" }));
    await expect(
      startTimerForRest(
        { projectId: upsertInput.projectId },
        "Bearer fake-session-jwt",
        legacy,
      ),
    ).rejects.toMatchObject({ status: 500 });
    expect(legacy).not.toHaveBeenCalled();
  });

  test("stopTimer fails closed without Drizzle when Rust is down", async () => {
    const legacy = mock(() => Promise.resolve({ id: "te-1" }));
    await expect(
      stopTimerForRest({}, "Bearer fake-session-jwt", legacy),
    ).rejects.toMatchObject({ status: 500 });
    expect(legacy).not.toHaveBeenCalled();
  });

  test("getCurrentTimer fails closed without Drizzle when Rust is down", async () => {
    const legacy = mock(() => Promise.resolve(null));
    await expect(
      getCurrentTimerForRest({}, "Bearer fake-session-jwt", legacy),
    ).rejects.toMatchObject({ status: 500 });
    expect(legacy).not.toHaveBeenCalled();
  });

  test("getTimerStatus fails closed without Drizzle when Rust is down", async () => {
    const legacy = mock(() => Promise.resolve({ isRunning: false }));
    await expect(
      getTimerStatusForRest({}, "Bearer fake-session-jwt", legacy),
    ).rejects.toMatchObject({ status: 500 });
    expect(legacy).not.toHaveBeenCalled();
  });

  test("legacy mode uses Drizzle fetcher", async () => {
    process.env.MIDDAY_BACKEND_MODE = "legacy";
    const legacy = mock(() =>
      Promise.resolve({ meta: { totalDuration: 0, totalAmount: 0, from: "2024-04-01", to: "2024-04-30" }, result: {} }),
    );
    const result = await fetchTrackerEntriesByRangeForRest(
      { from: "2024-04-01", to: "2024-04-30" },
      undefined,
      legacy,
    );
    expect(result).toEqual({
      meta: { totalDuration: 0, totalAmount: 0, from: "2024-04-01", to: "2024-04-30" },
      result: {},
    });
    expect(legacy).toHaveBeenCalledTimes(1);
  });
});
