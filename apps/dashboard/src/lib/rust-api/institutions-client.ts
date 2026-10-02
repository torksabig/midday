"use client";

import { type QueryKey, queryOptions } from "@tanstack/react-query";
import { getAccessToken } from "@/utils/session";
import {
  type Institution,
  type InstitutionsListParams,
  fetchInstitutions,
  updateInstitutionUsage,
} from "./institutions";

function getRustApiUrl() {
  const url = process.env.NEXT_PUBLIC_RUST_API_URL;

  if (url) return url.replace(/\/$/, "");
  if (process.env.NODE_ENV !== "production") return "http://127.0.0.1:8787";

  throw new Error("NEXT_PUBLIC_RUST_API_URL must be configured");
}

export function institutionsQueryOptions(
  queryKey: QueryKey,
  params: InstitutionsListParams,
  options: { enabled?: boolean } = {},
) {
  return queryOptions<Institution[]>({
    queryKey,
    queryFn: async () =>
      fetchInstitutions(getRustApiUrl(), await getAccessToken(), params),
    enabled: options.enabled,
  });
}

export async function updateInstitutionUsageFromRust(id: string) {
  return updateInstitutionUsage(getRustApiUrl(), await getAccessToken(), id);
}
