"use client";

import { type QueryKey, queryOptions } from "@tanstack/react-query";
import { getAccessToken } from "@/utils/session";
import {
  type GlobalSearchParams,
  type GlobalSearchRow,
  fetchGlobalSearch,
} from "./search";

function getRustApiUrl() {
  const url = process.env.NEXT_PUBLIC_RUST_API_URL;

  if (url) return url.replace(/\/$/, "");
  if (process.env.NODE_ENV !== "production") return "http://127.0.0.1:8787";

  throw new Error("NEXT_PUBLIC_RUST_API_URL must be configured");
}

export function globalSearchQueryOptions(
  queryKey: QueryKey,
  params: GlobalSearchParams = {},
) {
  return queryOptions<GlobalSearchRow[]>({
    queryKey,
    queryFn: async () =>
      fetchGlobalSearch(getRustApiUrl(), await getAccessToken(), params),
  });
}
