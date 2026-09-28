import { afterEach, describe, expect, test } from "bun:test";
import {
  buildTransactionsListQuery,
  resolveReplacementBearerToken,
} from "./delegate";

const env = process.env;

afterEach(() => {
  process.env = { ...env };
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
