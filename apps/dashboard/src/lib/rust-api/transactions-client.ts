"use client";

import {
  infiniteQueryOptions,
  type QueryKey,
  queryOptions,
} from "@tanstack/react-query";
import { getAccessToken } from "@/utils/session";
import {
  fetchTransactionById,
  fetchTransactionsList,
  fetchTransactionsReviewCount,
  type TransactionDetail,
  type TransactionsList,
  type TransactionsListParams,
} from "./transactions";

function getRustApiUrl() {
  const url = process.env.NEXT_PUBLIC_RUST_API_URL;

  if (url) return url.replace(/\/$/, "");
  if (process.env.NODE_ENV !== "production") return "http://127.0.0.1:8787";

  throw new Error("NEXT_PUBLIC_RUST_API_URL must be configured");
}

export function transactionsInfiniteQueryOptions(
  queryKey: QueryKey,
  params: TransactionsListParams,
) {
  return infiniteQueryOptions({
    queryKey,
    queryFn: async ({ pageParam }): Promise<TransactionsList> =>
      fetchTransactionsList(getRustApiUrl(), await getAccessToken(), {
        ...params,
        cursor: pageParam ?? undefined,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.meta.cursor ?? undefined,
  });
}

export function transactionByIdQueryOptions(
  queryKey: QueryKey,
  id: string,
  options: { enabled?: boolean; staleTime?: number } = {},
) {
  return queryOptions<TransactionDetail>({
    queryKey,
    queryFn: async () =>
      fetchTransactionById(getRustApiUrl(), await getAccessToken(), id),
    enabled: options.enabled,
    staleTime: options.staleTime,
  });
}

export function transactionsReviewCountQueryOptions(queryKey: QueryKey) {
  return queryOptions<number>({
    queryKey,
    queryFn: async () =>
      fetchTransactionsReviewCount(getRustApiUrl(), await getAccessToken()),
  });
}
