"use client";

import { formatAmountValue } from "@midday/import";
import {
  infiniteQueryOptions,
  type QueryKey,
  queryOptions,
} from "@tanstack/react-query";
import {
  fetchBankAccountById,
  updateBankAccount,
} from "./bank-accounts";
import { getAccessToken } from "@/utils/session";
import {
  createTransaction,
  type CreateTransactionInput,
  deleteTransactionsMany,
  type DeleteTransactionsManyInput,
  fetchSearchTransactionMatch,
  fetchSimilarTransactions,
  fetchTransactionById,
  fetchTransactionsList,
  fetchTransactionsReviewCount,
  moveTransactionToReview,
  type SearchTransactionMatchParams,
  type SearchTransactionMatchRow,
  type SimilarTransactionRow,
  type SimilarTransactionsParams,
  type TransactionDetail,
  type TransactionsList,
  type TransactionsListParams,
  updateTransaction,
  type UpdateTransactionInput,
  updateTransactionsMany,
  type UpdateTransactionsManyInput,
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

export async function updateTransactionFromRust(input: UpdateTransactionInput) {
  return updateTransaction(getRustApiUrl(), await getAccessToken(), input);
}

export async function updateTransactionsManyFromRust(
  input: UpdateTransactionsManyInput,
) {
  return updateTransactionsMany(getRustApiUrl(), await getAccessToken(), input);
}

export async function deleteTransactionsManyFromRust(
  input: DeleteTransactionsManyInput,
) {
  return deleteTransactionsMany(getRustApiUrl(), await getAccessToken(), input);
}

export async function moveTransactionToReviewFromRust(
  input: Parameters<typeof moveTransactionToReview>[2],
) {
  return moveTransactionToReview(getRustApiUrl(), await getAccessToken(), input);
}

export async function createTransactionFromRust(input: CreateTransactionInput) {
  return createTransaction(getRustApiUrl(), await getAccessToken(), input);
}

export function similarTransactionsQueryOptions(
  queryKey: QueryKey,
  params: SimilarTransactionsParams,
  options: { enabled?: boolean } = {},
) {
  return queryOptions<SimilarTransactionRow[]>({
    queryKey,
    queryFn: async () =>
      fetchSimilarTransactions(
        getRustApiUrl(),
        await getAccessToken(),
        params,
      ),
    enabled: options.enabled,
  });
}

export function searchTransactionMatchQueryOptions(
  queryKey: QueryKey,
  params: SearchTransactionMatchParams,
  options: { enabled?: boolean } = {},
) {
  return queryOptions<SearchTransactionMatchRow[]>({
    queryKey,
    queryFn: async () =>
      fetchSearchTransactionMatch(
        getRustApiUrl(),
        await getAccessToken(),
        params,
      ),
    enabled: options.enabled,
  });
}

/** Rust SQL half of `transactions.import` for manual accounts (balance/currency). */
export async function prepareManualBankAccountForImport(input: {
  bankAccountId: string;
  currency: string;
  currentBalance?: string;
}): Promise<void> {
  const baseUrl = getRustApiUrl();
  const accessToken = await getAccessToken();
  const account = await fetchBankAccountById(
    baseUrl,
    accessToken,
    input.bankAccountId,
  );

  if (!account) {
    throw new Error("Bank account not found");
  }

  if (!account.manual) {
    return;
  }

  const parsedBalance = input.currentBalance
    ? formatAmountValue({ amount: input.currentBalance })
    : null;

  const balance =
    parsedBalance !== null && Number.isFinite(parsedBalance)
      ? parsedBalance
      : null;

  await updateBankAccount(baseUrl, accessToken, {
    id: input.bankAccountId,
    currency: input.currency,
    balance: balance ?? undefined,
  });
}
