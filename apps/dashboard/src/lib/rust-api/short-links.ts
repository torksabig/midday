import { RustApiError } from "./overview";

export type ShortLink = {
  id?: string;
  shortId?: string;
  url?: string | null;
  teamId?: string | null;
  userId?: string | null;
  createdAt?: string | null;
  fileName?: string | null;
  teamName?: string | null;
  type?: string | null;
  size?: number | null;
  mimeType?: string | null;
  expiresAt?: string | null;
  [key: string]: unknown;
};

export type CreateShortLinkInput = {
  url: string;
  type?: string | null;
  fileName?: string | null;
  mimeType?: string | null;
  size?: number | null;
  expiresAt?: string | null;
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

/** Public route — no auth header required. */
export async function fetchShortLink(
  baseUrl: string,
  shortId: string,
): Promise<ShortLink | null> {
  const response = await fetch(
    `${baseUrl}/api/v1/short-links/${encodeURIComponent(shortId)}`,
    { signal: AbortSignal.timeout(8_000) },
  );

  if (response.status === 404) return null;

  if (!response.ok) {
    throw new RustApiError(
      response.status,
      `Rust API request failed with HTTP ${response.status}`,
    );
  }

  return deepCamelCaseKeys(await response.json()) as ShortLink;
}

export async function createShortLinkForUrl(
  baseUrl: string,
  accessToken: string | null,
  input: CreateShortLinkInput,
): Promise<ShortLink> {
  if (!accessToken) throw new RustApiError(401, "Missing authorization token");

  const response = await fetch(`${baseUrl}/api/v1/short-links`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      url: input.url,
      type: input.type,
      fileName: input.fileName,
      mimeType: input.mimeType,
      size: input.size,
      expiresAt: input.expiresAt,
    }),
    signal: AbortSignal.timeout(8_000),
  });

  if (!response.ok) {
    throw new RustApiError(
      response.status,
      `Rust API request failed with HTTP ${response.status}`,
    );
  }

  return deepCamelCaseKeys(await response.json()) as ShortLink;
}
