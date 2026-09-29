import { describe, expect, test } from "bun:test";
import {
  inboxMatchingDelegationTarget,
  postBatchProcessMatching,
  postMatchTransactionsBidirectional,
} from "./inbox-matching-delegate";

describe("inboxMatchingDelegationTarget", () => {
  test("stays off unless mode, url, and token are set", () => {
    expect(inboxMatchingDelegationTarget("batch-process-matching", {})).toBeNull();
    expect(
      inboxMatchingDelegationTarget("batch-process-matching", {
        MIDDAY_BACKEND_MODE: "legacy",
        REPLACEMENT_API_URL: "http://127.0.0.1:8787",
        MIDDAY_WORKER_TOKEN: "secret",
      }),
    ).toBeNull();
    expect(
      inboxMatchingDelegationTarget("batch-process-matching", {
        MIDDAY_BACKEND_MODE: "dual",
        REPLACEMENT_API_URL: "http://127.0.0.1:8787/",
        MIDDAY_WORKER_TOKEN: "secret",
      }),
    ).toEqual({
      mode: "dual",
      url: "http://127.0.0.1:8787/api/v1/workers/batch-process-matching",
      token: "secret",
    });
    expect(
      inboxMatchingDelegationTarget("match-transactions-bidirectional", {
        MIDDAY_BACKEND_MODE: "replacement",
        REPLACEMENT_API_URL: "http://rust",
        REPLACEMENT_DELEGATION_TOKEN: "tok",
      }),
    ).toEqual({
      mode: "replacement",
      url: "http://rust/api/v1/workers/match-transactions-bidirectional",
      token: "tok",
    });
  });
});

test("postBatchProcessMatching throws when rust is not ok", async () => {
  await expect(
    postBatchProcessMatching(
      { teamId: "t", inboxIds: [] },
      { url: "http://x", token: "t" },
      async () => new Response("nope", { status: 500 }),
    ),
  ).rejects.toThrow("batch-process-matching rust failed: 500");
});

test("postMatchTransactionsBidirectional returns body on success", async () => {
  const body = await postMatchTransactionsBidirectional(
    { teamId: "t", newTransactionIds: ["a"] },
    { url: "http://x", token: "t" },
    async () =>
      new Response(
        JSON.stringify({
          executed: true,
          processed: 1,
          autoMatched: 0,
          suggestions: 0,
          noMatches: 1,
          forwardMatches: 0,
          reverseMatches: 0,
          notifications: [],
        }),
        { status: 200 },
      ),
  );
  expect(body.executed).toBe(true);
  expect(body.processed).toBe(1);
});
