"use client";

import { type QueryKey, queryOptions } from "@tanstack/react-query";
import { getAccessToken } from "@/utils/session";
import {
  type InboxAccount,
  fetchInboxAccounts,
} from "./inbox-accounts";

function getRustApiUrl() {
  const url = process.env.NEXT_PUBLIC_RUST_API_URL;

  if (url) return url.replace(/\/$/, "");
  if (process.env.NODE_ENV !== "production") return "http://127.0.0.1:8787";

  throw new Error("NEXT_PUBLIC_RUST_API_URL must be configured");
}

export function inboxAccountsQueryOptions(queryKey: QueryKey) {
  return queryOptions<InboxAccount[]>({
    queryKey,
    queryFn: async () =>
      fetchInboxAccounts(getRustApiUrl(), await getAccessToken()),
  });
}
