import { RustApiError } from "./overview";

export type InstitutionsListParams = {
  countryCode: string;
  q?: string | null;
  limit?: number;
  excludeProviders?: string | null;
};

export type Institution = {
  id: string;
  name?: string | null;
  logo?: string | null;
  popularity?: number | null;
  availableHistory?: number | null;
  maximumConsentValidity?: number | null;
  provider?: string | null;
  type?: string | null;
  country?: string | null;
  [key: string]: unknown;
};

export function buildInstitutionsListQuery(
  params: InstitutionsListParams,
): string {
  const search = new URLSearchParams();
  search.set("countryCode", params.countryCode);
  if (params.q != null) search.set("q", params.q);
  if (params.limit != null) search.set("limit", String(params.limit));
  if (params.excludeProviders) {
    search.set("excludeProviders", params.excludeProviders);
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

export async function fetchInstitutions(
  baseUrl: string,
  accessToken: string | null,
  params: InstitutionsListParams,
): Promise<Institution[]> {
  if (!accessToken) throw new RustApiError(401, "Missing authorization token");

  const response = await rustFetch(
    `${baseUrl}/api/v1/institutions${buildInstitutionsListQuery(params)}`,
    accessToken,
  );

  if (!response.ok) {
    throw new RustApiError(
      response.status,
      `Rust API request failed with HTTP ${response.status}`,
    );
  }

  return (await response.json()) as Institution[];
}

export async function updateInstitutionUsage(
  baseUrl: string,
  accessToken: string | null,
  id: string,
): Promise<Institution | null> {
  if (!accessToken) throw new RustApiError(401, "Missing authorization token");

  const response = await rustFetch(
    `${baseUrl}/api/v1/institutions/${encodeURIComponent(id)}`,
    accessToken,
    { method: "POST" },
  );

  if (response.status === 404) return null;

  if (!response.ok) {
    throw new RustApiError(
      response.status,
      `Rust API request failed with HTTP ${response.status}`,
    );
  }

  return (await response.json()) as Institution;
}
