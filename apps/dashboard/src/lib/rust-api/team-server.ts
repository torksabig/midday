import "server-only";

import { type QueryKey, queryOptions } from "@tanstack/react-query";
import { getServerRequestContext } from "@/trpc/request-context";
import {
  fetchCurrentTeam,
  fetchTeamInvites,
  fetchTeamList,
  fetchTeamMembers,
  fetchUserInvites,
  type TeamInvite,
  type TeamListItem,
  type TeamMember,
  teamCurrentQueryKey,
  type UserInvite,
} from "./team";

function getRustApiUrl() {
  const url =
    process.env.RUST_API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_RUST_API_URL;

  if (url) return url.replace(/\/$/, "");
  if (process.env.NODE_ENV !== "production") return "http://127.0.0.1:8787";

  throw new Error("RUST_API_INTERNAL_URL must be configured");
}

export function teamCurrentServerQueryOptions() {
  return queryOptions({
    queryKey: teamCurrentQueryKey,
    queryFn: async () => {
      const { session } = await getServerRequestContext();
      return fetchCurrentTeam(getRustApiUrl(), session?.access_token ?? null);
    },
    staleTime: 6 * 60 * 60 * 1000,
  });
}

export function teamMembersServerQueryOptions(queryKey: QueryKey) {
  return queryOptions({
    queryKey,
    queryFn: async (): Promise<TeamMember[]> => {
      const { session } = await getServerRequestContext();
      return fetchTeamMembers(getRustApiUrl(), session?.access_token ?? null);
    },
  });
}

export function teamListServerQueryOptions(queryKey: QueryKey) {
  return queryOptions({
    queryKey,
    queryFn: async (): Promise<TeamListItem[]> => {
      const { session } = await getServerRequestContext();
      return fetchTeamList(getRustApiUrl(), session?.access_token ?? null);
    },
  });
}

export function userInvitesServerQueryOptions(queryKey: QueryKey) {
  return queryOptions({
    queryKey,
    queryFn: async (): Promise<UserInvite[]> => {
      const { session } = await getServerRequestContext();
      return fetchUserInvites(getRustApiUrl(), session?.access_token ?? null);
    },
  });
}

export function teamInvitesServerQueryOptions(queryKey: QueryKey) {
  return queryOptions({
    queryKey,
    queryFn: async (): Promise<TeamInvite[]> => {
      const { session } = await getServerRequestContext();
      return fetchTeamInvites(getRustApiUrl(), session?.access_token ?? null);
    },
  });
}
