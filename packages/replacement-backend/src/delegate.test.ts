import { afterEach, describe, expect, test } from "bun:test";
import { resolveReplacementBearerToken } from "./delegate";

const env = process.env;

afterEach(() => {
  process.env = { ...env };
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
