import { describe, expect, test } from "bun:test";
import {
  postExportTransactions,
  postImportTransactions,
  postProcessExport,
  transactionImportExportDelegationTarget,
} from "./transaction-import-export-delegate";

describe("transactionImportExportDelegationTarget", () => {
  test("stays off unless mode, url, and token are set", () => {
    expect(transactionImportExportDelegationTarget("import-transactions", {})).toBeNull();
    expect(
      transactionImportExportDelegationTarget("process-export", {
        MIDDAY_BACKEND_MODE: "legacy",
        REPLACEMENT_API_URL: "http://127.0.0.1:8787",
        MIDDAY_WORKER_TOKEN: "secret",
      }),
    ).toBeNull();
    expect(
      transactionImportExportDelegationTarget("import-transactions", {
        MIDDAY_BACKEND_MODE: "dual",
        REPLACEMENT_API_URL: "http://127.0.0.1:8787/",
        MIDDAY_WORKER_TOKEN: "secret",
      }),
    ).toEqual({
      mode: "dual",
      url: "http://127.0.0.1:8787/api/v1/workers/import-transactions",
      token: "secret",
    });
    expect(
      transactionImportExportDelegationTarget("export-transactions", {
        MIDDAY_BACKEND_MODE: "replacement",
        REPLACEMENT_API_URL: "http://rust",
        REPLACEMENT_DELEGATION_TOKEN: "tok",
      }),
    ).toEqual({
      mode: "replacement",
      url: "http://rust/api/v1/workers/export-transactions",
      token: "tok",
    });
  });
});

test("postImportTransactions throws when rust is not ok", async () => {
  await expect(
    postImportTransactions(
      { teamId: "t", transactions: [] },
      { url: "http://x", token: "t" },
      async () => new Response("nope", { status: 500 }),
    ),
  ).rejects.toThrow("import-transactions rust failed: 500");
});

test("postProcessExport returns body on success", async () => {
  const body = await postProcessExport(
    { teamId: "t", ids: ["a"] },
    { url: "http://x", token: "t" },
    async () =>
      new Response(
        JSON.stringify({
          executed: true,
          transactions: [{ id: "a", name: "Coffee" }],
        }),
        { status: 200 },
      ),
  );
  expect(body.executed).toBe(true);
  expect(body.transactions[0]?.id).toBe("a");
});

test("postExportTransactions returns markedExported", async () => {
  const body = await postExportTransactions(
    { teamId: "t", transactionIds: ["a", "b"] },
    { url: "http://x", token: "t" },
    async () =>
      new Response(
        JSON.stringify({ executed: true, markedExported: 2 }),
        { status: 200 },
      ),
  );
  expect(body.markedExported).toBe(2);
});
