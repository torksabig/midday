"use client";

import { type QueryKey, queryOptions } from "@tanstack/react-query";
import { getAccessToken } from "@/utils/session";
import {
  type BankAccount,
  type BankAccountsListParams,
  fetchBankAccounts,
} from "./bank-accounts";

function getRustApiUrl() {
  const url = process.env.NEXT_PUBLIC_RUST_API_URL;

  if (url) return url.replace(/\/$/, "");
  if (process.env.NODE_ENV !== "production") return "http://127.0.0.1:8787";

  throw new Error("NEXT_PUBLIC_RUST_API_URL must be configured");
}

async function fetchBrowserBankAccounts(
  params: BankAccountsListParams,
): Promise<BankAccount[]> {
  return fetchBankAccounts(getRustApiUrl(), await getAccessToken(), params);
}

export function bankAccountsQueryOptions(
  queryKey: QueryKey,
  params: BankAccountsListParams = {},
) {
  return queryOptions<BankAccount[]>({
    queryKey,
    queryFn: () => fetchBrowserBankAccounts(params),
  });
}
