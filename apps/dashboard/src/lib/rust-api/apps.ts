import { RustApiError } from "./overview";

/** Legacy `apps.get` uses snake_case `app_id` — preserve it. */
export type InstalledApp = {
  app_id: string;
  settings?: unknown;
  config?: unknown;
  [key: string]: unknown;
};

export type AuthorizedOAuthApp = Record<string, unknown>;

export type UpdateAppSettingsInput = {
  appId: string;
  option: {
    id: string;
    value: string | number | boolean;
  };
};

export type DisconnectAppInput = {
  appId: string;
};

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
    signal: init?.signal ?? AbortSignal.timeout(8_000),
  });
}

export async function fetchAppById(
  baseUrl: string,
  accessToken: string | null,
  appId: string,
): Promise<InstalledApp | null> {
  if (!accessToken) throw new RustApiError(401, "Missing authorization token");

  const response = await rustFetch(
    `${baseUrl}/api/v1/apps/${encodeURIComponent(appId)}`,
    accessToken,
  );

  if (response.status === 404) return null;

  if (!response.ok) {
    throw new RustApiError(
      response.status,
      `Rust API request failed with HTTP ${response.status}`,
    );
  }

  return (await response.json()) as InstalledApp;
}

export async function fetchApps(
  baseUrl: string,
  accessToken: string | null,
): Promise<InstalledApp[]> {
  if (!accessToken) throw new RustApiError(401, "Missing authorization token");

  const response = await rustFetch(`${baseUrl}/api/v1/apps`, accessToken);

  if (!response.ok) {
    throw new RustApiError(
      response.status,
      `Rust API request failed with HTTP ${response.status}`,
    );
  }

  return (await response.json()) as InstalledApp[];
}

export async function disconnectApp(
  baseUrl: string,
  accessToken: string | null,
  input: DisconnectAppInput,
): Promise<InstalledApp | null> {
  if (!accessToken) throw new RustApiError(401, "Missing authorization token");

  const response = await rustFetch(
    `${baseUrl}/api/v1/apps/${encodeURIComponent(input.appId)}`,
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

  return (await response.json()) as InstalledApp;
}

export async function updateAppSettings(
  baseUrl: string,
  accessToken: string | null,
  input: UpdateAppSettingsInput,
): Promise<InstalledApp> {
  if (!accessToken) throw new RustApiError(401, "Missing authorization token");

  const response = await rustFetch(
    `${baseUrl}/api/v1/apps/${encodeURIComponent(input.appId)}/settings`,
    accessToken,
    {
      method: "PUT",
      body: JSON.stringify({ option: input.option }),
    },
  );

  if (!response.ok) {
    throw new RustApiError(
      response.status,
      `Rust API request failed with HTTP ${response.status}`,
    );
  }

  return (await response.json()) as InstalledApp;
}

export type CreatePlatformLinkTokenInput = {
  provider: string;
};

export type PlatformLinkToken = {
  id: string;
  code: string;
  provider: string;
  teamId?: string | null;
  userId?: string | null;
  expiresAt?: string | null;
  usedAt?: string | null;
  createdAt?: string | null;
  [key: string]: unknown;
};

function snakeToCamelKey(key: string): string {
  return key.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());
}

function deepCamelCaseKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(deepCamelCaseKeys);
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

export function normalizePlatformLinkToken(
  payload: unknown,
): PlatformLinkToken {
  return deepCamelCaseKeys(payload) as PlatformLinkToken;
}

/** Midday `apps.createPlatformLinkToken`. */
export async function createPlatformLinkToken(
  baseUrl: string,
  accessToken: string | null,
  input: CreatePlatformLinkTokenInput,
): Promise<PlatformLinkToken> {
  if (!accessToken) throw new RustApiError(401, "Missing authorization token");

  const response = await rustFetch(
    `${baseUrl}/api/v1/apps/platform-link-tokens`,
    accessToken,
    {
      method: "POST",
      body: JSON.stringify({ provider: input.provider }),
    },
  );

  if (!response.ok) {
    throw new RustApiError(
      response.status,
      `Rust API request failed with HTTP ${response.status}`,
    );
  }

  return normalizePlatformLinkToken(await response.json());
}
