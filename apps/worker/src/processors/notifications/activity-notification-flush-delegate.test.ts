import { expect, test } from "bun:test";
import {
  activityNotificationFlushDelegationTarget,
  postActivityNotificationFlushClaim,
  postActivityNotificationFlushComplete,
} from "./activity-notification-flush-delegate";

test("activityNotificationFlushDelegationTarget stays off unless mode, url, and token are set", () => {
  expect(activityNotificationFlushDelegationTarget({})).toBeNull();
  expect(
    activityNotificationFlushDelegationTarget({
      MIDDAY_BACKEND_MODE: "legacy",
      REPLACEMENT_API_URL: "http://127.0.0.1:8787",
      MIDDAY_WORKER_TOKEN: "tok",
    }),
  ).toBeNull();
  expect(
    activityNotificationFlushDelegationTarget({
      MIDDAY_BACKEND_MODE: "dual",
      REPLACEMENT_API_URL: "http://127.0.0.1:8787/",
      REPLACEMENT_DELEGATION_TOKEN: "tok",
    }),
  ).toEqual({
    mode: "dual",
    url: "http://127.0.0.1:8787/api/v1/workers/activity-notification-flush",
    token: "tok",
  });
  expect(
    activityNotificationFlushDelegationTarget({
      MIDDAY_BACKEND_MODE: "replacement",
      REPLACEMENT_API_URL: "http://rust",
      MIDDAY_WORKER_TOKEN: "worker",
    }),
  ).toEqual({
    mode: "replacement",
    url: "http://rust/api/v1/workers/activity-notification-flush",
    token: "worker",
  });
});

test("postActivityNotificationFlushClaim throws when rust is not ok", async () => {
  await expect(
    postActivityNotificationFlushClaim(
      { url: "http://rust/flush", token: "tok" },
      100,
      async () => new Response("no", { status: 500 }),
    ),
  ).rejects.toThrow("500");
});

test("postActivityNotificationFlushComplete returns completed count on success", async () => {
  const body = await postActivityNotificationFlushComplete(
    [{ batchId: "00000000-0000-0000-0000-000000000001", delivered: false }],
    { url: "http://rust/flush", token: "tok" },
    async () =>
      new Response(
        JSON.stringify({
          executed: true,
          skipped: 0,
          pending: [],
          completed: 1,
        }),
        { status: 200 },
      ),
  );
  expect(body).toEqual({
    executed: true,
    skipped: 0,
    pending: [],
    completed: 1,
  });
});
