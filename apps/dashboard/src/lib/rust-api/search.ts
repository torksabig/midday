import type { components } from "./openapi.generated";
import { RustApiError } from "./overview";

type RawGlobalSearchRow = components["schemas"]["GlobalSearchRow"];

export type GlobalSearchParams = {
  searchTerm?: string | null;
  language?: string | null;
  limit?: number | null;
  itemsPerTableLimit?: number | null;
  relevanceThreshold?: number | null;
};

/** Matches façade / tRPC shape (`created_at` stays snake_case). */
export type GlobalSearchRow = {
  id: string;
  type: string;
  title: string;
  relevance: number;
  created_at: string;
  data: unknown;
};

export function buildGlobalSearchQuery(params: GlobalSearchParams): string {
  const search = new URLSearchParams();

  if (params.searchTerm != null && params.searchTerm !== "") {
    search.set("searchTerm", params.searchTerm);
  }
  if (params.language) search.set("language", params.language);
  if (params.limit != null) search.set("limit", String(params.limit));
  if (params.itemsPerTableLimit != null) {
    search.set("itemsPerTableLimit", String(params.itemsPerTableLimit));
  }
  if (params.relevanceThreshold != null) {
    search.set("relevanceThreshold", String(params.relevanceThreshold));
  }

  const query = search.toString();
  return query ? `?${query}` : "";
}

export function normalizeGlobalSearchRows(
  payload: RawGlobalSearchRow[],
): GlobalSearchRow[] {
  return (payload ?? []).map((row) => ({
    id: row.id,
    type: row.type,
    title: row.title,
    relevance: row.relevance,
    created_at: row.created_at,
    data: row.data,
  }));
}

export async function fetchGlobalSearch(
  baseUrl: string,
  accessToken: string | null,
  params: GlobalSearchParams = {},
): Promise<GlobalSearchRow[]> {
  if (!accessToken) throw new RustApiError(401, "Missing authorization token");

  const response = await fetch(
    `${baseUrl}/api/v1/search/global${buildGlobalSearchQuery(params)}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      signal: AbortSignal.timeout(15_000),
    },
  );

  if (!response.ok) {
    throw new RustApiError(
      response.status,
      `Rust API request failed with HTTP ${response.status}`,
    );
  }

  return normalizeGlobalSearchRows(
    (await response.json()) as RawGlobalSearchRow[],
  );
}
