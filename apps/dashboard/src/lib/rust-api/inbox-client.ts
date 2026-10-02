"use client";

import {
  infiniteQueryOptions,
  type QueryKey,
  queryOptions,
} from "@tanstack/react-query";
import { getAccessToken } from "@/utils/session";
import {
  fetchInboxById,
  fetchInboxByStatus,
  fetchInboxCheckAttachments,
  fetchInboxList,
  fetchInboxSearch,
  type InboxByStatusItem,
  type InboxByStatusParams,
  type InboxCheckAttachments,
  type InboxDetail,
  type InboxList,
  type InboxListParams,
  type InboxSearchItem,
  type InboxSearchParams,
} from "./inbox";

function getRustApiUrl() {
  const url = process.env.NEXT_PUBLIC_RUST_API_URL;

  if (url) return url.replace(/\/$/, "");
  if (process.env.NODE_ENV !== "production") return "http://127.0.0.1:8787";

  throw new Error("NEXT_PUBLIC_RUST_API_URL must be configured");
}

export function inboxInfiniteQueryOptions(
  queryKey: QueryKey,
  params: InboxListParams,
) {
  return infiniteQueryOptions({
    queryKey,
    queryFn: async ({ pageParam }): Promise<InboxList> =>
      fetchInboxList(getRustApiUrl(), await getAccessToken(), {
        ...params,
        cursor: pageParam ?? undefined,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.meta.cursor ?? undefined,
  });
}

export function inboxByIdQueryOptions(
  queryKey: QueryKey,
  id: string,
  options: { enabled?: boolean; staleTime?: number; retry?: boolean } = {},
) {
  return queryOptions<InboxDetail>({
    queryKey,
    queryFn: async () =>
      fetchInboxById(getRustApiUrl(), await getAccessToken(), id),
    enabled: options.enabled,
    staleTime: options.staleTime,
    retry: options.retry,
  });
}

export function inboxCheckAttachmentsQueryOptions(
  queryKey: QueryKey,
  id: string,
  options: { enabled?: boolean } = {},
) {
  return queryOptions<InboxCheckAttachments>({
    queryKey,
    queryFn: async () =>
      fetchInboxCheckAttachments(getRustApiUrl(), await getAccessToken(), id),
    enabled: options.enabled,
  });
}

export function inboxSearchQueryOptions(
  queryKey: QueryKey,
  params: InboxSearchParams,
) {
  return queryOptions<InboxSearchItem[]>({
    queryKey,
    queryFn: async () =>
      fetchInboxSearch(getRustApiUrl(), await getAccessToken(), params),
  });
}

export function inboxByStatusQueryOptions(
  queryKey: QueryKey,
  params: InboxByStatusParams,
) {
  return queryOptions<InboxByStatusItem[]>({
    queryKey,
    queryFn: async () =>
      fetchInboxByStatus(getRustApiUrl(), await getAccessToken(), params),
  });
}
