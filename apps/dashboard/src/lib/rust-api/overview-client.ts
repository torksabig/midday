"use client";

import { queryOptions } from "@tanstack/react-query";
import { getAccessToken } from "@/utils/session";
import { fetchOverviewSummary, overviewSummaryQueryKey } from "./overview";

function getRustApiUrl() {
  const url = process.env.NEXT_PUBLIC_RUST_API_URL;

  if (url) return url.replace(/\/$/, "");
  if (process.env.NODE_ENV !== "production") return "http://127.0.0.1:8787";

  throw new Error("NEXT_PUBLIC_RUST_API_URL must be configured");
}

export function overviewSummaryQueryOptions() {
  return queryOptions({
    queryKey: overviewSummaryQueryKey,
    queryFn: async () =>
      fetchOverviewSummary(getRustApiUrl(), await getAccessToken()),
  });
}
