import { expect, test } from "bun:test";
import {
  notificationDelegationTarget,
  postNotificationWorker,
} from "./worker-delegate";

test("notificationDelegationTarget stays off unless mode, url, and token are set", () => {
  expect(notificationDelegationTarget({})).toBeNull();
  expect(
    notificationDelegationTarget({
      MIDDAY_BACKEND_MODE: "legacy",
      REPLACEMENT_API_URL: "http://127.0.0.1:8787",
      MIDDAY_WORKER_TOKEN: "tok",
    }),
  ).toBeNull();
  expect(
    notificationDelegationTarget({
      MIDDAY_BACKEND_MODE: "dual",
      REPLACEMENT_API_URL: "http://127.0.0.1:8787/",
      REPLACEMENT_DELEGATION_TOKEN: "tok",
    }),
  ).toEqual({
    mode: "dual",
    url: "http://127.0.0.1:8787/api/v1/workers/notification",
    token: "tok",
  });
  expect(
    notificationDelegationTarget({
      MIDDAY_BACKEND_MODE: "replacement",
      REPLACEMENT_API_URL: "http://rust",
      MIDDAY_WORKER_TOKEN: "worker",
    }),
  ).toEqual({
    mode: "replacement",
    url: "http://rust/api/v1/workers/notification",
    token: "worker",
  });
});

test("postNotificationWorker throws when rust is not ok", async () => {
  await expect(
    postNotificationWorker(
      { type: "inbox_new", teamId: "00000000-0000-0000-0000-000000000001" },
      { url: "http://rust/notification", token: "tok" },
      (async () => new Response("no", { status: 500 })) as typeof fetch,
    ),
  ).rejects.toThrow("500");
});

test("postNotificationWorker returns activities and users on success", async () => {
  const body = await postNotificationWorker(
    {
      type: "inbox_new",
      teamId: "00000000-0000-0000-0000-000000000001",
      sendEmail: false,
      totalCount: 1,
    },
    { url: "http://rust/notification", token: "tok" },
    (async () =>
      new Response(
        JSON.stringify({
          executed: true,
          type: "inbox_new",
          teamId: "00000000-0000-0000-0000-000000000001",
          activities: 1,
          sendEmail: false,
          team: { id: "t", name: "Team", inboxId: "inbox" },
          users: [],
        }),
        { status: 200 },
      )) as typeof fetch,
  );
  expect(body.activities).toBe(1);
  expect(body.type).toBe("inbox_new");
});
