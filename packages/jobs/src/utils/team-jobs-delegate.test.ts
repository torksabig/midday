import { describe, expect, test } from "bun:test";
import {
  postOnboardTeam,
  teamJobsDelegationTarget,
} from "./team-jobs-delegate";

describe("teamJobsDelegationTarget", () => {
  test("stays off unless mode, url, and token are set", () => {
    expect(teamJobsDelegationTarget("onboard-team", {})).toBeNull();
    expect(
      teamJobsDelegationTarget("onboard-team", {
        MIDDAY_BACKEND_MODE: "legacy",
        REPLACEMENT_API_URL: "http://127.0.0.1:8787",
        MIDDAY_WORKER_TOKEN: "secret",
      }),
    ).toBeNull();
    expect(
      teamJobsDelegationTarget("onboard-team", {
        MIDDAY_BACKEND_MODE: "dual",
        REPLACEMENT_API_URL: "http://127.0.0.1:8787/",
        MIDDAY_WORKER_TOKEN: "secret",
      }),
    ).toEqual({
      mode: "dual",
      url: "http://127.0.0.1:8787/api/v1/workers/onboard-team",
      token: "secret",
    });
    expect(
      teamJobsDelegationTarget("onboard-team", {
        MIDDAY_BACKEND_MODE: "replacement",
        REPLACEMENT_API_URL: "http://rust",
        REPLACEMENT_DELEGATION_TOKEN: "tok",
      }),
    ).toEqual({
      mode: "replacement",
      url: "http://rust/api/v1/workers/onboard-team",
      token: "tok",
    });
  });
});

test("postOnboardTeam throws when rust is not ok", async () => {
  await expect(
    postOnboardTeam(
      { userId: "u" },
      { url: "http://x", token: "t" },
      async () => new Response("nope", { status: 500 }),
    ),
  ).rejects.toThrow("onboard-team rust failed: 500");
});

test("postOnboardTeam returns body on success", async () => {
  const body = await postOnboardTeam(
    { userId: "u" },
    { url: "http://x", token: "t" },
    async () =>
      new Response(
        JSON.stringify({
          executed: true,
          user: {
            id: "u",
            fullName: "Ada",
            email: "ada@example.com",
            teamId: "t",
          },
          shouldSendTrialEmail: true,
          bankConnectionCount: 0,
        }),
        { status: 200 },
      ),
  );
  expect(body.executed).toBe(true);
  expect(body.user?.fullName).toBe("Ada");
  expect(body.shouldSendTrialEmail).toBe(true);
  expect(body.bankConnectionCount).toBe(0);
});
