import type { DelegationFetch } from "./delegation-fetch";

export type NotificationWorkerUser = {
  id: string;
  full_name?: string | null;
  email: string;
  locale?: string;
  avatar_url?: string | null;
  team_id: string;
  role?: "owner" | "member" | string;
};

export type NotificationWorkerTeam = {
  id: string;
  name: string;
  inboxId: string;
};

export type NotificationWorkerBody = {
  executed: boolean;
  type: string;
  teamId: string;
  activities: number;
  sendEmail: boolean;
  team: NotificationWorkerTeam;
  users: NotificationWorkerUser[];
};

export function notificationDelegationTarget(
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
    url: `${base}/api/v1/workers/notification`,
    token,
  };
}

export async function postNotificationWorker(
  payload: {
    type: string;
    teamId: string;
    sendEmail?: boolean;
    priority?: number;
    [key: string]: unknown;
  },
  target: { url: string; token: string },
  fetchImpl: DelegationFetch = fetch,
): Promise<NotificationWorkerBody> {
  const response = await fetchImpl(target.url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${target.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(`notification rust failed: ${response.status}`);
  }
  return (await response.json()) as NotificationWorkerBody;
}
