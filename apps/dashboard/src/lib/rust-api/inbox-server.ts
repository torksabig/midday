import "server-only";

import {
  infiniteQueryOptions,
  type QueryKey,
  queryOptions,
} from "@tanstack/react-query";
import { getServerRequestContext } from "@/trpc/request-context";
import {
  fetchInboxBlocklist,
  fetchInboxById,
  fetchInboxCheckAttachments,
  fetchInboxList,
  type InboxBlocklistEntry,
  type InboxCheckAttachments,
  type InboxDetail,
  type InboxList,
  type InboxListParams,
} from "./inbox";

function getRustApiUrl() {
  const url =
    process.env.RUST_API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_RUST_API_URL;

  if (url) return url.replace(/\/$/, "");
  if (process.env.NODE_ENV !== "production") return "http://127.0.0.1:8787";

  throw new Error("RUST_API_INTERNAL_URL must be configured");
}

export function inboxServerInfiniteQueryOptions(
  queryKey: QueryKey,
  params: InboxListParams,
) {
  return infiniteQueryOptions({
    queryKey,
    queryFn: async ({ pageParam }): Promise<InboxList> => {
      const { session } = await getServerRequestContext();
      return fetchInboxList(getRustApiUrl(), session?.access_token ?? null, {
        ...params,
        cursor: pageParam ?? undefined,
      });
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.meta.cursor ?? undefined,
  });
}

export function inboxByIdServerQueryOptions(queryKey: QueryKey, id: string) {
  return queryOptions({
    queryKey,
    queryFn: async (): Promise<InboxDetail> => {
      const { session } = await getServerRequestContext();
      return fetchInboxById(
        getRustApiUrl(),
        session?.access_token ?? null,
        id,
      );
    },
  });
}

export function inboxCheckAttachmentsServerQueryOptions(
  queryKey: QueryKey,
  id: string,
) {
  return queryOptions({
    queryKey,
    queryFn: async (): Promise<InboxCheckAttachments> => {
      const { session } = await getServerRequestContext();
      return fetchInboxCheckAttachments(
        getRustApiUrl(),
        session?.access_token ?? null,
        id,
      );
    },
  });
}

export function inboxBlocklistServerQueryOptions(queryKey: QueryKey) {
  return queryOptions({
    queryKey,
    queryFn: async (): Promise<InboxBlocklistEntry[]> => {
      const { session } = await getServerRequestContext();
      return fetchInboxBlocklist(
        getRustApiUrl(),
        session?.access_token ?? null,
      );
    },
  });
}
