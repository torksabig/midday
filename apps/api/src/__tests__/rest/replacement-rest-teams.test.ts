import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import {
  fetchTeamByIdForRest,
  fetchTeamMembersForRest,
  fetchTeamsListForRest,
  updateTeamByIdForRest,
} from "../../rest/services/replacement-rest-teams";

const envSnapshot = { ...process.env };

describe("REST teams replacement delegation", () => {
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
      fetchTeamsListForRest("Bearer fake-session-jwt", legacy),
    ).rejects.toMatchObject({ status: 500 });
    expect(legacy).not.toHaveBeenCalled();
  });

  test("getById fails closed without Drizzle when Rust is down", async () => {
    const legacy = mock(() => Promise.resolve({ id: "team-1" }));
    await expect(
      fetchTeamByIdForRest("Bearer fake-session-jwt", legacy),
    ).rejects.toMatchObject({ status: 500 });
    expect(legacy).not.toHaveBeenCalled();
  });

  test("update fails closed without Drizzle when Rust is down", async () => {
    const legacy = mock(() => Promise.resolve({ id: "team-1" }));
    await expect(
      updateTeamByIdForRest(
        { name: "Acme" },
        "Bearer fake-session-jwt",
        legacy,
      ),
    ).rejects.toMatchObject({ status: 500 });
    expect(legacy).not.toHaveBeenCalled();
  });

  test("members fails closed without Drizzle when Rust is down", async () => {
    const legacy = mock(() => Promise.resolve({ data: [] }));
    await expect(
      fetchTeamMembersForRest("Bearer fake-session-jwt", legacy),
    ).rejects.toMatchObject({ status: 500 });
    expect(legacy).not.toHaveBeenCalled();
  });

  test("legacy mode uses Drizzle fetcher", async () => {
    process.env.MIDDAY_BACKEND_MODE = "legacy";
    const legacy = mock(() => Promise.resolve({ data: [{ id: "team-1" }] }));
    const result = await fetchTeamsListForRest(undefined, legacy);
    expect(result).toEqual({ data: [{ id: "team-1" }] });
    expect(legacy).toHaveBeenCalledTimes(1);
  });
});
