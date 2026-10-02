import "server-only";

import {
  infiniteQueryOptions,
  type QueryKey,
  queryOptions,
} from "@tanstack/react-query";
import { getServerRequestContext } from "@/trpc/request-context";
import {
  type DocumentDetail,
  type DocumentsList,
  type DocumentsListParams,
  fetchDocumentById,
  fetchDocumentsList,
} from "./documents";

function getRustApiUrl() {
  const url =
    process.env.RUST_API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_RUST_API_URL;

  if (url) return url.replace(/\/$/, "");
  if (process.env.NODE_ENV !== "production") return "http://127.0.0.1:8787";

  throw new Error("RUST_API_INTERNAL_URL must be configured");
}

export function documentsServerInfiniteQueryOptions(
  queryKey: QueryKey,
  params: DocumentsListParams,
) {
  return infiniteQueryOptions({
    queryKey,
    queryFn: async ({ pageParam }): Promise<DocumentsList> => {
      const { session } = await getServerRequestContext();
      return fetchDocumentsList(
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

export function documentByIdServerQueryOptions(
  queryKey: QueryKey,
  id: string | null | undefined,
  filePath?: string | null,
) {
  return queryOptions({
    queryKey,
    queryFn: async (): Promise<DocumentDetail | null> => {
      const { session } = await getServerRequestContext();
      return fetchDocumentById(
        getRustApiUrl(),
        session?.access_token ?? null,
        id,
        filePath,
      );
    },
  });
}
