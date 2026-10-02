"use client";

import { type QueryKey, queryOptions } from "@tanstack/react-query";
import { getAccessToken } from "@/utils/session";
import {
  type StartTrackerTimerInput,
  type StopTrackerTimerInput,
  type TrackerEntriesByDate,
  type TrackerEntriesByDateParams,
  type TrackerEntriesByRange,
  type TrackerEntriesByRangeParams,
  type TrackerEntry,
  type TrackerTimerParams,
  type TrackerTimerStatus,
  fetchTrackerCurrentTimer,
  fetchTrackerEntriesByDate,
  fetchTrackerEntriesByRange,
  fetchTrackerTimerStatus,
  startTrackerTimer,
  stopTrackerTimer,
} from "./tracker-entries";

function getRustApiUrl() {
  const url = process.env.NEXT_PUBLIC_RUST_API_URL;

  if (url) return url.replace(/\/$/, "");
  if (process.env.NODE_ENV !== "production") return "http://127.0.0.1:8787";

  throw new Error("NEXT_PUBLIC_RUST_API_URL must be configured");
}

export function trackerTimerStatusQueryOptions(
  queryKey: QueryKey,
  params: TrackerTimerParams = {},
  options: {
    enabled?: boolean;
    staleTime?: number;
    refetchInterval?:
      | number
      | false
      | ((query: { state: { data: TrackerTimerStatus | undefined } }) =>
          | number
          | false);
    refetchOnWindowFocus?: boolean;
  } = {},
) {
  return queryOptions<TrackerTimerStatus>({
    queryKey,
    queryFn: async () =>
      fetchTrackerTimerStatus(getRustApiUrl(), await getAccessToken(), params),
    enabled: options.enabled,
    staleTime: options.staleTime,
    refetchInterval: options.refetchInterval,
    refetchOnWindowFocus: options.refetchOnWindowFocus,
  });
}

export function trackerCurrentTimerQueryOptions(
  queryKey: QueryKey,
  params: TrackerTimerParams = {},
) {
  return queryOptions<TrackerEntry | null>({
    queryKey,
    queryFn: async () =>
      fetchTrackerCurrentTimer(getRustApiUrl(), await getAccessToken(), params),
  });
}

export function trackerEntriesByRangeQueryOptions(
  queryKey: QueryKey,
  params: TrackerEntriesByRangeParams,
) {
  return queryOptions<TrackerEntriesByRange>({
    queryKey,
    queryFn: async () =>
      fetchTrackerEntriesByRange(
        getRustApiUrl(),
        await getAccessToken(),
        params,
      ),
  });
}

export function trackerEntriesByDateQueryOptions(
  queryKey: QueryKey,
  params: TrackerEntriesByDateParams,
  options: { enabled?: boolean } = {},
) {
  return queryOptions<TrackerEntriesByDate>({
    queryKey,
    queryFn: async () =>
      fetchTrackerEntriesByDate(getRustApiUrl(), await getAccessToken(), params),
    enabled: options.enabled,
  });
}

export async function startTrackerTimerFromRust(input: StartTrackerTimerInput) {
  return startTrackerTimer(getRustApiUrl(), await getAccessToken(), input);
}

export async function stopTrackerTimerFromRust(
  input: StopTrackerTimerInput = {},
) {
  return stopTrackerTimer(getRustApiUrl(), await getAccessToken(), input);
}
