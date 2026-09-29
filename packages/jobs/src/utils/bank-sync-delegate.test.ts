import { describe, expect, test } from "bun:test";
import {
  bankSyncDelegationTarget,
  postRemapBankAccountIds,
  postSyncConnectionStatus,
  postUpdateBankAccountSync,
  postUpsertTransactions,
} from "./bank-sync-delegate";

describe("bankSyncDelegationTarget", () => {
  test("stays off unless mode, url, and token are set", () => {
    expect(bankSyncDelegationTarget("upsert-transactions", {})).toBeNull();
    expect(
      bankSyncDelegationTarget("sync-connection-status", {
        MIDDAY_BACKEND_MODE: "legacy",
        REPLACEMENT_API_URL: "http://127.0.0.1:8787",
        MIDDAY_WORKER_TOKEN: "secret",
      }),
    ).toBeNull();
    expect(
      bankSyncDelegationTarget("upsert-transactions", {
        MIDDAY_BACKEND_MODE: "dual",
        REPLACEMENT_API_URL: "http://127.0.0.1:8787/",
        MIDDAY_WORKER_TOKEN: "secret",
      }),
    ).toEqual({
      mode: "dual",
      url: "http://127.0.0.1:8787/api/v1/workers/upsert-transactions",
      token: "secret",
    });
    expect(
      bankSyncDelegationTarget("remap-bank-account-ids", {
        MIDDAY_BACKEND_MODE: "replacement",
        REPLACEMENT_API_URL: "http://rust",
        REPLACEMENT_DELEGATION_TOKEN: "tok",
      }),
    ).toEqual({
      mode: "replacement",
      url: "http://rust/api/v1/workers/remap-bank-account-ids",
      token: "tok",
    });
  });
});

test("postUpsertTransactions throws when rust is not ok", async () => {
  await expect(
    postUpsertTransactions(
      { teamId: "t", bankAccountId: "a", transactions: [] },
      { url: "http://x", token: "t" },
      async () => new Response("nope", { status: 500 }),
    ),
  ).rejects.toThrow("upsert-transactions rust failed: 500");
});

test("postSyncConnectionStatus returns body on success", async () => {
  const body = await postSyncConnectionStatus(
    {
      connectionId: "c",
      teamId: "t",
      status: "connected",
      lastAccessed: "2026-09-29T00:00:00.000Z",
    },
    { url: "http://x", token: "t" },
    async () =>
      new Response(
        JSON.stringify({
          executed: true,
          connectionId: "c",
          status: "connected",
          updated: true,
          disconnectedByRetries: false,
        }),
        { status: 200 },
      ),
  );
  expect(body.updated).toBe(true);
  expect(body.status).toBe("connected");
});

test("postUpdateBankAccountSync returns updated", async () => {
  const body = await postUpdateBankAccountSync(
    { accountId: "a", teamId: "t", setBalance: true, balance: 10 },
    { url: "http://x", token: "t" },
    async () =>
      new Response(
        JSON.stringify({ executed: true, accountId: "a", updated: true }),
        { status: 200 },
      ),
  );
  expect(body.updated).toBe(true);
});

test("postRemapBankAccountIds returns matched", async () => {
  const body = await postRemapBankAccountIds(
    {
      connectionId: "c",
      teamId: "t",
      updates: [{ id: "a", accountId: "prov-1" }],
    },
    { url: "http://x", token: "t" },
    async () =>
      new Response(
        JSON.stringify({ executed: true, matched: 1, errors: 0 }),
        { status: 200 },
      ),
  );
  expect(body.matched).toBe(1);
});
