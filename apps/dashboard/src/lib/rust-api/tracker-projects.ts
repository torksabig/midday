import { RustApiError } from "./overview";
import { deepCamelCaseKeys } from "./tracker-entries";

export type TrackerProjectsListParams = {
  cursor?: string | null;
  pageSize?: number | null;
  q?: string | null;
  start?: string | null;
  end?: string | null;
  status?: "in_progress" | "completed" | null;
  customers?: string[] | null;
  tags?: string[] | null;
  sort?: string[] | null;
};

export type TrackerProject = {
  id: string;
  name?: string | null;
  description?: string | null;
  status?: string | null;
  customerId?: string | null;
  estimate?: number | null;
  currency?: string | null;
  billable?: boolean | null;
  rate?: number | null;
  customer?: {
    id?: string | null;
    name?: string | null;
    website?: string | null;
  } | null;
  tags?: Array<{ id?: string | null; name?: string | null; [key: string]: unknown }>;
  [key: string]: any;
};

export type TrackerProjectsList = {
  meta: {
    cursor?: string;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
  data: TrackerProject[];
};

export type UpsertTrackerProjectInput = {
  id?: string;
  name: string;
  description?: string | null;
  estimate?: number | null;
  billable?: boolean | null;
  rate?: number | null;
  currency?: string | null;
  customerId?: string | null;
  status?: "in_progress" | "completed" | null;
  tags?: Array<{ id: string; value?: string }> | null;
};

export type DeleteTrackerProjectInput = {
  id: string;
};

export function buildTrackerProjectsListQuery(
  params: TrackerProjectsListParams,
): string {
  const search = new URLSearchParams();
  if (params.cursor) search.set("cursor", params.cursor);
  if (params.pageSize != null) search.set("pageSize", String(params.pageSize));
  if (params.q) search.set("q", params.q);
  if (params.start) search.set("start", params.start);
  if (params.end) search.set("end", params.end);
  if (params.status) search.set("status", params.status);
  for (const v of params.customers ?? []) {
    if (v) search.append("customers", v);
  }
  for (const v of params.tags ?? []) {
    if (v) search.append("tags", v);
  }
  for (const v of params.sort ?? []) {
    if (v) search.append("sort", v);
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export function normalizeTrackerProjectsList(
  payload: unknown,
): TrackerProjectsList {
  const camel = deepCamelCaseKeys(payload) as {
    meta?: {
      cursor?: string | null;
      hasPreviousPage?: boolean;
      hasNextPage?: boolean;
    };
    data?: TrackerProject[];
  };
  return {
    meta: {
      cursor: camel.meta?.cursor ?? undefined,
      hasPreviousPage: camel.meta?.hasPreviousPage ?? false,
      hasNextPage: camel.meta?.hasNextPage ?? false,
    },
    data: camel.data ?? [],
  };
}

export function normalizeTrackerProject(
  payload: unknown,
): TrackerProject | null {
  if (payload == null) return null;
  return deepCamelCaseKeys(payload) as TrackerProject;
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

export async function fetchTrackerProjectsList(
  baseUrl: string,
  accessToken: string | null,
  params: TrackerProjectsListParams = {},
): Promise<TrackerProjectsList> {
  if (!accessToken) throw new RustApiError(401, "Missing authorization token");

  const response = await rustFetch(
    `${baseUrl}/api/v1/tracker/projects${buildTrackerProjectsListQuery(params)}`,
    accessToken,
  );

  if (!response.ok) {
    throw new RustApiError(
      response.status,
      `Rust API request failed with HTTP ${response.status}`,
    );
  }

  return normalizeTrackerProjectsList(await response.json());
}

export async function fetchTrackerProjectById(
  baseUrl: string,
  accessToken: string | null,
  id: string,
): Promise<TrackerProject | null> {
  if (!accessToken) throw new RustApiError(401, "Missing authorization token");

  const response = await rustFetch(
    `${baseUrl}/api/v1/tracker/projects/${encodeURIComponent(id)}`,
    accessToken,
  );

  if (response.status === 404) return null;

  if (!response.ok) {
    throw new RustApiError(
      response.status,
      `Rust API request failed with HTTP ${response.status}`,
    );
  }

  return normalizeTrackerProject(await response.json());
}

export async function upsertTrackerProject(
  baseUrl: string,
  accessToken: string | null,
  input: UpsertTrackerProjectInput,
): Promise<TrackerProject> {
  if (!accessToken) throw new RustApiError(401, "Missing authorization token");

  const response = await rustFetch(
    `${baseUrl}/api/v1/tracker/projects`,
    accessToken,
    {
      method: "POST",
      body: JSON.stringify({
        id: input.id,
        name: input.name,
        description: input.description,
        estimate: input.estimate,
        billable: input.billable,
        rate: input.rate,
        currency: input.currency,
        customerId: input.customerId,
        tags: input.tags,
      }),
    },
  );

  if (!response.ok) {
    throw new RustApiError(
      response.status,
      `Rust API request failed with HTTP ${response.status}`,
    );
  }

  return normalizeTrackerProject(await response.json()) as TrackerProject;
}

export async function deleteTrackerProject(
  baseUrl: string,
  accessToken: string | null,
  input: DeleteTrackerProjectInput,
): Promise<{ id: string } | null> {
  if (!accessToken) throw new RustApiError(401, "Missing authorization token");

  const response = await rustFetch(
    `${baseUrl}/api/v1/tracker/projects/${encodeURIComponent(input.id)}`,
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
