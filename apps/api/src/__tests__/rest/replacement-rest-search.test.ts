import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { globalSearchForRest } from "../../rest/services/replacement-rest-search";

const envSnapshot = { ...process.env };

describe("REST search replacement delegation", () => {
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

  test("global search fails closed without Drizzle when Rust is down", async () => {
    const legacy = mock(() => Promise.resolve([]));
    await expect(
      globalSearchForRest(
        {
          searchTerm: "Acme",
          limit: 30,
          itemsPerTableLimit: 5,
          relevanceThreshold: 0.01,
        },
        "Bearer fake-session-jwt",
        legacy,
      ),
    ).rejects.toMatchObject({ status: 500 });
    expect(legacy).not.toHaveBeenCalled();
  });

  test("legacy mode uses Drizzle fetcher", async () => {
    process.env.MIDDAY_BACKEND_MODE = "legacy";
    const legacy = mock(() => Promise.resolve([{ id: "1", type: "customer" }]));
    const result = await globalSearchForRest(
      {
        searchTerm: "Acme",
        limit: 30,
        itemsPerTableLimit: 5,
        relevanceThreshold: 0.01,
      },
      undefined,
      legacy,
    );
    expect(legacy).toHaveBeenCalled();
    expect(result).toEqual([{ id: "1", type: "customer" }]);
  });
});
