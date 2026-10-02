import { RustApiError } from "./overview";

export type TrackerTimerParams = {
  assignedId?: string | null;
};

export type TrackerEntriesByRangeParams = {
  from: string;
  to: string;
  projectId?: string | null;
};

export type TrackerEntriesByDateParams = {
  date: string;
  projectId?: string | null;
};

export type StartTrackerTimerInput = {
  projectId: string;
  assignedId?: string | null;
  description?: string | null;
  start?: string;
};

export type StopTrackerTimerInput = {
  entryId?: string;
  assignedId?: string | null;
  stop?: string;
};

export type TrackerBillableHoursParams = {
  date: string;
  view: "week" | "month";
  weekStartsOnMonday?: boolean;
};

export type UpsertTrackerEntriesInput = {
  id?: string;
  start: string;
  stop: string;
  dates: string[];
  assignedId?: string | null;
  projectId: string;
  description?: string | null;
  duration: number;
};

export type DeleteTrackerEntryInput = {
  id: string;
};

export type TrackerBillableHours = {
  totalDuration?: number;
  totalAmount?: number;
  earningsByCurrency?: Record<string, number>;
  projectBreakdown?: unknown[];
  currency?: string;
  [key: string]: unknown;
};

export type TrackerTimerStatus = {
  isRunning: boolean;
  elapsedTime: number;
  currentEntry?: {
    id?: string;
    start?: string;
    description?: string | null;
    projectId?: string | null;
    trackerProject?: {
      id?: string | null;
      name?: string | null;
    } | null;
    [key: string]: unknown;
  } | null;
  [key: string]: unknown;
};

export type TrackerEntry = {
  id: string;
  [key: string]: any;
};

export type TrackerEntriesByRange = {
  meta?: {
    totalDuration?: number;
    totalAmount?: number;
    from?: string;
    to?: string;
    [key: string]: unknown;
  };
  result?: Record<string, TrackerEntry[]>;
  [key: string]: unknown;
};

export type TrackerEntriesByDate = {
  meta?: {
    totalDuration?: number;
    [key: string]: unknown;
  };
  data?: TrackerEntry[];
  [key: string]: unknown;
};

function snakeToCamelKey(key: string): string {
  return key.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());
}

export function deepCamelCaseKeys(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(deepCamelCaseKeys);
  }
  if (value && typeof value === "object" && !(value instanceof Date)) {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, nested]) => [
        snakeToCamelKey(key),
        deepCamelCaseKeys(nested),
      ]),
    );
  }
  return value;
}

export function buildTrackerTimerQuery(params: TrackerTimerParams = {}): string {
  const search = new URLSearchParams();
  if (params.assignedId) search.set("assignedId", params.assignedId);
  const query = search.toString();
  return query ? `?${query}` : "";
}

export function buildTrackerEntriesByRangeQuery(
  params: TrackerEntriesByRangeParams,
): string {
  const search = new URLSearchParams();
  search.set("from", params.from);
  search.set("to", params.to);
  if (params.projectId) search.set("projectId", params.projectId);
  return `?${search.toString()}`;
}

export function buildTrackerEntriesByDateQuery(
  params: TrackerEntriesByDateParams,
): string {
  const search = new URLSearchParams();
  search.set("date", params.date);
  if (params.projectId) search.set("projectId", params.projectId);
  return `?${search.toString()}`;
}

export function buildTrackerBillableHoursQuery(
  params: TrackerBillableHoursParams,
): string {
  const search = new URLSearchParams();
  search.set("date", params.date);
  search.set("view", params.view);
  if (params.weekStartsOnMonday != null) {
    search.set("weekStartsOnMonday", String(params.weekStartsOnMonday));
  }
  return `?${search.toString()}`;
}

async function rustFetch(
  url: string,
  accessToken: string,
  init?: RequestInit,
): Promise<Response> {
  return fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
    signal: init?.signal ?? AbortSignal.timeout(15_000),
  });
}

export async function fetchTrackerTimerStatus(
  baseUrl: string,
  accessToken: string | null,
  params: TrackerTimerParams = {},
): Promise<TrackerTimerStatus> {
  if (!accessToken) throw new RustApiError(401, "Missing authorization token");

  const response = await rustFetch(
    `${baseUrl}/api/v1/tracker/timer/status${buildTrackerTimerQuery(params)}`,
    accessToken,
  );

  if (!response.ok) {
    throw new RustApiError(
      response.status,
      `Rust API request failed with HTTP ${response.status}`,
    );
  }

  return deepCamelCaseKeys(await response.json()) as TrackerTimerStatus;
}

export async function fetchTrackerCurrentTimer(
  baseUrl: string,
  accessToken: string | null,
  params: TrackerTimerParams = {},
): Promise<TrackerEntry | null> {
  if (!accessToken) throw new RustApiError(401, "Missing authorization token");

  const response = await rustFetch(
    `${baseUrl}/api/v1/tracker/timer/current${buildTrackerTimerQuery(params)}`,
    accessToken,
  );

  if (!response.ok) {
    throw new RustApiError(
      response.status,
      `Rust API request failed with HTTP ${response.status}`,
    );
  }

  const payload = await response.json();
  if (payload == null) return null;
  return deepCamelCaseKeys(payload) as TrackerEntry;
}

