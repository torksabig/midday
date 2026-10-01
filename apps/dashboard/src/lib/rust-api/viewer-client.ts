"use client";

import { queryOptions } from "@tanstack/react-query";
import { getAccessToken } from "@/utils/session";
import { type DashboardViewer, fetchViewer, viewerQueryKey } from "./viewer";

function getRustApiUrl() {
  const url = process.env.NEXT_PUBLIC_RUST_API_URL;

  if (url) return url.replace(/\/$/, "");
  if (process.env.NODE_ENV !== "production") return "http://127.0.0.1:8787";

  throw new Error("NEXT_PUBLIC_RUST_API_URL must be configured");
}

async function fetchBrowserViewer(): Promise<DashboardViewer> {
  const accessToken = await getAccessToken();
  return fetchViewer(getRustApiUrl(), accessToken);
}

export function viewerQueryOptions() {
  return queryOptions({
    queryKey: viewerQueryKey,
    queryFn: fetchBrowserViewer,
    staleTime: 6 * 60 * 60 * 1000,
  });
}
