import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import {
  createTagForRest,
  deleteTagForRest,
  fetchTagByIdForRest,
  fetchTagsListForRest,
  updateTagForRest,
} from "../../rest/services/replacement-rest-tags";

const envSnapshot = { ...process.env };

describe("REST tags replacement delegation", () => {
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
    const legacy = mock(() => Promise.resolve({ data: [] }));
    await expect(
      fetchTagsListForRest("Bearer fake-session-jwt", legacy),
    ).rejects.toMatchObject({ status: 500 });
    expect(legacy).not.toHaveBeenCalled();
  });

  test("getById fails closed without Drizzle when Rust is down", async () => {
    const legacy = mock(() => Promise.resolve({ id: "tag-1", name: "A" }));
    await expect(
      fetchTagByIdForRest(
        "b3b7c8e2-1f2a-4c3d-9e4f-5a6b7c8d9e0f",
        "Bearer fake-session-jwt",
        legacy,
      ),
    ).rejects.toMatchObject({ status: 500 });
    expect(legacy).not.toHaveBeenCalled();
  });

  test("create fails closed without Drizzle when Rust is down", async () => {
    const legacy = mock(() => Promise.resolve({ id: "tag-1", name: "A" }));
    await expect(
      createTagForRest("Important", "Bearer fake-session-jwt", legacy),
    ).rejects.toMatchObject({ status: 500 });
    expect(legacy).not.toHaveBeenCalled();
  });

  test("update fails closed without Drizzle when Rust is down", async () => {
    const legacy = mock(() => Promise.resolve({ id: "tag-1", name: "B" }));
    await expect(
      updateTagForRest(
        "b3b7c8e2-1f2a-4c3d-9e4f-5a6b7c8d9e0f",
        "Urgent",
        "Bearer fake-session-jwt",
        legacy,
      ),
    ).rejects.toMatchObject({ status: 500 });
    expect(legacy).not.toHaveBeenCalled();
  });

  test("delete fails closed without Drizzle when Rust is down", async () => {
    const legacy = mock(() => Promise.resolve({ id: "tag-1", name: "A" }));
    await expect(
      deleteTagForRest(
        "b3b7c8e2-1f2a-4c3d-9e4f-5a6b7c8d9e0f",
        "Bearer fake-session-jwt",
        legacy,
      ),
    ).rejects.toMatchObject({ status: 500 });
    expect(legacy).not.toHaveBeenCalled();
  });

  test("legacy mode uses Drizzle fetcher", async () => {
    process.env.MIDDAY_BACKEND_MODE = "legacy";
    const legacy = mock(() => Promise.resolve({ data: [{ id: "tag-1" }] }));
    const result = await fetchTagsListForRest(undefined, legacy);
    expect(result).toEqual({ data: [{ id: "tag-1" }] });
    expect(legacy).toHaveBeenCalledTimes(1);
  });
});
