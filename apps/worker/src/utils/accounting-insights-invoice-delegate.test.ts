import { expect, test } from "bun:test";
import {
  accountingInsightsInvoiceDelegationTarget,
  postPersistTeamInsight,
  postUpsertAccountingSync,
} from "./accounting-insights-invoice-delegate";

test("accountingInsightsInvoiceDelegationTarget stays off unless mode, url, and token are set", () => {
  expect(
    accountingInsightsInvoiceDelegationTarget("upsert-accounting-sync", {}),
  ).toBeNull();
  expect(
    accountingInsightsInvoiceDelegationTarget("upsert-accounting-sync", {
      MIDDAY_BACKEND_MODE: "legacy",
      REPLACEMENT_API_URL: "http://127.0.0.1:8787",
      MIDDAY_WORKER_TOKEN: "tok",
    }),
  ).toBeNull();
  expect(
    accountingInsightsInvoiceDelegationTarget("persist-team-insight", {
      MIDDAY_BACKEND_MODE: "dual",
      REPLACEMENT_API_URL: "http://127.0.0.1:8787/",
      REPLACEMENT_DELEGATION_TOKEN: "tok",
    }),
  ).toEqual({
    mode: "dual",
    url: "http://127.0.0.1:8787/api/v1/workers/persist-team-insight",
    token: "tok",
  });
  expect(
    accountingInsightsInvoiceDelegationTarget("update-invoice-file", {
      MIDDAY_BACKEND_MODE: "replacement",
      REPLACEMENT_API_URL: "http://rust",
      MIDDAY_WORKER_TOKEN: "worker",
    }),
  ).toEqual({
    mode: "replacement",
    url: "http://rust/api/v1/workers/update-invoice-file",
    token: "worker",
  });
});

test("postUpsertAccountingSync throws when rust is not ok", async () => {
  await expect(
    postUpsertAccountingSync(
      { teamId: "t", records: [] },
      { url: "http://rust/upsert", token: "tok" },
      (async () => new Response("no", { status: 500 })) as typeof fetch,
    ),
  ).rejects.toThrow("500");
});

test("postPersistTeamInsight returns body on ok", async () => {
  const body = await postPersistTeamInsight(
    {
      insightId: "i",
      teamId: "t",
      status: "completed",
      title: "ok",
    },
    { url: "http://rust/insight", token: "tok" },
    (async () =>
      new Response(
        JSON.stringify({ executed: true, updated: true, insightId: "i" }),
        { status: 200 },
      )) as typeof fetch,
  );
  expect(body).toEqual({ executed: true, updated: true, insightId: "i" });
});
