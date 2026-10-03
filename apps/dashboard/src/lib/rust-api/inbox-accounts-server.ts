import "server-only";

import { type QueryKey, queryOptions } from "@tanstack/react-query";
import { getServerRequestContext } from "@/trpc/request-context";
import {
  type InboxAccount,
  fetchInboxAccounts,
} from "./inbox-accounts";

function getRustApiUrl() {
  const url =
    process.env.RUST_API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_RUST_API_URL;

  if (url) return url.replace(/\/$/, "");
  if (process.env.NODE_ENV !== "production") return "http://127.0.0.1:8787";

  throw new Error("RUST_API_INTERNAL_URL must be configured");
}

export function inboxAccountsServerQueryOptions(queryKey: QueryKey) {
  return queryOptions({
    queryKey,
    queryFn: async (): Promise<InboxAccount[]> => {
      const { session } = await getServerRequestContext();
      return fetchInboxAccounts(
        getRustApiUrl(),
        session?.access_token ?? null,
      );
    },
  });
}
