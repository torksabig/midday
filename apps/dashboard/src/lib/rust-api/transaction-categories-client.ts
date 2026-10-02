"use client";

import { type QueryKey, queryOptions } from "@tanstack/react-query";
import { getAccessToken } from "@/utils/session";
import {
  type CreateTransactionCategoryInput,
  createTransactionCategory,
  type DeleteTransactionCategoryInput,
  deleteTransactionCategory,
  fetchTransactionCategories,
  fetchTransactionCategoryById,
  type TransactionCategory,
  type TransactionCategoryDetail,
  type UpdateTransactionCategoryInput,
  updateTransactionCategory,
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

async function fetchBrowserTransactionCategoryById(
  id: string,
): Promise<TransactionCategoryDetail> {
  return fetchTransactionCategoryById(
    getRustApiUrl(),
    await getAccessToken(),
    id,
  );
}

export function transactionCategoriesQueryOptions(queryKey: QueryKey) {
  return queryOptions({
    queryKey,
    queryFn: fetchBrowserTransactionCategories,
  });
}

export function transactionCategoryByIdQueryOptions(
  queryKey: QueryKey,
  id: string,
  options: { enabled?: boolean } = {},
) {
  return queryOptions({
    queryKey,
    queryFn: () => fetchBrowserTransactionCategoryById(id),
    enabled: options.enabled,
  });
}

export async function createTransactionCategoryFromRust(
  input: CreateTransactionCategoryInput,
) {
  return createTransactionCategory(
    getRustApiUrl(),
    await getAccessToken(),
    input,
  );
}

export async function updateTransactionCategoryFromRust(
  input: UpdateTransactionCategoryInput,
) {
  return updateTransactionCategory(
    getRustApiUrl(),
    await getAccessToken(),
    input,
  );
}

export async function deleteTransactionCategoryFromRust(
  input: DeleteTransactionCategoryInput,
) {
  return deleteTransactionCategory(
    getRustApiUrl(),
    await getAccessToken(),
    input,
  );
}
