"use client";

import { type QueryKey, queryOptions } from "@tanstack/react-query";
import { getAccessToken } from "@/utils/session";
import {
  acceptTeamInvite,
  type AcceptTeamInviteInput,
  type DashboardTeam,
  declineTeamInvite,
  type DeclineTeamInviteInput,
  deleteTeamInvite,
  type DeleteTeamInviteInput,
  deleteTeamMember,
  type DeleteTeamMemberInput,
  fetchCurrentTeam,
  fetchTeamConnectionStatus,
  fetchTeamInvites,
  fetchTeamList,
  fetchTeamMembers,
  fetchUserInvites,
  type TeamConnectionStatus,
  type TeamInvite,
  type TeamListItem,
  type TeamMember,
  teamCurrentQueryKey,
  type UpdateTeamInput,
  updateTeam,
  updateTeamMember,
  type UpdateTeamMemberInput,
  type UserInvite,
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

export function teamConnectionStatusQueryOptions(
  queryKey: QueryKey,
  options: {
    enabled?: boolean;
    staleTime?: number;
    refetchOnWindowFocus?: boolean;
  } = {},
) {
  return queryOptions<TeamConnectionStatus>({
    queryKey,
    queryFn: async () =>
      fetchTeamConnectionStatus(getRustApiUrl(), await getAccessToken()),
    enabled: options.enabled,
    staleTime: options.staleTime,
    refetchOnWindowFocus: options.refetchOnWindowFocus,
  });
}

export function userInvitesQueryOptions(queryKey: QueryKey) {
  return queryOptions<UserInvite[]>({
    queryKey,
    queryFn: async () =>
      fetchUserInvites(getRustApiUrl(), await getAccessToken()),
  });
}

export function teamInvitesQueryOptions(queryKey: QueryKey) {
  return queryOptions<TeamInvite[]>({
    queryKey,
    queryFn: async () =>
      fetchTeamInvites(getRustApiUrl(), await getAccessToken()),
  });
}

export async function updateTeamFromRust(input: UpdateTeamInput) {
  return updateTeam(getRustApiUrl(), await getAccessToken(), input);
}

export async function acceptTeamInviteFromRust(input: AcceptTeamInviteInput) {
  return acceptTeamInvite(getRustApiUrl(), await getAccessToken(), input);
}

export async function declineTeamInviteFromRust(input: DeclineTeamInviteInput) {
  return declineTeamInvite(getRustApiUrl(), await getAccessToken(), input);
}

export async function deleteTeamInviteFromRust(input: DeleteTeamInviteInput) {
  return deleteTeamInvite(getRustApiUrl(), await getAccessToken(), input);
}

export async function updateTeamMemberFromRust(input: UpdateTeamMemberInput) {
  return updateTeamMember(getRustApiUrl(), await getAccessToken(), input);
}

export async function deleteTeamMemberFromRust(input: DeleteTeamMemberInput) {
  return deleteTeamMember(getRustApiUrl(), await getAccessToken(), input);
}
