export type ActivityNotificationPendingBatch = {
  batchId: string;
  teamId: string;
  userId: string;
  provider: string;
  eventFamily: string;
  entries: Array<Record<string, unknown>>;
  identity: {
    id: string;
    provider: string;
    externalUserId: string;
    externalChannelId?: string | null;
    teamId: string;
    userId: string;
    metadata?: Record<string, unknown> | null;
  };
  app: {
    id: string;
    appId: string;
    teamId: string;
    config?: {
      access_token?: string;
      channel_id?: string;
      [key: string]: unknown;
    };
    settings?: Array<{ id: string; value: boolean | string | number }>;
  };
};

export type ActivityNotificationFlushClaimBody = {
  executed: boolean;
  skipped: number;
  pending: ActivityNotificationPendingBatch[];
  completed: number;
};

export type ActivityNotificationFlushCompletion = {
  batchId: string;
  identityId?: string;
  delivered: boolean;
  notificationContext?: Record<string, unknown> | null;
  identityMetadata?: Record<string, unknown> | null;
};

export type ActivityNotificationFlushCompleteBody = {
  executed: boolean;
  skipped: number;
  pending: ActivityNotificationPendingBatch[];
  completed: number;
};

export function activityNotificationFlushDelegationTarget(
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
    url: `${base}/api/v1/workers/activity-notification-flush`,
    token,
  };
}

export async function postActivityNotificationFlushClaim(
  target: { url: string; token: string },
  limit = 100,
  fetchImpl: typeof fetch = fetch,
): Promise<ActivityNotificationFlushClaimBody> {
  const response = await fetchImpl(target.url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${target.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ limit }),
  });
  if (!response.ok) {
    throw new Error(
      `activity-notification-flush rust claim failed: ${response.status}`,
    );
  }
  return (await response.json()) as ActivityNotificationFlushClaimBody;
}

export async function postActivityNotificationFlushComplete(
  completions: ActivityNotificationFlushCompletion[],
  target: { url: string; token: string },
  fetchImpl: typeof fetch = fetch,
): Promise<ActivityNotificationFlushCompleteBody> {
  const response = await fetchImpl(target.url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${target.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ completions }),
  });
  if (!response.ok) {
    throw new Error(
      `activity-notification-flush rust complete failed: ${response.status}`,
    );
  }
  return (await response.json()) as ActivityNotificationFlushCompleteBody;
}
