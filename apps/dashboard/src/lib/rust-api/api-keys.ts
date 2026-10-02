import { RustApiError } from "./overview";

export type ApiKeyUser = {
  id?: string | null;
  fullName?: string | null;
  avatarUrl?: string | null;
};

export type ApiKey = {
  id: string;
  name?: string | null;
  createdAt?: string | null;
  scopes?: unknown;
  lastUsedAt?: string | null;
  user?: ApiKeyUser | null;
  [key: string]: unknown;
};

export type DeleteApiKeyInput = {
  id: string;
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

export async function fetchApiKeys(
  baseUrl: string,
  accessToken: string | null,
): Promise<ApiKey[]> {
  if (!accessToken) throw new RustApiError(401, "Missing authorization token");

  const response = await rustFetch(`${baseUrl}/api/v1/api-keys`, accessToken);

  if (!response.ok) {
    throw new RustApiError(
      response.status,
      `Rust API request failed with HTTP ${response.status}`,
    );
  }

  // Rust already returns camelCase for this list.
  return (await response.json()) as ApiKey[];
}

export async function deleteApiKey(
  baseUrl: string,
  accessToken: string | null,
  input: DeleteApiKeyInput,
): Promise<{ keyHash?: string } | null> {
  if (!accessToken) throw new RustApiError(401, "Missing authorization token");

  const response = await rustFetch(
    `${baseUrl}/api/v1/api-keys/${encodeURIComponent(input.id)}`,
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

  return (await response.json()) as { keyHash?: string };
}
