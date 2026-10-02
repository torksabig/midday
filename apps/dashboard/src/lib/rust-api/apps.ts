import { RustApiError } from "./overview";

/** Legacy `apps.get` uses snake_case `app_id` — preserve it. */
export type InstalledApp = {
  app_id: string;
  settings?: unknown;
  config?: unknown;
  [key: string]: unknown;
};

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
