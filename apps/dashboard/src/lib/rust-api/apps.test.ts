import { afterEach, describe, expect, mock, test } from "bun:test";
import { fetchAppById, normalizePlatformLinkToken } from "./apps";

describe("fetchAppById", () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  test("returns app on 200", async () => {
    globalThis.fetch = mock(() =>
      Promise.resolve(
        new Response(
          JSON.stringify({
            app_id: "xero",
            config: { tenantId: "t-1" },
          }),
          { status: 200 },
        ),
      ),
    ) as typeof fetch;

    await expect(
      fetchAppById("http://127.0.0.1:8787", "tok", "xero"),
    ).resolves.toMatchObject({
      app_id: "xero",
      config: { tenantId: "t-1" },
    });
  });

  test("returns null on 404", async () => {
    globalThis.fetch = mock(() =>
      Promise.resolve(new Response(null, { status: 404 })),
    ) as typeof fetch;

    await expect(
      fetchAppById("http://127.0.0.1:8787", "tok", "missing"),
    ).resolves.toBeNull();
  });
});

test("normalizes platform link token payload", () => {
  expect(
    normalizePlatformLinkToken({
      id: "tok-1",
      code: "Ab12Cd34",
      provider: "slack",
      team_id: "team-1",
      expires_at: "2026-01-03T00:00:00Z",
    }),
  ).toMatchObject({
    id: "tok-1",
    code: "Ab12Cd34",
    provider: "slack",
    teamId: "team-1",
    expiresAt: "2026-01-03T00:00:00Z",
  });
});
