"use client";

import {
  infiniteQueryOptions,
  type QueryKey,
  queryOptions,
} from "@tanstack/react-query";
import { getAccessToken } from "@/utils/session";
import {
  type DeleteTrackerProjectInput,
  deleteTrackerProject,
  type TrackerProject,
  type TrackerProjectsList,
  type TrackerProjectsListParams,
  type UpsertTrackerProjectInput,
  fetchTrackerProjectById,
  fetchTrackerProjectsList,
  upsertTrackerProject,
} from "./tracker-projects";

function getRustApiUrl() {
  const url = process.env.NEXT_PUBLIC_RUST_API_URL;

  if (url) return url.replace(/\/$/, "");
  if (process.env.NODE_ENV !== "production") return "http://127.0.0.1:8787";

  throw new Error("NEXT_PUBLIC_RUST_API_URL must be configured");
}

export function trackerProjectsInfiniteQueryOptions(
  queryKey: QueryKey,
  params: TrackerProjectsListParams,
) {
  return infiniteQueryOptions({
    queryKey,
    queryFn: async ({ pageParam }): Promise<TrackerProjectsList> =>
      fetchTrackerProjectsList(getRustApiUrl(), await getAccessToken(), {
        ...params,
        cursor: pageParam ?? undefined,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.meta.cursor ?? undefined,
  });
}

export function trackerProjectsQueryOptions(
  queryKey: QueryKey,
  params: TrackerProjectsListParams = {},
) {
  return queryOptions<TrackerProjectsList>({
    queryKey,
    queryFn: async () =>
      fetchTrackerProjectsList(getRustApiUrl(), await getAccessToken(), params),
  });
}

export function trackerProjectByIdQueryOptions(
  queryKey: QueryKey,
  id: string,
  options: {
    enabled?: boolean;
    staleTime?: number;
    placeholderData?: TrackerProject | (() => TrackerProject | undefined);
  } = {},
) {
  return queryOptions<TrackerProject | null>({
    queryKey,
    queryFn: async () =>
      fetchTrackerProjectById(getRustApiUrl(), await getAccessToken(), id),
    enabled: options.enabled,
    staleTime: options.staleTime,
    placeholderData: options.placeholderData,
  });
}

export async function upsertTrackerProjectFromRust(
  input: UpsertTrackerProjectInput,
) {
  return upsertTrackerProject(getRustApiUrl(), await getAccessToken(), input);
}

export async function fetchTrackerProjectByIdFromRust(id: string) {
  return fetchTrackerProjectById(getRustApiUrl(), await getAccessToken(), id);
}

export async function deleteTrackerProjectFromRust(
  input: DeleteTrackerProjectInput,
) {
  return deleteTrackerProject(getRustApiUrl(), await getAccessToken(), input);
}
