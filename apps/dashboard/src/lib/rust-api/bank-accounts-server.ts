import "server-only";

import { type QueryKey, queryOptions } from "@tanstack/react-query";
import { getServerRequestContext } from "@/trpc/request-context";
import {
  type BankAccount,
  type BankAccountsListParams,
  fetchBankAccounts,
} from "./bank-accounts";

function getRustApiUrl() {
  const url =
    process.env.RUST_API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_RUST_API_URL;

  if (url) return url.replace(/\/$/, "");
  if (process.env.NODE_ENV !== "production") return "http://127.0.0.1:8787";

  throw new Error("RUST_API_INTERNAL_URL must be configured");
}

export function bankAccountsServerQueryOptions(
  queryKey: QueryKey,
  params: BankAccountsListParams = {},
) {
  return queryOptions({
    queryKey,
    queryFn: async (): Promise<BankAccount[]> => {
      const { session } = await getServerRequestContext();
      return fetchBankAccounts(
        getRustApiUrl(),
        session?.access_token ?? null,
        params,
      );
    },
  });
}
