"use client";

import { type QueryKey, queryOptions } from "@tanstack/react-query";
import { getAccessToken } from "@/utils/session";
import {
  type CreateDocumentTagInput,
  type DeleteDocumentTagInput,
  type DocumentTag,
  type DocumentTagAssignmentInput,
  createDocumentTag,
  createDocumentTagAssignment,
  deleteDocumentTag,
  deleteDocumentTagAssignment,
  fetchDocumentTags,
} from "./document-tags";

function getRustApiUrl() {
  const url = process.env.NEXT_PUBLIC_RUST_API_URL;

  if (url) return url.replace(/\/$/, "");
  if (process.env.NODE_ENV !== "production") return "http://127.0.0.1:8787";

  throw new Error("NEXT_PUBLIC_RUST_API_URL must be configured");
}

export function documentTagsQueryOptions(queryKey: QueryKey) {
  return queryOptions<DocumentTag[]>({
    queryKey,
    queryFn: async () => fetchDocumentTags(getRustApiUrl(), await getAccessToken()),
  });
}

export async function createDocumentTagFromRust(input: CreateDocumentTagInput) {
  return createDocumentTag(getRustApiUrl(), await getAccessToken(), input);
}

export async function deleteDocumentTagFromRust(input: DeleteDocumentTagInput) {
  return deleteDocumentTag(getRustApiUrl(), await getAccessToken(), input);
}

export async function createDocumentTagAssignmentFromRust(
  input: DocumentTagAssignmentInput,
) {
  return createDocumentTagAssignment(
    getRustApiUrl(),
    await getAccessToken(),
    input,
  );
}

export async function deleteDocumentTagAssignmentFromRust(
  input: DocumentTagAssignmentInput,
) {
  return deleteDocumentTagAssignment(
    getRustApiUrl(),
    await getAccessToken(),
    input,
  );
}
