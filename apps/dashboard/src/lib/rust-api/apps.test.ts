import { expect, test } from "bun:test";
import { normalizePlatformLinkToken } from "./apps";

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
