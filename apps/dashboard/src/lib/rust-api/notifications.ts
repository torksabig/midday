import type { components } from "./openapi.generated";
import { RustApiError } from "./overview";

type RawNotificationsList = components["schemas"]["NotificationsListResponse"];
type RawNotificationActivity = components["schemas"]["NotificationActivity"];

export type NotificationStatus = "unread" | "read" | "archived";

export type NotificationActivity = Omit<
  RawNotificationActivity,
  "groupId" | "lastUsedAt" | "metadata" | "status" | "userId"
> & {
  groupId: string | null;
  lastUsedAt: string | null;
  metadata: Record<string, unknown>;
  status: NotificationStatus;
  userId: string | null;
};

export type NotificationsList = {
  meta: {
    cursor: string | null;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
  data: NotificationActivity[];
};

export type NotificationsListParams = {
  cursor?: string | null;
  pageSize?: number;
  status?:
    | "unread"
    | "read"
    | "archived"
    | Array<"unread" | "read" | "archived">
    | null;
  userId?: string | null;
  priority?: number | null;
  maxPriority?: number | null;
  createdAfter?: string | null;
};

function buildNotificationsListQuery(params: NotificationsListParams): string {
  const search = new URLSearchParams();

  if (params.cursor) search.set("cursor", params.cursor);
  if (params.pageSize != null) search.set("pageSize", String(params.pageSize));
  if (params.status) {
    // Clone/axum Query uses serde_urlencoded, which rejects repeated keys for Vec.
    // Send a single comma-separated value instead of `status=a&status=b`.
    const statuses = Array.isArray(params.status)
      ? params.status
      : [params.status];
    search.set("status", statuses.join(","));
  }
  if (params.userId) search.set("userId", params.userId);
  if (params.priority != null) search.set("priority", String(params.priority));
  if (params.maxPriority != null) {
    search.set("maxPriority", String(params.maxPriority));
  }
  if (params.createdAfter) search.set("createdAfter", params.createdAfter);

  const query = search.toString();
  return query ? `?${query}` : "";
}

function normalizeNotificationActivity(
  activity: RawNotificationActivity,
): NotificationActivity {
  return {
    ...activity,
    groupId: activity.groupId ?? null,
    lastUsedAt: activity.lastUsedAt ?? null,
    metadata:
      activity.metadata && typeof activity.metadata === "object"
        ? (activity.metadata as Record<string, unknown>)
        : {},
    status: activity.status as NotificationStatus,
    userId: activity.userId ?? null,
  };
}

function normalizeNotificationsList(
  payload: RawNotificationsList,
): NotificationsList {
  return {
    meta: {
      cursor: payload.meta.cursor ?? null,
      hasPreviousPage: payload.meta.hasPreviousPage,
      hasNextPage: payload.meta.hasNextPage,
    },
    data: payload.data.map(normalizeNotificationActivity),
  };
}

export async function fetchNotificationsList(
  baseUrl: string,
  accessToken: string | null,
  params: NotificationsListParams,
): Promise<NotificationsList> {
  if (!accessToken) throw new RustApiError(401, "Missing authorization token");

  const response = await fetch(
    `${baseUrl}/api/v1/notifications${buildNotificationsListQuery(params)}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      signal: AbortSignal.timeout(8_000),
    },
  );

  if (!response.ok) {
    throw new RustApiError(
      response.status,
      `Rust API request failed with HTTP ${response.status}`,
    );
  }

  return normalizeNotificationsList(
    (await response.json()) as RawNotificationsList,
  );
}

async function putNotificationStatus(
  url: string,
  accessToken: string | null,
  status: NotificationStatus,
): Promise<Response> {
  if (!accessToken) throw new RustApiError(401, "Missing authorization token");

  return fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
    signal: AbortSignal.timeout(8_000),
  });
}

export async function updateNotificationStatus(
  baseUrl: string,
  accessToken: string | null,
  activityId: string,
  status: NotificationStatus,
): Promise<NotificationActivity> {
  const response = await putNotificationStatus(
    `${baseUrl}/api/v1/notifications/${encodeURIComponent(activityId)}/status`,
    accessToken,
    status,
  );

  if (!response.ok) {
    throw new RustApiError(
      response.status,
      `Rust API request failed with HTTP ${response.status}`,
    );
  }

  return normalizeNotificationActivity(
    (await response.json()) as RawNotificationActivity,
  );
}

export async function updateAllNotificationStatus(
  baseUrl: string,
  accessToken: string | null,
  status: NotificationStatus,
): Promise<NotificationActivity[]> {
  const response = await putNotificationStatus(
    `${baseUrl}/api/v1/notifications/status`,
    accessToken,
    status,
  );

  if (!response.ok) {
    throw new RustApiError(
      response.status,
      `Rust API request failed with HTTP ${response.status}`,
    );
  }

  const payload = (await response.json()) as RawNotificationActivity[];
  return payload.map(normalizeNotificationActivity);
}
