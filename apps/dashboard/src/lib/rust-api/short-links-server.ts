import "server-only";

import { type QueryKey, queryOptions } from "@tanstack/react-query";
import { fetchShortLink, type ShortLink } from "./short-links";

function getRustApiUrl() {
  const url =
    process.env.RUST_API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_RUST_API_URL;

  if (url) return url.replace(/\/$/, "");
  if (process.env.NODE_ENV !== "production") return "http://127.0.0.1:8787";

  throw new Error("RUST_API_INTERNAL_URL must be configured");
}

export function shortLinkServerQueryOptions(
  queryKey: QueryKey,
  shortId: string,
) {
  return queryOptions({
    queryKey,
    queryFn: async (): Promise<ShortLink | null> =>
      fetchShortLink(getRustApiUrl(), shortId),
  });
}
