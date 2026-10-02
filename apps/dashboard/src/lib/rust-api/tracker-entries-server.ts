import "server-only";

import { type QueryKey, queryOptions } from "@tanstack/react-query";
import { getServerRequestContext } from "@/trpc/request-context";
import {
  type TrackerEntriesByRange,
  type TrackerEntriesByRangeParams,
  type TrackerTimerStatus,
  fetchTrackerEntriesByRange,
  fetchTrackerTimerStatus,
} from "./tracker-entries";

function getRustApiUrl() {
  const url =
    process.env.RUST_API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_RUST_API_URL;

  if (url) return url.replace(/\/$/, "");
  if (process.env.NODE_ENV !== "production") return "http://127.0.0.1:8787";

  throw new Error("RUST_API_INTERNAL_URL must be configured");
}

export function trackerTimerStatusServerQueryOptions(queryKey: QueryKey) {
  return queryOptions({
    queryKey,
    queryFn: async (): Promise<TrackerTimerStatus> => {
      const { session } = await getServerRequestContext();
      return fetchTrackerTimerStatus(
        getRustApiUrl(),
        session?.access_token ?? null,
      );
    },
  });
}

export function trackerEntriesByRangeServerQueryOptions(
  queryKey: QueryKey,
  params: TrackerEntriesByRangeParams,
) {
  return queryOptions({
    queryKey,
    queryFn: async (): Promise<TrackerEntriesByRange> => {
      const { session } = await getServerRequestContext();
      return fetchTrackerEntriesByRange(
        getRustApiUrl(),
        session?.access_token ?? null,
        params,
      );
    },
  });
}
