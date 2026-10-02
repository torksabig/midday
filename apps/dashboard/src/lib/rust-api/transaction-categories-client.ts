"use client";

import { type QueryKey, queryOptions } from "@tanstack/react-query";
import { getAccessToken } from "@/utils/session";
import {
  fetchTransactionCategories,
  type TransactionCategory,
} from "./transaction-categories";

function getRustApiUrl() {
  const url = process.env.NEXT_PUBLIC_RUST_API_URL;

  if (url) return url.replace(/\/$/, "");
  if (process.env.NODE_ENV !== "production") return "http://127.0.0.1:8787";

  throw new Error("NEXT_PUBLIC_RUST_API_URL must be configured");
}

async function fetchBrowserTransactionCategories(): Promise<
  TransactionCategory[]
> {
  return fetchTransactionCategories(getRustApiUrl(), await getAccessToken());
}

export function transactionCategoriesQueryOptions(queryKey: QueryKey) {
  return queryOptions({
    queryKey,
    queryFn: fetchBrowserTransactionCategories,
  });
}
