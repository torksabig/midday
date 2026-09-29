import { expect, test } from "bun:test";
import {
  notificationFromRust,
  postCheckInvoiceStatus,
  workerDelegationTarget,
} from "./check-status-delegate";

test("workerDelegationTarget stays off unless mode, url, and token are set", () => {
  expect(workerDelegationTarget({})).toBeNull();
  expect(
    workerDelegationTarget({
      MIDDAY_BACKEND_MODE: "legacy",
      REPLACEMENT_API_URL: "http://127.0.0.1:8787",
      MIDDAY_WORKER_TOKEN: "tok",
    }),
  ).toBeNull();
  expect(
    workerDelegationTarget({
      MIDDAY_BACKEND_MODE: "dual",
      REPLACEMENT_API_URL: "http://127.0.0.1:8787/",
      REPLACEMENT_DELEGATION_TOKEN: "tok",
    }),
  ).toEqual({
    mode: "dual",
    url: "http://127.0.0.1:8787/api/v1/workers/check-invoice-status",
    token: "tok",
  });
});

test("notificationFromRust only returns a payload when rust asked to notify", () => {
  expect(
    notificationFromRust({
      executed: true,
      outcome: "unchanged",
      invoiceId: "inv",
      notify: false,
    }),
  ).toBeNull();
  expect(
    notificationFromRust({
      executed: true,
      outcome: "paid",
      invoiceId: "inv",
      invoiceNumber: "1001",
      status: "paid",
      teamId: "team",
      customerName: "Ada",
      notify: true,
    }),
  ).toEqual({
    invoiceId: "inv",
    invoiceNumber: "1001",
    status: "paid",
    teamId: "team",
    customerName: "Ada",
  });
});

test("postCheckInvoiceStatus throws when rust is not ok", async () => {
  await expect(
    postCheckInvoiceStatus(
      "inv",
      { url: "http://rust/check", token: "tok" },
      (async () => new Response("no", { status: 500 })) as typeof fetch,
    ),
  ).rejects.toThrow("500");
});
