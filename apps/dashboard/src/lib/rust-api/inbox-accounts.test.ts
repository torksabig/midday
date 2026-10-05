import { afterEach, describe, expect, mock, test } from "bun:test";
import {
  deleteInboxAccount,
  fetchInboxAccountById,
  normalizeInboxAccounts,
} from "./inbox-accounts";

test("normalizes inbox account list to camelCase tRPC shape", () => {
  expect(
    normalizeInboxAccounts([
      {
        id: "ia-1",
        email: "a@b.com",
        provider: "gmail",
        lastAccessed: "2026-01-01T00:00:00Z",
        status: "connected",
        errorMessage: null,
      },
    ]),
  ).toEqual([
    {
      id: "ia-1",
      email: "a@b.com",
      provider: "gmail",
      lastAccessed: "2026-01-01T00:00:00Z",
      status: "connected",
      errorMessage: null,
    },
  ]);
});

describe("inbox account delete/get-by-id Rust helpers", () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  test("deleteInboxAccount returns id and scheduleId", async () => {
    globalThis.fetch = mock(() =>
      Promise.resolve(
        new Response(
          JSON.stringify({ id: "ia-1", scheduleId: "sched-1" }),
          { status: 200 },
        ),
      ),
    ) as typeof fetch;

    await expect(
      deleteInboxAccount("http://127.0.0.1:8787", "tok", "ia-1"),
    ).resolves.toEqual({ id: "ia-1", scheduleId: "sched-1" });
  });

  test("fetchInboxAccountById returns null on 404", async () => {
    globalThis.fetch = mock(() =>
      Promise.resolve(new Response(null, { status: 404 })),
    ) as typeof fetch;

    await expect(
      fetchInboxAccountById("http://127.0.0.1:8787", "tok", "missing"),
    ).resolves.toBeNull();
  });
});
