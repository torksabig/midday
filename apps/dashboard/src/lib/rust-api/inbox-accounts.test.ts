import { expect, test } from "bun:test";
import { normalizeInboxAccounts } from "./inbox-accounts";

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
