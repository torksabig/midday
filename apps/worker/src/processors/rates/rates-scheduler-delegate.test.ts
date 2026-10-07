import { expect, test } from "bun:test";
import {
  postRatesScheduler,
  ratesSchedulerDelegationTarget,
} from "./rates-scheduler-delegate";

test("ratesSchedulerDelegationTarget stays off unless mode, url, and token are set", () => {
  expect(ratesSchedulerDelegationTarget({})).toBeNull();
  expect(
    ratesSchedulerDelegationTarget({
      MIDDAY_BACKEND_MODE: "legacy",
      REPLACEMENT_API_URL: "http://127.0.0.1:8787",
      MIDDAY_WORKER_TOKEN: "tok",
    }),
  ).toBeNull();
  expect(
    ratesSchedulerDelegationTarget({
      MIDDAY_BACKEND_MODE: "dual",
      REPLACEMENT_API_URL: "http://127.0.0.1:8787/",
      REPLACEMENT_DELEGATION_TOKEN: "tok",
    }),
  ).toEqual({
    mode: "dual",
    url: "http://127.0.0.1:8787/api/v1/workers/rates-scheduler",
    token: "tok",
  });
  expect(
    ratesSchedulerDelegationTarget({
      MIDDAY_BACKEND_MODE: "replacement",
      REPLACEMENT_API_URL: "http://rust",
      MIDDAY_WORKER_TOKEN: "worker",
    }),
  ).toEqual({
    mode: "replacement",
    url: "http://rust/api/v1/workers/rates-scheduler",
    token: "worker",
  });
});

test("postRatesScheduler throws when rust is not ok", async () => {
  await expect(
    postRatesScheduler(
      [{ base: "USD", target: "EUR", rate: 0.9, updatedAt: "2026-09-29" }],
      500,
      { url: "http://rust/rates", token: "tok" },
      async () => new Response("no", { status: 500 }),
    ),
  ).rejects.toThrow("500");
});

test("postRatesScheduler returns camelCase counts on success", async () => {
  const body = await postRatesScheduler(
    [{ base: "USD", target: "EUR", rate: 0.9, updatedAt: "2026-09-29" }],
    500,
    { url: "http://rust/rates", token: "tok" },
    async () =>
      new Response(
        JSON.stringify({
          executed: true,
          totalProcessed: 1,
          batchesProcessed: 1,
        }),
        { status: 200 },
      ),
  );
  expect(body).toEqual({
    executed: true,
    totalProcessed: 1,
    batchesProcessed: 1,
  });
});
