import type { DelegationFetch } from "./delegation-fetch";
export type OnboardTeamRustBody = {
  executed: boolean;
  user: {
    id: string;
    fullName: string | null;
    email: string | null;
    teamId: string | null;
  } | null;
  shouldSendTrialEmail: boolean;
  bankConnectionCount: number;
};

export type TeamJobsJob = "onboard-team";

export function teamJobsDelegationTarget(
  job: TeamJobsJob,
  env: NodeJS.ProcessEnv = process.env,
): { mode: "dual" | "replacement"; url: string; token: string } | null {
  const mode = env.MIDDAY_BACKEND_MODE?.trim();
  const base = env.REPLACEMENT_API_URL?.trim().replace(/\/$/, "");
  const token = (
    env.MIDDAY_WORKER_TOKEN ||
    env.REPLACEMENT_DELEGATION_TOKEN ||
    ""
  ).trim();
  if ((mode !== "dual" && mode !== "replacement") || !base || !token) {
    return null;
  }
  return {
    mode,
    url: `${base}/api/v1/workers/${job}`,
    token,
  };
}

export async function postOnboardTeam(
  payload: { userId: string },
  target: { url: string; token: string },
  fetchImpl: DelegationFetch = fetch,
): Promise<OnboardTeamRustBody> {
  const response = await fetchImpl(target.url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${target.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(`onboard-team rust failed: ${response.status}`);
  }
  return (await response.json()) as OnboardTeamRustBody;
}
