"use client";

import { type QueryKey, queryOptions } from "@tanstack/react-query";
import { getAccessToken } from "@/utils/session";
import {
  type BankAccount,
  type BankAccountCurrency,
  type BankAccountBalance,
  type BankAccountsListParams,
  type BankAccountTransactionCount,
  type CreateBankAccountInput,
  createBankAccount,
  type DeleteBankAccountInput,
  deleteBankAccount,
  fetchBankAccountBalances,
  fetchBankAccountCurrencies,
  fetchBankAccounts,
  fetchBankAccountTransactionCount,
  type UpdateBankAccountInput,
  updateBankAccount,
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

async function fetchBrowserBankAccountCurrencies(): Promise<
  BankAccountCurrency[]
> {
  return fetchBankAccountCurrencies(getRustApiUrl(), await getAccessToken());
}

async function fetchBrowserBankAccountBalances(): Promise<BankAccountBalance[]> {
  return fetchBankAccountBalances(getRustApiUrl(), await getAccessToken());
}

async function fetchBrowserBankAccountTransactionCount(
  id: string,
): Promise<BankAccountTransactionCount> {
  return fetchBankAccountTransactionCount(
    getRustApiUrl(),
    await getAccessToken(),
    id,
  );
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

export function bankAccountCurrenciesQueryOptions(queryKey: QueryKey) {
  return queryOptions<BankAccountCurrency[]>({
    queryKey,
    queryFn: fetchBrowserBankAccountCurrencies,
  });
}

export function bankAccountBalancesQueryOptions(queryKey: QueryKey) {
  return queryOptions<BankAccountBalance[]>({
    queryKey,
    queryFn: fetchBrowserBankAccountBalances,
  });
}

export function bankAccountTransactionCountQueryOptions(
  queryKey: QueryKey,
  id: string,
  options: { enabled?: boolean } = {},
) {
  return queryOptions<BankAccountTransactionCount>({
    queryKey,
    queryFn: () => fetchBrowserBankAccountTransactionCount(id),
    enabled: options.enabled,
  });
}

export async function createBankAccountFromRust(input: CreateBankAccountInput) {
  return createBankAccount(getRustApiUrl(), await getAccessToken(), input);
}

export async function updateBankAccountFromRust(input: UpdateBankAccountInput) {
  return updateBankAccount(getRustApiUrl(), await getAccessToken(), input);
}

export async function deleteBankAccountFromRust(input: DeleteBankAccountInput) {
  return deleteBankAccount(getRustApiUrl(), await getAccessToken(), input);
}
