"use client";

import { type QueryKey, queryOptions } from "@tanstack/react-query";
import { getAccessToken } from "@/utils/session";
import {
  type DashboardTeam,
  fetchCurrentTeam,
  fetchTeamList,
  fetchTeamMembers,
  type TeamListItem,
  type TeamMember,
  teamCurrentQueryKey,
  type UpdateTeamInput,
  updateTeam,
} from "./team";

function getRustApiUrl() {
  const url = process.env.NEXT_PUBLIC_RUST_API_URL;

  if (url) return url.replace(/\/$/, "");
  if (process.env.NODE_ENV !== "production") return "http://127.0.0.1:8787";

  throw new Error("NEXT_PUBLIC_RUST_API_URL must be configured");
}

async function fetchBrowserCurrentTeam(): Promise<DashboardTeam> {
  return fetchCurrentTeam(getRustApiUrl(), await getAccessToken());
}

async function fetchBrowserTeamMembers(): Promise<TeamMember[]> {
  return fetchTeamMembers(getRustApiUrl(), await getAccessToken());
}

async function fetchBrowserTeamList(): Promise<TeamListItem[]> {
  return fetchTeamList(getRustApiUrl(), await getAccessToken());
}

export function teamCurrentQueryOptions() {
  return queryOptions({
    queryKey: teamCurrentQueryKey,
    queryFn: fetchBrowserCurrentTeam,
    staleTime: 6 * 60 * 60 * 1000,
  });
}

export function teamMembersQueryOptions(queryKey: QueryKey) {
  return queryOptions<TeamMember[]>({
    queryKey,
    queryFn: fetchBrowserTeamMembers,
  });
}

export function teamListQueryOptions(queryKey: QueryKey) {
  return queryOptions<TeamListItem[]>({
    queryKey,
    queryFn: fetchBrowserTeamList,
  });
}

export async function updateTeamFromRust(input: UpdateTeamInput) {
  return updateTeam(getRustApiUrl(), await getAccessToken(), input);
}
