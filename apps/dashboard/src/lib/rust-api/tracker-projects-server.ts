import "server-only";

import {
  infiniteQueryOptions,
  type QueryKey,
  queryOptions,
} from "@tanstack/react-query";
import { getServerRequestContext } from "@/trpc/request-context";
import {
  type TrackerProject,
  type TrackerProjectsList,
  type TrackerProjectsListParams,
  fetchTrackerProjectById,
  fetchTrackerProjectsList,
} from "./tracker-projects";

function getRustApiUrl() {
  const url =
    process.env.RUST_API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_RUST_API_URL;

  if (url) return url.replace(/\/$/, "");
  if (process.env.NODE_ENV !== "production") return "http://127.0.0.1:8787";

  throw new Error("RUST_API_INTERNAL_URL must be configured");
}

export function trackerProjectsServerInfiniteQueryOptions(
  queryKey: QueryKey,
  params: TrackerProjectsListParams,
) {
  return infiniteQueryOptions({
    queryKey,
    queryFn: async ({ pageParam }): Promise<TrackerProjectsList> => {
      const { session } = await getServerRequestContext();
      return fetchTrackerProjectsList(
        getRustApiUrl(),
        session?.access_token ?? null,
        {
          ...params,
          cursor: pageParam ?? undefined,
        },
      );
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.meta.cursor ?? undefined,
  });
}

export function trackerProjectByIdServerQueryOptions(
  queryKey: QueryKey,
  id: string,
) {
  return queryOptions({
    queryKey,
    queryFn: async (): Promise<TrackerProject | null> => {
      const { session } = await getServerRequestContext();
      return fetchTrackerProjectById(
        getRustApiUrl(),
        session?.access_token ?? null,
        id,
      );
    },
  });
}
