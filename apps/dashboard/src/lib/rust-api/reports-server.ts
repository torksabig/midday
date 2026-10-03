import "server-only";

import { type QueryKey, queryOptions } from "@tanstack/react-query";
import {
  type ReportByLinkId,
  fetchReportByLinkId,
} from "./reports";

function getRustApiUrl() {
  const url =
    process.env.RUST_API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_RUST_API_URL;

  if (url) return url.replace(/\/$/, "");
  if (process.env.NODE_ENV !== "production") return "http://127.0.0.1:8787";

  throw new Error("RUST_API_INTERNAL_URL must be configured");
}

export function reportByLinkIdServerQueryOptions(
  queryKey: QueryKey,
  linkId: string,
) {
  return queryOptions({
    queryKey,
    queryFn: async (): Promise<ReportByLinkId> =>
      fetchReportByLinkId(getRustApiUrl(), linkId),
  });
}
