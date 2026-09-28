import { afterEach, describe, expect, test } from "bun:test";
import {
  buildInboxByStatusQuery,
  buildInboxListQuery,
  buildInboxSearchQuery,
  buildSearchAttachmentsQuery,
  buildTransactionsListQuery,
  resolveReplacementBearerToken,
} from "./delegate";

const env = process.env;

afterEach(() => {
  process.env = { ...env };
});

describe("buildInboxSearchQuery", () => {
  test("encodes inbox search params", () => {
    const qs = buildInboxSearchQuery({
      q: "invoice",
      transactionId: "tx-1",
      limit: 15,
    });
    const params = new URLSearchParams(qs.replace(/^\?/, ""));
    expect(params.get("q")).toBe("invoice");
    expect(params.get("transactionId")).toBe("tx-1");
    expect(params.get("limit")).toBe("15");
  });
});

describe("buildInboxByStatusQuery", () => {
  test("encodes status filter", () => {
    const qs = buildInboxByStatusQuery({ status: "pending" });
    const params = new URLSearchParams(qs.replace(/^\?/, ""));
    expect(params.get("status")).toBe("pending");
  });
});

describe("buildInboxListQuery", () => {
  test("encodes inbox list filters", () => {
    const qs = buildInboxListQuery({
      pageSize: 20,
      cursor: "40",
      order: "desc",
      sort: "document_date",
      q: "invoice",
      status: "pending",
      tab: "all",
    });
    const params = new URLSearchParams(qs.replace(/^\?/, ""));
    expect(params.get("pageSize")).toBe("20");
    expect(params.get("cursor")).toBe("40");
    expect(params.get("order")).toBe("desc");
    expect(params.get("sort")).toBe("document_date");
    expect(params.get("q")).toBe("invoice");
    expect(params.get("status")).toBe("pending");
    expect(params.get("tab")).toBe("all");
  });
});

describe("buildTransactionsListQuery", () => {
  test("encodes sort and statuses as repeated query keys", () => {
    const qs = buildTransactionsListQuery({
      pageSize: 40,
      sort: ["date", "desc"],
      statuses: ["blank", "in_review"],
      start: "2024-04-01T00:00:00.000Z",
      end: "2024-04-30T23:59:59.999Z",
    });

    const params = new URLSearchParams(qs.replace(/^\?/, ""));
    expect(params.get("pageSize")).toBe("40");
    expect(params.getAll("sort")).toEqual(["date", "desc"]);
    expect(params.getAll("statuses")).toEqual(["blank", "in_review"]);
    expect(params.get("start")).toBe("2024-04-01T00:00:00.000Z");
    expect(params.get("end")).toBe("2024-04-30T23:59:59.999Z");
  });

  test("encodes phase 2d list filters", () => {
    const qs = buildTransactionsListQuery({
      categories: ["food", "uncategorized"],
      accounts: ["ba-1"],
      tags: ["tag-1"],
      exported: false,
      fulfilled: true,
    });
    const params = new URLSearchParams(qs.replace(/^\?/, ""));
    expect(params.getAll("categories")).toEqual(["food", "uncategorized"]);
    expect(params.getAll("accounts")).toEqual(["ba-1"]);
    expect(params.getAll("tags")).toEqual(["tag-1"]);
    expect(params.get("exported")).toBe("false");
    expect(params.get("fulfilled")).toBe("true");
  });

  test("encodes phase 2e list filters", () => {
    const qs = buildTransactionsListQuery({
      assignees: ["user-1"],
      attachments: "include",
      recurring: ["monthly"],
      amountRange: [50, 200],
      amount: ["gte", "100"],
      type: "expense",
      manual: "exclude",
    });
    const params = new URLSearchParams(qs.replace(/^\?/, ""));
    expect(params.getAll("assignees")).toEqual(["user-1"]);
    expect(params.get("attachments")).toBe("include");
    expect(params.getAll("recurring")).toEqual(["monthly"]);
    expect(params.getAll("amountRange")).toEqual(["50", "200"]);
    expect(params.getAll("amount")).toEqual(["gte", "100"]);
    expect(params.get("type")).toBe("expense");
    expect(params.get("manual")).toBe("exclude");
  });
});

describe("buildSearchAttachmentsQuery", () => {
  test("encodes attachment search params", () => {
    const qs = buildSearchAttachmentsQuery({
      q: "receipt",
      transactionId: "tx-1",
      limit: 20,
    });
    const params = new URLSearchParams(qs.replace(/^\?/, ""));
    expect(params.get("q")).toBe("receipt");
    expect(params.get("transactionId")).toBe("tx-1");
    expect(params.get("limit")).toBe("20");
  });
});

describe("resolveReplacementBearerToken", () => {
  test("prefers session access token over env and demo", async () => {
    process.env.REPLACEMENT_DELEGATION_TOKEN = "env-token";
    process.env.REPLACEMENT_DELEGATION_USE_DEMO = "true";
    process.env.REPLACEMENT_API_URL = "http://127.0.0.1:8787";

    const token = await resolveReplacementBearerToken(
      "http://127.0.0.1:8787",
      "session-jwt-from-supabase",
    );

    expect(token).toBe("session-jwt-from-supabase");
  });

  test("falls back to env token when session is empty", async () => {
    process.env.REPLACEMENT_DELEGATION_TOKEN = "env-token";
    delete process.env.REPLACEMENT_DELEGATION_USE_DEMO;

    const token = await resolveReplacementBearerToken(
      "http://127.0.0.1:8787",
      "",
    );

    expect(token).toBe("env-token");
  });
});
