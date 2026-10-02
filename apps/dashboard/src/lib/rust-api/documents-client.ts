"use client";

import {
  infiniteQueryOptions,
  type QueryKey,
  queryOptions,
} from "@tanstack/react-query";
import { getAccessToken } from "@/utils/session";
import {
  type DocumentCheckAttachments,
  type DocumentDetail,
  type DocumentsList,
  type DocumentsListParams,
  fetchDocumentById,
  fetchDocumentCheckAttachments,
  fetchDocumentsList,
  fetchRelatedDocuments,
  type RelatedDocument,
} from "./documents";

function getRustApiUrl() {
  const url = process.env.NEXT_PUBLIC_RUST_API_URL;

  if (url) return url.replace(/\/$/, "");
  if (process.env.NODE_ENV !== "production") return "http://127.0.0.1:8787";

  throw new Error("NEXT_PUBLIC_RUST_API_URL must be configured");
}

export function documentsInfiniteQueryOptions(
  queryKey: QueryKey,
  params: DocumentsListParams,
) {
  return infiniteQueryOptions({
    queryKey,
    queryFn: async ({ pageParam }): Promise<DocumentsList> =>
      fetchDocumentsList(getRustApiUrl(), await getAccessToken(), {
        ...params,
        cursor: pageParam ?? undefined,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.meta.cursor ?? undefined,
  });
}

export function documentByIdQueryOptions(
  queryKey: QueryKey,
  id: string | null | undefined,
  filePath?: string | null,
  options: { enabled?: boolean; staleTime?: number } = {},
) {
  return queryOptions<DocumentDetail | null>({
    queryKey,
    queryFn: async () =>
      fetchDocumentById(
        getRustApiUrl(),
        await getAccessToken(),
        id,
        filePath,
      ),
    enabled: options.enabled,
    staleTime: options.staleTime,
  });
}

export function relatedDocumentsQueryOptions(
  queryKey: QueryKey,
  id: string,
  pageSize = 20,
  options: { enabled?: boolean } = {},
) {
  return queryOptions<RelatedDocument[]>({
    queryKey,
    queryFn: async () =>
      fetchRelatedDocuments(
        getRustApiUrl(),
        await getAccessToken(),
        id,
        pageSize,
      ),
    enabled: options.enabled,
  });
}

export function documentCheckAttachmentsQueryOptions(
  queryKey: QueryKey,
  id: string,
  options: { enabled?: boolean } = {},
) {
  return queryOptions<DocumentCheckAttachments>({
    queryKey,
    queryFn: async () =>
      fetchDocumentCheckAttachments(
        getRustApiUrl(),
        await getAccessToken(),
        id,
      ),
    enabled: options.enabled,
  });
}
