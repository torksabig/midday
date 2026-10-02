"use client";

import { type QueryKey, queryOptions } from "@tanstack/react-query";
import { getAccessToken } from "@/utils/session";
import { fetchTags, type Tag } from "./tags";

function getRustApiUrl() {
  const url = process.env.NEXT_PUBLIC_RUST_API_URL;

  if (url) return url.replace(/\/$/, "");
  if (process.env.NODE_ENV !== "production") return "http://127.0.0.1:8787";

  throw new Error("NEXT_PUBLIC_RUST_API_URL must be configured");
}

async function fetchBrowserTags(): Promise<Tag[]> {
  return fetchTags(getRustApiUrl(), await getAccessToken());
}

export function tagsQueryOptions(queryKey: QueryKey) {
  return queryOptions<Tag[]>({
    queryKey,
    queryFn: fetchBrowserTags,
  });
}
