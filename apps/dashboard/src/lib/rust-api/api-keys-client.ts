"use client";

import { type QueryKey, queryOptions } from "@tanstack/react-query";
import { getAccessToken } from "@/utils/session";
import {
  type ApiKey,
  type DeleteApiKeyInput,
  deleteApiKey,
  fetchApiKeys,
} from "./api-keys";

function getRustApiUrl() {
  const url = process.env.NEXT_PUBLIC_RUST_API_URL;

  if (url) return url.replace(/\/$/, "");
  if (process.env.NODE_ENV !== "production") return "http://127.0.0.1:8787";

  throw new Error("NEXT_PUBLIC_RUST_API_URL must be configured");
}

export function apiKeysQueryOptions(queryKey: QueryKey) {
  return queryOptions<ApiKey[]>({
    queryKey,
    queryFn: async () => fetchApiKeys(getRustApiUrl(), await getAccessToken()),
  });
}

export async function deleteApiKeyFromRust(input: DeleteApiKeyInput) {
  return deleteApiKey(getRustApiUrl(), await getAccessToken(), input);
}
