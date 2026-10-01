"use client";

import { queryOptions } from "@tanstack/react-query";
import { getAccessToken } from "@/utils/session";
import {
  type DashboardTeam,
  fetchCurrentTeam,
  teamCurrentQueryKey,
} from "./team";

function getRustApiUrl() {
  const url = process.env.NEXT_PUBLIC_RUST_API_URL;

  if (url) return url.replace(/\/$/, "");
  if (process.env.NODE_ENV !== "production") return "http://127.0.0.1:8787";

  throw new Error("NEXT_PUBLIC_RUST_API_URL must be configured");
}

async function fetchBrowserCurrentTeam(): Promise<DashboardTeam> {
  const accessToken = await getAccessToken();
  return fetchCurrentTeam(getRustApiUrl(), accessToken);
}

export function teamCurrentQueryOptions() {
  return queryOptions({
    queryKey: teamCurrentQueryKey,
    queryFn: fetchBrowserCurrentTeam,
    staleTime: 6 * 60 * 60 * 1000,
  });
}
