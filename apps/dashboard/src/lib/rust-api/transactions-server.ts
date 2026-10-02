import "server-only";

import {
  infiniteQueryOptions,
  type QueryKey,
  queryOptions,
} from "@tanstack/react-query";
import { getServerRequestContext } from "@/trpc/request-context";
import {
  fetchTransactionById,
  fetchTransactionsList,
  fetchTransactionsReviewCount,
  type TransactionDetail,
  type TransactionsList,
  type TransactionsListParams,
} from "./transactions";

function getRustApiUrl() {
  const url =
    process.env.RUST_API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_RUST_API_URL;

  if (url) return url.replace(/\/$/, "");
  if (process.env.NODE_ENV !== "production") return "http://127.0.0.1:8787";

  throw new Error("RUST_API_INTERNAL_URL must be configured");
}

export function transactionsServerInfiniteQueryOptions(
  queryKey: QueryKey,
  params: TransactionsListParams,
) {
  return infiniteQueryOptions({
    queryKey,
    queryFn: async ({ pageParam }): Promise<TransactionsList> => {
      const { session } = await getServerRequestContext();
      return fetchTransactionsList(
        getRustApiUrl(),
        session?.access_token ?? null,
        {
          ...params,
          cursor: pageParam ?? undefined,
        },
      );
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.meta.cursor ?? undefined,
  });
}

export function transactionByIdServerQueryOptions(
  queryKey: QueryKey,
  id: string,
) {
  return queryOptions({
    queryKey,
    queryFn: async (): Promise<TransactionDetail> => {
      const { session } = await getServerRequestContext();
      return fetchTransactionById(
        getRustApiUrl(),
        session?.access_token ?? null,
        id,
      );
    },
  });
}

export function transactionsReviewCountServerQueryOptions(queryKey: QueryKey) {
  return queryOptions({
    queryKey,
    queryFn: async (): Promise<number> => {
      const { session } = await getServerRequestContext();
      return fetchTransactionsReviewCount(
        getRustApiUrl(),
        session?.access_token ?? null,
      );
    },
  });
}