export async function fetchTrackerEntriesByRange(
  baseUrl: string,
  accessToken: string | null,
  params: TrackerEntriesByRangeParams,
): Promise<TrackerEntriesByRange> {
  if (!accessToken) throw new RustApiError(401, "Missing authorization token");

  const response = await rustFetch(
    `${baseUrl}/api/v1/tracker/entries/by-range${buildTrackerEntriesByRangeQuery(params)}`,
    accessToken,
  );

  if (!response.ok) {
    throw new RustApiError(
      response.status,
      `Rust API request failed with HTTP ${response.status}`,
    );
  }

  return deepCamelCaseKeys(await response.json()) as TrackerEntriesByRange;
}

export async function fetchTrackerEntriesByDate(
  baseUrl: string,
  accessToken: string | null,
  params: TrackerEntriesByDateParams,
): Promise<TrackerEntriesByDate> {
  if (!accessToken) throw new RustApiError(401, "Missing authorization token");

  const response = await rustFetch(
    `${baseUrl}/api/v1/tracker/entries/by-date${buildTrackerEntriesByDateQuery(params)}`,
    accessToken,
  );

  if (!response.ok) {
    throw new RustApiError(
      response.status,
      `Rust API request failed with HTTP ${response.status}`,
    );
  }

  return deepCamelCaseKeys(await response.json()) as TrackerEntriesByDate;
}

export async function startTrackerTimer(
  baseUrl: string,
  accessToken: string | null,
  input: StartTrackerTimerInput,
): Promise<TrackerEntry> {
  if (!accessToken) throw new RustApiError(401, "Missing authorization token");

  const response = await rustFetch(
    `${baseUrl}/api/v1/tracker/timer/start`,
    accessToken,
    {
      method: "POST",
      body: JSON.stringify({
        projectId: input.projectId,
        assignedId: input.assignedId ?? undefined,
        description: input.description ?? undefined,
        start: input.start,
      }),
    },
  );

  if (!response.ok) {
    throw new RustApiError(
      response.status,
      `Rust API request failed with HTTP ${response.status}`,
    );
  }

  return deepCamelCaseKeys(await response.json()) as TrackerEntry;
}

export async function stopTrackerTimer(
  baseUrl: string,
  accessToken: string | null,
  input: StopTrackerTimerInput = {},
): Promise<TrackerEntry> {
  if (!accessToken) throw new RustApiError(401, "Missing authorization token");

  const response = await rustFetch(
    `${baseUrl}/api/v1/tracker/timer/stop`,
    accessToken,
    {
      method: "POST",
      body: JSON.stringify({
        entryId: input.entryId,
        assignedId: input.assignedId ?? undefined,
        stop: input.stop,
      }),
    },
  );

  if (!response.ok) {
    throw new RustApiError(
      response.status,
      `Rust API request failed with HTTP ${response.status}`,
    );
  }

  return deepCamelCaseKeys(await response.json()) as TrackerEntry;
}

export async function fetchTrackerBillableHours(
  baseUrl: string,
  accessToken: string | null,
  params: TrackerBillableHoursParams,
): Promise<TrackerBillableHours> {
  if (!accessToken) throw new RustApiError(401, "Missing authorization token");

  const response = await rustFetch(
    `${baseUrl}/api/v1/tracker/billable-hours${buildTrackerBillableHoursQuery(params)}`,
    accessToken,
  );

  if (!response.ok) {
    throw new RustApiError(
      response.status,
      `Rust API request failed with HTTP ${response.status}`,
    );
  }

  return deepCamelCaseKeys(await response.json()) as TrackerBillableHours;
}

export async function upsertTrackerEntries(
  baseUrl: string,
  accessToken: string | null,
  input: UpsertTrackerEntriesInput,
): Promise<TrackerEntry[]> {
  if (!accessToken) throw new RustApiError(401, "Missing authorization token");

  const response = await rustFetch(
    `${baseUrl}/api/v1/tracker/entries/upsert`,
    accessToken,
    {
      method: "POST",
      body: JSON.stringify({
        id: input.id,
        start: input.start,
        stop: input.stop,
        dates: input.dates,
        assignedId: input.assignedId ?? undefined,
        projectId: input.projectId,
        description: input.description ?? undefined,
        duration: input.duration,
      }),
    },
  );

  if (!response.ok) {
    throw new RustApiError(
      response.status,
      `Rust API request failed with HTTP ${response.status}`,
    );
  }

  return deepCamelCaseKeys(await response.json()) as TrackerEntry[];
}

export async function deleteTrackerEntry(
  baseUrl: string,
  accessToken: string | null,
  input: DeleteTrackerEntryInput,
): Promise<{ id: string } | null> {
  if (!accessToken) throw new RustApiError(401, "Missing authorization token");

  const response = await rustFetch(
    `${baseUrl}/api/v1/tracker/entries/${encodeURIComponent(input.id)}`,
    accessToken,
    { method: "DELETE" },
  );

  if (response.status === 404) return null;

  if (!response.ok) {
    throw new RustApiError(
      response.status,
      `Rust API request failed with HTTP ${response.status}`,
    );
  }

  return deepCamelCaseKeys(await response.json()) as { id: string };
}
